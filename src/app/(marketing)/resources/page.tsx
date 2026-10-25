import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import {
  BookOpen,
  FileCheck,
  MessageSquare,
  Sparkles,
  HelpCircle,
  Lightbulb,
  Video,
  ArrowRight,
  Code2,
  CheckCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Placement Preparation Resources & Guides | SkillMatch AI",
  description:
    "Free interview guides, HR interview handbooks, resume checklists, and technical preparation resources for campus placements.",
};

export default function ResourcesPage() {
  const categories = [
    {
      icon: MessageSquare,
      title: "HR & Behavioral Interview Prep",
      desc: "Master common behavioral prompts, introduce yourself with confidence, and structure your responses using the STAR methodology.",
      articles: [
        "How to Answer 'Tell Me About Yourself' in Campus Drives",
        "The STAR Framework: Structuring Project Stories for Maximum Impact",
        "Handling Weaknesses and Gaps Without Damaging Your Candidacy",
        "Top 25 Behavioral Questions Asked by IT Services and Product Firms",
      ],
    },
    {
      icon: Code2,
      title: "Technical Interview Roadmaps",
      desc: "Role-specific question sets covering Data Structures & Algorithms, OOPs, Database Management, and Fullstack Web Architectures.",
      articles: [
        "Core CS Fundamentals: OS, DBMS, Computer Networks Revision Sheet",
        "Top 50 Data Structures & Algorithms Questions for Screening Rounds",
        "System Design & Architecture Basics for Graduate Engineering Roles",
        "SQL Query Walkthroughs: Joins, Window Functions, and Indexing",
      ],
    },
    {
      icon: FileCheck,
      title: "ATS Resume Writing Handbook",
      desc: "Create clean, readable resumes that pass applicant tracking systems and immediately capture technical recruiter attention.",
      articles: [
        "The ATS-Friendly Resume Template: Formatting Rules & Pitfalls",
        "How to Quantify Your Academic and Final-Year Project Outcomes",
        "Action Verbs Cheat Sheet: Transforming Passive Bullet Points",
        "Technical Skills Categorization: Languages vs Frameworks vs Tools",
      ],
    },
    {
      icon: Video,
      title: "Live Video & Voice Interview Etiquette",
      desc: "Best practices for camera framing, voice modulation, microphone checks, and maintaining calm under pressure.",
      articles: [
        "Microphone & Camera Setup: Ensuring Clear Audio & Natural Eye Contact",
        "Pacing and Pausing: Avoiding Filler Words ('Um', 'Like', 'Actually')",
        "Dealing with Technical Glitches and Network Freezes Gracefully",
        "What to Do When You Do Not Know the Answer to a Question",
      ],
    },
  ];

  const quickTips = [
    {
      title: "Know Your Final-Year Project Inside Out",
      detail:
        "Interviewers focus heavily on your individual contribution. Be prepared to explain architecture choices, database schema, trade-offs, and what you would do differently.",
    },
    {
      title: "Think Out Loud During Technical Rounds",
      detail:
        "Recruiters evaluate your problem-solving thought process, not just the final code. Communicate assumptions, clarify constraints, and discuss edge cases before coding.",
    },
    {
      title: "Tailor Your Story to the Company's Tech Stack",
      detail:
        "Research the hiring company's products and primary technologies. Mentioning relevant frameworks or protocols shows genuine preparation and initiative.",
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
          <BookOpen size={14} />
          Placement Knowledge Hub
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
          Placement Preparation <span className="text-[#00a884]">Resources</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
          Handbooks, technical question guides, and interview strategies curated for college engineering students.
        </p>
      </section>

      {/* ── High-Impact Tips ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-20">
        <div className="rounded-3xl bg-teal-50/70 border border-teal-200/70 p-6 sm:p-8">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 rounded-lg bg-[#00a884] text-white flex items-center justify-center">
              <Lightbulb size={18} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Top Placement Day Recommendations
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickTips.map((tip, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-teal-100 shadow-2xs">
                <h3 className="text-sm font-bold text-slate-900 mb-2">{tip.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">{tip.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Resource Guides Grid ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs hover:border-teal-300 transition-all"
              >
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#00a884] flex items-center justify-center shadow-xs">
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{cat.title}</h3>
                    <p className="text-xs text-slate-500 font-normal">{cat.desc}</p>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-100 space-y-3">
                  {cat.articles.map((art, aIdx) => (
                    <div
                      key={aIdx}
                      className="p-3 rounded-xl bg-slate-50 hover:bg-teal-50/60 border border-slate-100 hover:border-teal-200 transition-colors flex items-center justify-between cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <CheckCircle size={15} className="text-[#00a884] shrink-0" />
                        <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900">
                          {art}
                        </span>
                      </div>
                      <ArrowRight
                        size={14}
                        className="text-slate-400 group-hover:text-[#00a884] group-hover:translate-x-0.5 transition-all shrink-0"
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Interactive CTA ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className="rounded-3xl bg-[#042f2e] text-white p-8 sm:p-12 shadow-xl">
          <h2 className="text-3xl font-extrabold mb-3">
            Ready to test your knowledge with live AI?
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto mb-8 font-normal">
            Apply these preparation techniques directly in an interactive mock interview with instant AI feedback.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#00a884] hover:bg-[#028b6d] text-white text-sm font-semibold shadow-md transition-all"
          >
            Start Free Practice Session
          </Link>
        </div>
      </section>
    </div>
  );
}
