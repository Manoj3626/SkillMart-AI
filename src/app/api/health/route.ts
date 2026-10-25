import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  return NextResponse.json({ status: "ok", timestamp: new Date().toISOString() });
}

// POST /api/health — detailed config status
export async function POST(_req: NextRequest) {
  const checks: Record<string, boolean | string> = {};

  checks.supabase_url = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  checks.supabase_anon_key = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  checks.supabase_service_key = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  checks.livekit_url = !!process.env.LIVEKIT_URL;
  checks.livekit_api_key = !!process.env.LIVEKIT_API_KEY;
  checks.livekit_api_secret = !!process.env.LIVEKIT_API_SECRET;
  checks.ai_api_key = !!process.env.AI_API_KEY;
  checks.ai_provider = process.env.AI_PROVIDER ?? "not set";
  checks.ai_model = process.env.AI_MODEL ?? "not set";

  const allGood = Object.values(checks).every(
    (v) => v === true || typeof v === "string"
  );

  return NextResponse.json(
    {
      status: allGood ? "ok" : "partial",
      checks,
      demo_mode: !process.env.LIVEKIT_API_KEY || !process.env.AI_API_KEY,
    },
    { status: 200 }
  );
}
