"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, CircleCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { bundlePlans, hostPlans, memberPlans, type Plan } from "@/data/plans";
import { isSubscribed, recordPayment, subscribe } from "@/lib/data/billing";
import { setSparkPremium } from "@/lib/data/spark";

type Scope = "member" | "bundle" | "host";
type Method = "stripe" | "paypal" | "ach";

export default function PlansPage() {
  const t = useTranslations("plans");
  const [scope, setScope] = useState<Scope>("member");
  const [annual, setAnnual] = useState(false);
  const [chosen, setChosen] = useState<Plan | null>(null);
  const [, force] = useState(0);

  useEffect(() => {
    force((n) => n + 1);
  }, []);

  const lists: Record<Scope, Plan[]> = {
    member: memberPlans,
    bundle: bundlePlans,
    host: hostPlans,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="mt-1 text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border p-1">
          {(["member", "bundle", "host"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setScope(s)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                scope === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t(`scope_${s}`)}
            </button>
          ))}
        </div>
        {scope === "member" && (
          <button
            type="button"
            role="switch"
            aria-checked={annual}
            onClick={() => setAnnual((v) => !v)}
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium"
          >
            {annual ? t("annual") : t("monthly")}
            <Badge variant="success">{t("save30")}</Badge>
          </button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {lists[scope].map((plan) => {
          const subscribed = isSubscribed(plan.code);
          const price = annual && plan.annual ? plan.annual : plan.monthly;
          const unit = annual && plan.annual ? t("perYear") : t("perMonth");
          return (
            <Card key={plan.code} className={cn(plan.circleId === "spark" && "border-spark/40")}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  <span className="flex items-center gap-2">
                    {plan.circleId === "spark" && <Sparkles className="size-4 text-spark" aria-hidden />}
                    {plan.name}
                  </span>
                  {subscribed && (
                    <Badge variant="success">
                      <Check className="size-3" aria-hidden />
                      {t("active")}
                    </Badge>
                  )}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  <span className="text-xl font-bold text-foreground">${price}</span> {unit}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-1.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CircleCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.circleId === "spark" ? "spark" : "default"}
                  className="w-full"
                  disabled={subscribed}
                  onClick={() => setChosen(plan)}
                >
                  {subscribed ? t("subscribed") : t("choose")}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <SubscribeDialog
        plan={chosen}
        annual={annual}
        onClose={() => setChosen(null)}
        onDone={() => force((n) => n + 1)}
      />
    </div>
  );
}

function SubscribeDialog({
  plan,
  annual,
  onClose,
  onDone,
}: {
  plan: Plan | null;
  annual: boolean;
  onClose: () => void;
  onDone: () => void;
}) {
  const t = useTranslations("plans");
  const [method, setMethod] = useState<Method>("stripe");
  const [phone, setPhone] = useState("");
  const [stage, setStage] = useState<"form" | "pending" | "done">("form");
  const [message, setMessage] = useState("");
  const [ref, setRef] = useState("");

  function reset() {
    setStage("form");
    setMessage("");
    setPhone("");
    setMethod("stripe");
    onClose();
  }

  if (!plan) return null;
  const interval = annual && plan.annual ? "annual" : "monthly";
  const amount = interval === "annual" ? (plan.annual ?? plan.monthly) : plan.monthly;

  async function pay() {
    if (!plan) return;
    setStage("pending");
    try {
      const res = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ planCode: plan.code, interval, method, phone }),
      });
      const data = await res.json();
      setMessage(data.message ?? "");
      setRef(data.reference ?? "");
    } catch {
      setMessage(t("initError"));
    }
  }

  function confirmPaid() {
    if (!plan) return;
    subscribe(plan.code, interval);
    recordPayment({
      reference: ref || `BAB-${plan.code}`,
      planCode: plan.code,
      planName: plan.name,
      amountUsd: amount,
      method,
      at: Date.now(),
    });
    if (plan.circleId === "spark") setSparkPremium(true);
    setStage("done");
    onDone();
  }

  return (
    <Dialog
      open={plan !== null}
      onClose={reset}
      title={stage === "done" ? t("receiptTitle") : t("subscribeTitle", { plan: plan.name })}
    >
      {stage === "done" ? (
        <div className="space-y-4 text-center">
          <CircleCheck className="mx-auto size-10 text-success" aria-hidden />
          <p className="text-sm">
            {t("receiptBody", { plan: plan.name, amount: amount })}
          </p>
          <p className="font-mono text-xs text-muted-foreground">{ref}</p>
          <Button className="w-full" onClick={reset}>
            {t("done")}
          </Button>
        </div>
      ) : stage === "pending" ? (
        <div className="space-y-4">
          <p className="rounded-md bg-secondary px-3 py-2 text-sm">{message}</p>
          <Button className="w-full" onClick={confirmPaid}>
            {t("confirmPaid")}
          </Button>
          <Button variant="ghost" className="w-full" onClick={reset}>
            {t("cancel")}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t("amountDue", { amount: amount, unit: interval === "annual" ? t("perYear") : t("perMonth") })}
          </p>
          <div className="grid gap-2">
            <Label>{t("method")}</Label>
            <div className="grid grid-cols-3 gap-2">
              {(["stripe", "paypal", "ach"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className={cn(
                    "rounded-lg border px-2 py-2 text-xs font-medium transition-colors",
                    method === m ? "border-primary bg-primary/10 text-primary" : "hover:bg-secondary",
                  )}
                >
                  {t(`method_${m}`)}
                </button>
              ))}
            </div>
          </div>
          <Button className="w-full" onClick={pay}>
            {t("pay", { amount: amount })}
          </Button>
          <p className="text-center text-xs text-muted-foreground">{t("demoNote")}</p>
        </div>
      )}
    </Dialog>
  );
}
