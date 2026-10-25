"use client";
import React, { useState } from "react";
import { ClipboardList, Plus, ExternalLink, Trash2, Building, Calendar, ChevronDown, Search } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { toast } from "@/components/ui/Toaster";

type AppStatus = "saved" | "applied" | "screening" | "interview" | "offer" | "rejected" | "withdrawn";

interface Application {
  id: string;
  company: string;
  role: string;
  location: string;
  status: AppStatus;
  date: string;
  url?: string;
  notes?: string;
}

const STATUS_CONFIG: Record<AppStatus, { variant: "success" | "brand" | "teal" | "warning" | "error" | "surface" | "violet"; label: string }> = {
  saved:     { variant: "surface",  label: "Saved" },
  applied:   { variant: "brand",    label: "Applied" },
  screening: { variant: "teal",     label: "Screening" },
  interview: { variant: "violet",   label: "Interview" },
  offer:     { variant: "success",  label: "Offer 🎉" },
  rejected:  { variant: "error",    label: "Rejected" },
  withdrawn: { variant: "surface",  label: "Withdrawn" },
};

const STATUSES = Object.keys(STATUS_CONFIG) as AppStatus[];

const SEED: Application[] = [
  { id: "1", company: "TCS Digital", role: "Software Engineer", location: "Bangalore", status: "screening", date: "Oct 10, 2026", url: "#" },
  { id: "2", company: "Infosys", role: "Frontend Developer", location: "Hyderabad", status: "applied", date: "Oct 5, 2026", url: "#" },
  { id: "3", company: "Wipro", role: "Data Analyst", location: "Pune", status: "interview", date: "Sep 28, 2026", url: "#" },
  { id: "4", company: "Swiggy", role: "React Developer", location: "Bangalore (Remote)", status: "offer", date: "Oct 8, 2026", url: "#" },
];

const BLANK: Omit<Application, "id"> = {
  company: "", role: "", location: "", status: "applied", date: "2026-10-25", url: "", notes: "",
};

