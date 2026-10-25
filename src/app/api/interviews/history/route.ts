import { NextRequest, NextResponse } from "next/server";
import { connection } from "next/server";
import { cookies } from "next/headers";
import { CollegeAuthService } from "@/lib/auth/collegeAuthStore";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  await connection();

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("kce_session")?.value;
    let userId: string | null = null;

    if (token) {
      const session = CollegeAuthService.verifySessionToken(token);
      if (session) {
        userId = session.userId;
      }
    }

    if (!userId) {
      try {
        const supabase = await createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          userId = user.id;
        }
      } catch {}
    }

    if (!userId) {
      return NextResponse.json({ sessions: [] }, { status: 200 });
    }

    // 1. Fetch persistent sessions from CollegeAuthService
    const storedSessions = await CollegeAuthService.getInterviewSessionsByUser(userId);

    // 2. Fetch from Supabase if configured and merge
    let supabaseSessions: any[] = [];
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from("interview_sessions")
        .select(`
          id,
          job_role,
          interview_type,
          difficulty,
          experience_level,
          duration_minutes,
          status,
          created_at,
          interview_feedback (
            overall_score
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (Array.isArray(data)) {
        supabaseSessions = data.map((s: any) => ({
          id: s.id,
          userId,
          jobRole: s.job_role,
          interviewType: s.interview_type,
          difficulty: s.difficulty,
          experienceLevel: s.experience_level,
          durationMinutes: s.duration_minutes,
          status: s.status,
          score: s.interview_feedback?.[0]?.overall_score ?? 75,
          createdAt: s.created_at,
        }));
      }
    } catch {}

    // Map stored sessions to presentation format
    const formattedStored = storedSessions.map((s) => ({
      id: s.id,
      userId: s.userId,
      jobRole: s.jobRole,
      interviewType: s.interviewType,
      difficulty: s.difficulty,
      experienceLevel: s.experienceLevel,
      durationMinutes: s.durationMinutes,
      status: s.status,
      score: s.feedback?.overall_score || s.feedback?.overallScore || 75,
      createdAt: s.createdAt,
    }));

    // Deduplicate by session ID
    const mergedMap = new Map<string, any>();
    [...formattedStored, ...supabaseSessions].forEach((s) => {
      if (!mergedMap.has(s.id)) {
        mergedMap.set(s.id, s);
      }
    });

    const sessions = Array.from(mergedMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({ sessions });
  } catch (err: any) {
    console.error("[interviews/history]", err);
    return NextResponse.json({ sessions: [] }, { status: 200 });
  }
}
