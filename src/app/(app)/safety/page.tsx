"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ShieldCheck } from "lucide-react";
import { VerificationLadder } from "@/components/safety/verification-ladder";
import { SafetyKit } from "@/components/safety/safety-kit";
import { VerifiedBadge } from "@/components/safety/verified-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { trustScore, verificationLevel } from "@/lib/data/safety";

type Tab = "verify" | "kit";

export default function SafetyPage() {
  const t = useTranslations("safety");
  const [tab, setTab] = useState<Tab>("verify");
  const [level, setLevel] = useState<1 | 2 | 3>(1);
  const [score, setScore] = useState(0);

  function recompute() {
    setLevel(verificationLevel());
    setScore(trustScore());
  }
  useEffect(recompute, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <ShieldCheck className="size-6 text-brand-teal" aria-hidden />
          {t("title")}
        </h1>
        <p className="mt-1 text-muted-foreground">{t("subtitle")}</p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <VerifiedBadge level={level} showLabel />
          </div>
          <div className="min-w-0 flex-1 sm:max-w-xs">
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t("trustScore")}</span>
              <span className="font-semibold tabular-nums">{score}</span>
            </div>
            <Progress value={score} />
          </div>
        </CardContent>
      </Card>

      <div className="inline-flex rounded-lg border p-1">
        {(["verify", "kit"] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
              tab === key
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {key === "verify" ? t("tabVerify") : t("tabKit")}
          </button>
        ))}
      </div>

      {tab === "verify" ? (
        <VerificationLadder onChange={recompute} />
      ) : (
        <SafetyKit />
      )}
    </div>
  );
}
