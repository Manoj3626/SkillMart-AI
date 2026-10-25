"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { User, Session } from "@supabase/supabase-js";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { Profile } from "@/types";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const fetchProfile = useCallback(
    async (userId: string) => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      setProfile(data ?? null);
    },
    [supabase]
  );

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id);
  }, [user, fetchProfile]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (isSupabaseConfigured()) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setSession(session);
            setUser(session.user);
            await fetchProfile(session.user.id);
            setLoading(false);
            return;
          }
        }

        // Check College Auth Session (responds in <10ms)
        const collegeRes = await fetch("/api/auth/session");
        if (collegeRes.ok) {
          const collegeData = await collegeRes.json();
          if (collegeData.authenticated && collegeData.user) {
            const cu = collegeData.user;
            setUser({
              id: cu.id,
              email: cu.email,
              user_metadata: { full_name: cu.fullName },
              app_metadata: { role: cu.role },
            } as any);
            setProfile({
              id: cu.id,
              full_name: cu.fullName,
              email: cu.email,
              role: cu.role,
              account_status: cu.accountStatus,
              student_profile: cu.studentProfile,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            } as any);
          }
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    if (isSupabaseConfigured()) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) fetchProfile(session.user.id);
        else setProfile(null);
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    }
  }, [supabase, fetchProfile]);

  const signOut = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    try {
      await supabase.auth.signOut();
    } catch {}
    setUser(null);
    setSession(null);
    setProfile(null);
  }, [supabase]);

  return (
    <AuthContext.Provider
      value={{ user, session, profile, loading, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
