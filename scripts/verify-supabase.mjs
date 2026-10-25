// SkillMatch AI — Supabase PostgreSQL Live Connection Verifier
// Tests network connection, verifies table accessibility, and validates interview persistence.
// Run with: node scripts/verify-supabase.mjs

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

console.log("=================================================");
console.log("   SkillMatch AI — Supabase PostgreSQL Verifier   ");
console.log("=================================================");

if (!supabaseUrl || !supabaseKey || supabaseUrl.trim() === "" || supabaseUrl.includes("placeholder")) {
  console.log("STATUS: ❌ NOT CONNECTED");
  console.log("Reason: NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY are empty or placeholder in .env.local.");
  console.log("\nTo connect Supabase:");
  console.log("1. Create a project at https://supabase.com/dashboard");
  console.log("2. Run the SQL schema in supabase/migrations/001_initial_schema.sql");
  console.log("3. Add your Project URL and API keys to .env.local and Vercel Project Settings.");
  process.exit(2);
}

// Masked display
const maskedUrl = supabaseUrl.replace(/^(https:\/\/[a-z0-9]{4})[a-z0-9]+(\.supabase\.co)/, "$1****$2");
console.log(`Target Supabase URL: ${maskedUrl}`);

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

async function verifyConnection() {
  try {
    console.log("\n1. Testing database connectivity to public.profiles...");
    const { data: profiles, error: profileErr } = await supabase
      .from("profiles")
      .select("id, email, full_name, role")
      .limit(5);

    if (profileErr) {
      console.error("❌ Connection failed on public.profiles:", profileErr.message);
      process.exit(1);
    }
    console.log(`✅ Connected successfully! Found ${profiles?.length ?? 0} sample profile(s).`);

    console.log("\n2. Testing access to public.interview_sessions...");
    const { count: sessionCount, error: sessionErr } = await supabase
      .from("interview_sessions")
      .select("*", { count: "exact", head: true });

    if (sessionErr) {
      console.error("❌ Failed accessing public.interview_sessions:", sessionErr.message);
      process.exit(1);
    }
    console.log(`✅ Table public.interview_sessions is ready. Total records: ${sessionCount ?? 0}`);

    console.log("\n3. Testing access to public.interview_feedback...");
    const { count: feedbackCount, error: feedbackErr } = await supabase
      .from("interview_feedback")
      .select("*", { count: "exact", head: true });

    if (feedbackErr) {
      console.error("❌ Failed accessing public.interview_feedback:", feedbackErr.message);
      process.exit(1);
    }
    console.log(`✅ Table public.interview_feedback is ready. Total records: ${feedbackCount ?? 0}`);

    console.log("\n4. Performing round-trip persistence test...");
    const testSessionId = `test-verify-${Date.now()}`;
    const testUserId = "verify_test_user";

    // Insert test session
    const { error: insSessErr } = await supabase.from("interview_sessions").insert({
      id: testSessionId,
      user_id: testUserId,
      job_role: "Software Verification Engineer",
      interview_type: "technical",
      difficulty: "intermediate",
      experience_level: "junior",
      duration_minutes: 15,
      status: "completed",
    });

    if (insSessErr) {
      console.error("❌ Failed to insert test interview_session:", insSessErr.message);
      process.exit(1);
    }

    // Insert test feedback
    const { error: insFbErr } = await supabase.from("interview_feedback").insert({
      session_id: testSessionId,
      user_id: testUserId,
      overall_score: 92,
      communication_score: 90,
      problem_solving_score: 94,
      strengths: ["Database connectivity verified", "Round-trip validated"],
      weaknesses: [],
    });

    if (insFbErr) {
      console.error("❌ Failed to insert test interview_feedback:", insFbErr.message);
      process.exit(1);
    }

    // Read back
    const { data: readBack, error: readErr } = await supabase
      .from("interview_feedback")
      .select("session_id, overall_score, strengths")
      .eq("session_id", testSessionId)
      .single();

    if (readErr || !readBack) {
      console.error("❌ Failed reading back test interview record:", readErr?.message);
      process.exit(1);
    }
    console.log(`✅ Round-trip test verified: Read back score ${readBack.overall_score} for session ${readBack.session_id}`);

    // Clean up test records
    await supabase.from("interview_feedback").delete().eq("session_id", testSessionId);
    await supabase.from("interview_sessions").delete().eq("id", testSessionId);
    console.log("🧹 Cleaned up temporary verification test records.");

    console.log("\n=================================================");
    console.log("🎉 SUCCESS: Supabase PostgreSQL is CONNECTED & FULLY VERIFIED!");
    console.log("=================================================");
  } catch (err) {
    console.error("❌ Unexpected connection verification error:", err.message);
    process.exit(1);
  }
}

verifyConnection();
