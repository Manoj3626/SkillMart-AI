# SkillMatch AI

> **Your Skills. Your Future. Your Perfect Match.**

An AI-powered employment and career development platform built with Next.js 16, Supabase, LiveKit, and Google Gemini.

---

## Features

| Feature | Status |
|---|---|
| Landing page & navigation | ✅ Phase 1 |
| Authentication (signup, login, password recovery) | ✅ Phase 1 |
| Candidate dashboard with onboarding | ✅ Phase 1 |
| Live AI voice interview (with webcam) | ✅ Phase 2 |
| Interview setup form (role, type, difficulty) | ✅ Phase 2 |
| AI interview feedback with radar chart | ✅ Phase 3 |
| Q&A breakdown with improved answers | ✅ Phase 3 |
| Resume analyzer (PDF, DOCX, TXT) | ✅ Phase 4 |
| Resume ATS scoring & suggested rewrites | ✅ Phase 4 |
| Job discovery (Adzuna API + demo) | ✅ Phase 5 |
| Skill-match scoring | ✅ Phase 5 |
| Skills management with quick-add | ✅ Phase 1 |
| Application tracker (add, filter, edit status) | ✅ Phase 5 |
| GitHub portfolio analysis | ✅ Phase 6 |
| AI-generated resume bullets from repos | ✅ Phase 6 |
| Recruiter dashboard & applicant pipeline | ✅ Phase 7 |
| Recruiter job posting form | ✅ Phase 7 |
| College placement dashboard | ✅ Phase 7 |
| College student roster & analytics | ✅ Phase 7 |
| Unit tests (28 passing) | ✅ Phase 8 |
| GitHub Actions CI | ✅ Phase 8 |
| Vercel deployment config | ✅ Phase 8 |
| Demo mode (no credentials needed) | ✅ All Phases |

---

## Architecture

```
skillmatch/
  src/
    app/
      (marketing)/         ← Public landing pages (no auth)
      (auth)/              ← Login, Signup, Forgot Password
      (candidate)/         ← Protected candidate features
      (recruiter)/recruiter/ ← Recruiter portal
      (college)/college/   ← College placement portal
      api/                 ← Server-side Route Handlers
    components/
      ui/                  ← Design system (Card, Badge, Progress, etc.)
      layout/              ← Navbar, Sidebar, Footer
    lib/
      supabase/            ← Client & server Supabase helpers
      auth/                ← AuthContext (React)
    types/                 ← TypeScript types
    __tests__/             ← Vitest unit tests
  agent/                   ← Python LiveKit interview agent
  supabase/
    migrations/            ← SQL schema files
  .github/workflows/       ← CI pipeline
```

---

## Prerequisites

