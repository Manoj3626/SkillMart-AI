import { NextResponse } from "next/server";
import { CollegeAuthService } from "@/lib/auth/collegeAuthStore";
import { EmailService } from "@/lib/email/emailService";

export async function POST(req: Request) {
  try {
    const { email, purpose = "email_verification" } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email address is required." }, { status: 400 });
    }

    const { otpCode } = await CollegeAuthService.resendOTP(email, purpose);

    // Look up user name if available
    const storeUser = await CollegeAuthService.getUserByEmail(email);
    const fullName = storeUser?.fullName || "Student";

    const delivery = await EmailService.sendOTPEmail(email, fullName, otpCode);

    if (!delivery.success) {
      return NextResponse.json(
        { error: delivery.error || "Failed to deliver verification code to your college email. Please check server email provider configuration." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "A fresh verification code has been dispatched to your official college email address.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to resend code." }, { status: 400 });
  }
}
