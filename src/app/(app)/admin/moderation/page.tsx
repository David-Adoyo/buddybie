"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Bot, CheckCircle2, Clock, Flag, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  getAdminReports,
  getAdminFlags,
  setReportStatus,
  setFlagStatus,
  type AdminReport,
  type AdminFlag,
} from "@/lib/data/admin";

function fmtTime(ts: number) {
  const diff = Date.now() - ts;
  const hrs = Math.floor(diff / 3_600_000);
  if (hrs < 1) return `${Math.floor(diff / 60_000)}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const SEV_COLOUR = {
  high: "bg-destructive text-white",
  medium: "bg-warning/20 text-warning border border-warning/40",
  low: "bg-muted text-muted-foreground",
};

const REPORT_STATUS_ICON = {
  open: <Clock className="size-3.5 text-warning" aria-hidden />,
  reviewing: <AlertTriangle className="size-3.5 text-warning" aria-hidden />,
  actioned: <CheckCircle2 className="size-3.5 text-success" aria-hidden />,
  dismissed: <XCircle className="size-3.5 text-muted-foreground" aria-hidden />,
};

type Tab = "reports" | "flags";
type ReportFilter = "all" | AdminReport["status"];
type FlagFilter = "all" | AdminFlag["status"];

export default function ModerationPage() {
  const [tab, setTab] = useState<Tab>("reports");
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [flags, setFlags] = useState<AdminFlag[]>([]);
  const [reportFilter, setReportFilter] = useState<ReportFilter>("open");
  const [flagFilter, setFlagFilter] = useState<FlagFilter>("pending");
  const [focusReport, setFocusReport] = useState<AdminReport | null>(null);
  const [focusFlag, setFocusFlag] = useState<AdminFlag | null>(null);

  function reload() {
    setReports(getAdminReports());
    setFlags(getAdminFlags());
  }
  useEffect(reload, []);

  const filteredReports = reports.filter(
    (r) => reportFilter === "all" || r.status === reportFilter,
  );
  const filteredFlags = flags.filter(
    (f) => flagFilter === "all" || f.status === flagFilter,
  );

  const openCount = reports.filter((r) => r.status === "open").length;
  const pendingFlags = flags.filter((f) => f.status === "pending").length;

  function doReport(r: AdminReport, status: AdminReport["status"]) {
    setReportStatus(r.id, status);
    setFocusReport(null);
    reload();
  }
  function doFlag(f: AdminFlag, status: AdminFlag["status"]) {
    setFlagStatus(f.id, status);
    setFocusFlag(null);
    reload();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Moderation Queue</h1>
        <p className="text-sm text-muted-foreground">
          {openCount} open report{openCount !== 1 ? "s" : ""} · {pendingFlags} AI flag{pendingFlags !== 1 ? "s" : ""} pending review
        </p>
      </div>

      {/* Tab switch */}
      <div className="inline-flex rounded-lg border p-1">
        {(["reports", "flags"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
              tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t === "reports" ? <Flag className="size-4" aria-hidden /> : <Bot className="size-4" aria-hidden />}
            {t === "reports" ? "Member Reports" : "AI Flags"}
            <span className={cn(
              "ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold",
              tab === t ? "bg-primary-foreground/20" : "bg-destructive text-white",
            )}>
              {t === "reports" ? openCount : pendingFlags}
            </span>
          </button>
        ))}
      </div>

      {tab === "reports" && (
        <div className="space-y-4">
          {/* Status filter */}
          <div className="flex flex-wrap gap-2">
            {(["all", "open", "reviewing", "actioned", "dismissed"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setReportFilter(s)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors capitalize",
                  reportFilter === s
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background hover:bg-secondary",
                )}
              >
                {s} ({reports.filter((r) => s === "all" || r.status === s).length})
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredReports.length === 0 && (
              <p className="text-sm text-muted-foreground">No reports in this category.</p>
            )}
            {filteredReports.map((r) => (
              <Card key={r.id} className={cn(r.severity === "high" && r.status === "open" && "border-destructive/30")}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{REPORT_STATUS_ICON[r.status]}</div>
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-sm">{r.reason}</span>
                        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide", SEV_COLOUR[r.severity])}>
                          {r.severity}
                        </span>
                        <Badge variant="secondary" className="text-[10px]">{r.targetType}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{r.details}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span>Reporter: <span className="font-medium text-foreground">{r.reporterName}</span></span>
                        <span>Target: <span className="font-medium text-foreground">{r.targetName}</span></span>
                        <span>{fmtTime(r.createdAt)}</span>
                        <span className="capitalize">{r.status}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setFocusReport(r)} className="shrink-0">
                      Review
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {tab === "flags" && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(["all", "pending", "removed", "approved"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFlagFilter(s)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors capitalize",
                  flagFilter === s
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background hover:bg-secondary",
                )}
              >
                {s} ({flags.filter((f) => s === "all" || f.status === s).length})
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredFlags.length === 0 && (
              <p className="text-sm text-muted-foreground">No flags in this category.</p>
            )}
            {filteredFlags.map((f) => (
              <Card key={f.id} className={cn(f.severity === "high" && f.status === "pending" && "border-destructive/30")}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Bot className={cn(
                      "mt-0.5 size-4 shrink-0",
                      f.aiScreened ? "text-primary" : "text-muted-foreground",
                    )} aria-hidden />
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-sm capitalize">{f.kind.replace("_", " ")}</span>
                        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide", SEV_COLOUR[f.severity])}>
                          {f.severity}
                        </span>
                        {f.aiScreened && (
                          <Badge variant="secondary" className="text-[10px] gap-1">
                            <Bot className="size-2.5" aria-hidden /> AI screened
                          </Badge>
                        )}
                        {f.labels.map((l) => (
                          <Badge key={l} variant="outline" className="text-[10px]">{l}</Badge>
                        ))}
                      </div>
                      <p className="rounded-md bg-muted/50 px-3 py-2 text-sm font-mono italic text-muted-foreground line-clamp-2">
                        "{f.excerpt}"
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span>Member: <span className="font-medium text-foreground">{f.userName}</span></span>
                        <span>{fmtTime(f.createdAt)}</span>
                        <span className="capitalize">{f.status}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setFocusFlag(f)} className="shrink-0">
                      Review
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Report review dialog */}
      <Dialog
        open={!!focusReport}
        onClose={() => setFocusReport(null)}
        title="Review Report"
        description={focusReport ? `${focusReport.reason} · ${focusReport.targetType}` : undefined}
      >
        {focusReport && (
          <div className="space-y-4 text-sm">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <Badge variant={focusReport.severity === "high" ? "default" : "secondary"} className={cn(focusReport.severity === "high" && "bg-destructive")}>
                  {focusReport.severity} severity
                </Badge>
                <Badge variant="outline">{focusReport.targetType}</Badge>
                <Badge variant="secondary" className="capitalize">{focusReport.status}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-muted/40 p-2">
                  <p className="text-xs text-muted-foreground">Reporter</p>
                  <p className="font-medium">{focusReport.reporterName}</p>
                </div>
                <div className="rounded-lg bg-muted/40 p-2">
                  <p className="text-xs text-muted-foreground">Target</p>
                  <p className="font-medium">{focusReport.targetName}</p>
                </div>
              </div>
              <div className="rounded-lg bg-muted/40 p-3">
                <p className="text-xs text-muted-foreground mb-1">Details</p>
                <p>{focusReport.details}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {focusReport.status === "open" && (
                <Button size="sm" variant="outline" onClick={() => doReport(focusReport, "reviewing")}>
                  <Clock className="size-4" /> Mark Reviewing
                </Button>
              )}
              {(focusReport.status === "open" || focusReport.status === "reviewing") && (
                <>
                  <Button size="sm" variant="default" onClick={() => doReport(focusReport, "actioned")}>
                    <CheckCircle2 className="size-4" /> Action Taken
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => doReport(focusReport, "dismissed")}>
                    <XCircle className="size-4" /> Dismiss
                  </Button>
                </>
              )}
              {(focusReport.status === "actioned" || focusReport.status === "dismissed") && (
                <Button size="sm" variant="outline" onClick={() => doReport(focusReport, "open")}>
                  Re-open
                </Button>
              )}
            </div>
          </div>
        )}
      </Dialog>

      {/* Flag review dialog */}
      <Dialog
        open={!!focusFlag}
        onClose={() => setFocusFlag(null)}
        title="Review AI Flag"
        description={focusFlag ? `${focusFlag.kind.replace("_", " ")} · ${focusFlag.userName}` : undefined}
      >
        {focusFlag && (
          <div className="space-y-4 text-sm">
            <div className="flex flex-wrap gap-1">
              {focusFlag.labels.map((l) => (
                <Badge key={l} variant="outline" className="text-xs">{l}</Badge>
              ))}
            </div>
            <div className="rounded-lg bg-muted/50 px-3 py-3 font-mono italic text-muted-foreground text-xs leading-relaxed">
              "{focusFlag.excerpt}"
            </div>
            {focusFlag.aiScreened && (
              <p className="flex items-center gap-1.5 text-xs text-primary">
                <Bot className="size-3.5" aria-hidden /> Flagged by AI content screen
              </p>
            )}
            <div className="flex gap-2">
              {focusFlag.status === "pending" && (
                <>
                  <Button size="sm" variant="destructive" onClick={() => doFlag(focusFlag, "removed")}>
                    Remove Content
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => doFlag(focusFlag, "approved")}>
                    Approve / False Positive
                  </Button>
                </>
              )}
              {focusFlag.status !== "pending" && (
                <Button size="sm" variant="outline" onClick={() => doFlag(focusFlag, "pending")}>
                  Re-open for Review
                </Button>
              )}
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
