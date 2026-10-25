"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, ArrowRight, RefreshCw, Mail, GraduationCap, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "@/components/ui/Toaster";
import { COLLEGE_CONFIG } from "@/lib/college/config";

/**
 * Mask email address for institutional privacy:
 * Example: 717823p130@kce.ac.in -> 71***30@kce.ac.in
 * Example: m***@kce.ac.in
 */
function maskEmailAddress(email: string): string {
  if (!email || !email.includes("@")) return "your college email";
  const [local, domain] = email.trim().toLowerCase().split("@");
  if (local.length <= 2) {
    return `${local.charAt(0)}***@${domain}`;
  }
  if (local.length <= 4) {
    return `${local.charAt(0)}***${local.charAt(local.length - 1)}@${domain}`;
  }
  return `${local.slice(0, 2)}***${local.slice(-2)}@${domain}`;
}

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  const [email] = useState(emailParam);

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deliverySuccessMessage, setDeliverySuccessMessage] = useState<string | null>(null);

  // 5 minutes expiry countdown (300s)
  const [expirySeconds, setExpirySeconds] = useState(COLLEGE_CONFIG.security.otpExpiryMinutes * 60);
  // 30 seconds resend cooldown
  const [cooldownSeconds, setCooldownSeconds] = useState(COLLEGE_CONFIG.security.otpResendCooldownSeconds);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input box on mount
    inputRefs.current[0]?.focus();
  }, []);

  // Expiry countdown timer (5 mins)
  useEffect(() => {
    if (expirySeconds <= 0) return;
    const interval = setInterval(() => {
      setExpirySeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [expirySeconds]);

  // Resend cooldown timer (30s)
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const interval = setInterval(() => {
      setCooldownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownSeconds]);

  const handleChange = (index: number, value: string) => {
    // Support paste of entire 6-digit code
    if (value.length > 1) {
      const digits = value.replace(/\D/g, "").slice(0, 6).split("");
      const newOtp = [...otp];
      digits.forEach((d, i) => {
        newOtp[i] = d;
      });
      setOtp(newOtp);
      const nextFocus = Math.min(digits.length, 5);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    const clean = value.replace(/\D/g, "");
    const newOtp = [...otp];
    newOtp[index] = clean;
    setOtp(newOtp);
    setErrorMessage(null);

    // Auto-advance to next input
    if (clean && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (loading) return; // Prevent concurrent submissions

    const fullCode = otp.join("");
    if (fullCode.length !== 6) {
      setErrorMessage("Please enter all 6 digits of your verification code.");
      return;
    }

    if (expirySeconds === 0) {
      setErrorMessage("Verification code has expired. Please request a new code using the button below.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: fullCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Verification failed. Please check the code and try again.");
      }

      setDeliverySuccessMessage("Email verified successfully! Redirecting to college review status...");
      toast.success("College email verified successfully!");

      setTimeout(() => {
        router.push(data.redirect || "/status");
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err.message || "Invalid verification code.");
      toast.error(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldownSeconds > 0 || resending || loading) return;

    setResending(true);
    setErrorMessage(null);
    setDeliverySuccessMessage(null);

    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, purpose: "email_verification" }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to deliver OTP to your college email.");
      }

      setDeliverySuccessMessage("OTP sent successfully! Please check your college inbox.");
      toast.success("A fresh verification code has been dispatched to your email.");
      setCooldownSeconds(COLLEGE_CONFIG.security.otpResendCooldownSeconds);
      setExpirySeconds(COLLEGE_CONFIG.security.otpExpiryMinutes * 60);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setErrorMessage(err.message || "Unable to send verification email. Please check configuration.");
      toast.error(err.message || "Failed to resend code");
    } finally {
      setResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const isExpired = expirySeconds === 0;
  const maskedEmail = maskEmailAddress(email);

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6 animate-fade-in">
      {/* College affiliation badge */}
      <div className="flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium w-fit">
        <GraduationCap size={14} className="text-emerald-700" />
        <span>Karpagam College of Engineering Verification</span>
      </div>

      <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 mb-4 shadow-sm">
        <ShieldCheck size={26} />
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Check Your College Email</h1>
      <p className="text-sm text-gray-600 mb-6 leading-relaxed">
        We sent a single-use 6-digit verification code to{" "}
        <span className="font-semibold text-gray-900 bg-gray-100 px-2 py-0.5 rounded font-mono text-xs sm:text-sm">
          {maskedEmail}
        </span>
        . Enter the code below to confirm your institutional identity.
      </p>

      {/* Sending in progress status */}
      {resending && (
        <div className="mb-5 p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center gap-2 text-sm text-blue-800 animate-pulse">
          <RefreshCw size={16} className="animate-spin text-blue-600" />
          <span>Sending OTP to {maskedEmail}...</span>
        </div>
      )}

      {/* Error notification banner */}
      {errorMessage && (
        <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-sm text-red-800 leading-relaxed shadow-sm">
          <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-600" />
          <div className="flex-1">
            <span className="font-medium block text-red-900 mb-0.5">Verification Notice:</span>
            <span className="text-xs sm:text-sm">{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Confirmed delivery banner */}
      {deliverySuccessMessage && !errorMessage && !resending && (
        <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2 text-sm text-emerald-800 shadow-sm animate-fade-in">
          <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-emerald-600" />
          <span>{deliverySuccessMessage}</span>
        </div>
      )}

      {/* Expired alert */}
      {isExpired && !errorMessage && (
        <div className="mb-5 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2 text-sm text-amber-800 shadow-sm">
          <AlertCircle size={18} className="shrink-0 mt-0.5 text-amber-600" />
          <span>Verification code has expired. Please click <strong>Resend code</strong> below to request a fresh OTP.</span>
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-6">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">
            6-Digit Verification Code
          </label>
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => { inputRefs.current[idx] = el; }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                disabled={loading || resending || isExpired}
                className="w-11 h-14 sm:w-13 sm:h-16 text-center text-xl sm:text-2xl font-bold rounded-xl border border-gray-300 bg-white shadow-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-all disabled:bg-gray-100 disabled:text-gray-400"
              />
            ))}
          </div>

          <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
            <span className={isExpired ? "text-red-600 font-semibold" : expirySeconds <= 60 ? "text-amber-600 font-medium" : ""}>
              {isExpired ? "Code expired" : <>Code expires in: <strong className="font-mono">{formatTime(expirySeconds)}</strong></>}
            </span>
            <span>Maximum 5 attempts</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || resending || otp.join("").length !== 6 || isExpired}
          className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-medium shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <RefreshCw size={16} className="animate-spin" />
              <span>Verifying code...</span>
            </>
          ) : (
            <>
              <span>Verify & Continue</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      {/* Resend actions */}
      <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col items-center gap-3 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span>Didn&apos;t receive the code?</span>
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldownSeconds > 0 || resending || loading}
            className="font-medium text-emerald-700 hover:text-emerald-800 hover:underline disabled:text-gray-400 disabled:no-underline flex items-center gap-1.5 transition-colors"
          >
            {resending && <RefreshCw size={14} className="animate-spin" />}
            {resending
              ? "Sending OTP..."
              : cooldownSeconds > 0
              ? `Resend code in ${cooldownSeconds}s`
              : "Resend code"}
          </button>
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
          <Link href="/signup" className="hover:underline flex items-center gap-1">
            <Mail size={12} />
            <span>Use different email</span>
          </Link>
          <span>•</span>
          <Link href="/login" className="hover:underline">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center py-12 px-4">
      <Suspense fallback={<div className="text-gray-500 text-sm">Loading verification screen...</div>}>
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-gray-200/80 p-6 sm:p-8">
          <VerifyOtpContent />
        </div>
      </Suspense>
    </div>
  );
}
