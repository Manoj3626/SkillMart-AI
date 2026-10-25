"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building, MapPin, Globe, FileText, Plus, X } from "lucide-react";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { toast } from "@/components/ui/Toaster";

const schema = z.object({
  title: z.string().min(3, "Job title required"),
  department: z.string().min(2, "Department required"),
  location: z.string().min(2, "Location required"),
  contract_type: z.enum(["permanent", "contract", "part_time", "internship"]),
  experience_level: z.enum(["fresher", "junior", "mid", "senior"]),
  salary_min: z.coerce.number().min(0).optional(),
  salary_max: z.coerce.number().min(0).optional(),
  description: z.string().min(50, "Description must be at least 50 characters"),
  requirements: z.string().min(20, "Requirements required"),
  deadline: z.string().optional(),
  remote: z.boolean().optional(),
});

type JobForm = z.infer<typeof schema>;

export default function NewJobPage() {
  const router = useRouter();
  const [skills, setSkills] = useState<string[]>(["JavaScript", "React"]);
  const [skillInput, setSkillInput] = useState("");
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, control, formState: { errors } } = useForm<JobForm>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      contract_type: "permanent",
      experience_level: "junior",
      remote: false,
    },
  });

  function addSkill() {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) { setSkills([...skills, s]); }
    setSkillInput("");
  }

  const onSubmit = async (data: JobForm) => {
    setSaving(true);
    try {
      // TODO: POST to Supabase when configured
      await new Promise((r) => setTimeout(r, 1200)); // simulate
      toast.success("Job posted successfully!");
      router.push("/recruiter/dashboard");
    } catch {
      toast.error("Failed to post job.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8 animate-fade-in">
        <Link href="/recruiter/dashboard" className="btn btn-ghost btn-sm">
          <ArrowLeft size={15} /> Back
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-surface-900)]">Post a Job</h1>
          <p className="text-sm text-[var(--color-surface-500)] mt-0.5">
            Candidates will be matched by SkillMatch AI score.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
        {/* Basic info */}
        <Card className="animate-fade-in">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building size={16} className="text-[var(--color-brand-500)]" />
              <CardTitle>Job Details</CardTitle>
            </div>
          </CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="label">Job Title *</label>
              <input className={`input ${errors.title ? "input-error" : ""}`} placeholder="e.g. Frontend Developer" {...register("title")} />
              {errors.title && <p className="text-xs text-[var(--color-error-500)]">{errors.title.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="label">Department *</label>
                <input className={`input ${errors.department ? "input-error" : ""}`} placeholder="Engineering" {...register("department")} />
                {errors.department && <p className="text-xs text-[var(--color-error-500)]">{errors.department.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="label">Experience Level *</label>
                <select className="input" {...register("experience_level")}>
                  <option value="fresher">Fresher / Entry</option>
                  <option value="junior">Junior (1–3 yrs)</option>
                  <option value="mid">Mid (3–6 yrs)</option>
                  <option value="senior">Senior (6+ yrs)</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="label">Contract Type *</label>
                <select className="input" {...register("contract_type")}>
                  <option value="permanent">Full-time</option>
                  <option value="contract">Contract</option>
                  <option value="part_time">Part-time</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="label">Application Deadline</label>
                <input type="date" className="input" {...register("deadline")} />
              </div>
            </div>
          </div>
        </Card>

        {/* Location */}
        <Card className="animate-fade-in delay-100">
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-[var(--color-teal-500)]" />
              <CardTitle>Location & Salary</CardTitle>
            </div>
          </CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="label">Location *</label>
              <input className={`input ${errors.location ? "input-error" : ""}`} placeholder="Bangalore, India" {...register("location")} />
              {errors.location && <p className="text-xs text-[var(--color-error-500)]">{errors.location.message}</p>}
            </div>
            <label className="flex items-center gap-2 text-sm text-[var(--color-surface-700)] cursor-pointer">
              <Controller
                name="remote"
                control={control}
                render={({ field }) => (
                  <input type="checkbox" checked={field.value} onChange={field.onChange} className="w-4 h-4 accent-[var(--color-brand-600)]" />
                )}
              />
              Remote / Hybrid allowed
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="label">Salary Min (INR)</label>
                <input type="number" className="input" placeholder="600000" {...register("salary_min")} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="label">Salary Max (INR)</label>
                <input type="number" className="input" placeholder="1200000" {...register("salary_max")} />
              </div>
            </div>
          </div>
        </Card>

        {/* Skills */}
        <Card className="animate-fade-in delay-150">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-[var(--color-violet-500)]" />
              <CardTitle>Required Skills</CardTitle>
            </div>
          </CardHeader>
          <div className="flex flex-wrap gap-2 mb-3">
            {skills.map((s) => (
              <span key={s} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--color-brand-50)] text-[var(--color-brand-700)] text-xs font-medium">
                {s}
                <button type="button" onClick={() => setSkills(skills.filter((x) => x !== s))} className="hover:text-[var(--color-error-500)] transition-colors">
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              className="input flex-1 text-sm"
              placeholder="Add a skill…"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
            />
            <button type="button" onClick={addSkill} className="btn btn-outline btn-sm">
              <Plus size={13} /> Add
            </button>
          </div>
        </Card>

        {/* Description */}
        <Card className="animate-fade-in delay-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-[var(--color-surface-500)]" />
              <CardTitle>Description & Requirements</CardTitle>
            </div>
          </CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="label">Job Description *</label>
              <textarea
                className={`input min-h-[140px] resize-none ${errors.description ? "input-error" : ""}`}
                placeholder="Describe the role, team, and what the candidate will be working on…"
                {...register("description")}
              />
              {errors.description && <p className="text-xs text-[var(--color-error-500)]">{errors.description.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="label">Requirements *</label>
              <textarea
                className={`input min-h-[100px] resize-none ${errors.requirements ? "input-error" : ""}`}
                placeholder="List must-have qualifications and nice-to-haves…"
                {...register("requirements")}
              />
              {errors.requirements && <p className="text-xs text-[var(--color-error-500)]">{errors.requirements.message}</p>}
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 animate-fade-in delay-250">
          <button type="submit" disabled={saving} className="btn btn-primary btn-lg flex-1">
            {saving ? (
              <svg className="animate-spin" width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <circle cx="12" cy="12" r="10" strokeOpacity={0.25} /><path d="M12 2a10 10 0 0 1 10 10" />
              </svg>
            ) : <FileText size={15} />}
            {saving ? "Posting…" : "Post Job"}
          </button>
          <Link href="/recruiter/dashboard" className="btn btn-outline btn-lg">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
