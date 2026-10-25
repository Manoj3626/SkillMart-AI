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

export interface AdzunaJob {
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
  source: "adzuna" | "demo";
}

// ─── Demo jobs returned when Adzuna is not configured ─────────────────────
const DEMO_JOBS: AdzunaJob[] = [
  {
    id: "demo-1",
    title: "Frontend Developer",
    company: "TechCorp India",
    description:
      "We are looking for a skilled Frontend Developer proficient in React, TypeScript, and modern CSS. You'll work on our product suite used by 10M+ users. Strong attention to UI/UX, performance, and accessibility required.",
    location: "Bangalore, Karnataka",
    salary_min: 800000,
    salary_max: 1400000,
    currency: "INR",
    url: "#",
    posted_at: "2026-10-10T00:00:00.000Z",
    contract_type: "permanent",
    source: "demo",
  },
  {
    id: "demo-2",
    title: "Backend Engineer (Node.js)",
    company: "Finova Labs",
    description:
      "Join our core platform team building high-throughput financial data APIs. We use Node.js, PostgreSQL, Redis, and Kubernetes. Looking for engineers who care deeply about reliability, observability, and elegant API design.",
    location: "Remote (India)",
    salary_min: 1200000,
    salary_max: 2000000,
    currency: "INR",
    url: "#",
    posted_at: "2026-10-07T00:00:00.000Z",
    contract_type: "permanent",
    source: "demo",
  },
  {
    id: "demo-3",
    title: "Full Stack Developer",
    company: "GrowthOS",
    description:
      "Build product features end-to-end in our React + Next.js + Python stack. You'll own features from design to deployment, collaborate with designers, and ship to 50k+ daily active users.",
    location: "Hyderabad / Remote",
    salary_min: 1000000,
    salary_max: 1800000,
    currency: "INR",
    url: "#",
    posted_at: "2026-10-11T00:00:00.000Z",
    contract_type: "permanent",
    source: "demo",
  },
  {
    id: "demo-4",
    title: "Data Analyst",
    company: "InsightHub",
    description:
      "Turn raw business data into actionable insights. You'll work with SQL, Python (pandas), and Tableau to build dashboards and reports. Experience with A/B testing and cohort analysis is a strong plus.",
    location: "Mumbai",
    salary_min: 600000,
    salary_max: 1100000,
    currency: "INR",
    url: "#",
    posted_at: "2026-10-09T00:00:00.000Z",
    contract_type: "permanent",
    source: "demo",
  },
  {
    id: "demo-5",
    title: "DevOps Engineer",
    company: "CloudScale",
    description:
      "Maintain and improve our AWS / GCP infrastructure. Terraform, Docker, Kubernetes, and CI/CD pipelines are your daily tools. You'll reduce deployment time and improve system reliability.",
    location: "Pune / Remote",
    salary_min: 1000000,
    salary_max: 1800000,
    currency: "INR",
    url: "#",
    posted_at: "2026-10-06T00:00:00.000Z",
    contract_type: "permanent",
    source: "demo",
  },
  {
    id: "demo-6",
    title: "Machine Learning Engineer",
    company: "NeuralEdge AI",
    description:
      "Design and deploy ML models for real-time recommendation, fraud detection, and NLP use cases. Strong Python, PyTorch, and MLOps experience required. Familiarity with LLMs is a bonus.",
    location: "Bangalore",
    salary_min: 1500000,
    salary_max: 2800000,
    currency: "INR",
    url: "#",
    posted_at: "2026-10-08T00:00:00.000Z",
    contract_type: "permanent",
    source: "demo",
  },
];

// ─── Adzuna API call ────────────────────────────────────────────────────────
async function fetchFromAdzuna(params: z.infer<typeof QuerySchema>): Promise<{
  jobs: AdzunaJob[];
  total: number;
  demo: boolean;
}> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  if (!appId || !appKey) {
    // Filter demo jobs by query
    const q = params.q.toLowerCase();
    const filtered = DEMO_JOBS.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.description.toLowerCase().includes(q) ||
        q === "software engineer" || q === "" ||
        j.company.toLowerCase().includes(q)
    );
    return { jobs: filtered, total: filtered.length, demo: true };
  }

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
    next: { revalidate: 300 }, // cache 5 min
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) throw new Error(`Adzuna error ${res.status}`);

  const data = await res.json();

  const jobs: AdzunaJob[] = (data.results ?? []).map((r: any) => ({
    id: r.id,
    title: r.title,
    company: r.company?.display_name ?? "Unknown",
    description: r.description,
    location: r.location?.display_name ?? params.location,
    salary_min: r.salary_min ?? null,
    salary_max: r.salary_max ?? null,
    currency: "INR",
    url: r.redirect_url,
    posted_at: r.created,
    contract_type: r.contract_type ?? "permanent",
    source: "adzuna" as const,
  }));

  return { jobs, total: data.count ?? jobs.length, demo: false };
}

// ─── Skill-match scoring (deterministic, fast) ─────────────────────────────
function scoreJobMatch(
  job: AdzunaJob,
  userSkills: string[]
): { score: number; matching: string[] } {
  if (!userSkills.length) return { score: 0, matching: [] };

  const text = `${job.title} ${job.description}`.toLowerCase();
  const matching = userSkills.filter((skill) =>
    text.includes(skill.toLowerCase())
  );
  const score = Math.min(
    100,
    Math.round((matching.length / Math.max(userSkills.length, 5)) * 100)
  );
  return { score, matching };
}

// ─── Route Handler ──────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  // Signal to Next.js 16 that this route is dynamic (replaces `export const dynamic`)
  await connection();

  try {
    const { searchParams } = req.nextUrl;

    const params = QuerySchema.parse(Object.fromEntries(searchParams));

    // Get user skills from Supabase (if configured)
    let userSkills: string[] = [];
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("candidate_skills")
          .select("name")
          .eq("user_id", user.id);
        userSkills = (data ?? []).map((s: { name: string }) => s.name);
      }
    } catch {
      // Skip DB if not configured
    }

    const { jobs, total, demo } = await fetchFromAdzuna(params);

    // Attach match scores
    const scoredJobs = jobs.map((job) => ({
      ...job,
      ...scoreJobMatch(job, userSkills),
    }));

    // Sort by match score descending
    scoredJobs.sort((a, b) => b.score - a.score);

    return NextResponse.json({
      jobs: scoredJobs,
      total,
      demo,
      userSkillsCount: userSkills.length,
      page: params.page,
      resultsPerPage: params.resultsPerPage,
    });
  } catch (err: any) {
    console.error("[jobs/search]", err);
    return NextResponse.json({ error: err.message ?? "Search failed" }, { status: 500 });
  }
}
