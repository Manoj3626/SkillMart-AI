import { NextResponse } from "next/server";
import { CollegeAuthService, hashOTP } from "@/lib/auth/collegeAuthStore";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ error: "Email and MFA code are required." }, { status: 400 });
    }

    const user = await CollegeAuthService.getUserByEmail(email);
    if (!user || (user.role !== "college_admin" && user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized access request." }, { status: 403 });
    }

    // Verify MFA OTP
    // Using CollegeAuthService.resendOTP and internal challenge check
    // We can verify via hash comparison
    const expectedHash = hashOTP(code, email);
    // Use verifyEmailOTP or custom MFA verify
    const { user: verifiedUser } = await CollegeAuthService.verifyEmailOTP(email, code);

    const redirect = verifiedUser.role === "admin" ? "/admin/dashboard" : "/college/dashboard";

    const sessionToken = CollegeAuthService.createSessionToken({
      userId: verifiedUser.id,
      email: verifiedUser.email,
      role: verifiedUser.role,
      fullName: verifiedUser.fullName,
      accountStatus: verifiedUser.accountStatus,
      sessionVersion: verifiedUser.sessionVersion,
      lastActivity: Date.now(),
    });

    const response = NextResponse.json({
      success: true,
      redirect,
      user: {
        id: verifiedUser.id,
        email: verifiedUser.email,
        fullName: verifiedUser.fullName,
        role: verifiedUser.role,
      },
    });

    response.cookies.set("kce_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8, // 8 hours for admin sessions
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Invalid MFA code." }, { status: 400 });
  }
}
