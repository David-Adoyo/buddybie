import { quizQuestions } from "@/data/quiz";
import type { Member } from "@/lib/types";

// Deterministic AI-Buddy-Matcher scoring: combines shared goals, personality
// traits (from the quiz), and area into a 0–100 score plus structured reasons
// the UI turns into a one-line "why you match". (LLM-ranked matching is parked.)
export type ReasonKind = "goal" | "trait" | "area";
export interface MatchReason {
  kind: ReasonKind;
  value: string;
}
export interface MatchResult {
  score: number;
  reasons: MatchReason[];
}

const STOPWORDS = new Set([
  "want", "with", "this", "that", "from", "into", "your", "their", "more",
  "find", "start", "join", "make", "grow", "have", "about", "year", "month",
  "week", "some", "the", "and", "for", "get", "new", "run", "first",
]);

function keywords(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3 && !STOPWORDS.has(w)),
  );
}

/** Average the 1–5 quiz answers into a per-dimension trait vector. */
export function computeTraits(quiz: Record<string, number>): Record<string, number> {
  const sums: Record<string, { total: number; n: number }> = {};
  for (const q of quizQuestions) {
    const a = quiz[q.id];
    if (!a) continue;
    sums[q.dimension] ??= { total: 0, n: 0 };
    sums[q.dimension].total += a;
    sums[q.dimension].n += 1;
  }
  const traits: Record<string, number> = {};
  for (const [dim, { total, n }] of Object.entries(sums)) {
    traits[dim] = total / n;
  }
  return traits;
}

export interface MeProfile {
  goals: string[];
  traits: Record<string, number>;
  area: string;
}

export function scoreCandidate(
  me: MeProfile,
  candidate: Member,
  candidateGoals: string[],
): MatchResult {
  const reasons: MatchReason[] = [];

  // Goals (0–40): shared meaningful keywords.
  const mine = keywords(me.goals.join(" "));
  const theirs = keywords(candidateGoals.join(" "));
  const shared = [...mine].filter((w) => theirs.has(w));
  const goalScore = Math.min(40, shared.length * 20);
  shared.slice(0, 2).forEach((w) => reasons.push({ kind: "goal", value: w }));

  // Traits (0–40): closeness across the six quiz dimensions.
  const cTraits = candidate.traits ?? {};
  const dims = Object.keys(me.traits);
  let traitScore = 20; // neutral default when we have no quiz data
  if (dims.length > 0) {
    let totalDiff = 0;
    let n = 0;
    for (const dim of dims) {
      if (cTraits[dim] == null) continue;
      totalDiff += Math.abs(me.traits[dim] - cTraits[dim]);
      n += 1;
      if (me.traits[dim] >= 4 && cTraits[dim] >= 4) {
        reasons.push({ kind: "trait", value: dim });
      }
    }
    if (n > 0) traitScore = Math.round(40 * (1 - totalDiff / n / 4));
  }

  // Area (0–20): same neighbourhood.
  const myArea = me.area.split(":")[1] ?? me.area;
  let areaScore = 0;
  if (myArea && candidate.area && myArea === candidate.area) {
    areaScore = 20;
    reasons.push({ kind: "area", value: candidate.area });
  }

  const score = Math.max(5, Math.min(100, goalScore + traitScore + areaScore));
  return { score, reasons: reasons.slice(0, 3) };
}
