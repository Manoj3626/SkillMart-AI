import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

// ─── Types ──────────────────────────────────────────────────────────────────
export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics: string[];
  updated_at: string;
  is_fork: boolean;
}

export interface AnalyzedRepo {
  repo: GitHubRepo;
  resume_description: string;  // AI-generated resume bullet
  detected_skills: string[];
  complexity_score: number;    // 0–100
  impact_keywords: string[];
}

export interface GitHubAnalysis {
  username: string;
  avatar_url: string;
  public_repos: number;
  followers: number;
  top_languages: { language: string; count: number }[];
  all_skills: string[];
  analyzed_repos: AnalyzedRepo[];
  profile_summary: string;
}

const RequestSchema = z.object({
  username: z.string().min(1).max(39),
  maxRepos: z.number().int().min(1).max(30).default(10),
});

// ─── GitHub REST API helpers ────────────────────────────────────────────────
const GH_API = "https://api.github.com";

function ghHeaders() {
  const token = process.env.GITHUB_TOKEN;
  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "SkillMatch-AI/1.0",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function ghFetch(path: string) {
  const res = await fetch(`${GH_API}${path}`, {
    headers: ghHeaders(),
    next: { revalidate: 900 }, // cache 15 min
    signal: AbortSignal.timeout(10_000),
  });
  if (res.status === 404) throw new Error("GitHub user not found");
  if (res.status === 403) throw new Error("GitHub API rate limit exceeded. Set GITHUB_TOKEN in .env.local.");
  if (!res.ok) throw new Error(`GitHub API ${res.status}`);
  return res.json();
}

// ─── AI repo description ────────────────────────────────────────────────────
async function generateRepoDescription(
  repo: GitHubRepo,
  readmeSnippet: string | null
): Promise<{ description: string; skills: string[]; keywords: string[] }> {
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL ?? "gemini-2.0-flash";

  const fallbackSkills = [repo.language, ...(repo.topics ?? [])]
    .filter(Boolean) as string[];

  if (!apiKey) {
    return {
      description: `Built ${repo.name} — a ${repo.language ?? "software"} project with ${repo.stargazers_count} ⭐. ${repo.description ?? ""}`.trim(),
      skills: fallbackSkills,
      keywords: ["developed", "implemented", "built"],
    };
  }

  const prompt = `Convert this GitHub repository into a strong, quantified, one-sentence resume bullet point.

Repository:
- Name: ${repo.name}
- Description: ${repo.description ?? "No description"}
- Language: ${repo.language ?? "Unknown"}
- Stars: ${repo.stargazers_count}
- Topics: ${repo.topics.join(", ") || "none"}
- README snippet: ${(readmeSnippet ?? "").slice(0, 500)}

Return ONLY valid JSON (no markdown):
{
  "description": "<one impactful resume bullet starting with a strong action verb, mentioning tech stack and any measurable impact>",
  "skills": ["<detected skill>", "..."],
  "keywords": ["<strong action keyword>", "..."]
}`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(15_000),
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.4, maxOutputTokens: 512 },
        }),
      }
    );
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
    return JSON.parse(text);
  } catch {
    return {
      description: `Built ${repo.name} using ${repo.language ?? "multiple technologies"}. ${repo.description ?? ""}`.trim(),
      skills: fallbackSkills,
      keywords: ["built", "developed"],
    };
  }
}

// ─── Get README snippet ─────────────────────────────────────────────────────
async function getReadmeSnippet(fullName: string): Promise<string | null> {
  try {
    const data = await ghFetch(`/repos/${fullName}/readme`);
    const content = atob(data.content.replace(/\n/g, ""));
    return content.slice(0, 600);
  } catch {
    return null;
  }
}

// ─── Route Handler ──────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = RequestSchema.parse(await req.json());
    const { username, maxRepos } = body;

    // 1. Fetch GitHub user
    const ghUser = await ghFetch(`/users/${username}`);

    // 2. Fetch repos (not forks, sorted by updated)
    const allRepos: GitHubRepo[] = await ghFetch(
      `/users/${username}/repos?sort=updated&per_page=50&type=owner`
    );

    // Filter: not forks, has code
    const filteredRepos = allRepos
      .filter((r: any) => !r.fork)
      .slice(0, maxRepos)
      .map((r: any) => ({
        id: r.id,
        name: r.name,
        full_name: r.full_name,
        description: r.description,
        html_url: r.html_url,
        stargazers_count: r.stargazers_count,
        forks_count: r.forks_count,
        language: r.language,
        topics: r.topics ?? [],
        updated_at: r.updated_at,
        is_fork: r.fork,
      }));

    // 3. Analyze top repos with AI (limit to 5 to avoid rate limits)
    const TOP_ANALYZE = 5;
    const analyzedRepos: AnalyzedRepo[] = [];

    for (const repo of filteredRepos.slice(0, TOP_ANALYZE)) {
      const readme = await getReadmeSnippet(repo.full_name);
      const { description, skills, keywords } = await generateRepoDescription(repo, readme);

      const complexityScore = Math.min(
        100,
        repo.stargazers_count * 5 +
        repo.forks_count * 3 +
        (repo.topics?.length ?? 0) * 5 +
        (readme ? 20 : 0) +
        (repo.description ? 10 : 0)
      );

      analyzedRepos.push({
        repo,
        resume_description: description,
        detected_skills: skills,
        complexity_score: Math.min(complexityScore, 100),
        impact_keywords: keywords,
      });
    }

    // Add remaining repos without AI analysis
    for (const repo of filteredRepos.slice(TOP_ANALYZE)) {
      analyzedRepos.push({
        repo,
        resume_description: `Developed ${repo.name} — ${repo.description ?? "a " + (repo.language ?? "software") + " project"}.`,
        detected_skills: [repo.language, ...(repo.topics ?? [])].filter(Boolean) as string[],
        complexity_score: Math.min(repo.stargazers_count * 5 + repo.forks_count * 3, 100),
        impact_keywords: [],
      });
    }

    // 4. Aggregate skills & languages
    const langCount: Record<string, number> = {};
    const allSkills = new Set<string>();

    for (const ar of analyzedRepos) {
      if (ar.repo.language) {
        langCount[ar.repo.language] = (langCount[ar.repo.language] ?? 0) + 1;
      }
      ar.detected_skills.forEach((s) => s && allSkills.add(s));
    }

    const topLanguages = Object.entries(langCount)
      .sort((a, b) => b[1] - a[1])
      .map(([language, count]) => ({ language, count }));

    // 5. Generate profile summary
    let profileSummary = `${ghUser.name ?? username} has ${ghUser.public_repos} public repositories on GitHub, primarily working with ${topLanguages.slice(0, 3).map((l) => l.language).join(", ")}.`;
    if (ghUser.bio) profileSummary = `${ghUser.bio} ${profileSummary}`;

    const analysis: GitHubAnalysis = {
      username,
      avatar_url: ghUser.avatar_url,
      public_repos: ghUser.public_repos,
      followers: ghUser.followers,
      top_languages: topLanguages,
      all_skills: Array.from(allSkills).filter(Boolean),
      analyzed_repos: analyzedRepos,
      profile_summary: profileSummary,
    };

    return NextResponse.json({ analysis, demo: !process.env.AI_API_KEY });
  } catch (err: any) {
    console.error("[github/analyze]", err);
    const status =
      err.message?.includes("not found") ? 404 :
      err.message?.includes("rate limit") ? 429 : 500;
    return NextResponse.json({ error: err.message ?? "Analysis failed" }, { status });
  }
}
