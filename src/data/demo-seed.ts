import type { CircleId } from "@/data/circles";
import type { Goal, Member } from "@/lib/types";
import { sparkSingles } from "@/data/spark-seed";

// Seeded demo buddies + goals so the Goals & Dreams board has life to interact
// with in demo mode (no backend). Replaced by live data once auth is real.
const members: Record<string, Member> = {
  marcus: {
    id: "m-marcus", name: "Marcus Johnson", colour: "#2c7a8c", verifiedLevel: 3,
    area: "Manhattan", availability: ["weekends", "evenings"], likesYou: true,
    traits: { "social-energy": 4, planning: 3, openness: 5, support: 4, activity: 5, values: 3 },
  },
  aisha: {
    id: "m-aisha", name: "Aisha Khalil", colour: "#a94fa0", verifiedLevel: 2,
    area: "Brooklyn", availability: ["evenings"], likesYou: false,
    traits: { "social-energy": 3, planning: 4, openness: 4, support: 5, activity: 2, values: 4 },
  },
  kevin: {
    id: "m-kevin", name: "Kevin Williams", colour: "#2fa86b", verifiedLevel: 3,
    area: "Manhattan", availability: ["mornings", "weekends"], likesYou: true,
    traits: { "social-energy": 2, planning: 5, openness: 3, support: 5, activity: 4, values: 5 },
  },
  priya: {
    id: "m-priya", name: "Priya Sharma", colour: "#7a5cd1", verifiedLevel: 2,
    area: "Brooklyn", availability: ["mornings"], likesYou: false,
    traits: { "social-energy": 3, planning: 4, openness: 3, support: 4, activity: 3, values: 5 },
  },
  jordan: {
    id: "m-jordan", name: "Jordan Rivera", colour: "#f2763c", verifiedLevel: 1,
    area: "Manhattan", availability: ["weekends"], likesYou: true,
    traits: { "social-energy": 5, planning: 2, openness: 5, support: 3, activity: 4, values: 2 },
  },
  alex: {
    id: "m-alex", name: "Alex Chen", colour: "#5566a0", verifiedLevel: 2,
    area: "Harlem", availability: ["evenings", "weekends"], likesYou: false,
    traits: { "social-energy": 4, planning: 3, openness: 4, support: 3, activity: 3, values: 3 },
  },
  fatima: {
    id: "m-fatima", name: "Fatima Hassan", colour: "#26a3b0", verifiedLevel: 3,
    area: "Queens", availability: ["weekends"], likesYou: true,
    traits: { "social-energy": 3, planning: 3, openness: 5, support: 4, activity: 5, values: 3 },
  },
};

let seq = 0;
const g = (
  circleId: CircleId,
  owner: Member,
  title: string,
  description: string,
  baseCheers: number,
  baseJoins: number,
): Goal => ({
  id: `seed-${circleId}-${seq++}`,
  circleId,
  owner,
  title,
  description,
  createdAt: 0,
  baseCheers,
  baseJoins,
});

export const seedGoals: Goal[] = [
  // Friends & Social (the proof-one Circle)
  g("friends", members.jordan, "Host a monthly games night", "Looking for 4–5 regulars in Midtown.", 12, 4),
  g("friends", members.marcus, "Make three new friends this quarter", "New in New York, keen on hikes and board games.", 8, 2),
  // Faith & Fellowship
  g("faith", members.priya, "Find a weekly prayer partner", "Early mornings before work.", 9, 3),
  g("faith", members.kevin, "Read the Bible in a year", "Accountability check-ins welcome.", 15, 6),
  // Work & Corporate
  g("work", members.alex, "Find a mentor in product management", "Two years in, want to grow into PM.", 7, 1),
  g("work", members.aisha, "Grow my professional network", "Attending one mixer a month.", 5, 2),
  // Goals & Accountability
  g("goals", members.kevin, "Save $1,000 by December", "Group savings circle with accountability.", 21, 9),
  g("goals", members.jordan, "Finish my online course", "Need weekly nudges to stay on track.", 6, 3),
  // Fitness & Outdoors
  g("fitness", members.marcus, "Run my first 10K", "Training Tue/Thu around Central Park.", 18, 7),
  g("fitness", members.fatima, "Hike the Hudson Valley", "Planning a group trip next month.", 11, 5),
  // Students & Young Pros
  g("students", members.aisha, "Build a study group for finals", "Second-year, campus in Brooklyn.", 4, 3),
  g("students", members.alex, "Land a tech internship", "Portfolio reviews appreciated.", 9, 2),
];

export function seedGoalsForCircle(circleId: CircleId): Goal[] {
  return seedGoals.filter((goal) => goal.circleId === circleId);
}

export const seedMembers = members;

export function memberById(id: string): Member | undefined {
  const buddy = Object.values(members).find((m) => m.id === id);
  if (buddy) return buddy;
  // Spark singles resolve here too so chat works for Spark matches (still
  // isolated: the buddy chat list only iterates non-Spark matches).
  return sparkSingles.find((s) => s.id === id);
}

/** Buddy candidates in a Circle: seed members who have a goal there, + goals. */
export function circleCandidates(
  circleId: CircleId,
): { member: Member; goals: string[] }[] {
  const byOwner = new Map<string, { member: Member; goals: string[] }>();
  for (const goal of seedGoalsForCircle(circleId)) {
    const entry = byOwner.get(goal.owner.id) ?? { member: goal.owner, goals: [] };
    entry.goals.push(goal.title);
    byOwner.set(goal.owner.id, entry);
  }
  return [...byOwner.values()];
}
