import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, ArrowRight, Sparkles, HelpCircle, Shield, Building2, User } from "lucide-react";

export const metadata: Metadata = {
  title: "Pricing & Plans — Transparent Campus Interview Prep | SkillMatch AI",
  description:
    "Explore transparent pricing for students and institutions. Practice interviews with free credits, resume audits, and campus placement readiness.",
};

export default function PricingPage() {
  const plans = [
    {
      name: "Student Plan",
      badge: "Free for KCE Students",
      tagline: "Ideal for freshers preparing for upcoming campus placement drives.",
      price: "₹0",
      period: "forever for @kce.ac.in",
      ctaLabel: "Get Started Free",
      ctaHref: "/signup",
      highlight: true,
      features: [
        "100 AI practice interview credits upon verified registration",
        "Live voice-based AI mock interviews (HR & Technical)",
        "Resume Analysis with ATS keyword & formatting audit",
        "Detailed performance report with radar competency chart",
        "Granular answer feedback and recommended model answers",
        "Personalized skill gap learning roadmap with free resources",
        "Verified Karpagam College placement profile",
      ],
    },
    {
      name: "Placement Cell Pro",
      badge: "Institutional",
      tagline: "Dedicated cohort management and placement analytics for academic departments.",
      price: "Custom",
      period: "per academic year",
      ctaLabel: "Contact Placement Cell",
      ctaHref: "/for-colleges",
      highlight: false,
      features: [
        "Department-level tracking (AIDS, CSE, IT, ECE, Mech, Civil)",
        "Administrative dashboard to verify student registrations",
        "Company-specific mock drive benchmarks (TCS, Infosys, Startups)",
        "Batch-wide readiness analytics & CSV data exports",
        "Proctored interview integrity monitoring & event audit log",
        "Priority placement officer support & orientation sessions",
      ],
    },
    {
      name: "Enterprise Recruiter",
      badge: "Corporate",
      tagline: "Pre-screen campus talent with customized technical rubrics and assessments.",
      price: "Custom",
      period: "per hiring drive",
      ctaLabel: "Contact Recruiter Team",
      ctaHref: "/for-recruiters",
      highlight: false,
      features: [
        "Custom interview question pools tailored to job descriptions",
        "Automated delivery, technical depth, and communication ratings",
        "Candidate comparative scorecards & video/audio transcripts",
        "Seamless candidate export and ATS integration",
        "Dedicated corporate onboarding & custom scoring criteria",
      ],
    },
  ];

  const faqs = [
    {
      q: "How do interview credits work for students?",
      a: "Every verified student receives 100 free interview practice credits upon email verification. Each mock interview session utilizes credits based on duration and question depth, allowing students to practice multiple full mock interviews.",
    },
    {
      q: "Is there any hidden fee or credit card required?",
      a: "No. Core placement preparation features, resume analysis, and mock interviews are completely free for students of Karpagam College of Engineering. No credit card or payment information is ever requested.",
    },
    {
      q: "What happens if I need more practice sessions?",
      a: "Students actively preparing for active campus drives can request additional practice allocations directly through their department placement coordinator or placement cell.",
    },
    {
      q: "Can other colleges use SkillMatch AI?",
      a: "Yes! Placement cells from other colleges and universities can reach out via our institutional contact page to set up verified campus domains and administrative portals.",
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
          Transparent & Accessible
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
          Simple Plans for <span className="text-[#00a884]">Students</span> & Campuses
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
          Honest pricing with zero hidden charges. College students prepare for campus placements free with real AI models.
        </p>
      </section>

      {/* ── Pricing Cards ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((p, idx) => (
            <div
              key={idx}
              className={`rounded-3xl p-8 transition-all flex flex-col justify-between ${
                p.highlight
                  ? "bg-white border-2 border-[#00a884] shadow-xl relative ring-4 ring-teal-50"
                  : "bg-white border border-slate-200/90 shadow-xs hover:border-slate-300"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-slate-900">{p.name}</h3>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      p.highlight
                        ? "bg-[#00a884] text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {p.badge}
                  </span>
                </div>

                <p className="text-xs text-slate-500 mb-6 font-normal min-h-[32px]">
                  {p.tagline}
                </p>

                <div className="mb-6 pb-6 border-b border-slate-100">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
                      {p.price}
                    </span>
                    <span className="text-xs text-slate-500 font-medium ml-1">
                      / {p.period}
                    </span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {p.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-600">
                      <CheckCircle2
                        size={16}
                        className={`shrink-0 mt-0.5 ${
                          p.highlight ? "text-[#00a884]" : "text-slate-400"
                        }`}
                      />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <Link
                  href={p.ctaHref}
                  className={`w-full py-3.5 px-6 rounded-full text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    p.highlight
                      ? "bg-[#042f2e] hover:bg-[#064e3b] text-white shadow-md hover:shadow-lg"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200"
                  }`}
                >
                  <span>{p.ctaLabel}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ Section ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-600 font-normal">
            Everything you need to know about access, verification, and mock interviews.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs"
            >
              <h3 className="text-base font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <HelpCircle size={17} className="text-[#00a884] shrink-0" />
                {faq.q}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal pl-6">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
