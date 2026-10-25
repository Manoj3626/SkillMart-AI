"use client";

import React from "react";
import Link from "next/link";
import {
  Mic,
  FileText,
  Briefcase,
  TrendingUp,
  ArrowRight,
  ChevronRight,
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  GraduationCap,
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Progress, ScoreRing } from "@/components/ui/Progress";
import { Badge } from "@/components/ui/Badge";

const quickActions = [
  {
    href: "/interviews/new",
    icon: Mic,
    label: "Start AI Interview",
    desc: "Practice with your voice",
    color: "brand",
    primary: true,
  },
  {
    href: "/resume",
    icon: FileText,
    label: "Analyze Resume",
    desc: "Get alignment score",
    color: "teal",
    primary: false,
  },
  {
    href: "/jobs",
    icon: Briefcase,
    label: "Discover Jobs",
    desc: "Matched to your skills",
    color: "violet",
    primary: false,
  },
  {
    href: "/skills",
    icon: TrendingUp,
    label: "View Skill Gaps",
    desc: "Close missing skills",
    color: "teal",
    primary: false,
  },
];

// Demo data shown to new users — clearly labeled
const demoRecentInterviews = [
  { role: "Software Engineer", type: "Technical", score: 72, date: "2 days ago", status: "completed" },
  { role: "Frontend Developer", type: "Mixed", score: 65, date: "5 days ago", status: "completed" },
];

