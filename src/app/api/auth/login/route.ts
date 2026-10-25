import { NextResponse } from "next/server";
import { CollegeAuthService } from "@/lib/auth/collegeAuthStore";
import { EmailService } from "@/lib/email/emailService";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const { user, requiresMFA, sessionToken } = await CollegeAuthService.authenticateUser(email, password);

    // If user is Admin (College Admin or Super Admin), enforce Mandatory MFA
    if (requiresMFA) {
      const { otpCode } = await CollegeAuthService.resendOTP(user.email, "admin_mfa");
      await EmailService.sendAdminMFAEmail(user.email, user.fullName, otpCode);

      return NextResponse.json({
        success: true,
        requiresMFA: true,
        email: user.email,
        message: "Mandatory administrator MFA required. A 6-digit security code has been sent to your official email.",
      });
    }

    // Determine redirect destination according to lifecycle
    let redirectUrl = "/dashboard";
    if (user.accountStatus === "pending_email_verification") {
      redirectUrl = `/verify-otp?email=${encodeURIComponent(user.email)}`;
    } else if (user.accountStatus === "pending_college_verification" || user.accountStatus === "rejected") {
      redirectUrl = "/status";
    } else if (user.accountStatus === "suspended") {
      return NextResponse.json(
        { error: "Your student account has been suspended. Please contact the KCE Placement Office for assistance." },
        { status: 403 }
      );
    }

    const response = NextResponse.json({
      success: true,
      requiresMFA: false,
      redirect: redirectUrl,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        accountStatus: user.accountStatus,
        studentProfile: user.studentProfile || null,
      },
    });

    // Set HttpOnly, SameSite, Secure cookie
    response.cookies.set("kce_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Invalid credentials." }, { status: 401 });
  }
}
