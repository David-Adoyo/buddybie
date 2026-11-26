import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON." }, { status: 400 });
  }

  const { email, circles, frequency } = body as {
    email?: string;
    circles?: string[];
    frequency?: string;
  };

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json(
      { ok: false, message: "A valid email address is required." },
      { status: 400 },
    );
  }

  const safeCircles = Array.isArray(circles) ? circles : [];
  const safeFrequency = ["instant", "weekly", "monthly"].includes(frequency ?? "")
    ? frequency
    : "weekly";

  // Demo mode: in production wire up an email service (Resend, SendGrid, etc.)
  // and store the subscription in the notifications_subscriptions table.
  return NextResponse.json({
    ok: true,
    email,
    circles: safeCircles,
    frequency: safeFrequency,
    message: `You are subscribed. We will send ${safeFrequency} event reminders to ${email}.`,
  });
}
