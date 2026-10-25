"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Award,
  CheckCircle,
  XCircle,
  BookOpen,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  TrendingUp,
  MessageSquare,
  Lightbulb,
} from "lucide-react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ScoreRing, Progress } from "@/components/ui/Progress";
import type { FeedbackData } from "@/app/api/analysis/feedback/route";

function ScoreLabel(score: number) {
  if (score >= 85) return { label: "Excellent", variant: "success" as const };
  if (score >= 70) return { label: "Good", variant: "teal" as const };
  if (score >= 55) return { label: "Fair", variant: "warning" as const };
  return { label: "Needs Work", variant: "error" as const };
}

export default function FeedbackPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [expandedQ, setExpandedQ] = useState<number | null>(0);

  useEffect(() => {
    async function load() {
      try {
        const cached = sessionStorage.getItem(`interview-feedback-${sessionId}`);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (parsed && typeof parsed.overall_score === "number") {
              setFeedback(parsed);
              setIsDemo(false);
              setLoading(false);
              return;
            }
          } catch {}
        }

        // Check if persistent feedback exists on the server
        try {
          const checkRes = await fetch(`/api/analysis/feedback?sessionId=${sessionId}`);
          if (checkRes.ok) {
            const checkData = await checkRes.json();
            if (checkData.feedback) {
              setFeedback(checkData.feedback);
              setIsDemo(false);
              setLoading(false);
              return;
            }
          }
        } catch {}

        // Get config and transcript from sessionStorage
        const configRaw = sessionStorage.getItem(`interview-config-${sessionId}`);
        const config = configRaw ? JSON.parse(configRaw) : {};
        const savedTranscript = sessionStorage.getItem(`interview-transcript-${sessionId}`) || "";

        const res = await fetch("/api/analysis/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            transcript: savedTranscript,
            jobRole: config.jobRole ?? "Software Engineer",
            interviewType: config.interviewType ?? "mixed",
            difficulty: config.difficulty ?? "intermediate",
            experienceLevel: config.experienceLevel ?? "junior",
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error ?? "Failed to load feedback");
        }

        const data = await res.json();
        setFeedback(data.feedback);
        setIsDemo(data.demo);
      } catch (e: any) {
        setError(e.message ?? "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="w-12 h-12 rounded-full gradient-brand flex items-center justify-center animate-pulse">
          <Award size={22} className="text-white" />
        </div>
        <p className="text-sm font-medium text-[var(--color-surface-600)]">
          Generating your feedback report…
        </p>
        <div className="skeleton w-64 h-3 rounded-full" />
      </div>
    );
  }

  if (error || !feedback) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
        <AlertCircle size={40} className="text-[var(--color-error-500)] mb-4" />
        <h2 className="text-xl font-bold text-[var(--color-surface-900)] mb-2">
          Feedback unavailable
        </h2>
        <p className="text-sm text-[var(--color-surface-500)] mb-6 max-w-sm">
          {error ?? "Could not load feedback for this session."}
        </p>
        <Link href="/interviews" className="btn btn-primary btn-md">
          Back to Interviews
        </Link>
      </div>
    );
  }

  const radarData = [
    { subject: "Relevance", score: feedback.relevance_score },
    { subject: "Technical", score: feedback.technical_score ?? 0 },
    { subject: "Communication", score: feedback.communication_score },
    { subject: "Problem Solving", score: feedback.problem_solving_score },
    { subject: "Completeness", score: feedback.completeness_score },
  ];

  const scoreInfo = ScoreLabel(feedback.overall_score);

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8 animate-fade-in">
        <Link href="/interviews" className="btn btn-ghost btn-sm">
          <ArrowLeft size={15} /> Back
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[var(--color-surface-900)]">
            Interview Feedback Report
          </h1>
          <p className="text-sm text-[var(--color-surface-500)] mt-0.5">
            AI-generated practice assessment
          </p>
        </div>
        {isDemo && (
          <Badge variant="warning" className="flex items-center gap-1">
            <AlertCircle size={11} /> Demo Report
          </Badge>
        )}
      </div>

      {/* Score hero */}
      <Card className="mb-6 animate-fade-in gradient-hero text-white border-0 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 blur-2xl"
          style={{ background: "radial-gradient(circle, white, transparent)", transform: "translate(30%,-30%)" }} />
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 p-6">
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <svg width={100} height={100} viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={8} />
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.9)"
                  strokeWidth={8} strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 42}
                  strokeDashoffset={2 * Math.PI * 42 * (1 - feedback.overall_score / 100)}
                  transform="rotate(-90 50 50)"
                  style={{ transition: "stroke-dashoffset 1s cubic-bezier(.34,1.56,.64,1)" }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold text-white">{feedback.overall_score}</span>
                <span className="text-[10px] text-white/60 uppercase tracking-wider">/ 100</span>
              </div>
            </div>
            <Badge variant={scoreInfo.variant} className="text-xs">{scoreInfo.label}</Badge>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-bold text-white mb-1">
              Overall Practice Score
            </h2>
            <p className="text-white/70 text-sm leading-relaxed max-w-md">
              This score reflects your practice session performance across relevance, communication,
              problem solving, and completeness. It is an <strong className="text-white">estimate
              for self-improvement only</strong> and is not shared with employers.
            </p>
          </div>
        </div>
      </Card>

      {/* Category scores + Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="animate-fade-in delay-100">
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
          </CardHeader>
          <div className="flex flex-col gap-3">
            {[
              { label: "Relevance", score: feedback.relevance_score },
              { label: "Communication", score: feedback.communication_score },
              { label: "Problem Solving", score: feedback.problem_solving_score },
              { label: "Completeness", score: feedback.completeness_score },
              ...(feedback.technical_score != null
                ? [{ label: "Technical Accuracy", score: feedback.technical_score }]
                : []),
            ].map(({ label, score }) => {
              const color = score >= 75 ? "teal" : score >= 55 ? "brand" : "error";
              return (
                <Progress
                  key={label}
                  label={label}
                  value={score}
                  showLabel
                  color={color as any}
                />
              );
            })}
          </div>
        </Card>

        <Card className="animate-fade-in delay-150">
          <CardHeader>
            <CardTitle>Performance Radar</CardTitle>
          </CardHeader>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
              <PolarGrid stroke="var(--color-surface-200)" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: "var(--color-surface-500)", fontSize: 11 }}
              />
              <Radar
                name="Score"
                dataKey="score"
                stroke="var(--color-brand-500)"
                fill="var(--color-brand-500)"
                fillOpacity={0.15}
                strokeWidth={2}
              />
              <Tooltip
                formatter={(v) => [`${v}/100`, "Score"]}
                contentStyle={{
                  background: "white",
                  border: "1px solid var(--color-surface-200)",
                  borderRadius: "10px",
                  fontSize: "12px",
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Strengths and Weaknesses */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <Card className="animate-fade-in delay-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-[var(--color-success-500)]" />
              <CardTitle>Strengths</CardTitle>
            </div>
          </CardHeader>
          <ul className="flex flex-col gap-2.5">
            {feedback.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-surface-700)]">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-success-500)] mt-2 shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="animate-fade-in delay-250">
          <CardHeader>
            <div className="flex items-center gap-2">
              <XCircle size={16} className="text-[var(--color-error-500)]" />
              <CardTitle>Areas to Improve</CardTitle>
            </div>
          </CardHeader>
          <ul className="flex flex-col gap-2.5">
            {feedback.weaknesses.map((w, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-surface-700)]">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-error-500)] mt-2 shrink-0" />
                {w}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Question-by-question feedback */}
      <Card className="mb-6 animate-fade-in delay-300">
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare size={16} className="text-[var(--color-brand-500)]" />
            <CardTitle>Question-by-Question Feedback</CardTitle>
          </div>
        </CardHeader>
        <div className="flex flex-col gap-3">
          {feedback.question_feedback.map((qf, i) => (
            <div key={i} className="border border-[var(--color-surface-200)] rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedQ(expandedQ === i ? null : i)}
                className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-[var(--color-surface-50)] transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <ScoreRing score={qf.score} size={40} strokeWidth={4} />
                  <span className="text-sm font-medium text-[var(--color-surface-800)] truncate">
                    {qf.question}
                  </span>
                </div>
                {expandedQ === i ? (
                  <ChevronUp size={16} className="text-[var(--color-surface-400)] shrink-0" />
                ) : (
                  <ChevronDown size={16} className="text-[var(--color-surface-400)] shrink-0" />
                )}
              </button>
              {expandedQ === i && (
                <div className="px-4 pb-4 flex flex-col gap-3 border-t border-[var(--color-surface-100)]">
                  <div className="pt-3">
                    <p className="text-xs font-semibold text-[var(--color-surface-400)] uppercase tracking-wider mb-1">
                      Your Answer Summary
                    </p>
                    <p className="text-sm text-[var(--color-surface-700)]">{qf.answer_summary}</p>
                  </div>
                  <div className="bg-[var(--color-brand-50)] rounded-xl p-3">
                    <p className="text-xs font-semibold text-[var(--color-brand-600)] uppercase tracking-wider mb-1">
                      Feedback
                    </p>
                    <p className="text-sm text-[var(--color-brand-800)]">{qf.feedback}</p>
                  </div>
                  <div className="bg-[var(--color-success-50)] rounded-xl p-3">
                    <p className="text-xs font-semibold text-[var(--color-success-600)] uppercase tracking-wider mb-1">
                      Example Improved Answer
                    </p>
                    <p className="text-sm text-[var(--color-success-800)] leading-relaxed">
                      {qf.improved_answer}
                    </p>
                    <p className="text-[10px] text-[var(--color-success-600)] mt-2">
                      ⚠ AI-generated suggestion. Verify accuracy before using.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Recommendations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <Card className="animate-fade-in delay-350">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpen size={16} className="text-[var(--color-teal-500)]" />
              <CardTitle>Topics to Study</CardTitle>
            </div>
          </CardHeader>
          <div className="flex flex-wrap gap-2">
            {feedback.recommended_topics.map((t, i) => (
              <Badge key={i} variant="teal">{t}</Badge>
            ))}
          </div>
        </Card>

        <Card className="animate-fade-in delay-400">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lightbulb size={16} className="text-[var(--color-warning-500)]" />
              <CardTitle>Next Session</CardTitle>
            </div>
          </CardHeader>
          <p className="text-sm text-[var(--color-surface-700)] leading-relaxed">
            {feedback.next_session_suggestion}
          </p>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 animate-fade-in delay-400">
        <Link href="/interviews/new" className="btn btn-primary btn-lg flex-1 justify-center">
          <TrendingUp size={16} /> Practice Again
        </Link>
        <Link href="/interviews" className="btn btn-secondary btn-lg flex-1 justify-center">
          View History
        </Link>
        <Link href="/jobs" className="btn btn-outline btn-lg flex-1 justify-center">
          Find Matching Jobs
        </Link>
      </div>
    </div>
  );
}
