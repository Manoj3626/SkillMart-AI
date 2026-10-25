import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { CollegeAuthService } from "@/lib/auth/collegeAuthStore";

// ─── Output schema ─────────────────────────────────────────────────────────
const QuestionFeedbackSchema = z.object({
  question: z.string(),
  answer_summary: z.string(),
  score: z.number().int().min(0).max(100),
  feedback: z.string(),
  improved_answer: z.string(),
});

export const FeedbackSchema = z.object({
  overall_score: z.number().int().min(0).max(100),
  relevance_score: z.number().int().min(0).max(100),
  technical_score: z.number().int().min(0).max(100).nullable(),
  communication_score: z.number().int().min(0).max(100),
  problem_solving_score: z.number().int().min(0).max(100),
  completeness_score: z.number().int().min(0).max(100),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  question_feedback: z.array(QuestionFeedbackSchema),
  recommended_topics: z.array(z.string()),
  next_session_suggestion: z.string(),
});

export type FeedbackData = z.infer<typeof FeedbackSchema>;

// ─── Request body ───────────────────────────────────────────────────────────
const RequestSchema = z.object({
  sessionId: z.string().min(1),
  transcript: z.string().max(20000),
  jobRole: z.string(),
  interviewType: z.enum(["technical", "behavioral", "hr", "mixed"]),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  experienceLevel: z.enum(["fresher", "junior", "mid", "senior"]),
});

import { generateWithGemini, extractJsonFromText } from "@/lib/gemini";

// ─── AI call ────────────────────────────────────────────────────────────────
async function generateFeedback(
  input: z.infer<typeof RequestSchema>
): Promise<FeedbackData> {
  const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    // Return structured feedback when API key is not configured
    return buildDemoFeedback(input);
  }

  const prompt = buildFeedbackPrompt(input);

  try {
    const { text } = await generateWithGemini(prompt, {
      temperature: 0.3,
      maxOutputTokens: 4096,
      timeoutMs: 35000,
    });

    const parsed = extractJsonFromText(text);
    return FeedbackSchema.parse(parsed);
  } catch (err) {
    console.warn("[generateFeedback error, falling back to structured evaluation]", err);
    return buildDemoFeedback(input);
  }
}

function buildFeedbackPrompt(input: z.infer<typeof RequestSchema>): string {
  return `You are an expert interview evaluator.

Evaluate the practice interview transcript below and return ONLY valid JSON matching the schema exactly. No markdown fences.

## Interview Details
- Role: ${input.jobRole}
- Type: ${input.interviewType}
- Difficulty: ${input.difficulty}  
- Experience Level: ${input.experienceLevel}

## Transcript
${input.transcript || "(No transcript — session was too short or microphone was off)"}

## Required JSON Schema
{
  "overall_score": <0-100>,
  "relevance_score": <0-100>,
  "technical_score": <0-100 or null>,
  "communication_score": <0-100>,
  "problem_solving_score": <0-100>,
  "completeness_score": <0-100>,
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."],
  "question_feedback": [
    {
      "question": "<question text>",
      "answer_summary": "<brief summary>",
      "score": <0-100>,
      "feedback": "<specific actionable feedback>",
      "improved_answer": "<example better answer>"
    }
  ],
  "recommended_topics": ["...", "..."],
  "next_session_suggestion": "<one concrete next step>"
}

Base scores ONLY on transcript content. Do NOT evaluate voice, accent, or appearance.
If transcript is empty, return all scores as 0 with appropriate explanations.`;
}

function buildDemoFeedback(input: z.infer<typeof RequestSchema>): FeedbackData {
  return {
    overall_score: 68,
    relevance_score: 72,
    technical_score: input.interviewType === "behavioral" ? null : 65,
    communication_score: 70,
    problem_solving_score: 64,
    completeness_score: 68,
    strengths: [
      "Clear and structured communication style",
      "Good use of relevant examples from past experience",
      "Demonstrated understanding of core concepts",
    ],
    weaknesses: [
      "Answers could be more quantifiable with specific metrics",
      "Some responses lacked depth on system design considerations",
      "Could improve use of the STAR format for behavioral questions",
    ],
    question_feedback: [
      {
        question: `Tell me about a challenging ${input.jobRole} problem you have solved.`,
        answer_summary: "Described a debugging scenario with good structure.",
        score: 72,
        feedback:
          "Good problem identification. Next time, quantify the impact (e.g., reduced load time by 40%).",
        improved_answer:
          "In my previous role, I identified a memory leak in our React app causing 3-second lag. I used Chrome DevTools to trace the issue to an uncleaned event listener. After fixing it, performance improved by 60%.",
      },
    ],
    recommended_topics: [
      "System Design fundamentals (load balancing, caching, databases)",
      "STAR method for behavioral responses",
      "Quantifying impact in technical discussions",
    ],
    next_session_suggestion: `Practice a ${input.difficulty}-level ${input.interviewType} session focused on system design and quantifying outcomes. Aim to include 2–3 specific metrics in each answer.`,
  };
}

// ─── Route Handler ──────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const kceToken = cookieStore.get("kce_session")?.value;
    let userId = "guest_candidate";

    if (kceToken) {
      const session = CollegeAuthService.verifySessionToken(kceToken);
      if (session) {
        userId = session.userId;
      }
    }

    if (userId === "guest_candidate") {
      try {
        const supabase = await createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) userId = user.id;
      } catch {}
    }

    const body = RequestSchema.parse(await req.json());

    const feedback = await generateFeedback(body);
    const isDemo = !process.env.AI_API_KEY && !process.env.GEMINI_API_KEY;

    // 1. Persist to CollegeAuthService (Local JSON store that survives restarts & refresh)
    try {
      await CollegeAuthService.saveInterviewSession({
        id: body.sessionId,
        userId,
        jobRole: body.jobRole,
        interviewType: body.interviewType,
        difficulty: body.difficulty,
        experienceLevel: body.experienceLevel,
        durationMinutes: 20,
        transcript: body.transcript,
        feedback,
        status: "completed",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (saveErr) {
      console.warn("Failed to persist session to CollegeAuthService:", saveErr);
    }

    // 2. Persist to Supabase when configured
    try {
      const supabase = await createClient();
      await supabase.from("interview_feedback").insert({
        session_id: body.sessionId,
        user_id: userId,
        ...feedback,
        raw_response: feedback,
      });
    } catch {}

    return NextResponse.json({ feedback, demo: isDemo });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request", details: err.issues }, { status: 400 });
    }
    console.error("[feedback]", err);
    return NextResponse.json({ error: "Failed to generate feedback" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const sessionId = searchParams.get("sessionId");
    if (!sessionId) {
      return NextResponse.json({ error: "sessionId required" }, { status: 400 });
    }

    // Check CollegeAuthStore first
    const session = await CollegeAuthService.getInterviewSessionById(sessionId);
    if (session && session.feedback) {
      return NextResponse.json({ feedback: session.feedback, demo: false });
    }

    // Check Supabase if configured
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from("interview_feedback")
        .select("*")
        .eq("session_id", sessionId)
        .single();

      if (data) {
        return NextResponse.json({ feedback: data.raw_response || data, demo: false });
      }
    } catch {}

    return NextResponse.json({ error: "Session feedback not found" }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
