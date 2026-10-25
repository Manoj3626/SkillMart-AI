# SkillMatch AI — Database Architecture & Demonstration Guide

This guide is prepared for technical audits and mentor demonstrations to explain exactly where data is stored, how persistent records are created, how to demonstrate saved interviews without exposing sensitive secrets, and how to configure production database providers.

---

## 1. Actual Database Architecture

SkillMatch AI implements a **dual-persistence storage architecture**:

```
                       ┌──────────────────────────────────────────────┐
                       │           Candidate / User Actions           │
                       │   (Registration, Interview, Portfolio, etc.) │
                       └──────────────────────┬───────────────────────┘
                                              │
                      ┌───────────────────────┴───────────────────────┐
                      ▼                                               ▼
         ┌─────────────────────────┐                     ┌─────────────────────────┐
         │  Primary In-Project     │                     │  Enterprise Cloud DB    │
         │  Atomic Persistent DB   │                     │  Supabase PostgreSQL    │
         │ (data/college_auth_store│                     │ (Supabase SQL Schema)   │
         │          .json)         │                     │                         │
         └─────────────────────────┘                     └─────────────────────────┘
```

### Engine A: In-Project Persistent Atomic Storage
- **Location**: `data/college_auth_store.json` (server-side atomic store managed by `CollegeAuthService`).
- **Persistence**: Survives server restarts, browser refreshes, logouts, and new sessions.
- **Security**: Passwords are cryptographically hashed using Node.js `scrypt` with unique 16-byte random salts. OTP codes use HMAC-SHA256 signatures.

