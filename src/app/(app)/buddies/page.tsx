"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { PartyPopper, Sparkles } from "lucide-react";
import { useActiveCircle } from "@/lib/active-circle";
import { SparkGate } from "@/components/spark/spark-gate";
import { SparkDiscover } from "@/components/spark/spark-discover";
import { planCodeForCircle } from "@/components/app/premium-gate";
import { planByCode } from "@/data/plans";
import { SuggestionCard } from "@/components/match/suggestion-card";
import { Dialog } from "@/components/ui/dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { circleCandidates } from "@/data/demo-seed";
import { loadOnboarding } from "@/lib/onboarding";
import { computeTraits, scoreCandidate, type MatchResult } from "@/lib/matching/score";
import { isSeen, like, pass } from "@/lib/data/match";
import type { Member } from "@/lib/types";

interface Scored {
  member: Member;
  goals: string[];
  result: MatchResult;
}

export default function BuddiesPage() {
  const t = useTranslations("matches");
  const { activeCircle } = useActiveCircle();

  const [index, setIndex] = useState(0);
  const [usage, setUsage] = useState({ limit: 5, used: 0, remaining: 5 });
  const [matched, setMatched] = useState<Member | null>(null);
  const [sent, setSent] = useState<string | null>(null);

  const me = useMemo(() => {
    const onboarding = loadOnboarding();
    return {
      goals: onboarding?.goals ?? [],
      area: onboarding?.area ?? "",
      traits: computeTraits(onboarding?.quiz ?? {}),
    };
  }, []);

  const candidates = useMemo<Scored[]>(() => {
    if (!activeCircle || activeCircle.isSpark) return [];
    return circleCandidates(activeCircle.id)
      .filter((c) => !isSeen(c.member.id))
      .map((c) => ({ ...c, result: scoreCandidate(me, c.member, c.goals) }))
      .sort((a, b) => b.result.score - a.result.score);
  }, [activeCircle, me]);

  useEffect(() => {
    fetch("/api/suggestions")
      .then((r) => r.json())
      .then((d) => setUsage(d))
      .catch(() => {});
    setIndex(0);
  }, [activeCircle]);

  if (!activeCircle) return null;
  if (activeCircle.isSpark) {
    return (
      <SparkGate>
        <SparkDiscover />
      </SparkGate>
    );
  }

  const limitReached = usage.remaining <= 0;
  const current = candidates[index];
  const circlePlanCode = activeCircle ? planCodeForCircle(activeCircle.id) : undefined;
  const circlePlan = circlePlanCode ? planByCode(circlePlanCode) : undefined;

  async function consume() {
    try {
      const res = await fetch("/api/suggestions", { method: "POST" });
      const data = await res.json();
      setUsage(data);
    } catch {
      /* allow in demo if the route is unavailable */
    }
  }

  async function onConnect() {
    if (!current) return;
    const isMatch = like(current.member.id, Boolean(current.member.likesYou));
    if (isMatch) setMatched(current.member);
    else setSent(current.member.name);
    await consume();
    setIndex((i) => i + 1);
  }

  async function onPass() {
    if (!current) return;
    pass(current.member.id);
    await consume();
    setIndex((i) => i + 1);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Sparkles className="size-6 text-primary" aria-hidden />
          {t("title")}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {t("subtitleIn", { circle: activeCircle.name })}
        </p>
      </div>

      <p className="text-sm text-muted-foreground">
        {t("dailyRemaining", { remaining: usage.remaining, limit: usage.limit })}
      </p>

      {limitReached ? (
        <Card className="overflow-hidden">
          <div
            className="px-5 py-3"
            style={{
              backgroundColor: activeCircle ? `${activeCircle.accent}12` : undefined,
            }}
          >
            <p className="text-sm font-semibold" style={{ color: activeCircle?.accent }}>
              {circlePlan?.name ?? t("limitTitle")}
            </p>
          </div>
          <CardContent className="space-y-3 p-5">
            <p className="text-sm text-muted-foreground">
              {circlePlan
                ? `Unlock unlimited suggestions for $${circlePlan.monthly}/month.`
                : t("limitBody")}
            </p>
            {circlePlan?.features && (
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                {circlePlan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                    {f}
                  </li>
                ))}
              </ul>
            )}
            <Link
              href={circlePlanCode ? `/plans?highlight=${circlePlanCode}` : "/plans"}
              className={cn(buttonVariants())}
            >
              {circlePlan
                ? `Get ${circlePlan.name} — $${circlePlan.monthly}/mo`
                : t("limitUpgrade")}
            </Link>
          </CardContent>
        </Card>
      ) : current ? (
        <SuggestionCard
          key={current.member.id}
          member={current.member}
          goals={current.goals}
          result={current.result}
          onConnect={onConnect}
          onPass={onPass}
        />
      ) : (
        <Card>
          <CardContent className="space-y-2 p-8 text-center">
            <h2 className="text-xl font-bold">{t("emptyTitle")}</h2>
            <p className="text-sm text-muted-foreground">{t("emptyBody")}</p>
          </CardContent>
        </Card>
      )}

      {/* It's a match */}
      <Dialog
        open={matched !== null}
        onClose={() => setMatched(null)}
        title={t("matchTitle")}
        description={matched ? t("matchBody", { name: matched.name }) : undefined}
      >
        <div className="flex flex-col items-center gap-4">
          <PartyPopper className="size-10 text-primary" aria-hidden />
          <div className="flex w-full gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setMatched(null)}>
              {t("matchLater")}
            </Button>
            <Link
              href={`/chat/${matched?.id ?? ""}`}
              className={cn(buttonVariants(), "flex-1")}
            >
              {t("matchChat")}
            </Link>
          </div>
        </div>
      </Dialog>

      {/* Request sent */}
      <Dialog
        open={sent !== null}
        onClose={() => setSent(null)}
        title={t("sentTitle")}
        description={sent ? t("sentBody", { name: sent }) : undefined}
      >
        <Button className="w-full" onClick={() => setSent(null)}>
          {t("sentOk")}
        </Button>
      </Dialog>
    </div>
  );
}
