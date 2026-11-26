// Demo billing store (client-side). Mirrors the Stage 7 subscriptions/payments
// tables; swaps to Supabase (activated by the webhook) once auth is real.
import type { CircleId } from "@/data/circles";

export interface DemoSubscription {
  planCode: string;
  interval: "monthly" | "annual";
  startedAt: number;
}
export interface DemoPayment {
  reference: string;
  planCode: string;
  planName: string;
  amountUsd: number;
  method: string;
  at: number;
}

const K = { subs: "bab_subscriptions", pays: "bab_payments" };

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export function getSubscriptions(): DemoSubscription[] {
  return read<DemoSubscription[]>(K.subs, []);
}
export function isSubscribed(planCode: string): boolean {
  return getSubscriptions().some((s) => s.planCode === planCode);
}
export function subscribe(planCode: string, interval: "monthly" | "annual") {
  const subs = getSubscriptions().filter((s) => s.planCode !== planCode);
  subs.push({ planCode, interval, startedAt: Date.now() });
  write(K.subs, subs);
}
export function cancel(planCode: string) {
  write(K.subs, getSubscriptions().filter((s) => s.planCode !== planCode));
}

export function getPayments(): DemoPayment[] {
  return read<DemoPayment[]>(K.pays, []);
}
export function recordPayment(p: DemoPayment) {
  write(K.pays, [p, ...getPayments()]);
}

/** Whether the member has premium covering a Circle (direct plan or a bundle). */
export function hasPremiumForCircle(circleId: CircleId, planCode?: string): boolean {
  const subs = getSubscriptions();
  if (subs.some((s) => s.planCode === "all-access" || s.planCode === "all-access-gold")) {
    return true;
  }
  if (planCode && subs.some((s) => s.planCode === planCode)) return true;
  return subs.some((s) => s.planCode.includes(circleId));
}
