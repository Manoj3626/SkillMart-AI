"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Zap, ChevronDown, LogOut, LayoutDashboard, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/features", label: "Features" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/for-recruiters", label: "For Recruiters" },
  { href: "/for-colleges", label: "For Colleges" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isHeroPage =
    pathname === "/" ||
    pathname === "/features" ||
    pathname === "/how-it-works" ||
    pathname === "/for-recruiters" ||
    pathname === "/for-colleges";

  return (
    <header className="fixed top-4 left-0 right-0 z-50 px-4 pointer-events-none transition-all duration-300">
      <div className="max-w-6xl mx-auto rounded-full bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-[0_8px_30px_rgb(0,0,0,0.06)] px-5 sm:px-6 py-2.5 flex items-center justify-between pointer-events-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-8 h-8 rounded-lg bg-[#00a884] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform text-white">
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M3 12h1m16 0h1M12 3v1m0 16v1" />
              <path d="M5.6 5.6l.7.7m11.4 11.4l.7.7M5.6 18.4l.7-.7m11.4-11.4l.7-.7" />
            </svg>
          </div>
          <span className="text-slate-900 font-bold text-lg tracking-tight">
            Interview<span className="text-[#00a884]">Focus</span>
          </span>
        </Link>

        {/* Desktop nav centered */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8 mx-auto">
          <Link
            href="/features"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            Platform
          </Link>
          <div className="relative group/menu flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900 cursor-pointer transition-colors">
            <Link href="/solutions" className="hover:text-slate-900">Solutions</Link>
            <ChevronDown size={14} className="text-slate-400 group-hover/menu:text-slate-700 transition-transform group-hover/menu:rotate-180" />
            <div className="absolute top-full left-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-lg p-2 hidden group-hover/menu:flex flex-col gap-1 animate-fade-in z-50">
              <Link href="/solutions" className="px-3 py-2 text-xs font-semibold text-[#00a884] hover:bg-teal-50/70 rounded-lg">All Solutions Overview</Link>
              <Link href="/for-colleges" className="px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg">For Colleges & Placement Cells</Link>
              <Link href="/for-recruiters" className="px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg">For Recruiters & Companies</Link>
              <Link href="/how-it-works" className="px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg">How It Works</Link>
            </div>
          </div>
          <Link
            href="/success-stories"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            Success Stories
          </Link>
          <Link
            href="/pricing"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/resources"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            Resources
          </Link>
        </nav>

        {/* Auth CTA */}
        <div className="hidden md:flex items-center gap-4 shrink-0">
          <Link
            href="/login"
            className="text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors px-2 py-1"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 pl-4 pr-1.5 py-1.5 rounded-full bg-[#042f2e] hover:bg-[#064e3b] text-white text-sm font-semibold transition-all shadow-sm group"
          >
            <span>Request a Demo</span>
            <span className="w-6 h-6 rounded-full bg-[#00a884] flex items-center justify-center text-white transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="7" y1="17" x2="17" y2="7"></line>
                <polyline points="7 7 17 7 17 17"></polyline>
              </svg>
            </span>
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="lg:hidden text-slate-700 hover:text-slate-900 transition-colors p-1"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="max-w-6xl mx-auto mt-2 rounded-2xl bg-white border border-slate-200 shadow-xl p-4 flex flex-col gap-2 pointer-events-auto animate-fade-in lg:hidden">
          <Link href="/features" className="text-sm font-medium text-slate-700 hover:text-slate-900 py-2 px-3 rounded-lg hover:bg-slate-50">
            Platform
          </Link>
          <Link href="/solutions" className="text-sm font-medium text-slate-700 hover:text-slate-900 py-2 px-3 rounded-lg hover:bg-slate-50">
            Solutions
          </Link>
          <Link href="/success-stories" className="text-sm font-medium text-slate-700 hover:text-slate-900 py-2 px-3 rounded-lg hover:bg-slate-50">
            Success Stories
          </Link>
          <Link href="/pricing" className="text-sm font-medium text-slate-700 hover:text-slate-900 py-2 px-3 rounded-lg hover:bg-slate-50">
            Pricing
          </Link>
          <Link href="/resources" className="text-sm font-medium text-slate-700 hover:text-slate-900 py-2 px-3 rounded-lg hover:bg-slate-50">
            Resources
          </Link>
          <hr className="border-slate-100 my-1" />
          <div className="flex items-center justify-between pt-2">
            <Link href="/login" className="text-sm font-semibold text-slate-700 hover:text-slate-900">
              Login
            </Link>
            <Link href="/signup" className="inline-flex items-center gap-1.5 pl-3 pr-1 py-1 rounded-full bg-[#042f2e] text-white text-xs font-semibold">
              <span>Request a Demo</span>
              <span className="w-5 h-5 rounded-full bg-[#00a884] flex items-center justify-center text-white">
                ↗
              </span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

/** Authenticated app navbar (candidate dashboard) */
export function AppNavbar({ userName, onSignOut }: { userName?: string; onSignOut?: () => void }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const initial = userName?.[0]?.toUpperCase() ?? "U";

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm border-b border-[var(--color-surface-200)]">
      <div className="container-xl flex items-center h-14 gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-md gradient-brand flex items-center justify-center">
            <Zap size={13} className="text-white" />
          </div>
          <span className="font-bold text-base text-[var(--color-surface-900)] tracking-tight">
            SkillMatch<span className="text-[var(--color-brand-600)]"> AI</span>
          </span>
        </Link>

        <div className="flex-1" />

        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 text-sm font-medium text-[var(--color-surface-700)] hover:text-[var(--color-surface-900)] transition-colors"
          >
            <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold">
              {initial}
            </div>
            <span className="hidden sm:block">{userName ?? "Account"}</span>
            <ChevronDown size={14} className={cn("transition-transform", dropdownOpen && "rotate-180")} />
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-52 card p-1 animate-fade-in"
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--color-surface-700)] hover:bg-[var(--color-surface-50)] hover:text-[var(--color-surface-900)] transition-colors">
                <LayoutDashboard size={15} /> Dashboard
              </Link>
              <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--color-surface-700)] hover:bg-[var(--color-surface-50)] hover:text-[var(--color-surface-900)] transition-colors">
                <User size={15} /> Profile
              </Link>
              <hr className="border-[var(--color-surface-100)] my-1" />
              <button
                onClick={onSignOut}
                className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-[var(--color-error-600)] hover:bg-[var(--color-error-50)] transition-colors"
              >
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
