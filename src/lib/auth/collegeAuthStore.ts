import crypto from "crypto";
import fs from "fs";
import path from "path";
import { COLLEGE_CONFIG, isValidCollegeEmail, normalizeIdentifier } from "@/lib/college/config";
import type { StudentProfile, AccountStatus, OTPChallenge, AdminProfile, AuditLog, UserRole } from "@/types";

// Common / compromised passwords to block
const BANNED_PASSWORDS = new Set([
  "password123456",
  "123456789012",
  "karpagamcollege",
  "kceplacement2026",
  "welcome123456",
  "administrator1",
  "student123456",
  "qwertyuiop12",
  "ilovemycollege",
  "changeMe12345",
]);

export interface StoredUser {
  id: string;
  email: string;
  passwordHash: string;
  salt: string;
  role: UserRole;
  fullName: string;
  accountStatus: AccountStatus;
  sessionVersion: number;
  lastActivity: string;
  failedLoginAttempts: number;
  lockoutUntil?: string | null;
  mfaSecret?: string | null;
  studentProfile?: StudentProfile;
  adminProfile?: AdminProfile;
  createdAt: string;
  updatedAt: string;
}

export interface SessionData {
  userId: string;
  email: string;
  role: UserRole;
  fullName: string;
  accountStatus: AccountStatus;
  sessionVersion: number;
  lastActivity: number;
}

// In-memory + persistent fallback file storage path
const DATA_DIR = path.join(process.cwd(), "data");
const STORE_FILE = path.join(DATA_DIR, "college_auth_store.json");

interface StoreSchema {
  users: Record<string, StoredUser>; // keyed by email (lowercase)
  usersById: Record<string, string>; // userId -> email
  rollNumbers: Record<string, string>; // normalized roll -> email
  collegeIds: Record<string, string>; // normalized collegeId -> email
  otpChallenges: Record<string, OTPChallenge>; // challengeId -> OTPChallenge
  auditLogs: AuditLog[];
}

let storeMemory: StoreSchema | null = null;

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch {}
}

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString("hex");
}

export function secureCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, "hex");
    const bufB = Buffer.from(b, "hex");
    return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

function getSecretKey(): string {
  return process.env.AUTH_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "kce-skillmatch-auth-secret-key-2026";
}

export function hashOTP(code: string, identifier: string): string {
  return crypto
    .createHmac("sha256", getSecretKey())
    .update(`${identifier.toLowerCase().trim()}:${code.trim()}`)
    .digest("hex");
}

