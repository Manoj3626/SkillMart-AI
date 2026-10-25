import { NextRequest, NextResponse } from "next/server";
import { connection } from "next/server";
import { generateWithGemini } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  await connection();

  try {
    const body = await req.json();
    const {
      messages = [],        // full conversation history [{role, content}]
      currentQuestion = "", // the question being answered
      nextQuestion = "",    // the next question to ask
      isFinalQuestion = false, // whether this was the last question
      resumeContext = "",   // brief resume summary
      questionIndex = 0,    // 0-based index
      totalQuestions = 5,   // total number of questions
    } = body;

    const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        reply: getDemoReply(questionIndex, nextQuestion, isFinalQuestion),
      });
    }

    const systemInstruction = buildSystemPrompt(resumeContext, totalQuestions);

    // Last message is the candidate's answer
    const lastMessage = messages[messages.length - 1];
    const userInput = lastMessage?.content || "";

    const recentHistory = messages.slice(-6, -1);
    const historyText = recentHistory
      .map((m: { role: string; content: string }) => `${m.role === "assistant" ? "Interviewer" : "Candidate"}: ${m.content}`)
      .join("\n");

    let taskPrompt = "";
    if (isFinalQuestion || questionIndex + 1 >= totalQuestions) {
      taskPrompt = `This was the FINAL question (${questionIndex + 1} of ${totalQuestions}) of the placement interview.
1. Acknowledge what the candidate just answered in 1-2 encouraging sentences, noting a specific detail from their response.
2. Conclude the interview warmly by saying that all questions are completed and you are ready to review the final performance evaluation report.
3. Keep total response under 3 sentences.`;
    } else if (nextQuestion) {
      taskPrompt = `The candidate just answered Question ${questionIndex + 1} of ${totalQuestions}.
1. Acknowledge what the candidate answered in 1-2 encouraging sentences, mentioning a specific point they made.
2. Seamlessly transition and ask the next question: "${nextQuestion}"
3. Keep the total response natural, encouraging, and under 3 to 4 sentences.`;
    } else {
      taskPrompt = `Provide a concise response (under 3 sentences) acknowledging their answer and prompting them appropriately.`;
    }

    const prompt = `CANDIDATE RESUME CONTEXT:
${resumeContext || "Technical campus placement candidate"}

INTERVIEW PROGRESS:
Question ${questionIndex + 1} of ${totalQuestions}
Question Asked: "${currentQuestion}"

RECENT DIALOGUE:
${historyText || "(Starting conversation)"}

CANDIDATE JUST ANSWERED:
"${userInput}"

TASK:
${taskPrompt}`;

    const { text: reply } = await generateWithGemini(prompt, {
      systemInstruction,
      temperature: 0.6,
      maxOutputTokens: 200,
      timeoutMs: 15000,
    });

    return NextResponse.json({ reply: reply.trim() });
  } catch (err: any) {
    console.error("[interview/chat error]", err);
    return NextResponse.json({
      reply: "Thank you for explaining that. Let's proceed to the next question.",
    });
  }
}

function buildSystemPrompt(resumeContext: string, totalQuestions: number) {
  return `You are Sarah Jenkins, a friendly, professional Senior Technical HR Interviewer conducting a college campus placement practice interview.

Your goal is to conduct an encouraging, realistic, and insightful interview.
RULES:
1. Speak in a warm, professional, articulate tone.
2. Listen to the candidate's exact answer and tailor your reaction directly to what they said.
3. Keep responses concise (2 to 3 sentences maximum) because you are speaking aloud to the student in real time.
4. Never list bullet points or markdown headers. Speak in natural conversational prose.`;
}

function getDemoReply(questionIndex: number, nextQuestion?: string, isFinalQuestion?: boolean) {
  if (isFinalQuestion) {
    return "Thank you for sharing that perspective! That concludes all our placement interview questions today. You did an excellent job, and I am now compiling your performance evaluation report.";
  }
  if (nextQuestion) {
    return `Thank you for explaining that. Let's move on to our next question: ${nextQuestion}`;
  }
  const replies = [
    "Thank you for that clear introduction! It's great to understand your background. Let's dive into your technical skills next.",
    "That is an interesting technical choice. Could you briefly explain what trade-offs you considered when implementing that?",
    "Handling challenges like that is a key part of software engineering. Thanks for explaining your thought process. Let's continue.",
    "That shows good problem-solving ability. Let's move ahead to the next question.",
    "Effective collaboration and clear communication make a huge difference in engineering teams. Good example.",
  ];
  return replies[Math.min(questionIndex, replies.length - 1)];
}
