// Fallback icebreaker openers (used when no LLM key is configured).
export function icebreakerTemplates(name: string, goal: string): string[] {
  const g = goal.toLowerCase();
  return [
    `Hi ${name}! I saw you want to ${g} — how's it going so far?`,
    `Hey ${name} 👋 I'm working on something similar. Want to be accountability buddies?`,
    `Hi ${name}! What got you started on this?`,
  ];
}
