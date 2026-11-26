import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// Server-enforced free-tier limit: 5 new buddy suggestions a day. The counter
// lives in an httpOnly, date-keyed cookie so the client cannot bump it.
const FREE_LIMIT = 5;
const COOKIE = "bab_sugg";

function today() {
  return new Date().toISOString().slice(0, 10);
}

async function used(): Promise<number> {
  const store = await cookies();
  try {
    const parsed = JSON.parse(store.get(COOKIE)?.value ?? "{}");
    return parsed.date === today() ? Number(parsed.used) || 0 : 0;
  } catch {
    return 0;
  }
}

export async function GET() {
  const u = await used();
  return NextResponse.json({
    limit: FREE_LIMIT,
    used: u,
    remaining: Math.max(0, FREE_LIMIT - u),
  });
}

export async function POST() {
  const u = await used();
  if (u >= FREE_LIMIT) {
    return NextResponse.json({ limit: FREE_LIMIT, used: u, remaining: 0, allowed: false });
  }
  const next = u + 1;
  const res = NextResponse.json({
    limit: FREE_LIMIT,
    used: next,
    remaining: FREE_LIMIT - next,
    allowed: true,
  });
  res.cookies.set(COOKIE, JSON.stringify({ date: today(), used: next }), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
  return res;
}
