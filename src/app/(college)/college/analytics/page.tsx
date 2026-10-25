"use client";
import React from "react";
import { BarChart2 } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";

export default function CollegeAnalyticsPage() {
  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-[var(--color-surface-900)]">Analytics</h1>
        <p className="text-sm text-[var(--color-surface-500)] mt-0.5">Aggregate placement data and skill trends for your institution.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Overall Placement Rate", value: 62, color: "brand" },
          { label: "Avg Practice Score", value: 71, color: "teal" },
          { label: "Students Practicing", value: 84, color: "violet" },
        ].map((stat) => (
          <Card key={stat.label} className="animate-fade-in">
            <p className="text-xs text-[var(--color-surface-400)] mb-2">{stat.label}</p>
            <div className="text-3xl font-extrabold text-[var(--color-surface-900)] mb-3">{stat.value}%</div>
            <Progress label="" value={stat.value} color={stat.color as any} />
          </Card>
        ))}
      </div>
      <Card className="animate-fade-in delay-100">
        <CardHeader><CardTitle>Placement by Department</CardTitle></CardHeader>
        {[
          { dept: "CS/IT", rate: 76 },
          { dept: "ECE", rate: 59 },
          { dept: "Mech", rate: 45 },
          { dept: "Civil", rate: 38 },
        ].map(({ dept, rate }) => (
          <div key={dept} className="mb-3">
            <Progress label={`${dept} — ${rate}%`} value={rate} showLabel color="teal" />
          </div>
        ))}
      </Card>
    </div>
  );
}
