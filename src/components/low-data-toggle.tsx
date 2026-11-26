"use client";

import { useTranslations } from "next-intl";
import { Zap } from "lucide-react";
import { useLowData } from "@/components/providers/low-data-provider";
import { cn } from "@/lib/utils";

export function LowDataToggle() {
  const { lowData, setLowData } = useLowData();
  const t = useTranslations("footer");

  return (
    <button
      type="button"
      role="switch"
      aria-checked={lowData}
      onClick={() => setLowData(!lowData)}
      className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <Zap className="size-4" aria-hidden />
      {t("lowData")}
      <span
        className={cn(
          "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
          lowData ? "bg-primary" : "bg-input",
        )}
      >
        <span
          className={cn(
            "inline-block size-4 rounded-full bg-white shadow transition-transform",
            lowData ? "translate-x-4" : "translate-x-0.5",
          )}
        />
      </span>
    </button>
  );
}
