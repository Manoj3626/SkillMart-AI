"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  GraduationCap,
  LogOut,
  ArrowRight,
  ShieldAlert,
  Send,
  Building2,
  User,
  Hash,
  BookOpen,
  Calendar,
} from "lucide-react";
import { toast } from "@/components/ui/Toaster";
import { COLLEGE_CONFIG } from "@/lib/college/config";
import type { StudentProfile } from "@/types";

interface SessionUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  accountStatus: "pending_email_verification" | "pending_college_verification" | "active" | "rejected" | "suspended";
  studentProfile?: StudentProfile | null;
}

export default function AccountStatusPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Correction form state for rejected accounts
  const [rollNumber, setRollNumber] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [department, setDepartment] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [graduationYear, setGraduationYear] = useState<number>(2026);

  useEffect(() => {
    setGraduationYear(new Date().getFullYear() + 1);
  }, []);

  const fetchSession = async () => {
    try {
      const res = await fetch("/api/auth/session");
      const data = await res.json();
      if (!res.ok || !data.authenticated) {
        router.push("/login");
        return;
      }
      setUser(data.user);

      if (data.user?.studentProfile) {
        setRollNumber(data.user.studentProfile.rollNumber);
        setCollegeId(data.user.studentProfile.collegeId);
        setDepartment(data.user.studentProfile.department);
        setAcademicYear(data.user.studentProfile.academicYear);
        setGraduationYear(data.user.studentProfile.graduationYear);
      }
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch {
      router.push("/login");
    }
  };

  const handleResubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/resubmit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rollNumber,
          collegeId,
          department,
          academicYear,
          graduationYear,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to resubmit details.");
      }

      toast.success("Profile updated and resubmitted for College Admin review.");
      await fetchSession();
    } catch (err: any) {
      toast.error(err.message || "Could not resubmit.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500 font-medium">Checking account status...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const status = user.accountStatus;
  const profile = user.studentProfile;

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Header */}
      <div className="max-w-3xl mx-auto w-full flex items-center justify-between pb-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow-sm font-bold text-base">
            S
          </div>
          <div>
            <span className="font-bold text-gray-900 text-lg">SkillMatch AI</span>
            <span className="block text-xs text-gray-500">Karpagam College of Engineering Placement Portal</span>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:text-gray-900 hover:bg-gray-100 text-xs font-medium transition-colors"
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="max-w-2xl mx-auto w-full my-8">
        {/* Case 1: Active */}
        {status === "active" && (
          <div className="bg-white rounded-2xl shadow-sm border border-emerald-200 p-6 sm:p-8 animate-fade-in text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <CheckCircle2 size={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Account Approved & Activated</h1>
            <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
              Your student profile has been verified by the Karpagam College of Engineering Placement Cell. You have full access to SkillMatch AI.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 py-3 px-6 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-medium shadow-sm transition-colors text-sm"
            >
              <span>Go to Student Dashboard</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {/* Case 2: Pending College Verification */}
        {status === "pending_college_verification" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/90 overflow-hidden animate-fade-in">
            {/* Header banner */}
            <div className="bg-amber-500/10 border-b border-amber-200/80 px-6 py-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
                <Clock size={18} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-amber-900">Pending College Identity Review</h2>
                <p className="text-xs text-amber-700">Official Karpagam College of Engineering Verification in progress</p>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="mb-6">
                <h1 className="text-xl font-bold text-gray-900 mb-2">
                  Welcome, {user.fullName}!
                </h1>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Your official email (<strong className="text-gray-900">{user.email}</strong>) has been verified. To protect student privacy and ensure valid campus placement access, your account is currently undergoing verification by the <strong>Karpagam College of Engineering Placement Cell</strong>.
                </p>
              </div>

              {/* Progress Steps */}
              <div className="bg-[#F8F9F8] rounded-xl p-4 sm:p-5 mb-6 border border-gray-200/70">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                  Verification Lifecycle
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                    <span className="text-gray-700">Registration Submitted</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                    <span className="text-gray-700">Official Email OTP Verified (@kce.ac.in)</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-semibold text-amber-800">
                    <Clock size={18} className="text-amber-600 shrink-0 animate-pulse" />
                    <span>College Administrator Identity Review (In Progress)</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <div className="w-4 h-4 rounded-full border-2 border-gray-300 ml-0.5 shrink-0" />
                    <span>Account Activation & Personalized Welcome Email</span>
                  </div>
                </div>
              </div>

              {/* Submitted Student Record */}
              {profile && (
                <div className="border border-gray-200 rounded-xl p-4 mb-6">
                  <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <GraduationCap size={15} className="text-emerald-700" />
                    <span>Submitted College Record</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-gray-400 block">College ID / Register No.</span>
                      <strong className="text-gray-900 font-mono text-sm">{profile.collegeId || profile.rollNumber}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Department</span>
                      <strong className="text-gray-900">{profile.department}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Degree / Program</span>
                      <strong className="text-gray-900">{profile.degree}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Academic Year</span>
                      <strong className="text-gray-900">{profile.academicYear}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Graduation Year</span>
                      <strong className="text-gray-900">{profile.graduationYear}</strong>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200/80 text-xs text-emerald-800 leading-relaxed mb-6">
                💡 <strong>What happens next?</strong> Once approved by the KCE College Admin, you will receive your personalized Welcome Email with placement preparation guidance, and access to the AI Mock Interview Agent, resume analysis, and placement tracking will be instantly enabled.
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={fetchSession}
                  className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium transition-colors"
                >
                  Refresh Status
                </button>
                <button
                  onClick={handleSignOut}
                  className="text-xs text-gray-500 hover:text-gray-800 hover:underline"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Case 3: Rejected */}
        {status === "rejected" && (
          <div className="bg-white rounded-2xl shadow-sm border border-red-200 overflow-hidden animate-fade-in">
            <div className="bg-red-50 border-b border-red-200 px-6 py-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                <XCircle size={20} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-red-900">Verification Requires Attention</h2>
                <p className="text-xs text-red-700">Karpagam College of Engineering Identity Validation</p>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="p-4 rounded-xl bg-red-50/70 border border-red-200 text-sm text-red-800 mb-6">
                <strong className="block font-semibold mb-1">Reason for Rejection from College Admin:</strong>
                <p className="italic">
                  &ldquo;{profile?.rejectionReason || "Submitted details could not be matched against current KCE enrollment records."}&rdquo;
                </p>
              </div>

              <h3 className="text-base font-bold text-gray-900 mb-1">Correct and Resubmit Details</h3>
              <p className="text-xs text-gray-600 mb-5">
                Please verify and correct your roll number, college ID, or department below to resubmit your profile for review.
              </p>

              <form onSubmit={handleResubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      College ID / Register No. *
                    </label>
                    <input
                      type="text"
                      required
                      value={collegeId || rollNumber}
                      onChange={(e) => {
                        setCollegeId(e.target.value);
                        setRollNumber(e.target.value);
                      }}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-emerald-600 focus:outline-none uppercase font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Department *
                    </label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-emerald-600 focus:outline-none"
                    >
                      {COLLEGE_CONFIG.departments.map((d) => (
                        <option key={d.code} value={d.code}>
                          {d.code} — {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Academic Year *
                    </label>
                    <select
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-emerald-600 focus:outline-none"
                    >
                      {COLLEGE_CONFIG.academicYears.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Graduation Year *
                    </label>
                    <input
                      type="number"
                      required
                      min={2020}
                      max={2035}
                      value={graduationYear}
                      onChange={(e) => setGraduationYear(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="py-2.5 px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-sm transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    <Send size={15} />
                    <span>{submitting ? "Resubmitting..." : "Resubmit for Review"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="text-xs text-gray-500 hover:underline"
                  >
                    Sign Out
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Case 4: Suspended */}
        {status === "suspended" && (
          <div className="bg-white rounded-2xl shadow-sm border border-red-300 p-6 sm:p-8 text-center animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <ShieldAlert size={30} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Student Account Suspended</h1>
            <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
              Your access to SkillMatch AI has been temporarily suspended by the institution administrator. All active sessions have been invalidated.
            </p>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600 max-w-md mx-auto mb-6 text-left">
              <strong>How to resolve:</strong> Please contact the Karpagam College of Engineering Placement Office in person or email{" "}
              <a href="mailto:placement@kce.ac.in" className="text-emerald-700 font-semibold underline">
                placement@kce.ac.in
              </a>{" "}
              with your roll number and college ID to request an account review.
            </div>
            <button
              onClick={handleSignOut}
              className="py-2.5 px-5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-medium transition-colors"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="max-w-2xl mx-auto w-full text-center text-xs text-gray-400 py-4 border-t border-gray-200">
        &copy; 2026 Karpagam College of Engineering &bull; SkillMatch AI Placement Portal
      </div>
    </div>
  );
}
