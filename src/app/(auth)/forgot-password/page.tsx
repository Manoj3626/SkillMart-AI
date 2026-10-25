"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle, GraduationCap, RefreshCw } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/components/ui/Toaster";

const schema = z.object({
  email: z
    .string()
    .email("Enter a valid college email address")
    .refine(
      (val) => val.trim().toLowerCase().endsWith("@kce.ac.in"),
      "Please enter your official @kce.ac.in college email."
    ),
});

type ForgotForm = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotForm>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: ForgotForm) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Failed to process request.");
      }

      setSent(true);
      toast.success("Password recovery dispatched.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200/80 p-6 sm:p-8 animate-fade-in">
        {/* College affiliation tag */}
        <div className="flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium w-fit">
          <GraduationCap size={14} className="text-emerald-700" />
          <span>Karpagam College of Engineering</span>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <CheckCircle size={28} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Check Your College Inbox</h1>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              If an account exists under that official email, a secure password-reset link and single-use token have been dispatched. Check your college inbox and spam folders.
            </p>
            <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-500 mb-6 text-left">
              🔒 Reset links expire in 15 minutes. For security reasons, resetting your password will automatically revoke all active sessions on other devices.
            </div>
            <Link
              href="/login"
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-sm transition-colors block text-center shadow-sm"
            >
              Back to Sign In
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Reset Password</h1>
            <p className="text-sm text-gray-600 mb-6">
              Enter your registered college email address to receive secure recovery instructions.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div>
                <label htmlFor="forgot-email" className="block text-xs font-medium text-gray-700 mb-1">
                  Official College Email (@kce.ac.in)
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <Mail size={16} />
                  </div>
                  <input
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    placeholder="student@kce.ac.in"
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-medium shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Send Recovery Instructions</span>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
