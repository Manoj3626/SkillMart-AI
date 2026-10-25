import { NextRequest, NextResponse } from "next/server";
import { connection } from "next/server";

// Convert 24kHz 16-bit mono PCM to valid RIFF/WAV format
function pcmToWav(pcmBase64: string, sampleRate = 24000): Buffer {
  const pcmBuffer = Buffer.from(pcmBase64, "base64");
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcmBuffer.length;
  const header = Buffer.alloc(44);

  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16); // Subchunk1Size
  header.writeUInt16LE(1, 20);  // PCM format
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmBuffer]);
}

export async function POST(req: NextRequest) {
  await connection();

  try {
    const { text } = await req.json();
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing API key" }, { status: 500 });
    }

    // Clean text for speech synthesis
    const cleanText = text
      .replace(/[*#_`]/g, "")
      .replace(/\[Skipped\]/g, "Question skipped.")
      .trim()
      .slice(0, 800); // Reasonable limit for real-time speech

    // Try Gemini audio with a tight timeout to keep conversation fast
    const ttsModel = "gemini-2.5-flash-preview-tts";
    let wavBuffer: Buffer | null = null;
    let lastError: any = null;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${ttsModel}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: cleanText }] }],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: "Kore", // Warm, professional female voice for HR recruiter
                },
              },
            },
          },
        }),
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const base64Audio = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
          wavBuffer = pcmToWav(base64Audio, 24000);
        }
      } else {
        const errBody = await res.text();
        console.warn(`[TTS] ${ttsModel} returned ${res.status}: ${errBody.slice(0, 100)}`);
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`[TTS] notice:`, err.message);
    }

    if (!wavBuffer) {
      return NextResponse.json(
        { error: "TTS model audio not ready, client should use browser synthesis" },
        { status: 503 }
      );
    }

    return new Response(new Uint8Array(wavBuffer), {
      status: 200,
      headers: {
        "Content-Type": "audio/wav",
        "Content-Length": wavBuffer.length.toString(),
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err: any) {
    console.error("[TTS endpoint error]", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
