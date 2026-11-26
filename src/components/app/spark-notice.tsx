"use client";

import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

/** Shown when Spark is the active Circle: it is isolated and opens in Stage 5. */
export function SparkNotice() {
  const t = useTranslations("app");
  return (
    <Card className="flex flex-col items-center gap-3 border-spark/30 bg-spark/5 p-10 text-center">
      <span className="flex size-12 items-center justify-center rounded-xl bg-spark/15 text-spark">
        <Sparkles className="size-6" aria-hidden />
      </span>
      <h2 className="text-xl font-bold">{t("sparkTitle")}</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        {t("sparkBody")}
      </p>
    </Card>
  );
}
