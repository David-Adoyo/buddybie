"use client";

import { useTranslations } from "next-intl";
import { Heart, Target, X } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { VerifiedBadge } from "@/components/safety/verified-badge";
import type { Member } from "@/lib/types";
import type { MatchResult } from "@/lib/matching/score";

export function SuggestionCard({
  member,
  goals,
  result,
  onConnect,
  onPass,
}: {
  member: Member;
  goals: string[];
  result: MatchResult;
  onConnect: () => void;
  onPass: () => void;
}) {
  const t = useTranslations("matches");

  const phrases = result.reasons.map((r) => {
    if (r.kind === "goal") return t("phraseGoal", { keyword: r.value });
    if (r.kind === "area") return t("phraseArea", { area: r.value });
    return t("phraseTrait", { trait: t(`trait_${r.value}`) });
  });
  const why = phrases.length > 0 ? phrases.join(" · ") : t("whyGeneric");

  return (
    <Card className="p-5">
      <div className="flex items-start gap-3">
        <Avatar name={member.name} colour={member.colour} className="size-12" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-lg font-semibold">{member.name}</span>
            <VerifiedBadge level={member.verifiedLevel ?? 1} />
          </div>
          <p className="text-sm text-muted-foreground">
            {member.area}
            {member.availability?.length ? ` · ${member.availability.join(", ")}` : ""}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-sm font-semibold text-primary">
          {result.score}% {t("match")}
        </span>
      </div>

      <p className="mt-3 rounded-md bg-secondary px-3 py-2 text-sm">
        <span className="font-medium">{t("whyLabel")}:</span> {why}
      </p>

      <ul className="mt-3 space-y-1">
        {goals.slice(0, 2).map((g, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
            <Target className="size-4 shrink-0 text-primary" aria-hidden />
            {g}
          </li>
        ))}
      </ul>

      <div className="mt-4 flex gap-2">
        <Button variant="outline" className="flex-1" onClick={onPass}>
          <X />
          {t("pass")}
        </Button>
        <Button className="flex-1" onClick={onConnect}>
          <Heart />
          {t("connect")}
        </Button>
      </div>
    </Card>
  );
}
