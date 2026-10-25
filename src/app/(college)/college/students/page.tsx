"use client";
import React from "react";
import { GraduationCap } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ScoreRing } from "@/components/ui/Progress";

const students = [
  { name: "Ananya Singh", dept: "CS/IT", batch: "2026", score: 88, interviews: 5, status: "placed" },
  { name: "Kiran Patel", dept: "CS/IT", batch: "2026", score: 74, interviews: 3, status: "active" },
  { name: "Deepa Nair", dept: "ECE", batch: "2026", score: 81, interviews: 4, status: "placed" },
  { name: "Raj Kumar", dept: "Mech", batch: "2026", score: 58, interviews: 2, status: "struggling" },
  { name: "Fatima Sheikh", dept: "CS/IT", batch: "2026", score: 93, interviews: 7, status: "placed" },
  { name: "Siddharth Rao", dept: "CS/IT", batch: "2026", score: 66, interviews: 3, status: "active" },
];

const statusCfg: Record<string, { variant: "success" | "brand" | "warning"; label: string }> = {
  placed: { variant: "success", label: "Placed" },
  active: { variant: "brand", label: "Active" },
  struggling: { variant: "warning", label: "Needs Help" },
};

export default function CollegeStudentsPage() {
  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-[var(--color-surface-900)]">Student Roster</h1>
        <p className="text-sm text-[var(--color-surface-500)] mt-0.5">All registered students with their practice scores and placement status.</p>
      </div>
      <div className="flex flex-col gap-3">
        {students.map((s, i) => {
          const cfg = statusCfg[s.status];
          return (
            <Card key={i} className="animate-fade-in" style={{ animationDelay: `${i * 0.05}s` } as React.CSSProperties}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full gradient-brand flex items-center justify-center text-white font-bold shrink-0">{s.name[0]}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--color-surface-900)]">{s.name}</p>
                  <p className="text-xs text-[var(--color-surface-400)]">{s.dept} · Batch {s.batch} · {s.interviews} practice sessions</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <ScoreRing score={s.score} size={44} strokeWidth={4} />
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
