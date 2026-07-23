import Anthropic from "@anthropic-ai/sdk";

export async function summariseNotes(text: string) {
  if (text.length < 500) return null;

  const ai = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const msg = await ai.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 300,
    messages: [
      {
        role: "user",
        content: `Identify concepts hard to grasp here and explain them... \n\n<notes>\n${text.slice(0, 40000)}\n</notes>`,
      },
    ],
  });
  const summary = msg.content
    .filter((s) => s.type === "text")
    .map((s) => s.text)
    .join("")
    .trim();
  return summary || null;
}
