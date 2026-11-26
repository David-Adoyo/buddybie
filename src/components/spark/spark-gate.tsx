"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Check, Circle, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { sparkEligibility, type SparkEligibility } from "@/lib/data/spark";

/** Gates the Spark dating surfaces behind 18+ confirmation and ID verification. */
export function SparkGate({ children }: { children: React.ReactNode }) {
  const t = useTranslations("spark");
  const [elig, setElig] = useState<SparkEligibility | null>(null);

  useEffect(() => setElig(sparkEligibility()), []);

  if (!elig) return null;
  if (elig.eligible) return <>{children}</>;

  const steps = [
    { done: elig.hasProfile && elig.confirmed18, label: t("gateProfile"), href: "/profile", cta: t("gateProfileCta") },
    { done: elig.idVerified, label: t("gateId"), href: "/safety", cta: t("gateIdCta") },
  ];

  return (
    <div className="space-y-6">
      <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
        <Sparkles className="size-6 text-spark" aria-hidden />
        {t("gateTitle")}
      </h1>
      <p className="text-muted-foreground">{t("gateBody")}</p>

      <div className="space-y-3">
        {steps.map((s) => (
          <Card key={s.label} className="flex items-center gap-3 p-4">
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full",
                s.done ? "bg-success/15 text-success" : "bg-secondary text-muted-foreground",
              )}
            >
              {s.done ? <Check className="size-4" /> : <Circle className="size-4" />}
            </span>
            <span className="flex-1 font-medium">{s.label}</span>
            {!s.done && (
              <Link href={s.href} className={cn(buttonVariants({ variant: "spark", size: "sm" }))}>
                {s.cta}
              </Link>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
