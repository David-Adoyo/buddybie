import type { CircleId } from "@/data/circles";

/**
 * Suggested goals shown during onboarding on the "What are you working
 * towards?" step. Filtered to the Circles the user has actually selected so
 * suggestions feel personal rather than generic. Order matters: put the most
 * motivating / concrete ones first so they appear at the top of the chips.
 */
export const circleGoalSuggestions: Record<CircleId, string[]> = {
  friends: [
    "Make 2 genuine new friends this month",
    "Attend one social event or brunch I would usually skip",
    "Join a group activity — hike, game night, or sports",
    "Host a get-together at my place",
    "Say yes to one new social invite every week",
    "Expand my circle beyond work colleagues",
  ],
  faith: [
    "Join or start a weekly prayer or fellowship group",
    "Read through the Bible / Quran / scriptures this year",
    "Serve in a community outreach at least once a month",
    "Find an accountability partner for my faith walk",
    "Attend a retreat or spiritual growth event this year",
    "Deepen my daily prayer or devotional practice",
  ],
  work: [
    "Find a career mentor by end of the month",
    "Attend at least 2 networking events this month",
    "Learn one new professional skill (public speaking, Excel, Python…)",
    "Get promoted or take on a stretch project this year",
    "Grow my LinkedIn and have 3 meaningful conversations",
    "Start building a side income or freelance portfolio",
  ],
  spark: [
    "Be intentional and honest about what I want in a relationship",
    "Meet someone new through a mixer or group event first",
    "Work on becoming the partner I want to attract",
    "Let go of patterns that have not served my love life",
    "Go on 3 intentional, respectful dates this season",
    "Define my relationship values and non-negotiables",
  ],
  goals: [
    "Complete a 30-day habit streak without breaking it",
    "Save a meaningful amount every single month this year",
    "Finish one online course or certification",
    "Read 12 books this year (one a month)",
    "Wake up at a consistent time every day for a month",
    "Launch a side project or business idea I have been sitting on",
  ],
  fitness: [
    "Run a 5K without stopping by next month",
    "Find a local trail, park run or hike and do it this weekend",
    "Exercise at least 4 times a week consistently",
    "Join a run club, sports team or outdoor group in my city",
    "Train for and complete a 10K or half-marathon",
    "Reach a new personal best in a sport or workout I love",
  ],
  "buddy-table": [
    "Have a meaningful meal with someone I would not normally meet",
    "Say yes to a dinner with strangers at least once a month",
    "Improve my social confidence in new group settings",
    "Make a friend I could not have found on my own",
    "Be fully present at every meal — no scrolling, no distractions",
  ],
  students: [
    "Land my first internship or job before graduation",
    "Build a portfolio project I am proud to show employers",
    "Ace my final exams or raise my GPA this semester",
    "Find a campus study group or accountability partner",
    "Network with 5 professionals in my field this term",
    "Apply to 3 scholarships, fellowships or competitions",
  ],
  // Wave 2 & 3 circles — shown if somehow selected, sensible defaults
  arts: [
    "Finish and share a creative project this month",
    "Attend an open mic, gallery night or cultural event",
    "Collaborate with another artist or creative",
    "Start a creative practice I can do consistently",
  ],
  parents: [
    "Connect with other parents in my area for playdates",
    "Spend one intentional activity day with my child each week",
    "Find a parenting support group or mentor",
    "Build a routine that balances work, parenting and self-care",
  ],
  travel: [
    "Meet a local through Be a Buddy on my next trip",
    "Find a travel buddy for a destination I have been eyeing",
    "Explore a historic site or hidden gem in a new city this year",
    "Join a group day-trip, food tour or game night with fellow travellers",
    "Create a travel bucket list and tick off 3 destinations this year",
    "Say yes to a spontaneous adventure with someone I just met",
    "Visit a city solo and find people to explore it with",
  ],
  business: [
    "Validate my business idea with real paying customers",
    "Find a co-founder or accountability partner for my startup",
    "Pitch to investors or enter a startup competition",
    "Build a product, land 10 users and get feedback",
  ],
  diaspora: [
    "Reconnect with the community from back home in my current city",
    "Attend a cultural event or homecoming this year",
    "Support a cause or project in my home country",
    "Build friendships with people who share my roots and values",
    "Find others who understand the dual-world experience I live",
  ],
  gaming: [
    "Find people to play with regularly — online or LAN",
    "Compete in or organise a local gaming event",
    "Build a game, app or tech project with others",
    "Improve my ranking or reach a new skill level this season",
  ],
  volunteering: [
    "Give at least 4 hours a month to a cause I care about",
    "Plant trees or join a clean-up in my neighbourhood",
    "Mentor one young person this year",
    "Raise funds or awareness for a community project",
  ],
  support: [
    "Show up consistently for a peer support group",
    "Share my story and help someone feel less alone",
    "Build a support network for a life transition I am going through",
    "Take one meaningful step towards healing or growth each week",
  ],
};

/** Shown to everyone regardless of which Circles they chose. */
export const universalGoalSuggestions: string[] = [
  "Build one consistent daily routine and stick to it",
  "Save more than I spend every single month",
  "Get better sleep — aim for 7–8 hours a night",
  "Journal or reflect for 10 minutes every morning",
  "Drink 2 litres of water a day for 30 days straight",
  "Spend less time on social media, more time on what matters",
];

/**
 * Returns a deduplicated, ordered list of goal suggestions for the given
 * selected circles, with circle-specific ones first and universal ones last.
 */
export function suggestionsForCircles(circleIds: CircleId[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const id of circleIds) {
    for (const s of circleGoalSuggestions[id] ?? []) {
      if (!seen.has(s)) {
        seen.add(s);
        result.push(s);
      }
    }
  }

  for (const s of universalGoalSuggestions) {
    if (!seen.has(s)) {
      seen.add(s);
      result.push(s);
    }
  }

  return result;
}
