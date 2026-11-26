// Client-safe heuristic for explicit / sexual content. Runs without any
// network call so it fires instantly as the user types, with zero false
// negatives on the most common violations. The server-side AI screen is the
// second, stricter layer.
//
// Patterns are intentionally written with word-boundary anchors to avoid
// triggering on legitimate words that happen to share a substring.

const EXPLICIT_ACTS: RegExp[] = [
  /\bsex(ting|ual|ually|y)?\b/i,
  /\bnude(s)?\b/i,
  /\bnaked\b/i,
  /\bporn(o|ography)?\b/i,
  /\bxxx\b/i,
  /\bonlyfans\b/i,
  /\bnsfw\b/i,
  /\bfuck(ing|ed|s)?\b/i,
  /\bsuck (my|it)\b/i,
  /\bsend (me )?nudes?\b/i,
  /\bpic(s|tures?)? of (you|ur|your) (body|boobs?|ass|dick|cock|pussy|vagina)\b/i,
  /\bshow me (your|ur) (body|boobs?|ass|dick|cock|pussy|vagina)\b/i,
  /\bwanna (fuck|hook up)\b/i,
  /\bfriends? with benefits?\b/i,
  /\bhook ?up\b/i,
  /\bboob(s)?\b/i,
  /\bdick pic(s)?\b/i,
  /\bcamgirl\b/i,
  /\bescore?t\b/i,
  /\bprostitut(e|ion)\b/i,
  /\bstrip(per|tease)?\b/i,
  /\bsexual favou?r\b/i,
  /\berotic\b/i,
];

export interface ExplicitSignal {
  flagged: boolean;
}

export function scanForExplicit(text: string): ExplicitSignal {
  return { flagged: EXPLICIT_ACTS.some((r) => r.test(text)) };
}
