import { cn } from "@/lib/utils";

export function Logo({
  className,
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      {/* Three overlapping circles — coral, amber, rose */}
      <svg
        viewBox="0 0 40 38"
        className="h-8 w-8 shrink-0"
        role="img"
        aria-label="Be a Buddy"
      >
        <defs>
          <linearGradient id="bab-coral" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ff7d5e" />
            <stop offset="100%" stopColor="#d4522a" />
          </linearGradient>
          <linearGradient id="bab-amber" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffc657" />
            <stop offset="100%" stopColor="#f4a826" />
          </linearGradient>
          <linearGradient id="bab-rose" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ff93b4" />
            <stop offset="100%" stopColor="#ef6a93" />
          </linearGradient>
        </defs>
        <circle cx="20" cy="25.5" r="10" fill="url(#bab-rose)"  stroke="var(--background)" strokeWidth="1.5" />
        <circle cx="12.5" cy="13"   r="10" fill="url(#bab-coral)" stroke="var(--background)" strokeWidth="1.5" />
        <circle cx="27.5" cy="13"   r="10" fill="url(#bab-amber)" stroke="var(--background)" strokeWidth="1.5" />
      </svg>

      {showWordmark && (
        <span
          className="text-xl font-extrabold tracking-tight leading-none"
          style={{
            background: "linear-gradient(to right, #d4522a 0%, #f4a826 50%, #ef6a93 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          beabuddy.
        </span>
      )}
    </span>
  );
}
