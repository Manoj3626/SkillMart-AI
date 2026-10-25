import { NextRequest, NextResponse } from "next/server";
import { connection } from "next/server";
import { generateWithGemini, extractJsonFromText } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  await connection();

  try {
    const { roleTitle, candidateName, resumeContext, skills = [], projects = [] } = await req.json();

    if (!roleTitle) {
      return NextResponse.json({ error: "Missing roleTitle" }, { status: 400 });
    }

    const prompt = `You are a Senior Technical HR Interviewer conducting a campus placement interview for the role of "${roleTitle}".
The candidate's name is "${candidateName || "Candidate"}".

CANDIDATE PROFILE:
${resumeContext || `Skills: ${skills.join(", ")}. Projects: ${projects.join(", ")}`}

Generate 6 personalized, realistic campus placement interview questions specifically tailored to:
1. The selected target role: "${roleTitle}"
2. The candidate's actual projects, programming languages, and tools

Return a JSON object with this EXACT structure:
{
  "questions": [
    {
      "id": 1,
      "question": "A personalized opening question asking the candidate to introduce themselves and discuss what excites them about the ${roleTitle} role.",
      "category": "warmup",
      "followUpHints": ["Ask about their primary motivation and project passions"]
    },
    {
      "id": 2,
      "question": "A technical question evaluating core skills directly needed for ${roleTitle} based on what they listed.",
      "category": "technical",
      "followUpHints": ["Ask for specific examples and handling edge cases"]
    },
    {
      "id": 3,
      "question": "A deep-dive question into one of their listed projects (${projects.slice(0, 2).join(" or ") || "their primary project"}), asking about their architectural choices and individual contributions.",
      "category": "project",
      "followUpHints": ["Probe their individual contribution vs team effort"]
    },
    {
      "id": 4,
      "question": "A real-world engineering scenario / problem-solving question appropriate for a ${roleTitle}.",
      "category": "problem-solving",
      "followUpHints": ["Ask about trade-offs and performance"]
    },
    {
      "id": 5,
      "question": "A behavioral question on teamwork, deadline pressure, or adapting to new frameworks.",
      "category": "behavioral",
      "followUpHints": ["Check for the STAR structure"]
    },
    {
      "id": 6,
      "question": "A forward-looking question about how they stay current with developments in ${roleTitle} and their first-year goals.",
      "category": "closing",
      "followUpHints": ["Assess learning agility"]
    }
  ]
}

Return ONLY valid JSON without markdown formatting.`;

    const { text } = await generateWithGemini(prompt, { temperature: 0.4, timeoutMs: 25000 });
    const parsed = extractJsonFromText(text);

    return NextResponse.json({
      questions: Array.isArray(parsed.questions) && parsed.questions.length > 0 ? parsed.questions : [],
    });
  } catch (err: any) {
    console.error("[generate-questions error]", err);
    return NextResponse.json({ error: err.message || "Failed to generate questions" }, { status: 500 });
  }
}
