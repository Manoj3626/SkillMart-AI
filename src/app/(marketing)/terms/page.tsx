import React from "react";
import Link from "next/link";
import { FileText, CheckCircle, AlertCircle } from "lucide-react";

export const metadata = {
  title: "Terms of Service | SkillMatch AI",
  description: "SkillMatch AI platform usage terms, academic conduct, and student placement agreements.",
};

export default function TermsPage() {
  return (
    <div className="bg-[#fcfdfd] text-slate-900 pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-[#00a884] text-xs font-semibold mb-4">
            <FileText size={13} />
            <span>Usage Guidelines</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
            Terms of Service
          </h1>
          <p className="text-sm text-slate-500">
            Effective: October 2026 &bull; Karpagam College of Engineering Placement Partner Framework
          </p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6 text-sm text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <CheckCircle size={16} className="text-[#00a884]" /> 1. Academic & Ethical Use
            </h2>
            <p>
              SkillMatch AI is an educational platform intended for students preparing for campus placement rounds. Users agree to provide genuine answers during practice sessions without attempting to tamper with audio streams or bypass academic integrity monitors.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <CheckCircle size={16} className="text-[#00a884]" /> 2. Account Security & Verification
            </h2>
            <p>
              Students must register using their official college email address (@kce.ac.in) and College ID / Register No. Accounts must not be shared between students. Each student is responsible for maintaining the confidentiality of their credentials and one-time verification passcodes.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <AlertCircle size={16} className="text-amber-500" /> 3. AI Evaluations & Placement Advisory
            </h2>
            <p>
              SkillMatch AI provides placement readiness scores, ATS diagnostics, and speech feedback as coaching tools. While designed to reflect industry benchmarks accurately, scores do not guarantee job offers from specific recruiters.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">
              4. Amendments
            </h2>
            <p>
              We may update these terms periodically to reflect new campus placement features or security enhancements. Continued use of the platform constitutes agreement to the current terms.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
