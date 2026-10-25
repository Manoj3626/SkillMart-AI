"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Mail,
  RefreshCw,
  Server,
  Lock,
  GraduationCap,
  ArrowRight,
  Activity,
  History,
} from "lucide-react";
import { toast } from "@/components/ui/Toaster";
import { COLLEGE_CONFIG } from "@/lib/college/config";
import type { AuditLog, StudentProfile } from "@/types";

interface PlatformOverviewData {
  stats: {
    totalStudents: number;
    activeStudents: number;
    pendingVerification: number;
    pendingEmail: number;
    rejected: number;
    suspended: number;
  };
  students: StudentProfile[];
  auditLogs: AuditLog[];
  emailProvider: {
    configured: boolean;
    provider: string;
    senderAddress: string;
  };
}

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<PlatformOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "audit" | "system">("overview");

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/overview");
      if (!res.ok) {
        if (res.status === 403 || res.status === 401) {
          toast.error("Super Admin privileges required.");
          router.push("/login");
          return;
        }
        throw new Error("Failed to load platform data.");
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      toast.error(err.message || "Failed to load super admin data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-4">
        <div className="text-center">
          <RefreshCw size={28} className="animate-spin text-emerald-700 mx-auto mb-3" />
          <p className="text-xs text-gray-500 font-medium">Loading platform security dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { stats, auditLogs, emailProvider } = data;

  return (
    <div className="min-h-screen bg-[#FAFAF8] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        {/* Super Admin Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-900 text-white text-xs font-medium w-fit mb-2 shadow-sm">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>Platform Super Administrator &bull; Mandatory MFA Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              SkillMatch AI &bull; System Governance
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Platform-wide account integrity, security audit trail, and institutional email delivery health.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-medium shadow-sm transition-colors"
            >
              <RefreshCw size={14} />
              <span>Refresh</span>
            </button>
            <Link
              href="/college/dashboard"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium shadow-sm transition-colors"
            >
              <GraduationCap size={15} />
              <span>College Admin Queue</span>
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-gray-200 text-sm">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 px-3 font-semibold text-xs border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "overview"
                ? "border-emerald-700 text-emerald-800"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <Activity size={14} />
            <span>Platform Overview</span>
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`pb-3 px-3 font-semibold text-xs border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "audit"
                ? "border-emerald-700 text-emerald-800"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <History size={14} />
            <span>Security Audit Trail ({auditLogs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("system")}
            className={`pb-3 px-3 font-semibold text-xs border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "system"
                ? "border-emerald-700 text-emerald-800"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <Server size={14} />
            <span>Email & System Health</span>
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm">
                <span className="text-xs text-gray-500 block mb-1">Total Registered</span>
                <strong className="text-2xl font-bold text-gray-900">{stats.totalStudents}</strong>
              </div>
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 shadow-sm">
                <span className="text-xs text-emerald-700 block mb-1">Active Accounts</span>
                <strong className="text-2xl font-bold text-emerald-900">{stats.activeStudents}</strong>
              </div>
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 shadow-sm">
                <span className="text-xs text-amber-700 block mb-1">Pending College Review</span>
                <strong className="text-2xl font-bold text-amber-900">{stats.pendingVerification}</strong>
              </div>
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 shadow-sm">
                <span className="text-xs text-blue-700 block mb-1">Pending Email OTP</span>
                <strong className="text-2xl font-bold text-blue-900">{stats.pendingEmail}</strong>
              </div>
              <div className="p-4 rounded-xl border border-red-200 bg-red-50/40 shadow-sm">
                <span className="text-xs text-red-600 block mb-1">Rejected Submissions</span>
                <strong className="text-2xl font-bold text-red-800">{stats.rejected}</strong>
              </div>
              <div className="p-4 rounded-xl border border-gray-300 bg-gray-100 shadow-sm">
                <span className="text-xs text-gray-600 block mb-1">Suspended Accounts</span>
                <strong className="text-2xl font-bold text-gray-800">{stats.suspended}</strong>
              </div>
            </div>

            {/* Institutional Deployment Configuration Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <GraduationCap size={16} className="text-emerald-700" />
                  <span>College Scope & Domain Enforcement</span>
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500">Institution:</span>
                    <strong className="text-gray-900">{COLLEGE_CONFIG.name}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500">Authorized Domain:</span>
                    <strong className="text-gray-900 font-mono">@{COLLEGE_CONFIG.officialDomain}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500">Configured Departments:</span>
                    <strong className="text-gray-900">{COLLEGE_CONFIG.departments.length} Eligible Departments</strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-500">Inactivity Timeout:</span>
                    <strong className="text-gray-900">{COLLEGE_CONFIG.security.sessionInactivityTimeoutMinutes} Minutes (Server-Enforced)</strong>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Lock size={16} className="text-emerald-700" />
                  <span>Security & MFA Policy</span>
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500">Admin MFA:</span>
                    <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      Enforced (Super Admin & College Admin)
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500">OTP Expiration / Single-Use:</span>
                    <strong className="text-gray-900">5 Minutes &bull; Single-Use HMAC-SHA256</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500">Resend Cooldown / Max Attempts:</span>
                    <strong className="text-gray-900">30s Cooldown &bull; Max 5 Attempts Lockout</strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-500">Minimum Password Length:</span>
                    <strong className="text-gray-900">12 Characters (Passphrase Supported)</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Audit Logs */}
        {activeTab === "audit" && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-gray-900">Platform Security Audit Log</h2>
                <p className="text-xs text-gray-500">
                  Immutable record of authentications, OTP validations, college approvals, and suspensions. Passwords and secrets are omitted.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase font-semibold">
                    <th className="py-2.5 px-4">Timestamp</th>
                    <th className="py-2.5 px-4">Action</th>
                    <th className="py-2.5 px-4">Actor ID / Role</th>
                    <th className="py-2.5 px-4">Target Type & ID</th>
                    <th className="py-2.5 px-4">Contextual Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50/60 font-mono text-[11px]">
                      <td className="py-2.5 px-4 text-gray-500 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-gray-900">
                        {log.action}
                      </td>
                      <td className="py-2.5 px-4 text-gray-700">
                        <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">
                          {log.actorRole}
                        </span>{" "}
                        <span className="text-gray-400 text-[10px]">{log.actorId}</span>
                      </td>
                      <td className="py-2.5 px-4 text-gray-600">
                        {log.targetType}: {log.targetId}
                      </td>
                      <td className="py-2.5 px-4 text-gray-600 max-w-xs truncate">
                        {log.details ? JSON.stringify(log.details) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: System Health */}
        {activeTab === "system" && (
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
                <Mail size={18} className="text-emerald-700" />
                <span>Outbound Email Provider Setup</span>
              </h2>
              <p className="text-xs text-gray-600">
                Email verification codes and personalized welcome emails are dispatched through a server-side delivery engine.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                <span className="text-xs text-gray-400 block mb-1">Provider Adapter</span>
                <strong className="text-sm font-semibold text-gray-900">{emailProvider.provider}</strong>
              </div>
              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                <span className="text-xs text-gray-400 block mb-1">Sender Address</span>
                <strong className="text-sm font-mono text-gray-900">{emailProvider.senderAddress}</strong>
              </div>
              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                <span className="text-xs text-gray-400 block mb-1">Status</span>
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded ${
                  emailProvider.configured ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
                }`}>
                  <CheckCircle2 size={13} />
                  {emailProvider.configured ? "Production Service Configured" : "Active Development Mode"}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 leading-relaxed">
              <strong>Production Deployment Note:</strong> For production delivery to Karpagam student inboxes (`@kce.ac.in`), ensure the domain DNS records (SPF, DKIM, and DMARC) are validated with your SMTP or Resend provider. Secrets must remain strictly server-side in `.env.local` or hosting secret managers.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
