import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { CollegeAuthService } from "@/lib/auth/collegeAuthStore";

import { generateWithGemini } from "@/lib/gemini";

// ─── Output Schema (validated with Zod) ────────────────────────────────────
export const ResumeAnalysisSchema = z.object({
  alignment_score: z.number().int().min(0).max(100),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
  missing_keywords: z.array(z.string()),
  detected_skills: z.array(z.string()),
  section_feedback: z.record(z.string(), z.string()),      // { Summary: "...", Experience: "...", ... }
  suggested_rewrites: z.array(z.object({
    original: z.string(),
    improved: z.string(),
    reason: z.string(),
  })),
  ats_compatibility_score: z.number().int().min(0).max(100),
  word_count: z.number().int(),
  pages_estimate: z.number(),
});

export type ResumeAnalysis = z.infer<typeof ResumeAnalysisSchema>;

// ─── Gemini analysis ────────────────────────────────────────────────────────
async function analyzeWithGemini(
  resumeText: string,
  jobDescription: string | undefined
): Promise<ResumeAnalysis> {
  const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY;
  const model = process.env.AI_MODEL ?? "gemini-3.8-flash";

  if (!apiKey) return buildDemoAnalysis(resumeText);

  const prompt = `You are a professional resume reviewer and ATS specialist.

Analyze the resume below and return ONLY valid JSON matching the schema. No markdown fences.
${jobDescription ? `\n## Target Job Description\n${jobDescription.slice(0, 2000)}` : ""}

## Resume Content
${resumeText.slice(0, 8000)}

## Required JSON Schema
{
  "alignment_score": <0-100, overall quality + JD alignment if provided>,
  "ats_compatibility_score": <0-100, formatting and keyword density>,
  "word_count": <integer>,
  "pages_estimate": <1, 1.5, or 2>,
  "strengths": ["<strength>", ...],
  "improvements": ["<specific improvement>", ...],
  "missing_keywords": ["<keyword missing from resume>", ...],
  "detected_skills": ["<skill found in resume>", ...],
  "section_feedback": {
    "Summary": "<feedback or 'Missing' if not found>",
    "Experience": "<feedback>",
    "Education": "<feedback>",
    "Skills": "<feedback>",
    "Projects": "<feedback or 'Not found'>",
    "Certifications": "<feedback or 'Not found'>"
  },
  "suggested_rewrites": [
    {
      "original": "<original bullet or sentence>",
      "improved": "<stronger, quantified version>",
      "reason": "<why this is better>"
    }
  ]
}

Rules:
- Be specific and actionable in all feedback
- Identify missing quantifiable metrics
- Flag passive language and suggest active alternatives
- Note ATS red flags (tables, images, unusual fonts)
- Limit suggested_rewrites to max 3 most impactful ones`;

  const { text } = await generateWithGemini(prompt, { temperature: 0.2 });
  const cleanedText = text.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
  return ResumeAnalysisSchema.parse(JSON.parse(cleanedText));
}

function buildDemoAnalysis(resumeText: string): ResumeAnalysis {
  const wc = resumeText.trim().split(/\s+/).filter(Boolean).length;
  return {
    alignment_score: 74,
    ats_compatibility_score: 68,
    word_count: wc || 450,
    pages_estimate: 1,
    strengths: [
      "Strong technical skills section with relevant technologies",
      "Clear chronological work history",
      "Action verbs used consistently",
    ],
    improvements: [
      "Add quantifiable metrics to experience bullets (e.g., 'Reduced load time by 40%')",
      "Write a concise professional summary at the top",
      "Expand the projects section with links and impact statements",
    ],
    missing_keywords: ["CI/CD", "Agile", "REST APIs", "System Design", "Docker"],
    detected_skills: ["JavaScript", "React", "Node.js", "SQL", "Git"],
    section_feedback: {
      Summary: "Missing — add a 2–3 line professional summary at the top",
      Experience: "Good structure but bullets lack quantifiable outcomes",
      Education: "Well formatted. Consider adding relevant coursework or GPA if above 8.0",
      Skills: "Good coverage. Group by category (Languages, Frameworks, Tools)",
      Projects: "Sparse — add 2–3 significant projects with technologies and impact",
      Certifications: "Not found — relevant certifications could strengthen your profile",
    },
    suggested_rewrites: [
      {
        original: "Worked on React frontend",
        improved: "Built and shipped 5 React features, reducing reported UI bugs by 30%",
        reason: "Quantified impact makes the contribution verifiable and impressive",
      },
      {
        original: "Responsible for database management",
        improved: "Designed and optimized PostgreSQL schema, cutting query time by 45%",
        reason: "Active voice + specific technology + measurable outcome",
      },
    ],
  };
}

// ─── Text extraction helpers ────────────────────────────────────────────────
async function extractText(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buf = Buffer.from(bytes);
  const type = file.type;

  if (type === "text/plain") {
    return new TextDecoder().decode(bytes);
  }

  if (
    type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.name.endsWith(".docx")
  ) {
    const mammoth = await import("mammoth");
    const { value } = await mammoth.extractRawText({ buffer: buf });
    return value;
  }

  if (type === "application/pdf" || file.name.endsWith(".pdf")) {
    // pdf-parse must be used server-side only
    const pdfParse = (await import("pdf-parse")) as any;
    const parseFn = pdfParse.default ?? pdfParse;
    const data = await parseFn(buf);
    return data.text;
  }

  throw new Error(`Unsupported file type: ${type}`);
}

// ─── Route Handler ──────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const kceToken = cookieStore.get("kce_session")?.value;
    let userId: string | null = null;
    if (kceToken) {
      const session = CollegeAuthService.verifySessionToken(kceToken);
      if (session) userId = session.userId;
    }
    if (!userId) {
      try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) userId = user.id;
      } catch {}
    }
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const jobDescription = formData.get("jobDescription") as string | undefined;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Size guard: 5 MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Maximum 5 MB." }, { status: 413 });
    }

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|docx|txt)$/i)) {
      return NextResponse.json(
        { error: "Unsupported file type. Use PDF, DOCX, or TXT." },
        { status: 415 }
      );
    }

    // Extract text
    let resumeText: string;
    try {
      resumeText = await extractText(file);
    } catch (e: any) {
      return NextResponse.json({ error: `Text extraction failed: ${e.message}` }, { status: 422 });
    }

    if (resumeText.trim().length < 50) {
      return NextResponse.json(
        { error: "Resume appears to be empty or unreadable." },
        { status: 422 }
      );
    }

    const isDemo = !process.env.AI_API_KEY;
    const analysis = await analyzeWithGemini(resumeText, jobDescription);

    // Upload file and save analysis to Supabase when configured
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        const supabase = await createClient();
        const filePath = `${userId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

        const { error: uploadError } = await supabase.storage
          .from("resumes")
          .upload(filePath, file, { contentType: file.type, upsert: false });

        if (!uploadError) {
          const { data: resumeRow } = await supabase
            .from("resumes")
            .insert({
              user_id: userId,
              file_name: file.name,
              file_path: filePath,
              file_size: file.size,
              mime_type: file.type,
              is_active: true,
            })
            .select("id")
            .single();

          if (resumeRow) {
            await supabase.from("resume_analyses").insert({
              resume_id: resumeRow.id,
              user_id: userId,
              ...analysis,
              job_description_used: jobDescription ?? null,
              raw_response: analysis,
            });
          }
        }
      }
    } catch (saveErr) {
      console.warn("Database storage optional notice:", saveErr);
    }

    return NextResponse.json({ analysis, demo: isDemo });
  } catch (err: any) {
    console.error("[resume/analyze]", err);
    return NextResponse.json({ error: err.message ?? "Analysis failed" }, { status: 500 });
  }
}
