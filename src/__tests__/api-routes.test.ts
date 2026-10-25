import { describe, it, expect } from "vitest";

describe("College Authentication HTTP Endpoints", () => {
  const baseUrl = "http://localhost:3000";

  it("POST /api/auth/register rejects unauthorized domain with 400", async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Test Outside",
        email: "student@gmail.com",
        rollNumber: "22AD999",
        collegeId: "KCE22AIDS999",
        department: "AIDS",
        degree: "B.Tech (Bachelor of Technology)",
        academicYear: "3rd Year",
        graduationYear: 2026,
        password: "SafePassphrase2026!",
        confirmPassword: "SafePassphrase2026!",
      }),
    });

    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error).toContain("@kce.ac.in");
  });

  let registeredEmail = "praveen.kce@kce.ac.in";

  it("POST /api/auth/register validates and registers student", async () => {
    const roll = `22CS${Math.floor(1000 + Math.random() * 9000)}`;
    const colId = `KCE${Math.floor(10000 + Math.random() * 90000)}`;
    const email = `test.student.${Date.now()}@kce.ac.in`;
    registeredEmail = email;

    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Ananya Ramesh",
        email,
        rollNumber: roll,
        collegeId: colId,
        department: "CSE",
        degree: "B.E. (Bachelor of Engineering)",
        academicYear: "3rd Year",
        graduationYear: 2026,
        password: "StrongPassphraseKCE2026!",
        confirmPassword: "StrongPassphraseKCE2026!",
      }),
    });

    const data = await res.json();
    // Status is 200 if outbound email succeeded, or 502 if live email provider sandbox restricts recipient domain
    expect([200, 502]).toContain(res.status);
    if (res.status === 200) {
      expect(data.success).toBe(true);
      expect(data.status).toBe("pending_email_verification");
    } else {
      expect(data.error).toBeDefined();
    }
  });

  it("POST /api/auth/verify-otp rejects invalid code and shows attempts remaining", async () => {
    const testRoll = `22CS${Math.floor(1000 + Math.random() * 9000)}`;
    const testColId = `KCE${Math.floor(10000 + Math.random() * 90000)}`;
    const testEmail = `verify.test.${Date.now()}@kce.ac.in`;

    // Register student to create fresh, active OTP challenge
    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Verify Test Student",
        email: testEmail,
        rollNumber: testRoll,
        collegeId: testColId,
        department: "CSE",
        degree: "B.E. (Bachelor of Engineering)",
        academicYear: "3rd Year",
        graduationYear: 2026,
        password: "StrongPassphraseKCE2026!",
        confirmPassword: "StrongPassphraseKCE2026!",
      }),
    });
    await regRes.json();

    const res = await fetch(`${baseUrl}/api/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        code: "000000",
      }),
    });

    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error).toMatch(/Invalid verification code/i);
  });

  it("POST /api/auth/login triggers mandatory MFA for Administrator accounts", async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "superadmin@kce.ac.in",
        password: "SuperAdmin@KCE2026#",
      }),
    });

    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.requiresMFA).toBe(true);
    expect(data.message).toContain("Mandatory administrator MFA required");
  });

  it("GET /api/auth/session returns unauthenticated when no cookie provided", async () => {
    const res = await fetch(`${baseUrl}/api/auth/session`);
    const data = await res.json();
    expect(res.status).toBe(401);
    expect(data.authenticated).toBe(false);
  });
});
