import { NextResponse } from "next/server";
import crypto from "crypto";
import { CollegeAuthService } from "@/lib/auth/collegeAuthStore";
import { COLLEGE_CONFIG } from "@/lib/college/config";

export async function POST(req: Request) {
  try {
    const { token, email, password, confirmPassword } = await req.json();

    if (!password) {
      return NextResponse.json({ error: "Password is required." }, { status: 400 });
    }

    if (confirmPassword && password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });
    }

    if (password.length < COLLEGE_CONFIG.security.minPasswordLength) {
      return NextResponse.json(
        { error: `Password must be at least ${COLLEGE_CONFIG.security.minPasswordLength} characters long.` },
        { status: 400 }
      );
    }

    if (token) {
      await CollegeAuthService.resetPasswordWithToken(token, password);
      return NextResponse.json({
        success: true,
        message: "Password reset successful! All previous active sessions have been revoked. Please sign in with your new password.",
      });
    }

    if (!email) {
      return NextResponse.json({ error: "Reset token or email required." }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await CollegeAuthService.getUserByEmail(normalizedEmail);

    if (!user) {
      return NextResponse.json({ error: "Invalid password reset request." }, { status: 400 });
    }

    // Hash new password and revoke all existing sessions
    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHash = crypto.scryptSync(password, salt, 64).toString("hex");

    user.passwordHash = passwordHash;
    user.salt = salt;
    user.sessionVersion += 1;
    user.updatedAt = new Date().toISOString();

    return NextResponse.json({
      success: true,
      message: "Password reset successful! All previous active sessions have been revoked. Please sign in with your new password.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Password reset failed." }, { status: 400 });
  }
}
