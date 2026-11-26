import { NextResponse } from "next/server";

// Payment provider callback. IDEMPOTENT: a provider may retry the same callback,
// so we de-duplicate on the reference and only act once. In production the
// dedupe is the unique `payments.idempotency_key` constraint written via the
// service role (which also activates the subscription); here we keep an
// in-memory set so the contract is demonstrable in demo.
const processed = new Set<string>();

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    reference?: unknown;
    status?: unknown;
  };
  const reference = typeof body.reference === "string" ? body.reference : "";
  if (!reference) return NextResponse.json({ error: "no reference" }, { status: 400 });

  if (processed.has(reference)) {
    return NextResponse.json({ ok: true, duplicate: true });
  }
  processed.add(reference);

  // TODO(stage-7+): with the service role, upsert the payment by
  // idempotency_key, mark it succeeded/failed, and flip the subscription to
  // active with renews_at. The unique key makes the DB the real idempotency gate.
  const status = body.status === "failed" ? "failed" : "succeeded";
  return NextResponse.json({ ok: true, reference, status });
}
