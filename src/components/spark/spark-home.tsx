"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { CalendarHeart, Check, Eye, EyeOff, Heart, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { sparkMixers, sparkSingleById, safeVenues } from "@/data/spark-seed";
import {
  getRsvps,
  isSparkPremium,
  setSparkPremium,
  sparkLike,
  toggleRsvp,
  whoLikedYou,
} from "@/lib/data/spark";

export function SparkHome() {
  const t = useTranslations("spark");
  const [premium, setPremium] = useState(false);
  const [liked, setLiked] = useState<string[]>([]);
  const [rsvps, setRsvps] = useState<string[]>([]);

  useEffect(() => {
    setPremium(isSparkPremium());
    setLiked(whoLikedYou());
    setRsvps(getRsvps());
  }, []);

  function likeBack(id: string) {
    sparkLike(id, true);
    setLiked(whoLikedYou());
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Sparkles className="size-6 text-spark" aria-hidden />
          {t("homeTitle")}
        </h1>
        <button
          type="button"
          role="switch"
          aria-checked={premium}
          onClick={() => {
            const next = !premium;
            setSparkPremium(next);
            setPremium(next);
          }}
          className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          {premium ? t("premiumOnDemo") : t("premiumOffDemo")}
        </button>
      </div>

      {/* Who liked you — premium */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Heart className="size-4 text-spark" aria-hidden />
            {t("whoLikedYou")}
          </CardTitle>
          <Badge variant="spark">{liked.length}</Badge>
        </CardHeader>
        <CardContent>
          {liked.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("noLikesYet")}</p>
          ) : premium ? (
            <div className="space-y-2">
              {liked.map((id) => {
                const s = sparkSingleById(id);
                if (!s) return null;
                return (
                  <div key={id} className="flex items-center gap-3">
                    <Avatar name={s.name} colour={s.colour} />
                    <span className="flex-1 font-medium">
                      {s.name}, {s.age}
                    </span>
                    <Button variant="spark" size="sm" onClick={() => likeBack(id)}>
                      <Heart />
                      {t("likeBack")}
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3 text-center">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <EyeOff className="size-5" aria-hidden />
                <span className="text-sm">{t("lockedLikes", { count: liked.length })}</span>
              </div>
              <Link href="/plans" className={cn(buttonVariants({ variant: "spark" }))}>
                <Eye />
                {t("unlockLikes")}
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Group-first mixers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarHeart className="size-4 text-spark" aria-hidden />
            {t("mixersTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">{t("mixersHint")}</p>
          {sparkMixers.map((m) => {
            const going = rsvps.includes(m.id);
            return (
              <div key={m.id} className="flex items-center gap-3 rounded-lg border p-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    {m.title}
                    {m.womenOnly && (
                      <Badge variant="outline" className="ml-2">
                        {t("womenOnly")}
                      </Badge>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {m.venue} · {m.area} · {m.when}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={going ? "outline" : "spark"}
                  onClick={() => setRsvps(toggleRsvp(m.id))}
                >
                  {going ? t("going") : t("rsvp")}
                </Button>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Godly / intentional dating */}
      <Card className="border-spark/20 bg-spark/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-spark">
            <Heart className="size-4" aria-hidden />
            {t("godlyDatingHeading")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">{t("godlyDatingBody")}</p>
          <ul className="space-y-1.5">
            {([
              t("godlyDatingTip1"),
              t("godlyDatingTip2"),
              t("godlyDatingTip3"),
              t("godlyDatingTip4"),
              t("godlyDatingTip5"),
            ] as string[]).map((tip) => (
              <li key={tip} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 size-4 shrink-0 text-spark" aria-hidden />
                <span className="text-muted-foreground">{tip}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Date safety */}
      <Card className="border-brand-teal/30 bg-brand-teal/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="size-4 text-brand-teal" aria-hidden />
            {t("dateSafetyTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">{t("dateSafetyBody")}</p>
          <div className="flex flex-wrap gap-2">
            {safeVenues.map((v) => (
              <span
                key={v.name}
                className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs"
              >
                <MapPin className="size-3" aria-hidden />
                {v.name} · {v.area}
              </span>
            ))}
          </div>
          <Link href="/safety" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
            {t("openSafetyKit")}
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
