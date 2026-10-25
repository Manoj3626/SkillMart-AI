import { NextResponse } from "next/server";
import { CollegeAuthService } from "@/lib/auth/collegeAuthStore";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ error: "Email address and 6-digit verification code are required." }, { status: 400 });
    }

    const { user } = await CollegeAuthService.verifyEmailOTP(email, code);

    // Issue session token for the pending student
    const sessionToken = CollegeAuthService.createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      accountStatus: user.accountStatus,
      sessionVersion: user.sessionVersion,
      lastActivity: Date.now(),
    });

    const response = NextResponse.json({
      success: true,
      message: "Email verified successfully! Your profile has been submitted to the KCE Placement Cell for identity review.",
      status: user.accountStatus,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        accountStatus: user.accountStatus,
      },
    });

    // Set HttpOnly secure session cookie
    response.cookies.set("kce_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Verification failed." }, { status: 400 });
  }
}
