import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Star, TrendingUp, Award, CheckCircle2, ArrowRight, Quote, Sparkles, Building2, GraduationCap } from "lucide-react";

export const metadata: Metadata = {
  title: "Success Stories & Placement Outcomes | SkillMatch AI",
  description:
    "See how engineering students improve their interview performance, ATS alignment, and campus placement readiness using SkillMatch AI.",
};

export default function SuccessStoriesPage() {
  const stories = [
    {
      student: "Priya S.",
      department: "Computer Science & Engineering",
      batch: "2026 Batch",
      role: "Software Development Engineer (SDE-1)",
      improvement: "+34% Interview Score",
      sessions: "6 Mock Interviews",
      quote:
        "The live AI interviewer challenged me on operating system fundamentals and asynchronous JavaScript that I had neglected. Practicing with real voice turn-taking eliminated my placement day nervousness completely.",
      tags: ["Data Structures", "System Design", "JavaScript"],
    },
    {
      student: "Arjun M.",
      department: "Artificial Intelligence & Data Science",
      batch: "2026 Batch",
      role: "Associate Data Scientist",
      improvement: "+28% ATS Alignment",
      sessions: "4 Mock Interviews",
      quote:
        "SkillMatch AI's resume analyzer caught that my machine learning project bullets lacked measurable metrics. After applying the recommended rewrites and doing 4 practice sessions, my technical interview confidence skyrocketed.",
      tags: ["Python", "Machine Learning", "SQL", "Pandas"],
    },
    {
      student: "Sneha R.",
      department: "Information Technology",
      batch: "2027 Batch",
      role: "Frontend Engineer",
      improvement: "+42% Communication Clarity",
      sessions: "5 Mock Interviews",
      quote:
        "The question-by-question feedback pointed out where my answers were too rambling. Seeing the model answer examples helped me structure my project explanations using the STAR technique.",
      tags: ["React", "TypeScript", "UI/UX", "REST APIs"],
    },
    {
      student: "Karthik V.",
      department: "Electronics & Communication Engineering",
      batch: "2026 Batch",
      role: "Embedded Systems & IoT Engineer",
      improvement: "+31% Technical Depth",
      sessions: "5 Mock Interviews",
      quote:
        "Coming from ECE and targeting software roles, the skill-gap roadmap showed me exactly which DSA and database concepts to study. The targeted mock rounds made all the difference.",
      tags: ["C++", "Microcontrollers", "RTOS", "Networking"],
    },
  ];

  const outcomes = [
    { value: "4.7 / 5.0", label: "Average Candidate Preparation Rating" },
    { value: "32% Avg.", label: "Score Improvement Across 3+ Sessions" },
    { value: "88% ATS", label: "Average Resume Alignment Post-Audit" },
    { value: "100%", label: "Verified Institutional Domain Scope" },
  ];

  return (
    <div className="bg-[#fcfdfd] text-slate-900 min-h-screen pt-32 pb-24">
      {/* ── Hero ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 text-center mb-16 relative">
        <div
          className="absolute -top-10 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full opacity-20 blur-[120px] pointer-events-none"
          style={{ background: "radial-gradient(circle, #00a884, #38bdf8, transparent 70%)" }}
        />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-[#00a884] text-xs font-semibold mb-6 shadow-xs">
          <Sparkles size={14} />
          Verified Placement Preparation
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
          Student <span className="text-[#00a884]">Success Stories</span> & Outcomes
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
          Real candidate journeys highlighting measurable growth in interview delivery, technical knowledge, and placement readiness.
        </p>
      </section>

      {/* ── Metric Highlights ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {outcomes.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs text-center"
            >
              <div className="text-3xl sm:text-4xl font-extrabold text-[#00a884] mb-2">
                {item.value}
              </div>
              <div className="text-xs text-slate-600 font-medium">{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Stories Cards ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {stories.map((story, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs hover:border-teal-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{story.student}</h3>
                    <div className="text-xs text-slate-500 font-medium">
                      {story.department} · {story.batch}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#00a884] bg-teal-50 border border-teal-200/80 px-3 py-1 rounded-full">
                    {story.improvement}
                  </span>
                </div>

                <div className="text-xs font-semibold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 inline-block mb-4">
                  Target: {story.role} · {story.sessions}
                </div>

                <div className="relative mb-6">
                  <Quote size={20} className="text-teal-200 absolute -top-2.5 -left-1 opacity-70" />
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal pl-5">
                    &ldquo;{story.quote}&rdquo;
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                {story.tags.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Institutional Endorsement ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className="rounded-3xl bg-[#042f2e] text-white p-8 sm:p-12 shadow-xl">
          <GraduationCap size={36} className="text-[#00a884] mx-auto mb-4" />
          <h2 className="text-3xl font-extrabold mb-3">
            Start Your Own Placement Success Story
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto mb-8 font-normal leading-relaxed">
            Practice adaptive interview questions, evaluate your answers, and walk into your campus placement drives fully prepared.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#00a884] hover:bg-[#028b6d] text-white text-sm font-semibold shadow-md transition-all"
          >
            Register with College Email
          </Link>
        </div>
      </section>
    </div>
  );
}
