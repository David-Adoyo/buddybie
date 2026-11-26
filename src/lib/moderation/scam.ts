// Romance-scam / money-request heuristic. Pure and dependency-free so it runs
// both client-side (inline warnings as you type) and server-side (pre-screen
// fallback when no LLM key is configured).
const MONEY = [
  /\bvenmo\b/i,
  /\bzelle\b/i,
  /\bcash ?app\b/i,
  /\bwestern union\b/i,
  /\bgift ?cards?\b/i,
  /\bwire( me)?\b/i,
  /send (me )?(some )?(money|cash|funds)/i,
  /\bcrypto(currency)?\b/i,
  /\bbitcoin\b/i,
  /\$\s?\d/,
];
const OFFAPP = [
  /\bwhats ?app\b/i,
  /\btelegram\b/i,
  /\bmy number is\b/i,
  /\btext me (on|at)\b/i,
  /\bemail me (at|on)\b/i,
];
const URGENCY = [
  /\bemergency\b/i,
  /\burgent(ly)?\b/i,
  /\bstranded\b/i,
  /\bhelp me pay\b/i,
  /\bneed .* (today|now|urgent)/i,
];

export interface ScamSignal {
  flagged: boolean;
  reasons: ("money" | "offapp" | "urgency")[];
}

export function scanForScam(text: string): ScamSignal {
  const reasons: ScamSignal["reasons"] = [];
  if (MONEY.some((r) => r.test(text))) reasons.push("money");
  if (OFFAPP.some((r) => r.test(text))) reasons.push("offapp");
  if (URGENCY.some((r) => r.test(text))) reasons.push("urgency");
  return { flagged: reasons.length > 0, reasons };
}