function initInitialStore(): StoreSchema {
  ensureDataDir();
  if (fs.existsSync(STORE_FILE)) {
    try {
      const content = fs.readFileSync(STORE_FILE, "utf-8");
      return JSON.parse(content);
    } catch {
      // Fallback if file corrupted
    }
  }

  // Initial bootstrap store with default Super Admin and College Admin for Karpagam College of Engineering
  const initialStore: StoreSchema = {
    users: {},
    usersById: {},
    rollNumbers: {},
    collegeIds: {},
    otpChallenges: {},
    auditLogs: [],
  };

  // Bootstrap Super Admin: superadmin@kce.ac.in
  const superAdminSalt = crypto.randomBytes(16).toString("hex");
  const superAdminId = "usr_superadmin_kce_001";
  const superAdminUser: StoredUser = {
    id: superAdminId,
    email: "superadmin@kce.ac.in",
    passwordHash: hashPassword("SuperAdmin@KCE2026#", superAdminSalt),
    salt: superAdminSalt,
    role: "admin",
    fullName: "Dr. K. Senthil Kumar (Super Admin)",
    accountStatus: "active",
    sessionVersion: 1,
    lastActivity: new Date().toISOString(),
    failedLoginAttempts: 0,
    mfaSecret: "KCE_ADMIN_MFA_SECRET",
    adminProfile: {
      id: "adm_001",
      userId: superAdminId,
      fullName: "Dr. K. Senthil Kumar",
      email: "superadmin@kce.ac.in",
      role: "admin",
      collegeScope: "KCE",
      mfaEnabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Bootstrap College Admin: placement.admin@kce.ac.in
  const collegeAdminSalt = crypto.randomBytes(16).toString("hex");
  const collegeAdminId = "usr_collegeadmin_kce_002";
  const collegeAdminUser: StoredUser = {
    id: collegeAdminId,
    email: "placement.admin@kce.ac.in",
    passwordHash: hashPassword("CollegeAdmin@KCE2026#", collegeAdminSalt),
    salt: collegeAdminSalt,
    role: "college_admin",
    fullName: "Prof. R. Anand (Placement Officer)",
    accountStatus: "active",
    sessionVersion: 1,
    lastActivity: new Date().toISOString(),
    failedLoginAttempts: 0,
    mfaSecret: "KCE_COLLEGE_MFA_SECRET",
    adminProfile: {
      id: "adm_002",
      userId: collegeAdminId,
      fullName: "Prof. R. Anand",
      email: "placement.admin@kce.ac.in",
      role: "college_admin",
      collegeScope: "KCE",
      mfaEnabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  initialStore.users[superAdminUser.email] = superAdminUser;
  initialStore.usersById[superAdminId] = superAdminUser.email;

  initialStore.users[collegeAdminUser.email] = collegeAdminUser;
  initialStore.usersById[collegeAdminId] = collegeAdminUser.email;

  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(initialStore, null, 2), "utf-8");
  } catch {}

  return initialStore;
}

function getStore(): StoreSchema {
  ensureDataDir();
  if (fs.existsSync(STORE_FILE)) {
    try {
      const content = fs.readFileSync(STORE_FILE, "utf-8");
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed === "object" && parsed.users) {
        storeMemory = parsed as StoreSchema;
        return storeMemory;
      }
    } catch (err) {
      console.error("Failed to parse store file:", err);
    }
  }
  if (!storeMemory) {
    storeMemory = initInitialStore();
  }
  return storeMemory;
}

function saveStore(store: StoreSchema) {
  storeMemory = store;
  try {
    ensureDataDir();
    fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to persist college auth store:", err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// College Auth Operations
// ─────────────────────────────────────────────────────────────────────────────

export interface RegisterStudentInput {
  fullName: string;
  email: string;
  rollNumber: string;
  collegeId: string;
  department: string;
  degree: string;
  academicYear: string;
  graduationYear: number;
  password: string;
  phone?: string | null;
}

export class CollegeAuthService {
  /**
   * Register a new student account at Karpagam College of Engineering.
   */
  static async registerStudent(input: RegisterStudentInput): Promise<{
    user: StoredUser;
    otpCode: string; // Plaintext OTP returned ONLY to send via email service
  }> {
    const store = getStore();

    // 1. Email domain check
    const normalizedEmail = input.email.trim().toLowerCase();
    if (!isValidCollegeEmail(normalizedEmail)) {
      throw new Error("Registration is restricted to official Karpagam College of Engineering accounts ending in @kce.ac.in");
    }

    // 2. Password validation
    if (!input.password || input.password.length < COLLEGE_CONFIG.security.minPasswordLength) {
      throw new Error(`Password must be at least ${COLLEGE_CONFIG.security.minPasswordLength} characters long.`);
    }
    if (BANNED_PASSWORDS.has(input.password.toLowerCase().trim())) {
      throw new Error("This password is too common or known to be compromised. Please choose a unique passphrase.");
    }

    // 3. Uniqueness checks (Generic error messages to prevent student data enumeration)
    const normalizedRoll = normalizeIdentifier(input.rollNumber);
    const normalizedCollegeId = normalizeIdentifier(input.collegeId);

    if (!normalizedRoll || !normalizedCollegeId) {
      throw new Error("Roll Number and College ID are required.");
    }

    if (store.users[normalizedEmail]) {
      throw new Error("An account is already associated with this college identifier. Please sign in or use password recovery.");
    }
    if (store.rollNumbers[normalizedRoll]) {
      throw new Error("An account is already registered with these academic credentials. Please contact the KCE Placement Office if you believe this is an error.");
    }
    if (store.collegeIds[normalizedCollegeId]) {
      throw new Error("An account is already registered with these academic credentials. Please contact the KCE Placement Office if you believe this is an error.");
    }

    // 4. Validate Department, Degree, Academic Year
    const validDept = COLLEGE_CONFIG.departments.some((d) => d.name === input.department || d.code === input.department);
    if (!validDept) {
      throw new Error("Invalid department selected. Please choose an eligible KCE department.");
    }
    const validDegree = COLLEGE_CONFIG.degrees.some(
      (d) => d === input.degree || d.startsWith(input.degree) || input.degree.startsWith(d.split(" ")[0])
    );
    if (!validDegree) {
      throw new Error("Invalid degree program selected.");
    }

    // 5. Create password salt and hash
    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHash = hashPassword(input.password, salt);
    const userId = `usr_std_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;

    const studentProfile: StudentProfile = {
      id: `prof_${Date.now()}`,
      userId,
      fullName: input.fullName.trim(),
      collegeEmail: normalizedEmail,
      rollNumber: normalizedRoll,
      collegeId: normalizedCollegeId,
      department: input.department.trim(),
      degree: input.degree.trim(),
      academicYear: input.academicYear.trim(),
      graduationYear: Number(input.graduationYear),
      phone: input.phone?.trim() || null,
      emailVerified: false,
      collegeVerified: false,
      status: "pending_email_verification",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newUser: StoredUser = {
      id: userId,
      email: normalizedEmail,
      passwordHash,
      salt,
      role: "candidate",
      fullName: input.fullName.trim(),
      accountStatus: "pending_email_verification",
      sessionVersion: 1,
      lastActivity: new Date().toISOString(),
      failedLoginAttempts: 0,
      studentProfile,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Store records atomically
    store.users[normalizedEmail] = newUser;
    store.usersById[userId] = normalizedEmail;
    store.rollNumbers[normalizedRoll] = normalizedEmail;
    store.collegeIds[normalizedCollegeId] = normalizedEmail;

    // 6. Generate 6-digit cryptographic OTP for email verification
    const otpCode = crypto.randomInt(100000, 999999).toString();
    const challengeId = `otp_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    const expiresAt = new Date(Date.now() + COLLEGE_CONFIG.security.otpExpiryMinutes * 60 * 1000).toISOString();
    const resendCooldownUntil = new Date(Date.now() + COLLEGE_CONFIG.security.otpResendCooldownSeconds * 1000).toISOString();

    const otpChallenge: OTPChallenge = {
      id: challengeId,
      identifier: normalizedEmail,
      purpose: "email_verification",
      hashedCode: hashOTP(otpCode, normalizedEmail),
      expiresAt,
      attemptCount: 0,
      maxAttempts: COLLEGE_CONFIG.security.otpMaxAttempts,
      resendCooldownUntil,
      used: false,
      createdAt: new Date().toISOString(),
    };

    store.otpChallenges[challengeId] = otpChallenge;

    // Audit log
    store.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      actorId: userId,
      actorRole: "candidate",
      action: "STUDENT_REGISTERED",
      targetType: "student_profile",
      targetId: userId,
      details: {
        collegeEmail: normalizedEmail,
        department: input.department,
        rollNumberMasked: normalizedRoll.slice(0, 3) + "***",
      },
      createdAt: new Date().toISOString(),
    });

    saveStore(store);

    return { user: newUser, otpCode };
  }

  /**
   * Verify single-use OTP challenge for email verification.
   */
  static async verifyEmailOTP(email: string, code: string): Promise<{
    user: StoredUser;
    success: boolean;
  }> {
    const store = getStore();
    const normalizedEmail = email.trim().toLowerCase();
    const user = store.users[normalizedEmail];

    if (!user) {
      throw new Error("Invalid verification request.");
    }

    // Find the latest active OTP challenge for this email
    const challenges = Object.values(store.otpChallenges)
      .filter((c) => c.identifier === normalizedEmail && c.purpose === "email_verification" && !c.used)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const activeChallenge = challenges[0];
    if (!activeChallenge) {
      throw new Error("No pending verification code found. Please request a new code.");
    }

    // Check expiry
    if (new Date(activeChallenge.expiresAt).getTime() < Date.now()) {
      throw new Error("Verification code has expired. Please request a new code.");
    }

    // Check attempt limit
    if (activeChallenge.attemptCount >= activeChallenge.maxAttempts) {
      throw new Error("Maximum attempts exceeded. For security, please request a new verification code.");
    }

    activeChallenge.attemptCount += 1;

    // Verify cryptographic HMAC
    const expectedHash = hashOTP(code, normalizedEmail);
    const isValid = secureCompare(activeChallenge.hashedCode, expectedHash);

    if (!isValid) {
      saveStore(store);
      const remaining = activeChallenge.maxAttempts - activeChallenge.attemptCount;
      throw new Error(`Invalid verification code. ${remaining > 0 ? `${remaining} attempts remaining.` : "Please request a new code."}`);
    }

    // Mark challenge as used (single-use)
    activeChallenge.used = true;

    // Advance student lifecycle to pending_college_verification
    user.accountStatus = "pending_college_verification";
    if (user.studentProfile) {
      user.studentProfile.emailVerified = true;
      user.studentProfile.status = "pending_college_verification";
      user.studentProfile.updatedAt = new Date().toISOString();
    }
    user.updatedAt = new Date().toISOString();

    store.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      actorId: user.id,
      actorRole: "candidate",
      action: "EMAIL_OTP_VERIFIED",
      targetType: "user",
      targetId: user.id,
      details: { email: normalizedEmail },
      createdAt: new Date().toISOString(),
    });

    saveStore(store);
    return { user, success: true };
  }

  /**
   * Resend OTP with strict 30-second cooldown and invalidation of old challenges.
   */
  static async resendOTP(email: string, purpose: "email_verification" | "password_reset" | "admin_mfa"): Promise<{
    otpCode: string;
  }> {
    const store = getStore();
    const normalizedEmail = email.trim().toLowerCase();
    const user = store.users[normalizedEmail];

    if (!user) {
      // Generic non-revealing error
      throw new Error("If an account exists, a verification code will be sent.");
    }

    // Check cooldown on existing challenges
    const existing = Object.values(store.otpChallenges)
      .filter((c) => c.identifier === normalizedEmail && c.purpose === purpose && !c.used)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

    if (existing && new Date(existing.resendCooldownUntil).getTime() > Date.now()) {
      const waitSecs = Math.ceil((new Date(existing.resendCooldownUntil).getTime() - Date.now()) / 1000);
      throw new Error(`Please wait ${waitSecs} seconds before requesting another code.`);
    }

    // Invalidate previous challenges
    Object.values(store.otpChallenges).forEach((c) => {
      if (c.identifier === normalizedEmail && c.purpose === purpose) {
        c.used = true;
      }
    });

    // Create new challenge
    const otpCode = crypto.randomInt(100000, 999999).toString();
    const challengeId = `otp_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    const expiresAt = new Date(Date.now() + COLLEGE_CONFIG.security.otpExpiryMinutes * 60 * 1000).toISOString();
    const resendCooldownUntil = new Date(Date.now() + COLLEGE_CONFIG.security.otpResendCooldownSeconds * 1000).toISOString();

    const newChallenge: OTPChallenge = {
      id: challengeId,
      identifier: normalizedEmail,
      purpose,
      hashedCode: hashOTP(otpCode, normalizedEmail),
      expiresAt,
      attemptCount: 0,
      maxAttempts: COLLEGE_CONFIG.security.otpMaxAttempts,
      resendCooldownUntil,
      used: false,
      createdAt: new Date().toISOString(),
    };

    store.otpChallenges[challengeId] = newChallenge;
    saveStore(store);

    return { otpCode };
  }

  /**
   * Authenticate user with password and return session token.
   */
  static async authenticateUser(email: string, password: string): Promise<{
    user: StoredUser;
    requiresMFA: boolean;
    sessionToken: string;
  }> {
    const store = getStore();
    const normalizedEmail = email.trim().toLowerCase();
    const user = store.users[normalizedEmail];

    if (!user) {
      throw new Error("Invalid email or password.");
    }

    // Check lockout
    if (user.lockoutUntil && new Date(user.lockoutUntil).getTime() > Date.now()) {
      const waitMin = Math.ceil((new Date(user.lockoutUntil).getTime() - Date.now()) / (60 * 1000));
      throw new Error(`Account temporarily locked due to failed attempts. Please try again in ${waitMin} minute(s).`);
    }

    const testHash = hashPassword(password, user.salt);
    const valid = secureCompare(user.passwordHash, testHash);

    if (!valid) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      if (user.failedLoginAttempts >= 5) {
        user.lockoutUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 min lockout
      }
      saveStore(store);
      throw new Error("Invalid email or password.");
    }

    // Reset failed attempts on success
    user.failedLoginAttempts = 0;
    user.lockoutUntil = null;
    user.lastActivity = new Date().toISOString();

    // Check if user requires MFA (Mandatory for College Admin & Super Admin)
    const requiresMFA = user.role === "college_admin" || user.role === "admin";

    // Create session token payload
    const token = this.createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      accountStatus: user.accountStatus,
      sessionVersion: user.sessionVersion,
      lastActivity: Date.now(),
    });

    store.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      actorId: user.id,
      actorRole: user.role,
      action: "USER_SIGNED_IN",
      targetType: "user",
      targetId: user.id,
      details: { email: user.email, requiresMFA },
      createdAt: new Date().toISOString(),
    });

    saveStore(store);

    return {
      user,
      requiresMFA,
      sessionToken: token,
    };
  }

  /**
   * Create a secure password reset challenge with hashed token and 15-minute expiry.
   */
  static async createPasswordResetChallenge(email: string): Promise<{ token: string }> {
    const store = getStore();
    const normalizedEmail = email.trim().toLowerCase();
    const user = store.users[normalizedEmail];

    if (!user) {
      // Non-revealing generic message
      return { token: crypto.randomBytes(32).toString("hex") };
    }

    // Invalidate prior reset tokens
    Object.values(store.otpChallenges).forEach((c) => {
      if (c.identifier === normalizedEmail && c.purpose === "password_reset") {
        c.used = true;
      }
    });

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const challengeId = `reset_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins

    store.otpChallenges[challengeId] = {
      id: challengeId,
      identifier: normalizedEmail,
      purpose: "password_reset",
      hashedCode: tokenHash,
      expiresAt,
      attemptCount: 0,
      maxAttempts: 5,
      resendCooldownUntil: new Date().toISOString(),
      used: false,
      createdAt: new Date().toISOString(),
    };

    store.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      actorId: user.id,
      actorRole: user.role,
      action: "PASSWORD_RESET_REQUESTED",
      targetType: "user",
      targetId: user.id,
      details: { email: user.email },
      createdAt: new Date().toISOString(),
    });

    saveStore(store);
    return { token };
  }

  /**
   * Complete password reset with single-use token and revoke all existing sessions.
   */
  static async resetPasswordWithToken(token: string, newPassword: string): Promise<{ success: boolean; email: string }> {
    const store = getStore();
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const challenge = Object.values(store.otpChallenges).find(
      (c) => c.purpose === "password_reset" && !c.used && secureCompare(c.hashedCode, tokenHash)
    );

    if (!challenge) {
      throw new Error("Password reset token is invalid or expired.");
    }

    if (new Date(challenge.expiresAt).getTime() < Date.now()) {
      challenge.used = true;
      saveStore(store);
      throw new Error("Password reset token is invalid or expired.");
    }

    if (!newPassword || newPassword.length < COLLEGE_CONFIG.security.minPasswordLength) {
      throw new Error(`Password must be at least ${COLLEGE_CONFIG.security.minPasswordLength} characters long.`);
    }

    if (BANNED_PASSWORDS.has(newPassword.toLowerCase().trim())) {
      throw new Error("This password is too common or known to be compromised. Please choose a unique passphrase.");
    }

    const user = store.users[challenge.identifier];
    if (!user) {
      throw new Error("Account not found.");
    }

    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHash = hashPassword(newPassword, salt);

    user.passwordHash = passwordHash;
    user.salt = salt;
    user.failedLoginAttempts = 0;
    user.lockoutUntil = null;
    // Invalidate all active sessions across all devices
    user.sessionVersion += 1;
    user.updatedAt = new Date().toISOString();

    challenge.used = true;

    store.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      actorId: user.id,
      actorRole: user.role,
      action: "PASSWORD_RESET_COMPLETED",
      targetType: "user",
      targetId: user.id,
      details: { email: user.email },
      createdAt: new Date().toISOString(),
    });

    saveStore(store);
    return { success: true, email: user.email };
  }

  /**
   * College Admin approval: activates student account and verifies required details.
   */
  static async approveStudent(adminUserId: string, targetStudentUserId: string): Promise<{
    student: StudentProfile;
    alreadyActive: boolean;
  }> {
    const store = getStore();
    const targetEmail = store.usersById[targetStudentUserId];
    if (!targetEmail) throw new Error("Student account not found.");

    const user = store.users[targetEmail];
    if (!user || !user.studentProfile) throw new Error("Student profile not found.");

    // Idempotent: If already active, return without duplicate operations
    if (user.accountStatus === "active") {
      return { student: user.studentProfile, alreadyActive: true };
    }

    // Only approve if email is verified
    if (!user.studentProfile.emailVerified) {
      throw new Error("Cannot approve student before official college email verification is completed.");
    }

    user.accountStatus = "active";
    user.studentProfile.status = "active";
    user.studentProfile.collegeVerified = true;
    user.studentProfile.rejectionReason = null;
    user.studentProfile.approvedBy = adminUserId;
    user.studentProfile.approvedAt = new Date().toISOString();
    user.studentProfile.updatedAt = new Date().toISOString();
    user.updatedAt = new Date().toISOString();

    store.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      actorId: adminUserId,
      actorRole: "college_admin",
      action: "STUDENT_APPROVED_AND_ACTIVATED",
      targetType: "student_profile",
      targetId: targetStudentUserId,
      details: {
        studentEmail: user.email,
        rollNumber: user.studentProfile.rollNumber,
        department: user.studentProfile.department,
      },
      createdAt: new Date().toISOString(),
    });

    saveStore(store);
    return { student: user.studentProfile, alreadyActive: false };
  }

  /**
   * College Admin rejection: marks student as rejected with mandatory reason.
   */
  static async rejectStudent(adminUserId: string, targetStudentUserId: string, reason: string): Promise<StudentProfile> {
    const store = getStore();
    const targetEmail = store.usersById[targetStudentUserId];
    if (!targetEmail) throw new Error("Student account not found.");

    const user = store.users[targetEmail];
    if (!user || !user.studentProfile) throw new Error("Student profile not found.");

    if (!reason || reason.trim().length < 5) {
      throw new Error("A specific rejection reason (at least 5 characters) is required.");
    }

    user.accountStatus = "rejected";
    user.studentProfile.status = "rejected";
    user.studentProfile.collegeVerified = false;
    user.studentProfile.rejectionReason = reason.trim();
    user.studentProfile.updatedAt = new Date().toISOString();
    user.updatedAt = new Date().toISOString();

    store.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      actorId: adminUserId,
      actorRole: "college_admin",
      action: "STUDENT_VERIFICATION_REJECTED",
      targetType: "student_profile",
      targetId: targetStudentUserId,
      details: {
        studentEmail: user.email,
        reason: reason.trim(),
      },
      createdAt: new Date().toISOString(),
    });

    saveStore(store);
    return user.studentProfile;
  }

  /**
   * Student resubmits corrected college details after rejection.
   */
  static async resubmitStudentProfile(
    studentUserId: string,
    updates: {
      rollNumber?: string;
      collegeId?: string;
      department?: string;
      academicYear?: string;
      graduationYear?: number;
    }
  ): Promise<StudentProfile> {
    const store = getStore();
    const email = store.usersById[studentUserId];
    if (!email) throw new Error("Account not found.");

    const user = store.users[email];
    if (!user || !user.studentProfile) throw new Error("Student profile not found.");

    if (user.accountStatus !== "rejected") {
      throw new Error("Resubmission is only allowed for rejected profiles.");
    }

    // Check new roll number uniqueness if changed
    if (updates.rollNumber) {
      const normRoll = normalizeIdentifier(updates.rollNumber);
      if (store.rollNumbers[normRoll] && store.rollNumbers[normRoll] !== email) {
        throw new Error("The specified roll number is already in use by another student.");
      }
      delete store.rollNumbers[user.studentProfile.rollNumber];
      user.studentProfile.rollNumber = normRoll;
      store.rollNumbers[normRoll] = email;
    }

    if (updates.collegeId) {
      const normId = normalizeIdentifier(updates.collegeId);
      if (store.collegeIds[normId] && store.collegeIds[normId] !== email) {
        throw new Error("The specified college ID is already in use by another student.");
      }
      delete store.collegeIds[user.studentProfile.collegeId];
      user.studentProfile.collegeId = normId;
      store.collegeIds[normId] = email;
    }

    if (updates.department) user.studentProfile.department = updates.department.trim();
    if (updates.academicYear) user.studentProfile.academicYear = updates.academicYear.trim();
    if (updates.graduationYear) user.studentProfile.graduationYear = Number(updates.graduationYear);

    // Return to pending_college_verification
    user.accountStatus = "pending_college_verification";
    user.studentProfile.status = "pending_college_verification";
    user.studentProfile.rejectionReason = null;
    user.studentProfile.updatedAt = new Date().toISOString();
    user.updatedAt = new Date().toISOString();

    store.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      actorId: studentUserId,
      actorRole: "candidate",
      action: "STUDENT_RESUBMITTED_DETAILS",
      targetType: "student_profile",
      targetId: studentUserId,
      details: updates,
      createdAt: new Date().toISOString(),
    });

    saveStore(store);
    return user.studentProfile;
  }

  /**
   * Suspend or unsuspend account.
   */
  static async toggleAccountSuspension(adminUserId: string, targetUserId: string, suspend: boolean): Promise<StoredUser> {
    const store = getStore();
    const targetEmail = store.usersById[targetUserId];
    if (!targetEmail) throw new Error("User not found.");

    const user = store.users[targetEmail];
    if (!user) throw new Error("User not found.");

    user.accountStatus = suspend ? "suspended" : "active";
    if (user.studentProfile) {
      user.studentProfile.status = user.accountStatus;
      user.studentProfile.updatedAt = new Date().toISOString();
    }
    // Invalidate all active sessions immediately
    user.sessionVersion += 1;
    user.updatedAt = new Date().toISOString();

    store.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      actorId: adminUserId,
      actorRole: "admin",
      action: suspend ? "ACCOUNT_SUSPENDED" : "ACCOUNT_RESTORED",
      targetType: "user",
      targetId: targetUserId,
      details: { email: user.email },
      createdAt: new Date().toISOString(),
    });

    saveStore(store);
    return user;
  }

  /**
   * Sign out of all devices by incrementing session version.
   */
  static async signOutAllDevices(userId: string): Promise<void> {
    const store = getStore();
    const email = store.usersById[userId];
    if (!email) return;

    const user = store.users[email];
    if (user) {
      user.sessionVersion += 1;
      user.updatedAt = new Date().toISOString();
      saveStore(store);
    }
  }

  /**
   * List student verification queue for College Admin.
   */
  static async getStudentVerificationQueue(options?: {
    department?: string;
    academicYear?: string;
    status?: string;
    search?: string;
  }): Promise<StudentProfile[]> {
    const store = getStore();
    let students = Object.values(store.users)
      .filter((u) => u.studentProfile)
      .map((u) => u.studentProfile as StudentProfile);

    if (options?.department && options.department !== "ALL") {
      students = students.filter((s) => s.department === options.department);
    }
    if (options?.academicYear && options.academicYear !== "ALL") {
      students = students.filter((s) => s.academicYear === options.academicYear);
    }
    if (options?.status && options.status !== "ALL") {
      students = students.filter((s) => s.status === options.status);
    }
    if (options?.search) {
      const q = options.search.toLowerCase();
      students = students.filter(
        (s) =>
          s.fullName.toLowerCase().includes(q) ||
          s.collegeEmail.toLowerCase().includes(q) ||
          s.rollNumber.toLowerCase().includes(q) ||
          s.collegeId.toLowerCase().includes(q)
      );
    }

    return students.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Get user by ID.
   */
  static async getUserById(userId: string): Promise<StoredUser | null> {
    const store = getStore();
    const email = store.usersById[userId];
    if (!email) return null;
    return store.users[email] || null;
  }

  /**
   * Get user by Email.
   */
  static async getUserByEmail(email: string): Promise<StoredUser | null> {
    const store = getStore();
    const normalized = email.trim().toLowerCase();
    return store.users[normalized] || null;
  }

  /**
   * Get audit logs.
   */
  static async getAuditLogs(limit = 100): Promise<AuditLog[]> {
    const store = getStore();
    return store.auditLogs.slice(0, limit);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Stateless Signed Session Token Helper (Cookie / Header based)
  // ───────────────────────────────────────────────────────────────────────────

  static createSessionToken(data: SessionData): string {
    const secret = getSecretKey();
    const payload = Buffer.from(JSON.stringify(data)).toString("base64url");
    const signature = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
    return `${payload}.${signature}`;
  }

  static verifySessionToken(token: string): SessionData | null {
    try {
      const [payload, signature] = token.split(".");
      if (!payload || !signature) return null;

      const secret = getSecretKey();
      const expectedSignature = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
      if (!secureCompare(signature, expectedSignature)) return null;

      const data: SessionData = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));

      // Check 15-minute inactivity timeout server-side
      const elapsed = Date.now() - data.lastActivity;
      if (elapsed > COLLEGE_CONFIG.security.sessionInactivityTimeoutMinutes * 60 * 1000) {
        return null; // Session expired due to inactivity
      }

      // Check server session version & suspension
      const store = getStore();
      const email = store.usersById[data.userId];
      if (email) {
        const user = store.users[email];
        if (!user) return null;
        if (user.accountStatus === "suspended") return null;
        if (user.sessionVersion !== data.sessionVersion) return null; // Stale session revoked
      }

      return data;
    } catch {
      return null;
    }
  }
}
