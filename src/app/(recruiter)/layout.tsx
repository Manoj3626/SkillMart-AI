import React from "react";
import type { Metadata } from "next";
import { CandidateSidebar } from "@/components/layout/CandidateSidebar";

export const metadata: Metadata = {
  title: "Recruiter Portal | SkillMatch AI",
  description: "Post jobs, review AI-scored candidates, and manage your hiring pipeline.",
};

export default function RecruiterLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-surface-50)]">
      <CandidateSidebar role="recruiter" />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
