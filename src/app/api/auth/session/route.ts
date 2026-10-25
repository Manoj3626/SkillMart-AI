import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { CollegeAuthService } from "@/lib/auth/collegeAuthStore";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("kce_session")?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const session = CollegeAuthService.verifySessionToken(token);
    if (!session) {
      // Invalidate cookie if expired or revoked
      const res = NextResponse.json(
        { authenticated: false, error: "Session expired due to 15-minute inactivity or revocation." },
        { status: 401 }
      );
      res.cookies.delete("kce_session");
      return res;
    }

    const fullUser = await CollegeAuthService.getUserById(session.userId);
    if (!fullUser) {
      const res = NextResponse.json({ authenticated: false, user: null }, { status: 401 });
      res.cookies.delete("kce_session");
      return res;
    }

    // Refresh lastActivity timestamp on activity
    const refreshedToken = CollegeAuthService.createSessionToken({
      ...session,
      lastActivity: Date.now(),
    });

    const response = NextResponse.json({
      authenticated: true,
      user: {
        id: fullUser.id,
        email: fullUser.email,
        fullName: fullUser.fullName,
        role: fullUser.role,
        accountStatus: fullUser.accountStatus,
        studentProfile: fullUser.studentProfile || null,
        adminProfile: fullUser.adminProfile || null,
      },
    });

    response.cookies.set("kce_session", refreshedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ authenticated: false, error: err.message }, { status: 500 });
  }
}
