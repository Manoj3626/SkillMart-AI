import React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, Eye, FileText } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | SkillMatch AI",
  description: "SkillMatch AI data privacy practices, student confidentiality, and college data security standards.",
};

export default function PrivacyPage() {
  return (
    <div className="bg-[#fcfdfd] text-slate-900 pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-[#00a884] text-xs font-semibold mb-4">
            <ShieldCheck size={13} />
            <span>Data Protection & Privacy</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
            Privacy Policy
          </h1>
          <p className="text-sm text-slate-500">
            Last updated: October 2026 &bull; Karpagam College of Engineering Placement Partner Standard
          </p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6 text-sm text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Lock size={16} className="text-[#00a884]" /> 1. Student Data Protection & Storage
            </h2>
            <p>
              SkillMatch AI collects and processes student academic profile details (such as College ID / Register No., department, degree, and verified college email) strictly for training, practice interviews, and campus placement readiness benchmarking. We never sell, rent, or monetize candidate data.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Eye size={16} className="text-[#00a884]" /> 2. Audio & Video Processing
            </h2>
            <p>
              Live microphone audio and web camera feeds during AI mock interviews are processed locally in your browser. Audio transcripts generated during question answering are stored securely within your private candidate session to produce feedback reports and are never shared publicly without your explicit consent.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <FileText size={16} className="text-[#00a884]" /> 3. Resume & Document Parsing
            </h2>
            <p>
              Uploaded resumes (PDF/DOCX) are parsed securely to calculate ATS compatibility and role match scores. Document data is isolated to the candidate account and college placement cell administrators where authorized.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">
              4. Contact Our Data Protection Team
            </h2>
            <p>
              If you have any questions about how your student records are managed or wish to request data deletion, contact us at{" "}
              <a href="mailto:support@skillmatch.ai" className="text-[#00a884] font-medium hover:underline">
                support@skillmatch.ai
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
