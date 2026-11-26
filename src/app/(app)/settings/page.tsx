"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Bell, ChevronRight, Database, Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { clearSession, loadOnboarding } from "@/lib/onboarding";
import { circleById } from "@/data/circles";
import type { CircleId } from "@/data/circles";

const FREQUENCIES = ["instant", "weekly", "monthly"] as const;
type Frequency = (typeof FREQUENCIES)[number];

const STORAGE_KEY = "bab_notifications";

interface NotifPrefs {
  email: string;
  circles: CircleId[];
  frequency: Frequency;
}

export default function SettingsPage() {
  const t = useTranslations("notifications");
  const tCommon = useTranslations("common");
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [userCircles, setUserCircles] = useState<CircleId[]>([]);
  const [selectedCircles, setSelectedCircles] = useState<CircleId[]>([]);
  const [allCircles, setAllCircles] = useState(true);
  const [frequency, setFrequency] = useState<Frequency>("weekly");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const profile = loadOnboarding();
    if (profile?.circles) setUserCircles(profile.circles);

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const prefs = JSON.parse(saved) as NotifPrefs;
        setEmail(prefs.email ?? "");
        setFrequency(prefs.frequency ?? "weekly");
        if (prefs.circles?.length) {
          setAllCircles(false);
          setSelectedCircles(prefs.circles);
        }
      } catch {
        // ignore malformed storage
      }
    }
  }, []);

  function toggleCircle(id: CircleId) {
    setSelectedCircles((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) {
      setMessage("Please enter a valid email address.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    const circlesToSend = allCircles ? userCircles : selectedCircles;

    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, circles: circlesToSend, frequency }),
      });
      const data = (await res.json()) as { ok: boolean; message: string };

      if (data.ok) {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ email, circles: circlesToSend, frequency } satisfies NotifPrefs),
        );
        setMessage(t("success", { email }));
        setStatus("success");
      } else {
        setMessage(data.message ?? "Something went wrong.");
        setStatus("error");
      }
    } catch {
      setMessage("Could not save preferences. Please try again.");
      setStatus("error");
    }
  }

  async function handleUnsubscribe() {
    localStorage.removeItem(STORAGE_KEY);
    setEmail("");
    setFrequency("weekly");
    setAllCircles(true);
    setSelectedCircles([]);
    setMessage(t("unsubscribed"));
    setStatus("success");
  }

  const hasSaved = !!localStorage.getItem?.(STORAGE_KEY);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("settingsTitle")}</h1>
        <p className="mt-1 text-muted-foreground">{t("settingsSubtitle")}</p>
      </div>

      {/* Email Reminders */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="size-4 text-primary" aria-hidden />
            {t("remindersTitle")}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{t("remindersSubtitle")}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="grid gap-1.5">
              <Label htmlFor="notif-email">{t("emailLabel")}</Label>
              <Input
                id="notif-email"
                type="email"
                autoComplete="email"
                placeholder={t("emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Which circles */}
            {userCircles.length > 0 && (
              <div className="grid gap-2">
                <Label>{t("circlesLabel")}</Label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={allCircles}
                    onChange={(e) => setAllCircles(e.target.checked)}
                    className="rounded"
                  />
                  {t("allCirclesOption")}
                </label>
                {!allCircles && (
                  <div className="ml-6 flex flex-wrap gap-2">
                    {userCircles.map((id) => {
                      const circle = circleById(id);
                      if (!circle) return null;
                      const on = selectedCircles.includes(id);
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => toggleCircle(id)}
                          style={{ borderColor: on ? circle.accent : undefined, color: on ? circle.accent : undefined }}
                          className={cn(
                            "rounded-full border px-3 py-1 text-xs font-medium transition-all",
                            on ? "bg-primary/5" : "text-muted-foreground hover:text-foreground",
                          )}
                        >
                          {circle.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Frequency */}
            <div className="grid gap-2">
              <Label>{t("frequencyLabel")}</Label>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                {FREQUENCIES.map((f) => (
                  <label
                    key={f}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2.5 text-sm transition-all",
                      frequency === f
                        ? "border-primary bg-primary/5 text-primary"
                        : "text-muted-foreground hover:border-foreground/20",
                    )}
                  >
                    <input
                      type="radio"
                      name="frequency"
                      value={f}
                      checked={frequency === f}
                      onChange={() => setFrequency(f)}
                      className="sr-only"
                    />
                    {t(`frequency_${f}` as Parameters<typeof t>[0])}
                  </label>
                ))}
              </div>
            </div>

            {/* Feedback message */}
            {message && (
              <p
                className={cn(
                  "text-sm",
                  status === "error" ? "text-destructive" : "text-success",
                )}
              >
                {message}
              </p>
            )}

            <p className="text-xs text-muted-foreground">{t("dataNotice")}</p>

            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={status === "loading"}>
                {status === "loading" && (
                  <Loader2 className="animate-spin" aria-hidden />
                )}
                {t("subscribe")}
              </Button>
              {hasSaved && (
                <Button type="button" variant="ghost" size="sm" onClick={handleUnsubscribe}>
                  {t("unsubscribe")}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Data & Privacy link */}
      <Link href="/settings/data" className="block">
        <Card className="transition-colors hover:bg-secondary">
          <CardContent className="flex items-center gap-3 py-4">
            <Database className="size-5 shrink-0 text-muted-foreground" aria-hidden />
            <div className="flex-1">
              <p className="text-sm font-semibold">{t("dataSettingsTitle")}</p>
              <p className="text-xs text-muted-foreground">{t("dataSettingsDesc")}</p>
            </div>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          </CardContent>
        </Card>
      </Link>

      {/* Sign out */}
      <button
        type="button"
        className="block w-full text-left"
        onClick={() => {
          clearSession();
          router.replace("/");
        }}
      >
        <Card className="transition-colors hover:bg-destructive/5">
          <CardContent className="flex items-center gap-3 py-4">
            <LogOut className="size-5 shrink-0 text-destructive" aria-hidden />
            <p className="flex-1 text-sm font-semibold text-destructive">
              {tCommon("signOut")}
            </p>
          </CardContent>
        </Card>
      </button>
    </div>
  );
}
