import React from "react";
import Link from "next/link";
import { Zap, ShieldCheck, Target, Users, Award, ArrowRight } from "lucide-react";

export const metadata = {
  title: "About Us | SkillMatch AI",
  description: "Learn how SkillMatch AI prepares students and job-seekers with AI-powered mock interviews, resume diagnostics, and placement readiness tools.",
};

export default function AboutPage() {
  return (
    <div className="bg-[#fcfdfd] text-slate-900 pt-28 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-[#00a884] text-xs font-semibold mb-4">
            <Zap size={13} />
            <span>Empowering Future Careers</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
            Bridging the Gap Between Classroom & Placement
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            SkillMatch AI helps college students and aspiring professionals gain real-time interview confidence through conversational AI recruiters, ATS resume audits, and actionable placement roadmaps.
          </p>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs hover:border-teal-300 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#00a884] flex items-center justify-center mb-4">
              <Target size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Our Mission</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              To democratize access to world-class interview coaching so every engineering and arts student, regardless of background, can enter placement drives with confidence.
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs hover:border-teal-300 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Academic Integrity</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Built with college email verification, anti-copy controls, and secure session management to ensure genuine skill measurement and honest student readiness.
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs hover:border-teal-300 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Users size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Campus Placement Focus</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Designed specifically around campus hiring processes — from initial resume screening to technical coding rounds and HR behavioral assessments.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-[#042f2e] to-[#064e3b] rounded-3xl p-8 sm:p-12 text-white text-center relative overflow-hidden shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">
            Start Preparing For Your Dream Placement
          </h2>
          <p className="text-sm sm:text-base text-white/80 max-w-xl mx-auto mb-6">
            Join thousands of students practicing daily with SkillMatch AI. Free for verified college accounts.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#00a884] hover:bg-[#009272] text-white text-sm font-semibold transition-all shadow-md"
            >
              <span>Get Started Free</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/solutions"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-all border border-white/20"
            >
              Explore Solutions
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
