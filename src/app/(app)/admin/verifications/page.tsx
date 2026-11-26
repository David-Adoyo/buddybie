"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock, IdCard, User, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  getAdminVerifications,
  setVerificationStatus,
  type VerificationRequest,
} from "@/lib/data/admin";

function fmtTime(ts: number) {
  const diff = Date.now() - ts;
  const hrs = Math.floor(diff / 3_600_000);
  if (hrs < 1) return `${Math.floor(diff / 60_000)}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const STATUS_META = {
  pending:  { label: "Pending",  colour: "bg-warning/10 text-warning border border-warning/30" },
  approved: { label: "Approved", colour: "bg-success/10 text-success border border-success/30" },
  rejected: { label: "Rejected", colour: "bg-destructive/10 text-destructive border border-destructive/30" },
};

type FilterStatus = "all" | VerificationRequest["status"];

export default function VerificationsPage() {
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [filter, setFilter] = useState<FilterStatus>("pending");
  const [focus, setFocus] = useState<VerificationRequest | null>(null);
  const [rejectNote, setRejectNote] = useState("");

  function reload() {
    setVerifications(getAdminVerifications());
  }
  useEffect(reload, []);

  const filtered = verifications.filter(
    (v) => filter === "all" || v.status === filter,
  );

  const pending = verifications.filter((v) => v.status === "pending").length;

  function approve(v: VerificationRequest) {
    setVerificationStatus(v.id, "approved");
    setFocus(null);
    reload();
  }

  function reject(v: VerificationRequest) {
    setVerificationStatus(v.id, "rejected");
    setFocus(null);
    setRejectNote("");
    reload();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">KYC Verifications</h1>
        <p className="text-sm text-muted-foreground">
          {pending} submission{pending !== 1 ? "s" : ""} awaiting review
        </p>
      </div>

      {pending > 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-warning/30 bg-warning/5 px-4 py-3">
          <Clock className="size-4 text-warning" aria-hidden />
          <p className="text-sm">
            <span className="font-semibold">{pending} pending submission{pending !== 1 ? "s" : ""}</span>
            {" — "} review within 24 hours to maintain trust levels.
          </p>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {(["all", "pending", "approved", "rejected"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors capitalize",
              filter === s
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background hover:bg-secondary",
            )}
          >
            {s} ({verifications.filter((v) => s === "all" || v.status === s).length})
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.length === 0 && (
          <p className="col-span-2 text-sm text-muted-foreground">No submissions in this category.</p>
        )}
        {filtered.map((v) => (
          <Card key={v.id} className={cn(
            v.status === "pending" && "border-warning/30",
            v.status === "rejected" && "border-destructive/20",
          )}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  {v.step === "selfie" ? (
                    <User className="size-5 text-primary" aria-hidden />
                  ) : (
                    <IdCard className="size-5 text-primary" aria-hidden />
                  )}
                  <div>
                    <p className="font-semibold">{v.userName}</p>
                    <p className="text-xs text-muted-foreground">{v.city}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", STATUS_META[v.status].colour)}>
                    {STATUS_META[v.status].label}
                  </span>
                  <span className="text-xs text-muted-foreground">{fmtTime(v.submittedAt)}</span>
                </div>
              </div>

              <div className="rounded-lg bg-muted/40 p-3">
                <p className="text-xs font-medium text-muted-foreground mb-1 capitalize">
                  {v.step === "selfie" ? "Selfie verification" : "Government ID"}
                </p>
                <p className="text-sm">{v.imageNote}</p>
              </div>

              {v.status === "pending" && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => setFocus(v)}
                    className="flex-1 gap-1"
                  >
                    <CheckCircle2 className="size-4" /> Review
                  </Button>
                </div>
              )}
              {v.status !== "pending" && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {v.status === "approved" ? (
                    <CheckCircle2 className="size-3.5 text-success" aria-hidden />
                  ) : (
                    <XCircle className="size-3.5 text-destructive" aria-hidden />
                  )}
                  {v.status === "approved" ? `Approved — level ${v.step === "selfie" ? 2 : 3} granted` : "Rejected — member notified"}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Review dialog */}
      <Dialog
        open={!!focus}
        onClose={() => { setFocus(null); setRejectNote(""); }}
        title="Review KYC Submission"
        description={focus ? `${focus.userName} · ${focus.step === "selfie" ? "Selfie" : "Government ID"} · ${focus.city}` : undefined}
      >
        {focus && (
          <div className="space-y-4 text-sm">
            <div className="rounded-lg bg-muted/40 p-4 space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Document assessment</p>
              <p>{focus.imageNote}</p>
            </div>

            <div className="rounded-lg bg-muted/20 p-3 text-xs space-y-1">
              <p className="font-medium">Verification checklist</p>
              {focus.step === "selfie" ? (
                <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                  <li>Face is clearly visible and unobstructed</li>
                  <li>Matches profile photo</li>
                  <li>Lighting is adequate, no shadows over face</li>
                  <li>Appears to be a live photo (no screenshot artefacts)</li>
                </ul>
              ) : (
                <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                  <li>Document is a valid government-issued ID</li>
                  <li>Not expired</li>
                  <li>Name matches account registration</li>
                  <li>No visible signs of tampering or editing</li>
                  <li>Date of birth confirms member is 18+</li>
                </ul>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Rejection reason (required if rejecting)
              </label>
              <textarea
                rows={2}
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                placeholder="e.g. Document expired, face obscured, suspected fake…"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            <div className="flex gap-2">
              <Button variant="default" className="flex-1" onClick={() => approve(focus)}>
                <CheckCircle2 className="size-4" /> Approve
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                disabled={!rejectNote.trim()}
                onClick={() => reject(focus)}
              >
                <XCircle className="size-4" /> Reject
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Approval grants Level {focus.step === "selfie" ? "2 (Selfie Verified)" : "3 (ID Verified)"}
            </p>
          </div>
        )}
      </Dialog>
    </div>
  );
}
