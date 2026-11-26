import type { CircleId } from "@/data/circles";

export type Visibility = "public" | "members" | "private";
export type SupportType = "cheer" | "join" | "accountability";

/** A person as shown on cards (denormalised for the demo store). */
export interface Member {
  id: string;
  name: string;
  colour: string;
  /** Verification level: 1 = phone, 2 = selfie, 3 = ID. */
  verifiedLevel?: 1 | 2 | 3;
  /** Matching attributes (demo). traits: quiz dimension -> 1..5. */
  traits?: Record<string, number>;
  area?: string;
  availability?: string[];
  /** Demo only: this seed buddy has already liked you, so a Connect = a match. */
  likesYou?: boolean;
}

/** Per-Circle profile + visibility (one row per joined Circle). */
export interface CircleProfile {
  circleId: CircleId;
  displayName: string;
  bio: string;
  visibility: Visibility;
}

export interface Goal {
  id: string;
  circleId: CircleId;
  owner: Member;
  title: string;
  description?: string;
  createdAt: number;
  /** Seeded demo goals carry base support counts so the board feels alive. */
  baseCheers?: number;
  baseJoins?: number;
}

/** goalId -> support types the current user has applied. */
export type SupportMap = Record<string, SupportType[]>;
