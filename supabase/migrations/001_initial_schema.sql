-- SkillMatch AI — Initial Schema Migration
-- Run this in Supabase → SQL Editor

-- ──────────────────────────────────────────
-- Profiles (extends auth.users)
-- ──────────────────────────────────────────
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
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

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    coalesce(new.raw_user_meta_data ->> 'role', 'candidate')
  );
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
  user_id             uuid not null references public.profiles(id) on delete cascade,
  name                text not null,
  level               text not null default 'intermediate'
                      check (level in ('beginner', 'intermediate', 'advanced', 'expert')),
  years_of_experience numeric(4,1),
  created_at          timestamptz not null default now()
);

create index idx_candidate_skills_user on public.candidate_skills(user_id);

alter table public.candidate_skills enable row level security;
create policy "Users manage own skills" on public.candidate_skills
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ──────────────────────────────────────────
-- Resumes
-- ──────────────────────────────────────────
create table if not exists public.resumes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  file_name  text not null,
  file_path  text not null,  -- storage path (not public URL)
  file_size  bigint not null,
  mime_type  text not null,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

create index idx_resumes_user on public.resumes(user_id);

alter table public.resumes enable row level security;
create policy "Users manage own resumes" on public.resumes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ──────────────────────────────────────────
-- Resume Analyses
-- ──────────────────────────────────────────
create table if not exists public.resume_analyses (
  id                   uuid primary key default gen_random_uuid(),
  resume_id            uuid not null references public.resumes(id) on delete cascade,
  user_id              uuid not null references public.profiles(id) on delete cascade,
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

create index idx_resume_analyses_user on public.resume_analyses(user_id);
create index idx_resume_analyses_resume on public.resume_analyses(resume_id);

alter table public.resume_analyses enable row level security;
create policy "Users read own analyses" on public.resume_analyses
  for select using (auth.uid() = user_id);
create policy "Service inserts analyses" on public.resume_analyses
  for insert with check (auth.uid() = user_id);

-- ──────────────────────────────────────────
-- Interview Sessions
-- ──────────────────────────────────────────
create table if not exists public.interview_sessions (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references public.profiles(id) on delete cascade,
  livekit_room_name    text,
  job_role             text not null,
  interview_type       text not null check (interview_type in ('technical','behavioral','hr','mixed')),
  difficulty           text not null check (difficulty in ('beginner','intermediate','advanced')),
  experience_level     text not null check (experience_level in ('fresher','junior','mid','senior')),
  duration_minutes     smallint not null default 20,
  job_description      text,
  focus_skills         text[] not null default '{}',
  status               text not null default 'created'
                       check (status in ('created','active','completed','cancelled')),
  started_at           timestamptz,
  ended_at             timestamptz,
  transcript_consented boolean not null default false,
  created_at           timestamptz not null default now()
);

create index idx_interview_sessions_user on public.interview_sessions(user_id);
create index idx_interview_sessions_status on public.interview_sessions(status);

alter table public.interview_sessions enable row level security;
create policy "Users manage own sessions" on public.interview_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ──────────────────────────────────────────
-- Interview Messages (transcript)
-- ──────────────────────────────────────────
create table if not exists public.interview_messages (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.interview_sessions(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  role       text not null check (role in ('assistant','user')),
  content    text not null,
  ts         timestamptz not null default now()
);

create index idx_interview_messages_session on public.interview_messages(session_id);

alter table public.interview_messages enable row level security;
create policy "Users read own messages" on public.interview_messages
  for select using (auth.uid() = user_id);
create policy "Service inserts messages" on public.interview_messages
  for insert with check (auth.uid() = user_id);

-- ──────────────────────────────────────────
-- Interview Feedback
-- ──────────────────────────────────────────
create table if not exists public.interview_feedback (
  id                    uuid primary key default gen_random_uuid(),
  session_id            uuid not null references public.interview_sessions(id) on delete cascade,
  user_id               uuid not null references public.profiles(id) on delete cascade,
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
  created_at            timestamptz not null default now()
);

create index idx_interview_feedback_user on public.interview_feedback(user_id);
create index idx_interview_feedback_session on public.interview_feedback(session_id);

alter table public.interview_feedback enable row level security;
create policy "Users read own feedback" on public.interview_feedback
  for select using (auth.uid() = user_id);
create policy "Service inserts feedback" on public.interview_feedback
  for insert with check (auth.uid() = user_id);

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
  experience_level text check (experience_level in ('fresher','junior','mid','senior','lead')),
  location        text,
  remote_type     text not null default 'onsite'
                  check (remote_type in ('remote','hybrid','onsite')),
  employment_type text not null default 'full_time'
                  check (employment_type in ('full_time','part_time','contract','internship')),
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

create index idx_jobs_active on public.jobs(is_active, created_at desc);
create index idx_jobs_skills on public.jobs using gin(required_skills);

alter table public.jobs enable row level security;
create policy "Anyone can read active jobs" on public.jobs
  for select using (is_active = true);

-- ──────────────────────────────────────────
-- Job Matches
-- ──────────────────────────────────────────
create table if not exists public.job_matches (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid not null references public.profiles(id) on delete cascade,
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
create policy "Users read own matches" on public.job_matches
  for select using (auth.uid() = user_id);

-- ──────────────────────────────────────────
-- Applications
-- ──────────────────────────────────────────
create table if not exists public.applications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  job_id     uuid not null references public.jobs(id) on delete cascade,
  status     text not null default 'applied'
             check (status in ('applied','screening','interview','offer','rejected','withdrawn')),
  applied_at timestamptz not null default now(),
  notes      text,
  unique (user_id, job_id)
);

create index idx_applications_user on public.applications(user_id);

alter table public.applications enable row level security;
create policy "Users manage own applications" on public.applications
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

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
create policy "Anyone can read verified orgs" on public.organizations
  for select using (verified = true);

-- ──────────────────────────────────────────
-- Storage Buckets (run separately if needed)
-- ──────────────────────────────────────────
-- insert into storage.buckets (id, name, public)
--   values ('resumes', 'resumes', false)
--   on conflict do nothing;
--
-- create policy "Users upload own resumes" on storage.objects
--   for insert with check (
--     bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1]
--   );
-- create policy "Users read own resumes" on storage.objects
--   for select using (
--     bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1]
--   );
