/**
 * Karpagam College of Engineering (KCE) Configuration
 * Official SkillMatch AI College Settings
 */

export const COLLEGE_CONFIG = {
  name: "Karpagam College of Engineering",
  shortName: "KCE",
  code: "KCE",
  location: "Coimbatore, Tamil Nadu, India",
  officialDomain: "kce.ac.in",
  supportEmail: "placements@kce.ac.in",
  portalName: "SkillMatch AI — KCE Placement Portal",

  // Configurable departments offered at Karpagam College of Engineering
  departments: [
    { code: "AIDS", name: "Artificial Intelligence and Data Science" },
    { code: "CSE", name: "Computer Science and Engineering" },
    { code: "IT", name: "Information Technology" },
    { code: "ECE", name: "Electronics and Communication Engineering" },
    { code: "EEE", name: "Electrical and Electronics Engineering" },
    { code: "MECH", name: "Mechanical Engineering" },
    { code: "CIVIL", name: "Civil Engineering" },
    { code: "CST", name: "Computer Science and Technology" },
    { code: "CSBS", name: "Computer Science and Business Systems" },
    { code: "MBA", name: "Master of Business Administration" },
    { code: "MCA", name: "Master of Computer Applications" },
  ] as const,

  degrees: [
    "B.E. (Bachelor of Engineering)",
    "B.Tech (Bachelor of Technology)",
    "M.E. (Master of Engineering)",
    "M.Tech (Master of Technology)",
    "MBA (Master of Business Administration)",
    "MCA (Master of Computer Applications)",
  ] as const,

  academicYears: [
    "1st Year",
    "2nd Year",
    "3rd Year",
    "4th Year",
  ] as const,

  graduationYears: [2024, 2025, 2026, 2027, 2028, 2029, 2030] as const,

  // Password Policy
  security: {
    minPasswordLength: 12,
    otpExpiryMinutes: 5,
    otpMaxAttempts: 5,
    otpResendCooldownSeconds: 30,
    sessionInactivityTimeoutMinutes: 15,
  },
};

/**
 * Validates whether the given email strictly belongs to the Karpagam College of Engineering domain (@kce.ac.in).
 * Handles case-insensitivity and trims whitespace safely.
 */
export function isValidCollegeEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  const normalized = email.trim().toLowerCase();
  
  // Basic email pattern check
  const emailRegex = /^[a-zA-Z0-9._%+-]+@kce\.ac\.in$/;
  return emailRegex.test(normalized);
}

/**
 * Normalizes college identifiers (Roll number, College ID) to standard uppercase trimmed format.
 */
export function normalizeIdentifier(val: string): string {
  if (!val || typeof val !== "string") return "";
  return val.trim().toUpperCase();
}
