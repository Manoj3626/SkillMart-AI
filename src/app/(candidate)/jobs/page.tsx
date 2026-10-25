"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  Briefcase,
  Search,
  MapPin,
  Clock,
  ExternalLink,
  AlertCircle,
  X,
  IndianRupee,
  ChevronRight,
  Globe,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ScoreRing } from "@/components/ui/Progress";
import type { LiveJob } from "@/app/api/jobs/search/route";

interface ScoredJob extends LiveJob {
  score: number;
  matching: string[];
  scoreExplanation?: string;
}

function formatSalary(min: number | null, max: number | null, currency: string): string {
  if (!min && !max) return "Salary not disclosed";
  const fmt = (n: number) =>
    n >= 100000 ? `${(n / 100000).toFixed(1)}L` : `${(n / 1000).toFixed(0)}K`;
  if (min && max) return `₹${fmt(min)} – ₹${fmt(max)}`;
  if (max) return `Up to ₹${fmt(max)}`;
  return `From ₹${fmt(min!)}`;
}

function daysAgo(iso: string): string {
  try {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
    if (isNaN(diff) || diff < 0) return "Recently";
    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    return `${diff}d ago`;
  } catch {
    return "Recently";
  }
}

const SOURCE_LABELS: Record<string, { label: string; variant: "brand" | "teal" | "violet" | "surface" }> = {
  adzuna: { label: "Adzuna API", variant: "brand" },
  remotive: { label: "Remotive Verified", variant: "teal" },
  arbeitnow: { label: "Arbeitnow Feed", variant: "violet" },
};

