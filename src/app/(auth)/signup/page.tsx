"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Zap,
  GraduationCap,
  Building2,
  Calendar,
  Hash,
  Phone,
  ShieldCheck,
  AlertCircle,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { COLLEGE_CONFIG, isValidCollegeEmail } from "@/lib/college/config";
import { toast } from "@/components/ui/Toaster";

const studentSignupSchema = z
  .object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z
      .string()
      .trim()
      .refine((val) => isValidCollegeEmail(val), {
        message: "Registration requires an official @kce.ac.in email address",
      }),
    collegeId: z.string().trim().min(3, "College ID / Register No. is required (e.g., 717823P130)"),
    department: z.string().min(1, "Please select your department"),
    degree: z.string().min(1, "Please select your degree/program"),
    academicYear: z.string().min(1, "Please select your current academic year"),
    graduationYear: z.coerce.number().min(2024, "Invalid graduation year").max(2035),
    password: z
      .string()
      .min(COLLEGE_CONFIG.security.minPasswordLength, `Password must be at least ${COLLEGE_CONFIG.security.minPasswordLength} characters`),
    confirmPassword: z.string(),
    phone: z.string().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type StudentSignupForm = z.infer<typeof studentSignupSchema>;

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StudentSignupForm>({
    resolver: zodResolver(studentSignupSchema) as any,
    defaultValues: {
      degree: "B.E. (Bachelor of Engineering)",
      academicYear: "3rd Year",
      graduationYear: 2026,
    },
  });

  const onSubmit = async (data: StudentSignupForm) => {
    setIsSubmitting(true);
    try {
      setServerError(null);
      const payload = {
        ...data,
        rollNumber: data.collegeId.trim().toUpperCase(),
        collegeId: data.collegeId.trim().toUpperCase(),
      };

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Registration failed. Please check your details.");
      }

      toast.success("Verification code dispatched to your KCE email!");
      // Route immediately to the email OTP verification screen
      router.push(`/verify-otp?email=${encodeURIComponent(data.email.trim().toLowerCase())}`);
    } catch (err: any) {
      setServerError(err.message || "Registration failed. Please try again.");
      toast.error(err.message || "Registration error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-xl py-6 animate-fade-in">
      {/* College Institutional Branding Badge */}
      <div className="bg-teal-50 border border-teal-200/90 rounded-2xl p-4 mb-6 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
            <GraduationCap size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 text-sm">
                Karpagam College of Engineering
              </span>
              <span className="bg-teal-700 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                AUTONOMOUS
              </span>
            </div>
            <p className="text-xs text-teal-800 font-medium">Placement Practice & AI Interview Portal</p>
          </div>
        </div>
        <ShieldCheck className="text-teal-700 hidden sm:block" size={24} />
      </div>

      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          Student Registration
        </h1>
        <p className="text-xs md:text-sm text-slate-500 mt-1">
          Sign up with your official <strong className="text-teal-800 font-bold">@kce.ac.in</strong> email to access verified campus placement preparation.
        </p>
      </div>

      {serverError && (
        <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
          <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Full Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Full Name (as per College Records) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="e.g. Rahul Sharma"
              className={`w-full pl-10 pr-3.5 py-2.5 text-xs md:text-sm bg-white border rounded-xl focus:outline-none focus:border-teal-600 shadow-2xs ${
                errors.fullName ? "border-rose-400 bg-rose-50/20" : "border-stone-300"
              }`}
              {...register("fullName")}
            />
          </div>
          {errors.fullName && <p className="text-[11px] text-rose-600 mt-1">{errors.fullName.message}</p>}
        </div>

        {/* Official College Email */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Official College Email Address <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              placeholder="e.g. 22ad045@kce.ac.in"
              className={`w-full pl-10 pr-3.5 py-2.5 text-xs md:text-sm bg-white border rounded-xl focus:outline-none focus:border-teal-600 shadow-2xs ${
                errors.email ? "border-rose-400 bg-rose-50/20" : "border-stone-300"
              }`}
              {...register("email")}
            />
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            Only email addresses ending in <strong>@kce.ac.in</strong> are eligible.
          </span>
          {errors.email && <p className="text-[11px] text-rose-600 mt-1">{errors.email.message}</p>}
        </div>

        {/* College ID / Register No. */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            College ID / Register No. <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Hash size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="e.g. 717823P130"
              className={`w-full pl-10 pr-3.5 py-2.5 text-xs md:text-sm uppercase bg-white border rounded-xl focus:outline-none focus:border-teal-600 shadow-2xs ${
                errors.collegeId ? "border-rose-400" : "border-stone-300"
              }`}
              {...register("collegeId")}
            />
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            Enter your Karpagam College of Engineering Register Number or Institutional ID
          </span>
          {errors.collegeId && <p className="text-[11px] text-rose-600 mt-1">{errors.collegeId.message}</p>}
        </div>

        {/* Department & Degree Program */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Department <span className="text-rose-500">*</span>
            </label>
            <select
              className={`w-full px-3 py-2.5 text-xs md:text-sm bg-white border rounded-xl focus:outline-none focus:border-teal-600 shadow-2xs ${
                errors.department ? "border-rose-400" : "border-stone-300"
              }`}
              {...register("department")}
            >
              <option value="">Select KCE Department</option>
              {COLLEGE_CONFIG.departments.map((dept) => (
                <option key={dept.code} value={dept.name}>
                  {dept.name} ({dept.code})
                </option>
              ))}
            </select>
            {errors.department && <p className="text-[11px] text-rose-600 mt-1">{errors.department.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Degree / Program <span className="text-rose-500">*</span>
            </label>
            <select
              className={`w-full px-3 py-2.5 text-xs md:text-sm bg-white border rounded-xl focus:outline-none focus:border-teal-600 shadow-2xs ${
                errors.degree ? "border-rose-400" : "border-stone-300"
              }`}
              {...register("degree")}
            >
              {COLLEGE_CONFIG.degrees.map((deg) => (
                <option key={deg} value={deg}>
                  {deg}
                </option>
              ))}
            </select>
            {errors.degree && <p className="text-[11px] text-rose-600 mt-1">{errors.degree.message}</p>}
          </div>
        </div>

        {/* Academic Year & Graduation Year */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Current Academic Year <span className="text-rose-500">*</span>
            </label>
            <select
              className={`w-full px-3 py-2.5 text-xs md:text-sm bg-white border rounded-xl focus:outline-none focus:border-teal-600 shadow-2xs ${
                errors.academicYear ? "border-rose-400" : "border-stone-300"
              }`}
              {...register("academicYear")}
            >
              {COLLEGE_CONFIG.academicYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
            {errors.academicYear && <p className="text-[11px] text-rose-600 mt-1">{errors.academicYear.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Graduation Year <span className="text-rose-500">*</span>
            </label>
            <select
              className={`w-full px-3 py-2.5 text-xs md:text-sm bg-white border rounded-xl focus:outline-none focus:border-teal-600 shadow-2xs ${
                errors.graduationYear ? "border-rose-400" : "border-stone-300"
              }`}
              {...register("graduationYear")}
            >
              {COLLEGE_CONFIG.graduationYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
            {errors.graduationYear && <p className="text-[11px] text-rose-600 mt-1">{errors.graduationYear.message}</p>}
          </div>
        </div>

        {/* Phone (Optional) */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Mobile Number <span className="text-slate-400 font-normal">(Optional for interview SMS alerts)</span>
          </label>
          <div className="relative">
            <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="tel"
              placeholder="e.g. +91 9876543210"
              className="w-full pl-10 pr-3.5 py-2.5 text-xs md:text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-teal-600 shadow-2xs"
              {...register("phone")}
            />
          </div>
        </div>

        {/* Password & Confirm Password */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Password (Min 12 characters) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Choose a strong passphrase"
                className={`w-full pl-10 pr-10 py-2.5 text-xs md:text-sm bg-white border rounded-xl focus:outline-none focus:border-teal-600 shadow-2xs ${
                  errors.password ? "border-rose-400" : "border-stone-300"
                }`}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.password && <p className="text-[11px] text-rose-600 mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Confirm Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Repeat password"
                className={`w-full pl-10 pr-10 py-2.5 text-xs md:text-sm bg-white border rounded-xl focus:outline-none focus:border-teal-600 shadow-2xs ${
                  errors.confirmPassword ? "border-rose-400" : "border-stone-300"
                }`}
                {...register("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-[11px] text-rose-600 mt-1">{errors.confirmPassword.message}</p>}
          </div>
        </div>

        {/* Verification Process Notice */}
        <div className="bg-stone-50 border border-stone-200/90 rounded-xl p-3 text-[11px] text-slate-500 leading-relaxed">
          🔒 <strong>Placement Verification Flow:</strong> Registration sends a 6-digit OTP to your @kce.ac.in email. Once verified, your roll number and department are reviewed by the College Placement Office before full account activation.
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer mt-4"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Verifying & Sending OTP...</span>
            </>
          ) : (
            <>
              <CheckCircle size={16} />
              <span>Submit College Registration</span>
            </>
          )}
        </button>
      </form>

      <p className="text-center text-xs text-slate-500 mt-6">
        Already registered?{" "}
        <Link href="/login" className="text-teal-700 font-bold hover:underline">
          Sign In to KCE Portal
        </Link>
      </p>
    </div>
  );
}
