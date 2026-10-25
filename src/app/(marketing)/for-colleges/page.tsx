import type { Metadata } from "next";

export const metadata: Metadata = { title: "For Colleges" };

export default function ForCollegesPage() {
  return (
    <div className="pt-24 pb-16">
      <div className="container-xl text-center">
        <h1 className="text-4xl font-extrabold text-[var(--color-surface-900)] mb-4">
          For Colleges
        </h1>
        <p className="text-lg text-[var(--color-surface-500)]">
          College portal coming soon. Monitor placement readiness and aggregate analytics.
        </p>
      </div>
    </div>
  );
}
