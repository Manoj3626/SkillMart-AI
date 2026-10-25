"use client";
import React, { useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/ui/Toaster";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { User, Bell, Shield, Trash2, Save } from "lucide-react";

export default function SettingsPage() {
  const { profile, refreshProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [headline, setHeadline] = useState(profile?.headline ?? "");
  const [location, setLocation] = useState(profile?.location ?? "");
  const [githubUrl, setGithubUrl] = useState(profile?.github_url ?? "");

  async function saveProfile() {
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName, headline, location, github_url: githubUrl, updated_at: new Date().toISOString() })
        .eq("id", profile?.id ?? "");
      if (error) throw error;
      await refreshProfile();
      toast.success("Profile saved!");
    } catch {
      toast.error("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-surface-900)]">Settings</h1>
        <p className="text-sm text-[var(--color-surface-500)] mt-0.5">Manage your profile and preferences.</p>
      </div>

      {/* Profile */}
      <Card className="mb-6 animate-fade-in">
        <CardHeader>
          <div className="flex items-center gap-2">
            <User size={16} className="text-[var(--color-brand-500)]" />
            <CardTitle>Profile</CardTitle>
          </div>
        </CardHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="label">Full Name</label>
            <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="label">Headline</label>
            <input className="input" value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="e.g. Frontend Developer · React · TypeScript" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="label">Location</label>
            <input className="input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Bangalore, India" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="label">GitHub Profile URL</label>
            <input className="input" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/yourusername" type="url" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="label">Email</label>
            <input className="input" value={profile?.email ?? ""} disabled aria-disabled="true" />
            <p className="text-xs text-[var(--color-surface-400)]">Email cannot be changed here. Use Supabase Auth to update.</p>
          </div>
          <button onClick={saveProfile} disabled={saving} className="btn btn-primary btn-md self-start">
            {saving ? (
              <svg className="animate-spin" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <circle cx="12" cy="12" r="10" strokeOpacity={0.25} /><path d="M12 2a10 10 0 0 1 10 10" />
              </svg>
            ) : <Save size={14} />}
            {saving ? "Saving…" : "Save Profile"}
          </button>
        </div>
      </Card>

      {/* Privacy */}
      <Card className="mb-6 animate-fade-in delay-100">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-[var(--color-teal-500)]" />
            <CardTitle>Privacy & Data</CardTitle>
          </div>
        </CardHeader>
        <div className="flex flex-col gap-3 text-sm text-[var(--color-surface-600)]">
          <p>Your resumes and interview transcripts are private. They are never shared with employers without your explicit action.</p>
          <p>AI analysis is performed server-side. Raw transcript content is not stored unless you consented at the start of each session.</p>
          <div className="flex items-center gap-3 pt-2">
            <button className="btn btn-outline btn-sm text-[var(--color-error-600)] border-[var(--color-error-200)] hover:bg-[var(--color-error-50)]">
              <Trash2 size={13} /> Delete All Interview Data
            </button>
            <button className="btn btn-outline btn-sm">
              Export My Data
            </button>
          </div>
        </div>
      </Card>

      {/* Danger zone */}
      <Card className="border-[var(--color-error-200)] animate-fade-in delay-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trash2 size={16} className="text-[var(--color-error-500)]" />
            <CardTitle className="text-[var(--color-error-600)]">Danger Zone</CardTitle>
          </div>
        </CardHeader>
        <p className="text-sm text-[var(--color-surface-500)] mb-4">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <button className="btn btn-danger btn-sm" disabled>
          Delete Account
        </button>
        <p className="text-xs text-[var(--color-surface-400)] mt-2">Account deletion requires email confirmation — coming soon.</p>
      </Card>
    </div>
  );
}
