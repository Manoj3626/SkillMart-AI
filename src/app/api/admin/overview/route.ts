import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { CollegeAuthService } from "@/lib/auth/collegeAuthStore";

async function getAuthorizedSuperAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("kce_session")?.value;
  if (!token) return null;

  const session = CollegeAuthService.verifySessionToken(token);
  if (!session || session.role !== "admin") return null;

  return session;
}

export async function GET() {
  try {
    const admin = await getAuthorizedSuperAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized. Super Admin access required." }, { status: 403 });
    }

    const students = await CollegeAuthService.getStudentVerificationQueue();
    const auditLogs = await CollegeAuthService.getAuditLogs(50);

    const stats = {
      totalStudents: students.length,
      activeStudents: students.filter((s) => s.status === "active").length,
      pendingVerification: students.filter((s) => s.status === "pending_college_verification").length,
      pendingEmail: students.filter((s) => s.status === "pending_email_verification").length,
      rejected: students.filter((s) => s.status === "rejected").length,
      suspended: students.filter((s) => s.status === "suspended").length,
    };

    return NextResponse.json({
      success: true,
      stats,
      students: students.slice(0, 20),
      auditLogs,
      emailProvider: {
        configured: !!(process.env.RESEND_API_KEY || process.env.SMTP_HOST),
        provider: process.env.RESEND_API_KEY ? "Resend API" : process.env.SMTP_HOST ? "SMTP Relay" : "Secure Development Logger",
        senderAddress: process.env.EMAIL_FROM_ADDRESS || "placements@kce.ac.in",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load platform overview." }, { status: 500 });
  }
}
