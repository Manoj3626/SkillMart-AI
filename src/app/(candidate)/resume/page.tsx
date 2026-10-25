"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  Upload,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  Target,
  Zap,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  BookOpen,
  BarChart2,
  Shield,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Progress, ScoreRing } from "@/components/ui/Progress";
import { toast } from "@/components/ui/Toaster";
import type { ResumeAnalysis } from "@/app/api/resume/analyze/route";

const ACCEPTED = ".pdf,.docx,.txt";
const MAX_MB = 5;

export default function ResumePage() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDesc, setJobDesc] = useState("");
  const [showJD, setShowJD] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) validateAndSet(dropped);
  }, []);

  function validateAndSet(f: File) {
    if (f.size > MAX_MB * 1024 * 1024) {
      toast.error(`File too large. Max ${MAX_MB} MB.`);
      return;
    }
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "docx", "txt"].includes(ext ?? "")) {
      toast.error("Only PDF, DOCX, and TXT files are supported.");
      return;
    }
    setFile(f);
    setAnalysis(null);
  }

  async function handleAnalyze() {
    if (!file) return;
    setUploading(true);
    setAnalysis(null);

    try {
      const fd = new FormData();
      fd.append("file", file);
      if (jobDesc.trim()) fd.append("jobDescription", jobDesc.trim());

      const res = await fetch("/api/resume/analyze", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Analysis failed.");
        return;
      }

      setAnalysis(data.analysis);
      setIsDemo(data.demo);
      if (data.demo) toast.info("Running in demo mode — add AI_API_KEY for real analysis.");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-[var(--color-surface-900)]">Resume Analyzer</h1>
        <p className="text-sm text-[var(--color-surface-500)] mt-0.5">
          Upload your resume to get an alignment score, ATS tips, and AI-powered improvements.
        </p>
      </div>

      {/* Upload Card */}
      <Card className="mb-6 animate-fade-in delay-100">
        <CardHeader>
          <div>
            <CardTitle>Upload Resume</CardTitle>
            <CardDescription>PDF, DOCX, or TXT · Max 5 MB</CardDescription>
          </div>
          <FileText size={18} className="text-[var(--color-teal-400)]" />
        </CardHeader>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all mb-4 ${
            dragging
              ? "border-[var(--color-brand-400)] bg-[var(--color-brand-50)]"
              : file
              ? "border-[var(--color-success-400)] bg-[var(--color-success-50)]"
              : "border-[var(--color-surface-200)] hover:border-[var(--color-brand-300)] hover:bg-[var(--color-surface-50)]"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED}
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) validateAndSet(f); }}
          />
          {file ? (
            <div className="flex items-center justify-center gap-3">
              <CheckCircle size={22} className="text-[var(--color-success-500)]" />
              <div className="text-left">
                <p className="text-sm font-semibold text-[var(--color-surface-800)]">{file.name}</p>
                <p className="text-xs text-[var(--color-surface-400)]">
                  {(file.size / 1024).toFixed(0)} KB
                </p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setFile(null); setAnalysis(null); }}
                className="ml-2 text-[var(--color-surface-400)] hover:text-[var(--color-error-500)] transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <>
              <Upload size={28} className="text-[var(--color-surface-300)] mx-auto mb-3" />
              <p className="text-sm font-medium text-[var(--color-surface-600)] mb-1">
                Drag & drop your resume, or click to browse
              </p>
              <p className="text-xs text-[var(--color-surface-400)]">PDF, DOCX, TXT · Max 5 MB</p>
            </>
          )}
        </div>

        {/* Optional JD */}
        <button
          type="button"
          onClick={() => setShowJD(!showJD)}
          className="flex items-center gap-2 text-sm font-medium text-[var(--color-brand-600)] hover:underline mb-3"
        >
          {showJD ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {showJD ? "Hide" : "Add"} Job Description (optional — improves alignment score)
        </button>
        {showJD && (
          <textarea
            value={jobDesc}
            onChange={(e) => setJobDesc(e.target.value)}
            placeholder="Paste the job description here to get a role-specific alignment score…"
            className="input resize-none min-h-[100px] mb-4"
          />
        )}

        <button
          onClick={handleAnalyze}
          disabled={!file || uploading}
          className="btn btn-primary btn-lg w-full"
        >
          {uploading ? (
            <>
              <svg className="animate-spin" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <circle cx="12" cy="12" r="10" strokeOpacity={0.25} /><path d="M12 2a10 10 0 0 1 10 10" />
              </svg>
              Analyzing…
            </>
          ) : (
            <><Zap size={16} /> Analyze Resume</>
          )}
        </button>
      </Card>

      {/* Results */}
      {analysis && (
        <div className="flex flex-col gap-6 animate-fade-in">
          {isDemo && (
            <div className="flex items-center gap-2 p-3 bg-[var(--color-warning-50)] border border-[var(--color-warning-100)] rounded-xl text-xs text-[var(--color-warning-700)]">
              <AlertCircle size={14} />
              Demo analysis shown. Set AI_API_KEY in .env.local for real AI-powered analysis.
            </div>
          )}

          {/* Score hero row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Alignment Score", score: analysis.alignment_score, icon: Target, color: "brand" },
              { label: "ATS Score", score: analysis.ats_compatibility_score, icon: Shield, color: "teal" },
              { label: "Word Count", value: analysis.word_count, sub: `~${analysis.pages_estimate} page${analysis.pages_estimate !== 1 ? "s" : ""}`, icon: BarChart2, color: "violet" },
            ].map((item, i) => (
              <Card key={i}>
                <div className="flex items-center gap-4">
                  {"score" in item ? (
                    <ScoreRing score={item.score!} size={60} strokeWidth={5} />
                  ) : (
                    <div className="flex flex-col items-center">
                      <span className="text-2xl font-extrabold text-[var(--color-surface-900)]">{item.value}</span>
                      <span className="text-xs text-[var(--color-surface-400)]">{item.sub}</span>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-[var(--color-surface-400)]">{item.label}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Detected Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Detected Skills</CardTitle>
            </CardHeader>
            <div className="flex flex-wrap gap-2">
              {analysis.detected_skills.map((s) => (
                <Badge key={s} variant="teal">{s}</Badge>
              ))}
            </div>
          </Card>

          {/* Missing keywords */}
          {analysis.missing_keywords.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="text-[var(--color-warning-500)]" />
                  <CardTitle>Missing Keywords</CardTitle>
                </div>
                <span className="text-xs text-[var(--color-surface-400)]">Add these to your resume</span>
              </CardHeader>
              <div className="flex flex-wrap gap-2">
                {analysis.missing_keywords.map((k) => (
                  <Badge key={k} variant="warning">{k}</Badge>
                ))}
              </div>
            </Card>
          )}

          {/* Strengths + Improvements */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-[var(--color-success-500)]" />
                  <CardTitle>Strengths</CardTitle>
                </div>
              </CardHeader>
              <ul className="flex flex-col gap-2">
                {analysis.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-surface-700)]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-success-500)] mt-2 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lightbulb size={16} className="text-[var(--color-warning-500)]" />
                  <CardTitle>Improvements</CardTitle>
                </div>
              </CardHeader>
              <ul className="flex flex-col gap-2">
                {analysis.improvements.map((imp, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-surface-700)]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-warning-500)] mt-2 shrink-0" />
                    {imp}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Section-by-section feedback */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-[var(--color-brand-500)]" />
                <CardTitle>Section Feedback</CardTitle>
              </div>
            </CardHeader>
            <div className="flex flex-col gap-2">
              {Object.entries(analysis.section_feedback).map(([section, feedback]: [string, unknown]) => {
                const feedbackStr = String(feedback ?? "");
                const isMissing = feedbackStr.toLowerCase().includes("missing") || feedbackStr.toLowerCase().includes("not found");
                return (
                  <div key={section} className="border border-[var(--color-surface-200)] rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedSection(expandedSection === section ? null : section)}
                      className="w-full flex items-center justify-between p-3 text-left hover:bg-[var(--color-surface-50)] transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isMissing ? "bg-[var(--color-error-400)]" : "bg-[var(--color-success-400)]"}`} />
                        <span className="text-sm font-semibold text-[var(--color-surface-800)]">{section}</span>
                        {isMissing && <Badge variant="error" className="text-[10px]">Missing</Badge>}
                      </div>
                      {expandedSection === section ? <ChevronUp size={14} className="text-[var(--color-surface-400)]" /> : <ChevronDown size={14} className="text-[var(--color-surface-400)]" />}
                    </button>
                    {expandedSection === section && (
                      <div className="px-4 pb-3 border-t border-[var(--color-surface-100)]">
                        <p className="text-sm text-[var(--color-surface-700)] pt-2 leading-relaxed">{feedbackStr}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Suggested rewrites */}
          {analysis.suggested_rewrites.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Zap size={16} className="text-[var(--color-brand-500)]" />
                  <CardTitle>Suggested Rewrites</CardTitle>
                </div>
                <span className="text-xs text-[var(--color-surface-400)]">AI-generated suggestions — verify before use</span>
              </CardHeader>
              <div className="flex flex-col gap-4">
                {analysis.suggested_rewrites.map((rw, i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <div className="bg-[var(--color-error-50)] border border-[var(--color-error-100)] rounded-xl p-3">
                      <p className="text-[10px] font-bold text-[var(--color-error-500)] uppercase tracking-wider mb-1">Original</p>
                      <p className="text-sm text-[var(--color-error-800)]">{rw.original}</p>
                    </div>
                    <div className="bg-[var(--color-success-50)] border border-[var(--color-success-100)] rounded-xl p-3">
                      <p className="text-[10px] font-bold text-[var(--color-success-600)] uppercase tracking-wider mb-1">Improved</p>
                      <p className="text-sm text-[var(--color-success-800)]">{rw.improved}</p>
                      <p className="text-xs text-[var(--color-success-600)] mt-1.5 italic">{rw.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
