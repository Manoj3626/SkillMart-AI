import { GoogleGenerativeAI } from "@google/generative-ai";

// Pool of verified fast models that work with standard free/starter API keys
const MODEL_CANDIDATES = [
  process.env.AI_MODEL || "gemini-3.1-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-3.5-flash-lite",
  "gemini-3.5-flash",
  "gemini-flash-latest",
  "gemini-flash-lite-latest",
].filter(Boolean) as string[];

export interface GenerateOptions {
  systemInstruction?: string;
  temperature?: number;
  maxOutputTokens?: number;
  timeoutMs?: number;
}

/**
 * Robust Gemini content generator that automatically falls back across active models
 * if one encounters 503 high demand, 429 rate limit, or 404 version retirement.
 */
export async function generateWithGemini(
  prompt: string,
  options: GenerateOptions = {}
): Promise<{ text: string; modelUsed: string }> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in .env.local");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  let lastError: any = null;

  for (const modelName of MODEL_CANDIDATES) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: options.systemInstruction,
        generationConfig: {
          temperature: options.temperature ?? 0.7,
          maxOutputTokens: options.maxOutputTokens,
        },
      });

      // Wrap in a promise with timeout
      const timeoutMs = options.timeoutMs ?? 25000;
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Gemini request timeout (${timeoutMs}ms)`)), timeoutMs)
      );

      const result = await Promise.race([
        model.generateContent(prompt),
        timeoutPromise,
      ]);

      const text = result.response.text().trim();
      return { text, modelUsed: modelName };
    } catch (err: any) {
      console.warn(`[Gemini] Model ${modelName} failed: ${err.message || err}. Trying next candidate...`);
      lastError = err;
      // Continue to next candidate model
    }
  }

  throw new Error(
    `All Gemini models failed. Last error: ${lastError?.message || lastError}`
  );
}

/**
 * Helper to safely extract JSON from Gemini text (strips markdown code blocks)
 */
export function extractJsonFromText(rawText: string): any {
  let cleaned = rawText.trim();
  // Strip ```json ... ``` or ``` ... ```
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
  }
  return JSON.parse(cleaned);
}