- Node.js 22+
- Python 3.11+ (for the agent)
- [Supabase](https://supabase.com) account (free)
- [LiveKit Cloud](https://livekit.io) account (free tier: 50 GB/month)
- [Google AI Studio](https://aistudio.google.com/) API key (free tier)

---

## Quick Start

### 1. Clone & Install

```bash
git clone <your-repo-url> skillmatch
cd skillmatch
npm install
```

### 2. Environment Variables

```bash
copy .env.example .env.local
```

Edit `.env.local` and fill in your credentials. Leave variables empty to run in **demo mode** (no real AI or auth).

### 3. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → run `supabase/migrations/001_initial_schema.sql`
3. Create a storage bucket named `resumes` (private)
4. Copy your URL and keys to `.env.local`

### 4. LiveKit Setup

1. Sign up at [livekit.io](https://livekit.io) → Create a project
2. Copy `URL`, `API Key`, `API Secret` to `.env.local`
3. See `agent/README.md` to set up the Python agent

### 5. AI Provider Setup

**Google Gemini (recommended — free):**
1. Go to [aistudio.google.com](https://aistudio.google.com/)
2. Create an API key
3. Set `AI_API_KEY=your-key` and `AI_PROVIDER=google` in `.env.local`
4. Set `GOOGLE_API_KEY=your-key` in `agent/.env`

### 6. Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 7. Run the Interview Agent (separate terminal)

```bash
cd agent
python -m venv .venv
.venv\Scripts\activate      # Windows
pip install -e .
copy .env.example .env      # Edit with your credentials
python -m src.main dev
```

### 8. Run Tests

```bash
npm run test          # Run all 28 tests
npm run test:watch    # Watch mode
npm run type-check    # TypeScript validation
```

---

## All Routes

### Candidate (Protected)
| Route | Feature |
|---|---|
| `/dashboard` | Dashboard with onboarding, quick actions, profile completion |
| `/interviews` | Interview history list |
| `/interviews/new` | Interview setup form |
| `/interviews/[id]` | Live interview studio (webcam + AI) |
| `/interviews/[id]/feedback` | AI feedback report with radar chart |
| `/resume` | Resume analyzer with drag & drop |
| `/jobs` | Job discovery with skill-match scores |
| `/skills` | Skills manager |
| `/applications` | Application tracker |
| `/portfolio` | GitHub profile analysis |
| `/learn` | Learning recommendations |
| `/settings` | Profile editing |

### Recruiter (Protected)
| Route | Feature |
|---|---|
| `/recruiter/dashboard` | Stats, job postings, applicant pipeline |
| `/recruiter/jobs` | Job postings list |
| `/recruiter/jobs/new` | Post a new job |
| `/recruiter/applicants` | AI-scored applicant list |

### College (Protected)
| Route | Feature |
|---|---|
| `/college/dashboard` | Placement dashboard with charts |
| `/college/students` | Student roster |
| `/college/analytics` | Placement analytics |

### API Routes
| Route | Method | Feature |
|---|---|---|
| `/api/health` | GET | Config health check |
| `/api/interviews/token` | POST | LiveKit JWT token |
| `/api/analysis/feedback` | POST | AI interview feedback |
| `/api/resume/analyze` | POST | Resume extraction + AI analysis |
| `/api/jobs/search` | GET | Job search (Adzuna / demo) |
| `/api/github/analyze` | POST | GitHub profile analysis |

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | For auth/DB | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | For auth/DB | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Supabase service role (never in browser) |
| `LIVEKIT_URL` | For interviews | LiveKit server WebSocket URL |
| `LIVEKIT_API_KEY` | For interviews | LiveKit API key (server only) |
| `LIVEKIT_API_SECRET` | For interviews | LiveKit API secret (server only) |
| `AI_PROVIDER` | For AI features | `google` or `openai` |
| `AI_API_KEY` | For AI features | Google AI Studio or OpenAI key |
| `AI_MODEL` | For AI features | e.g. `gemini-2.0-flash` |
| `ADZUNA_APP_ID` | For jobs | Adzuna developer app ID |
| `ADZUNA_APP_KEY` | For jobs | Adzuna developer key |
| `GITHUB_TOKEN` | For portfolio | GitHub PAT (read:user, public_repo) |

---

## Demo Mode

If you start the app with empty credentials, it runs in **demo mode**:

- The landing page, auth forms, and dashboard are fully functional UI
- All AI features show labeled demo data with warning banners
- Interview Studio shows a demo conversation (no real AI)
- Resume analyzer returns demo scoring
- Job discovery shows demo listings with skill-match scores
- GitHub analysis uses real public API (rate-limited without token)

---

## Database

All migrations are in `supabase/migrations/`. Run them in order via the Supabase SQL Editor.

Key tables:
- `profiles` — extends `auth.users`, stores role
- `interview_sessions` — interview metadata
- `interview_messages` — transcripts (only when consented)
- `interview_feedback` — AI evaluation reports
- `resumes` + `resume_analyses` — resume files + AI analysis
- `jobs` + `job_matches` — job listings + skill-match scores
- `applications` — candidate applications tracker

All tables have Row Level Security (RLS) enabled.

---

## Security Notes

- Service role keys are **never** exposed to the browser
- LiveKit tokens are generated server-side and scoped to a single room per user
- Resumes are stored in a **private** Supabase Storage bucket
- Interview transcripts are only stored with explicit user consent
- All AI outputs are validated with Zod before display
- RLS policies enforce per-user data isolation at the database level

---

## Deployment

### Vercel (recommended)

1. Push to GitHub
2. Import the repo in [vercel.com](https://vercel.com)
3. Set all environment variables in Vercel project settings
4. Vercel auto-detects Next.js — just deploy

### CI Pipeline

The `.github/workflows/ci.yml` runs on every push/PR:
- TypeScript type checking
- ESLint
- 28 unit tests (Vitest)
- Production build
- Python agent import verification

---

## Free Tier Limits

| Service | Free Tier |
|---|---|
| Supabase | 500 MB DB, 1 GB storage, 50k auth users |
| LiveKit Cloud | 50 GB media traffic/month |
| Google AI Studio | 15 RPM, 1M tokens/day (Gemini Flash) |
| Adzuna API | 1000 requests/month |

---

## Troubleshooting

**App crashes on start with "Missing Supabase environment variables"**
→ Add valid credentials to `.env.local` or leave them blank (demo mode catches it)

**Interview page shows "Demo Mode"**
→ Set `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` in `.env.local` and start the Python agent

**Auth redirects not working**
→ Check `proxy.ts` exports `config.matcher` correctly and the `.next` cache is cleared

**TypeScript errors on build**
→ Run `npx tsc --noEmit` to see all errors; common issue is missing type declarations

**GitHub analysis "rate limit exceeded"**
→ Set `GITHUB_TOKEN` in `.env.local` with a Personal Access Token (read-only scopes)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5, Python 3.11 |
| Styling | Tailwind CSS v4 (CSS-first) |
| Components | Custom design system (Card, Badge, Progress, ScoreRing) |
| Auth & DB | Supabase (PostgreSQL + RLS) |
| AI | Google Gemini 2.0 Flash (free tier) |
| Real-time | LiveKit (WebRTC) |
| Jobs API | Adzuna |
| Testing | Vitest |
| CI/CD | GitHub Actions + Vercel |
| Charts | Recharts |
| Forms | React Hook Form + Zod v4 |

---

## Phases Completed

- ✅ **Phase 1** — Foundation: design system, landing page, auth, dashboard, DB migrations
- ✅ **Phase 2** — Interview MVP: LiveKit integration, Python agent, interview studio, demo mode
- ✅ **Phase 3** — Interview Evaluation: AI feedback API, radar charts, Q&A breakdown
- ✅ **Phase 4** — Resume Analyzer: PDF/DOCX extraction, AI scoring, ATS tips, rewrites
- ✅ **Phase 5** — Job Discovery: Adzuna integration, skill-match scoring, applications tracker
- ✅ **Phase 6** — Portfolio: GitHub analysis, AI resume bullets, skill detection
- ✅ **Phase 7** — Recruiter & College Portals: dashboards, job posting, student analytics
- ✅ **Phase 8** — Tests, Quality & Deployment: Vitest, CI pipeline, Vercel config, production build
