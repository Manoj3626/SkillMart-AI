"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  ExternalLink,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Target,
  Search,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";

interface LearningTrack {
  id: string;
  skill: string;
  category: "dsa" | "web" | "system_design" | "database";
  priority: "High" | "Medium" | "Foundational";
  roleAlignment: string;
  resources: {
    id: string;
    title: string;
    url: string;
    provider: string;
    type: "Guide" | "Course" | "Practice" | "Handbook";
    free: boolean;
  }[];
}

const LEARNING_TRACKS: LearningTrack[] = [
  {
    id: "track-dsa",
    skill: "Data Structures & Algorithms",
    category: "dsa",
    priority: "High",
    roleAlignment: "Required for Software Engineer & Full Stack coding rounds",
    resources: [
      {
        id: "res-leetcode",
        title: "LeetCode Top Interview 150 Problems",
        url: "https://leetcode.com/studyplan/top-interview-150/",
        provider: "LeetCode",
        type: "Practice",
        free: true,
      },
      {
        id: "res-cs50",
        title: "CS50x: Introduction to Computer Science",
        url: "https://cs50.harvard.edu/x/",
        provider: "Harvard University",
        type: "Course",
        free: true,
      },
      {
        id: "res-neetcode",
        title: "NeetCode DSA Roadmap & Patterns",
        url: "https://neetcode.io/roadmap",
        provider: "NeetCode",
        type: "Guide",
        free: true,
      },
    ],
  },
  {
    id: "track-system-design",
    skill: "System Design & Architecture",
    category: "system_design",
    priority: "High",
    roleAlignment: "Assessed in Senior & Mid-level Technical Interviews",
    resources: [
      {
        id: "res-primer",
        title: "The System Design Primer",
        url: "https://github.com/donnemartin/system-design-primer",
        provider: "Open Source / Donne Martin",
        type: "Handbook",
        free: true,
      },
      {
        id: "res-bytebytego",
        title: "ByteByteGo System Design Blog & Diagrams",
        url: "https://blog.bytebytego.com/",
        provider: "Alex Xu",
        type: "Guide",
        free: true,
      },
    ],
  },
  {
    id: "track-typescript",
    skill: "TypeScript & React Modern Patterns",
    category: "web",
    priority: "High",
    roleAlignment: "Core for Frontend & Full Stack campus placements",
    resources: [
      {
        id: "res-ts-handbook",
        title: "Official TypeScript Handbook",
        url: "https://www.typescriptlang.org/docs/handbook/intro.html",
        provider: "Microsoft",
        type: "Handbook",
        free: true,
      },
      {
        id: "res-react-docs",
        title: "React.dev — Interactive Official Tutorial",
        url: "https://react.dev/learn",
        provider: "React Core Team",
        type: "Guide",
        free: true,
      },
      {
        id: "res-nextjs-learn",
        title: "Next.js App Router Foundations",
        url: "https://nextjs.org/learn",
        provider: "Vercel",
        type: "Course",
        free: true,
      },
    ],
  },
  {
    id: "track-database",
    skill: "SQL & Relational Database Design",
    category: "database",
    priority: "Medium",
    roleAlignment: "Tested in Backend & Full Stack technical assessments",
    resources: [
      {
        id: "res-pg-tutorial",
        title: "PostgreSQL Tutorial — Complete Guide",
        url: "https://www.postgresqltutorial.com/",
        provider: "PostgreSQL Tutorial",
        type: "Guide",
        free: true,
      },
      {
        id: "res-sqlzoo",
        title: "SQLZoo Interactive Query Exercises",
        url: "https://sqlzoo.net/",
        provider: "SQLZoo",
        type: "Practice",
        free: true,
      },
    ],
  },
];

