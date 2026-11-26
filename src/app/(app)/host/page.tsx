"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Building2, HeartHandshake, Store } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  demoAttendance,
  demoBookings,
  demoMentorship,
  demoSubGroups,
  getHostType,
  isHost,
  setHost,
  setHostType,
  type HostType,
} from "@/lib/data/admin";

export default function HostPage() {
  const t = useTranslations("host");
  const [enabled, setEnabled] = useState(false);
  const [type, setType] = useState<HostType>("ministry");

  useEffect(() => {
    setEnabled(isHost());
    setType(getHostType());
  }, []);

  if (!enabled) {
    return (
      <div className="mx-auto max-w-md space-y-4 py-16 text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Building2 className="size-6" aria-hidden />
        </span>
        <h1 className="text-xl font-bold">{t("gateTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("gateBody")}</p>
        <Button
          onClick={() => {
            setHost(true);
            setEnabled(true);
          }}
        >
          {t("gateEnable")}
        </Button>
      </div>
    );
  }

  const types: { value: HostType; icon: typeof Building2 }[] = [
    { value: "ministry", icon: Building2 },
    { value: "corporate", icon: HeartHandshake },
    { value: "venue", icon: Store },
  ];

  function choose(next: HostType) {
    setType(next);
    setHostType(next);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setHost(false);
            setEnabled(false);
          }}
        >
          {t("exit")}
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {types.map((ty) => (
          <button
            key={ty.value}
            type="button"
            onClick={() => choose(ty.value)}
            className={cn(
              "flex flex-col items-center gap-1 rounded-xl border p-3 text-sm font-medium transition-all",
              type === ty.value ? "border-primary bg-primary/5 ring-2 ring-primary" : "hover:bg-secondary",
            )}
          >
            <ty.icon className="size-5" aria-hidden />
            {t(`type_${ty.value}`)}
          </button>
        ))}
      </div>

      {type === "ministry" && <Ministry />}
      {type === "corporate" && <Corporate />}
      {type === "venue" && <Venue />}
    </div>
  );
}

function Ministry() {
  const t = useTranslations("host");
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("subGroups")}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {demoSubGroups.map((g) => (
            <div key={g.name} className="rounded-lg border p-3 text-center">
              <p className="text-2xl font-bold">{g.members}</p>
              <p className="text-xs text-muted-foreground">{g.name}</p>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("attendance")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {demoAttendance.map((a) => (
            <div key={a.event} className="flex items-center justify-between text-sm">
              <span>{a.event}</span>
              <span className="font-medium">
                {a.present}/{a.expected}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("giving")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor="giving">{t("givingLabel")}</Label>
          <Input id="giving" placeholder="https://… {{GIVING_LINK}}" />
          <p className="text-xs text-muted-foreground">{t("givingHint")}</p>
        </CardContent>
      </Card>
    </div>
  );
}

function Corporate() {
  const t = useTranslations("host");
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("inviteDomain")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 sm:flex-row">
          <Input placeholder="@company.co.ke" />
          <Button>{t("sendInvites")}</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("mentorship")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {demoMentorship.map((m, i) => (
            <div key={i} className="rounded-lg border p-3 text-sm">
              <span className="font-medium">{m.mentor}</span> → {m.mentee}
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("engagement")}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-2 text-center">
          <Metric label={t("mActive")} value="86%" />
          <Metric label={t("mEvents")} value="12" />
          <Metric label={t("mMentors")} value="9" />
        </CardContent>
      </Card>
    </div>
  );
}

function Venue() {
  const t = useTranslations("host");
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">{t("hostTables")}</CardTitle>
          <Link href="/table" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
            {t("openTables")}
          </Link>
        </CardHeader>
        <CardContent className="space-y-2">
          {demoBookings.map((b, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg border p-3 text-sm">
              <div>
                <p className="font-medium">{b.event}</p>
                <p className="text-muted-foreground">{b.date}</p>
              </div>
              <Badge variant="secondary">{t("party", { count: b.party })}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
