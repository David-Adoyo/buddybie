import { NextResponse } from "next/server";
import { planByCode } from "@/data/plans";
import { getPaymentProvider, type PaymentMethod } from "@/lib/payments/provider";
import { clientKey, rateLimit } from "@/lib/rate-limit";

// Starts a payment for a plan. Amount comes from the plans data (never the
// client), so prices can't be tampered with. Returns a reference the webhook
// later confirms.
export async function POST(request: Request) {
  const rl = rateLimit(clientKey(request, "pay"), 10, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429, headers: { "retry-after": String(rl.retryAfter) } },
    );
  }

  const body = (await request.json().catch(() => ({}))) as {
    planCode?: unknown;
    interval?: unknown;
    method?: unknown;
    phone?: unknown;
  };
  const plan = typeof body.planCode === "string" ? planByCode(body.planCode) : undefined;
  if (!plan) return NextResponse.json({ error: "unknown plan" }, { status: 400 });

  const interval = body.interval === "annual" ? "annual" : "monthly";
  const amountUsd = interval === "annual" ? (plan.annual ?? plan.monthly * 12) : plan.monthly;
  const method = (["stripe", "paypal", "ach"].includes(String(body.method))
    ? body.method
    : "stripe") as PaymentMethod;

  const reference = `BAB-${plan.code}-${Date.now().toString(36).toUpperCase()}`;
  const provider = getPaymentProvider(method);
  const result = await provider.initiate({
    planCode: plan.code,
    amountUsd,
    reference,
    phone: typeof body.phone === "string" ? body.phone : undefined,
  });

  return NextResponse.json({
    ...result,
    amountUsd,
    planName: plan.name,
    interval,
    method,
  });
}
