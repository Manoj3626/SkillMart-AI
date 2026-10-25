"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  Check,
  X,
  AlertTriangle,
  History,
  Building2,
  Mail,
  Hash,
  ShieldCheck,
  Send,
} from "lucide-react";
import { toast } from "@/components/ui/Toaster";
import { COLLEGE_CONFIG } from "@/lib/college/config";
import type { StudentProfile } from "@/types";

export default function CollegeAdminDashboard() {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [selectedYear, setSelectedYear] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Rejection modal state
  const [rejectModalStudent, setRejectModalStudent] = useState<StudentProfile | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectSubmitting, setRejectSubmitting] = useState(false);

  // Detail inspection modal
  const [inspectStudent, setInspectStudent] = useState<StudentProfile | null>(null);

  const fetchQueue = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedDept !== "ALL") params.append("department", selectedDept);
      if (selectedYear !== "ALL") params.append("academicYear", selectedYear);
      if (selectedStatus !== "ALL") params.append("status", selectedStatus);
      if (search.trim()) params.append("search", search.trim());

      const res = await fetch(`/api/college/students?${params.toString()}`);
      if (!res.ok) {
        if (res.status === 403) {
          toast.error("Unauthorized. Administrator access required.");
          return;
        }
        throw new Error("Failed to load student queue.");
      }
      const data = await res.json();
      setStudents(data.students || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch student verification queue.");
    } finally {
      setLoading(false);
    }
  }, [selectedDept, selectedYear, selectedStatus, search]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const handleApprove = async (student: StudentProfile) => {
    setActionLoadingId(student.userId);
    try {
      const res = await fetch("/api/college/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approve",
          studentUserId: student.userId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Approval failed.");

      toast.success(data.message || `Approved ${student.fullName}!`);
      await fetchQueue();
    } catch (err: any) {
      toast.error(err.message || "Could not approve student.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalStudent) return;
    if (!rejectionReason.trim() || rejectionReason.trim().length < 5) {
      toast.error("Please provide a rejection reason (minimum 5 characters).");
      return;
    }

    setRejectSubmitting(true);
    try {
      const res = await fetch("/api/college/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reject",
          studentUserId: rejectModalStudent.userId,
          reason: rejectionReason.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Rejection failed.");

      toast.success("Student verification rejected. Correction instructions dispatched.");
      setRejectModalStudent(null);
      setRejectionReason("");
      await fetchQueue();
    } catch (err: any) {
      toast.error(err.message || "Could not reject student.");
    } finally {
      setRejectSubmitting(false);
    }
  };

  const handleToggleSuspend = async (student: StudentProfile) => {
    const isSuspended = student.status === "suspended";
    const action = isSuspended ? "restore" : "suspend";
    setActionLoadingId(student.userId);

    try {
      const res = await fetch("/api/college/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          studentUserId: student.userId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed.");

      toast.success(data.message || (isSuspended ? "Account restored." : "Account suspended."));
      await fetchQueue();
    } catch (err: any) {
      toast.error(err.message || "Failed to change account status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Stats computation
  const totalCount = students.length;
  const pendingCount = students.filter((s) => s.status === "pending_college_verification").length;
  const activeCount = students.filter((s) => s.status === "active").length;
  const rejectedCount = students.filter((s) => s.status === "rejected").length;
  const suspendedCount = students.filter((s) => s.status === "suspended").length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium w-fit mb-2">
            <GraduationCap size={14} className="text-emerald-700" />
            <span>Karpagam College of Engineering &bull; Placement Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            College Identity & Verification Portal
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Review student registrations, validate roll numbers, approve access to AI interviews, and monitor campus placement readiness.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchQueue()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-medium shadow-sm transition-colors"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>Refresh Queue</span>
          </button>
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-medium shadow-sm transition-colors"
          >
            <ShieldCheck size={14} />
            <span>Super Admin</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div
          onClick={() => setSelectedStatus("ALL")}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            selectedStatus === "ALL" ? "border-gray-900 bg-gray-50/80 shadow-sm" : "border-gray-200 bg-white hover:bg-gray-50"
          }`}
        >
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-medium">All Students</span>
            <Users size={16} />
          </div>
          <div className="text-2xl font-bold text-gray-900">{totalCount}</div>
        </div>

        <div
          onClick={() => setSelectedStatus("pending_college_verification")}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            selectedStatus === "pending_college_verification" ? "border-amber-500 bg-amber-50/50 shadow-sm" : "border-gray-200 bg-white hover:bg-gray-50"
          }`}
        >
          <div className="flex items-center justify-between text-amber-700 mb-1">
            <span className="text-xs font-medium">Pending Review</span>
            <Clock size={16} />
          </div>
          <div className="text-2xl font-bold text-amber-900">{pendingCount}</div>
        </div>

        <div
          onClick={() => setSelectedStatus("active")}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            selectedStatus === "active" ? "border-emerald-600 bg-emerald-50/50 shadow-sm" : "border-gray-200 bg-white hover:bg-gray-50"
          }`}
        >
          <div className="flex items-center justify-between text-emerald-700 mb-1">
            <span className="text-xs font-medium">Active & Approved</span>
            <CheckCircle2 size={16} />
          </div>
          <div className="text-2xl font-bold text-emerald-900">{activeCount}</div>
        </div>

        <div
          onClick={() => setSelectedStatus("rejected")}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            selectedStatus === "rejected" ? "border-red-400 bg-red-50/50 shadow-sm" : "border-gray-200 bg-white hover:bg-gray-50"
          }`}
        >
          <div className="flex items-center justify-between text-red-600 mb-1">
            <span className="text-xs font-medium">Rejected / Resubmit</span>
            <XCircle size={16} />
          </div>
          <div className="text-2xl font-bold text-red-800">{rejectedCount}</div>
        </div>

        <div
          onClick={() => setSelectedStatus("suspended")}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            selectedStatus === "suspended" ? "border-gray-600 bg-gray-100 shadow-sm" : "border-gray-200 bg-white hover:bg-gray-50"
          }`}
        >
          <div className="flex items-center justify-between text-gray-600 mb-1">
            <span className="text-xs font-medium">Suspended</span>
            <ShieldAlert size={16} />
          </div>
          <div className="text-2xl font-bold text-gray-800">{suspendedCount}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200/90 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, roll no, college ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-gray-300 focus:border-emerald-600 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Filter size={13} />
            <span>Department:</span>
          </div>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 bg-white focus:outline-none"
          >
            <option value="ALL">All Departments ({COLLEGE_CONFIG.departments.length})</option>
            {COLLEGE_CONFIG.departments.map((d) => (
              <option key={d.code} value={d.code}>
                {d.code} — {d.name}
              </option>
            ))}
          </select>

          <span className="text-gray-300">|</span>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 bg-white focus:outline-none"
          >
            <option value="ALL">All Academic Years</option>
            {COLLEGE_CONFIG.academicYears.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <span className="text-gray-300">|</span>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 bg-white focus:outline-none font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="pending_college_verification">Pending Review</option>
            <option value="active">Active</option>
            <option value="rejected">Rejected</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Main Student Queue Table */}
      <div className="bg-white rounded-xl border border-gray-200/90 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Student Verification Queue</h2>
            <p className="text-xs text-gray-500">
              Showing {students.length} student records matching current filters
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-gray-500">
            <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-emerald-600" />
            Loading student records...
          </div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-500">
            <CheckCircle2 size={32} className="mx-auto mb-2 text-emerald-500" />
            No student verification records found matching current criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/75 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Student Details</th>
                  <th className="py-3 px-4">College ID / Register No.</th>
                  <th className="py-3 px-4">Department & Degree</th>
                  <th className="py-3 px-4">Batch / Year</th>
                  <th className="py-3 px-4">Email OTP</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((student) => {
                  const isActionBusy = actionLoadingId === student.userId;
                  return (
                    <tr key={student.userId} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-gray-900 text-sm">
                          {student.fullName}
                        </div>
                        <div className="text-gray-500 font-mono text-[11px] flex items-center gap-1">
                          <Mail size={11} className="text-gray-400" />
                          <span>{student.collegeEmail}</span>
                        </div>
                        {student.phone && (
                          <div className="text-gray-400 text-[10px]">📞 {student.phone}</div>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-gray-900">
                        {student.collegeId || student.rollNumber}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                          {student.department}
                        </span>
                        <div className="text-gray-500 text-[10px] mt-0.5">{student.degree}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-gray-800 font-medium">{student.academicYear}</div>
                        <div className="text-gray-400 text-[10px]">Graduating {student.graduationYear}</div>
                      </td>

                      <td className="py-3 px-4">
                        {student.emailVerified ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                            <CheckCircle2 size={12} /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded text-[11px]">
                            <Clock size={12} /> Pending OTP
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {student.status === "active" && (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-medium bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px]">
                            <CheckCircle2 size={12} /> Active
                          </span>
                        )}
                        {student.status === "pending_college_verification" && (
                          <span className="inline-flex items-center gap-1 text-amber-800 font-medium bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[11px]">
                            <Clock size={12} /> Pending Review
                          </span>
                        )}
                        {student.status === "rejected" && (
                          <span className="inline-flex items-center gap-1 text-red-700 font-medium bg-red-50 border border-red-200 px-2 py-0.5 rounded text-[11px]">
                            <XCircle size={12} /> Rejected
                          </span>
                        )}
                        {student.status === "suspended" && (
                          <span className="inline-flex items-center gap-1 text-gray-700 font-medium bg-gray-100 border border-gray-300 px-2 py-0.5 rounded text-[11px]">
                            <ShieldAlert size={12} /> Suspended
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {student.status === "pending_college_verification" && (
                            <>
                              <button
                                onClick={() => handleApprove(student)}
                                disabled={isActionBusy || !student.emailVerified}
                                title={!student.emailVerified ? "Email must be verified first" : "Approve student & send welcome email"}
                                className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs shadow-sm transition-colors flex items-center gap-1 disabled:opacity-40"
                              >
                                <Check size={13} />
                                <span>Approve</span>
                              </button>

                              <button
                                onClick={() => {
                                  setRejectModalStudent(student);
                                  setRejectionReason("");
                                }}
                                disabled={isActionBusy}
                                className="px-3 py-1.5 rounded-lg border border-red-200 bg-white hover:bg-red-50 text-red-700 font-medium text-xs transition-colors flex items-center gap-1"
                              >
                                <X size={13} />
                                <span>Reject</span>
                              </button>
                            </>
                          )}

                          {student.status === "active" && (
                            <button
                              onClick={() => handleToggleSuspend(student)}
                              disabled={isActionBusy}
                              className="px-2.5 py-1 rounded border border-gray-300 hover:bg-red-50 hover:border-red-300 hover:text-red-700 text-gray-600 text-xs transition-colors"
                            >
                              Suspend
                            </button>
                          )}

                          {student.status === "suspended" && (
                            <button
                              onClick={() => handleToggleSuspend(student)}
                              disabled={isActionBusy}
                              className="px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium transition-colors"
                            >
                              Restore
                            </button>
                          )}

                          {student.status === "rejected" && (
                            <button
                              onClick={() => setInspectStudent(student)}
                              className="px-2.5 py-1 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs transition-colors"
                            >
                              View Reason
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mandatory Rejection Reason Modal */}
      {rejectModalStudent && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-md w-full p-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                <XCircle size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Reject College Verification</h3>
                <p className="text-xs text-gray-500">
                  {rejectModalStudent.fullName} &bull; {rejectModalStudent.rollNumber}
                </p>
              </div>
            </div>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Required Rejection Reason *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Roll number does not match Karpagam enrollment records for 3rd year AIDS department."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-200 focus:outline-none"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  This explanation will be delivered securely to the student with instructions on how to correct their profile.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setRejectModalStudent(null);
                    setRejectionReason("");
                  }}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 text-xs font-medium transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={rejectSubmitting || rejectionReason.trim().length < 5}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-medium transition-colors disabled:opacity-50"
                >
                  {rejectSubmitting ? "Rejecting..." : "Confirm Rejection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rejection Inspection Modal */}
      {inspectStudent && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-md w-full p-6 animate-fade-in">
            <h3 className="text-base font-bold text-gray-900 mb-1">Verification Details</h3>
            <p className="text-xs text-gray-500 mb-4">{inspectStudent.fullName} ({inspectStudent.collegeEmail})</p>

            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 mb-4">
              <strong className="block mb-1">Recorded Rejection Reason:</strong>
              <p className="italic">&ldquo;{inspectStudent.rejectionReason || "Details did not match KCE enrollment."}&rdquo;</p>
            </div>

            <button
              onClick={() => setInspectStudent(null)}
              className="w-full py-2 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
