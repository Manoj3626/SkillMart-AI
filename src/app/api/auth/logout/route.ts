import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { CollegeAuthService } from "@/lib/auth/collegeAuthStore";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("kce_session")?.value;
    const body = await req.json().catch(() => ({}));
    const signOutAll = body?.allDevices === true;

    if (token) {
      const session = CollegeAuthService.verifySessionToken(token);
      if (session && signOutAll) {
        await CollegeAuthService.signOutAllDevices(session.userId);
      }
    }

    const response = NextResponse.json({
      success: true,
      message: signOutAll ? "Signed out of all devices successfully." : "Signed out successfully.",
    });

    response.cookies.delete("kce_session");
    return response;
  } catch (err: any) {
    const response = NextResponse.json({ success: true });
    response.cookies.delete("kce_session");
    return response;
  }
}
