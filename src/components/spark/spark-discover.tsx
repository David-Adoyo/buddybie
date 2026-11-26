"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Heart, PartyPopper, Sparkles, X } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { VerifiedBadge } from "@/components/safety/verified-badge";
import { cn } from "@/lib/utils";
import { loadOnboarding } from "@/lib/onboarding";
import { getSparkProfile, isSparkSeen, sparkLike, sparkPass } from "@/lib/data/spark";
import { scoreSpark } from "@/lib/matching/spark-score";
import { sparkSingles, type SparkSingle } from "@/data/spark-seed";

export function SparkDiscover() {
  const t = useTranslations("spark");
  const profile = getSparkProfile();
  const [faithOnly, setFaithOnly] = useState(false);
  const [index, setIndex] = useState(0);
  const [matched, setMatched] = useState<SparkSingle | null>(null);
  const [sent, setSent] = useState<string | null>(null);

  const me = useMemo(
    () => ({
      intent: profile?.intent ?? "serious",
      faith: profile?.faith ?? "",
      faithImportance: profile?.faithImportance ?? "somewhat",
      area: loadOnboarding()?.area ?? "",
    }),
    [profile],
  );

  const candidates = useMemo(() => {
    return sparkSingles
      .filter((s) => !isSparkSeen(s.id))
      .filter((s) => (faithOnly && me.faith ? s.faith === me.faith : true))
      .map((s) => ({ single: s, result: scoreSpark(me, s) }))
      .sort((a, b) => b.result.score - a.result.score);
  }, [me, faithOnly]);

  const current = candidates[index];

  function onConnect() {
    if (!current) return;
    const isMatch = sparkLike(current.single.id, Boolean(current.single.likesYou));
    if (isMatch) setMatched(current.single);
    else setSent(current.single.name);
    setIndex((i) => i + 1);
  }
  function onPass() {
    if (!current) return;
    sparkPass(current.single.id);
    setIndex((i) => i + 1);
  }

  const phrases = current
    ? current.result.reasons.map((r) =>
        r.kind === "intent"
          ? t("phraseIntent", { intent: t(`intent_${r.value}`) })
          : r.kind === "faith"
            ? t("phraseFaith", { faith: r.value })
            : t("phraseArea", { area: r.value }),
      )
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Sparkles className="size-6 text-spark" aria-hidden />
          {t("discoverTitle")}
        </h1>
        <button
          type="button"
          role="switch"
          aria-checked={faithOnly}
          onClick={() => {
            setFaithOnly((v) => !v);
            setIndex(0);
          }}
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
            faithOnly ? "border-spark bg-spark/10 text-spark" : "hover:bg-secondary",
          )}
        >
          {t("faithFilter")}
        </button>
      </div>

      {current ? (
        <Card className="overflow-hidden">
          <div className="h-2 bg-spark" />
          <CardContent className="space-y-3 p-5">
            <div className="flex items-start gap-3">
              <Avatar name={current.single.name} colour={current.single.colour} className="size-14" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">
                    {current.single.name}, {current.single.age}
                  </span>
                  <VerifiedBadge level={current.single.verifiedLevel ?? 1} />
                </div>
                <p className="text-sm text-muted-foreground">{current.single.area}</p>
              </div>
              <span className="shrink-0 rounded-full bg-spark/10 px-2.5 py-1 text-sm font-semibold text-spark">
                {current.result.score}%
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="spark">{t(`intent_${current.single.intent}`)}</Badge>
              {current.single.faith && <Badge variant="outline">{current.single.faith}</Badge>}
            </div>

            <p className="text-sm">{current.single.bio}</p>

            {phrases.length > 0 && (
              <p className="rounded-md bg-secondary px-3 py-2 text-sm">
                <span className="font-medium">{t("whyLabel")}:</span> {phrases.join(" · ")}
              </p>
            )}

            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1" onClick={onPass}>
                <X />
                {t("pass")}
              </Button>
              <Button variant="spark" className="flex-1" onClick={onConnect}>
                <Heart />
                {t("like")}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="space-y-2 p-8 text-center">
            <h2 className="text-xl font-bold">{t("discoverEmptyTitle")}</h2>
            <p className="text-sm text-muted-foreground">{t("discoverEmptyBody")}</p>
          </CardContent>
        </Card>
      )}

      <Dialog
        open={matched !== null}
        onClose={() => setMatched(null)}
        title={t("matchTitle")}
        description={matched ? t("matchBody", { name: matched.name }) : undefined}
      >
        <div className="flex flex-col items-center gap-4">
          <PartyPopper className="size-10 text-spark" aria-hidden />
          <div className="flex w-full gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setMatched(null)}>
              {t("matchLater")}
            </Button>
            <Link href={`/chat/${matched?.id ?? ""}`} className={cn(buttonVariants({ variant: "spark" }), "flex-1")}>
              {t("matchChat")}
            </Link>
          </div>
        </div>
      </Dialog>

      <Dialog
        open={sent !== null}
        onClose={() => setSent(null)}
        title={t("sentTitle")}
        description={sent ? t("sentBody", { name: sent }) : undefined}
      >
        <Button variant="spark" className="w-full" onClick={() => setSent(null)}>
          {t("sentOk")}
        </Button>
      </Dialog>
    </div>
  );
}
