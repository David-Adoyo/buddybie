import { NextResponse } from "next/server";
import { screenText } from "@/lib/moderation/screen";
import { clientKey, rateLimit } from "@/lib/rate-limit";

// Server-only AI pre-screen endpoint. The LLM key never reaches the client.
export async function POST(request: Request) {
  const rl = rateLimit(clientKey(request, "moderate"), 20, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429, headers: { "retry-after": String(rl.retryAfter) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  const { text, kind } = (body ?? {}) as { text?: unknown; kind?: unknown };
  if (typeof text !== "string" || text.trim().length === 0) {
    return NextResponse.json({ error: "text required" }, { status: 400 });
  }
  const result = await screenText(
    text,
    kind === "message" ? "message" : "goal",
  );
  return NextResponse.json(result);
}