export default function DashboardPage() {
  const { profile } = useAuth();
  const firstName = profile?.full_name?.split(" ")[0] ?? "there";
  const isNew = true; // In production: check for real interview/resume data

  const [studentProfile, setStudentProfile] = React.useState<any>(profile?.student_profile || null);
  const [currentDateStr, setCurrentDateStr] = React.useState<string>("");

  React.useEffect(() => {
    setCurrentDateStr(
      new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user?.studentProfile) {
          setStudentProfile(data.user.studentProfile);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                Karpagam College of Engineering
              </span>
              <span className="inline-flex items-center gap-1 text-emerald-700 font-medium text-xs">
                <CheckCircle size={12} /> Verified Student
              </span>
            </div>
            <h1 className="text-2xl font-bold text-[var(--color-surface-900)]">
              Hello, {firstName} 👋
            </h1>
            <p className="text-sm text-[var(--color-surface-500)] mt-0.5 min-h-[20px]">
              {currentDateStr || "Welcome to your placement preparation portal"}
            </p>
          </div>
          <Link href="/interviews/new" className="btn btn-primary btn-md hidden sm:flex">
            <Mic size={15} />
            Practice Interview
          </Link>
        </div>
      </div>

      {/* College Identity Bar */}
      {studentProfile && (
        <div className="mb-6 bg-white border border-emerald-100 rounded-2xl p-4 sm:p-5 shadow-sm animate-fade-in flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
              <GraduationCap size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900 text-sm">{studentProfile.fullName}</h3>
                <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                  {studentProfile.collegeId || studentProfile.rollNumber}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {studentProfile.department} &bull; {studentProfile.degree} &bull; {studentProfile.academicYear} (Class of {studentProfile.graduationYear})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="border-l border-gray-200 pl-3 hidden md:block">
              <span className="text-gray-400 block">College ID / Register No.</span>
              <span className="font-mono font-semibold text-gray-800">{studentProfile.collegeId || studentProfile.rollNumber}</span>
            </div>
            <div className="border-l border-gray-200 pl-3">
              <span className="text-gray-400 block">Placement Status</span>
              <span className="font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle size={12} /> Active & Eligible
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Onboarding banner for new users */}
      {isNew && (
        <div className="mb-6 gradient-brand rounded-2xl p-6 text-white animate-fade-in relative overflow-hidden">
          <div
            className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 blur-2xl"
            style={{ background: "radial-gradient(circle, white, transparent)", transform: "translate(30%, -30%)" }}
          />
          <div className="relative z-10">
            <h2 className="font-bold text-lg mb-2">Welcome to SkillMatch AI! 🎉</h2>
            <p className="text-white/80 text-sm mb-4 max-w-lg">
              Start with a quick AI interview practice to calibrate your performance, or upload your resume for an alignment score.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/interviews/new" className="btn btn-white btn-sm">
                Start Your First Interview
                <ArrowRight size={14} />
              </Link>
              <Link href="/resume" className="btn btn-sm glass border-white/20 text-white hover:bg-white/10">
                Upload Resume
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Profile completion */}
      <Card className="mb-6 animate-fade-in delay-100">
        <CardHeader>
          <CardTitle>Profile Completion</CardTitle>
          <span className="text-sm font-semibold text-[var(--color-brand-600)]">40%</span>
        </CardHeader>
        <Progress value={40} showLabel={false} className="mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Profile Info", done: true },
            { label: "Skills Added", done: false },
            { label: "Resume Uploaded", done: false },
            { label: "First Interview", done: false },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              {item.done ? (
                <CheckCircle size={14} className="text-[var(--color-success-500)] shrink-0" />
              ) : (
                <div className="w-3.5 h-3.5 rounded-full border-2 border-[var(--color-surface-300)] shrink-0" />
              )}
              <span
                className={`text-xs font-medium ${
                  item.done
                    ? "text-[var(--color-surface-700)]"
                    : "text-[var(--color-surface-400)]"
                }`}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {quickActions.map((action, i) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className={`card card-interactive p-5 animate-fade-in flex flex-col gap-3 ${
                action.primary
                  ? "gradient-brand text-white border-0 shadow-lg"
                  : ""
              }`}
              style={{ animationDelay: `${i * 0.06 + 0.15}s` }}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center`}
                style={
                  action.primary
                    ? { background: "rgba(255,255,255,0.2)" }
                    : { background: `var(--color-${action.color}-50)` }
                }
              >
                <Icon
                  size={18}
                  style={
                    action.primary
                      ? { color: "white" }
                      : { color: `var(--color-${action.color}-600)` }
                  }
                />
              </div>
              <div>
                <div
                  className={`text-sm font-semibold ${
                    action.primary
                      ? "text-white"
                      : "text-[var(--color-surface-900)]"
                  }`}
                >
                  {action.label}
                </div>
                <div
                  className={`text-xs mt-0.5 ${
                    action.primary
                      ? "text-white/70"
                      : "text-[var(--color-surface-400)]"
                  }`}
                >
                  {action.desc}
                </div>
              </div>
              <ChevronRight
                size={14}
                className={action.primary ? "text-white/70 mt-auto self-end" : "text-[var(--color-surface-300)] mt-auto self-end"}
              />
            </Link>
          );
        })}
      </div>

      {/* Bottom grid: Recent interviews + Skill overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Interviews */}
        <div className="lg:col-span-2">
          <Card className="animate-fade-in delay-200">
            <CardHeader>
              <CardTitle>Recent Interviews</CardTitle>
              <Link
                href="/interviews"
                className="text-xs font-semibold text-[var(--color-brand-600)] hover:underline flex items-center gap-1"
              >
                View all <ChevronRight size={12} />
              </Link>
            </CardHeader>

            {demoRecentInterviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-12 h-12 rounded-full bg-[var(--color-surface-100)] flex items-center justify-center mb-3">
                  <Mic size={22} className="text-[var(--color-surface-300)]" />
                </div>
                <p className="text-sm font-medium text-[var(--color-surface-600)] mb-1">
                  No interviews yet
                </p>
                <p className="text-xs text-[var(--color-surface-400)] mb-4">
                  Start practicing to see your history here
                </p>
                <Link href="/interviews/new" className="btn btn-primary btn-sm">
                  Start First Interview
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-2 flex items-center gap-2">
                  <AlertCircle size={12} className="text-[var(--color-warning-500)]" />
                  <span className="text-xs text-[var(--color-warning-600)] font-medium">
                    Demo data — connect Supabase to see real records
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  {demoRecentInterviews.map((interview, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 p-3 rounded-xl bg-[var(--color-surface-50)] hover:bg-[var(--color-surface-100)] transition-colors cursor-pointer"
                    >
                      <ScoreRing score={interview.score} size={52} strokeWidth={5} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-[var(--color-surface-900)]">
                          {interview.role}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="surface">{interview.type}</Badge>
                          <span className="text-xs text-[var(--color-surface-400)] flex items-center gap-1">
                            <Clock size={10} /> {interview.date}
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-[var(--color-surface-300)]" />
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>
        </div>

        {/* Skill Overview */}
        <div>
          <Card className="animate-fade-in delay-300">
            <CardHeader>
              <CardTitle>Skill Overview</CardTitle>
              <Link
                href="/skills"
                className="text-xs font-semibold text-[var(--color-brand-600)] hover:underline flex items-center gap-1"
              >
                View gaps <ChevronRight size={12} />
              </Link>
            </CardHeader>

            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="w-12 h-12 rounded-full bg-[var(--color-surface-100)] flex items-center justify-center mb-3">
                <Target size={22} className="text-[var(--color-surface-300)]" />
              </div>
              <p className="text-sm font-medium text-[var(--color-surface-600)] mb-1">
                No skills added
              </p>
              <p className="text-xs text-[var(--color-surface-400)] mb-4">
                Add skills to see gap analysis
              </p>
              <Link href="/skills" className="btn btn-outline btn-sm">
                Add Skills
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
