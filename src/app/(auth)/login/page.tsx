"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  KeyRound,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/components/ui/Toaster";

const loginSchema = z.object({
  email: z
    .string()
    .email("Enter a valid college email address")
    .refine(
      (val) => val.trim().toLowerCase().endsWith("@kce.ac.in"),
      "Please sign in with your official @kce.ac.in college email."
    ),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Mandatory MFA state for Admins
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaEmail, setMfaEmail] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [mfaLoading, setMfaLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.email.trim().toLowerCase(),
          password: values.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Invalid official credentials.");
      }

      if (data.requiresMFA) {
        setMfaRequired(true);
        setMfaEmail(data.email);
        toast.info(data.message || "Enter the administrator MFA code sent to your email.");
        return;
      }

      toast.success("Welcome back!");
      router.push(data.redirect || redirectTo);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to sign in. Please verify your credentials.");
      toast.error(err.message || "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaCode || mfaCode.trim().length !== 6) {
      setErrorMessage("Please enter the 6-digit administrator MFA code.");
      return;
    }

    setMfaLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/admin-mfa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: mfaEmail, code: mfaCode.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "MFA validation failed.");
      }

      toast.success("Administrator authentication verified!");
      router.push(data.redirect || "/college/dashboard");
    } catch (err: any) {
      setErrorMessage(err.message || "Invalid MFA code.");
      toast.error(err.message || "MFA failed");
    } finally {
      setMfaLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6 animate-fade-in">
      {/* College affiliation tag */}
      <div className="flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium w-fit">
        <GraduationCap size={14} className="text-emerald-700" />
        <span>Karpagam College of Engineering</span>
      </div>

      {!mfaRequired ? (
        <>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Sign In</h1>
          <p className="text-sm text-gray-600 mb-6">
            Enter your official college credentials to access placement preparation.
          </p>

          {errorMessage && (
            <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2 text-sm text-red-700">
              <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">
                Official College Email
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <Mail size={16} />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="rollnumber@kce.ac.in"
                  className={`w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border ${
                    errors.email ? "border-red-400 bg-red-50/20" : "border-gray-300 bg-white"
                  } focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-all`}
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-xs font-medium text-gray-700">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-emerald-700 hover:text-emerald-800 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <Lock size={16} />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  className={`w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border ${
                    errors.password ? "border-red-400 bg-red-50/20" : "border-gray-300 bg-white"
                  } focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-all`}
                  {...register("password")}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-medium shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="text-sm text-center text-gray-600 mt-6">
            New Karpagam student?{" "}
            <Link
              href="/signup"
              className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              Register here
            </Link>
          </p>
        </>
      ) : (
        /* Mandatory Administrator MFA screen */
        <div className="animate-fade-in">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4">
            <KeyRound size={26} />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">Administrator 2FA Required</h1>
          <p className="text-xs text-gray-600 mb-6 leading-relaxed">
            In compliance with campus security policies, administrator accounts require mandatory multi-factor authentication. A 6-digit security code has been sent to{" "}
            <span className="font-semibold text-gray-900">{mfaEmail}</span>.
          </p>

          {errorMessage && (
            <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2 text-sm text-red-700">
              <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleMfaSubmit} className="space-y-4">
            <div>
              <label htmlFor="mfaCode" className="block text-xs font-medium text-gray-700 mb-1">
                6-Digit Security Code
              </label>
              <input
                id="mfaCode"
                type="text"
                maxLength={6}
                autoFocus
                placeholder="000000"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ""))}
                className="w-full py-3 px-4 text-center tracking-widest text-2xl font-bold rounded-xl border border-gray-300 focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={mfaLoading || mfaCode.length !== 6}
              className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-medium shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {mfaLoading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Verifying MFA...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={16} />
                  <span>Confirm Administrator Identity</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setMfaRequired(false);
                setMfaCode("");
              }}
              className="w-full py-2 text-xs text-gray-500 hover:text-gray-800 transition-colors"
            >
              Back to Sign In
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center py-12 px-4">
      <Suspense fallback={<div className="text-gray-500 text-sm">Loading sign in...</div>}>
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200/80 p-6 sm:p-8">
          <LoginContent />
        </div>
      </Suspense>
    </div>
  );
}
