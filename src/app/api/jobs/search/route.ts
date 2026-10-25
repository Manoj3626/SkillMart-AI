import { NextRequest, NextResponse } from "next/server";
import { connection } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const QuerySchema = z.object({
  q: z.string().default("software engineer"),
  location: z.string().default("india"),
  page: z.coerce.number().int().min(1).max(20).default(1),
  resultsPerPage: z.coerce.number().int().min(5).max(50).default(20),
  remote: z.enum(["true", "false", ""]).optional(),
  experienceLevel: z.string().optional(),
  minSalary: z.coerce.number().optional(),
});

export interface LiveJob {
  id: string;
  title: string;
  company: string;
  description: string;
  location: string;
  salary_min: number | null;
  salary_max: number | null;
  currency: string;
  url: string;
  posted_at: string;
  contract_type: string;
  source: "adzuna" | "remotive" | "arbeitnow";
}

// ─── 1. Query Adzuna (when configured with valid keys) ─────────────────────
async function fetchFromAdzuna(params: z.infer<typeof QuerySchema>): Promise<{
  jobs: LiveJob[];
  total: number;
} | null> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  if (!appId || !appKey || appId.includes("your-") || appKey.includes("your-")) {
    return null;
  }

  try {
    const country = "in"; // India
    const url = new URL(
      `https://api.adzuna.com/v1/api/jobs/${country}/search/${params.page}`
    );
    url.searchParams.set("app_id", appId);
    url.searchParams.set("app_key", appKey);
    url.searchParams.set("results_per_page", String(params.resultsPerPage));
    url.searchParams.set("what", params.q);
    url.searchParams.set("where", params.location);
    url.searchParams.set("content-type", "application/json");

    if (params.remote === "true") {
      url.searchParams.set("what_and", "remote");
    }
    if (params.minSalary) {
      url.searchParams.set("salary_min", String(params.minSalary));
    }

    const res = await fetch(url.toString(), {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(8_000),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const jobs: LiveJob[] = (data.results ?? []).map((r: any) => ({
      id: `adzuna-${r.id}`,
      title: r.title,
      company: r.company?.display_name ?? "Verified Employer",
      description: r.description?.replace(/<[^>]*>?/gm, "") || "",
      location: r.location?.display_name ?? params.location,
      salary_min: r.salary_min ?? null,
      salary_max: r.salary_max ?? null,
      currency: "INR",
      url: r.redirect_url,
      posted_at: r.created,
      contract_type: r.contract_type ?? "permanent",
      source: "adzuna" as const,
    }));

    return { jobs, total: data.count ?? jobs.length };
  } catch (err) {
    console.warn("[Adzuna fetch notice]", err);
    return null;
  }
}

// ─── 2. Query Live Public Tech Job APIs (Remotive & Arbeitnow) ─────────────
async function fetchLivePublicJobs(params: z.infer<typeof QuerySchema>): Promise<{
  jobs: LiveJob[];
  total: number;
}> {
  const queryStr = params.q.toLowerCase().trim();
  const searchKeywords = queryStr.split(/\s+/).filter(Boolean);
  const isRemoteRequested = params.remote === "true";

  const jobsList: LiveJob[] = [];

  // Source A: Remotive Public Live Tech API
  try {
    const remotiveUrl = new URL("https://remotive.com/api/remote-jobs");
    if (queryStr && queryStr !== "software engineer") {
      remotiveUrl.searchParams.set("search", queryStr);
    } else {
      remotiveUrl.searchParams.set("category", "software-dev");
    }
    remotiveUrl.searchParams.set("limit", "25");

    const res = await fetch(remotiveUrl.toString(), {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(7_000),
    });

    if (res.ok) {
      const data = await res.json();
      const rawJobs = Array.isArray(data.jobs) ? data.jobs : [];

      for (const r of rawJobs) {
        jobsList.push({
          id: `remotive-${r.id}`,
          title: r.title,
          company: r.company_name,
          description: (r.description || "").replace(/<[^>]*>?/gm, "").slice(0, 450) + "...",
          location: r.candidate_required_location || "Remote (Worldwide / India)",
          salary_min: null,
          salary_max: null,
          currency: "USD",
          url: r.url,
          posted_at: r.publication_date || new Date().toISOString(),
          contract_type: r.job_type || "Full-time",
          source: "remotive",
        });
      }
    }
  } catch (err) {
    console.warn("[Remotive fetch notice]", err);
  }

  // Source B: Arbeitnow Public Live Job API
  try {
    const res = await fetch("https://www.arbeitnow.com/api/job-board-api", {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(7_000),
    });

    if (res.ok) {
      const data = await res.json();
      const rawJobs = Array.isArray(data.data) ? data.data : [];

      for (const a of rawJobs) {
        const text = `${a.title} ${a.description} ${a.tags?.join(" ")}`.toLowerCase();
        const matchesQuery =
          searchKeywords.length === 0 ||
          queryStr === "software engineer" ||
          searchKeywords.some((kw) => text.includes(kw));

        if (matchesQuery) {
          jobsList.push({
            id: `arbeitnow-${a.slug || Math.random().toString(36).substring(7)}`,
            title: a.title,
            company: a.company_name,
            description: (a.description || "").replace(/<[^>]*>?/gm, "").slice(0, 450) + "...",
            location: a.remote ? "Remote (Verified)" : a.location || "Multiple locations",
            salary_min: null,
            salary_max: null,
            currency: "EUR",
            url: a.url,
            posted_at: new Date(a.created_at * 1000).toISOString(),
            contract_type: a.job_types?.[0] || "Full-time",
            source: "arbeitnow",
          });
        }
      }
    }
  } catch (err) {
    console.warn("[Arbeitnow fetch notice]", err);
  }

  // Filter by location or remote preference if requested
  let filtered = jobsList;
  if (isRemoteRequested) {
    filtered = filtered.filter(
      (j) =>
        j.location.toLowerCase().includes("remote") ||
        j.source === "remotive"
    );
  }

  // Deduplicate by company + title
  const seen = new Set<string>();
  const uniqueJobs: LiveJob[] = [];
  for (const job of filtered) {
    const key = `${job.company.toLowerCase()}:${job.title.toLowerCase()}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueJobs.push(job);
    }
  }

  return {
    jobs: uniqueJobs.slice(0, params.resultsPerPage),
    total: uniqueJobs.length,
  };
}

// ─── Skill-match scoring (transparent & deterministic) ─────────────────────
function scoreJobMatch(
  job: LiveJob,
  userSkills: string[]
): { score: number; matching: string[]; scoreExplanation: string } {
  if (!userSkills.length) {
    return {
      score: 70,
      matching: [],
      scoreExplanation: "Standard relevance score. Upload your resume or add skills to view tailored match breakdown.",
    };
  }

  const text = `${job.title} ${job.description}`.toLowerCase();
  const matching = userSkills.filter((skill) =>
    text.includes(skill.toLowerCase().trim())
  );

  const score = Math.min(
    98,
    Math.max(50, Math.round((matching.length / Math.max(userSkills.length, 4)) * 100))
  );

  return {
    score,
    matching,
    scoreExplanation:
      matching.length > 0
        ? `Estimated match based on ${matching.length} matching skills: ${matching.slice(0, 3).join(", ")}${matching.length > 3 ? "..." : ""}.`
        : "Estimated match based on general technical role relevance.",
  };
}

// ─── Route Handler ──────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  await connection();

  try {
    const { searchParams } = req.nextUrl;
    const params = QuerySchema.parse(Object.fromEntries(searchParams));

    // Get user skills from Supabase or fallback
    let userSkills: string[] = [];
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("candidate_skills")
          .select("name")
          .eq("user_id", user.id);
        userSkills = (data ?? []).map((s: { name: string }) => s.name);
      }
    } catch {}

    // 1. Try Adzuna if configured
    let result = await fetchFromAdzuna(params);

    let providerUsed = "adzuna";
    // 2. If Adzuna not configured or returned no results, fetch live tech feeds
    if (!result || result.jobs.length === 0) {
      result = await fetchLivePublicJobs(params);
      providerUsed = "live_public_feeds";
    }

    // Attach match scores and explanations
    const scoredJobs = result.jobs.map((job) => ({
      ...job,
      ...scoreJobMatch(job, userSkills),
    }));

    // Sort by match score descending
    scoredJobs.sort((a, b) => b.score - a.score);

    return NextResponse.json({
      jobs: scoredJobs,
      total: result.total,
      provider: providerUsed,
      userSkillsCount: userSkills.length,
      page: params.page,
      resultsPerPage: params.resultsPerPage,
    });
  } catch (err: any) {
    console.error("[jobs/search]", err);
    return NextResponse.json(
      {
        jobs: [],
        total: 0,
        provider: "none",
        error: "Could not retrieve live job listings. Please check your query or network connection.",
      },
      { status: 200 }
    );
  }
}
