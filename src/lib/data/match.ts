// Demo matching + chat store (client-side, localStorage). Mirrors the Stage 4
// schema: likes, mutual matches, and per-match conversations. Swaps to Supabase
// (+ Realtime) once auth is real.
export type MsgFrom = "me" | "them";
export interface ChatMessage {
  id: string;
  from: MsgFrom;
  body: string;
  at: number;
}

const K = {
  likes: "bab_likes",
  matches: "bab_matches",
  passes: "bab_passes",
  msgs: "bab_messages",
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

export function getLikes(): string[] {
  return read<string[]>(K.likes, []);
}
export function getMatches(): string[] {
  return read<string[]>(K.matches, []);
}
export function getPasses(): string[] {
  return read<string[]>(K.passes, []);
}
export function isSeen(memberId: string): boolean {
  return getLikes().includes(memberId) || getPasses().includes(memberId);
}

/** Record a like. Returns true if it formed a mutual match. */
export function like(memberId: string, reciprocated: boolean): boolean {
  const likes = new Set(getLikes());
  likes.add(memberId);
  write(K.likes, [...likes]);
  if (reciprocated) {
    const matches = new Set(getMatches());
    matches.add(memberId);
    write(K.matches, [...matches]);
  }
  return reciprocated;
}

export function pass(memberId: string) {
  const passes = new Set(getPasses());
  passes.add(memberId);
  write(K.passes, [...passes]);
}

// --- Chat ------------------------------------------------------------------
export function getMessages(memberId: string): ChatMessage[] {
  const all = read<Record<string, ChatMessage[]>>(K.msgs, {});
  return all[memberId] ?? [];
}
export function sendMessage(memberId: string, from: MsgFrom, body: string): ChatMessage[] {
  const all = read<Record<string, ChatMessage[]>>(K.msgs, {});
  const list = all[memberId] ?? [];
  list.push({ id: id(), from, body: body.trim(), at: Date.now() });
  all[memberId] = list;
  write(K.msgs, all);
  return list;
}
