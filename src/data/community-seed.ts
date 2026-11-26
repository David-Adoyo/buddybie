import type { CircleId } from "@/data/circles";

export type GroupKind =
  | "public"
  | "private"
  | "verified_only"
  | "women_only"
  | "men_only";

export interface SeedGroup {
  id: string;
  circleId: CircleId;
  name: string;
  description: string;
  kind: GroupKind;
  members: number;
}

export interface SeedEvent {
  id: string;
  circleId: CircleId;
  title: string;
  venue: string;
  area: string;
  when: string;
  capacity: number;
  going: number;
  womenOnly?: boolean;
  menOnly?: boolean;
  verifiedOnly?: boolean;
}

export interface SeedTable {
  id: string;
  area: string;
  venue: string;
  /** Hours from now until the table starts (reveal logic uses this). */
  inHours: number;
  revealHours: number;
  seats: number;
  sitters: { name: string; colour: string }[];
}

export const seedGroups: SeedGroup[] = [
  { id: "g-central-park-runners", circleId: "fitness", name: "Central Park Runners", description: "Tue/Thu 6am runs around Central Park.", kind: "public", members: 42 },
  { id: "g-ladies-hike", circleId: "fitness", name: "Ladies Who Hike", description: "Monthly group hikes, women only.", kind: "women_only", members: 28 },
  { id: "g-couples-fellowship", circleId: "faith", name: "Couples Fellowship", description: "Fortnightly fellowship for couples.", kind: "verified_only", members: 36 },
  { id: "g-youth-prayer", circleId: "faith", name: "Youth Prayer Group", description: "Early-morning prayer partners.", kind: "public", members: 54 },
  { id: "g-pm-circle", circleId: "work", name: "Product Managers Circle", description: "Monthly PM mentorship & talks.", kind: "public", members: 61 },
  { id: "g-savings", circleId: "goals", name: "Savings Accountability Circle", description: "Transparent group savings pot, $50/month.", kind: "private", members: 12 },
  { id: "g-brunch-club", circleId: "friends", name: "Weekend Brunch Club", description: "New-in-town friendly brunches.", kind: "public", members: 73 },
  { id: "g-campus-study", circleId: "students", name: "Finals Study Squad", description: "Exam-season study sessions.", kind: "public", members: 19 },
];

export const seedEvents: SeedEvent[] = [
  { id: "e-parkrun", circleId: "fitness", title: "Central Park 5K", venue: "Central Park South", area: "Manhattan", when: "Sat 8:00 AM", capacity: 50, going: 31 },
  { id: "e-hudson-hike", circleId: "fitness", title: "Hudson Valley hike", venue: "Breakneck Ridge", area: "Hudson Valley", when: "Sun 7:00 AM", capacity: 20, going: 20, verifiedOnly: true },
  { id: "e-prayer-breakfast", circleId: "faith", title: "Prayer Breakfast", venue: "Blue Bottle Coffee", area: "Midtown", when: "Sat 8:30 AM", capacity: 30, going: 12 },
  { id: "e-pm-mixer", circleId: "work", title: "Product Mixer", venue: "WeWork SoHo", area: "SoHo", when: "Thu 6:00 PM", capacity: 40, going: 27 },
  { id: "e-game-night", circleId: "friends", title: "Board Game Night", venue: "The Uncommons", area: "Greenwich Village", when: "Fri 7:00 PM", capacity: 24, going: 16 },
  { id: "e-ladies-brunch", circleId: "friends", title: "Ladies Brunch", venue: "Balthazar", area: "SoHo", when: "Sun 11:00 AM", capacity: 12, going: 9, womenOnly: true },
];

export const seedTables: SeedTable[] = [
  {
    id: "t-this-week",
    area: "Manhattan",
    venue: "The Smith",
    inHours: 12,
    revealHours: 24,
    seats: 6,
    sitters: [
      { name: "Marcus Johnson", colour: "#2c7a8c" },
      { name: "Aisha Khalil", colour: "#a94fa0" },
      { name: "Jordan Rivera", colour: "#f2763c" },
    ],
  },
  {
    id: "t-next-week",
    area: "Brooklyn",
    venue: "Lilia",
    inHours: 180,
    revealHours: 24,
    seats: 6,
    sitters: [
      { name: "Kevin Williams", colour: "#2fa86b" },
      { name: "Fatima Hassan", colour: "#26a3b0" },
    ],
  },
];

export function groupsForCircle(circleId: CircleId): SeedGroup[] {
  return seedGroups.filter((g) => g.circleId === circleId);
}
export function eventsForCircle(circleId: CircleId): SeedEvent[] {
  return seedEvents.filter((e) => e.circleId === circleId);
}
export function eventById(id: string): SeedEvent | undefined {
  return seedEvents.find((e) => e.id === id);
}
export function groupById(id: string): SeedGroup | undefined {
  return seedGroups.find((g) => g.id === id);
}
