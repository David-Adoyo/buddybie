import { cn } from "@/lib/utils";

/** Logo palette — sampled from the "buddybie." wordmark (logo.jpeg). */
export const BRAND = {
  red: { from: "#ef5a45", to: "#d83a33" },
  orange: { from: "#ffa05e", to: "#f57a45" },
  pink: { from: "#ff7aab", to: "#f04c8c" },
} as const;

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 38" className={cn("h-8 w-8 shrink-0", className)} aria-hidden>
      <defs>
        <linearGradient id="bab-red" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={BRAND.red.from} />
          <stop offset="100%" stopColor={BRAND.red.to} />
        </linearGradient>
        <linearGradient id="bab-orange" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={BRAND.orange.from} />
          <stop offset="100%" stopColor={BRAND.orange.to} />
        </linearGradient>
        <linearGradient id="bab-pink" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={BRAND.pink.from} />
          <stop offset="100%" stopColor={BRAND.pink.to} />
        </linearGradient>
      </defs>
      <circle cx="20" cy="25.5" r="10" fill="url(#bab-pink)" stroke="var(--background)" strokeWidth="1.5" />
      <circle cx="12.5" cy="13" r="10" fill="url(#bab-red)" stroke="var(--background)" strokeWidth="1.5" />
      <circle cx="27.5" cy="13" r="10" fill="url(#bab-orange)" stroke="var(--background)" strokeWidth="1.5" />
    </svg>
  );
}

export function Logo({
  className,
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark />
      {showWordmark ? (
        <span className="text-brand-gradient font-display text-2xl font-bold leading-none tracking-tight">
          buddybie.
        </span>
      ) : (
        <span className="sr-only">Buddybie</span>
      )}
    </span>
  );
}
