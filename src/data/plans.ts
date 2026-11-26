import type { CircleId } from "@/data/circles";

// Single source of truth for pricing (mirrors docs/PRICING.md and the `plans`
// DB table). No prices are hard-coded anywhere else. Prices in USD; annual ≈ 30% off.
export type PlanScope = "member" | "bundle" | "host";

export interface Plan {
  code: string;
  name: string;
  scope: PlanScope;
  circleId?: CircleId;
  monthly: number;
  annual?: number;
  currency: "USD";
  features: string[];
}

export const memberPlans: Plan[] = [
  { code: "spark-plus", name: "Spark Plus", scope: "member", circleId: "spark", monthly: 9, annual: 75, currency: "USD", features: ["Unlimited likes", "See who liked you", "3 rewinds a day", "Travel mode"] },
  { code: "spark-gold", name: "Spark Gold", scope: "member", circleId: "spark", monthly: 19, annual: 159, currency: "USD", features: ["Everything in Plus", "Weekly boost", "Priority in mixers", "Read receipts", "Incognito"] },
  { code: "table-pass", name: "Table Pass", scope: "member", circleId: "buddy-table", monthly: 19, annual: 159, currency: "USD", features: ["Unlimited weekly dinners & coffees", "Food paid at venue"] },
  { code: "founder-pro", name: "Founder Pro", scope: "member", circleId: "business", monthly: 12, annual: 99, currency: "USD", features: ["Co-founder matching", "Mastermind groups", "Investor-night access"] },
  { code: "pro-networker", name: "Pro Networker", scope: "member", circleId: "work", monthly: 9, annual: 75, currency: "USD", features: ["Unlimited mentorship requests", "Featured profile", "CV-style goals card"] },
  { code: "travel-plus", name: "Travel Plus", scope: "member", circleId: "travel", monthly: 7, annual: 59, currency: "USD", features: ["Trip-mate matching", "Verified co-traveller badge", "Group trip deals"] },
  { code: "goal-plus", name: "Goal Plus", scope: "member", circleId: "goals", monthly: 6, annual: 49, currency: "USD", features: ["Unlimited accountability buddies", "Streaks", "Progress reports"] },
  { code: "buddy-plus", name: "Buddy Plus", scope: "member", circleId: "friends", monthly: 5, annual: 39, currency: "USD", features: ["Unlimited suggestions", "See who viewed you", "Priority RSVP"] },
  { code: "active-plus", name: "Active Plus", scope: "member", circleId: "fitness", monthly: 5, annual: 39, currency: "USD", features: ["Partner matching by pace & level", "Event priority", "Activity logs"] },
  { code: "fellowship-plus", name: "Fellowship Plus", scope: "member", circleId: "faith", monthly: 4, annual: 29, currency: "USD", features: ["Prayer-partner matching", "Unlimited groups"] },
  { code: "student-plus", name: "Student Plus", scope: "member", circleId: "students", monthly: 3, annual: 24, currency: "USD", features: ["All Friends & Goals features", "Student email or ID required"] },
];

export const bundlePlans: Plan[] = [
  { code: "all-access", name: "Buddy All-Access", scope: "bundle", monthly: 19, currency: "USD", features: ["Every member premium except Spark Gold & Table Pass"] },
  { code: "all-access-gold", name: "All-Access + Spark Gold", scope: "bundle", monthly: 29, currency: "USD", features: ["Everything for members"] },
  { code: "family", name: "Family plan (2 adults)", scope: "bundle", monthly: 24, currency: "USD", features: ["All-Access for two linked accounts (no Spark)"] },
];

export const hostPlans: Plan[] = [
  { code: "community-host", name: "Community Host", scope: "host", monthly: 12, currency: "USD", features: ["Group page", "Events & RSVP", "Chat", "Basic analytics"] },
  { code: "ministry", name: "Ministry", scope: "host", monthly: 29, currency: "USD", features: ["Unlimited members", "Sub-groups", "Giving links", "Attendance tracking"] },
  { code: "corporate", name: "Corporate", scope: "host", monthly: 149, currency: "USD", features: ["$1/employee (min $149/mo)", "Private space", "Team events", "Mentorship matching", "SSO"] },
  { code: "venue-partner", name: "Venue Partner", scope: "host", monthly: 49, currency: "USD", features: ["Host tables & mixers", "Featured listing", "Booking flow", "+ listing fee per event"] },
];

export const allPlans: Plan[] = [...memberPlans, ...bundlePlans, ...hostPlans];

export function planByCode(code: string): Plan | undefined {
  return allPlans.find((p) => p.code === code);
}
