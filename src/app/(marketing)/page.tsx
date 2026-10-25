"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Mic,
  FileText,
  Briefcase,
  TrendingUp,
  ArrowRight,
  ChevronRight,
  Star,
  CheckCircle,
  Award,
  Zap,
  Target,
  Sparkles,
  Play,
  X,
  Volume2,
  Clock,
  Flame,
  ShieldCheck,
  Compass,
  BarChart3,
  Layers,
} from "lucide-react";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [showDemoVideo, setShowDemoVideo] = useState<boolean>(false);
  const [videoPlaying, setVideoPlaying] = useState<boolean>(false);

  const stats = [
    { value: "4×", label: "Better Interview Performance" },
    { value: "38+", label: "Average Practice Sessions" },
    { value: "94%", label: "Placement Success Rate" },
    { value: "100", label: "Free Credits on Sign Up" },
  ];

  const candidateAvatars = [
    { name: "Rahul S.", role: "SDE", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80" },
    { name: "Sarah M.", role: "Data Scientist", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80" },
    { name: "Ananya P.", role: "Product Manager", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80" },
    { name: "Devon K.", role: "Fullstack", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80" },
    { name: "Jasper R.", role: "AI Engineer", img: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=120&q=80" },
  ];

  const organizationTabs = [
    {
      id: "01",
      title: "Conversational AI",
      desc: "Adapts in real time to create lifelike interviews that mirror real technical and HR conversations with natural voice response.",
      badge: "Real-time speech",
      dialogue: {
        interviewer: "Could you walk me through an edge-case scenario where your distributed caching strategy failed, and how you recovered?",
        candidate: "In our payment microservice, Redis experienced cache invalidation storms during flash sales. We implemented a probabilistic early expiration algorithm (XFetch) and a local in-memory fallback buffer.",
        score: "94% Clarity & Technical Depth",
      },
    },
    {
      id: "02",
      title: "Deep Answer Scoring",
      desc: "Evaluates structure, syntax, problem-solving reasoning, and communication cadence across 6 qualitative criteria.",
      badge: "Placement diagnostics",
      dialogue: {
        interviewer: "How do you systematically isolate memory leaks in Node.js event-driven runtimes?",
        candidate: "I inspect heap snapshots via Chrome DevTools and look for unreleased EventEmitter listeners and detached DOM or module-scoped closures.",
        score: "96% Structured STAR Delivery",
      },
    },
    {
      id: "03",
      title: "Skill-Gap Roadmap",
      desc: "Automatically maps identified weaknesses to personalized curriculum modules to close gaps before final campus placement drives.",
      badge: "Continuous improvement",
      dialogue: {
        interviewer: "What architectural trade-offs do you consider when choosing between PostgreSQL vs DynamoDB?",
        candidate: "PostgreSQL provides ACID transactions and relational joins for transactional accounting, while DynamoDB offers predictable sub-10ms latency for massive key-value lookup.",
        score: "91% Architectural Breadth",
      },
    },
  ];

  return (
    <div className="flex flex-col bg-[#fcfdfd] text-slate-900 overflow-hidden">
      {/* ── Hero Section (Matching Sujon Hossain's Dribbble SaaS Landing Page) ── */}
      <section className="relative overflow-hidden pt-32 pb-16 min-h-screen flex flex-col justify-center">
        {/* Subtle ambient teal/mint glow orbs with gentle pulsing animation */}
        <div
          className="absolute top-10 -left-20 w-[500px] h-[500px] rounded-full opacity-35 blur-[120px] pointer-events-none animate-glow-pulse"
          style={{ background: "radial-gradient(circle, #2dd4bf, transparent 70%)" }}
        />
        <div
          className="absolute top-20 -right-20 w-[550px] h-[550px] rounded-full opacity-30 blur-[130px] pointer-events-none animate-glow-pulse"
          style={{ background: "radial-gradient(circle, #38bdf8, transparent 70%)", animationDelay: "2s" }}
        />
        <div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-25 blur-[140px] pointer-events-none animate-glow-pulse"
          style={{ background: "radial-gradient(circle, #00a884, transparent 70%)", animationDelay: "4s" }}
        />

        {/* Faint giant watermark typography floating in background */}
        <div className="absolute top-44 left-1/2 -translate-x-1/2 select-none pointer-events-none font-black text-[90px] sm:text-[140px] md:text-[200px] tracking-widest text-slate-100/70 whitespace-nowrap -z-10 uppercase">
          INTERVIEWFOCUS
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          {/* Dual Pill Tag */}
          <div className="inline-flex items-center gap-2.5 p-1 pr-4 rounded-full bg-white border border-slate-200/90 shadow-sm mb-6 animate-fade-in hover:border-slate-300 transition-colors">
            <span className="bg-[#00a884] text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 shadow-xs">
              <Sparkles size={12} />
              Train with AI.
            </span>
            <span className="text-xs font-medium text-slate-700">
              Perform 4× better in real interviews.
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-[68px] font-extrabold text-slate-900 tracking-tight leading-[1.14] mb-6 max-w-5xl mx-auto animate-fade-in delay-100">
            <span className="block sm:whitespace-nowrap">Develop Job&#8209;Ready Talent</span>
            <span className="block mt-1 sm:mt-2">
              with <span className="text-[#00a884]">AI-Powered</span> Interview Prep
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-normal text-balance animate-fade-in delay-200">
            InterviewFocus dynamically generates questions, evaluates both delivery
            and content, and gives measurable insights across every answer.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in delay-300">
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 pl-6 pr-2 py-2 rounded-full bg-[#042f2e] hover:bg-[#064e3b] text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all group shimmer-sweep"
            >
              <span>Request A Demo</span>
              <span className="w-8 h-8 rounded-full bg-[#00a884] flex items-center justify-center text-white transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shadow-sm">
                <ArrowRight size={15} />
              </span>
            </Link>

            <button
              onClick={() => setShowDemoVideo(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all cursor-pointer"
            >
              <span>Watch How It Works</span>
              <span className="w-5 h-5 rounded-full bg-teal-50 text-[#00a884] flex items-center justify-center text-xs">
                ▶
              </span>
            </button>
          </div>

          {/* Glowing Rainbow Arch & Social Proof */}
          <div className="relative max-w-sm mx-auto mt-14 pt-6 pb-2 flex flex-col items-center justify-center animate-fade-in delay-400">
            {/* Iridescent Holographic Dome */}
            <div className="w-64 h-16 rounded-t-full iridescent-dome absolute -top-4 left-1/2 -translate-x-1/2 pointer-events-none animate-float-badge" />

            <span className="text-xs font-semibold text-slate-700 mb-3 tracking-wide relative z-10">
              Trusted by 1000+ users
            </span>

            {/* Overlapping Candidate Profile Avatars */}
            <div className="flex items-center -space-x-2.5 relative z-10">
              {candidateAvatars.map((avatar, idx) => (
                <img
                  key={idx}
                  src={avatar.img}
                  alt={avatar.name}
                  className="w-10 h-10 rounded-full ring-2 ring-white object-cover shadow-sm hover:scale-110 hover:z-20 transition-transform"
                />
              ))}
            </div>
          </div>

          {/* ── Central Floating Dashboard Mockup Card with Continuous Levitation ── */}
          <div className="mt-10 max-w-5xl mx-auto bg-white rounded-3xl shadow-[0_25px_70px_-15px_rgba(0,0,0,0.08),0_0_0_1px_rgba(226,232,240,0.9)] p-5 sm:p-7 md:p-8 relative text-left animate-float">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#00a884] flex items-center justify-center text-white text-sm shadow-xs">
                  <Sparkles size={16} />
                </div>
                <div className="text-sm font-semibold text-slate-800">
                  Interview<span className="text-[#00a884]">Focus</span>
                </div>
                <div className="hidden md:block h-4 w-px bg-slate-200 mx-2" />
                <div className="text-xs sm:text-sm text-slate-500 font-normal">
                  Welcome Back, <span className="font-semibold text-slate-900">Jasper Ron!</span>
                </div>
              </div>

              {/* Top right badges */}
              <div className="flex items-center gap-2.5 self-end sm:self-auto">
                <Link
                  href="/pricing"
                  className="bg-teal-50 hover:bg-teal-100/70 text-[#00a884] border border-teal-200/80 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                  title="View available plans & student credits"
                >
                  <span>🪙</span>
                  <span>100 Credits</span>
                </Link>
                <Link
                  href="/pricing"
                  className="text-xs font-medium text-slate-700 border border-slate-200 px-3 py-1 rounded-full hover:bg-slate-50 transition-colors flex items-center gap-1"
                >
                  <span>↑</span>
                  <span>Upgrade Plan</span>
                </Link>
                <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-700 overflow-hidden ring-1 ring-slate-300">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80"
                    alt="User"
                    className="w-full h-full object-cover"
                  />
                </div>
                <Link
                  href="/dashboard"
                  className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 text-xs relative"
                  title="Notifications"
                >
                  🔔
                  <span className="w-2 h-2 rounded-full bg-[#00a884] absolute -top-0.5 -right-0.5 ring-2 ring-white animate-pulse" />
                </Link>
              </div>
            </div>

            {/* Banner Inside Dashboard */}
            <div className="bg-gradient-to-r from-teal-50/90 via-emerald-50/60 to-cyan-50/90 border border-teal-100/90 rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#00a884] via-[#06b6d4] to-[#3b82f6] flex items-center justify-center text-white shadow-sm text-lg animate-pulse-slow">
                  🌐
                </div>
                <div>
                  <h4 className="text-slate-900 font-bold text-sm sm:text-base">
                    Ready to practice your next interview?
                  </h4>
                  <p className="text-xs text-slate-500">
                    Live adaptive questions tailored to your target tech stack and seniority.
                  </p>
                </div>
              </div>
              <Link
                href="/interviews/new"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#042f2e] hover:bg-[#064e3b] text-white text-xs font-semibold shadow-xs transition-all shrink-0"
              >
                <span>View Interviews</span>
                <span>→</span>
              </Link>
            </div>

            {/* Middle Section: Mini Sidebar + 4 Metric Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
              {/* Mini Left Navigation */}
              <div className="lg:col-span-1 bg-slate-50/80 border border-slate-100 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <Link
                    href="/interviews/new"
                    className="w-full py-2.5 rounded-xl bg-[#042f2e] hover:bg-[#064e3b] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-all mb-3.5"
                  >
                    <span>+</span>
                    <span>New Interview</span>
                  </Link>

                  <div className="relative mb-4">
                    <span className="absolute left-3 top-2.5 text-xs text-slate-400">🔍</span>
                    <input
                      type="text"
                      readOnly
                      placeholder="Search Interviews..."
                      className="w-full bg-white border border-slate-200 text-xs rounded-xl pl-8 pr-3 py-2 text-slate-700 outline-none placeholder:text-slate-400"
                    />
                  </div>

                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Recent Interviews</span>
                    <span>∨</span>
                  </div>
                  <div className="space-y-1.5">
                    <Link
                      href="/interviews/new"
                      className="p-2.5 bg-white border border-slate-200/80 rounded-xl hover:border-slate-300 transition-colors block"
                    >
                      <div className="text-xs font-semibold text-slate-800">Data Scientist</div>
                      <div className="text-[10px] text-slate-500 flex items-center justify-between mt-0.5">
                        <span>Quantify</span>
                        <span className="text-[#00a884] font-bold">88%</span>
                      </div>
                    </Link>
                    <Link
                      href="/interviews/new"
                      className="p-2.5 bg-white border border-slate-200/80 rounded-xl hover:border-slate-300 transition-colors block"
                    >
                      <div className="text-xs font-semibold text-slate-800">UX Designer</div>
                      <div className="text-[10px] text-slate-500 flex items-center justify-between mt-0.5">
                        <span>Figma</span>
                        <span className="text-[#00a884] font-bold">92%</span>
                      </div>
                    </Link>
                    <Link
                      href="/interviews/new"
                      className="p-2.5 bg-white border border-slate-200/80 rounded-xl hover:border-slate-300 transition-colors block"
                    >
                      <div className="text-xs font-semibold text-slate-800">Project Manager</div>
                      <div className="text-[10px] text-slate-500 flex items-center justify-between mt-0.5">
                        <span>Asana</span>
                        <span className="text-[#00a884] font-bold">84%</span>
                      </div>
                    </Link>
                  </div>
                </div>

                {/* Free Plan status card */}
                <div className="mt-4 pt-3 border-t border-slate-200/70 text-xs">
                  <div className="flex items-center justify-between font-semibold text-slate-800 mb-1">
                    <span>Free Plan</span>
                    <span className="text-[#00a884]">3/5 left</span>
                  </div>
                  <Link
                    href="/pricing"
                    className="block text-center py-1.5 rounded-lg bg-teal-50 text-[#00a884] font-medium hover:bg-teal-100/70 transition-colors mt-2"
                  >
                    ↑ Upgrade Plan
                  </Link>
                </div>
              </div>

              {/* 4 Stat Metric Cards */}
              <div className="lg:col-span-3 flex flex-col gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {/* 1. Total Interviews */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-teal-300 transition-colors">
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                      <div className="w-5 h-5 rounded-md bg-teal-50 text-[#00a884] flex items-center justify-center text-[10px]">
                        🎤
                      </div>
                      <span>Total Interviews</span>
                    </div>
                    <div className="my-3">
                      <div className="text-3xl font-extrabold text-slate-900 tracking-tight">38</div>
                      <div className="text-[11px] text-slate-500 font-medium mt-1">12 last month</div>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#00a884] rounded-full transition-all duration-1000" style={{ width: "75%" }} />
                    </div>
                  </div>

                  {/* 2. Average Score */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-teal-300 transition-colors">
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                      <div className="w-5 h-5 rounded-md bg-amber-50 text-amber-500 flex items-center justify-center text-[10px]">
                        ⭐
                      </div>
                      <span>Average Score</span>
                    </div>
                    <div className="my-3">
                      <div className="text-3xl font-extrabold text-slate-900 tracking-tight">4.7</div>
                      <div className="text-[11px] text-[#00a884] font-semibold mt-1">12.3% improvement</div>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full transition-all duration-1000" style={{ width: "94%" }} />
                    </div>
                  </div>

                  {/* 3. Practice Time */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-teal-300 transition-colors">
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                      <div className="w-5 h-5 rounded-md bg-blue-50 text-blue-500 flex items-center justify-center text-[10px]">
                        ⏱️
                      </div>
                      <span>Practice Time</span>
                    </div>
                    <div className="my-3">
                      <div className="text-2xl font-extrabold text-slate-900 tracking-tight">37:21:06</div>
                      <div className="text-[11px] text-slate-500 font-medium mt-1">Last 30 days</div>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: "68%" }} />
                    </div>
                  </div>

                  {/* 4. Streak */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-teal-300 transition-colors">
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                      <div className="w-5 h-5 rounded-md bg-orange-50 text-orange-500 flex items-center justify-center text-[10px]">
                        🔥
                      </div>
                      <span>Streak</span>
                    </div>
                    <div className="my-3">
                      <div className="text-3xl font-extrabold text-slate-900 tracking-tight">4</div>
                      <div className="text-[11px] text-slate-500 font-medium mt-1">Days in a row</div>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 rounded-full transition-all duration-1000" style={{ width: "80%" }} />
                    </div>
                  </div>
                </div>

                {/* Universal Skills Scorecard (From Dribbble Shot 3) */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <BarChart3 size={14} className="text-[#00a884]" />
                      Universal Skills Scorecard
                    </h5>
                    <span className="text-xs font-bold text-[#00a884] bg-teal-50 border border-teal-200/70 px-2.5 py-0.5 rounded-full">
                      76% Overall
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {[
                      { skill: "Communication", val: "78%" },
                      { skill: "Professionalism", val: "78%" },
                      { skill: "Problem Solving", val: "78%" },
                      { skill: "Critical Thinking", val: "78%" },
                      { skill: "Confidence", val: "78%" },
                    ].map((item, idx) => (
                      <div key={idx} className="bg-white border border-slate-200/70 rounded-xl p-2.5 text-center">
                        <div className="text-[11px] font-medium text-slate-600 truncate">{item.skill}</div>
                        <div className="text-sm font-bold text-slate-900 mt-0.5">{item.val}</div>
                        <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden mt-2">
                          <div className="h-full bg-[#00a884] rounded-full" style={{ width: "78%" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3 Quick Action Cards (From Dribbble Shot 3) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Link
                    href="/interviews/new"
                    className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-teal-400 hover:shadow-xs transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#00a884] flex items-center justify-center text-sm font-bold">
                        🎙️
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800 group-hover:text-[#00a884] transition-colors">
                          Custom Interview
                        </div>
                        <div className="text-[10px] text-slate-500">Configure role & stack</div>
                      </div>
                    </div>
                    <ArrowRight size={13} className="text-slate-400 group-hover:text-[#00a884] transition-transform group-hover:translate-x-1" />
                  </Link>

                  <Link
                    href="/resume"
                    className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-teal-400 hover:shadow-xs transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-bold">
                        📄
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800 group-hover:text-[#00a884] transition-colors">
                          Analyze Resume
                        </div>
                        <div className="text-[10px] text-slate-500">ATS match score</div>
                      </div>
                    </div>
                    <ArrowRight size={13} className="text-slate-400 group-hover:text-[#00a884] transition-transform group-hover:translate-x-1" />
                  </Link>

                  <Link
                    href="/skills"
                    className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-teal-400 hover:shadow-xs transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold">
                        👥
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800 group-hover:text-[#00a884] transition-colors">
                          Skill-Gap Roadmap
                        </div>
                        <div className="text-[10px] text-slate-500">Close missing skills</div>
                      </div>
                    </div>
                    <ArrowRight size={13} className="text-slate-400 group-hover:text-[#00a884] transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Section 1: "From Conversation to Clear Insights" (From Dribbble Shot 3) ── */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-[#00a884] text-xs font-semibold mb-4">
                <Sparkles size={13} />
                <span>Performance Intelligence &bull; Built for real hiring</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
                From Conversation <br />to <span className="text-[#00a884]">Clear Insights</span>
              </h2>
              <p className="text-base text-slate-600 leading-relaxed mb-8">
                After every simulated interview, participants receive a detailed breakdown of their performance. The platform evaluates both delivery and answer quality, transforming each session into clear, measurable insights that drive real improvement.
              </p>

              {/* 3 Value Pillars */}
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-teal-200 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#00a884] flex items-center justify-center shrink-0 mt-0.5">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Deep Answer Evaluation</h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      Assesses structure, clarity, and relevance using calibrated placement benchmarks.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-teal-200 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Volume2 size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Communication & Behavioral Metrics</h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      Tracks tone, pacing, eye contact, and confidence across every question answered.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-teal-200 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <TrendingUp size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Progress Tracking Over Time</h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      Compare practice sessions and monitor measurable improvement leading up to recruitment day.
                    </p>
                  </div>
                </div>
              </div>

              <Link
                href="/features"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#042f2e] hover:bg-[#064e3b] text-white text-sm font-semibold transition-all shadow-sm"
              >
                <span>See the Platform</span>
                <span>↗</span>
              </Link>
            </div>

            {/* Right Card: Candidate Portrait with Floating Badges & Video Practice Preview */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden border border-slate-200/90 shadow-xl bg-slate-50">
                {/* Candidate Video Feed Preview */}
                <div className="relative h-72 sm:h-80 w-full overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80"
                    alt="Candidate in Live Interview"
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                  {/* Play/Listen Indicator */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={() => setVideoPlaying(!videoPlaying)}
                      className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-md text-[#00a884] flex items-center justify-center shadow-2xl hover:scale-105 transition-transform cursor-pointer"
                      title="Play simulated interview"
                    >
                      {videoPlaying ? <Volume2 size={24} className="animate-pulse" /> : <Play size={22} className="ml-1" />}
                    </button>
                  </div>

                  {/* Audio Waveform Bar at Bottom of Video */}
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs font-medium">
                    <span className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
                      <span className="w-2 h-2 rounded-full bg-[#00a884] animate-pulse" />
                      Live AI Practice Studio
                    </span>
                    <span className="font-mono text-[11px] bg-black/40 backdrop-blur-md px-2 py-1 rounded-md">
                      04:12 / 15:00
                    </span>
                  </div>
                </div>

                {/* Floating Metrics Row (From Dribbble shot 3) */}
                <div className="p-5 bg-white flex items-center justify-between gap-4 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#00a884] flex items-center justify-center font-bold">
                      🎤
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Total Interviews</div>
                      <div className="text-lg font-extrabold text-slate-900">38</div>
                    </div>
                  </div>

                  <div className="h-8 w-px bg-slate-200" />

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center font-bold">
                      ⭐
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Average Score</div>
                      <div className="text-lg font-extrabold text-slate-900">4.7 / 5.0</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Tag Chips */}
              <div className="absolute -top-4 -right-4 bg-white border border-slate-200 rounded-2xl p-3 shadow-lg hidden sm:flex items-center gap-2.5 animate-float-badge">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  ✓
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Interview Focus Score</div>
                  <div className="text-[10px] text-[#00a884] font-semibold">Ready for Placement</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Section 2: "Why Organizations Choose InterviewFocus" (From Dribbble Shot 3) ── */}
      <section className="py-20 bg-slate-50/70 border-t border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-[#00a884] text-xs font-semibold mb-3">
              <Zap size={13} />
              <span>Unlock your career potential</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Why Organizations Choose <span className="text-[#00a884]">InterviewFocus</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
              Designed to simulate real-world hiring rounds with conversational intelligence and precision scoring.
            </p>
          </div>

          {/* Interactive Numbered Tabbed Component */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left Tabs Selection */}
            <div className="flex flex-col gap-3">
              {organizationTabs.map((tab, idx) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(idx)}
                  className={`p-5 rounded-2xl text-left border transition-all cursor-pointer ${
                    activeTab === idx
                      ? "bg-white border-[#00a884] shadow-md ring-1 ring-[#00a884]/20 scale-[1.01]"
                      : "bg-white/60 border-slate-200/80 hover:bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#00a884] font-mono">
                      {tab.id}. {tab.badge}
                    </span>
                    <span className={`text-xs ${activeTab === idx ? "text-[#00a884]" : "text-slate-400"}`}>
                      →
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">{tab.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{tab.desc}</p>
                </button>
              ))}
            </div>

            {/* Right Interactive Live Dialogue Card */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8 relative">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-teal-50 text-[#00a884] flex items-center justify-center text-sm font-bold">
                    🤖
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">InterviewFocus Conversational Core</div>
                    <div className="text-[10px] text-slate-400">Live Turn-Taking Dialogue Simulation</div>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                  {organizationTabs[activeTab].badge}
                </span>
              </div>

              {/* Chat bubbles */}
              <div className="space-y-4">
                {/* Interviewer */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-1">
                    AI
                  </div>
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl rounded-tl-sm p-4 text-xs sm:text-sm text-slate-800 leading-relaxed max-w-xl">
                    {organizationTabs[activeTab].dialogue.interviewer}
                  </div>
                </div>

                {/* Candidate */}
                <div className="flex items-start gap-3 justify-end">
                  <div className="bg-[#042f2e] text-white rounded-2xl rounded-tr-sm p-4 text-xs sm:text-sm leading-relaxed max-w-xl shadow-xs">
                    {organizationTabs[activeTab].dialogue.candidate}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#00a884] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-1">
                    You
                  </div>
                </div>

                {/* Analysis Chip */}
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                    <CheckCircle size={14} className="text-[#00a884]" />
                    {organizationTabs[activeTab].dialogue.score}
                  </span>
                  <Link href="/interviews/new" className="text-[#00a884] font-semibold hover:underline">
                    Practice This Track →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="bg-white border-y border-slate-100 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-1">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-slate-500 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final Call To Action ── */}
      <section className="py-20 bg-[#042f2e] text-white relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at center, #00a884 0%, transparent 70%)",
          }}
        />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Develop Job-Ready Talent Today
          </h2>
          <p className="text-base sm:text-lg text-slate-300 mb-8 max-w-xl mx-auto leading-relaxed">
            Practice conversational interviews tailored to your target company and skills.
            Free for verified college students.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-3 pl-6 pr-2 py-2 rounded-full bg-[#00a884] hover:bg-[#028b6d] text-white text-sm font-semibold shadow-lg transition-all group"
            >
              <span>Start Free Practice</span>
              <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white transition-transform group-hover:translate-x-0.5">
                ↗
              </span>
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/15 text-white text-sm font-semibold border border-white/20 transition-all"
            >
              View Plan Details
            </Link>
          </div>
          <p className="text-xs text-slate-400 mt-6">
            Karpagam College of Engineering Placement Partner Framework &bull; Verified AI Models
          </p>
        </div>
      </section>

      {/* ── Demo Video Modal (Triggered by "Watch How It Works ▶") ── */}
      {showDemoVideo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 text-white shadow-2xl relative">
            <button
              onClick={() => setShowDemoVideo(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00a884] animate-pulse" />
              <h3 className="text-base font-bold text-white">How SkillMatch AI Works</h3>
            </div>

            {/* Video preview simulation */}
            <div className="relative rounded-2xl overflow-hidden aspect-video bg-black/60 border border-white/10 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-[#00a884]/20 border border-[#00a884]/50 flex items-center justify-center text-[#00a884] mb-3">
                <Play size={28} className="ml-1" />
              </div>
              <h4 className="font-bold text-sm text-white mb-1">
                Live Conversational AI Interview Preview
              </h4>
              <p className="text-xs text-white/60 max-w-sm mb-4">
                Watch how our AI recruiter listens, asks adaptive follow-ups, and produces granular placement scoring in real-time.
              </p>
              <Link
                href="/interviews/new"
                onClick={() => setShowDemoVideo(false)}
                className="px-5 py-2 rounded-full bg-[#00a884] hover:bg-[#009272] text-white text-xs font-semibold transition-colors shadow-md"
              >
                Try It Live In Browser ↗
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
