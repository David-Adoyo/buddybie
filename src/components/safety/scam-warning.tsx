"use client";

import { useTranslations } from "next-intl";
import { ShieldAlert } from "lucide-react";
import { scanForScam } from "@/lib/moderation/scam";

/** Inline romance-scam / money-request warning shown as the user types. */
export function ScamWarning({ text }: { text: string }) {
  const t = useTranslations("safety");
  const { flagged } = scanForScam(text);
  if (!flagged) return null;
  return (
    <p className="flex items-start gap-2 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
      <ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
      {t("scamWarning")}
    </p>
  );
}
