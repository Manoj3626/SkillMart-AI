"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Mic,
  FileText,
  Briefcase,
  TrendingUp,
  BookOpen,
  FolderGit2,
  Settings,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Zap,
  LogOut,
  Users,
  PlusCircle,
  GraduationCap,
  BarChart2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type UserRole = "candidate" | "recruiter" | "college";

const NAV_ITEMS: Record<UserRole, { href: string; icon: React.ElementType; label: string }[]> = {
  candidate: [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/interviews", icon: Mic, label: "AI Interviews" },
    { href: "/resume", icon: FileText, label: "Resume Analyzer" },
    { href: "/jobs", icon: Briefcase, label: "Job Discovery" },
    { href: "/skills", icon: TrendingUp, label: "Skill Gap" },
    { href: "/applications", icon: ClipboardList, label: "Applications" },
    { href: "/portfolio", icon: FolderGit2, label: "Portfolio" },
    { href: "/learn", icon: BookOpen, label: "Learning" },
  ],
  recruiter: [
    { href: "/recruiter/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/recruiter/jobs", icon: Briefcase, label: "Job Postings" },
    { href: "/recruiter/jobs/new", icon: PlusCircle, label: "Post a Job" },
    { href: "/recruiter/applicants", icon: Users, label: "Applicants" },
  ],
  college: [
    { href: "/college/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/college/students", icon: GraduationCap, label: "Students" },
    { href: "/college/analytics", icon: BarChart2, label: "Analytics" },
  ],
};

const BOTTOM_ITEMS: Record<UserRole, { href: string; icon: React.ElementType; label: string }[]> = {
  candidate: [{ href: "/settings", icon: Settings, label: "Settings" }],
  recruiter: [{ href: "/recruiter/settings", icon: Settings, label: "Settings" }],
  college: [{ href: "/college/settings", icon: Settings, label: "Settings" }],
};

interface SidebarProps {
  role?: UserRole;
  userName?: string;
  userInitial?: string;
  onSignOut?: () => void;
}

export function CandidateSidebar({ role = "candidate", userName, userInitial = "U", onSignOut }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const navItems = NAV_ITEMS[role];
  const bottomItems = BOTTOM_ITEMS[role];

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col bg-white border-r border-[var(--color-surface-200)] transition-all duration-300",
        collapsed ? "w-16" : "w-56"
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center gap-2 px-4 py-4 border-b border-[var(--color-surface-100)]", collapsed && "justify-center px-2")}>
        <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center shrink-0">
          <Zap size={15} className="text-white" />
        </div>
        {!collapsed && (
          <span className="font-bold text-sm text-[var(--color-surface-900)] tracking-tight">
            SkillMatch<span className="text-[var(--color-brand-600)]"> AI</span>
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 flex flex-col gap-0.5">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                active
                  ? "bg-[var(--color-brand-50)] text-[var(--color-brand-700)]"
                  : "text-[var(--color-surface-600)] hover:bg-[var(--color-surface-50)] hover:text-[var(--color-surface-900)]",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? label : undefined}
            >
              <Icon
                size={17}
                className={cn(
                  "shrink-0",
                  active ? "text-[var(--color-brand-600)]" : "text-[var(--color-surface-400)] group-hover:text-[var(--color-surface-600)]"
                )}
              />
              {!collapsed && label}
              {active && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--color-brand-500)]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-[var(--color-surface-100)] py-3 px-2 flex flex-col gap-0.5">
        {bottomItems.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-[var(--color-surface-600)] hover:bg-[var(--color-surface-50)] hover:text-[var(--color-surface-900)]",
              collapsed && "justify-center px-2"
            )}
            title={collapsed ? label : undefined}
          >
            <Icon size={17} className="shrink-0 text-[var(--color-surface-400)]" />
            {!collapsed && label}
          </Link>
        ))}

        {/* User */}
        <div className={cn("flex items-center gap-2 px-3 py-2 mt-1", collapsed && "justify-center px-0")}>
          <div className="w-7 h-7 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold shrink-0">
            {userInitial}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-[var(--color-surface-800)] truncate">
                {userName ?? "Candidate"}
              </div>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={onSignOut}
              className="text-[var(--color-surface-400)] hover:text-[var(--color-error-500)] transition-colors"
              aria-label="Sign out"
            >
              <LogOut size={14} />
            </button>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[var(--color-surface-400)] hover:text-[var(--color-surface-600)] hover:bg-[var(--color-surface-50)] transition-all",
            collapsed && "justify-center px-2"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={14} /> : <><ChevronLeft size={14} /> Collapse</>}
        </button>
      </div>
    </aside>
  );
}
