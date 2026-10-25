"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, RefreshCw, GraduationCap } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/components/ui/Toaster";
import { COLLEGE_CONFIG } from "@/lib/college/config";

const resetSchema = z
  .object({
    password: z
      .string()
      .min(
        COLLEGE_CONFIG.security.minPasswordLength,
        `Password must be at least ${COLLEGE_CONFIG.security.minPasswordLength} characters long.`
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type ResetFormValues = z.infer<typeof resetSchema>;

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (values: ResetFormValues) => {
    if (!token) {
      setErrorMessage("Missing or invalid password reset token. Please request a new link.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: values.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password.");
      }

      setSuccess(true);
      toast.success("Password reset successfully!");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to reset password.");
      toast.error(err.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200/80 p-6 sm:p-8 animate-fade-in">
      <div className="flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium w-fit">
        <GraduationCap size={14} className="text-emerald-700" />
        <span>Karpagam College of Engineering</span>
      </div>

      {success ? (
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <CheckCircle2 size={30} />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Password Updated!</h1>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            Your account password has been securely updated. All existing sessions on other devices have been invalidated.
          </p>
          <Link
            href="/login"
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-sm transition-colors block text-center shadow-sm"
          >
            Sign In with New Password
          </Link>
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Create New Password</h1>
          <p className="text-sm text-gray-600 mb-6">
            Choose a strong passphrase with at least {COLLEGE_CONFIG.security.minPasswordLength} characters.
          </p>

          {errorMessage && (
            <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2 text-sm text-red-700">
              <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1">
                New Password (minimum {COLLEGE_CONFIG.security.minPasswordLength} characters)
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <Lock size={16} />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
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
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <Lock size={16} />
                </div>
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••••••"
                  className={`w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border ${
                    errors.confirmPassword ? "border-red-400 bg-red-50/20" : "border-gray-300 bg-white"
                  } focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-all`}
                  {...register("confirmPassword")}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-600 mt-1">{errors.confirmPassword.message}</p>
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
                  <span>Updating password...</span>
                </>
              ) : (
                <span>Update Password & Revoke Sessions</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-xs text-gray-500 hover:text-gray-900 transition-colors">
              Cancel and Return to Sign In
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center py-12 px-4">
      <Suspense fallback={<div className="text-gray-500 text-sm">Loading reset screen...</div>}>
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}
