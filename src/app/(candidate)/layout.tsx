"use client";

import { AuthProvider, useAuth } from "@/lib/auth/AuthContext";
import { CandidateSidebar } from "@/components/layout/CandidateSidebar";
import { useRouter } from "next/navigation";
import { Suspense } from "react";

function CandidateShell({ children }: { children: React.ReactNode }) {
  const { profile, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-surface-50)]">
      <Suspense fallback={<aside className="w-64 h-full bg-white border-r border-gray-200" />}>
        <CandidateSidebar
          userName={profile?.full_name ?? profile?.email ?? "Candidate"}
          userInitial={
            profile?.full_name?.[0]?.toUpperCase() ??
            profile?.email?.[0]?.toUpperCase() ??
            "C"
          }
          onSignOut={handleSignOut}
        />
      </Suspense>
      <main className="flex-1 overflow-y-auto">
        <Suspense fallback={<div className="p-8 text-sm text-gray-500">Loading portal...</div>}>
          {children}
        </Suspense>
      </main>
    </div>
  );
}

export default function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <CandidateShell>{children}</CandidateShell>
    </AuthProvider>
  );
}
