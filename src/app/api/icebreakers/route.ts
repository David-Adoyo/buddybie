import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { icebreakerTemplates } from "@/data/icebreakers";
import { clientKey, rateLimit } from "@/lib/rate-limit";

// AI icebreaker openers. Uses Claude when configured, else friendly templates.
const MODEL = process.env.MODERATION_MODEL || "claude-opus-4-8";

export async function POST(request: Request) {
  const rl = rateLimit(clientKey(request, "icebreakers"), 30, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429, headers: { "retry-after": String(rl.retryAfter) } },
    );
  }

  const body = (await request.json().catch(() => ({}))) as {
    name?: unknown;
    goal?: unknown;
  };
  const name = typeof body.name === "string" && body.name ? body.name : "there";
  const goal =
    typeof body.goal === "string" && body.goal ? body.goal : "your goals";

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey) {
    try {
      const client = new Anthropic({ apiKey });
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: 300,
        system:
          "You write warm, short, friendly opening messages for Be a Buddy, a community app in the United States. Return ONLY a JSON array of exactly 3 openers, each under 20 words, no prose.",
        messages: [{ role: "user", content: `Name: ${name}\nTheir goal: ${goal}` }],
      });
      const block = response.content.find((b) => b.type === "text");
      const raw = block && "text" in block ? block.text : "";
      const match = raw.match(/\[[\s\S]*\]/);
      if (match) {
        const arr = JSON.parse(match[0]);
        if (Array.isArray(arr) && arr.length) {
          return NextResponse.json({ openers: arr.slice(0, 3).map(String) });
        }
      }
    } catch {
      // fall through to templates
    }
  }
  return NextResponse.json({ openers: icebreakerTemplates(name, goal) });
}
