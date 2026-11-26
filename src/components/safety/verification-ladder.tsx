"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Building2,
  Camera,
  Check,
  Fingerprint,
  Loader2,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { startVerification } from "@/app/actions/kyc";
import {
  getVerification,
  setVerificationStep,
  type Verification,
  type VerStatus,
} from "@/lib/data/safety";

type Step = "selfie" | "id";

export function VerificationLadder({ onChange }: { onChange?: () => void }) {
  const t = useTranslations("safety");
  const [ver, setVer] = useState<Verification>({ selfie: "none", id: "none" });
  const [busy, setBusy] = useState<Step | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [orgOpen, setOrgOpen] = useState(false);
  const [orgDone, setOrgDone] = useState(false);

  useEffect(() => {
    setVer(getVerification());
  }, []);

  async function run(step: Step) {
    setBusy(step);
    setNote(null);
    try {
      const result = await startVerification(step);
      const status: VerStatus =
        result.status === "verified" ? "verified" : "pending";
      setVer(setVerificationStep(step, status));
      if (result.status !== "verified" && result.message) setNote(result.message);
      onChange?.();
    } finally {
      setBusy(null);
    }
  }

  const rows = [
    {
      key: "phone" as const,
      icon: Phone,
      title: t("stepPhoneTitle"),
      desc: t("stepPhoneDesc"),
      status: "verified" as VerStatus,
      action: null,
    },
    {
      key: "selfie" as const,
      icon: Camera,
      title: t("stepSelfieTitle"),
      desc: t("stepSelfieDesc"),
      status: ver.selfie,
      action: () => run("selfie"),
    },
    {
      key: "id" as const,
      icon: Fingerprint,
      title: t("stepIdTitle"),
      desc: t("stepIdDesc"),
      status: ver.id,
      action: () => run("id"),
    },
    {
      key: "org" as const,
      icon: Building2,
      title: t("stepOrgTitle"),
      desc: t("stepOrgDesc"),
      status: (orgDone ? "pending" : "none") as VerStatus,
      action: () => setOrgOpen(true),
    },
  ];

  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <Card key={row.key} className="flex items-center gap-3 p-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
            <row.icon className="size-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-medium">{row.title}</p>
            <p className="text-sm text-muted-foreground">{row.desc}</p>
          </div>
          <StatusPill status={row.status} />
          {row.action && row.status !== "verified" && (
            <Button
              size="sm"
              variant="outline"
              disabled={busy === row.key}
              onClick={row.action}
            >
              {busy === row.key && (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              )}
              {row.status === "pending" ? t("retry") : t("verify")}
            </Button>
          )}
        </Card>
      ))}

      {note && (
        <p className="rounded-md bg-accent/15 px-3 py-2 text-xs text-accent-foreground">
          {note}
        </p>
      )}

      <OrgDialog
        open={orgOpen}
        onClose={() => setOrgOpen(false)}
        onSubmit={() => {
          setOrgDone(true);
          setOrgOpen(false);
        }}
      />
    </div>
  );
}

function StatusPill({ status }: { status: VerStatus }) {
  const t = useTranslations("safety");
  if (status === "verified")
    return (
      <Badge variant="success" className="shrink-0">
        <Check className="size-3" aria-hidden />
        {t("statusVerified")}
      </Badge>
    );
  if (status === "pending")
    return (
      <Badge variant="accent" className="shrink-0">
        {t("statusPending")}
      </Badge>
    );
  return (
    <Badge variant="outline" className="shrink-0">
      {t("statusNone")}
    </Badge>
  );
}

function OrgDialog({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const t = useTranslations("safety");
  const [name, setName] = useState("");
  const [type, setType] = useState("church");

  return (
    <Dialog open={open} onClose={onClose} title={t("orgTitle")} description={t("orgSubtitle")}>
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="org-name">{t("orgName")}</Label>
          <Input id="org-name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="org-type">{t("orgType")}</Label>
          <select
            id="org-type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="church">{t("orgChurch")}</option>
            <option value="company">{t("orgCompany")}</option>
            <option value="venue">{t("orgVenue")}</option>
          </select>
        </div>
        <Button className="w-full" disabled={!name.trim()} onClick={onSubmit}>
          {t("orgSubmit")}
        </Button>
      </div>
    </Dialog>
  );
}
