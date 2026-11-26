// Demo store for groups, events (RSVP/waitlist/check-in/ratings) and Buddy Table.
// Mirrors the Stage 6 schema; swaps to Supabase once auth is real.
import type { CircleId } from "@/data/circles";
import type { GroupKind, SeedEvent, SeedGroup, SeedTable } from "@/data/community-seed";

const K = {
  groups: "bab_groups",
  created: "bab_created_groups",
  rsvps: "bab_event_rsvps",
  checkins: "bab_event_checkins",
  ratings: "bab_event_ratings",
  seats: "bab_table_seats",
};

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
    /* ignore */
  }
}

// --- Groups ---------------------------------------------------------------
export function joinedGroups(): string[] {
  return read<string[]>(K.groups, []);
}
export function isGroupMember(id: string): boolean {
  return joinedGroups().includes(id);
}
export function toggleGroup(id: string): string[] {
  const set = new Set(joinedGroups());
  if (set.has(id)) set.delete(id);
  else set.add(id);
  write(K.groups, [...set]);
  return [...set];
}

/** Member-created groups (demo), shown alongside seed groups and auto-joined. */
export function createdGroups(circleId: CircleId): SeedGroup[] {
  return read<SeedGroup[]>(K.created, []).filter((g) => g.circleId === circleId);
}
export function addGroup(
  circleId: CircleId,
  name: string,
  description: string,
  kind: GroupKind,
): SeedGroup {
  const group: SeedGroup = {
    id: `cg-${Date.now().toString(36)}`,
    circleId,
    name: name.trim(),
    description: description.trim(),
    kind,
    members: 1,
  };
  write(K.created, [...read<SeedGroup[]>(K.created, []), group]);
  toggleGroup(group.id); // auto-join
  return group;
}
export function groupMemberCount(group: SeedGroup): number {
  return group.members + (isGroupMember(group.id) ? 1 : 0);
}

// --- Events (RSVP + waitlist + check-in + rating) -------------------------
export type RsvpStatus = "going" | "waitlist" | "none";

export function getRsvp(eventId: string): RsvpStatus {
  return read<Record<string, RsvpStatus>>(K.rsvps, {})[eventId] ?? "none";
}
/** RSVP toggling, respecting capacity → waitlist. Returns the new status. */
export function toggleRsvp(event: SeedEvent): RsvpStatus {
  const all = read<Record<string, RsvpStatus>>(K.rsvps, {});
  const current = all[eventId(event)] ?? "none";
  let next: RsvpStatus;
  if (current === "none") {
    next = event.going >= event.capacity ? "waitlist" : "going";
  } else {
    next = "none";
  }
  all[eventId(event)] = next;
  write(K.rsvps, all);
  return next;
}
function eventId(e: SeedEvent) {
  return e.id;
}
/** Live "going" count = seed base + this user if going. */
export function goingCount(event: SeedEvent): number {
  return event.going + (getRsvp(event.id) === "going" ? 1 : 0);
}
export function spotsLeft(event: SeedEvent): number {
  return Math.max(0, event.capacity - goingCount(event));
}

export function isCheckedIn(eventId: string): boolean {
  return read<string[]>(K.checkins, []).includes(eventId);
}
export function checkIn(eventId: string) {
  const set = new Set(read<string[]>(K.checkins, []));
  set.add(eventId);
  write(K.checkins, [...set]);
}

export interface EventRating {
  stars: number;
  noShow: boolean;
}
export function getRating(eventId: string): EventRating | null {
  return read<Record<string, EventRating>>(K.ratings, {})[eventId] ?? null;
}
export function rateEvent(eventId: string, stars: number, noShow: boolean) {
  const all = read<Record<string, EventRating>>(K.ratings, {});
  all[eventId] = { stars, noShow };
  write(K.ratings, all);
}

// --- Buddy Table ----------------------------------------------------------
export function isSeated(tableId: string): boolean {
  return read<string[]>(K.seats, []).includes(tableId);
}
export function toggleSeat(tableId: string): string[] {
  const set = new Set(read<string[]>(K.seats, []));
  if (set.has(tableId)) set.delete(tableId);
  else set.add(tableId);
  write(K.seats, [...set]);
  return [...set];
}
export function tableFilledSeats(table: SeedTable): number {
  return table.sitters.length + (isSeated(table.id) ? 1 : 0);
}
/** The venue is revealed only once we're within reveal_hours of the start. */
export function tableRevealed(table: SeedTable): boolean {
  return table.inHours <= table.revealHours;
}
export function tableStartLabel(table: SeedTable): string {
  const days = Math.round(table.inHours / 24);
  if (table.inHours < 24) return `in ${table.inHours} hours`;
  return days <= 1 ? "tomorrow" : `in ${days} days`;
}
