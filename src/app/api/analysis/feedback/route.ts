import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

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

// ─── AI call ────────────────────────────────────────────────────────────────
async function generateFeedback(
  input: z.infer<typeof RequestSchema>
): Promise<FeedbackData> {
  const provider = process.env.AI_PROVIDER ?? "google";
  const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY;
  const model = process.env.AI_MODEL ?? "gemini-3.8-flash";

  if (!apiKey) {
    // Return mock feedback in demo mode
    return buildDemoFeedback(input);
  }

  const prompt = buildFeedbackPrompt(input);

  if (provider === "google") {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(45_000),
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.3,
            maxOutputTokens: 4096,
          },
        }),
      }
    );

    if (!res.ok) {
      throw new Error(`Gemini API error ${res.status}: ${await res.text()}`);
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
    return FeedbackSchema.parse(JSON.parse(text));
  }

  throw new Error(`AI provider "${provider}" not supported in this route.`);
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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = RequestSchema.parse(await req.json());

    const feedback = await generateFeedback(body);
    const isDemo = !process.env.AI_API_KEY;

    // Persist to DB when Supabase is configured
    if (!isDemo) {
      await supabase.from("interview_feedback").insert({
        session_id: body.sessionId,
        user_id: user.id,
        ...feedback,
        raw_response: feedback,
      });
    }

    return NextResponse.json({ feedback, demo: isDemo });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request", details: err.issues }, { status: 400 });
    }
    console.error("[feedback]", err);
    return NextResponse.json({ error: "Failed to generate feedback" }, { status: 500 });
  }
}
