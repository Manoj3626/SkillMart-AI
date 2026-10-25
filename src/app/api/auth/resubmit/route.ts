import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { CollegeAuthService } from "@/lib/auth/collegeAuthStore";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("kce_session")?.value;

    if (!token) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const session = CollegeAuthService.verifySessionToken(token);
    if (!session) {
      return NextResponse.json({ error: "Session expired." }, { status: 401 });
    }

    const body = await req.json();
    const student = await CollegeAuthService.resubmitStudentProfile(session.userId, {
      rollNumber: body.rollNumber,
      collegeId: body.collegeId,
      department: body.department,
      academicYear: body.academicYear,
      graduationYear: body.graduationYear,
    });

    return NextResponse.json({
      success: true,
      message: "Corrected details submitted! Your profile is now under review by the KCE Placement Cell.",
      student,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to resubmit details." }, { status: 400 });
  }
}
