"use client";

import React from "react";
import Link from "next/link";
import { Mic, Plus, Clock, ChevronRight, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ScoreRing } from "@/components/ui/Progress";

// Demo data — labeled clearly
const demoSessions = [
  {
    id: "demo-1",
    role: "Software Engineer",
    type: "Technical",
    difficulty: "Intermediate",
    score: 72,
    duration: "20 min",
    date: "Oct 11, 2026",
    status: "completed",
  },
  {
    id: "demo-2",
    role: "Frontend Developer",
    type: "Mixed",
    difficulty: "Beginner",
    score: 65,
    duration: "15 min",
    date: "Oct 8, 2026",
    status: "completed",
  },
];

export default function InterviewsPage() {
  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-surface-900)]">AI Interviews</h1>
          <p className="text-sm text-[var(--color-surface-500)] mt-0.5">
            Practice, review feedback, and track your progress.
          </p>
        </div>
        <Link href="/interviews/new" className="btn btn-primary btn-md">
          <Plus size={15} />
          New Interview
        </Link>
      </div>

      {/* Demo notice */}
      <div className="flex items-center gap-3 p-4 bg-[var(--color-warning-50)] border border-[var(--color-warning-100)] rounded-xl mb-6 animate-fade-in delay-100">
        <AlertCircle size={16} className="text-[var(--color-warning-600)] shrink-0" />
        <p className="text-sm text-[var(--color-warning-700)]">
          <strong>Demo data shown below.</strong> Connect Supabase to see your real interview history.
        </p>
      </div>

      {/* Session list */}
      <div className="flex flex-col gap-4">
        {demoSessions.map((session, i) => (
          <Link
            key={session.id}
            href={`/interviews/${session.id}/feedback`}
            className="card card-interactive p-5 animate-fade-in block hover:shadow-md transition-all"
            style={{ animationDelay: `${i * 0.08 + 0.15}s` }}
          >
            <div className="flex items-center gap-4">
              <ScoreRing score={session.score} size={56} strokeWidth={5} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <span className="text-sm font-semibold text-[var(--color-surface-900)]">
                    {session.role}
                  </span>
                  <Badge variant="brand">{session.type}</Badge>
                  <Badge variant="surface">{session.difficulty}</Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-[var(--color-surface-400)]">
                  <span className="flex items-center gap-1">
                    <Clock size={11} /> {session.duration}
                  </span>
                  <span>{session.date}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={session.status === "completed" ? "success" : "surface"}
                >
                  {session.status}
                </Badge>
                <ChevronRight size={16} className="text-[var(--color-surface-300)]" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Start first real interview CTA */}
      <Card className="mt-8 text-center py-10 animate-fade-in delay-300">
        <div className="w-14 h-14 rounded-full gradient-brand flex items-center justify-center mx-auto mb-4">
          <Mic size={24} className="text-white" />
        </div>
        <h3 className="text-lg font-semibold text-[var(--color-surface-900)] mb-2">
          Start a real practice session
        </h3>
        <p className="text-sm text-[var(--color-surface-500)] mb-5 max-w-sm mx-auto">
          Configure your role, difficulty, and interview type to begin a live AI voice interview.
        </p>
        <Link href="/interviews/new" className="btn btn-primary btn-lg">
          <Mic size={16} />
          Start Interview
        </Link>
      </Card>
    </div>
  );
}
