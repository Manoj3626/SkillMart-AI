"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Plus,
  X,
  Target,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  Sparkles,
  Layers,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ScoreRing } from "@/components/ui/Progress";

const LEVELS = ["beginner", "intermediate", "advanced", "expert"] as const;
type Level = (typeof LEVELS)[number];

const levelColors: Record<Level, "surface" | "teal" | "brand" | "violet"> = {
  beginner: "surface",
  intermediate: "teal",
  advanced: "brand",
  expert: "violet",
};

interface TargetRoleDefinition {
  title: string;
  category: string;
  requiredSkills: { name: string; importance: "Core" | "Important" | "Nice-to-have"; why: string }[];
  projectIdea: string;
  recommendedTrack: string;
}

const TARGET_ROLES: TargetRoleDefinition[] = [
  {
    title: "Software Engineer",
    category: "Full Stack & Core Engineering",
    requiredSkills: [
      { name: "Data Structures", importance: "Core", why: "Essential for placement coding rounds and algorithm complexity." },
      { name: "TypeScript", importance: "Core", why: "Industry-standard for type-safe frontend and backend systems." },
      { name: "React", importance: "Important", why: "Standard library for enterprise web application interfaces." },
      { name: "Node.js", importance: "Important", why: "Asynchronous runtime for building microservices and REST APIs." },
      { name: "SQL", importance: "Core", why: "Required for relational data modeling, indexing, and joins." },
      { name: "Git", importance: "Core", why: "Collaborative version control and branching workflows." },
      { name: "Docker", importance: "Nice-to-have", why: "Containerization for consistent deployment across environments." },
      { name: "System Design", importance: "Important", why: "High-level architecture and trade-off evaluation." },
    ],
    projectIdea: "Build a scalable real-time collaborative task board with Next.js, Redis pub/sub, and PostgreSQL.",
    recommendedTrack: "Full Stack Web Engineering & Cloud Deployment",
  },
  {
    title: "Frontend Developer",
    category: "Web & UI Engineering",
    requiredSkills: [
      { name: "JavaScript", importance: "Core", why: "Core language for web interactivity and DOM manipulation." },
      { name: "TypeScript", importance: "Core", why: "Ensures type safety across components and API responses." },
      { name: "React", importance: "Core", why: "Component architecture, hooks, and virtual DOM reconciliation." },
      { name: "Tailwind CSS", importance: "Important", why: "Utility-first styling for responsive layouts." },
      { name: "Next.js", importance: "Core", why: "Server-side rendering, routing, and production optimizations." },
      { name: "REST APIs", importance: "Important", why: "Client-side data fetching, caching, and state management." },
      { name: "Git", importance: "Core", why: "Team repository management and pull request reviews." },
      { name: "Web Accessibility (a11y)", importance: "Nice-to-have", why: "Ensures WCAG compliance and inclusive interfaces." },
    ],
    projectIdea: "Design an interactive analytics dashboard featuring client-side filtering, dark mode, and zero layout shift.",
    recommendedTrack: "Modern Frontend Architecture & Web Performance",
  },
  {
    title: "Backend Engineer",
    category: "API & Infrastructure",
    requiredSkills: [
      { name: "Node.js", importance: "Core", why: "Event-driven runtime for high-concurrency network servers." },
      { name: "SQL", importance: "Core", why: "Relational queries, transaction isolation, and query plans." },
      { name: "PostgreSQL", importance: "Core", why: "Advanced relational engine supporting ACID compliance and JSONB." },
      { name: "REST APIs", importance: "Core", why: "Structured endpoint architecture, HTTP verbs, and error handling." },
      { name: "Docker", importance: "Important", why: "Isolating server dependencies and multi-container environments." },
      { name: "System Design", importance: "Core", why: "Designing caches, message queues, and load balancers." },
      { name: "Git", importance: "Core", why: "Version control and continuous integration pipelines." },
      { name: "Redis", importance: "Nice-to-have", why: "In-memory caching and session rate-limiting." },
    ],
    projectIdea: "Develop a rate-limited REST API with JWT authentication, Redis token revocation, and automated integration tests.",
    recommendedTrack: "Distributed Systems & Backend Platform Engineering",
  },
  {
    title: "Data Analyst",
    category: "Data & Business Intelligence",
    requiredSkills: [
      { name: "Python", importance: "Core", why: "Scripting, data cleaning, and statistical calculations." },
      { name: "SQL", importance: "Core", why: "Complex aggregations, window functions, and business queries." },
      { name: "Pandas", importance: "Core", why: "Dataframe manipulation and dataset transformations." },
      { name: "Data Visualization", importance: "Important", why: "Communicating key trends through charts and dashboards." },
      { name: "Excel", importance: "Important", why: "Pivot tables, financial formulas, and preliminary analysis." },
      { name: "Git", importance: "Nice-to-have", why: "Tracking analytical notebooks and scripts." },
    ],
    projectIdea: "Perform exploratory data analysis on a public campus recruitment dataset and build an interactive summary report.",
    recommendedTrack: "Applied Data Analysis & Business Metrics",
  },
];