export default function JobsPage() {
  const [query, setQuery] = useState("Software Engineer");
  const [location, setLocation] = useState("India");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [jobs, setJobs] = useState<ScoredJob[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState<string>("live_public_feeds");
  const [page, setPage] = useState(1);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedJob, setSelectedJob] = useState<ScoredJob | null>(null);

  const search = useCallback(
    async (pg = 1) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          q: query || "Software Engineer",
          location: location || "India",
          page: String(pg),
          resultsPerPage: "15",
          ...(remoteOnly ? { remote: "true" } : {}),
        });
        const res = await fetch(`/api/jobs/search?${params}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        const list = Array.isArray(data.jobs) ? data.jobs : [];
        setJobs(list);
        setTotal(data.total || list.length);
        setProvider(data.provider || "live_public_feeds");
        setPage(pg);
        setHasSearched(true);
        if (list.length > 0 && !selectedJob) {
          setSelectedJob(list[0]);
        }
      } catch (err) {
        console.warn("Job search note:", err);
      } finally {
        setLoading(false);
      }
    },
    [query, location, remoteOnly, selectedJob]
  );

  // Auto-search on load
  useEffect(() => {
    search(1);
  }, []); // eslint-disable-line

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 animate-fade-in flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-surface-900)]">Real Job Discovery</h1>
          <p className="text-sm text-[var(--color-surface-500)] mt-0.5">
            Authentic, verified live vacancies fetched directly from verified employer feeds.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-[var(--color-surface-100)] border border-[var(--color-surface-200)] px-3 py-1.5 rounded-full text-[var(--color-surface-700)]">
          <Globe size={13} className="text-emerald-500" />
          <span>
            {provider === "adzuna"
              ? "Live Provider: Adzuna API"
              : "Live Providers: Remotive & Arbeitnow Feeds"}
          </span>
        </div>
      </div>

      {/* Search bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-fade-in delay-100">
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-surface-400)] pointer-events-none"
          />
          <input
            type="text"
            placeholder="Job title, skill, or role (e.g. React, Python, Frontend)…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search(1)}
            className="input pl-9 w-full"
          />
        </div>
        <div className="relative">
          <MapPin
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-surface-400)] pointer-events-none"
          />
          <input
            type="text"
            placeholder="Location (city or India)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search(1)}
            className="input pl-9 w-48"
          />
        </div>
        <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-surface-700)] cursor-pointer whitespace-nowrap">
          <input
            type="checkbox"
            checked={remoteOnly}
            onChange={(e) => setRemoteOnly(e.target.checked)}
            className="w-4 h-4 accent-[var(--color-brand-600)]"
          />
          Remote only
        </label>
        <button
          onClick={() => search(1)}
          disabled={loading}
          className="btn btn-primary btn-md shrink-0 flex items-center gap-1.5 cursor-pointer"
        >
          {loading ? (
            <svg
              className="animate-spin"
              width={15}
              height={15}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <circle cx="12" cy="12" r="10" strokeOpacity={0.25} />
              <path d="M12 2a10 10 0 0 1 10 10" />
            </svg>
          ) : (
            <Search size={15} />
          )}
          <span>Search Live Jobs</span>
        </button>
      </div>

      {/* Results Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Job list */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          {loading && !hasSearched && (
            [...Array(4)].map((_, i) => (
              <div
                key={i}
                className="card p-4 animate-fade-in"
                style={{ animationDelay: `${i * 0.06}s` } as React.CSSProperties}
              >
                <div className="skeleton h-4 w-3/4 rounded mb-2" />
                <div className="skeleton h-3 w-1/2 rounded mb-3" />
                <div className="skeleton h-3 w-full rounded" />
              </div>
            ))
          )}

          {!loading && hasSearched && jobs.length === 0 && (
            <div className="card p-8 text-center bg-white border border-[var(--color-surface-200)] rounded-xl">
              <Briefcase size={32} className="mx-auto mb-3 text-[var(--color-surface-300)]" />
              <p className="text-sm font-semibold text-[var(--color-surface-800)]">
                No matching live jobs found. Try another role, skill, or location.
              </p>
              <p className="text-xs text-[var(--color-surface-500)] mt-1.5 leading-relaxed">
                SkillMatch AI queries verified real-time vacancies and strictly avoids fake demo cards.
              </p>
            </div>
          )}

          {jobs.map((job, i) => (
            <button
              key={job.id}
              onClick={() => setSelectedJob(job)}
              className={`card text-left p-4 transition-all animate-fade-in cursor-pointer ${
                selectedJob?.id === job.id
                  ? "border-[var(--color-brand-500)] bg-[var(--color-brand-50)] shadow-md"
                  : "card-interactive"
              }`}
              style={{ animationDelay: `${i * 0.04}s` } as React.CSSProperties}
            >
              <div className="flex items-start gap-3">
                <ScoreRing score={job.score} size={44} strokeWidth={4} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--color-surface-900)] leading-tight mb-0.5 truncate">
                    {job.title}
                  </p>
                  <p className="text-xs text-[var(--color-surface-600)] font-medium truncate">
                    {job.company}
                  </p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="text-[10px] text-[var(--color-surface-400)] flex items-center gap-1">
                      <MapPin size={9} /> {job.location}
                    </span>
                    <span className="text-[10px] text-[var(--color-surface-400)] flex items-center gap-1">
                      <Clock size={9} /> {daysAgo(job.posted_at)}
                    </span>
                    <Badge
                      variant={SOURCE_LABELS[job.source]?.variant || "surface"}
                      className="text-[9px]"
                    >
                      {SOURCE_LABELS[job.source]?.label || job.source}
                    </Badge>
                  </div>
                </div>
                <ChevronRight size={14} className="text-[var(--color-surface-300)] shrink-0 mt-1" />
              </div>
            </button>
          ))}

          {/* Pagination */}
          {hasSearched && total > 15 && (
            <div className="flex items-center justify-between mt-2">
              <button
                disabled={page === 1 || loading}
                onClick={() => search(page - 1)}
                className="btn btn-outline btn-sm cursor-pointer"
              >
                Previous
              </button>
              <span className="text-xs text-[var(--color-surface-500)] font-medium">
                Page {page} · {total} live vacancies
              </span>
              <button
                disabled={loading || jobs.length < 15}
                onClick={() => search(page + 1)}
                className="btn btn-outline btn-sm cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-3">
          {!selectedJob ? (
            <Card className="h-full flex flex-col items-center justify-center text-center py-16">
              <Briefcase size={36} className="text-[var(--color-surface-200)] mb-3" />
              <p className="text-sm font-medium text-[var(--color-surface-500)]">
                Select a live job to inspect details and apply
              </p>
            </Card>
          ) : (
            <Card className="animate-fade-in sticky top-6">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-lg font-bold text-[var(--color-surface-900)] leading-tight mb-1">
                    {selectedJob.title}
                  </h2>
                  <p className="text-sm text-[var(--color-surface-700)] font-semibold">
                    {selectedJob.company}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="text-[var(--color-surface-400)] hover:text-[var(--color-surface-600)] transition-colors shrink-0 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Meta badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="surface" className="flex items-center gap-1">
                  <MapPin size={10} /> {selectedJob.location}
                </Badge>
                <Badge variant="surface">{selectedJob.contract_type}</Badge>
                <Badge variant="surface" className="flex items-center gap-1">
                  <Clock size={10} /> {daysAgo(selectedJob.posted_at)}
                </Badge>
                <Badge variant={SOURCE_LABELS[selectedJob.source]?.variant || "surface"}>
                  Source: {SOURCE_LABELS[selectedJob.source]?.label || selectedJob.source}
                </Badge>
                {selectedJob.salary_min || selectedJob.salary_max ? (
                  <Badge variant="success" className="flex items-center gap-1">
                    <IndianRupee size={9} />
                    {formatSalary(
                      selectedJob.salary_min,
                      selectedJob.salary_max,
                      selectedJob.currency
                    )}
                  </Badge>
                ) : null}
              </div>

              {/* Transparent Skill Match Explanation */}
              <div className="flex items-center gap-3 p-3 bg-[var(--color-brand-50)] border border-[var(--color-brand-100)] rounded-xl mb-4">
                <ScoreRing score={selectedJob.score} size={48} strokeWidth={4} />
                <div>
                  <p className="text-xs font-semibold text-[var(--color-brand-700)] flex items-center gap-1">
                    <Sparkles size={12} /> Transparent Skill Match Score
                  </p>
                  <p className="text-[11px] text-[var(--color-surface-600)] mt-0.5">
                    {selectedJob.scoreExplanation ||
                      "Estimated score comparing matching skills from candidate profile with employer requirements."}
                  </p>
                  {selectedJob.matching && selectedJob.matching.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {selectedJob.matching.map((s) => (
                        <Badge key={s} variant="brand" className="text-[10px]">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="max-h-72 overflow-y-auto mb-4 border border-[var(--color-surface-100)] rounded-lg p-3 bg-[var(--color-surface-50)]/50">
                <p className="text-xs sm:text-sm text-[var(--color-surface-700)] leading-relaxed whitespace-pre-line">
                  {selectedJob.description}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-3 border-t border-[var(--color-surface-100)]">
                <a
                  href={selectedJob.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-md flex-1 justify-center flex items-center gap-1.5"
                >
                  <ExternalLink size={14} />
                  <span>Apply on Original Listing</span>
                </a>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
