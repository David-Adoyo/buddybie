"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  Plus,
  Trash2,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { launchCircles, type CircleId } from "@/data/circles";
import { suggestionsForCircles } from "@/data/goal-suggestions";
import { cities } from "@/data/areas";
import { quizQuestions, QUIZ_SCALE } from "@/data/quiz";
import {
  emptyOnboarding,
  saveOnboarding,
  type OnboardingData,
} from "@/lib/onboarding";

const STEP_KEYS = [
  "name",
  "photo",
  "area",
  "circles",
  "goals",
  "quiz",
] as const;
type StepKey = (typeof STEP_KEYS)[number];

export default function OnboardingPage() {
  const t = useTranslations("onboarding");
  const tc = useTranslations("common");
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [index, setIndex] = useState(0);
  const [data, setData] = useState<OnboardingData>(emptyOnboarding);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const step: StepKey = STEP_KEYS[index];
  const total = STEP_KEYS.length;
  const progress = ((index + 1) / total) * 100;

  const stepLabels: Record<StepKey, string> = {
    name: t("stepName"),
    photo: t("stepPhoto"),
    area: t("stepArea"),
    circles: t("stepCircles"),
    goals: t("stepGoals"),
    quiz: t("stepQuiz"),
  };

  const filledGoals = data.goals.filter((g) => g.trim().length > 0);
  const quizAnswered = Object.keys(data.quiz).length;

  // Circle-aware suggestions — only computed while on the goals step.
  const suggestions = useMemo(
    () =>
      step === "goals" ? suggestionsForCircles(data.circles).slice(0, 12) : [],
    [step, data.circles],
  );

  const canContinue = useMemo(() => {
    switch (step) {
      case "name":
        return data.name.trim().length > 0;
      case "area":
        return data.area.length > 0;
      case "circles":
        return data.circles.length > 0;
      case "goals":
        return filledGoals.length >= 3;
      case "quiz":
        return quizAnswered === quizQuestions.length;
      default:
        return true;
    }
  }, [step, data, filledGoals.length, quizAnswered]);

  function update(partial: Partial<OnboardingData>) {
    setData((d) => ({ ...d, ...partial }));
  }

  function toggleCircle(id: CircleId) {
    setData((d) => ({
      ...d,
      circles: d.circles.includes(id)
        ? d.circles.filter((c) => c !== id)
        : [...d.circles, id],
    }));
  }

  function setGoal(i: number, value: string) {
    setData((d) => {
      const goals = [...d.goals];
      goals[i] = value;
      return { ...d, goals };
    });
  }

  function addGoal() {
    setData((d) => (d.goals.length >= 5 ? d : { ...d, goals: [...d.goals, ""] }));
  }

  function removeGoal(i: number) {
    setData((d) =>
      d.goals.length <= 3
        ? d
        : { ...d, goals: d.goals.filter((_, idx) => idx !== i) },
    );
  }

  function applySuggestion(text: string) {
    setData((d) => {
      const goals = [...d.goals];
      const emptyIdx = goals.findIndex((g) => g.trim().length === 0);
      if (emptyIdx !== -1) {
        goals[emptyIdx] = text;
        return { ...d, goals };
      }
      if (goals.length < 5) {
        return { ...d, goals: [...goals, text] };
      }
      return d;
    });
  }

  function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(String(reader.result));
    reader.readAsDataURL(file);
  }

  function handleContinue() {
    if (!canContinue) {
      if (step === "name") setError(t("errorNameRequired"));
      else if (step === "area") setError(t("errorAreaRequired"));
      else if (step === "circles") setError(t("errorCirclesRequired"));
      else if (step === "goals") setError(t("goalsMin"));
      return;
    }
    setError(null);
    if (index < total - 1) {
      setIndex((i) => i + 1);
      return;
    }
    // Final step: persist and move to home.
    saveOnboarding({ ...data, goals: filledGoals });
    router.push("/home");
  }

  function handleBack() {
    setError(null);
    setIndex((i) => Math.max(0, i - 1));
  }

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <Link href="/" aria-label="Buddybie home">
            <Logo />
          </Link>
          <span className="text-sm text-muted-foreground">
            {t("stepCount", { current: index + 1, total })}
          </span>
        </div>
        <div className="mx-auto max-w-2xl px-4 pb-4">
          <Progress value={progress} />
          <div className="mt-3 flex flex-wrap gap-1.5">
            {STEP_KEYS.map((key, i) => (
              <span
                key={key}
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
                  i === index
                    ? "bg-primary text-primary-foreground"
                    : i < index
                      ? "bg-success/15 text-success"
                      : "bg-secondary text-muted-foreground",
                )}
              >
                {stepLabels[key]}
              </span>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        {/* NAME */}
        {step === "name" && (
          <StepShell title={t("nameTitle")} subtitle={t("nameSubtitle")}>
            <div className="grid gap-2">
              <Label htmlFor="name">{t("nameLabel")}</Label>
              <Input
                id="name"
                autoFocus
                maxLength={60}
                placeholder={t("namePlaceholder")}
                value={data.name}
                onChange={(e) => update({ name: e.target.value })}
              />
            </div>
          </StepShell>
        )}

        {/* PHOTO */}
        {step === "photo" && (
          <StepShell title={t("photoTitle")} subtitle={t("photoSubtitle")}>
            <div className="flex flex-col items-center gap-4">
              <div className="flex size-32 items-center justify-center overflow-hidden rounded-full border-2 border-dashed bg-secondary text-muted-foreground">
                {photoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photoPreview}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  <Camera className="size-8" aria-hidden />
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onPickPhoto}
              />
              <Button
                variant="outline"
                onClick={() => fileRef.current?.click()}
              >
                <Camera />
                {photoPreview ? t("photoChange") : t("photoChoose")}
              </Button>
              <p className="max-w-sm text-center text-xs text-muted-foreground">
                {t("photoSkipNote")}
              </p>
            </div>
          </StepShell>
        )}

        {/* AREA */}
        {step === "area" && (
          <StepShell title={t("areaTitle")} subtitle={t("areaSubtitle")}>
            <div className="grid gap-2">
              <Label htmlFor="area">{t("areaLabel")}</Label>
              <select
                id="area"
                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={data.area}
                onChange={(e) => update({ area: e.target.value })}
              >
                <option value="" disabled>
                  {t("areaPlaceholder")}
                </option>
                {cities.map((city) => (
                  <optgroup key={city.id} label={city.name}>
                    {city.areas.map((area) => (
                      <option key={area} value={`${city.id}:${area}`}>
                        {area}
                      </option>
                    ))}
                    <option value={`${city.id}:Other`}>Other / nearby</option>
                  </optgroup>
                ))}
              </select>
            </div>
          </StepShell>
        )}

        {/* CIRCLES */}
        {step === "circles" && (
          <StepShell
            title={t("circlesTitle")}
            subtitle={t("circlesSubtitle")}
            meta={t("circlesSelected", { count: data.circles.length })}
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {launchCircles.map((circle) => {
                const Icon = circle.icon;
                const selected = data.circles.includes(circle.id);
                return (
                  <button
                    key={circle.id}
                    type="button"
                    onClick={() => toggleCircle(circle.id)}
                    aria-pressed={selected}
                    className={cn(
                      "relative flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition-all",
                      selected
                        ? "border-primary bg-primary/5 ring-2 ring-primary"
                        : "hover:border-foreground/20 hover:bg-secondary",
                    )}
                  >
                    {selected && (
                      <span className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="size-3" />
                      </span>
                    )}
                    <span
                      className="flex size-9 items-center justify-center rounded-lg"
                      style={{
                        backgroundColor: `${circle.accent}1f`,
                        color: circle.accent,
                      }}
                    >
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <span className="text-sm font-semibold leading-tight">
                      {circle.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </StepShell>
        )}

        {/* GOALS */}
        {step === "goals" && (
          <StepShell
            title={t("goalsTitle")}
            subtitle={t("goalsSubtitle")}
            meta={t("goalsCount", { count: filledGoals.length })}
          >
            <div className="space-y-3">
              {data.goals.map((goal, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    placeholder={t("goalsPlaceholder")}
                    value={goal}
                    maxLength={120}
                    onChange={(e) => setGoal(i, e.target.value)}
                  />
                  {data.goals.length > 3 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={t("goalsRemove")}
                      onClick={() => removeGoal(i)}
                    >
                      <Trash2 className="text-muted-foreground" />
                    </Button>
                  )}
                </div>
              ))}
              {data.goals.length < 5 && (
                <Button variant="outline" size="sm" onClick={addGoal}>
                  <Plus />
                  {t("goalsAdd")}
                </Button>
              )}
            </div>

            {/* Circle-aware suggestions */}
            {suggestions.length > 0 && (
              <div className="space-y-2 pt-1">
                <p className="text-xs font-medium text-muted-foreground">
                  {t("goalsSuggestionsLabel")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((s) => {
                    const used = data.goals.some(
                      (g) => g.trim() === s.trim(),
                    );
                    const allFull =
                      filledGoals.length >= 5 && !data.goals.includes("");
                    return (
                      <button
                        key={s}
                        type="button"
                        disabled={used || allFull}
                        onClick={() => applySuggestion(s)}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-left text-xs leading-snug transition-all",
                          used
                            ? "cursor-default border-success/30 bg-success/5 text-muted-foreground/50 line-through"
                            : allFull
                              ? "cursor-not-allowed border-border/50 text-muted-foreground/40 opacity-50"
                              : "border-primary/30 bg-primary/5 text-primary hover:border-primary/60 hover:bg-primary/10 active:scale-95",
                        )}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </StepShell>
        )}

        {/* QUIZ */}
        {step === "quiz" && (
          <StepShell
            title={t("quizTitle")}
            subtitle={t("quizSubtitle")}
            meta={t("quizProgress", {
              current: quizAnswered,
              total: quizQuestions.length,
            })}
          >
            <ol className="space-y-5">
              {quizQuestions.map((q, i) => (
                <li key={q.id} className="rounded-xl border p-4">
                  <p className="mb-3 text-sm font-medium">
                    <span className="text-muted-foreground">{i + 1}. </span>
                    {q.statement}
                  </p>
                  <div className="flex items-center justify-between gap-1">
                    <span className="hidden text-xs text-muted-foreground sm:block">
                      {t("scaleStronglyDisagree")}
                    </span>
                    <div className="flex flex-1 items-center justify-center gap-2">
                      {QUIZ_SCALE.map((value) => {
                        const active = data.quiz[q.id] === value;
                        return (
                          <button
                            key={value}
                            type="button"
                            aria-label={`${value}`}
                            aria-pressed={active}
                            onClick={() =>
                              update({ quiz: { ...data.quiz, [q.id]: value } })
                            }
                            className={cn(
                              "size-8 rounded-full border text-sm font-medium transition-all sm:size-9",
                              active
                                ? "border-primary bg-primary text-primary-foreground"
                                : "hover:border-primary/50 hover:bg-primary/5",
                            )}
                          >
                            {value}
                          </button>
                        );
                      })}
                    </div>
                    <span className="hidden text-xs text-muted-foreground sm:block">
                      {t("scaleStronglyAgree")}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </StepShell>
        )}

        {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
      </main>

      <footer className="sticky bottom-0 border-t bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-4">
          {index > 0 ? (
            <Button variant="ghost" onClick={handleBack}>
              <ArrowLeft />
              {tc("back")}
            </Button>
          ) : (
            <span />
          )}
          <Button onClick={handleContinue} size="lg">
            {index === total - 1 ? tc("finish") : tc("continue")}
            {index < total - 1 && <ArrowRight />}
          </Button>
        </div>
      </footer>
    </div>
  );
}

function StepShell({
  title,
  subtitle,
  meta,
  children,
}: {
  title: string;
  subtitle: string;
  meta?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="mt-1 text-muted-foreground">{subtitle}</p>
        {meta && (
          <p className="mt-2 text-sm font-medium text-primary">{meta}</p>
        )}
      </div>
      {children}
    </div>
  );
}
