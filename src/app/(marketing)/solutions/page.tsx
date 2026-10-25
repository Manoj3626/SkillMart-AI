import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import {
  Mic,
  FileText,
  Brain,
  TrendingUp,
  GraduationCap,
  Briefcase,
  CheckCircle,
  ArrowRight,
  Shield,
  Award,
  Sparkles,
  Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Solutions — AI Mock Interviews & Placement Readiness | SkillMatch AI",
  description:
    "Explore our complete suite of AI interview solutions for students, colleges, and placement cells. Real-time voice interviews, resume analysis, and skill gap roadmaps.",
};

export default function SolutionsPage() {
  const solutions = [
    {
      icon: Mic,
      tag: "Live Voice Practice",
      title: "AI Voice Mock Interviews for HR & Technical Roles",
      desc: "Speak naturally using your microphone to an adaptive AI interviewer. Practice role-specific questions for Software Engineering, Data Science, Fullstack, DevOps, and Product Management.",
      bullets: [
        "Natural turn-taking conversation with real-time speech recognition",
        "Role-tailored technical questions from basic concepts to system design",
        "Behavioral STAR-framework evaluation and communication clarity scoring",
      ],
    },
    {
      icon: FileText,
      tag: "ATS Optimization",
      title: "Intelligent Resume Analyzer & Alignment Score",
      desc: "Upload your CV in PDF or DOCX format to receive instant ATS compatibility scores, missing keyword detection, and line-by-line rewrite suggestions.",
      bullets: [
        "ATS keyword density and formatting audit for corporate placement portals",
        "Role alignment scoring comparing your resume to target job descriptions",
        "Quantified achievement rewrites using active verbs and metrics",
      ],
    },
    {
      icon: Brain,
      tag: "Performance Intelligence",
      title: "Granular Feedback & Better Model Answers",
      desc: "Every interview generates a comprehensive performance report breaking down technical depth, problem-solving structure, and speech delivery.",
      bullets: [
        "Per-question feedback highlighting strengths and specific improvement areas",
        "Curated model answers demonstrating ideal structuring and depth",
        "Visual competency radar charts tracking improvement across sessions",
      ],
    },
    {
      icon: TrendingUp,
      tag: "Career Growth",
      title: "Skill-Gap Analysis & Personalized Learning Roadmaps",
      desc: "Identify exactly which skills you are missing for your target companies and follow structured roadmaps with free, high-yield practice resources.",
      bullets: [
        "Automated comparison of current proficiencies against industry benchmarks",
        "Prioritized learning milestones to bridge critical gaps before campus drives",
        "Curated practice tasks and verification assessments",
      ],
    },
    {
      icon: GraduationCap,
      tag: "Campus Institutional Portal",
      title: "College Placement Cell Administration & Analytics",
      desc: "Empower academic departments and placement officers to monitor student readiness, verify student records, and organize targeted pre-placement training.",
      bullets: [
        "Department-wise cohort tracking across CSE, IT, AIDS, ECE, and other branches",
        "Verified registration records with official College ID / Register No. validation",
        "Batch export readiness metrics to share with visiting corporate recruiters",
      ],
    },
    {
      icon: Briefcase,
      tag: "Placement Readiness",
      title: "Company-Specific Drive Preparation",
      desc: "Prepare for specific tier-1 IT services, product companies, and fast-growing tech startups with curated question sets and typical interview formats.",
      bullets: [
        "Practice rounds simulating actual 20-minute screening interviews",
        "Technical problem-solving and live behavioral situation responses",
        "Integrity monitoring simulating real proctored assessment environments",
      ],
    },
  ];

  return (
    <div className="bg-[#fcfdfd] text-slate-900 min-h-screen pt-32 pb-24">
      {/* ── Hero ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 text-center mb-20 relative">
        <div
          className="absolute -top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-25 blur-[120px] pointer-events-none"
          style={{ background: "radial-gradient(circle, #00a884, #38bdf8, transparent 70%)" }}
        />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-[#00a884] text-xs font-semibold mb-6 shadow-xs">
          <Sparkles size={14} />
          Complete Placement Solutions
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
          Empowering Job-Ready Talent <br />
          with <span className="text-[#00a884]">End-to-End</span> Placement Prep
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          From live AI voice mock interviews and ATS resume audits to institutional cohort tracking, discover how SkillMatch AI elevates candidate readiness.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/signup"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full bg-[#042f2e] hover:bg-[#064e3b] text-white text-sm font-semibold shadow-md transition-all group"
          >
            <span>Start Free Practice</span>
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            href="/how-it-works"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold border border-slate-200 shadow-xs transition-all"
          >
            <span>How It Works</span>
          </Link>
        </div>
      </section>

      {/* ── Solutions Grid ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {solutions.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-teal-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#00a884] flex items-center justify-center shadow-xs">
                      <Icon size={24} />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
                      {item.tag}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-3 leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-sm text-slate-600 leading-relaxed mb-6 font-normal">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <ul className="space-y-2.5">
                    {item.bullets.map((b, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-600">
                        <CheckCircle size={15} className="text-[#00a884] shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Institutional Banner ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-20">
        <div className="rounded-3xl bg-gradient-to-r from-[#042f2e] to-[#064e3b] text-white p-8 sm:p-12 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="relative z-10 max-w-xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#00a884] bg-white/10 px-3 py-1 rounded-full inline-block mb-4">
              Institution & Placement Cell
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight">
              Ready to deploy SkillMatch AI for your campus?
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              Empower your students with realistic mock interviews before corporate recruitment drives commence. Connect with our campus team for customized setup.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row gap-3.5 shrink-0">
            <Link
              href="/for-colleges"
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-full bg-[#00a884] hover:bg-[#028b6d] text-white text-sm font-semibold shadow-md transition-all"
            >
              Learn More for Colleges
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-semibold border border-white/20 transition-all"
            >
              Student Sign Up
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
