import { NextResponse, type NextRequest } from "next/server";
import { CollegeAuthService } from "@/lib/auth/collegeAuthStore";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  let response = NextResponse.next({ request });

  // 1. Check college session cookie
  const sessionCookie = request.cookies.get("kce_session")?.value;
  let session = sessionCookie ? CollegeAuthService.verifySessionToken(sessionCookie) : null;

  // Protected route categories
  const candidateRoutes = [
    "/dashboard",
    "/interviews",
    "/interview",
    "/resume",
    "/skills",
    "/portfolio",
    "/settings",
    "/learn",
  ];
  const collegeRoutes = ["/college"];
  const adminRoutes = ["/admin"];

  const isCandidateProtected = candidateRoutes.some((p) => pathname.startsWith(p));
  const isCollegeProtected = collegeRoutes.some((p) => pathname.startsWith(p));
  const isAdminProtected = adminRoutes.some((p) => pathname.startsWith(p));
  const isProtected = isCandidateProtected || isCollegeProtected || isAdminProtected;

  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password");

  // A. Unauthenticated user accessing protected route
  if (!session && isProtected) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // B. Authenticated user checks
  if (session) {
    // 1. Role-based protection
    if (isAdminProtected && session.role !== "admin") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = session.role === "college_admin" ? "/college/dashboard" : "/dashboard";
      return NextResponse.redirect(redirectUrl);
    }

    if (isCollegeProtected && session.role !== "college_admin" && session.role !== "admin") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/dashboard";
      return NextResponse.redirect(redirectUrl);
    }

    // 2. Student Account Status Lifecycle Enforcement
    // Only ACTIVE accounts can access protected candidate features (interview, resume, etc.)
    if (session.role === "candidate" && isCandidateProtected) {
      if (session.accountStatus !== "active") {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = session.accountStatus === "pending_email_verification" ? "/verify-otp" : "/status";
        return NextResponse.redirect(redirectUrl);
      }
    }

    // 3. User visits auth pages while logged in
    if (isAuthPage) {
      const redirectUrl = request.nextUrl.clone();
      if (session.role === "admin") {
        redirectUrl.pathname = "/admin/dashboard";
      } else if (session.role === "college_admin") {
        redirectUrl.pathname = "/college/dashboard";
      } else if (session.accountStatus !== "active") {
        redirectUrl.pathname = session.accountStatus === "pending_email_verification" ? "/verify-otp" : "/status";
      } else {
        redirectUrl.pathname = "/dashboard";
      }
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
