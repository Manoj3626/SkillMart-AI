-- SkillMatch AI — College Authentication, Verification & Security Migration
-- Institution: Karpagam College of Engineering (KCE)
-- Run this in Supabase → SQL Editor

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Student Profiles (Identity & College Verification Lifecycle)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.student_profiles (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references auth.users(id) on delete cascade unique,
  full_name            text not null,
  college_email        text not null unique,
  roll_number          text not null unique,
  college_id           text not null unique,
  department           text not null,
  degree               text not null,
  academic_year        text not null,
  graduation_year      integer not null,
  phone                text,
  email_verified       boolean not null default false,
  college_verified     boolean not null default false,
  status               text not null default 'pending_email_verification'
                       check (status in (
                         'pending_email_verification',
                         'pending_college_verification',
                         'active',
                         'rejected',
                         'suspended'
                       )),
  rejection_reason     text,
  approved_by          uuid references auth.users(id),
  approved_at          timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),

  -- Institutional domain constraint
  constraint check_kce_domain check (lower(trim(college_email)) like '%@kce.ac.in')
);

create index if not exists idx_student_profiles_user on public.student_profiles(user_id);
create index if not exists idx_student_profiles_status on public.student_profiles(status);
create index if not exists idx_student_profiles_dept on public.student_profiles(department);
create index if not exists idx_student_profiles_roll on public.student_profiles(roll_number);
create index if not exists idx_student_profiles_college_id on public.student_profiles(college_id);

-- Enable RLS
alter table public.student_profiles enable row level security;

-- Student view own profile
create policy "Students view own profile"
  on public.student_profiles for select
  using (auth.uid() = user_id);

-- Student update own profile (allowed fields only via application logic)
create policy "Students update own profile"
  on public.student_profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. OTP & Verification Challenges
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.otp_challenges (
  id                    uuid primary key default gen_random_uuid(),
  identifier            text not null, -- email address or user id
  purpose               text not null check (purpose in ('email_verification', 'password_reset', 'admin_mfa', 'new_device')),
  hashed_code           text not null, -- SHA-256 HMAC hash, NEVER plaintext
  expires_at            timestamptz not null,
  attempt_count         integer not null default 0,
  max_attempts          integer not null default 5,
  resend_cooldown_until timestamptz not null,
  used                  boolean not null default false,
  created_at            timestamptz not null default now()
);

create index if not exists idx_otp_challenges_lookup on public.otp_challenges(identifier, purpose, used);
alter table public.otp_challenges enable row level security;
-- Service role only accesses OTP challenges directly

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Admin Profiles & College Scope
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.admin_profiles (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade unique,
  full_name     text not null,
  email         text not null unique,
  role          text not null check (role in ('college_admin', 'admin')),
  college_scope text not null default 'KCE',
  mfa_enabled   boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.admin_profiles enable row level security;

create policy "Admins view admin profiles"
  on public.admin_profiles for select
  using (
    auth.uid() in (
      select user_id from public.admin_profiles
    )
  );

-- College Admins can view and approve students in their college
create policy "College admins view student profiles"
  on public.student_profiles for select
  using (
    auth.uid() in (
      select user_id from public.admin_profiles where role in ('college_admin', 'admin')
    )
  );

create policy "College admins update student status"
  on public.student_profiles for update
  using (
    auth.uid() in (
      select user_id from public.admin_profiles where role in ('college_admin', 'admin')
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Session Versioning (For Sign Out All Devices & Revocation)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.user_session_versions (
  user_id          uuid primary key references auth.users(id) on delete cascade,
  session_version  integer not null default 1,
  last_activity    timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table public.user_session_versions enable row level security;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Audit Logs (Security & Compliance Tracking)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.audit_logs (
  id          uuid primary key default gen_random_uuid(),
  actor_id    text not null,
  actor_role  text not null,
  action      text not null,
  target_type text not null,
  target_id   text not null,
  details     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists idx_audit_logs_actor on public.audit_logs(actor_id, created_at desc);
create index if not exists idx_audit_logs_action on public.audit_logs(action);
alter table public.audit_logs enable row level security;

-- College and Super Admins can view audit logs
create policy "Admins view audit logs"
  on public.audit_logs for select
  using (
    auth.uid() in (
      select user_id from public.admin_profiles
    )
  );
