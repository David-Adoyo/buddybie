"use client";

import { useTranslations } from "next-intl";
import { Ban } from "lucide-react";
import { scanForExplicit } from "@/lib/moderation/explicit";

/** Inline explicit-content block shown as the user types. */
export function ExplicitWarning({ text }: { text: string }) {
  const t = useTranslations("safety");
  const { flagged } = scanForExplicit(text);
  if (!flagged) return null;
  return (
    <p className="flex items-start gap-2 rounded-md bg-destructive/15 px-3 py-2 text-xs font-medium text-destructive">
      <Ban className="mt-0.5 size-4 shrink-0" aria-hidden />
      {t("explicitWarning")}
    </p>
  );
}
