// Demo Spark store (client-side, localStorage), kept separate from the buddy
// match store so Spark activity never mixes with other Circles. Mirrors the
// Stage 5 schema + the Spark isolation rule.
import { verificationLevel } from "@/lib/data/safety";
import { sparkSingles, type FaithImportance, type Intent } from "@/data/spark-seed";

export interface SparkProfile {
  intent: Intent;
  bio: string;
  faith: string;
  faithImportance: FaithImportance;
  wantsChildren: "yes" | "no" | "open";
  groupFirst: boolean;
  age: number;
  confirmed18: boolean;
}

const K = {
  profile: "bab_spark_profile",
  premium: "bab_spark_premium",
  likes: "bab_spark_likes",
  matches: "bab_spark_matches",
  passes: "bab_spark_passes",
  rsvps: "bab_spark_rsvps",
};

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

export const emptySparkProfile: SparkProfile = {
  intent: "serious",
  bio: "",
  faith: "",
  faithImportance: "somewhat",
  wantsChildren: "open",
  groupFirst: true,
  age: 0,
  confirmed18: false,
};

export function getSparkProfile(): SparkProfile | null {
  return read<SparkProfile | null>(K.profile, null);
}
export function saveSparkProfile(p: SparkProfile) {
  write(K.profile, p);
}

export interface SparkEligibility {
  hasProfile: boolean;
  confirmed18: boolean;
  idVerified: boolean;
  eligible: boolean;
}
export function sparkEligibility(): SparkEligibility {
  const profile = getSparkProfile();
  const hasProfile = profile !== null;
  const confirmed18 = Boolean(profile?.confirmed18);
  const idVerified = verificationLevel() === 3;
  return {
    hasProfile,
    confirmed18,
    idVerified,
    eligible: hasProfile && confirmed18 && idVerified,
  };
}

// --- Premium (demo toggle for Spark Plus / Gold) ---------------------------
export function isSparkPremium(): boolean {
  return read<boolean>(K.premium, false);
}
export function setSparkPremium(on: boolean) {
  write(K.premium, on);
}

// --- Likes / matches / passes ----------------------------------------------
export function getSparkLikes(): string[] {
  return read<string[]>(K.likes, []);
}
export function getSparkMatches(): string[] {
  return read<string[]>(K.matches, []);
}
export function getSparkPasses(): string[] {
  return read<string[]>(K.passes, []);
}
export function isSparkSeen(id: string): boolean {
  return getSparkLikes().includes(id) || getSparkPasses().includes(id);
}
export function sparkLike(id: string, reciprocated: boolean): boolean {
  const likes = new Set(getSparkLikes());
  likes.add(id);
  write(K.likes, [...likes]);
  if (reciprocated) {
    const matches = new Set(getSparkMatches());
    matches.add(id);
    write(K.matches, [...matches]);
  }
  return reciprocated;
}
export function sparkPass(id: string) {
  const passes = new Set(getSparkPasses());
  passes.add(id);
  write(K.passes, [...passes]);
}

/** Singles who already liked you and you haven't acted on (premium reveal). */
export function whoLikedYou(): string[] {
  return sparkSingles
    .filter((s) => s.likesYou && !isSparkSeen(s.id))
    .map((s) => s.id);
}

// --- Mixers ----------------------------------------------------------------
export function getRsvps(): string[] {
  return read<string[]>(K.rsvps, []);
}
export function toggleRsvp(mixerId: string): string[] {
  const set = new Set(getRsvps());
  if (set.has(mixerId)) set.delete(mixerId);
  else set.add(mixerId);
  write(K.rsvps, [...set]);
  return [...set];
}
