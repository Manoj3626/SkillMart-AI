-- SkillMatch AI — Production PostgreSQL Schema Migration
-- Safe to run in Supabase Dashboard → SQL Editor

-- ──────────────────────────────────────────
-- Extensions
-- ──────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ──────────────────────────────────────────
-- Profiles (supports both Supabase Auth and College Portal accounts)
-- ──────────────────────────────────────────
create table if not exists public.profiles (
  id           text primary key,
  email        text not null,
  full_name    text,
  avatar_url   text,
  role         text not null default 'candidate'
               check (role in ('candidate', 'recruiter', 'college_admin', 'admin')),
  headline     text,
  location     text,
  github_url   text,
  linkedin_url text,
  website_url  text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Allow public read profiles" on public.profiles;
create policy "Allow public read profiles"
  on public.profiles for select
  using (true);

drop policy if exists "Allow all insert or update profiles" on public.profiles;
create policy "Allow all insert or update profiles"
  on public.profiles for all
  using (true)
  with check (true);

-- Auto-create profile on Supabase Auth signup (if Supabase Auth is used)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id::text,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    coalesce(new.raw_user_meta_data ->> 'role', 'candidate')
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ──────────────────────────────────────────
-- Candidate Skills
-- ──────────────────────────────────────────
create table if not exists public.candidate_skills (
  id                  uuid primary key default gen_random_uuid(),
  user_id             text not null references public.profiles(id) on delete cascade,
  name                text not null,
  level               text not null default 'intermediate'
                      check (level in ('beginner', 'intermediate', 'advanced', 'expert')),
  years_of_experience numeric(4,1),
  created_at          timestamptz not null default now()
);

create index if not exists idx_candidate_skills_user on public.candidate_skills(user_id);

alter table public.candidate_skills enable row level security;
drop policy if exists "Manage own skills" on public.candidate_skills;
create policy "Manage own skills" on public.candidate_skills
  for all using (true) with check (true);

-- ──────────────────────────────────────────
-- Resumes
-- ──────────────────────────────────────────
create table if not exists public.resumes (
  id         uuid primary key default gen_random_uuid(),
  user_id    text not null references public.profiles(id) on delete cascade,
  file_name  text not null,
  file_path  text not null,
  file_size  bigint not null,
  mime_type  text not null,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_resumes_user on public.resumes(user_id);

alter table public.resumes enable row level security;
drop policy if exists "Manage own resumes" on public.resumes;
create policy "Manage own resumes" on public.resumes
  for all using (true) with check (true);

-- ──────────────────────────────────────────
-- Resume Analyses
-- ──────────────────────────────────────────
create table if not exists public.resume_analyses (
  id                   uuid primary key default gen_random_uuid(),
  resume_id            uuid references public.resumes(id) on delete cascade,
  user_id              text not null references public.profiles(id) on delete cascade,
  alignment_score      smallint not null check (alignment_score between 0 and 100),
  strengths            text[] not null default '{}',
  improvements         text[] not null default '{}',
  missing_keywords     text[] not null default '{}',
  detected_skills      text[] not null default '{}',
  section_feedback     jsonb not null default '{}',
  suggested_rewrites   jsonb not null default '[]',
  job_description_used text,
  raw_response         jsonb,
  created_at           timestamptz not null default now()
);

create index if not exists idx_resume_analyses_user on public.resume_analyses(user_id);

alter table public.resume_analyses enable row level security;
drop policy if exists "Manage own analyses" on public.resume_analyses;
create policy "Manage own analyses" on public.resume_analyses
  for all using (true) with check (true);

-- ──────────────────────────────────────────
-- Interview Sessions
-- ──────────────────────────────────────────
create table if not exists public.interview_sessions (
  id                   text primary key,
  user_id              text not null,
  livekit_room_name    text,
  job_role             text not null,
  interview_type       text not null,
  difficulty           text not null,
  experience_level     text not null,
  duration_minutes     smallint not null default 20,
  job_description      text,
  focus_skills         text[] not null default '{}',
  status               text not null default 'completed',
  started_at           timestamptz default now(),
  ended_at             timestamptz default now(),
  transcript_consented boolean not null default false,
  created_at           timestamptz not null default now()
);

create index if not exists idx_interview_sessions_user on public.interview_sessions(user_id);
create index if not exists idx_interview_sessions_status on public.interview_sessions(status);

alter table public.interview_sessions enable row level security;
drop policy if exists "Manage own sessions" on public.interview_sessions;
create policy "Manage own sessions" on public.interview_sessions
  for all using (true) with check (true);

-- ──────────────────────────────────────────
-- Interview Messages (transcript)
-- ──────────────────────────────────────────
create table if not exists public.interview_messages (
  id         uuid primary key default gen_random_uuid(),
  session_id text not null references public.interview_sessions(id) on delete cascade,
  user_id    text not null,
  role       text not null,
  content    text not null,
  ts         timestamptz not null default now()
);

create index if not exists idx_interview_messages_session on public.interview_messages(session_id);

alter table public.interview_messages enable row level security;
drop policy if exists "Manage own messages" on public.interview_messages;
create policy "Manage own messages" on public.interview_messages
  for all using (true) with check (true);

-- ──────────────────────────────────────────
-- Interview Feedback
-- ──────────────────────────────────────────
create table if not exists public.interview_feedback (
  id                    uuid primary key default gen_random_uuid(),
  session_id            text not null references public.interview_sessions(id) on delete cascade,
  user_id               text not null,
  overall_score         smallint not null check (overall_score between 0 and 100),
  relevance_score       smallint check (relevance_score between 0 and 100),
  technical_score       smallint check (technical_score between 0 and 100),
  communication_score   smallint check (communication_score between 0 and 100),
  problem_solving_score smallint check (problem_solving_score between 0 and 100),
  completeness_score    smallint check (completeness_score between 0 and 100),
  strengths             text[] not null default '{}',
  weaknesses            text[] not null default '{}',
  question_feedback     jsonb not null default '[]',
  recommended_topics    text[] not null default '{}',
  next_session_suggestion text,
  raw_response          jsonb,
  created_at            timestamptz not null default now(),
  unique(session_id)
);

create index if not exists idx_interview_feedback_user on public.interview_feedback(user_id);
create index if not exists idx_interview_feedback_session on public.interview_feedback(session_id);

alter table public.interview_feedback enable row level security;
drop policy if exists "Manage own feedback" on public.interview_feedback;
create policy "Manage own feedback" on public.interview_feedback
  for all using (true) with check (true);

-- ──────────────────────────────────────────
-- Jobs
-- ──────────────────────────────────────────
create table if not exists public.jobs (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  company         text not null,
  description     text not null,
  required_skills text[] not null default '{}',
  preferred_skills text[] not null default '{}',
  experience_level text,
  location        text,
  remote_type     text not null default 'onsite',
  employment_type text not null default 'full_time',
  salary_min      numeric(12,2),
  salary_max      numeric(12,2),
  currency        text not null default 'INR',
  application_url text not null,
  source          text not null default 'internal',
  source_job_id   text,
  posted_at       timestamptz,
  deadline        timestamptz,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (source, source_job_id)
);

create index if not exists idx_jobs_active on public.jobs(is_active, created_at desc);

alter table public.jobs enable row level security;
drop policy if exists "Anyone can read active jobs" on public.jobs;
create policy "Anyone can read active jobs" on public.jobs
  for select using (is_active = true);

-- ──────────────────────────────────────────
-- Job Matches
-- ──────────────────────────────────────────
create table if not exists public.job_matches (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  text not null references public.profiles(id) on delete cascade,
  job_id                   uuid not null references public.jobs(id) on delete cascade,
  match_score              smallint not null check (match_score between 0 and 100),
  matching_skills          text[] not null default '{}',
  missing_required_skills  text[] not null default '{}',
  matching_preferred_skills text[] not null default '{}',
  explanation              text,
  created_at               timestamptz not null default now(),
  unique (user_id, job_id)
);

alter table public.job_matches enable row level security;
drop policy if exists "Manage own matches" on public.job_matches;
create policy "Manage own matches" on public.job_matches
  for all using (true) with check (true);

-- ──────────────────────────────────────────
-- Organizations
-- ──────────────────────────────────────────
create table if not exists public.organizations (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  type       text not null check (type in ('company','college')),
  domain     text,
  logo_url   text,
  website    text,
  verified   boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.organizations enable row level security;
drop policy if exists "Anyone can read verified orgs" on public.organizations;
create policy "Anyone can read verified orgs" on public.organizations
  for select using (verified = true);