export default function LearnPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [completedIds, setCompletedIds] = useState<string[]>([]);

  // Load completed resources from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("candidate_completed_learning");
      if (saved) setCompletedIds(JSON.parse(saved));
    } catch {}
  }, []);

  const toggleCompleted = (resId: string) => {
    setCompletedIds((prev) => {
      const next = prev.includes(resId) ? prev.filter((id) => id !== resId) : [...prev, resId];
      try {
        localStorage.setItem("candidate_completed_learning", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const allResources = LEARNING_TRACKS.flatMap((t) => t.resources);
  const totalCompleted = completedIds.length;
  const progressPercent = Math.min(100, Math.round((totalCompleted / Math.max(allResources.length, 1)) * 100));

  const filteredTracks = LEARNING_TRACKS.filter((track) => {
    const matchesCategory = selectedCategory === "all" || track.category === selectedCategory;
    const matchesSearch =
      track.skill.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.resources.some((r) => r.title.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-xs font-semibold">
              Skill Gap Closure
            </span>
            <span className="text-xs text-[var(--color-surface-400)]">Curated Placement Tracks</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-surface-900)]">Learning & Placement Preparation</h1>
          <p className="text-sm text-[var(--color-surface-500)] mt-0.5">
            Structured learning materials and practice plans to close skills gaps before campus recruitment.
          </p>
        </div>

        {/* Progress pill */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-[var(--color-surface-200)] shadow-xs shrink-0 self-start sm:self-auto">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[var(--color-surface-800)]">
              {totalCompleted} of {allResources.length} Completed
            </span>
            <span className="text-[10px] text-[var(--color-surface-500)]">Learning milestones</span>
          </div>
          <div className="w-16">
            <Progress value={progressPercent} color="teal" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap gap-2">
          {[
            { id: "all", label: "All Topics" },
            { id: "dsa", label: "Algorithms & DSA" },
            { id: "web", label: "TypeScript & React" },
            { id: "system_design", label: "System Design" },
            { id: "database", label: "SQL & Databases" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat.id
                  ? "bg-[#042f2e] text-white shadow-xs"
                  : "bg-white border border-[var(--color-surface-200)] text-[var(--color-surface-700)] hover:bg-[var(--color-surface-100)]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-56">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-surface-400)]" />
          <input
            type="text"
            placeholder="Search guides or topics…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input text-xs pl-8 w-full"
          />
        </div>
      </div>

      {/* Learning Tracks List */}
      <div className="flex flex-col gap-6">
        {filteredTracks.map((track) => (
          <Card key={track.id} className="overflow-hidden">
            <CardHeader className="bg-[var(--color-surface-50)]/70 border-b border-[var(--color-surface-100)] py-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 w-full">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base text-[var(--color-surface-900)]">{track.skill}</CardTitle>
                    <Badge variant={track.priority === "High" ? "error" : "warning"}>
                      {track.priority} Priority
                    </Badge>
                  </div>
                  <CardDescription className="text-xs text-[var(--color-surface-500)] mt-0.5">
                    {track.roleAlignment}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <div className="p-4 flex flex-col gap-3">
              {track.resources.map((res) => {
                const isCompleted = completedIds.includes(res.id);
                return (
                  <div
                    key={res.id}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                      isCompleted
                        ? "bg-emerald-50/40 border-emerald-200"
                        : "bg-white border-[var(--color-surface-200)] hover:border-[var(--color-surface-300)]"
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <button
                        onClick={() => toggleCompleted(res.id)}
                        className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                          isCompleted
                            ? "bg-emerald-600 border-emerald-600 text-white"
                            : "border-[var(--color-surface-300)] hover:border-[var(--color-surface-400)] text-transparent"
                        }`}
                        title={isCompleted ? "Mark incomplete" : "Mark completed"}
                      >
                        <CheckCircle2 size={13} />
                      </button>
                      <div className="min-w-0">
                        <a
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs sm:text-sm font-bold text-[var(--color-surface-900)] hover:text-teal-700 flex items-center gap-1.5 transition-colors"
                        >
                          <span className={isCompleted ? "line-through text-[var(--color-surface-500)]" : ""}>
                            {res.title}
                          </span>
                          <ExternalLink size={12} className="text-[var(--color-surface-400)] shrink-0" />
                        </a>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-[var(--color-surface-500)]">
                          <span>{res.provider}</span>
                          <span>•</span>
                          <span className="font-medium text-[var(--color-surface-600)]">{res.type}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      {res.free && <Badge variant="success">Free</Badge>}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        ))}

        {filteredTracks.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-[var(--color-surface-200)]">
            <BookOpen size={28} className="text-[var(--color-surface-300)] mx-auto mb-2" />
            <p className="text-sm font-semibold text-[var(--color-surface-700)]">No learning resources matched your search.</p>
            <button onClick={() => { setSelectedCategory("all"); setSearchQuery(""); }} className="btn btn-outline btn-sm mt-3">
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
