"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mic, ChevronRight, Info, Clock, Target, Brain } from "lucide-react";
import { toast } from "@/components/ui/Toaster";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const setupSchema = z.object({
  jobRole: z.string().min(2, "Job role is required"),
  experienceLevel: z.enum(["fresher", "junior", "mid", "senior"]),
  interviewType: z.enum(["technical", "behavioral", "hr", "mixed"]),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  durationMinutes: z.number().min(5).max(60),
  jobDescription: z.string().optional(),
  focusSkills: z.string().optional(),
  consentTranscript: z.boolean(),
});
type SetupForm = z.infer<typeof setupSchema>;

const experienceLevels = [
  { value: "fresher", label: "Fresher", desc: "0–1 year" },
  { value: "junior", label: "Junior", desc: "1–3 years" },
  { value: "mid", label: "Mid-level", desc: "3–6 years" },
  { value: "senior", label: "Senior", desc: "6+ years" },
] as const;

const interviewTypes = [
  { value: "technical", label: "Technical", desc: "Coding & problem-solving" },
  { value: "behavioral", label: "Behavioral", desc: "Situational & STAR" },
  { value: "hr", label: "HR", desc: "Culture & fit questions" },
  { value: "mixed", label: "Mixed", desc: "All of the above", popular: true },
] as const;

const difficulties = [
  { value: "beginner", label: "Beginner", color: "success" },
  { value: "intermediate", label: "Intermediate", color: "warning" },
  { value: "advanced", label: "Advanced", color: "error" },
] as const;

const durations = [10, 15, 20, 30, 45, 60];

const popularRoles = [
  "Software Engineer",
  "Data Analyst",
  "Product Manager",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Scientist",
  "DevOps Engineer",
  "Business Analyst",
  "UI/UX Designer",
];

