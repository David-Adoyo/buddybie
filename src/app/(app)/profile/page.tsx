"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Lock, MapPin, Users } from "lucide-react";
import { useActiveCircle } from "@/lib/active-circle";
import { SparkProfileEditor } from "@/components/spark/spark-profile";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getCircleProfile, getMe, saveCircleProfile } from "@/lib/data/store";
import { loadOnboarding } from "@/lib/onboarding";
import type { Visibility } from "@/lib/types";

const VIS: { value: Visibility; icon: typeof Users }[] = [
  { value: "public", icon: Users },
  { value: "members", icon: Users },
  { value: "private", icon: Lock },
];

export default function ProfilePage() {
  const t = useTranslations("profile");
  const { activeCircle } = useActiveCircle();

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("members");
  const [area, setArea] = useState("");
  const [colour, setColour] = useState("#e8604c");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!activeCircle || activeCircle.isSpark) return;
    const profile = getCircleProfile(activeCircle.id);
    setDisplayName(profile.displayName);
    setBio(profile.bio);
    setVisibility(profile.visibility);
    setColour(getMe().colour);
    const onboarding = loadOnboarding();
    setArea(onboarding?.area?.split(":")[1] ?? "");
    setSaved(false);
  }, [activeCircle]);

  if (!activeCircle) return null;
  if (activeCircle.isSpark) {
    return <SparkProfileEditor />;
  }

  function save() {
    if (!activeCircle) return;
    saveCircleProfile({
      circleId: activeCircle.id,
      displayName: displayName.trim() || getMe().name,
      bio: bio.trim(),
      visibility,
    });
    setSaved(true);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t("title", { circle: activeCircle.name })}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {t("subtitle", { circle: activeCircle.name })}
        </p>
      </div>

      {/* Shared base identity */}
      <Card className="space-y-3 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t("baseIdentity")}
        </p>
        <div className="flex items-center gap-3">
          <Avatar name={displayName || "You"} colour={colour} className="size-11" />
          <div className="text-sm">
            <p className="font-medium">{getMe().name}</p>
            {area && (
              <p className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="size-3.5" aria-hidden />
                {area}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Per-Circle fields */}
      <Card className="space-y-4 p-4">
        <div className="grid gap-2">
          <Label htmlFor="displayName">{t("displayName")}</Label>
          <Input
            id="displayName"
            value={displayName}
            maxLength={60}
            onChange={(e) => {
              setDisplayName(e.target.value);
              setSaved(false);
            }}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="bio">{t("bio")}</Label>
          <Textarea
            id="bio"
            value={bio}
            maxLength={280}
            placeholder={t("bioPlaceholder")}
            onChange={(e) => {
              setBio(e.target.value);
              setSaved(false);
            }}
          />
        </div>

        <div className="grid gap-2">
          <Label>{t("visibilityTitle")}</Label>
          <div className="grid gap-2 sm:grid-cols-3">
            {VIS.map((option) => {
              const active = visibility === option.value;
              const OptIcon = option.icon;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setVisibility(option.value);
                    setSaved(false);
                  }}
                  className={cn(
                    "flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all",
                    active
                      ? "border-primary bg-primary/5 ring-2 ring-primary"
                      : "hover:bg-secondary",
                  )}
                >
                  <OptIcon className="size-4 text-muted-foreground" aria-hidden />
                  <span className="text-sm font-semibold">
                    {t(`vis_${option.value}`)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {t(`vis_${option.value}_desc`)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <p className="rounded-md bg-spark/5 px-3 py-2 text-xs text-muted-foreground">
          {t("sparkIsolationNote")}
        </p>

        <div className="flex items-center justify-end gap-3">
          {saved && (
            <span className="inline-flex items-center gap-1 text-sm text-success">
              <Check className="size-4" aria-hidden />
              {t("saved")}
            </span>
          )}
          <Button onClick={save}>{t("save")}</Button>
        </div>
      </Card>
    </div>
  );
}
