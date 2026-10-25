"use client";
import React from "react";
import { Users, Search } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ScoreRing } from "@/components/ui/Progress";

const demoApplicants = [
  { name: "Priya Sharma", role: "Frontend Developer", score: 84, status: "shortlisted", skills: ["React", "TypeScript"] },
  { name: "Arjun Mehta", role: "Frontend Developer", score: 76, status: "review", skills: ["Vue.js", "JavaScript"] },
  { name: "Sana Kapoor", role: "Data Analyst", score: 91, status: "interview", skills: ["Python", "SQL"] },
  { name: "Rohan Das", role: "DevOps Engineer", score: 68, status: "review", skills: ["Docker", "Kubernetes"] },
  { name: "Meera Iyer", role: "Product Manager", score: 79, status: "shortlisted", skills: ["Agile", "JIRA"] },
];

const statusCfg: Record<string, { variant: "success" | "teal" | "brand" | "warning" | "surface"; label: string }> = {
  shortlisted: { variant: "teal", label: "Shortlisted" },
  review: { variant: "warning", label: "In Review" },
  interview: { variant: "brand", label: "Interview" },
  offer: { variant: "success", label: "Offer Sent" },
};

export default function RecruiterApplicantsPage() {
  const [search, setSearch] = React.useState("");
  const filtered = demoApplicants.filter(
    (a) => a.name.toLowerCase().includes(search.toLowerCase()) || a.role.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-[var(--color-surface-900)]">Applicants</h1>
        <p className="text-sm text-[var(--color-surface-500)] mt-0.5">Review all candidates scored by SkillMatch AI.</p>
      </div>
      <div className="relative mb-4 animate-fade-in">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-surface-400)] pointer-events-none" />
        <input type="text" placeholder="Search applicants…" value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-8" />
      </div>
      <div className="flex flex-col gap-3">
        {filtered.map((a, i) => {
          const cfg = statusCfg[a.status] ?? { variant: "surface" as const, label: a.status };
          return (
            <Card key={i} className="animate-fade-in" style={{ animationDelay: `${i * 0.05}s` } as React.CSSProperties}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full gradient-brand flex items-center justify-center text-white font-bold shrink-0">{a.name[0]}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--color-surface-900)]">{a.name}</p>
                  <p className="text-xs text-[var(--color-surface-400)]">{a.role}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {a.skills.map((s) => <Badge key={s} variant="surface" className="text-[10px]">{s}</Badge>)}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <ScoreRing score={a.score} size={44} strokeWidth={4} />
                  <Badge variant={cfg.variant}>{cfg.label}</Badge>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
