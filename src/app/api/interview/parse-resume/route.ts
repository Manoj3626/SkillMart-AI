import { NextRequest, NextResponse } from "next/server";
import { connection } from "next/server";

// ── Worker-free PDF text extraction using pdfjs-dist legacy build ──────────
async function extractPdfText(arrayBuffer: ArrayBuffer): Promise<string> {
  const path = await import("path");
  const { pathToFileURL } = await import("url");

  // Point workerSrc to the actual worker file — this prevents the "fake worker" error
  const workerPath = path.join(
    process.cwd(),
    "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs"
  );
  const workerSrc = pathToFileURL(workerPath).href;

  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

  const uint8 = new Uint8Array(arrayBuffer);
  const doc = await pdfjsLib.getDocument({ data: uint8 }).promise;

  const pages: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: any) => ("str" in item ? item.str : ""))
      .join(" ");
    pages.push(pageText);
  }

  return pages.join("\n");
}

export async function POST(req: NextRequest) {
  await connection();

  try {
    const formData = await req.formData();
    const file = formData.get("resume") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // ── Extract text from file ──────────────────────────────────────
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    let resumeText = "";

    const fileName = file.name.toLowerCase();

    if (fileName.endsWith(".pdf")) {
      resumeText = await extractPdfText(bytes);

    } else if (fileName.endsWith(".docx") || fileName.endsWith(".doc")) {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      resumeText = result.value;
    } else if (fileName.endsWith(".txt")) {
      resumeText = buffer.toString("utf-8");
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload PDF, DOCX, or TXT." },
        { status: 400 }
      );
    }

    if (!resumeText.trim()) {
      return NextResponse.json(
        { error: "Could not extract text from resume. Please try a different format." },
        { status: 400 }
      );
    }

    // ── Use Gemini to analyze resume and generate questions ───────────
    const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;

    if (!apiKey) {
      // Demo mode: return mock questions if no API key
      return NextResponse.json({
        resumeText: resumeText.slice(0, 500) + "...",
        questions: DEMO_QUESTIONS,
        candidateName: "Candidate",
        skills: ["JavaScript", "React", "Node.js"],
        demo: true,
      });
    }

    const { generateWithGemini, extractJsonFromText } = await import("@/lib/gemini");

    const prompt = `You are an expert technical HR interviewer and career placement architect.
Carefully analyze this candidate's actual resume and generate an accurate structured interview profile and role recommendations.

RESUME CONTENT:
"""
${resumeText.slice(0, 5000)}
"""

Extract the candidate's actual details, recommend the 3 most suitable job roles based on their resume, and generate 6 tailored interview questions for their best-fit role.

Return a JSON object with this EXACT structure:
{
  "candidateName": "Full name from resume, or 'Candidate' if not found",
  "education": "Degree, college name, or graduation year if found",
  "skills": ["List 6-10 primary skills, languages, and frameworks actually mentioned in the resume"],
  "projects": ["List 2-4 project names or key initiatives mentioned in the resume"],
  "recommendedRoles": [
    {
      "title": "Best-fit role title (e.g. Full Stack Developer, Frontend Engineer, ServiceNow Developer, QA Automation Engineer)",
      "matchScore": 94,
      "matchReason": "Clear 1-sentence reason why this candidate's background matches this role",
      "matchingSkills": ["Skills from resume matching this role"],
      "skillsToImprove": ["1-2 skills or concepts they should sharpen for top-tier placement"],
      "suggestedInterviewFocus": "Key technical areas to probe for this role"
    },
    {
      "title": "Second best-fit role title",
      "matchScore": 86,
      "matchReason": "Why this secondary role is a strong match",
      "matchingSkills": ["Relevant skills"],
      "skillsToImprove": ["Skills to sharpen"],
      "suggestedInterviewFocus": "Key focus area"
    },
    {
      "title": "Third suitable role title",
      "matchScore": 78,
      "matchReason": "Why this role is an alternative career path",
      "matchingSkills": ["Relevant skills"],
      "skillsToImprove": ["Skills to sharpen"],
      "suggestedInterviewFocus": "Key focus area"
    }
  ],
  "questions": [
    {
      "id": 1,
      "question": "A personalized opening question welcoming the candidate by name, asking them to introduce themselves and discuss their interest in the role and their experience with [primary skill from resume].",
      "category": "warmup",
      "followUpHints": ["Ask about their primary motivation and favorite tech stack"]
    },
    {
      "id": 2,
      "question": "A technical question specifically about [specific skill/framework found in their resume, e.g. React, Python, Java, SQL, AWS, ServiceNow].",
      "category": "technical",
      "followUpHints": ["Ask about how they handle edge cases or performance optimization"]
    },
    {
      "id": 3,
      "question": "A deep-dive question about [specific project name from resume], asking what their exact role was, what architecture they chose, and what was the toughest bug they solved.",
      "category": "project",
      "followUpHints": ["Probe their individual contribution vs team effort"]
    },
    {
      "id": 4,
      "question": "A problem-solving scenario question tailored to their skills in [technology from resume].",
      "category": "problem-solving",
      "followUpHints": ["Ask for their trade-off analysis"]
    },
    {
      "id": 5,
      "question": "A behavioral placement question (e.g., handling tight deadlines, disagreeing with a team member, or learning a new tech stack quickly).",
      "category": "behavioral",
      "followUpHints": ["Use the STAR method: Situation, Task, Action, Result"]
    },
    {
      "id": 6,
      "question": "A closing question about their career aspirations, how they stay updated with tech trends, and what they hope to achieve in their first year.",
      "category": "closing",
      "followUpHints": ["Ask about their willingness to adapt and learn new domains"]
    }
  ]
}

RULES:
- Questions MUST mention real skills, projects, and technologies found in the candidate's resume.
- Recommend roles that genuinely reflect their experience (e.g. if resume mentions ServiceNow, recommend ServiceNow Developer; if Frontend, recommend Frontend Developer).
- Do NOT make up companies, projects, or degrees that are not in the text.
- Return ONLY valid JSON, without any markdown formatting or extra commentary.`;

    const { text } = await generateWithGemini(prompt, { temperature: 0.4, timeoutMs: 30000 });
    const parsed = extractJsonFromText(text);

    const defaultRole = parsed.recommendedRoles?.[0]?.title || parsed.jobRole || "Software Engineer";

    return NextResponse.json({
      resumeText: resumeText.slice(0, 3000),
      candidateName: parsed.candidateName || "Candidate",
      jobRole: defaultRole,
      recommendedRoles: Array.isArray(parsed.recommendedRoles) && parsed.recommendedRoles.length > 0 ? parsed.recommendedRoles : [
        {
          title: defaultRole,
          matchScore: 92,
          matchReason: "Direct match with core programming and project background.",
          matchingSkills: Array.isArray(parsed.skills) ? parsed.skills.slice(0, 4) : ["Software Development"],
          skillsToImprove: ["System Architecture", "Performance Optimization"],
          suggestedInterviewFocus: "Core technical implementations and project architecture"
        }
      ],
      education: parsed.education || "Undergraduate / Graduate",
      skills: Array.isArray(parsed.skills) && parsed.skills.length > 0 ? parsed.skills : ["Software Development", "Problem Solving", "Data Structures"],
      projects: Array.isArray(parsed.projects) ? parsed.projects : [],
      questions: Array.isArray(parsed.questions) && parsed.questions.length > 0 ? parsed.questions : DEMO_QUESTIONS,
      demo: false,
    });
  } catch (err: any) {
    console.error("[parse-resume error]", err);
    return NextResponse.json(
      { error: err.message || "Failed to analyze resume. Please verify the document format and try again." },
      { status: 500 }
    );
  }
}

