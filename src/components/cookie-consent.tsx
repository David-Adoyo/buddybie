"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

const KEY = "bab_consent";

/**
 * Cookie/consent banner. Privacy-preserving by default — "Decline non-essential"
 * is given equal weight and only essential storage is used until the member opts in.
 */
export function CookieConsent() {
  const t = useTranslations("consent");
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true);
    } catch {
      /* ignore */
    }
  }, []);

  function decide(choice: "all" | "essential") {
    try {
      localStorage.setItem(KEY, choice);
    } catch {
      /* ignore */
    }
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] border-t bg-background/95 p-4 backdrop-blur">
      <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {t("body")}{" "}
          <Link href="/legal/privacy" className="text-primary hover:underline">
            {t("privacy")}
          </Link>
        </p>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" onClick={() => decide("essential")}>
            {t("declineNonEssential")}
          </Button>
          <Button size="sm" onClick={() => decide("all")}>
            {t("acceptAll")}
          </Button>
        </div>
      </div>
    </div>
  );
}
