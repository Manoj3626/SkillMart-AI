"use client";

import { AuthProvider, useAuth } from "@/lib/auth/AuthContext";
import { CandidateSidebar } from "@/components/layout/CandidateSidebar";
import { useRouter } from "next/navigation";

function CandidateShell({ children }: { children: React.ReactNode }) {
  const { profile, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-surface-50)]">
      <CandidateSidebar
        userName={profile?.full_name ?? profile?.email ?? "Candidate"}
        userInitial={
          profile?.full_name?.[0]?.toUpperCase() ??
          profile?.email?.[0]?.toUpperCase() ??
          "C"
        }
        onSignOut={handleSignOut}
      />
      <main className="flex-1 overflow-y-auto">
        {children}
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
