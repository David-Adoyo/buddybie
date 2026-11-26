"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";

export default function DataSettingsPage() {
  const t = useTranslations("dataSettings");
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);

  function exportData() {
    const data: Record<string, unknown> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith("bab_")) continue;
      try {
        data[key] = JSON.parse(localStorage.getItem(key) ?? "null");
      } catch {
        data[key] = localStorage.getItem(key);
      }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "be-a-buddy-data.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function deleteAccount() {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("bab_")) keys.push(key);
    }
    keys.forEach((k) => localStorage.removeItem(k));
    router.push("/");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="mt-1 text-muted-foreground">{t("subtitle")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("exportTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">{t("exportBody")}</p>
          <Button variant="outline" onClick={exportData}>
            <Download />
            {t("exportButton")}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base text-destructive">{t("deleteTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">{t("deleteBody")}</p>
          <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
            <Trash2 />
            {t("deleteButton")}
          </Button>
        </CardContent>
      </Card>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={t("confirmTitle")}
        description={t("confirmBody")}
      >
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => setConfirmOpen(false)}>
            {t("cancel")}
          </Button>
          <Button variant="destructive" className="flex-1" onClick={deleteAccount}>
            {t("confirmDelete")}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
