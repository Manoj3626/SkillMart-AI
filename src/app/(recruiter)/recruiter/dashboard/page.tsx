"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Users,
  ClipboardList,
  TrendingUp,
  Plus,
  Eye,
  CheckCircle,
  Clock,
  ChevronRight,
  Search,
  Filter,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ScoreRing } from "@/components/ui/Progress";

// Demo data
const demoStats = [
  { label: "Active Postings", value: 4, icon: Briefcase, color: "brand" },
  { label: "Total Applicants", value: 67, icon: Users, color: "teal" },
  { label: "In Review", value: 14, icon: ClipboardList, color: "violet" },
  { label: "Interviews Scheduled", value: 6, icon: TrendingUp, color: "success" },
];

const demoJobs = [
  {
    id: "j1", title: "Frontend Developer", department: "Engineering",
    applicants: 23, new: 5, status: "active",
    postedDate: "Oct 8, 2026", deadline: "Oct 31, 2026",
  },
  {
    id: "j2", title: "Data Analyst", department: "Business Intelligence",
    applicants: 18, new: 2, status: "active",
    postedDate: "Oct 5, 2026", deadline: "Oct 28, 2026",
  },
  {
    id: "j3", title: "DevOps Engineer", department: "Platform",
    applicants: 12, new: 0, status: "paused",
    postedDate: "Sep 30, 2026", deadline: "Oct 25, 2026",
  },
  {
    id: "j4", title: "Product Manager", department: "Product",
    applicants: 14, new: 3, status: "active",
    postedDate: "Oct 10, 2026", deadline: "Nov 5, 2026",
  },
];

const demoApplicants = [
  { name: "Priya Sharma", role: "Frontend Developer", score: 84, status: "shortlisted", skills: ["React", "TypeScript", "CSS"] },
  { name: "Arjun Mehta", role: "Frontend Developer", score: 76, status: "review", skills: ["Vue.js", "JavaScript", "Tailwind"] },
  { name: "Sana Kapoor", role: "Data Analyst", score: 91, status: "interview", skills: ["Python", "SQL", "Tableau"] },
  { name: "Rohan Das", role: "DevOps Engineer", score: 68, status: "review", skills: ["Docker", "Kubernetes", "AWS"] },
  { name: "Meera Iyer", role: "Product Manager", score: 79, status: "shortlisted", skills: ["Agile", "JIRA", "Analytics"] },
];

const statusBadge: Record<string, { variant: "success" | "brand" | "teal" | "warning" | "surface"; label: string }> = {
  shortlisted: { variant: "teal", label: "Shortlisted" },
  review: { variant: "warning", label: "In Review" },
  interview: { variant: "brand", label: "Interview" },
  offer: { variant: "success", label: "Offer Sent" },
  rejected: { variant: "surface", label: "Rejected" },
};

export default function RecruiterDashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredApplicants = demoApplicants.filter(
    (a) =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-surface-900)]">Recruiter Dashboard</h1>
          <p className="text-sm text-[var(--color-surface-500)] mt-0.5">
            Manage postings and review SkillMatch AI-scored applicants.
          </p>
        </div>
        <Link href="/recruiter/jobs/new" className="btn btn-primary btn-md">
          <Plus size={15} /> Post Job
        </Link>
      </div>

      {/* Demo notice */}
      <div className="flex items-center gap-2 p-3 bg-[var(--color-brand-50)] border border-[var(--color-brand-100)] rounded-xl text-xs text-[var(--color-brand-700)] mb-6 animate-fade-in">
        Demo data shown. Connect Supabase and set your organization to see real applicant data.
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {demoStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className="animate-fade-in"
              style={{ animationDelay: `${i * 0.06}s` } as React.CSSProperties}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-2xl font-extrabold text-[var(--color-surface-900)] mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs text-[var(--color-surface-500)]">{stat.label}</div>
                </div>
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: `var(--color-${stat.color}-50)` }}
                >
                  <Icon size={17} style={{ color: `var(--color-${stat.color}-600)` }} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Job Postings */}
        <div className="lg:col-span-2">
          <Card className="animate-fade-in delay-150">
            <CardHeader>
              <CardTitle>Job Postings</CardTitle>
              <Link href="/recruiter/jobs" className="text-xs text-[var(--color-brand-600)] hover:underline flex items-center gap-1">
                Manage <ChevronRight size={11} />
              </Link>
            </CardHeader>
            <div className="flex flex-col gap-3">
              {demoJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[var(--color-surface-50)] hover:bg-[var(--color-surface-100)] transition-colors cursor-pointer">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--color-surface-900)] truncate">{job.title}</p>
                    <p className="text-xs text-[var(--color-surface-400)]">{job.department}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1 text-xs text-[var(--color-surface-600)]">
                      <Users size={11} /> {job.applicants}
                      {job.new > 0 && (
                        <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[var(--color-brand-500)] text-white text-[9px] font-bold">
                          +{job.new}
                        </span>
                      )}
                    </div>
                    <Badge variant={job.status === "active" ? "success" : "surface"}>
                      {job.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn btn-outline btn-sm w-full mt-4">
              <Plus size={13} /> Post New Job
            </button>
          </Card>
        </div>

        {/* Applicant Pipeline */}
        <div className="lg:col-span-3">
          <Card className="animate-fade-in delay-200">
            <CardHeader>
              <CardTitle>Applicant Pipeline</CardTitle>
              <span className="text-xs text-[var(--color-surface-400)]">
                Scored by SkillMatch AI
              </span>
            </CardHeader>

            {/* Search */}
            <div className="relative mb-4">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-surface-400)] pointer-events-none" />
              <input
                type="text"
                placeholder="Search applicants…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-8 text-sm"
              />
            </div>

            <div className="flex flex-col gap-3">
              {filteredApplicants.map((applicant, i) => {
                const badgeInfo = statusBadge[applicant.status];
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-surface-50)] hover:bg-[var(--color-surface-100)] transition-colors cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-full gradient-brand flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {applicant.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--color-surface-900)]">{applicant.name}</p>
                      <p className="text-xs text-[var(--color-surface-400)]">{applicant.role}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {applicant.skills.map((s) => (
                          <Badge key={s} variant="surface" className="text-[9px]">{s}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <ScoreRing score={applicant.score} size={42} strokeWidth={4} />
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant={badgeInfo.variant}>{badgeInfo.label}</Badge>
                        <button className="opacity-0 group-hover:opacity-100 text-xs text-[var(--color-brand-600)] hover:underline transition-opacity flex items-center gap-0.5">
                          <Eye size={11} /> View
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
