"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Mic, Plus, Clock, ChevronRight, Sparkles, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ScoreRing } from "@/components/ui/Progress";

interface InterviewSessionSummary {
  id: string;
  userId: string;
  jobRole: string;
  interviewType: string;
  difficulty: string;
  experienceLevel: string;
  durationMinutes: number;
  status: string;
  score: number;
  createdAt: string;
}

export default function InterviewsPage() {
  const [sessions, setSessions] = useState<InterviewSessionSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch("/api/interviews/history");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.sessions)) {
            setSessions(data.sessions);
          }
        }
      } catch (err) {
        console.warn("Interview history note:", err);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-surface-900)]">AI Interviews</h1>
          <p className="text-sm text-[var(--color-surface-500)] mt-0.5">
            Practice face-to-face AI placement sessions, review feedback, and track your progress.
          </p>
        </div>
        <Link href="/interviews/new" className="btn btn-primary btn-md flex items-center gap-1.5 cursor-pointer">
          <Plus size={15} />
          <span>New Interview</span>
        </Link>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col gap-3">
          {[1, 2].map((i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="skeleton h-5 w-48 rounded mb-2" />
              <div className="skeleton h-4 w-32 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Session list (Actual saved persistent sessions) */}
      {!loading && sessions.length > 0 && (
        <div className="flex flex-col gap-4">
          {sessions.map((session, i) => (
            <Link
              key={session.id}
              href={`/interviews/${session.id}/feedback`}
              className="card card-interactive p-5 animate-fade-in block hover:shadow-md transition-all cursor-pointer"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="flex items-center gap-4">
                <ScoreRing score={session.score} size={56} strokeWidth={5} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="text-sm font-semibold text-[var(--color-surface-900)]">
                      {session.jobRole}
                    </span>
                    <Badge variant="brand">{session.interviewType}</Badge>
                    <Badge variant="surface">{session.difficulty}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-[var(--color-surface-400)]">
                    <span className="flex items-center gap-1">
                      <Clock size={11} /> {session.durationMinutes} min
                    </span>
                    <span>{new Date(session.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={session.status === "completed" ? "success" : "surface"}>
                    {session.status}
                  </Badge>
                  <ChevronRight size={16} className="text-[var(--color-surface-300)]" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Empty State when candidate hasn't completed an interview yet */}
      {!loading && sessions.length === 0 && (
        <Card className="text-center py-12 px-6 border-dashed border-2 border-[var(--color-surface-200)] animate-fade-in">
          <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-4 text-emerald-600">
            <Mic size={24} />
          </div>
          <h3 className="text-base font-bold text-[var(--color-surface-900)] mb-1">
            No completed practice sessions yet
          </h3>
          <p className="text-xs text-[var(--color-surface-500)] max-w-sm mx-auto mb-6">
            Complete your first face-to-face AI voice interview to see your comprehensive performance evaluation, scoring, and skill insights saved here.
          </p>
          <Link href="/interviews/new" className="btn btn-primary btn-md inline-flex items-center gap-2">
            <Mic size={15} />
            <span>Start Practice Interview</span>
          </Link>
        </Card>
      )}

      {/* Start new session banner */}
      {!loading && sessions.length > 0 && (
        <Card className="mt-8 text-center py-8 animate-fade-in">
          <div className="w-12 h-12 rounded-full gradient-brand flex items-center justify-center mx-auto mb-3">
            <Sparkles size={20} className="text-white" />
          </div>
          <h3 className="text-base font-semibold text-[var(--color-surface-900)] mb-1">
            Ready for your next round?
          </h3>
          <p className="text-xs text-[var(--color-surface-500)] mb-4 max-w-sm mx-auto">
            Choose a different role or difficulty level to continue sharpening your answers.
          </p>
          <Link href="/interviews/new" className="btn btn-primary btn-md inline-flex items-center gap-2">
            <Mic size={15} />
            <span>Start Another Session</span>
          </Link>
        </Card>
      )}
    </div>
  );
}