export default function NewInterviewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SetupForm>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      experienceLevel: "junior",
      interviewType: "mixed",
      difficulty: "intermediate",
      durationMinutes: 20,
      consentTranscript: true,
    },
  });

  const watchedType = watch("interviewType");
  const watchedDiff = watch("difficulty");
  const watchedExp = watch("experienceLevel");
  const watchedDur = watch("durationMinutes");
  const watchedRole = watch("jobRole");

  const onSubmit = async (data: SetupForm) => {
    setLoading(true);
    try {
      // Store config in sessionStorage for the studio page
      const sessionId = `interview-${Date.now()}`;
      sessionStorage.setItem(
        `interview-config-${sessionId}`,
        JSON.stringify({
          ...data,
          focusSkills: data.focusSkills
            ? data.focusSkills.split(",").map((s) => s.trim()).filter(Boolean)
            : [],
        })
      );
      router.push(`/interviews/${sessionId}`);
    } catch (err) {
      toast.error("Failed to start interview. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center">
            <Mic size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-surface-900)]">
              New AI Interview
            </h1>
            <p className="text-sm text-[var(--color-surface-500)]">
              Configure your practice session, then start speaking.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        {/* Job Role */}
        <Card className="animate-fade-in delay-100">
          <CardHeader>
            <div>
              <CardTitle>Target Role</CardTitle>
              <CardDescription>What position are you practicing for?</CardDescription>
            </div>
            <Target size={18} className="text-[var(--color-brand-400)]" />
          </CardHeader>
          <div className="flex flex-col gap-3">
            <input
              id="jobRole"
              type="text"
              placeholder="e.g. Software Engineer, Data Analyst…"
              className={`input ${errors.jobRole ? "input-error" : ""}`}
              {...register("jobRole")}
            />
            {errors.jobRole && (
              <p className="text-xs text-[var(--color-error-500)]">{errors.jobRole.message}</p>
            )}
            {/* Popular roles */}
            <div className="flex flex-wrap gap-2">
              {popularRoles.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setValue("jobRole", role)}
                  className={`badge cursor-pointer transition-all ${
                    watchedRole === role ? "badge-brand" : "badge-surface hover:badge-brand"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Interview Configuration */}
        <Card className="animate-fade-in delay-150">
          <CardHeader>
            <div>
              <CardTitle>Interview Configuration</CardTitle>
              <CardDescription>Customize the type and difficulty</CardDescription>
            </div>
            <Brain size={18} className="text-[var(--color-violet-400)]" />
          </CardHeader>

          <div className="flex flex-col gap-5">
            {/* Experience Level */}
            <div>
              <label className="label mb-2">Experience Level</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {experienceLevels.map(({ value, label, desc }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setValue("experienceLevel", value)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-center ${
                      watchedExp === value
                        ? "border-[var(--color-brand-500)] bg-[var(--color-brand-50)]"
                        : "border-[var(--color-surface-200)] hover:border-[var(--color-brand-200)]"
                    }`}
                  >
                    <span className={`text-xs font-bold ${watchedExp === value ? "text-[var(--color-brand-700)]" : "text-[var(--color-surface-700)]"}`}>
                      {label}
                    </span>
                    <span className="text-[10px] text-[var(--color-surface-400)]">{desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Interview Type */}
            <div>
              <label className="label mb-2">Interview Type</label>
              <div className="grid grid-cols-2 gap-2">
                {interviewTypes.map(({ value, label, desc, ...rest }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setValue("interviewType", value)}
                    className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all text-left ${
                      watchedType === value
                        ? "border-[var(--color-brand-500)] bg-[var(--color-brand-50)]"
                        : "border-[var(--color-surface-200)] hover:border-[var(--color-brand-200)]"
                    }`}
                  >
                    <div>
                      <div className={`text-sm font-semibold ${watchedType === value ? "text-[var(--color-brand-700)]" : "text-[var(--color-surface-800)]"}`}>
                        {label}
                      </div>
                      <div className="text-xs text-[var(--color-surface-400)]">{desc}</div>
                    </div>
                    {"popular" in rest && rest.popular && (
                      <span className="badge badge-teal text-[10px]">Popular</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className="label mb-2">Difficulty</label>
              <div className="grid grid-cols-3 gap-2">
                {difficulties.map(({ value, label, color }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setValue("difficulty", value)}
                    className={`p-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                      watchedDiff === value
                        ? `border-[var(--color-${color}-500)] bg-[var(--color-${color}-50)] text-[var(--color-${color}-700)]`
                        : "border-[var(--color-surface-200)] text-[var(--color-surface-600)] hover:border-[var(--color-surface-300)]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Duration & Optional */}
        <Card className="animate-fade-in delay-200">
          <CardHeader>
            <div>
              <CardTitle>Duration & Options</CardTitle>
            </div>
            <Clock size={18} className="text-[var(--color-teal-400)]" />
          </CardHeader>

          <div className="flex flex-col gap-5">
            {/* Duration */}
            <div>
              <label className="label mb-2">
                Interview Duration — <span className="text-[var(--color-brand-600)]">{watchedDur} minutes</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {durations.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setValue("durationMinutes", d)}
                    className={`px-4 py-2 rounded-lg border-2 text-sm font-semibold transition-all ${
                      watchedDur === d
                        ? "border-[var(--color-brand-500)] bg-[var(--color-brand-50)] text-[var(--color-brand-700)]"
                        : "border-[var(--color-surface-200)] text-[var(--color-surface-600)] hover:border-[var(--color-brand-200)]"
                    }`}
                  >
                    {d}m
                  </button>
                ))}
              </div>
            </div>

            {/* Job description */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="jobDescription" className="label">
                Job Description{" "}
                <span className="text-[var(--color-surface-400)] font-normal">(optional)</span>
              </label>
              <textarea
                id="jobDescription"
                placeholder="Paste the job description to get role-specific questions…"
                className="input resize-none min-h-[80px]"
                {...register("jobDescription")}
              />
            </div>

            {/* Focus skills */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="focusSkills" className="label">
                Focus Skills{" "}
                <span className="text-[var(--color-surface-400)] font-normal">(optional, comma-separated)</span>
              </label>
              <input
                id="focusSkills"
                type="text"
                placeholder="e.g. React, Node.js, System Design"
                className="input"
                {...register("focusSkills")}
              />
            </div>

            {/* Transcript consent */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                id="consentTranscript"
                type="checkbox"
                className="mt-0.5 w-4 h-4 accent-[var(--color-brand-600)]"
                {...register("consentTranscript")}
              />
              <div>
                <span className="text-sm font-medium text-[var(--color-surface-800)]">
                  Save interview transcript for feedback analysis
                </span>
                <p className="text-xs text-[var(--color-surface-400)] mt-0.5">
                  Your transcript is private, used only to generate your feedback report, and can be deleted at any time.
                </p>
              </div>
            </label>
          </div>
        </Card>

        {/* Privacy notice */}
        <div className="flex items-start gap-3 p-4 bg-[var(--color-brand-50)] border border-[var(--color-brand-100)] rounded-xl animate-fade-in delay-250">
          <Info size={16} className="text-[var(--color-brand-500)] shrink-0 mt-0.5" />
          <p className="text-xs text-[var(--color-brand-700)] leading-relaxed">
            <strong>Your privacy:</strong> This is an AI-powered practice session. Your microphone and
            camera are used only during the interview. No webcam recordings are stored by default.
            Your voice is processed by the AI provider in real-time. Interview scores are estimates
            and are not shared with employers.
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="btn btn-primary btn-xl animate-fade-in delay-300"
          disabled={loading}
        >
          {loading ? (
            <svg className="animate-spin" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <circle cx="12" cy="12" r="10" strokeOpacity={0.25} />
              <path d="M12 2a10 10 0 0 1 10 10" />
            </svg>
          ) : (
            <Mic size={18} />
          )}
          {loading ? "Preparing your interview…" : "Start Interview"}
          {!loading && <ChevronRight size={16} />}
        </button>
      </form>
    </div>
  );
}
