import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface TokenRequestBody {
  roomName: string;
  participantName: string;
}

export async function POST(req: NextRequest) {
  try {
    // Validate auth
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as TokenRequestBody;
    const { roomName, participantName } = body;

    if (!roomName || !participantName) {
      return NextResponse.json(
        { error: "roomName and participantName are required" },
        { status: 400 }
      );
    }

    // Sanitize: ensure room name is scoped to this user to prevent unauthorized access
    if (!roomName.startsWith(`interview-${user.id}`)) {
      return NextResponse.json(
        { error: "Invalid room name" },
        { status: 403 }
      );
    }

    const livekitUrl = process.env.LIVEKIT_URL;
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!livekitUrl || !apiKey || !apiSecret) {
      // Return demo mode signal — do NOT expose secrets
      return NextResponse.json(
        {
          demo: true,
          message:
            "LiveKit credentials not configured. Running in demo mode.",
          token: null,
          url: null,
        },
        { status: 200 }
      );
    }

    // Dynamically import livekit-server-sdk (server-only)
    const { AccessToken } = await import("livekit-server-sdk");

    const at = new AccessToken(apiKey, apiSecret, {
      identity: user.id,
      name: participantName,
      ttl: "2h",
    });

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const token = await at.toJwt();

    return NextResponse.json({ token, url: livekitUrl, demo: false });
  } catch (err) {
    console.error("[LiveKit token]", err);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}
