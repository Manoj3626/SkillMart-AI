"use client";
import React from "react";
import Link from "next/link";
import { Briefcase, Plus, Eye, Edit, Pause, Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const demoJobs = [
  { id: "j1", title: "Frontend Developer", dept: "Engineering", applicants: 23, new: 5, status: "active", posted: "Oct 8, 2026", deadline: "Oct 31, 2026" },
  { id: "j2", title: "Data Analyst", dept: "Business Intelligence", applicants: 18, new: 2, status: "active", posted: "Oct 5, 2026", deadline: "Oct 28, 2026" },
  { id: "j3", title: "DevOps Engineer", dept: "Platform", applicants: 12, new: 0, status: "paused", posted: "Sep 30, 2026", deadline: "Oct 25, 2026" },
  { id: "j4", title: "Product Manager", dept: "Product", applicants: 14, new: 3, status: "active", posted: "Oct 10, 2026", deadline: "Nov 5, 2026" },
];

export default function RecruiterJobsPage() {
  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-surface-900)]">Job Postings</h1>
          <p className="text-sm text-[var(--color-surface-500)] mt-0.5">Manage all your active and paused postings.</p>
        </div>
        <Link href="/recruiter/jobs/new" className="btn btn-primary btn-md">
          <Plus size={15} /> Post Job
        </Link>
      </div>
      <div className="flex flex-col gap-3">
        {demoJobs.map((job, i) => (
          <Card key={job.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.06}s` } as React.CSSProperties}>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center text-white shrink-0">
                <Briefcase size={17} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--color-surface-900)]">{job.title}</p>
                <p className="text-xs text-[var(--color-surface-400)]">{job.dept} · Posted {job.posted} · Deadline {job.deadline}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-center hidden sm:block">
                  <div className="text-lg font-bold text-[var(--color-surface-900)]">
                    {job.applicants}
                    {job.new > 0 && <span className="text-xs text-[var(--color-brand-500)] ml-1">+{job.new}</span>}
                  </div>
                  <div className="text-[10px] text-[var(--color-surface-400)]">Applicants</div>
                </div>
                <Badge variant={job.status === "active" ? "success" : "surface"}>{job.status}</Badge>
                <div className="flex items-center gap-1">
                  <button className="p-1.5 rounded-lg hover:bg-[var(--color-surface-100)] transition-colors text-[var(--color-surface-400)] hover:text-[var(--color-brand-500)]" title="View applicants"><Eye size={15} /></button>
                  <button className="p-1.5 rounded-lg hover:bg-[var(--color-surface-100)] transition-colors text-[var(--color-surface-400)] hover:text-[var(--color-warning-500)]" title="Edit"><Edit size={14} /></button>
                  <button className="p-1.5 rounded-lg hover:bg-[var(--color-surface-100)] transition-colors text-[var(--color-surface-400)] hover:text-[var(--color-error-500)]" title="Delete"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
