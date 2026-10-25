export type UserRole = "candidate" | "recruiter" | "college_admin" | "admin";

export type AccountStatus =
  | "pending_email_verification"
  | "pending_college_verification"
  | "active"
  | "rejected"
  | "suspended";

export interface StudentProfile {
  id: string;
  userId: string;
  fullName: string;
  collegeEmail: string;
  rollNumber: string;
  collegeId: string;
  department: string;
  degree: string;
  academicYear: string;
  graduationYear: number;
  phone?: string | null;
  emailVerified: boolean;
  collegeVerified: boolean;
  status: AccountStatus;
  rejectionReason?: string | null;
  approvedBy?: string | null;
  approvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OTPChallenge {
  id: string;
  identifier: string; // email or userId
  purpose: "email_verification" | "password_reset" | "admin_mfa" | "new_device";
  hashedCode: string;
  expiresAt: string;
  attemptCount: number;
  maxAttempts: number;
  resendCooldownUntil: string;
  used: boolean;
  createdAt: string;
}

export interface AdminProfile {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  role: "college_admin" | "admin";
  collegeScope?: string | null;
  mfaEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorRole: string;
  action: string;
  targetType: string;
  targetId: string;
  details?: Record<string, any>;
  createdAt: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  headline: string | null;
  location: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  website_url: string | null;
  account_status?: AccountStatus;
  student_profile?: StudentProfile | null;
  created_at: string;
  updated_at: string;
}

export interface CandidateSkill {
  id: string;
  user_id: string;
  name: string;
  level: "beginner" | "intermediate" | "advanced" | "expert";
  years_of_experience: number | null;
  created_at: string;
}

export interface Resume {
  id: string;
  user_id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  is_active: boolean;
  created_at: string;
}

export interface ResumeAnalysis {
  id: string;
  resume_id: string;
  user_id: string;
  alignment_score: number;
  strengths: string[];
  improvements: string[];
  missing_keywords: string[];
  detected_skills: string[];
  section_feedback: Record<string, string>;
  suggested_rewrites: Array<{ original: string; suggested: string }>;
  job_description_used: string | null;
  created_at: string;
}

export interface InterviewSession {
  id: string;
  user_id: string;
  livekit_room_name: string;
  job_role: string;
  interview_type: "technical" | "behavioral" | "hr" | "mixed";
  difficulty: "beginner" | "intermediate" | "advanced";
  experience_level: "fresher" | "junior" | "mid" | "senior";
  duration_minutes: number;
  job_description: string | null;
  focus_skills: string[];
  status: "created" | "active" | "completed" | "cancelled";
  started_at: string | null;
  ended_at: string | null;
  transcript_consented: boolean;
  created_at: string;
}

export interface InterviewMessage {
  id: string;
  session_id: string;
  role: "assistant" | "user";
  content: string;
  timestamp: string;
}

export interface InterviewFeedback {
  id: string;
  session_id: string;
  user_id: string;
  overall_score: number;
  relevance_score: number;
  technical_score: number;
  communication_score: number;
  problem_solving_score: number;
  completeness_score: number;
  strengths: string[];
  weaknesses: string[];
  question_feedback: Array<{
    question: string;
    answer_summary: string;
    score: number;
    feedback: string;
    improved_answer: string;
  }>;
  recommended_topics: string[];
  next_session_suggestion: string;
  created_at: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  required_skills: string[];
  preferred_skills: string[];
  experience_level: "fresher" | "junior" | "mid" | "senior" | "lead";
  location: string;
  remote_type: "remote" | "hybrid" | "onsite";
  employment_type: "full_time" | "part_time" | "contract" | "internship";
  salary_min: number | null;
  salary_max: number | null;
  currency: string;
  application_url: string;
  source: string;
  source_job_id: string | null;
  posted_at: string | null;
  deadline: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface JobMatch {
  id: string;
  user_id: string;
  job_id: string;
  match_score: number;
  matching_skills: string[];
  missing_required_skills: string[];
  matching_preferred_skills: string[];
  explanation: string;
  created_at: string;
  job?: Job;
}

export interface Application {
  id: string;
  user_id: string;
  job_id: string;
  status: "applied" | "screening" | "interview" | "offer" | "rejected" | "withdrawn";
  applied_at: string;
  notes: string | null;
  job?: Job;
}

export interface Organization {
  id: string;
  name: string;
  type: "company" | "college";
  domain: string | null;
  logo_url: string | null;
  website: string | null;
  verified: boolean;
  created_at: string;
}

export interface AIProviderConfig {
  provider: string;
  model: string;
  apiKey: string;
}
