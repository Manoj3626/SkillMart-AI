"use client";
import React, { useState } from "react";
import { TrendingUp, Plus, X } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const LEVELS = ["beginner", "intermediate", "advanced", "expert"] as const;
type Level = typeof LEVELS[number];

const levelColors: Record<Level, "surface" | "teal" | "brand" | "violet"> = {
  beginner: "surface",
  intermediate: "teal",
  advanced: "brand",
  expert: "violet",
};

const suggestedSkills = [
  "JavaScript", "TypeScript", "React", "Node.js", "Python", "SQL",
  "Git", "REST APIs", "System Design", "Data Structures", "AWS", "Docker",
];

export default function SkillsPage() {
  const [skills, setSkills] = useState<{ name: string; level: Level }[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [newLevel, setNewLevel] = useState<Level>("intermediate");

  function addSkill(name: string) {
    if (!name.trim() || skills.find((s) => s.name.toLowerCase() === name.toLowerCase())) return;
    setSkills((prev) => [...prev, { name: name.trim(), level: newLevel }]);
    setNewSkill("");
  }

  function removeSkill(name: string) {
    setSkills((prev) => prev.filter((s) => s.name !== name));
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-surface-900)]">Skills & Gap Analysis</h1>
        <p className="text-sm text-[var(--color-surface-500)] mt-0.5">
          Add your skills to get personalised job matches and gap analysis.
        </p>
      </div>

      {/* Add skill */}
      <Card className="mb-6 animate-fade-in">
        <CardHeader>
          <CardTitle>Add a Skill</CardTitle>
        </CardHeader>
        <div className="flex gap-3 flex-wrap mb-4">
          <input
            type="text"
            placeholder="e.g. React, Python, SQL…"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addSkill(newSkill)}
            className="input flex-1 min-w-48"
          />
          <select
            value={newLevel}
            onChange={(e) => setNewLevel(e.target.value as Level)}
            className="input w-auto"
          >
            {LEVELS.map((l) => (
              <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
            ))}
          </select>
          <button
            onClick={() => addSkill(newSkill)}
            className="btn btn-primary btn-md"
          >
            <Plus size={15} /> Add
          </button>
        </div>
        <div>
          <p className="text-xs text-[var(--color-surface-400)] mb-2">Quick add:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedSkills.filter((s) => !skills.find((sk) => sk.name === s)).map((s) => (
              <button
                key={s}
                onClick={() => addSkill(s)}
                className="badge badge-surface hover:badge-brand cursor-pointer transition-all"
              >
                + {s}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Skills list */}
      <Card className="animate-fade-in delay-100">
        <CardHeader>
          <CardTitle>Your Skills ({skills.length})</CardTitle>
          {skills.length > 0 && (
            <span className="text-xs text-[var(--color-surface-400)]">
              Connect Supabase to persist across sessions
            </span>
          )}
        </CardHeader>

        {skills.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-12 h-12 rounded-full bg-[var(--color-surface-100)] flex items-center justify-center mx-auto mb-3">
              <TrendingUp size={22} className="text-[var(--color-surface-300)]" />
            </div>
            <p className="text-sm text-[var(--color-surface-500)]">No skills added yet</p>
            <p className="text-xs text-[var(--color-surface-400)] mt-1">Use the form above to add your skills</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {skills.map((skill) => (
              <div
                key={skill.name}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--color-surface-200)] bg-[var(--color-surface-50)] group"
              >
                <span className="text-sm font-semibold text-[var(--color-surface-800)]">{skill.name}</span>
                <Badge variant={levelColors[skill.level]}>{skill.level}</Badge>
                <button
                  onClick={() => removeSkill(skill.name)}
                  className="opacity-0 group-hover:opacity-100 text-[var(--color-surface-400)] hover:text-[var(--color-error-500)] transition-all"
                  aria-label={`Remove ${skill.name}`}
                >
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
