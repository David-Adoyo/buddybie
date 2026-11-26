"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addReport, toggleBlock, type Report } from "@/lib/data/safety";

const REASONS = ["scam", "harassment", "fake", "inappropriate", "other"] as const;

export function ReportDialog({
  open,
  onClose,
  targetName,
  targetType,
  targetId,
}: {
  open: boolean;
  onClose: () => void;
  targetName: string;
  targetType: Report["targetType"];
  targetId?: string;
}) {
  const t = useTranslations("safety");
  const [reason, setReason] = useState<string>("scam");
  const [details, setDetails] = useState("");
  const [alsoBlock, setAlsoBlock] = useState(true);
  const [done, setDone] = useState(false);

  function submit() {
    addReport({ targetName, targetType, targetId, reason, details });
    if (alsoBlock) toggleBlock(targetName);
    setDone(true);
  }

  function close() {
    setDone(false);
    setDetails("");
    setReason("scam");
    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={close}
      title={done ? t("reportSentTitle") : t("reportTitle", { name: targetName })}
      description={done ? undefined : t("reportSubtitle")}
    >
      {done ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{t("reportSentBody")}</p>
          <Button className="w-full" onClick={close}>
            {t("done")}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="reason">{t("reportReason")}</Label>
            <select
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {REASONS.map((r) => (
                <option key={r} value={r}>
                  {t(`reason_${r}`)}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="details">{t("reportDetails")}</Label>
            <Textarea
              id="details"
              value={details}
              maxLength={400}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={t("reportDetailsPlaceholder")}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={alsoBlock}
              onChange={(e) => setAlsoBlock(e.target.checked)}
              className="size-4 rounded border-input"
            />
            {t("reportAlsoBlock", { name: targetName })}
          </label>
          <Button variant="destructive" className="w-full" onClick={submit}>
            {t("reportSubmit")}
          </Button>
        </div>
      )}
    </Dialog>
  );
}
