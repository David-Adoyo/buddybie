"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Plus, ShieldAlert } from "lucide-react";
import { useActiveCircle } from "@/lib/active-circle";
import { SparkNotice } from "@/components/app/spark-notice";
import { GoalCard } from "@/components/app/goal-card";
import { ScamWarning } from "@/components/safety/scam-warning";
import { ExplicitWarning } from "@/components/safety/explicit-warning";
import { scanForExplicit } from "@/lib/moderation/explicit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  addUserGoal,
  isMine,
  listGoals,
  loadSupport,
  removeUserGoal,
  supportCounts,
  toggleSupport,
} from "@/lib/data/store";
import { addFlag, isBlocked, verificationLevel } from "@/lib/data/safety";
import type { Goal, SupportMap, SupportType } from "@/lib/types";

interface ScreenResult {
  allowed: boolean;
  severity: "low" | "medium" | "high";
  labels: string[];
  reason: string;
}

export default function GoalsPage() {
  const t = useTranslations("goals");
  const { activeCircle } = useActiveCircle();

  const [goals, setGoals] = useState<Goal[]>([]);
  const [support, setSupport] = useState<SupportMap>({});
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [posting, setPosting] = useState(false);
  const [blockedMsg, setBlockedMsg] = useState<string | null>(null);
  const [myLevel, setMyLevel] = useState<1 | 2 | 3>(1);

  function refresh(circleId: string) {
    setGoals(
      listGoals(circleId as Goal["circleId"]).filter(
        (g) => isMine(g) || !isBlocked(g.owner.name),
      ),
    );
    setSupport(loadSupport());
  }

  useEffect(() => {
    if (!activeCircle || activeCircle.isSpark) return;
    setMyLevel(verificationLevel());
    refresh(activeCircle.id);
  }, [activeCircle]);

  if (!activeCircle) return null;
  if (activeCircle.isSpark) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <SparkNotice />
      </div>
    );
  }

  function support_(goalId: string, type: SupportType) {
    setSupport({ ...toggleSupport(goalId, type) });
  }

  async function post() {
    if (!title.trim() || !activeCircle) return;
    setPosting(true);
    setBlockedMsg(null);
    const text = `${title}\n${description}`.trim();
    let result: ScreenResult = { allowed: true, severity: "low", labels: [], reason: "" };
    try {
      const res = await fetch("/api/moderate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text, kind: "goal" }),
      });
      if (res.ok) result = (await res.json()) as ScreenResult;
    } catch {
      // Pre-screen unavailable — allow in the demo rather than blocking the user.
    }

    if (result.allowed) {
      addUserGoal(activeCircle.id, title, description);
      setTitle("");
      setDescription("");
      refresh(activeCircle.id);
    } else {
      addFlag({
        kind: "goal",
        excerpt: title,
        labels: result.labels,
        severity: result.severity,
      });
      setBlockedMsg(result.reason);
    }
    setPosting(false);
  }

  function remove(id: string) {
    removeUserGoal(id);
    if (activeCircle) refresh(activeCircle.id);
  }

  const composer = `${title} ${description}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="mt-1 text-muted-foreground">
          {t("subtitleIn", { circle: activeCircle.name })}
        </p>
      </div>

      <Card className="space-y-3 p-4">
        <p className="font-medium">{t("postTitle")}</p>
        <Input
          placeholder={t("postPlaceholder")}
          value={title}
          maxLength={120}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Textarea
          placeholder={t("postDescPlaceholder")}
          value={description}
          maxLength={280}
          onChange={(e) => setDescription(e.target.value)}
        />
        <ExplicitWarning text={composer} />
        <ScamWarning text={composer} />
        {blockedMsg && (
          <p className="flex items-start gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            {blockedMsg}
          </p>
        )}
        <div className="flex justify-end">
          <Button onClick={post} disabled={!title.trim() || posting || scanForExplicit(composer).flagged}>
            {posting ? <Loader2 className="size-4 animate-spin" /> : <Plus />}
            {t("post")}
          </Button>
        </div>
      </Card>

      {goals.length === 0 ? (
        <p className="py-10 text-center text-muted-foreground">{t("empty")}</p>
      ) : (
        <div className="space-y-3">
          {goals.map((goal) => {
            const counts = supportCounts(goal, support);
            const mine = isMine(goal);
            return (
              <GoalCard
                key={goal.id}
                goal={goal}
                mine={mine}
                authorLevel={mine ? myLevel : undefined}
                counts={counts}
                onCheer={() => support_(goal.id, "cheer")}
                onJoin={() => support_(goal.id, "join")}
                onAccountability={() => support_(goal.id, "accountability")}
                onRemove={mine ? () => remove(goal.id) : undefined}
                onChanged={() => activeCircle && refresh(activeCircle.id)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
