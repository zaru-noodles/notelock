import { GoogleGenAI } from "@google/genai";

export async function summariseNotes(text: string) {
  if (text.length < 500) return null;

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const msg = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: `Summarise these lecture notes in 2-3 sentences, so a student can tell at a glance what topics they cover. Reply with the summary only, no preamble.\n\n<notes>\n${text.slice(0, 40_000)}\n</notes>`,
    config: {
      maxOutputTokens: 300,
      temperature: 0.3,
    },
  });

  return msg.text?.trim() || null;
}
