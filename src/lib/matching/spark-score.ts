import type { SparkSingle, FaithImportance, Intent } from "@/data/spark-seed";

// Spark matching: relationship intent + faith/values + area. Faith weight scales
// with how important faith is to the member (the "Spark: Faith" filter is applied
// separately, in the discover view).
export type SparkReasonKind = "intent" | "faith" | "area";
export interface SparkReason {
  kind: SparkReasonKind;
  value: string;
}
export interface SparkScore {
  score: number;
  reasons: SparkReason[];
}

export interface SparkMe {
  intent: Intent;
  faith: string;
  faithImportance: FaithImportance;
  area: string;
}

export function scoreSpark(me: SparkMe, candidate: SparkSingle): SparkScore {
  const reasons: SparkReason[] = [];
  let score = 10;

  if (me.intent === candidate.intent) {
    score += 40;
    reasons.push({ kind: "intent", value: candidate.intent });
  }

  const sameFaith = me.faith && me.faith === candidate.faith;
  if (me.faithImportance === "very") {
    if (sameFaith) {
      score += 30;
      reasons.push({ kind: "faith", value: candidate.faith });
    }
  } else if (me.faithImportance === "somewhat") {
    if (sameFaith) {
      score += 15;
      reasons.push({ kind: "faith", value: candidate.faith });
    } else score += 8;
  } else {
    score += 10; // faith not important — neutral
  }

  const myArea = me.area.split(":")[1] ?? me.area;
  if (myArea && myArea === candidate.area) {
    score += 30;
    reasons.push({ kind: "area", value: candidate.area });
  }

  return { score: Math.max(5, Math.min(100, score)), reasons: reasons.slice(0, 3) };
}
