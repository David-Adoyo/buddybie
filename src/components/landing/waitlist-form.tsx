"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { CircleCheck } from "lucide-react";
import { joinWaitlist } from "@/app/actions/waitlist";
import { launchCircles } from "@/data/circles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function WaitlistForm() {
  const t = useTranslations("landing");
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState<null | { demo: boolean }>(null);
  const [error, setError] = useState(false);

  function onSubmit(formData: FormData) {
    setError(false);
    startTransition(async () => {
      const result = await joinWaitlist({
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        circle: String(formData.get("circle") ?? ""),
      });
      if (result.status === "success") setDone({ demo: result.demo });
      else setError(true);
    });
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border bg-card p-8 text-center">
        <CircleCheck className="size-10 text-success" aria-hidden />
        <p className="font-medium">{t("waitlistSuccess")}</p>
        {done.demo && (
          <p className="text-xs text-muted-foreground">
            {t("waitlistDemoNote")}
          </p>
        )}
      </div>
    );
  }

  return (
    <form action={onSubmit} className="grid gap-4 rounded-xl border bg-card p-6">
      <div className="grid gap-2">
        <Label htmlFor="wl-name">{t("waitlistName")}</Label>
        <Input id="wl-name" name="name" required autoComplete="name" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="wl-email">{t("waitlistEmail")}</Label>
        <Input
          id="wl-email"
          name="email"
          type="email"
          required
          autoComplete="email"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="wl-phone">{t("waitlistPhone")}</Label>
        <Input
          id="wl-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="+1 (XXX) XXX-XXXX"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="wl-circle">{t("waitlistCircle")}</Label>
        <select
          id="wl-circle"
          name="circle"
          className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          defaultValue=""
        >
          <option value="" disabled>
            —
          </option>
          {launchCircles.map((circle) => (
            <option key={circle.id} value={circle.name}>
              {circle.name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">{t("waitlistError")}</p>
      )}

      <Button type="submit" size="lg" disabled={isPending}>
        {isPending ? t("waitlistSubmitting") : t("waitlistSubmit")}
      </Button>
    </form>
  );
}
