"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Check, Sparkles, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { verificationLevel } from "@/lib/data/safety";
import {
  emptySparkProfile,
  getSparkProfile,
  saveSparkProfile,
  type SparkProfile,
} from "@/lib/data/spark";

const selectClass =
  "flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spark";

export function SparkProfileEditor() {
  const t = useTranslations("spark");
  const [p, setP] = useState<SparkProfile>(emptySparkProfile);
  const [saved, setSaved] = useState(false);
  const [idVerified, setIdVerified] = useState(false);

  useEffect(() => {
    setP(getSparkProfile() ?? emptySparkProfile);
    setIdVerified(verificationLevel() === 3);
  }, []);

  function set<K extends keyof SparkProfile>(key: K, value: SparkProfile[K]) {
    setP((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Sparkles className="size-6 text-spark" aria-hidden />
          {t("profileTitle")}
        </h1>
        <p className="mt-1 text-muted-foreground">{t("profileSubtitle")}</p>
      </div>

      {!idVerified && (
        <Card className="flex items-start gap-3 border-spark/30 bg-spark/5 p-4">
          <TriangleAlert className="mt-0.5 size-5 shrink-0 text-spark" aria-hidden />
          <div className="text-sm">
            <p className="font-medium">{t("needId")}</p>
            <Link href="/safety" className="text-spark hover:underline">
              {t("goVerify")}
            </Link>
          </div>
        </Card>
      )}

      <Card className="space-y-4 p-5">
        <label className="flex items-start gap-3 rounded-lg border p-3">
          <input
            type="checkbox"
            checked={p.confirmed18}
            onChange={(e) => set("confirmed18", e.target.checked)}
            className="mt-0.5 size-4"
          />
          <span className="text-sm font-medium">{t("confirm18")}</span>
        </label>

        <div className="grid gap-2">
          <Label>{t("intent")}</Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(["godly", "serious", "casual", "friends"] as const).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => set("intent", opt)}
                className={cn(
                  "rounded-lg border px-3 py-2 text-sm font-medium transition-all",
                  p.intent === opt
                    ? "border-spark bg-spark/10 text-spark ring-2 ring-spark"
                    : "hover:bg-secondary",
                )}
              >
                {t(`intent_${opt}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="faith">{t("faith")}</Label>
            <Input
              id="faith"
              value={p.faith}
              placeholder={t("faithPlaceholder")}
              onChange={(e) => set("faith", e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="faithImp">{t("faithImportance")}</Label>
            <select
              id="faithImp"
              className={selectClass}
              value={p.faithImportance}
              onChange={(e) => set("faithImportance", e.target.value as SparkProfile["faithImportance"])}
            >
              <option value="not">{t("faithImp_not")}</option>
              <option value="somewhat">{t("faithImp_somewhat")}</option>
              <option value="very">{t("faithImp_very")}</option>
            </select>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="children">{t("children")}</Label>
            <select
              id="children"
              className={selectClass}
              value={p.wantsChildren}
              onChange={(e) => set("wantsChildren", e.target.value as SparkProfile["wantsChildren"])}
            >
              <option value="yes">{t("children_yes")}</option>
              <option value="no">{t("children_no")}</option>
              <option value="open">{t("children_open")}</option>
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="age">{t("age")}</Label>
            <Input
              id="age"
              type="number"
              min={18}
              max={99}
              value={p.age || ""}
              onChange={(e) => set("age", Number(e.target.value) || 0)}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="bio">{t("bio")}</Label>
          <Textarea
            id="bio"
            value={p.bio}
            maxLength={280}
            placeholder={t("bioPlaceholder")}
            onChange={(e) => set("bio", e.target.value)}
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={p.groupFirst}
            onChange={(e) => set("groupFirst", e.target.checked)}
            className="size-4"
          />
          {t("groupFirst")}
        </label>

        <p className="rounded-md bg-spark/5 px-3 py-2 text-xs text-muted-foreground">
          {t("isolationNote")}
        </p>

        <div className="flex items-center justify-end gap-3">
          {saved && (
            <span className="inline-flex items-center gap-1 text-sm text-success">
              <Check className="size-4" aria-hidden />
              {t("saved")}
            </span>
          )}
          <Button
            variant="spark"
            disabled={!p.confirmed18}
            onClick={() => {
              saveSparkProfile(p);
              setSaved(true);
            }}
          >
            {t("save")}
          </Button>
        </div>
      </Card>
    </div>
  );
}
