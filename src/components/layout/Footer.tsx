import React from "react";
import Link from "next/link";
import { Zap, ExternalLink } from "lucide-react";

const footerLinks = {
  Platform: [
    { href: "/features", label: "Features" },
    { href: "/how-it-works", label: "How It Works" },
    { href: "/for-recruiters", label: "For Recruiters" },
    { href: "/for-colleges", label: "For Colleges" },
  ],
  "For Candidates": [
    { href: "/signup", label: "Get Started Free" },
    { href: "/interviews", label: "AI Interview Practice" },
    { href: "/resume", label: "Resume Analyzer" },
    { href: "/skills", label: "Skill Gap Analysis" },
  ],
  Company: [
    { href: "/about", label: "About" },
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-[var(--color-surface-900)] text-white">
      <div className="container-xl py-16">
        {/* Top: Brand + Links */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
          {/* Brand column */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center">
                <Zap size={16} className="text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight">
                SkillMatch<span className="text-[var(--color-teal-400)]"> AI</span>
              </span>
            </Link>
            <p className="text-sm text-white/60 leading-relaxed max-w-xs">
              Your Skills. Your Future. Your Perfect Match.
              <br />
              The AI-powered platform that connects talent with opportunity.
            </p>
            {/* Social */}
            <div className="flex items-center gap-3 mt-6">
              {[
                { href: "#", label: "GitHub" },
                { href: "#", label: "Twitter" },
                { href: "#", label: "LinkedIn" },
              ].map(({ href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors"
                >
                  <ExternalLink size={11} />
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-4">
                {category}
              </h4>
              <ul className="flex flex-col gap-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="divider opacity-10 mb-6" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <p>© 2026 SkillMatch AI. All rights reserved.</p>
          <p>
            Built for candidates, recruiters, and colleges. Not affiliated with any specific employer.
          </p>
        </div>
      </div>
    </footer>
  );
}
