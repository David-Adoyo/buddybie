import type { Member } from "@/lib/types";

export type Intent = "godly" | "serious" | "casual" | "friends";
export type FaithImportance = "not" | "somewhat" | "very";

export interface SparkSingle extends Member {
  age: number;
  bio: string;
  intent: Intent;
  faith: string;
  faithImportance: FaithImportance;
}

// Seed Spark singles (demo). Separate from the buddy seed and never surfaced
// outside Spark. Some have likesYou so Connect forms an instant match.
export const sparkSingles: SparkSingle[] = [
  {
    id: "sp-leila", name: "Leila", colour: "#e5468a", verifiedLevel: 3, age: 27,
    area: "Manhattan", bio: "Runner, coffee snob, looking for something real.",
    intent: "serious", faith: "Muslim", faithImportance: "very", likesYou: true,
    traits: { "social-energy": 4, openness: 5, activity: 5, values: 4 },
  },
  {
    id: "sp-david", name: "David", colour: "#2c7a8c", verifiedLevel: 3, age: 31,
    area: "Brooklyn", bio: "Hiker and foodie. Faith matters to me.",
    intent: "serious", faith: "Christian", faithImportance: "very", likesYou: true,
    traits: { "social-energy": 3, openness: 4, activity: 4, values: 5 },
  },
  {
    id: "sp-amara", name: "Amara", colour: "#a94fa0", verifiedLevel: 2, age: 25,
    area: "Park Slope", bio: "Artist. Here for good conversation, no rush.",
    intent: "casual", faith: "Spiritual", faithImportance: "somewhat", likesYou: false,
    traits: { "social-energy": 5, openness: 5, activity: 2, values: 3 },
  },
  {
    id: "sp-tom", name: "Tom", colour: "#5566a0", verifiedLevel: 3, age: 29,
    area: "Manhattan", bio: "Dev by day, five-a-side by weekend.",
    intent: "serious", faith: "Christian", faithImportance: "somewhat", likesYou: true,
    traits: { "social-energy": 3, openness: 3, activity: 5, values: 3 },
  },
  {
    id: "sp-zawadi", name: "Zawadi", colour: "#26a3b0", verifiedLevel: 3, age: 28,
    area: "Queens", bio: "Travel, books, and long walks in Central Park.",
    intent: "friends", faith: "None", faithImportance: "not", likesYou: false,
    traits: { "social-energy": 4, openness: 5, activity: 4, values: 2 },
  },
  {
    id: "sp-grace", name: "Grace", colour: "#7a5cd1", verifiedLevel: 3, age: 30,
    area: "Manhattan", bio: "Faith-first, family-minded, big laugh.",
    intent: "serious", faith: "Christian", faithImportance: "very", likesYou: true,
    traits: { "social-energy": 4, openness: 3, activity: 3, values: 5 },
  },
];

export function sparkSingleById(id: string): SparkSingle | undefined {
  return sparkSingles.find((s) => s.id === id);
}

export interface SparkMixer {
  id: string;
  title: string;
  venue: string;
  area: string;
  when: string;
  spots: number;
  womenOnly?: boolean;
}

export const sparkMixers: SparkMixer[] = [
  { id: "mx-1", title: "Singles Dinner for 6", venue: "The Smith", area: "Midtown", when: "Fri 7:00 PM", spots: 6 },
  { id: "mx-2", title: "Speed Dating Night", venue: "The Skylark", area: "Midtown", when: "Sat 6:30 PM", spots: 20 },
  { id: "mx-3", title: "Women-first Brunch", venue: "Balthazar", area: "SoHo", when: "Sun 11:00 AM", spots: 10, womenOnly: true },
  { id: "mx-4", title: "Faith & Coffee Meetup", venue: "Blue Bottle Coffee", area: "Brooklyn", when: "Sat 10:00 AM", spots: 12 },
];

// Public, well-lit venues suggested for first dates.
export const safeVenues: { name: string; area: string; kind: string }[] = [
  { name: "Blue Bottle Coffee", area: "Manhattan", kind: "café" },
  { name: "Brookfield Place", area: "Lower Manhattan", kind: "mall" },
  { name: "Central Park", area: "Manhattan", kind: "outdoor" },
  { name: "The High Line", area: "Chelsea", kind: "park" },
  { name: "Bryant Park", area: "Midtown", kind: "park" },
];
