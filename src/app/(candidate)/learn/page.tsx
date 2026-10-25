"use client";
import React from "react";
import { BookOpen, ExternalLink } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const learningResources = [
  {
    skill: "System Design",
    priority: "High",
    resources: [
      { title: "System Design Primer", url: "https://github.com/donnemartin/system-design-primer", free: true },
      { title: "Grokking System Design", url: "https://www.designgurus.io/", free: false },
    ],
  },
  {
    skill: "Data Structures & Algorithms",
    priority: "High",
    resources: [
      { title: "LeetCode (Free)", url: "https://leetcode.com", free: true },
      { title: "CS50 on edX", url: "https://cs50.harvard.edu/", free: true },
    ],
  },
  {
    skill: "TypeScript",
    priority: "Medium",
    resources: [
      { title: "Official TypeScript Handbook", url: "https://www.typescriptlang.org/docs/", free: true },
      { title: "TypeScript Deep Dive", url: "https://basarat.gitbook.io/typescript/", free: true },
    ],
  },
];

export default function LearnPage() {
  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-surface-900)]">Learning Recommendations</h1>
        <p className="text-sm text-[var(--color-surface-500)] mt-0.5">
          Curated resources to close your skill gaps for your target roles.
        </p>
      </div>

      <div className="mb-4 p-3 bg-[var(--color-brand-50)] border border-[var(--color-brand-100)] rounded-xl text-xs text-[var(--color-brand-700)]">
        Sample resources shown. Add your target job role and skills for personalised recommendations.
      </div>

      <div className="flex flex-col gap-4">
        {learningResources.map((item, i) => (
          <Card key={item.skill} className="animate-fade-in" style={{ animationDelay: `${i * 0.08}s` } as React.CSSProperties}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>{item.skill}</CardTitle>
                <Badge variant={item.priority === "High" ? "error" : "warning"}>
                  {item.priority} Priority
                </Badge>
              </div>
            </CardHeader>
            <div className="flex flex-col gap-2">
              {item.resources.map((r) => (
                <a
                  key={r.title}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-surface-50)] hover:bg-[var(--color-surface-100)] transition-colors group"
                >
                  <BookOpen size={15} className="text-[var(--color-brand-500)] shrink-0" />
                  <span className="text-sm font-medium text-[var(--color-surface-800)] flex-1">{r.title}</span>
                  <div className="flex items-center gap-2">
                    {r.free && <Badge variant="success">Free</Badge>}
                    <ExternalLink size={13} className="text-[var(--color-surface-300)] group-hover:text-[var(--color-brand-500)] transition-colors" />
                  </div>
                </a>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
