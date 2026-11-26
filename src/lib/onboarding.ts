import type { CircleId } from "@/data/circles";

/** Shape of the profile draft collected during onboarding. */
export interface OnboardingData {
  name: string;
  area: string;
  circles: CircleId[];
  goals: string[];
  quiz: Record<string, number>;
}

const STORAGE_KEY = "bab_onboarding";

export const emptyOnboarding: OnboardingData = {
  name: "",
  area: "",
  circles: [],
  goals: ["", "", ""],
  quiz: {},
};

/**
 * Persist the draft locally. In Stage 1 (no profiles table yet) this is the
 * source of truth for the preview; Stage 2 writes it to Supabase under RLS.
 */
export function saveOnboarding(data: OnboardingData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage may be unavailable (private mode); non-fatal for the preview.
  }
}

export function loadOnboarding(): OnboardingData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as OnboardingData) : null;
  } catch {
    return null;
  }
}

const SESSION_KEYS = [
  STORAGE_KEY,
  "bab_circle_profiles",
  "bab_user_goals",
  "bab_support",
  "bab_goals_migrated",
  "bab_active_circle",
  "bab_notifications",
  "bab_match_store",
  "bab_spark_store",
];

export function clearSession() {
  try {
    for (const key of SESSION_KEYS) localStorage.removeItem(key);
  } catch {
    // ignore
  }
}
