import type { Metadata } from "next";

export const metadata: Metadata = { title: "For Recruiters" };

export default function ForRecruitersPage() {
  return (
    <div className="pt-24 pb-16">
      <div className="container-xl text-center">
        <h1 className="text-4xl font-extrabold text-[var(--color-surface-900)] mb-4">
          For Recruiters
        </h1>
        <p className="text-lg text-[var(--color-surface-500)]">
          Recruiter portal coming soon. Post jobs and find skill-matched candidates.
        </p>
      </div>
    </div>
  );
}
