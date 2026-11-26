"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { AlertTriangle, ChevronDown, ChevronUp, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Inline meetup safety disclaimer — shown on every page where users can RSVP
 * or join a real-world meeting (events, Buddy Table, groups). Expanded by
 * default; can be collapsed. Once collapsed the compact bar stays visible so
 * the reminder is always in peripheral view.
 */
export function MeetupDisclaimer({ className }: { className?: string }) {
  const t = useTranslations("meetupDisclaimer");
  const [expanded, setExpanded] = useState(true);

  const tips = [
    t("tip1"),
    t("tip2"),
    t("tip3"),
    t("tip4"),
    t("tip5"),
  ] as const;

  return (
    <div
      role="note"
      aria-label={t("heading")}
      className={cn(
        "rounded-xl border border-amber-200 bg-amber-50/80 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200",
        className,
      )}
    >
      {/* Header row — always visible */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left hover:bg-amber-100/50 dark:hover:bg-amber-900/20"
      >
        <span className="flex items-center gap-2 font-semibold text-sm">
          <AlertTriangle className="size-4 shrink-0 text-amber-500" aria-hidden />
          {t("heading")}
        </span>
        {expanded ? (
          <ChevronUp className="size-4 shrink-0 text-amber-500" aria-hidden />
        ) : (
          <ChevronDown className="size-4 shrink-0 text-amber-500" aria-hidden />
        )}
      </button>

      {expanded && (
        <div className="border-t border-amber-200/70 px-4 pb-4 pt-3 dark:border-amber-900/30">
          <ol className="space-y-2">
            {tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm">
                <span
                  aria-hidden
                  className="flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-200/70 text-xs font-bold text-amber-800 dark:bg-amber-900/60 dark:text-amber-200"
                >
                  {i + 1}
                </span>
                {tip}
              </li>
            ))}
          </ol>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/safety"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-700 hover:underline dark:text-amber-300"
            >
              <ShieldCheck className="size-4" aria-hidden />
              {t("kitLink")}
            </Link>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="text-xs text-amber-600 hover:underline dark:text-amber-400"
            >
              {t("dismiss")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
