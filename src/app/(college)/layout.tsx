import React from "react";
import type { Metadata } from "next";
import { CandidateSidebar } from "@/components/layout/CandidateSidebar";

export const metadata: Metadata = {
  title: "College Portal | SkillMatch AI",
  description: "Manage your student cohort, track placement progress, and export reports.",
};

export default function CollegeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-surface-50)]">
      <CandidateSidebar role="college" />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
