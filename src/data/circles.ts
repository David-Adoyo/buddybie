import {
  Users,
  Church,
  Briefcase,
  Sparkles,
  Target,
  Mountain,
  Utensils,
  GraduationCap,
  Palette,
  Baby,
  Plane,
  Rocket,
  Globe,
  Gamepad2,
  HeartHandshake,
  LifeBuoy,
  type LucideIcon,
} from "lucide-react";

export type CircleId =
  | "friends"
  | "faith"
  | "work"
  | "spark"
  | "goals"
  | "fitness"
  | "buddy-table"
  | "students"
  | "arts"
  | "parents"
  | "travel"
  | "business"
  | "diaspora"
  | "gaming"
  | "volunteering"
  | "support";

export interface Circle {
  id: CircleId;
  name: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  /** Accent colour (hex). PLACEHOLDER palette — tune alongside brand colours. */
  accent: string;
  /** 1 = launch wave (live in v1), 2 and 3 unlock as cities reach density. */
  launchWave: 1 | 2 | 3;
  /** Spark has its own distinct skin, 18+ gate and isolated visibility. */
  isSpark?: boolean;
  /** Volunteering & Support Circles are always free. */
  alwaysFree?: boolean;
}

// The full sixteen so the data model supports every Circle from day one; only
// launchWave === 1 is surfaced in v1 (see /docs for the city-density rollout).
export const circles: Circle[] = [
  {
    id: "friends",
    name: "Friends & Social",
    tagline: "Make adult friends.",
    description:
      "New in town or after your weekend crew — buddy matches, brunches and game nights.",
    icon: Users,
    accent: "#f2763c",
    launchWave: 1,
  },
  {
    id: "faith",
    name: "Faith & Fellowship",
    tagline: "Grow together in faith.",
    description:
      "Churches, mosques and ministries: fellowship groups, prayer partners and retreats.",
    icon: Church,
    accent: "#7a5cd1",
    launchWave: 1,
  },
  {
    id: "work",
    name: "Work & Corporate",
    tagline: "Network and grow at work.",
    description:
      "Team building, mentorship pairing and networking mixers for professionals and HR teams.",
    icon: Briefcase,
    accent: "#2c7a8c",
    launchWave: 1,
  },
  {
    id: "spark",
    name: "Spark",
    tagline: "Dating, done safely.",
    description:
      "Verified 1:1 matching, singles mixers and date-safety tools. Strictly 18+ and ID-verified.",
    icon: Sparkles,
    accent: "#e5468a",
    launchWave: 1,
    isSpark: true,
  },
  {
    id: "goals",
    name: "Goals & Accountability",
    tagline: "Every goal needs a buddy.",
    description:
      "Accountability buddies, savings circles, study groups and check-in streaks.",
    icon: Target,
    accent: "#d98324",
    launchWave: 1,
  },
  {
    id: "fitness",
    name: "Fitness & Outdoors",
    tagline: "Move with your people.",
    description:
      "Run clubs, hikes, trail walks, five-a-side and gym partners — matched by pace, level and city.",
    icon: Mountain,
    accent: "#2fa86b",
    launchWave: 1,
  },
  {
    id: "buddy-table",
    name: "Buddy Table",
    tagline: "Dinner with new friends.",
    description:
      "Weekly curated dinners and coffees with four to six matched strangers. Venue revealed the day before.",
    icon: Utensils,
    accent: "#b5542e",
    launchWave: 1,
  },
  {
    id: "students",
    name: "Students & Young Pros",
    tagline: "Campus and first-job circles.",
    description:
      "Campus circles, career talks and study buddies for students and first-jobbers.",
    icon: GraduationCap,
    accent: "#3e82c9",
    launchWave: 1,
  },
  {
    id: "arts",
    name: "Arts, Music & Culture",
    tagline: "For creatives and fans.",
    description: "Open mics, gallery walks, book clubs and dance classes.",
    icon: Palette,
    accent: "#a94fa0",
    launchWave: 2,
  },
  {
    id: "parents",
    name: "Parents & Family",
    tagline: "For parents and families.",
    description: "Playdates, parent groups and family days.",
    icon: Baby,
    accent: "#e89a4c",
    launchWave: 2,
  },
  {
    id: "travel",
    name: "Travel & Explorers",
    tagline: "Meet people at your destination.",
    description:
      "Find like-minded explorers wherever you land — city walks, historical sites, local food tours, games nights and day trips with people who share your energy.",
    icon: Plane,
    accent: "#26a3b0",
    launchWave: 1,
  },
  {
    id: "business",
    name: "Business & Founders",
    tagline: "Build with other founders.",
    description: "Co-founder matching, pitch nights and mastermind groups.",
    icon: Rocket,
    accent: "#5566a0",
    launchWave: 2,
  },
  {
    id: "diaspora",
    name: "Diaspora & Expats",
    tagline: "Home, wherever you are.",
    description: "Homecoming meetups, city chapters and cultural nights.",
    icon: Globe,
    accent: "#c9902e",
    launchWave: 2,
  },
  {
    id: "gaming",
    name: "Gaming & Tech",
    tagline: "For gamers and builders.",
    description: "LAN nights, hackathons and esports viewing.",
    icon: Gamepad2,
    accent: "#7a5ce0",
    launchWave: 3,
  },
  {
    id: "volunteering",
    name: "Volunteering & Causes",
    tagline: "Do good together.",
    description: "Clean-ups, tree planting and charity drives.",
    icon: HeartHandshake,
    accent: "#d9544e",
    launchWave: 3,
    alwaysFree: true,
  },
  {
    id: "support",
    name: "Support Circles",
    tagline: "Through life's changes.",
    description:
      "Peer groups for grief, new parents and life changes, led by trained facilitators. Always free.",
    icon: LifeBuoy,
    accent: "#4b9e8e",
    launchWave: 3,
    alwaysFree: true,
  },
];

/** Circles live at launch (wave 1). */
export const launchCircles = circles.filter((c) => c.launchWave === 1);

export const circleById = (id: string): Circle | undefined =>
  circles.find((c) => c.id === id);
