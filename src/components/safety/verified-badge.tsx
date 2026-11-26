"use client";

import { useTranslations } from "next-intl";
import { BadgeCheck, ShieldCheck, ShieldPlus } from "lucide-react";
import { cn } from "@/lib/utils";

/** Compact verification-level badge. 1 = phone, 2 = selfie, 3 = ID verified. */
export function VerifiedBadge({
  level,
  className,
  showLabel = false,
}: {
  level: 1 | 2 | 3;
  className?: string;
  showLabel?: boolean;
}) {
  const t = useTranslations("safety");
  const config = {
    1: { Icon: BadgeCheck, label: t("levelPhone"), tone: "text-muted-foreground" },
    2: { Icon: ShieldCheck, label: t("levelSelfie"), tone: "text-brand-teal" },
    3: { Icon: ShieldPlus, label: t("levelId"), tone: "text-success" },
  }[level];

  return (
    <span
      className={cn("inline-flex items-center gap-1 text-xs font-medium", config.tone, className)}
      title={config.label}
    >
      <config.Icon className="size-4" aria-hidden />
      {showLabel && config.label}
    </span>
  );
}
