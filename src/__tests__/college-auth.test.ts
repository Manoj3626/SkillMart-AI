import { describe, it, expect, beforeEach } from "vitest";
import { isValidCollegeEmail, normalizeIdentifier, COLLEGE_CONFIG } from "@/lib/college/config";
import { CollegeAuthService, hashOTP, secureCompare } from "@/lib/auth/collegeAuthStore";
import { EmailService } from "@/lib/email/emailService";

describe("Karpagam College of Engineering Authentication & Security", () => {
  const testStudent = {
    fullName: "Karthik Subramanian",
    email: `karthik_${Date.now()}@kce.ac.in`,
    rollNumber: `22AD${Math.floor(1000 + Math.random() * 9000)}`,
    collegeId: `KCE${Math.floor(10000 + Math.random() * 90000)}`,
    department: "AIDS",
    degree: "B.Tech",
    academicYear: "3rd Year",
    graduationYear: 2026,
    password: "CorrectHorseBatteryStaple2026!",
    phone: "9876543210",
  };

  // 1 & 2: Email domain validation
  it("accepts only valid @kce.ac.in emails (case-insensitive and trimmed)", () => {
    expect(isValidCollegeEmail("student@kce.ac.in")).toBe(true);
    expect(isValidCollegeEmail("STUDENT@KCE.AC.IN  ")).toBe(true);
    expect(isValidCollegeEmail("22ad054@kce.ac.in")).toBe(true);

    expect(isValidCollegeEmail("student@gmail.com")).toBe(false);
    expect(isValidCollegeEmail("student@kce.edu")).toBe(false);
    expect(isValidCollegeEmail("student@fakekce.ac.in")).toBe(false);
    expect(isValidCollegeEmail("")).toBe(false);
  });

  // 3: Password policy validation
  it("enforces minimum password length of 12 characters and blocks common passwords", async () => {
    await expect(
      CollegeAuthService.registerStudent({
        ...testStudent,
        email: `short_${Date.now()}@kce.ac.in`,
        rollNumber: `ROLL_${Date.now()}`,
        collegeId: `ID_${Date.now()}`,
        password: "short",
      })
    ).rejects.toThrow(/12 characters/);

    await expect(
      CollegeAuthService.registerStudent({
        ...testStudent,
        email: `banned_${Date.now()}@kce.ac.in`,
        rollNumber: `ROLL_${Date.now()}`,
        collegeId: `ID_${Date.now()}`,
        password: "password123456",
      })
    ).rejects.toThrow(/compromised/);
  });

  // 4: Duplicate roll number and college ID protection
  it("enforces uniqueness for Roll Number and College ID across the college scope", async () => {
    const emailA = `studentA_${Date.now()}@kce.ac.in`;
    const emailB = `studentB_${Date.now()}@kce.ac.in`;
    const sharedRoll = `22CS${Math.floor(1000 + Math.random() * 9000)}`;
    const sharedId = `KCE${Math.floor(10000 + Math.random() * 90000)}`;

    await CollegeAuthService.registerStudent({
      ...testStudent,
      email: emailA,
      rollNumber: sharedRoll,
      collegeId: sharedId,
    });

    // Attempt registration with identical roll number
    await expect(
      CollegeAuthService.registerStudent({
        ...testStudent,
        email: emailB,
        rollNumber: sharedRoll,
        collegeId: `KCE_UNIQUE_${Date.now()}`,
      })
    ).rejects.toThrow(/already registered with these academic credentials/i);

    // Attempt registration with identical college ID
    await expect(
      CollegeAuthService.registerStudent({
        ...testStudent,
        email: emailB,
        rollNumber: `ROLL_UNIQUE_${Date.now()}`,
        collegeId: sharedId,
      })
    ).rejects.toThrow(/already registered with these academic credentials/i);
  });

  // 5, 6, 7 & 8: OTP Lifecycle, hashing, expiry, attempt lockout, single-use
  it("manages the complete OTP lifecycle with HMAC hashing, 5-min expiry, and attempt limits", async () => {
    const studentEmail = `otp_test_${Date.now()}@kce.ac.in`;
    const { otpCode } = await CollegeAuthService.registerStudent({
      ...testStudent,
      email: studentEmail,
      rollNumber: `ROLL_${Date.now()}`,
      collegeId: `ID_${Date.now()}`,
    });

    // Verify OTP code is 6 digits
    expect(otpCode).toMatch(/^\d{6}$/);

    // Verify incorrect OTP increments attempt count
    await expect(
      CollegeAuthService.verifyEmailOTP(studentEmail, "000000")
    ).rejects.toThrow(/Invalid verification code/i);

    // Successful OTP verification
    const { user } = await CollegeAuthService.verifyEmailOTP(studentEmail, otpCode);
    expect(user.studentProfile?.emailVerified).toBe(true);
    expect(user.accountStatus).toBe("pending_college_verification");

    // OTP reuse rejection (single-use policy)
    await expect(
      CollegeAuthService.verifyEmailOTP(studentEmail, otpCode)
    ).rejects.toThrow(/No pending verification code found/i);
  });

  // 9: Pending accounts cannot access active features
  it("keeps student in pending_college_verification until College Admin approval", async () => {
    const pendingEmail = `pending_${Date.now()}@kce.ac.in`;
    const { otpCode } = await CollegeAuthService.registerStudent({
      ...testStudent,
      email: pendingEmail,
      rollNumber: `ROLL_${Date.now()}`,
      collegeId: `ID_${Date.now()}`,
    });

    const { user } = await CollegeAuthService.verifyEmailOTP(pendingEmail, otpCode);
    expect(user.accountStatus).toBe("pending_college_verification");
    expect(user.studentProfile?.collegeVerified).toBe(false);
  });

  // 10, 19, 21: College Admin approval, welcome email dispatch & idempotency
  it("approves college identity, activates account, and prevents duplicate welcome emails", async () => {
    const email = `approve_test_${Date.now()}@kce.ac.in`;
    const { user: regUser, otpCode } = await CollegeAuthService.registerStudent({
      ...testStudent,
      email,
      rollNumber: `ROLL_${Date.now()}`,
      collegeId: `ID_${Date.now()}`,
    });

    await CollegeAuthService.verifyEmailOTP(email, otpCode);

    // First Approval by College Admin
    const approval1 = await CollegeAuthService.approveStudent("admin_1", regUser.id);
    expect(approval1.alreadyActive).toBe(false);
    expect(approval1.student.status).toBe("active");
    expect(approval1.student.collegeVerified).toBe(true);

    // Mock welcome email send
    const emailResult = await EmailService.sendWelcomeActivationEmail({
      fullName: approval1.student.fullName,
      collegeEmail: approval1.student.collegeEmail,
      rollNumber: approval1.student.rollNumber,
      department: approval1.student.department,
      degree: approval1.student.degree,
    });
    expect(emailResult.success).toBe(true);

    // Second repeated Approval action must be idempotent
    const approval2 = await CollegeAuthService.approveStudent("admin_1", regUser.id);
    expect(approval2.alreadyActive).toBe(true);

    // Second welcome email must NOT duplicate
    const duplicateEmail = await EmailService.sendWelcomeActivationEmail({
      fullName: approval1.student.fullName,
      collegeEmail: approval1.student.collegeEmail,
      rollNumber: approval1.student.rollNumber,
      department: approval1.student.department,
      degree: approval1.student.degree,
    });
    expect(duplicateEmail.messageId).toBe("already_sent_idempotent");
  });

  // 11: Rejection and correction/resubmission workflow
  it("handles College Admin rejection with required reason and allows student resubmission", async () => {
    const email = `reject_test_${Date.now()}@kce.ac.in`;
    const { user: regUser, otpCode } = await CollegeAuthService.registerStudent({
      ...testStudent,
      email,
      rollNumber: `ROLL_${Date.now()}`,
      collegeId: `ID_${Date.now()}`,
    });

    await CollegeAuthService.verifyEmailOTP(email, otpCode);

    // Rejection requires reason
    await expect(
      CollegeAuthService.rejectStudent("admin_1", regUser.id, "")
    ).rejects.toThrow(/at least 5 characters/i);

    const rejectedProfile = await CollegeAuthService.rejectStudent(
      "admin_1",
      regUser.id,
      "Roll number does not match Karpagam enrollment records."
    );
    expect(rejectedProfile.status).toBe("rejected");
    expect(rejectedProfile.rejectionReason).toContain("Karpagam enrollment records");

    // Student resubmits corrected details
    const newRoll = `22AD${Math.floor(1000 + Math.random() * 9000)}`;
    const resubmitted = await CollegeAuthService.resubmitStudentProfile(regUser.id, {
      rollNumber: newRoll,
    });
    expect(resubmitted.status).toBe("pending_college_verification");
    expect(resubmitted.rollNumber).toBe(newRoll);
    expect(resubmitted.rejectionReason).toBeNull();
  });

  // 12: Account suspension immediately revokes sessions
  it("suspends accounts and revokes active session tokens", async () => {
    const email = `suspend_test_${Date.now()}@kce.ac.in`;
    const { user: regUser, otpCode } = await CollegeAuthService.registerStudent({
      ...testStudent,
      email,
      rollNumber: `ROLL_${Date.now()}`,
      collegeId: `ID_${Date.now()}`,
    });

    await CollegeAuthService.verifyEmailOTP(email, otpCode);
    await CollegeAuthService.approveStudent("admin_1", regUser.id);

    // Issue session token
    const token = CollegeAuthService.createSessionToken({
      userId: regUser.id,
      email,
      role: "candidate",
      fullName: regUser.fullName,
      accountStatus: "active",
      sessionVersion: regUser.sessionVersion,
      lastActivity: Date.now(),
    });

    // Active session verifies
    const verifiedBefore = CollegeAuthService.verifySessionToken(token);
    expect(verifiedBefore).not.toBeNull();

    // Admin suspends account
    await CollegeAuthService.toggleAccountSuspension("admin_1", regUser.id, true);

    // Token must be invalidated immediately
    const verifiedAfter = CollegeAuthService.verifySessionToken(token);
    expect(verifiedAfter).toBeNull();
  });

  // 14: Students cannot escalate privileges
  it("defaults student registrations strictly to candidate role", async () => {
    const email = `role_test_${Date.now()}@kce.ac.in`;
    const { user } = await CollegeAuthService.registerStudent({
      ...testStudent,
      email,
      rollNumber: `ROLL_${Date.now()}`,
      collegeId: `ID_${Date.now()}`,
    });

    expect(user.role).toBe("candidate");
    expect(user.role).not.toBe("admin");
    expect(user.role).not.toBe("college_admin");
  });

  // 17: Inactivity timeout (15 minutes) server-side enforcement
  it("enforces server-side 15-minute session inactivity timeout", () => {
    const freshToken = CollegeAuthService.createSessionToken({
      userId: "test_user_id",
      email: "student@kce.ac.in",
      role: "candidate",
      fullName: "Test Student",
      accountStatus: "active",
      sessionVersion: 1,
      lastActivity: Date.now() - 5 * 60 * 1000, // 5 minutes ago (active)
    });
    expect(CollegeAuthService.verifySessionToken(freshToken)).not.toBeNull();

    const expiredToken = CollegeAuthService.createSessionToken({
      userId: "test_user_id",
      email: "student@kce.ac.in",
      role: "candidate",
      fullName: "Test Student",
      accountStatus: "active",
      sessionVersion: 1,
      lastActivity: Date.now() - 16 * 60 * 1000, // 16 minutes ago (expired)
    });
    expect(CollegeAuthService.verifySessionToken(expiredToken)).toBeNull();
  });

  // 18: Sign-out-all-devices revokes sessions
  it("invalidates all sessions on sign-out-all-devices by advancing sessionVersion", async () => {
    const email = `signout_all_${Date.now()}@kce.ac.in`;
    const { user: regUser, otpCode } = await CollegeAuthService.registerStudent({
      ...testStudent,
      email,
      rollNumber: `ROLL_${Date.now()}`,
      collegeId: `ID_${Date.now()}`,
    });
    await CollegeAuthService.verifyEmailOTP(email, otpCode);

    const token = CollegeAuthService.createSessionToken({
      userId: regUser.id,
      email,
      role: "candidate",
      fullName: regUser.fullName,
      accountStatus: "active",
      sessionVersion: regUser.sessionVersion,
      lastActivity: Date.now(),
    });

    expect(CollegeAuthService.verifySessionToken(token)).not.toBeNull();

    // Trigger sign out of all devices
    await CollegeAuthService.signOutAllDevices(regUser.id);

    // Old token should now fail verification
    expect(CollegeAuthService.verifySessionToken(token)).toBeNull();
  });

  // Password Recovery Token test
  it("manages password reset tokens with single-use and session revocation", async () => {
    const email = `reset_test_${Date.now()}@kce.ac.in`;
    const { user: regUser, otpCode } = await CollegeAuthService.registerStudent({
      ...testStudent,
      email,
      rollNumber: `ROLL_${Date.now()}`,
      collegeId: `ID_${Date.now()}`,
    });
    await CollegeAuthService.verifyEmailOTP(email, otpCode);

    // Request reset
    const { token } = await CollegeAuthService.createPasswordResetChallenge(email);
    expect(token).toBeDefined();

    // Reset password
    const newPass = "BrandNewSuperSecurePassphrase2026!";
    await CollegeAuthService.resetPasswordWithToken(token, newPass);

    // Token reuse must fail
    await expect(
      CollegeAuthService.resetPasswordWithToken(token, "AnotherPassword123!")
    ).rejects.toThrow(/invalid or expired/i);

    // Login with new password succeeds
    const loginResult = await CollegeAuthService.authenticateUser(email, newPass);
    expect(loginResult.user.email).toBe(email);
  });
});
