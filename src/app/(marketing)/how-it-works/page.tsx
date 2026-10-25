import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import {
  UserPlus,
  FileSearch,
  Mic2,
  Award,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Brain,
  Video,
  FileCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "How It Works — Step-by-Step Candidate Placement Guide | SkillMatch AI",
  description:
    "See how SkillMatch AI guides you from initial resume audit to live voice mock interviews and detailed placement feedback.",
};

export default function HowItWorksPage() {
  const steps = [
    {
      number: "01",
      icon: UserPlus,
      title: "Register & Verify Your Student Profile",
      desc: "Sign up using your official college email address (@kce.ac.in). Verify your account with a secure one-time passcode (OTP) and input your official College ID / Register No.",
      highlights: [
        "Instant OTP delivery to your student inbox",
        "Official Karpagam College of Engineering placement scope",
        "Automatic allocation of 100 free practice credits",
      ],
    },
    {
      number: "02",
      icon: FileSearch,
      title: "Upload & Audit Your Resume",
      desc: "Upload your resume in PDF or DOCX format. Our ATS intelligence engine scans your document, calculates an alignment score, flags missing keywords, and recommends quantified bullet rewrites.",
      highlights: [
        "Real-time ATS compatibility scoring (0–100)",
        "Automated comparison with target job roles and recruiter requirements",
        "Line-by-line rewrite suggestions using active metrics",
      ],
    },
    {
      number: "03",
      icon: Mic2,
      title: "Engage in Live AI Voice Interviews",
      desc: "Enter the focused, full-screen interview studio. The AI interviewer greets you, asks role-specific questions aloud, listens to your answers through your microphone, and adapts subsequent follow-ups.",
      highlights: [
        "Spoken audio questions with browser speech synthesis backup",
        "Microphone speech-to-text with typed fallback option",
        "Focused proctored practice mode with integrity alerts",
      ],
    },
    {
      number: "04",
      icon: Award,
      title: "Review Scorecards & Practice Model Answers",
      desc: "Receive an immediate, multi-dimensional evaluation report. Examine your overall score, competency radar chart, answer-by-answer critique, and ideal model answers.",
      highlights: [
        "Scores across technical knowledge, communication clarity, and problem-solving",
        "Specific suggestions on how to improve each individual answer",
        "Customized skill-gap roadmap to study before real recruitment drives",
      ],
    },
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
          Student Placement Workflow
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
          How <span className="text-[#00a884]">SkillMatch AI</span> Works
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
          A seamless 4-step process designed to turn college engineering students into confident, job-ready candidates.
        </p>
      </section>

      {/* ── Steps Timeline ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-24">
        <div className="space-y-12">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-xs hover:border-teal-300 transition-all flex flex-col md:flex-row gap-8 items-start"
              >
                <div className="flex items-center gap-4 shrink-0">
                  <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-100 text-[#00a884] flex items-center justify-center font-black text-xl shadow-xs">
                    {step.number}
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-[#042f2e] text-white flex items-center justify-center shadow-xs md:hidden">
                    <Icon size={22} />
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                      {step.title}
                    </h3>
                  </div>

                  <p className="text-sm text-slate-600 font-normal leading-relaxed mb-6">
                    {step.desc}
                  </p>

                  <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 space-y-2">
                    {step.highlights.map((h, hIdx) => (
                      <div key={hIdx} className="flex items-start gap-2.5 text-xs text-slate-700">
                        <CheckCircle2 size={15} className="text-[#00a884] shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className="rounded-3xl bg-[#042f2e] text-white p-8 sm:p-12 shadow-xl">
          <h2 className="text-3xl font-extrabold mb-3">
            Start Your Interview Preparation Today
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto mb-8 font-normal">
            No complicated setup. Upload your resume and practice your first AI mock interview in minutes.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#00a884] hover:bg-[#028b6d] text-white text-sm font-semibold shadow-md transition-all"
          >
            Create Your Student Profile
          </Link>
        </div>
      </section>
    </div>
  );
}