const DEMO_QUESTIONS = [
  {
    id: 1,
    question: "Tell me about yourself and what brought you to this field.",
    category: "behavioral",
    followUpHints: ["Ask about specific project they're most proud of"],
  },
  {
    id: 2,
    question: "What programming languages and technologies are you most comfortable with?",
    category: "technical",
    followUpHints: ["Ask for a specific example using that technology"],
  },
  {
    id: 3,
    question: "Describe a challenging project you worked on. What was your role and what obstacles did you face?",
    category: "project",
    followUpHints: ["How did they solve the problem? What would they do differently?"],
  },
  {
    id: 4,
    question: "How do you approach debugging a complex issue in your code?",
    category: "technical",
    followUpHints: ["Ask for a real example"],
  },
  {
    id: 5,
    question: "Tell me about a time you had to learn a new technology quickly. How did you handle it?",
    category: "behavioral",
    followUpHints: ["Focus on learning strategy and adaptability"],
  },
  {
    id: 6,
    question: "How do you ensure the quality of your code?",
    category: "technical",
    followUpHints: ["Testing, code reviews, documentation practices"],
  },
  {
    id: 7,
    question: "Describe a situation where you had to collaborate with a difficult team member.",
    category: "behavioral",
    followUpHints: ["Look for communication skills and empathy"],
  },
  {
    id: 8,
    question: "Where do you see yourself professionally in the next 2-3 years?",
    category: "experience",
    followUpHints: ["Alignment with growth and learning goals"],
  },
];
