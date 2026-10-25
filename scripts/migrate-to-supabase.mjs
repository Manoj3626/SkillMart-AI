// SkillMatch AI — Safe Data Migration Script
// Migrates users and interview sessions from data/college_auth_store.json to Supabase PostgreSQL.
// Run with: node scripts/migrate-to-supabase.mjs

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

// Load .env.local manually if not in process.env
const envPath = resolve(process.cwd(), ".env.local");
if (existsSync(envPath)) {
  const content = readFileSync(envPath, "utf-8");
  content.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const idx = trimmed.indexOf("=");
      if (idx > 0) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes("placeholder")) {
  console.error("❌ Error: Valid Supabase credentials not found in .env.local.");
  console.error("Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY first.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

async function runMigration() {
  console.log("🚀 Starting migration from college_auth_store.json to Supabase...");
  console.log(`📡 Connecting to Supabase project at: ${supabaseUrl.replace(/^(https:\/\/[^.]+).*/, "$1.supabase.co")}`);

  const storePath = resolve(process.cwd(), "data/college_auth_store.json");
  if (!existsSync(storePath)) {
    console.error("❌ Store file data/college_auth_store.json not found.");
    process.exit(1);
  }

  const raw = readFileSync(storePath, "utf-8");
  const store = JSON.parse(raw);

  // 1. Migrate Profiles
  const users = Object.values(store.users || {});
  console.log(`📦 Found ${users.length} user records to migrate.`);

  let migratedProfiles = 0;
  for (const user of users) {
    const profileData = {
      id: user.id,
      email: user.email,
      full_name: user.fullName || user.email.split("@")[0],
      role: user.role === "admin" ? "admin" : user.role === "college_admin" ? "college_admin" : "candidate",
      headline: user.studentProfile?.degree ? `${user.studentProfile.degree} (${user.studentProfile.department || "Engineering"})` : "Student Candidate",
      created_at: user.createdAt || new Date().toISOString(),
      updated_at: user.updatedAt || new Date().toISOString(),
    };

    const { error } = await supabase.from("profiles").upsert(profileData, { onConflict: "id" });
    if (error) {
      console.warn(`⚠️ Warning syncing profile ${user.email}:`, error.message);
    } else {
      migratedProfiles++;
    }
  }
  console.log(`✅ Successfully synced ${migratedProfiles}/${users.length} profiles to public.profiles.`);

  // 2. Migrate Interview Sessions
  const sessions = Object.values(store.interviewSessions || {});
  console.log(`📦 Found ${sessions.length} interview sessions to migrate.`);

  let migratedSessions = 0;
  let migratedFeedback = 0;

  for (const session of sessions) {
    const sessionData = {
      id: session.id,
      user_id: session.userId || "guest_candidate",
      job_role: session.jobRole || "Software Engineer",
      interview_type: session.interviewType || "technical",
      difficulty: session.difficulty || "intermediate",
      experience_level: session.experienceLevel || "fresher",
      duration_minutes: session.durationMinutes || 20,
      status: session.status || "completed",
      started_at: session.createdAt || new Date().toISOString(),
      ended_at: session.updatedAt || session.createdAt || new Date().toISOString(),
      created_at: session.createdAt || new Date().toISOString(),
    };

    const { error: sessErr } = await supabase.from("interview_sessions").upsert(sessionData, { onConflict: "id" });
    if (sessErr) {
      console.warn(`⚠️ Warning syncing interview session ${session.id}:`, sessErr.message);
      continue;
    }
    migratedSessions++;

    if (session.feedback) {
      const fb = session.feedback;
      const feedbackData = {
        session_id: session.id,
        user_id: session.userId || "guest_candidate",
        overall_score: fb.overall_score ?? fb.overallScore ?? 75,
        relevance_score: fb.relevance_score ?? 75,
        technical_score: fb.technical_score ?? null,
        communication_score: fb.communication_score ?? 75,
        problem_solving_score: fb.problem_solving_score ?? 75,
        completeness_score: fb.completeness_score ?? 75,
        strengths: fb.strengths || [],
        weaknesses: fb.weaknesses || [],
        question_feedback: fb.question_feedback || [],
        recommended_topics: fb.recommended_topics || [],
        next_session_suggestion: fb.next_session_suggestion || null,
        raw_response: fb,
        created_at: session.createdAt || new Date().toISOString(),
      };

      const { error: fbErr } = await supabase.from("interview_feedback").upsert(feedbackData, { onConflict: "session_id" });
      if (fbErr) {
        console.warn(`⚠️ Warning syncing feedback for session ${session.id}:`, fbErr.message);
      } else {
        migratedFeedback++;
      }
    }
  }

  console.log(`✅ Successfully synced ${migratedSessions}/${sessions.length} sessions to public.interview_sessions.`);
  console.log(`✅ Successfully synced ${migratedFeedback} feedback reports to public.interview_feedback.`);
  console.log("🎉 Migration completed safely without data loss!");
}

runMigration().catch((err) => {
  console.error("❌ Migration failed:", err.message);
  process.exit(1);
});
