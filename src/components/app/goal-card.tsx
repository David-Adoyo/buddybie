"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Ban,
  Flag,
  Heart,
  HeartHandshake,
  MoreVertical,
  Trash2,
  UserPlus,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { VerifiedBadge } from "@/components/safety/verified-badge";
import { ReportDialog } from "@/components/safety/report-dialog";
import { toggleBlock } from "@/lib/data/safety";
import { cn } from "@/lib/utils";
import type { Goal } from "@/lib/types";

interface Counts {
  cheers: number;
  joins: number;
  cheered: boolean;
  joined: boolean;
  accountability: boolean;
}

export function GoalCard({
  goal,
  mine,
  authorLevel,
  counts,
  onCheer,
  onJoin,
  onAccountability,
  onRemove,
  onChanged,
}: {
  goal: Goal;
  mine: boolean;
  authorLevel?: 1 | 2 | 3;
  counts: Counts;
  onCheer: () => void;
  onJoin: () => void;
  onAccountability: () => void;
  onRemove?: () => void;
  onChanged?: () => void;
}) {
  const t = useTranslations("goals");
  const ts = useTranslations("safety");
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const level = mine ? (authorLevel ?? 1) : (goal.owner.verifiedLevel ?? 1);

  return (
    <Card className="relative p-4">
      <div className="flex items-start gap-3">
        <Avatar name={goal.owner.name} colour={goal.owner.colour} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-medium">
              {mine ? t("you") : goal.owner.name}
            </span>
            <VerifiedBadge level={level} />
            {mine && (
              <Badge variant="secondary" className="shrink-0">
                {t("you")}
              </Badge>
            )}
          </div>
          <h3 className="mt-1 font-semibold leading-snug">{goal.title}</h3>
          {goal.description && (
            <p className="mt-1 text-sm text-muted-foreground">
              {goal.description}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onCheer}
              aria-pressed={counts.cheered}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
                counts.cheered ? "border-primary bg-primary/10 text-primary" : "hover:bg-secondary",
              )}
            >
              <Heart className={cn("size-4", counts.cheered && "fill-current")} aria-hidden />
              {t("cheer")}
              <span className="tabular-nums text-muted-foreground">{counts.cheers}</span>
            </button>

            <button
              type="button"
              onClick={onJoin}
              aria-pressed={counts.joined}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
                counts.joined ? "border-success bg-success/10 text-success" : "hover:bg-secondary",
              )}
            >
              <UserPlus className="size-4" aria-hidden />
              {counts.joined ? t("joined") : t("join")}
              <span className="tabular-nums text-muted-foreground">{counts.joins}</span>
            </button>

            {!mine && (
              <button
                type="button"
                onClick={onAccountability}
                aria-pressed={counts.accountability}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
                  counts.accountability
                    ? "border-accent bg-accent/15 text-accent-foreground"
                    : "hover:bg-secondary",
                )}
              >
                <HeartHandshake className="size-4" aria-hidden />
                {counts.accountability ? t("accountabilitySent") : t("accountability")}
              </button>
            )}

            {mine && onRemove && (
              <button
                type="button"
                onClick={onRemove}
                className="ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-destructive"
              >
                <Trash2 className="size-4" aria-hidden />
                {t("remove")}
              </button>
            )}
          </div>
        </div>

        {!mine && (
          <div className="relative">
            <button
              type="button"
              aria-label={ts("moreActions")}
              onClick={() => setMenuOpen((v) => !v)}
              className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <MoreVertical className="size-5" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" aria-hidden onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 z-50 mt-1 w-40 overflow-hidden rounded-lg border bg-popover p-1 shadow-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      setReportOpen(true);
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-secondary"
                  >
                    <Flag className="size-4" aria-hidden />
                    {ts("report")}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      toggleBlock(goal.owner.name);
                      onChanged?.();
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
                  >
                    <Ban className="size-4" aria-hidden />
                    {ts("block")}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <ReportDialog
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        targetName={goal.owner.name}
        targetType="goal"
        targetId={goal.id}
      />
    </Card>
  );
}
