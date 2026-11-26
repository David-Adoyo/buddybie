"use server";

import { z } from "zod";
import { sql } from "@/lib/db";
import { isDatabaseConfigured } from "@/lib/env";

const waitlistSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email(),
  phone: z.string().trim().max(32).optional().or(z.literal("")),
  circle: z.string().trim().max(60).optional().or(z.literal("")),
});

export type WaitlistResult =
  | { status: "success"; demo: boolean }
  | { status: "error"; message: string };

export async function joinWaitlist(
  input: z.infer<typeof waitlistSchema>,
): Promise<WaitlistResult> {
  const parsed = waitlistSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "error", message: "invalid" };
  }

  if (!isDatabaseConfigured || !sql) {
    // Demo mode — nothing to persist, but the flow is fully previewable.
    return { status: "success", demo: true };
  }

  try {
    const { name, email, phone, circle } = parsed.data;
    await sql`
      INSERT INTO waitlist (name, email, phone, circle)
      VALUES (${name}, ${email}, ${phone || null}, ${circle || null})
      ON CONFLICT (email) DO NOTHING
    `;
    return { status: "success", demo: false };
  } catch {
    return { status: "error", message: "failed" };
  }
}