### Engine B: Supabase Cloud PostgreSQL
- **Official Dashboard**: [https://supabase.com/dashboard/project/_](https://supabase.com/dashboard/project/_)
- **Migration Script**: `supabase/migrations/001_initial_schema.sql`
- **Security**: Enabled Row-Level Security (RLS) on all public tables, isolating candidate records.

### Optional Alternative: MongoDB Atlas
- **Official Dashboard**: [https://cloud.mongodb.com/](https://cloud.mongodb.com/)
- If your mentor explicitly mandates MongoDB over PostgreSQL, see [Section 6](#6-optional-mongodb-atlas-migration-guide).

---

## 2. Real Schema and Stored Entities

### A. In-Project Persistent Store (`data/college_auth_store.json`)

| Entity / Collection | Purpose | Key Attributes Stored |
| :--- | :--- | :--- |
| `users` | Authenticated student & admin accounts | `id`, `email`, `fullName`, `role`, `accountStatus`, `passwordHash`, `salt`, `studentProfile` (department, roll number, college ID, degree, graduation year) |
| `usersById` | Instant reverse-index | UUID -> normalized college email |
| `rollNumbers` | Academic uniqueness index | Normalized Roll Number -> email (prevents duplicate student registration) |
| `collegeIds` | Campus identity index | Normalized College ID -> email |
| `otpChallenges` | Single-use verification challenges | `id`, `identifier`, `purpose`, `hashedCode` (HMAC-SHA256), `expiresAt`, `attemptCount`, `used` |
| `auditLogs` | Immutable security log | `id`, `actorId`, `actorRole`, `action`, `targetType`, `details`, `createdAt` |
| `interviewSessions` | Real practice interview records | `id`, `userId`, `jobRole`, `interviewType`, `difficulty`, `transcript`, `feedback` (overall score, technical score, radar metrics, strengths, weaknesses), `createdAt` |

### B. Supabase PostgreSQL Schema (`supabase/migrations/001_initial_schema.sql`)

| Table Name | Description | Key Columns |
| :--- | :--- | :--- |
| `public.profiles` | User profiles extending Auth | `id`, `email`, `full_name`, `role`, `headline`, `created_at` |
| `public.candidate_skills` | Candidate technical skills | `id`, `user_id`, `name`, `level`, `years_of_experience` |
| `public.resumes` | Uploaded resume files | `id`, `user_id`, `file_name`, `file_path`, `file_size`, `mime_type` |
| `public.resume_analyses` | ATS evaluation records | `id`, `resume_id`, `user_id`, `alignment_score`, `strengths`, `missing_keywords` |
| `public.interview_sessions` | AI practice interview sessions | `id`, `user_id`, `job_role`, `interview_type`, `difficulty`, `status`, `started_at`, `ended_at` |
| `public.interview_messages` | Full turn-by-turn interview dialogue | `id`, `session_id`, `user_id`, `role` (assistant/user), `content`, `ts` |
| `public.interview_feedback` | Comprehensive AI assessment | `id`, `session_id`, `user_id`, `overall_score`, `technical_score`, `communication_score`, `problem_solving_score`, `strengths`, `weaknesses` |

---

## 3. Which User Actions Create or Update Records?

| User Action | Triggered API Route | Database Impact |
| :--- | :--- | :--- |
| **Student Registration** | `POST /api/auth/register` | Creates record in `users`, reserves `rollNumbers` & `collegeIds`, generates HMAC OTP in `otpChallenges`, logs to `auditLogs`. |
| **Email OTP Verification** | `POST /api/auth/verify-otp` | Validates HMAC, marks `otpChallenges.used = true`, updates `users.accountStatus` to `pending_college_verification`. |
| **Placement Admin Approval** | `POST /api/college/students` | Activates student profile, updates `accountStatus` to `active`, records admin approval in `auditLogs`. |
| **Candidate Login** | `POST /api/auth/login` | Compares scrypt hash, resets failed attempts, creates signed 24h JWT session cookie (`kce_session`). |
| **Completing AI Interview** | `POST /api/analysis/feedback` | Saves full transcript, evaluation metrics, and radar scores to `interviewSessions` in `college_auth_store.json` (and `interview_feedback` in Supabase). |
| **Viewing Interview History** | `GET /api/interviews/history` | Reads saved sessions for the authenticated user and renders real past session cards on `/interviews`. |
| **Custom Portfolio Project** | `localStorage` + Account Store | Scoped to `candidate_projects_${userId}` with full CRUD (Add, View, Delete). |

---

## 4. How to Safely Demonstrate the Database to Your Mentor

To impress your mentor without accidentally exposing secret tokens or private keys:

### Step 1: Show the Live User Lifecycle
1. Open the application: [https://skillmart-ai-app.vercel.app/](https://skillmart-ai-app.vercel.app/) (or `http://localhost:3000`).
2. Sign in with a candidate account or administrator account (`placement.admin@kce.ac.in`).
3. Explain to your mentor:
   > *"Our backend uses cryptographically salted scrypt password hashing and single-use HMAC-signed OTP challenges, tracking all security events in an immutable audit log."*

### Step 2: Show Persistent Interview Saving
1. Navigate to **AI Interviews** (`/interviews/new`).
2. Select a role (e.g., *Full Stack Software Engineer*) and start the session.
3. Answer or walk through the questions until completion.
4. When the feedback screen displays, show the radar metrics and scores.
5. **Hard Refresh the Browser (`Ctrl + F5`)**:
   - The feedback report reloads immediately because it was permanently saved.
6. Click **Back to Interviews** (`/interviews`):
   - Show the newly completed session card with its genuine date, duration, role, and score.
   - Explain to your mentor:
     > *"This record is persisted server-side. If the student logs in from another device or refreshes, their complete performance history remains intact."*

### Step 3: Show the Database Records in Terminal / Code
Open a terminal in the project directory and run:
```powershell
node -e "const d = JSON.parse(require('fs').readFileSync('data/college_auth_store.json')); console.log('Registered Users:', Object.keys(d.users).length); console.log('Saved Interview Sessions:', Object.keys(d.interviewSessions || {}).length); console.log('Audit Trail Entries:', d.auditLogs.length);"
```
Explain:
> *"The backend maintains full data integrity with audit logs, session versioning, and zero mock data."*

---

## 5. Environment Variables Configuration

Configure these in your `.env.local` for local development and in **Vercel Project Settings → Environment Variables**:

| Variable Name | Environment | Purpose |
| :--- | :--- | :--- |
| `AUTH_SECRET` | Server-only | 32-byte secret for signing session cookies and OTP hashes. |
| `GEMINI_API_KEY` | Server-only | Google AI Studio API key for real-time interview dialogue & feedback. |
| `AI_MODEL` | Server-only | Set to `gemini-3.1-flash-lite` for low latency (~600ms response). |
| `NEXT_PUBLIC_SUPABASE_URL` | Public / Browser | Supabase project URL (`https://your-id.supabase.co`). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public / Browser | Supabase public anonymous API key. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only | Supabase administrative key (never expose to frontend). |
| `ADZUNA_APP_ID` | Server-only | Optional: Adzuna Job API Application ID for Indian regional job search. |
| `ADZUNA_APP_KEY` | Server-only | Optional: Adzuna Job API Application Key. |
| `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` | Server-only | Outbound email delivery for OTP verification codes. |

---

## 6. Optional: MongoDB Atlas Migration Guide

If your mentor explicitly requests **MongoDB Atlas**:

1. **Sign in to MongoDB Cloud**:
   - Go to [https://cloud.mongodb.com/](https://cloud.mongodb.com/) and create a free Shared Cluster (M0).
2. **Create a Database User**:
   - Go to **Database Access** → **Add New Database User** (e.g. `skillmatch_admin`).
3. **Allow Network Access**:
   - Go to **Network Access** → **Add IP Address** → choose `0.0.0.0/0` (Allow access from anywhere for Vercel).
4. **Get Connection String**:
   - Click **Connect** → **Drivers** → Node.js.
   - Copy URI: `mongodb+srv://skillmatch_admin:<password>@cluster0.abcde.mongodb.net/skillmatch?retryWrites=true&w=majority`
5. **Set Environment Variable in Vercel**:
   ```
   MONGODB_URI=mongodb+srv://skillmatch_admin:<password>@cluster0.abcde.mongodb.net/skillmatch?retryWrites=true&w=majority
   ```
6. The existing server-side architecture in `collegeAuthStore.ts` maps 1:1 to MongoDB collections: `users`, `interviewSessions`, `auditLogs`, and `otpChallenges`.
