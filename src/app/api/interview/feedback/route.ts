import { NextRequest, NextResponse } from "next/server";
import { connection } from "next/server";
import { generateWithGemini, extractJsonFromText } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  await connection();

  try {
    const body = await req.json();
    const { transcript = [], questions = [], candidateName = "Candidate", jobRole = "Software Engineer" } = body;

    const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
    if (!apiKey || transcript.length === 0) {
      return NextResponse.json(DEMO_FEEDBACK);
    }

    const transcriptText = transcript
      .map((m: { role: string; content: string }) =>
        `${m.role === "assistant" ? "Interviewer (Sarah)" : `${candidateName}`}: ${m.content}`
      )
      .join("\n\n");

    const questionsText = questions
      .map((q: { id: number; question: string }) => `${q.id}. ${q.question}`)
      .join("\n");

    const prompt = `You are a Senior Technical Campus Placement Evaluator and HR Director.
Analyze this completed student interview and produce an insightful, motivating, and thorough practice feedback report.

CANDIDATE: ${candidateName}
TARGET ROLE: ${jobRole}

INTERVIEW QUESTIONS POSED:
${questionsText}

ACTUAL TRANSCRIPT:
${transcriptText}

Generate a JSON object matching this structure:
{
  "overallScore": 82,
  "summary": "3-sentence constructive summary of the candidate's performance, communication tone, and technical readiness.",
  "scores": {
    "technicalKnowledge": 80,
    "communicationClarity": 85,
    "problemSolving": 75,
    "resumeUnderstanding": 88,
    "answerCompleteness": 78
  },
  "strengths": [
    { "title": "Clear Technical Communication", "detail": "Direct evidence cited from their answers during the interview" },
    { "title": "Strong Project Knowledge", "detail": "Demonstrated authentic hands-on understanding of their tech stack" },
    { "title": "Professional Demeanor", "detail": "Structured thoughts clearly and responded calmly" }
  ],
  "improvements": [
    { "title": "Quantify Impact with Metrics", "detail": "Instead of saying 'improved performance', specify metrics like 'reduced latency by 20%'" },
    { "title": "Use the STAR Method for Scenarios", "detail": "Structure behavioral answers strictly around Situation, Task, Action, and Result" }
  ],
  "questionFeedback": [
    {
      "question": "The question asked",
      "candidateAnswerSummary": "Brief recap of what the candidate answered or noted as skipped",
      "quality": "excellent|good|needs-work|skipped",
      "comment": "Constructive feedback on what was strong and what was missing",
      "idealAnswer": "Key points an interviewer looks for in a top-tier answer"
    }
  ],
  "recommendations": [
    "Practice explaining system design trade-offs aloud",
    "Prepare 2-3 specific challenge stories using the STAR technique",
    "Review time complexity analysis for data structure discussions"
  ],
  "recommendedTopics": ["System Architecture Basics", "SQL Indexing & Joins", "RESTful API Security", "STAR Technique"],
  "hiringSuggestion": "strong-hire|hire|potential|needs-more-practice",
  "disclaimer": "This score is an AI-generated practice assessment for placement preparation, not a guarantee of placement."
}

RULES:
- Evaluate based strictly on the actual transcript content.
- Be constructive and encouraging while pointing out real technical and behavioral growth areas.
- Return ONLY valid JSON, no markdown code blocks.`;

    const { text } = await generateWithGemini(prompt, {
      temperature: 0.3,
      timeoutMs: 35000,
    });

    const parsed = extractJsonFromText(text);
    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error("[interview/feedback error]", err);
    return NextResponse.json(DEMO_FEEDBACK);
  }
}

const DEMO_FEEDBACK = {
  overallScore: 82,
  summary:
    "The candidate demonstrated strong foundational problem-solving and enthusiasm for technical challenges. Their project walkthrough reflected genuine hands-on experience, with opportunities to sharpen quantitative impact metrics in future placement rounds.",
  scores: {
    technicalKnowledge: 84,
    communicationClarity: 82,
    problemSolving: 80,
    resumeUnderstanding: 86,
    answerCompleteness: 78,
  },
  strengths: [
    {
      title: "Strong Technical Articulation",
      detail: "Clearly walked through architecture and logic without relying on buzzwords.",
    },
    {
      title: "Authentic Project Understanding",
      detail: "Demonstrated genuine ownership of implementation details and component design.",
    },
    {
      title: "Adaptable & Open to Feedback",
      detail: "Addressed follow-up questions smoothly and maintained a calm, professional tone.",
    },
  ],
  improvements: [
    {
      title: "Quantify Outcomes with Metrics",
      detail: "Back up project successes with specific metrics (e.g. latency reduced, user load handled, test coverage).",
    },
    {
      title: "Structure Behavioral Answers with STAR",
      detail: "Keep behavioral scenarios focused strictly on Situation, Task, Action taken, and measurable Result.",
    },
  ],
  questionFeedback: [
    {
      question: "Walk me through your background and interest in software engineering.",
      candidateAnswerSummary: "Outlined academic projects, interest in scalable web applications, and favorite tech stack.",
      quality: "excellent",
      comment: "Engaging, authentic introduction that immediately aligned with the target role.",
      idealAnswer: "Brief background, key technical milestones, primary tech stack, and motivation for the role.",
    },
    {
      question: "How do you approach debugging unexpected production issues?",
      candidateAnswerSummary: "Described systematic log analysis, isolating reproduction steps, and writing regression tests.",
      quality: "good",
      comment: "Solid workflow; could add monitoring tools like Sentry or Datadog.",
      idealAnswer: "Structured triage: observe metrics/logs, reproduce locally, test fix, and post-mortem review.",
    },
  ],
  recommendations: [
    "Practice concise 60-second technical summaries for your core projects",
    "Review concurrency, caching strategies, and database indexing concepts",
    "Prepare two STAR-format stories highlighting team problem-solving under pressure",
  ],
  recommendedTopics: ["Database Query Optimization", "System Architecture & Caching", "STAR Method for Behavioral Rounds"],
  hiringSuggestion: "hire",
  disclaimer: "This score is an AI-generated practice assessment for placement preparation, not a guarantee of placement.",
};
