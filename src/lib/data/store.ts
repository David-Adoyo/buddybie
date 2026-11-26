// Demo data store (client-side, localStorage). Mirrors the Supabase schema +
// RLS semantics for the Stage 2 preview. The repository swaps to live Supabase
// queries once real auth sessions exist (Stage 3). See docs/DATA_MODEL.md.
import type { CircleId } from "@/data/circles";
import { seedGoalsForCircle } from "@/data/demo-seed";
import { loadOnboarding } from "@/lib/onboarding";
import type {
  CircleProfile,
  Goal,
  Member,
  SupportMap,
  SupportType,
  Visibility,
} from "@/lib/types";

const KEY_PROFILES = "bab_circle_profiles";
const KEY_GOALS = "bab_user_goals";
const KEY_SUPPORT = "bab_support";
const KEY_MIGRATED = "bab_goals_migrated";

const ME_ID = "me";
const ME_COLOUR = "#e8604c";

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
    // Non-fatal in the preview (e.g. private mode / quota).
  }
}

function newId() {
  return `u-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function getMe(): Member {
  const onboarding = loadOnboarding();
  return { id: ME_ID, name: onboarding?.name?.trim() || "You", colour: ME_COLOUR };
}

export function getJoinedCircleIds(): CircleId[] {
  return loadOnboarding()?.circles ?? [];
}

// --- Per-Circle profiles ---------------------------------------------------

type StoredProfiles = Record<string, CircleProfile>;

export function getCircleProfile(circleId: CircleId): CircleProfile {
  const stored = read<StoredProfiles>(KEY_PROFILES, {});
  return (
    stored[circleId] ?? {
      circleId,
      displayName: getMe().name,
      bio: "",
      visibility: "members" as Visibility,
    }
  );
}

export function saveCircleProfile(profile: CircleProfile) {
  const stored = read<StoredProfiles>(KEY_PROFILES, {});
  stored[profile.circleId] = profile;
  write(KEY_PROFILES, stored);
}

// --- Goals -----------------------------------------------------------------

interface StoredGoal {
  id: string;
  circleId: CircleId;
  title: string;
  description?: string;
  createdAt: number;
}

function migrateOnboardingGoals() {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(KEY_MIGRATED)) return;
  const onboarding = loadOnboarding();
  const firstCircle =
    (onboarding?.circles ?? []).find((c) => c !== "spark") ??
    onboarding?.circles?.[0];
  if (onboarding && firstCircle) {
    const existing = read<StoredGoal[]>(KEY_GOALS, []);
    const migrated: StoredGoal[] = onboarding.goals
      .filter((g) => g.trim().length > 0)
      .map((title, i) => ({
        id: `onb-${i}`,
        circleId: firstCircle,
        title,
        createdAt: Date.now() - i,
      }));
    write(KEY_GOALS, [...migrated, ...existing]);
  }
  localStorage.setItem(KEY_MIGRATED, "1");
}

function loadUserGoals(): StoredGoal[] {
  migrateOnboardingGoals();
  return read<StoredGoal[]>(KEY_GOALS, []);
}

export function addUserGoal(
  circleId: CircleId,
  title: string,
  description?: string,
) {
  const goals = loadUserGoals();
  goals.unshift({
    id: newId(),
    circleId,
    title: title.trim(),
    description: description?.trim() || undefined,
    createdAt: Date.now(),
  });
  write(KEY_GOALS, goals);
}

export function removeUserGoal(id: string) {
  write(
    KEY_GOALS,
    loadUserGoals().filter((g) => g.id !== id),
  );
}

/** User's own goals first (newest), then seeded buddies, for one Circle. */
export function listGoals(circleId: CircleId): Goal[] {
  const me = getMe();
  const mine: Goal[] = loadUserGoals()
    .filter((g) => g.circleId === circleId)
    .sort((a, b) => b.createdAt - a.createdAt)
    .map((g) => ({
      id: g.id,
      circleId,
      owner: me,
      title: g.title,
      description: g.description,
      createdAt: g.createdAt,
    }));
  return [...mine, ...seedGoalsForCircle(circleId)];
}

export function isMine(goal: Goal) {
  return goal.owner.id === ME_ID;
}

// --- Support (cheer / join / accountability) -------------------------------

export function loadSupport(): SupportMap {
  return read<SupportMap>(KEY_SUPPORT, {});
}

export function toggleSupport(goalId: string, type: SupportType) {
  const map = loadSupport();
  const current = new Set(map[goalId] ?? []);
  if (current.has(type)) current.delete(type);
  else current.add(type);
  map[goalId] = [...current];
  write(KEY_SUPPORT, map);
  return map;
}

export function supportCounts(goal: Goal, map: SupportMap) {
  const mine = map[goal.id] ?? [];
  return {
    cheers: (goal.baseCheers ?? 0) + (mine.includes("cheer") ? 1 : 0),
    joins: (goal.baseJoins ?? 0) + (mine.includes("join") ? 1 : 0),
    cheered: mine.includes("cheer"),
    joined: mine.includes("join"),
    accountability: mine.includes("accountability"),
  };
}
