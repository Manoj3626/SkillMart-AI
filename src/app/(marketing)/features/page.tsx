import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import {
  Mic,
  FileText,
  Brain,
  TrendingUp,
  Shield,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  Zap,
  Clock,
  Volume2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Platform Features — Live Voice AI & Placement Intelligence | SkillMatch AI",
  description:
    "Explore the full feature suite: live conversational AI voice interviews, real-time speech recognition, ATS resume analyzer, and skill gap roadmaps.",
};

export default function FeaturesPage() {
  const coreFeatures = [
    {
      icon: Mic,
      tag: "Live Conversational AI",
      title: "Real-Time AI Voice Interviewer",
      desc: "Speak naturally into your microphone. The AI interviewer asks role-specific technical and behavioral questions aloud, listens attentively, and dynamically follows up based on your responses.",
      features: [
        "Audible speech playback powered by advanced speech synthesis",
        "Live microphone voice-to-text with speech recognition",
        "Typed answer fallback support when microphone is unavailable",
        "Adaptive follow-ups probing technical depth and project implementation",
      ],
    },
    {
      icon: FileText,
      tag: "ATS Diagnostics",
      title: "Resume Analyzer & Target Role Alignment",
      desc: "Upload your resume in PDF, DOCX, or TXT format. Receive an automated ATS formatting breakdown, missing keyword detection, and actionable bullet rewrites.",
      features: [
        "Calculates overall ATS compatibility score (0–100)",
        "Detects missing keywords required for target job descriptions",
        "Actionable line rewrites with quantified impact metrics",
        "Section-by-section audit for Summary, Experience, Skills, and Projects",
      ],
    },
    {
      icon: Brain,
      tag: "Objective Scoring",
      title: "In-Depth Post-Interview Feedback",
      desc: "Receive structured scorecards evaluating your technical accuracy, communication clarity, problem-solving approach, and answer completeness.",
      features: [
        "Competency radar charts visualizing proficiency across key dimensions",
        "Question-by-question critique highlighting strong points and mistakes",
        "Curated model answers illustrating ideal structure and terminology",
        "Personalized placement readiness action items",
      ],
    },
    {
      icon: TrendingUp,
      tag: "Gap Bridging",
      title: "Skill-Gap Roadmap & Free Resources",
      desc: "Compare your current verified skills against industry benchmarks and receive a step-by-step roadmap with free high-yield learning resources.",
      features: [
        "Priority skill-gap diagnosis tailored to target engineering roles",
        "Curated tutorials, documentation, and practice problem sets",
        "Milestone tracking to prepare before campus recruitment season",
        "Progressive re-testing to verify skill acquisition",
      ],
    },
    {
      icon: Shield,
      tag: "Focused Integrity",
      title: "Full-Screen Proctored Practice Mode",
      desc: "Enter a distraction-free, full-screen interview room designed to simulate genuine proctored campus placement assessments.",
      features: [
        "Dedicated Fullscreen API integration with safe exit controls",
        "Copy/paste restrictions on answer inputs to simulate real test conditions",
        "Tab switch and visibility change monitoring with polite reminder alerts",
        "Private, encrypted candidate audio and transcript handling",
      ],
    },
    {
      icon: Zap,
      tag: "Campus Architecture",
      title: "Verified College Authentication Scope",
      desc: "Purpose-built for Karpagam College of Engineering with institutional email verification, official College ID / Register No. validation, and role-based access.",
      features: [
        "Domain-enforced registration (@kce.ac.in) with multi-factor OTP",
        "Official College ID / Register No. uniqueness validation",
        "Placement coordinator approval portal and cohort tracking",
        "Secure session tokens with cookie-based authorization",
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
          Complete Platform Architecture
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
          Everything You Need to <br />
          <span className="text-[#00a884]">Ace Campus Placements</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
          Explore the state-of-the-art tools built into SkillMatch AI: spoken voice turn-taking, ATS resume diagnostics, and objective candidate evaluations.
        </p>
      </section>

      {/* ── Feature Cards ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {coreFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs hover:border-teal-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#00a884] flex items-center justify-center shadow-xs">
                      <Icon size={24} />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
                      {feat.tag}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-3">{feat.title}</h3>
                  <p className="text-sm text-slate-600 font-normal leading-relaxed mb-6">
                    {feat.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2.5">
                  {feat.features.map((item, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-600">
                      <CheckCircle2 size={15} className="text-[#00a884] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
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
            Experience the AI Interviewer Firsthand
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto mb-8 font-normal">
            Sign up with your college email and start practicing for your next interview in under two minutes.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#00a884] hover:bg-[#028b6d] text-white text-sm font-semibold shadow-md transition-all"
          >
            Start Free Practice Now
          </Link>
        </div>
      </section>
    </div>
  );
}
