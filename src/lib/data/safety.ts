// Demo safety/verification/moderation store (client-side, localStorage). Mirrors
// the Stage 3 schema + RLS for the preview; swaps to Supabase once auth is real.
export type VerStatus = "none" | "pending" | "verified" | "rejected";

export interface Verification {
  selfie: VerStatus;
  id: VerStatus;
}
export interface TrustedContact {
  id: string;
  name: string;
  phone: string;
}
export interface Report {
  id: string;
  targetType: "user" | "goal" | "message" | "photo" | "event";
  targetId?: string;
  targetName: string;
  reason: string;
  details?: string;
  status: "open" | "reviewing" | "resolved" | "dismissed";
  createdAt: number;
}
export interface ModerationFlag {
  id: string;
  kind: "message" | "photo" | "goal";
  excerpt: string;
  labels: string[];
  severity: "low" | "medium" | "high";
  status: "pending" | "approved" | "removed";
  createdAt: number;
}
export interface CheckIn {
  until: number;
  note: string;
}

const K = {
  ver: "bab_verification",
  contacts: "bab_contacts",
  reports: "bab_reports",
  blocks: "bab_blocks",
  flags: "bab_flags",
  checkin: "bab_checkin",
  mod: "bab_moderator",
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
const id = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

// --- Verification ladder ---------------------------------------------------
export function getVerification(): Verification {
  return read<Verification>(K.ver, { selfie: "none", id: "none" });
}
export function setVerificationStep(step: "selfie" | "id", status: VerStatus) {
  const v = getVerification();
  v[step] = status;
  write(K.ver, v);
  return v;
}
/** Level 1 = phone (always, post sign-in), 2 = selfie, 3 = ID. */
export function verificationLevel(v: Verification = getVerification()): 1 | 2 | 3 {
  if (v.id === "verified") return 3;
  if (v.selfie === "verified") return 2;
  return 1;
}

// --- Trusted contacts ------------------------------------------------------
export function getContacts(): TrustedContact[] {
  return read<TrustedContact[]>(K.contacts, []);
}
export function addContact(name: string, phone: string) {
  const list = getContacts();
  list.push({ id: id(), name: name.trim(), phone: phone.trim() });
  write(K.contacts, list);
  return list;
}
export function removeContact(cid: string) {
  const list = getContacts().filter((c) => c.id !== cid);
  write(K.contacts, list);
  return list;
}

// --- Reports & blocks ------------------------------------------------------
export function getReports(): Report[] {
  return read<Report[]>(K.reports, []);
}
export function addReport(r: Omit<Report, "id" | "status" | "createdAt">) {
  const list = getReports();
  list.unshift({ ...r, id: id(), status: "open", createdAt: Date.now() });
  write(K.reports, list);
  return list;
}
export function setReportStatus(rid: string, status: Report["status"]) {
  const list = getReports().map((r) => (r.id === rid ? { ...r, status } : r));
  write(K.reports, list);
  return list;
}

export function getBlocks(): string[] {
  return read<string[]>(K.blocks, []);
}
export function isBlocked(name: string) {
  return getBlocks().includes(name);
}
export function toggleBlock(name: string) {
  const set = new Set(getBlocks());
  if (set.has(name)) set.delete(name);
  else set.add(name);
  write(K.blocks, [...set]);
  return [...set];
}

// --- Moderation flags ------------------------------------------------------
export function getFlags(): ModerationFlag[] {
  return read<ModerationFlag[]>(K.flags, []);
}
export function addFlag(f: Omit<ModerationFlag, "id" | "status" | "createdAt">) {
  const list = getFlags();
  list.unshift({ ...f, id: id(), status: "pending", createdAt: Date.now() });
  write(K.flags, list);
  return list;
}
export function resolveFlag(fid: string, status: "approved" | "removed") {
  const list = getFlags().map((f) => (f.id === fid ? { ...f, status } : f));
  write(K.flags, list);
  return list;
}

// --- Check-in timer --------------------------------------------------------
export function getCheckIn(): CheckIn | null {
  return read<CheckIn | null>(K.checkin, null);
}
export function startCheckIn(minutes: number, note: string) {
  const c: CheckIn = { until: Date.now() + minutes * 60_000, note };
  write(K.checkin, c);
  return c;
}
export function clearCheckIn() {
  write(K.checkin, null);
}

// --- Moderator mode (demo switch) ------------------------------------------
export function isModerator(): boolean {
  return read<boolean>(K.mod, false);
}
export function setModerator(on: boolean) {
  write(K.mod, on);
}

// --- Trust score (demo calculation) ----------------------------------------
export function trustScore(): number {
  const level = verificationLevel();
  const contacts = getContacts().length > 0 ? 10 : 0;
  const openReports = getReports().filter((r) => r.status === "open").length;
  return Math.max(0, Math.min(100, 40 + level * 15 + contacts - openReports * 10));
}
