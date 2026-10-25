import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { CollegeAuthService } from "@/lib/auth/collegeAuthStore";
import { EmailService } from "@/lib/email/emailService";

async function getAuthorizedAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("kce_session")?.value;
  if (!token) return null;

  const session = CollegeAuthService.verifySessionToken(token);
  if (!session) return null;

  if (session.role !== "college_admin" && session.role !== "admin") {
    return null;
  }
  return session;
}

export async function GET(req: Request) {
  try {
    const admin = await getAuthorizedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized. College Administrator privileges required." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const department = searchParams.get("department") || undefined;
    const academicYear = searchParams.get("academicYear") || undefined;
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;

    const queue = await CollegeAuthService.getStudentVerificationQueue({
      department,
      academicYear,
      status,
      search,
    });

    return NextResponse.json({ success: true, students: queue });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load student verification queue." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await getAuthorizedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized. College Administrator privileges required." }, { status: 403 });
    }

    const body = await req.json();
    const { action, studentUserId, reason } = body;

    if (!action || !studentUserId) {
      return NextResponse.json({ error: "Missing required action parameters." }, { status: 400 });
    }

    if (action === "approve") {
      const { student, alreadyActive } = await CollegeAuthService.approveStudent(admin.userId, studentUserId);

      // Send personalized welcome email ONLY on first successful activation
      if (!alreadyActive) {
        await EmailService.sendWelcomeActivationEmail({
          fullName: student.fullName,
          collegeEmail: student.collegeEmail,
          rollNumber: student.rollNumber,
          department: student.department,
          degree: student.degree,
        });
      }

      return NextResponse.json({
        success: true,
        message: alreadyActive
          ? "Student account was already active."
          : `Student ${student.fullName} (${student.rollNumber}) approved and welcome email dispatched.`,
        student,
      });
    }

    if (action === "reject") {
      if (!reason || reason.trim().length < 5) {
        return NextResponse.json({ error: "A specific rejection reason (at least 5 characters) is required." }, { status: 400 });
      }

      const student = await CollegeAuthService.rejectStudent(admin.userId, studentUserId, reason);

      await EmailService.sendRejectionEmail({
        fullName: student.fullName,
        collegeEmail: student.collegeEmail,
        rejectionReason: reason.trim(),
      });

      return NextResponse.json({
        success: true,
        message: `Student verification rejected. Reason recorded and correction notice sent to student.`,
        student,
      });
    }

    if (action === "suspend") {
      const user = await CollegeAuthService.toggleAccountSuspension(admin.userId, studentUserId, true);
      return NextResponse.json({
        success: true,
        message: `Account for ${user.fullName} has been suspended. All active sessions revoked.`,
      });
    }

    if (action === "restore") {
      const user = await CollegeAuthService.toggleAccountSuspension(admin.userId, studentUserId, false);
      return NextResponse.json({
        success: true,
        message: `Account for ${user.fullName} has been restored to active status.`,
      });
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process admin action." }, { status: 400 });
  }
}
