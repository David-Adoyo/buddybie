import Anthropic from "@anthropic-ai/sdk";
import { scanForScam } from "./scam";
import { scanForExplicit } from "./explicit";

// Server-side AI pre-screen for text (messages, goals). Uses Claude when
// ANTHROPIC_API_KEY is set, otherwise falls back to the local heuristic so the
// app works in demo mode. Model defaults to Opus 4.8 (override via env).
export interface ScreenResult {
  allowed: boolean;
  severity: "low" | "medium" | "high";
  labels: string[];
  reason: string;
  usedAI: boolean;
}

const MODEL = process.env.MODERATION_MODEL || "claude-opus-4-8";

const SYSTEM = `You are a content-safety pre-screen for Buddybie, a community app.
Classify the user's text for anything that breaks community guidelines:
- explicit sexual or nude content (ZERO TOLERANCE — always high severity, always blocked regardless of context)
- solicitation of nude images or sexual favours
- harassment, hate speech or threats
- scams or money requests (Venmo, Zelle, Cash App, gift cards, wire transfers, cryptocurrency)
- pressure to move off-app quickly (WhatsApp/Telegram/phone/email)
- self-harm
Respond with ONLY a JSON object, no prose, in this exact shape:
{"allowed": boolean, "severity": "low"|"medium"|"high", "labels": string[], "reason": string}
Set allowed=false for medium or high severity. Explicit/sexual content is ALWAYS high severity and ALWAYS blocked. Keep reason short and user-facing.`;

export async function screenText(
  text: string,
  kind: "message" | "goal",
): Promise<ScreenResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return heuristic(text);

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 400,
      system: SYSTEM,
      messages: [{ role: "user", content: `[${kind}] ${text.slice(0, 4000)}` }],
    });
    const textBlock = response.content.find((b) => b.type === "text");
    const raw = textBlock && "text" in textBlock ? textBlock.text : "";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return heuristic(text);
    const parsed = JSON.parse(match[0]) as Partial<ScreenResult>;
    return {
      allowed: parsed.allowed ?? true,
      severity: parsed.severity ?? "low",
      labels: parsed.labels ?? [],
      reason: parsed.reason ?? "",
      usedAI: true,
    };
  } catch {
    return heuristic(text);
  }
}

function heuristic(text: string): ScreenResult {
  const explicit = scanForExplicit(text);
  if (explicit.flagged) {
    return {
      allowed: false,
      severity: "high",
      labels: ["explicit"],
      reason:
        "Explicit sexual content is not allowed on Buddybie. Please keep all conversations respectful and appropriate.",
      usedAI: false,
    };
  }

  const scam = scanForScam(text);
  if (!scam.flagged) {
    return { allowed: true, severity: "low", labels: [], reason: "", usedAI: false };
  }
  const labels = scam.reasons.map((r) =>
    r === "money" ? "scam" : r === "offapp" ? "off-app" : "urgency",
  );
  return {
    allowed: false,
    severity: scam.reasons.includes("money") ? "high" : "medium",
    labels,
    reason:
      "This looks like it may ask for money or to move off-app. Please keep conversations on Buddybie and never send money.",
    usedAI: false,
  };
}