export default function ApplicationsPage() {
  const [apps, setApps] = useState<Application[]>(SEED);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<AppStatus | "all">("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Omit<Application, "id">>(BLANK);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = apps.filter((a) => {
    const matchSearch =
      a.company.toLowerCase().includes(search.toLowerCase()) ||
      a.role.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = apps.filter((a) => a.status === s).length;
    return acc;
  }, {} as Record<AppStatus, number>);

  function addApp() {
    if (!form.company || !form.role) { toast.error("Company and role are required."); return; }
    const newApp: Application = { ...form, id: Date.now().toString() };
    setApps([newApp, ...apps]);
    setForm(BLANK);
    setShowForm(false);
    toast.success("Application added!");
  }

  function updateStatus(id: string, status: AppStatus) {
    setApps(apps.map((a) => a.id === id ? { ...a, status } : a));
  }

  function deleteApp(id: string) {
    setApps(apps.filter((a) => a.id !== id));
    toast.success("Removed.");
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-[var(--color-surface-900)]">Applications Tracker</h1>
        <p className="text-sm text-[var(--color-surface-500)] mt-0.5">Track every application from first click to offer.</p>
      </div>

      {/* Status pipeline summary */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 animate-fade-in delay-50">
        {(["all", ...STATUSES] as const).map((s) => {
          const count = s === "all" ? apps.length : counts[s];
          const cfg = s !== "all" ? STATUS_CONFIG[s] : null;
          return (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                filterStatus === s
                  ? "bg-[var(--color-brand-500)] text-white shadow-sm"
                  : "bg-[var(--color-surface-100)] text-[var(--color-surface-600)] hover:bg-[var(--color-surface-200)]"
              }`}
            >
              {s === "all" ? "All" : STATUS_CONFIG[s].label}
              <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                filterStatus === s ? "bg-white/20 text-white" : "bg-[var(--color-surface-200)] text-[var(--color-surface-500)]"
              }`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex gap-3 mb-4 animate-fade-in delay-100">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-surface-400)] pointer-events-none" />
          <input
            type="text"
            placeholder="Search company or role…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-8 text-sm"
          />
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary btn-md shrink-0">
          <Plus size={15} /> Add Application
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <Card className="mb-6 border-[var(--color-brand-200)] animate-fade-in">
          <CardHeader><CardTitle>New Application</CardTitle></CardHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="flex flex-col gap-1.5">
              <label className="label">Company *</label>
              <input className="input" placeholder="e.g. Swiggy" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="label">Role *</label>
              <input className="input" placeholder="e.g. Frontend Developer" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="label">Location</label>
              <input className="input" placeholder="Bangalore / Remote" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as AppStatus })}>
                {STATUSES.map((s) => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="label">Date Applied</label>
              <input type="date" className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="label">Job URL</label>
              <input className="input" placeholder="https://…" type="url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5 mb-4">
            <label className="label">Notes</label>
            <textarea className="input resize-none min-h-[60px]" placeholder="e.g. referral from Priya, HC = 4 rounds" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="flex gap-3">
            <button onClick={addApp} className="btn btn-primary btn-md">Save</button>
            <button onClick={() => setShowForm(false)} className="btn btn-outline btn-md">Cancel</button>
          </div>
        </Card>
      )}

      {/* Applications list */}
      <div className="flex flex-col gap-3">
        {filtered.length === 0 && (
          <Card className="text-center py-12">
            <ClipboardList size={32} className="mx-auto mb-3 text-[var(--color-surface-200)]" />
            <p className="text-sm font-medium text-[var(--color-surface-500)]">No applications found</p>
            <p className="text-xs text-[var(--color-surface-400)] mt-1">
              {search || filterStatus !== "all" ? "Try clearing filters" : "Add your first application above"}
            </p>
          </Card>
        )}

        {filtered.map((app, i) => {
          const cfg = STATUS_CONFIG[app.status];
          const isExpanded = expandedId === app.id;
          return (
            <Card
              key={app.id}
              className="animate-fade-in transition-all"
              style={{ animationDelay: `${i * 0.04}s` } as React.CSSProperties}
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {app.company[0]}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--color-surface-900)] truncate">{app.role}</p>
                  <div className="flex items-center gap-2 text-xs text-[var(--color-surface-400)] mt-0.5 flex-wrap">
                    <span className="flex items-center gap-1"><Building size={10} />{app.company}</span>
                    {app.location && <span>{app.location}</span>}
                    <span className="flex items-center gap-1"><Calendar size={10} />{app.date}</span>
                  </div>
                </div>
                {/* Status badge + controls */}
                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={app.status}
                    onChange={(e) => updateStatus(app.id, e.target.value as AppStatus)}
                    className="text-xs border border-[var(--color-surface-200)] rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-400)] cursor-pointer"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                    ))}
                  </select>
                  {app.url && (
                    <a href={app.url} target="_blank" rel="noopener noreferrer"
                      className="text-[var(--color-surface-400)] hover:text-[var(--color-brand-500)] transition-colors"
                      aria-label="Open job listing">
                      <ExternalLink size={15} />
                    </a>
                  )}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : app.id)}
                    className="text-[var(--color-surface-400)] hover:text-[var(--color-surface-600)] transition-colors"
                    aria-label="Toggle notes"
                  >
                    <ChevronDown size={15} className={`transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  </button>
                  <button
                    onClick={() => deleteApp(app.id)}
                    className="text-[var(--color-surface-300)] hover:text-[var(--color-error-500)] transition-colors"
                    aria-label="Delete application"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              {/* Notes */}
              {isExpanded && app.notes && (
                <div className="mt-3 pt-3 border-t border-[var(--color-surface-100)]">
                  <p className="text-xs text-[var(--color-surface-400)] font-semibold uppercase tracking-wider mb-1">Notes</p>
                  <p className="text-sm text-[var(--color-surface-700)]">{app.notes}</p>
                </div>
              )}
              {isExpanded && !app.notes && (
                <div className="mt-3 pt-3 border-t border-[var(--color-surface-100)]">
                  <p className="text-xs text-[var(--color-surface-400)]">No notes. Edit the entry to add notes.</p>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
