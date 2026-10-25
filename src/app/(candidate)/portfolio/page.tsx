"use client";

import React, { useState } from "react";
import {
  FolderGit2,
  Star,
  GitFork,
  ExternalLink,
  Plus,
  Trash2,
  Globe,
  AlertCircle,
  CheckCircle,
  Code,
  Copy,
  Check,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ScoreRing, Progress } from "@/components/ui/Progress";
import { toast } from "@/components/ui/Toaster";
import type { GitHubAnalysis } from "@/app/api/github/analyze/route";

function daysAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (diff === 0) return "today";
  if (diff === 1) return "yesterday";
  return `${diff}d ago`;
}

export default function PortfolioPage() {
  const [githubUrl, setGithubUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<GitHubAnalysis | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  function extractUsername(url: string): string {
    const trimmed = url.trim();
    if (!trimmed.includes("/")) return trimmed;
    const parts = trimmed.replace(/\/$/, "").split("/");
    return parts[parts.length - 1];
  }

  async function handleAnalyze() {
    const username = extractUsername(githubUrl);
    if (!username) { toast.error("Enter a GitHub username or URL."); return; }

    setLoading(true);
    setAnalysis(null);
    try {
      const res = await fetch("/api/github/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, maxRepos: 10 }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Analysis failed."); return; }
      setAnalysis(data.analysis);
      setIsDemo(data.demo);
      if (data.demo) toast.info("Running demo mode — add AI_API_KEY for richer descriptions.");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function copyBullet(text: string, id: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
      toast.success("Copied to clipboard!");
    });
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-[var(--color-surface-900)]">Projects & Portfolio</h1>
        <p className="text-sm text-[var(--color-surface-500)] mt-0.5">
          Analyze your GitHub profile and generate resume-ready project descriptions.
        </p>
      </div>

      {/* GitHub Analysis Card */}
      <Card className="mb-6 animate-fade-in delay-100">
        <CardHeader>
          <div>
            <CardTitle>GitHub Profile Analysis</CardTitle>
            <CardDescription>AI generates resume bullets from your public repos</CardDescription>
          </div>
          <FolderGit2 size={18} className="text-[var(--color-violet-400)]" />
        </CardHeader>

        <div className="flex gap-3 flex-wrap">
          <input
            type="text"
            placeholder="github.com/username or just username"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
            className="input flex-1 min-w-48"
          />
          <button
            onClick={handleAnalyze}
            disabled={loading || !githubUrl.trim()}
            className="btn btn-primary btn-md"
          >
            {loading ? (
              <svg className="animate-spin" width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <circle cx="12" cy="12" r="10" strokeOpacity={0.25} /><path d="M12 2a10 10 0 0 1 10 10" />
              </svg>
            ) : <FolderGit2 size={15} />}
            {loading ? "Analyzing…" : "Analyze GitHub"}
          </button>
        </div>
        <p className="text-xs text-[var(--color-surface-400)] mt-2">
          Only public repositories are accessed. No write permissions required.
          {!process.env.NEXT_PUBLIC_SUPABASE_URL && " Set GITHUB_TOKEN in .env.local for higher API rate limits."}
        </p>
      </Card>

      {/* Results */}
      {analysis && (
        <div className="flex flex-col gap-6 animate-fade-in">
          {isDemo && (
            <div className="flex items-center gap-2 p-3 bg-[var(--color-warning-50)] border border-[var(--color-warning-100)] rounded-xl text-xs text-[var(--color-warning-700)]">
              <AlertCircle size={14} />
              Demo mode — AI descriptions are simplified. Set AI_API_KEY for AI-powered resume bullets.
            </div>
          )}

          {/* Profile banner */}
          <Card className="gradient-hero text-white border-0 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 blur-2xl"
              style={{ background: "radial-gradient(circle, white, transparent)", transform: "translate(30%,-30%)" }} />
            <div className="relative z-10 flex items-center gap-5">
              <img
                src={analysis.avatar_url}
                alt={analysis.username}
                className="w-16 h-16 rounded-full border-2 border-white/30 object-cover"
              />
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white">{analysis.username}</h2>
                <p className="text-white/70 text-sm mt-0.5 leading-relaxed max-w-xl">{analysis.profile_summary}</p>
              </div>
              <div className="hidden sm:flex flex-col items-center text-center">
                <span className="text-2xl font-extrabold text-white">{analysis.public_repos}</span>
                <span className="text-white/60 text-xs">Public Repos</span>
              </div>
              <div className="hidden sm:flex flex-col items-center text-center">
                <span className="text-2xl font-extrabold text-white">{analysis.followers}</span>
                <span className="text-white/60 text-xs">Followers</span>
              </div>
            </div>
          </Card>

          {/* Languages + Skills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Top Languages</CardTitle></CardHeader>
              <div className="flex flex-col gap-2.5">
                {analysis.top_languages.slice(0, 6).map(({ language, count }) => (
                  <Progress
                    key={language}
                    label={language}
                    value={Math.min(100, count * 15 + 25)}
                    showLabel
                    color="brand"
                  />
                ))}
              </div>
            </Card>
            <Card>
              <CardHeader><CardTitle>Detected Skills</CardTitle></CardHeader>
              <div className="flex flex-wrap gap-2">
                {analysis.all_skills.slice(0, 20).map((s) => (
                  <Badge key={s} variant="teal">{s}</Badge>
                ))}
                {analysis.all_skills.length > 20 && (
                  <Badge variant="surface">+{analysis.all_skills.length - 20} more</Badge>
                )}
              </div>
            </Card>
          </div>

          {/* Analyzed repos */}
          <div>
            <h3 className="text-base font-bold text-[var(--color-surface-900)] mb-4 flex items-center gap-2">
              <Code size={16} className="text-[var(--color-brand-500)]" />
              Repository Analysis & Resume Bullets
            </h3>
            <div className="flex flex-col gap-4">
              {analysis.analyzed_repos.map((ar) => (
                <Card key={ar.repo.id} className="animate-fade-in">
                  <div className="flex items-start gap-4">
                    <ScoreRing
                      score={ar.complexity_score}
                      size={50}
                      strokeWidth={5}
                    />
                    <div className="flex-1 min-w-0">
                      {/* Repo header */}
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <a
                          href={ar.repo.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-bold text-[var(--color-surface-900)] hover:text-[var(--color-brand-600)] transition-colors flex items-center gap-1"
                        >
                          {ar.repo.name}
                          <ExternalLink size={11} className="text-[var(--color-surface-400)]" />
                        </a>
                        {ar.repo.language && (
                          <Badge variant="surface" className="text-[10px]">{ar.repo.language}</Badge>
                        )}
                        <span className="text-[10px] text-[var(--color-surface-400)] flex items-center gap-1">
                          <Star size={9} /> {ar.repo.stargazers_count}
                        </span>
                        <span className="text-[10px] text-[var(--color-surface-400)] flex items-center gap-1">
                          <GitFork size={9} /> {ar.repo.forks_count}
                        </span>
                        <span className="text-[10px] text-[var(--color-surface-400)]">
                          Updated {daysAgo(ar.repo.updated_at)}
                        </span>
                      </div>

                      {ar.repo.description && (
                        <p className="text-xs text-[var(--color-surface-500)] mb-2">{ar.repo.description}</p>
                      )}

                      {/* Skills */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {ar.detected_skills.slice(0, 8).map((s) => (
                          <Badge key={s} variant="brand" className="text-[10px]">{s}</Badge>
                        ))}
                        {ar.repo.topics.slice(0, 5).map((t) => (
                          <Badge key={t} variant="surface" className="text-[10px]">#{t}</Badge>
                        ))}
                      </div>

                      {/* Resume bullet */}
                      <div className="bg-[var(--color-success-50)] border border-[var(--color-success-100)] rounded-xl p-3 flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-bold text-[var(--color-success-600)] uppercase tracking-wider mb-1">
                            Resume Bullet
                          </p>
                          <p className="text-sm text-[var(--color-success-800)] leading-relaxed">
                            {ar.resume_description}
                          </p>
                        </div>
                        <button
                          onClick={() => copyBullet(ar.resume_description, String(ar.repo.id))}
                          className="shrink-0 p-1.5 rounded-lg hover:bg-[var(--color-success-200)] transition-colors text-[var(--color-success-600)]"
                          aria-label="Copy bullet to clipboard"
                        >
                          {copied === String(ar.repo.id) ? (
                            <Check size={14} />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => { setAnalysis(null); setGithubUrl(""); }}
              className="btn btn-outline btn-md"
            >
              Analyze Another Profile
            </button>
            <a href="/resume" className="btn btn-primary btn-md">
              Add to Resume Analyzer
            </a>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!analysis && !loading && (
        <Card className="text-center py-12 animate-fade-in delay-200">
          <div className="w-14 h-14 rounded-full bg-[var(--color-violet-50)] flex items-center justify-center mx-auto mb-4">
            <Globe size={26} className="text-[var(--color-violet-400)]" />
          </div>
          <h3 className="text-base font-bold text-[var(--color-surface-900)] mb-2">
            Connect your GitHub profile
          </h3>
          <p className="text-sm text-[var(--color-surface-500)] mb-4 max-w-sm mx-auto">
            Enter your GitHub username above to get AI-generated resume bullets and skill detection from your public repositories.
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-xs text-[var(--color-surface-400)]">
            {["📦 Public repos only", "🔒 Read-only access", "✏️ Copy-ready resume bullets"].map((f) => (
              <span key={f} className="px-2 py-1 rounded-lg bg-[var(--color-surface-100)]">{f}</span>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
