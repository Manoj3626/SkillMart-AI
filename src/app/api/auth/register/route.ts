import { NextResponse } from "next/server";
import { z } from "zod";
import { CollegeAuthService } from "@/lib/auth/collegeAuthStore";
import { EmailService } from "@/lib/email/emailService";
import { isValidCollegeEmail } from "@/lib/college/config";

const registerSchema = z
  .object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z
      .string()
      .trim()
      .refine((val) => isValidCollegeEmail(val), {
        message: "Email must be an official Karpagam College of Engineering address ending in @kce.ac.in",
      }),
    rollNumber: z.string().trim().optional(),
    collegeId: z.string().trim().optional(),
    department: z.string().min(2, "Department is required"),
    degree: z.string().min(2, "Degree program is required"),
    academicYear: z.string().min(2, "Current academic year is required"),
    graduationYear: z.coerce.number().min(2024).max(2035),
    password: z.string().min(12, "Password must be at least 12 characters long"),
    confirmPassword: z.string(),
    phone: z.string().optional().nullable(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => !!(data.collegeId || data.rollNumber), {
    message: "College ID / Register No. is required",
    path: ["collegeId"],
  });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = registerSchema.safeParse(body);

    if (!validated.success) {
      const firstError = validated.error.issues[0]?.message || "Invalid registration data";
      return NextResponse.json({ error: firstError, details: validated.error.issues }, { status: 400 });
    }

    const regId = (validated.data.collegeId || validated.data.rollNumber)!.trim().toUpperCase();

    const { user, otpCode } = await CollegeAuthService.registerStudent({
      fullName: validated.data.fullName,
      email: validated.data.email,
      rollNumber: validated.data.rollNumber?.trim().toUpperCase() || regId,
      collegeId: validated.data.collegeId?.trim().toUpperCase() || regId,
      department: validated.data.department,
      degree: validated.data.degree,
      academicYear: validated.data.academicYear,
      graduationYear: validated.data.graduationYear,
      password: validated.data.password,
      phone: validated.data.phone,
    });

    // Send OTP via server email service
    const delivery = await EmailService.sendOTPEmail(user.email, user.fullName, otpCode);

    if (!delivery.success) {
      return NextResponse.json(
        {
          error: delivery.error || "Account created, but verification email could not be delivered. Please verify server email configuration.",
          email: user.email,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Registration initiated! A 6-digit verification code has been sent to your @kce.ac.in email address.",
      email: user.email,
      status: user.accountStatus,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Registration failed. Please try again." }, { status: 400 });
  }
}
