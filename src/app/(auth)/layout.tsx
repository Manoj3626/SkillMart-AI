import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left: Decorative branding panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero relative overflow-hidden flex-col justify-between p-12 noise">
        <div
          className="absolute top-1/3 left-1/4 w-80 h-80 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{
            background: "radial-gradient(circle, var(--color-brand-600), transparent)",
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-60 h-60 rounded-full opacity-15 blur-3xl pointer-events-none"
          style={{
            background: "radial-gradient(circle, var(--color-teal-500), transparent)",
          }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center shadow-xl">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-white font-bold text-xl">
            SkillMatch<span className="text-[var(--color-teal-400)]"> AI</span>
          </span>
        </div>

        {/* Quote */}
        <div className="relative z-10">
          <blockquote className="text-white/90 text-2xl font-semibold leading-snug mb-6 text-balance">
            &ldquo;Practice smarter. Interview better. Get hired faster.&rdquo;
          </blockquote>
          <div className="flex flex-col gap-4">
            {[
              "Live AI voice interview practice",
              "Resume alignment scoring",
              "Explainable job matching",
              "Skill-gap roadmap",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-white/70">
                <div className="w-5 h-5 rounded-full bg-[var(--color-teal-500)] flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 24 24" className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3}>
                    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-white/30">
          © 2026 SkillMatch AI
        </p>
      </div>

      {/* Right: Auth form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[var(--color-surface-50)]">
        {children}
      </div>
    </div>
  );
}
