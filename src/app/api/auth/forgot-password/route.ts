import { NextResponse } from "next/server";
import crypto from "crypto";
import { CollegeAuthService } from "@/lib/auth/collegeAuthStore";
import { EmailService } from "@/lib/email/emailService";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await CollegeAuthService.getUserByEmail(normalizedEmail);

    // If user exists, dispatch reset token
    if (user) {
      const { token } = await CollegeAuthService.createPasswordResetChallenge(normalizedEmail);
      await EmailService.sendPasswordResetEmail(normalizedEmail, user.fullName, token);
    }

    // Always return generic non-revealing response to protect against user enumeration
    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, a secure password recovery link has been sent to your inbox.",
    });
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, a secure password recovery link has been sent to your inbox.",
    });
  }
}
