"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isSubscribed } from "@/lib/data/billing";
import { memberPlans, planByCode } from "@/data/plans";
import { circleById, type CircleId } from "@/data/circles";

interface PremiumGateProps {
  /** The plan code required to access this content. */
  planCode: string;
  /** Optional circle id — used for the icon and accent colour. */
  circleId?: CircleId;
  children: React.ReactNode;
}

/**
 * Wraps premium-only content. Shows a plan upgrade card when the user has no
 * active subscription for the required plan (or any bundle that covers it).
 * Reads from the demo billing store (localStorage); swaps to a server check
 * once real auth exists.
 */
export function PremiumGate({ planCode, circleId, children }: PremiumGateProps) {
  const [ready, setReady] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const subs = (() => {
      try {
        return JSON.parse(localStorage.getItem("bab_subscriptions") ?? "[]") as {
          planCode: string;
        }[];
      } catch {
        return [];
      }
    })();
    const hasSub =
      subs.some((s) => s.planCode === planCode) ||
      subs.some((s) => s.planCode === "all-access" || s.planCode === "all-access-gold");
    setHasAccess(hasSub);
    setReady(true);
  }, [planCode]);

  if (!ready) return null;
  if (hasAccess) return <>{children}</>;

  const plan = planByCode(planCode);
  const circle = circleId ? circleById(circleId) : undefined;
  const fallbackCircle = plan?.circleId ? circleById(plan.circleId) : undefined;
  const resolvedCircle = circle ?? fallbackCircle;
  const Icon = resolvedCircle?.icon ?? Lock;
  const accent = resolvedCircle?.accent ?? "var(--primary)";

  return (
    <div className="space-y-6">
      {/* Page heading uses the circle identity */}
      <div className="flex items-center gap-3">
        <span
          className="flex size-11 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${accent}20`, color: accent }}
        >
          <Icon className="size-6" aria-hidden />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {resolvedCircle?.name ?? plan?.name ?? "Premium"}
          </h1>
          {resolvedCircle && (
            <p className="text-sm text-muted-foreground">{resolvedCircle.tagline}</p>
          )}
        </div>
      </div>

      {/* Gate card */}
      <Card className="overflow-hidden">
        <div
          className="flex items-center gap-3 px-5 py-4"
          style={{ backgroundColor: `${accent}12` }}
        >
          <Lock className="size-4 shrink-0" style={{ color: accent }} aria-hidden />
          <p className="text-sm font-semibold" style={{ color: accent }}>
            {plan?.name ?? "Premium plan"} required
          </p>
        </div>
        <div className="space-y-4 p-5">
          <p className="text-sm text-muted-foreground">
            {plan
              ? `Unlock full access for $${plan.monthly}/month — cancel anytime.`
              : "Upgrade to unlock this feature."}
          </p>

          {plan?.features && plan.features.length > 0 && (
            <ul className="space-y-2">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <Check
                    className="mt-0.5 size-4 shrink-0"
                    style={{ color: accent }}
                    aria-hidden
                  />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-col gap-2 pt-1 sm:flex-row">
            <Link
              href={`/plans?highlight=${planCode}`}
              className={cn(buttonVariants())}
              style={{ backgroundColor: accent, borderColor: accent }}
            >
              Get {plan?.name ?? "Premium"} — ${plan?.monthly}/mo
            </Link>
            <Link
              href="/plans"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              View all plans
            </Link>
          </div>

          <p className="text-xs text-muted-foreground">
            Already subscribed? Your subscription is saved in this browser.
          </p>
        </div>
      </Card>

      {/* Show other member plans for this circle as a soft upsell */}
      {resolvedCircle && (
        <p className="text-xs text-muted-foreground">
          The {resolvedCircle.name} Circle is free to browse — a plan unlocks unlimited
          matching and premium features.
        </p>
      )}
    </div>
  );
}

/** Returns the member plan code for a given circle, or undefined if none. */
export function planCodeForCircle(circleId: CircleId): string | undefined {
  return memberPlans.find((p) => p.circleId === circleId)?.code;
}
