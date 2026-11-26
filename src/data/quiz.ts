// A lightweight 15-question personality quiz used by the AI Buddy Matcher
// (Stage 4). Each question is an agree/disagree statement mapped to a trait
// dimension so matching can compare people on more than interests alone.
export type QuizDimension =
  | "social-energy"
  | "planning"
  | "openness"
  | "support"
  | "activity"
  | "values";

export interface QuizQuestion {
  id: string;
  dimension: QuizDimension;
  statement: string;
}

/** 5-point Likert scale, stored as 1–5. */
export const QUIZ_SCALE = [1, 2, 3, 4, 5] as const;
export type QuizAnswerValue = (typeof QUIZ_SCALE)[number];

export const quizQuestions: QuizQuestion[] = [
  {
    id: "q1",
    dimension: "social-energy",
    statement: "I feel energised after spending time in a big group of people.",
  },
  {
    id: "q2",
    dimension: "social-energy",
    statement: "I would rather meet one or two people than join a large crowd.",
  },
  {
    id: "q3",
    dimension: "planning",
    statement: "I like to plan my week in advance rather than keep it open.",
  },
  {
    id: "q4",
    dimension: "planning",
    statement: "I am happy to say yes to a plan at the last minute.",
  },
  {
    id: "q5",
    dimension: "openness",
    statement: "I enjoy trying activities and foods I have never tried before.",
  },
  {
    id: "q6",
    dimension: "openness",
    statement: "I am curious about people whose lives are very different from mine.",
  },
  {
    id: "q7",
    dimension: "support",
    statement: "I check in on friends when I know they are working towards a goal.",
  },
  {
    id: "q8",
    dimension: "support",
    statement: "Being held accountable helps me actually finish what I start.",
  },
  {
    id: "q9",
    dimension: "activity",
    statement: "I would pick an outdoor or active plan over a quiet indoor one.",
  },
  {
    id: "q10",
    dimension: "activity",
    statement: "A good weekend includes some kind of exercise or movement.",
  },
  {
    id: "q11",
    dimension: "values",
    statement: "Shared values matter more to me than shared hobbies.",
  },
  {
    id: "q12",
    dimension: "values",
    statement: "Faith or spirituality is an important part of who I am.",
  },
  {
    id: "q13",
    dimension: "social-energy",
    statement: "I find it easy to start a conversation with someone new.",
  },
  {
    id: "q14",
    dimension: "support",
    statement: "I show up reliably when I have said I will be somewhere.",
  },
  {
    id: "q15",
    dimension: "openness",
    statement: "I am looking to grow and change over the next year.",
  },
];
