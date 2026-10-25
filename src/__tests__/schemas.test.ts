import { describe, it, expect } from "vitest";
import { z } from "zod";

// ─── Interview feedback schema validation tests ──────────────────────────────
import { FeedbackSchema } from "@/app/api/analysis/feedback/route";

describe("FeedbackSchema", () => {
  const validFeedback = {
    overall_score: 75,
    relevance_score: 80,
    technical_score: 70,
    communication_score: 78,
    problem_solving_score: 72,
    completeness_score: 74,
    strengths: ["Clear communication", "Good examples"],
    weaknesses: ["Needs more metrics"],
    question_feedback: [
      {
        question: "Describe a challenge",
        answer_summary: "Described a debugging issue",
        score: 72,
        feedback: "Add measurable impact",
        improved_answer: "Resolved bug reducing error rate by 40%",
      },
    ],
    recommended_topics: ["System Design", "STAR Method"],
    next_session_suggestion: "Practice behavioral with STAR format",
  };

  it("parses a valid feedback object", () => {
    const result = FeedbackSchema.parse(validFeedback);
    expect(result.overall_score).toBe(75);
    expect(result.strengths).toHaveLength(2);
  });

  it("accepts null technical_score", () => {
    const result = FeedbackSchema.parse({ ...validFeedback, technical_score: null });
    expect(result.technical_score).toBeNull();
  });

  it("rejects scores outside 0–100", () => {
    expect(() => FeedbackSchema.parse({ ...validFeedback, overall_score: 101 })).toThrow();
    expect(() => FeedbackSchema.parse({ ...validFeedback, overall_score: -1 })).toThrow();
  });

  it("rejects missing required fields", () => {
    const { strengths, ...incomplete } = validFeedback;
    expect(() => FeedbackSchema.parse(incomplete)).toThrow();
  });

  it("rejects non-integer scores", () => {
    expect(() => FeedbackSchema.parse({ ...validFeedback, overall_score: 75.5 })).toThrow();
  });
});

// ─── Resume analysis schema tests ──────────────────────────────────────────
import { ResumeAnalysisSchema } from "@/app/api/resume/analyze/route";

describe("ResumeAnalysisSchema", () => {
  const validAnalysis = {
    alignment_score: 74,
    ats_compatibility_score: 68,
    word_count: 450,
    pages_estimate: 1,
    strengths: ["Strong skills section"],
    improvements: ["Add metrics"],
    missing_keywords: ["Docker", "CI/CD"],
    detected_skills: ["React", "TypeScript"],
    section_feedback: {
      Summary: "Missing — add a professional summary",
      Experience: "Good but lacks metrics",
    },
    suggested_rewrites: [
      {
        original: "Worked on React",
        improved: "Built 3 React features, reducing bugs by 30%",
        reason: "Quantified impact",
      },
    ],
  };

  it("parses a valid analysis object", () => {
    const result = ResumeAnalysisSchema.parse(validAnalysis);
    expect(result.alignment_score).toBe(74);
    expect(result.detected_skills).toContain("React");
  });

  it("rejects alignment_score above 100", () => {
    expect(() => ResumeAnalysisSchema.parse({ ...validAnalysis, alignment_score: 110 })).toThrow();
  });

  it("requires section_feedback to be a string record", () => {
    expect(() =>
      ResumeAnalysisSchema.parse({
        ...validAnalysis,
        section_feedback: { Summary: 42 }, // number instead of string
      })
    ).toThrow();
  });

  it("allows empty arrays", () => {
    const result = ResumeAnalysisSchema.parse({
      ...validAnalysis,
      missing_keywords: [],
      suggested_rewrites: [],
    });
    expect(result.missing_keywords).toHaveLength(0);
    expect(result.suggested_rewrites).toHaveLength(0);
  });
});

// ─── Job scoring helper tests ──────────────────────────────────────────────
// Inline duplicate of the scoring logic from the jobs route (pure function)
function scoreJobMatch(
  jobText: string,
  userSkills: string[]
): { score: number; matching: string[] } {
  if (!userSkills.length) return { score: 0, matching: [] };
  const text = jobText.toLowerCase();
  const matching = userSkills.filter((s) => text.includes(s.toLowerCase()));
  const score = Math.min(100, Math.round((matching.length / Math.max(userSkills.length, 5)) * 100));
  return { score, matching };
}

describe("scoreJobMatch()", () => {
  it("returns 0 when no skills provided", () => {
    const result = scoreJobMatch("React TypeScript", []);
    expect(result.score).toBe(0);
  });

  it("correctly identifies matching skills", () => {
    const result = scoreJobMatch("We need React and TypeScript engineers", ["React", "TypeScript", "Python"]);
    expect(result.matching).toContain("React");
    expect(result.matching).toContain("TypeScript");
    expect(result.matching).not.toContain("Python");
  });

  it("caps score at 100", () => {
    const skills = ["React", "TypeScript", "Python", "Node.js", "SQL", "Docker", "AWS", "Kubernetes"];
    const result = scoreJobMatch(skills.join(" "), skills);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("is case-insensitive", () => {
    const result = scoreJobMatch("REACT and TYPESCRIPT", ["react", "typescript"]);
    expect(result.matching).toHaveLength(2);
  });
});