const DEFAULT_STUDENT_SKILLS: { name: string; level: Level }[] = [
  { name: "React", level: "intermediate" },
  { name: "JavaScript", level: "advanced" },
  { name: "Node.js", level: "intermediate" },
  { name: "Git", level: "intermediate" },
  { name: "SQL", level: "beginner" },
];

export default function SkillsPage() {
  const [skills, setSkills] = useState<{ name: string; level: Level }[]>(DEFAULT_STUDENT_SKILLS);
  const [selectedRoleTitle, setSelectedRoleTitle] = useState("Software Engineer");
  const [newSkill, setNewSkill] = useState("");
  const [newLevel, setNewLevel] = useState<Level>("intermediate");

  // Load candidate skills from storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("candidate_skills_list");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSkills(parsed);
        }
      }
    } catch {}
  }, []);

  const saveSkills = (updated: { name: string; level: Level }[]) => {
    setSkills(updated);
    try {
      localStorage.setItem("candidate_skills_list", JSON.stringify(updated));
    } catch {}
  };

  const addSkill = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || skills.find((s) => s.name.toLowerCase() === trimmed.toLowerCase())) return;
    const updated = [...skills, { name: trimmed, level: newLevel }];
    saveSkills(updated);
    setNewSkill("");
  };

  const removeSkill = (name: string) => {
    const updated = skills.filter((s) => s.name !== name);
    saveSkills(updated);
  };

  // Selected Target Role
  const activeRole = TARGET_ROLES.find((r) => r.title === selectedRoleTitle) || TARGET_ROLES[0];

  // Calculate gaps dynamically
  const userSkillNames = new Set(skills.map((s) => s.name.toLowerCase()));
  const matchedSkills = activeRole.requiredSkills.filter((req) => userSkillNames.has(req.name.toLowerCase()));
  const missingSkills = activeRole.requiredSkills.filter((req) => !userSkillNames.has(req.name.toLowerCase()));

  const matchPercentage = Math.round((matchedSkills.length / activeRole.requiredSkills.length) * 100);

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-xs font-semibold">
            Placement Readiness
          </span>
          <span className="text-xs text-[var(--color-surface-400)]">Role-Specific Gap Analysis</span>
        </div>
        <h1 className="text-2xl font-bold text-[var(--color-surface-900)]">Skills & Skill Gap Analysis</h1>
        <p className="text-sm text-[var(--color-surface-500)] mt-0.5">
          Benchmark your demonstrated skills against real placement job requirements to bridge critical gaps.
        </p>
      </div>

      {/* Target Role Selector Bar */}
      <div className="bg-white border border-[var(--color-surface-200)] rounded-2xl p-4 sm:p-5 mb-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-sm font-bold text-[var(--color-surface-900)] flex items-center gap-2">
              <Target size={16} className="text-teal-600" /> Select Target Placement Role
            </h2>
            <p className="text-xs text-[var(--color-surface-500)] mt-0.5">
              Requirements update dynamically based on the target role you select.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {TARGET_ROLES.map((role) => (
              <button
                key={role.title}
                onClick={() => setSelectedRoleTitle(role.title)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedRoleTitle === role.title
                    ? "bg-[#042f2e] text-white shadow-sm"
                    : "bg-[var(--color-surface-100)] text-[var(--color-surface-700)] hover:bg-[var(--color-surface-200)]"
                }`}
              >
                {role.title}
              </button>
            ))}
          </div>
        </div>

        {/* Readiness Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[var(--color-surface-100)]">
          <div className="flex items-center gap-4 p-3.5 rounded-xl bg-teal-50/60 border border-teal-100">
            <ScoreRing score={matchPercentage} size={54} strokeWidth={5} />
            <div>
              <span className="text-xs text-teal-800 font-semibold block">Role Match Score</span>
              <span className="text-xs text-teal-600 font-medium">
                {matchedSkills.length} of {activeRole.requiredSkills.length} Core Skills Verified
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100 flex flex-col justify-center">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 mb-1">
              <CheckCircle2 size={14} className="text-emerald-600" /> Matched Skills ({matchedSkills.length})
            </div>
            <p className="text-[11px] text-emerald-700 leading-relaxed">
              Demonstrated in your verified profile and practice sessions.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-100 flex flex-col justify-center">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 mb-1">
              <AlertTriangle size={14} className="text-amber-600" /> Need Demonstration ({missingSkills.length})
            </div>
            <p className="text-[11px] text-amber-700 leading-relaxed">
              Not yet demonstrated in your resume or profile.
            </p>
          </div>
        </div>
      </div>

      {/* Main Analysis Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left 2 Cols: Detailed Gap Breakdown */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Missing / Unverified Skills */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle className="text-base flex items-center gap-2 text-amber-900">
                  <AlertTriangle size={16} className="text-amber-600" /> Skills Not Yet Demonstrated in Resume
                </CardTitle>
                <CardDescription>
                  These skills are requested by campus placement recruiters for {activeRole.title} but are not yet evidenced in your profile.
                </CardDescription>
              </div>
            </CardHeader>
            <div className="flex flex-col gap-3">
              {missingSkills.length === 0 ? (
                <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-medium">
                  🎉 Fantastic! You have demonstrated all core skills required for this role.
                </div>
              ) : (
                missingSkills.map((req) => (
                  <div
                    key={req.name}
                    className="p-3.5 rounded-xl border border-amber-200/80 bg-amber-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-xs text-[var(--color-surface-900)]">{req.name}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                          {req.importance}
                        </span>
                        <span className="text-[10px] text-amber-700/80 font-medium italic">
                          Not demonstrated in resume
                        </span>
                      </div>
                      <p className="text-xs text-[var(--color-surface-600)]">{req.why}</p>
                    </div>
                    <button
                      onClick={() => addSkill(req.name)}
                      className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-800 hover:bg-amber-100 transition-colors shadow-2xs"
                    >
                      + I have this skill
                    </button>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Matched Skills */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle className="text-base flex items-center gap-2 text-emerald-900">
                  <CheckCircle2 size={16} className="text-emerald-600" /> Verified & Demonstrated Skills
                </CardTitle>
                <CardDescription>
                  Skills you possess that directly fulfill placement criteria for {activeRole.title}.
                </CardDescription>
              </div>
            </CardHeader>
            <div className="flex flex-wrap gap-2.5">
              {matchedSkills.length === 0 ? (
                <p className="text-xs text-[var(--color-surface-500)] py-2">
                  No overlapping skills yet. Add your skills in the panel on the right.
                </p>
              ) : (
                matchedSkills.map((req) => (
                  <div
                    key={req.name}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold"
                  >
                    <CheckCircle2 size={13} className="text-emerald-600" />
                    <span>{req.name}</span>
                    <span className="text-[10px] text-emerald-700 font-normal">({req.importance})</span>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Recommended Project & Action Plan */}
          <Card className="bg-gradient-to-br from-slate-900 to-teal-950 text-white border-0">
            <div className="flex items-center gap-2 text-teal-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles size={14} /> Recommended Capstone Project To Close Gaps
            </div>
            <h3 className="text-base font-bold text-white mb-2">{activeRole.projectIdea}</h3>
            <p className="text-xs text-white/70 leading-relaxed mb-4">
              Building and publishing this project directly demonstrates the missing competencies (such as{" "}
              {missingSkills.slice(0, 3).map((s) => s.name).join(", ") || "advanced production architecture"}) to technical interviewers.
            </p>
            <div className="flex items-center gap-3">
              <Link
                href="/learn"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors shadow-md"
              >
                <BookOpen size={14} /> View Learning Track Resources <ArrowRight size={13} />
              </Link>
            </div>
          </Card>
        </div>

        {/* Right Col: Manage Your Skills */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Add Skill to Profile</CardTitle>
              <CardDescription>Expand your verified skills roster</CardDescription>
            </CardHeader>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="e.g. Docker, Python, SQL…"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSkill(newSkill)}
                className="input text-xs"
              />
              <div className="flex items-center gap-2">
                <select
                  value={newLevel}
                  onChange={(e) => setNewLevel(e.target.value as Level)}
                  className="input text-xs flex-1"
                >
                  {LEVELS.map((l) => (
                    <option key={l} value={l}>
                      {l.charAt(0).toUpperCase() + l.slice(1)}
                    </option>
                  ))}
                </select>
                <button onClick={() => addSkill(newSkill)} className="btn btn-primary btn-sm shrink-0">
                  <Plus size={14} /> Add
                </button>
              </div>
            </div>
          </Card>

          {/* Current Skills Bag */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Your Current Skills ({skills.length})</CardTitle>
            </CardHeader>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <div
                  key={skill.name}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[var(--color-surface-200)] bg-[var(--color-surface-50)] text-xs group"
                >
                  <span className="font-semibold text-[var(--color-surface-800)]">{skill.name}</span>
                  <Badge variant={levelColors[skill.level]} className="text-[10px] px-1.5 py-0">
                    {skill.level}
                  </Badge>
                  <button
                    onClick={() => removeSkill(skill.name)}
                    className="text-[var(--color-surface-400)] hover:text-red-500 transition-colors ml-0.5"
                    aria-label={`Remove ${skill.name}`}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
