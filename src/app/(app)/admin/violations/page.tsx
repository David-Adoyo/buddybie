"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Ban,
  ChevronDown,
  ShieldAlert,
  UserCheck,
  UserX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  getAdminUsers,
  getAdminReports,
  updateUserStatus,
  addUserWarning,
  type AdminUser,
  type UserStatus,
} from "@/lib/data/admin";

function fmtDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

const STRIKE_COLOUR = (n: number) =>
  n === 0 ? "text-success" : n === 1 ? "text-warning" : "text-destructive";

const STATUS_LABELS: Record<UserStatus, string> = {
  active: "Active", suspended: "Suspended", banned: "Banned", pending: "Pending", flagged: "Flagged",
};

type Section = "flagged" | "suspended" | "banned";

export default function ViolationsPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [reports, setReports] = useState<ReturnType<typeof getAdminReports>>([]);
  const [section, setSection] = useState<Section>("flagged");
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [actionKind, setActionKind] = useState<"suspend" | "ban" | "restore" | "warn" | null>(null);
  const [actionNote, setActionNote] = useState("");

  function reload() {
    setUsers(getAdminUsers());
    setReports(getAdminReports());
  }
  useEffect(reload, []);

  const bySection: Record<Section, AdminUser[]> = {
    flagged:   users.filter((u) => u.status === "flagged"),
    suspended: users.filter((u) => u.status === "suspended"),
    banned:    users.filter((u) => u.status === "banned"),
  };

  function reportsFor(userId: string) {
    return reports.filter((r) => r.targetId === userId);
  }

  function confirmAction() {
    if (!selected || !actionKind) return;
    if (actionKind === "warn") {
      addUserWarning(selected.id);
    } else {
      const s: UserStatus =
        actionKind === "suspend" ? "suspended" :
        actionKind === "ban" ? "banned" : "active";
      updateUserStatus(selected.id, s, actionNote || undefined);
    }
    setSelected(null);
    setActionKind(null);
    reload();
  }

  const list = bySection[section];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Violations</h1>
        <p className="text-sm text-muted-foreground">
          {bySection.flagged.length} flagged · {bySection.suspended.length} suspended · {bySection.banned.length} banned
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        {(["flagged", "suspended", "banned"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSection(s)}
            className={cn(
              "rounded-xl border p-4 text-left transition-all",
              section === s
                ? "border-destructive/40 bg-destructive/5 ring-2 ring-destructive/20"
                : "hover:bg-secondary",
            )}
          >
            <p className={cn(
              "text-2xl font-bold",
              s === "flagged" ? "text-warning" : "text-destructive",
            )}>
              {bySection[s].length}
            </p>
            <p className="text-xs text-muted-foreground capitalize mt-0.5">{s}</p>
          </button>
        ))}
      </div>

      {/* Member list */}
      <div className="space-y-3">
        {list.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">No members in this category.</p>
        ) : (
          list.map((u) => {
            const userReports = reportsFor(u.id);
            return (
              <Card key={u.id} className={cn(
                u.status === "banned" && "border-destructive/40",
                u.status === "flagged" && "border-warning/40",
              )}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar name={u.name} className="mt-0.5 shrink-0 size-7 text-xs" />
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold">{u.name}</span>
                        <Badge
                          variant={u.status === "banned" ? "default" : "accent"}
                          className={cn("text-[10px]", u.status === "banned" && "bg-destructive")}
                        >
                          {STATUS_LABELS[u.status]}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{u.city}</span>
                      </div>

                      {/* Strike display */}
                      <div className="flex items-center gap-4 text-xs">
                        <span>
                          Strikes:{" "}
                          <span className={cn("font-bold", STRIKE_COLOUR(u.warnings))}>
                            {u.warnings} / 3
                          </span>
                        </span>
                        <span>Reports: <span className="font-semibold">{u.reports}</span></span>
                        <span>Trust: <span className={cn(
                          "font-semibold",
                          u.trustScore < 40 ? "text-destructive" : "text-muted-foreground",
                        )}>{u.trustScore}</span></span>
                        <span className={cn("capitalize font-medium", u.riskLevel === "critical" ? "text-destructive" : u.riskLevel === "high" ? "text-warning" : "text-muted-foreground")}>
                          {u.riskLevel} risk
                        </span>
                      </div>

                      {/* Strike bars */}
                      <div className="flex gap-1">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className={cn(
                            "h-2 w-8 rounded-full",
                            i <= u.warnings
                              ? u.warnings >= 3 ? "bg-destructive" : "bg-warning"
                              : "bg-muted",
                          )} />
                        ))}
                        <span className="text-[10px] text-muted-foreground ml-1 self-center">
                          {u.warnings >= 3 ? "Max strikes — action required" : `${3 - u.warnings} warning${3 - u.warnings !== 1 ? "s" : ""} until auto-suspend`}
                        </span>
                      </div>

                      {u.notes && (
                        <p className="text-xs text-muted-foreground rounded-md bg-muted/50 px-3 py-1.5 line-clamp-2">
                          {u.notes}
                        </p>
                      )}

                      {/* Related reports */}
                      {userReports.length > 0 && (
                        <div className="space-y-1">
                          {userReports.slice(0, 2).map((r) => (
                            <div key={r.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span className={cn(
                                "inline-block size-1.5 rounded-full",
                                r.severity === "high" ? "bg-destructive" : r.severity === "medium" ? "bg-warning" : "bg-muted-foreground",
                              )} />
                              <span>{r.reason}</span>
                              <span>·</span>
                              <span className="capitalize">{r.status}</span>
                            </div>
                          ))}
                          {userReports.length > 2 && (
                            <p className="text-xs text-muted-foreground">+{userReports.length - 2} more reports</p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-1 shrink-0">
                      {u.status !== "banned" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => { setSelected(u); setActionKind("warn"); setActionNote(""); }}
                        >
                          <ShieldAlert className="size-3" /> Warn
                        </Button>
                      )}
                      {(u.status === "flagged" || u.status === "active") && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs text-warning border-warning/30"
                          onClick={() => { setSelected(u); setActionKind("suspend"); setActionNote(""); }}
                        >
                          <UserX className="size-3" /> Suspend
                        </Button>
                      )}
                      {u.status !== "banned" && u.status !== "active" && (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="text-xs"
                          onClick={() => { setSelected(u); setActionKind("ban"); setActionNote(""); }}
                        >
                          <Ban className="size-3" /> Ban
                        </Button>
                      )}
                      {(u.status === "suspended" || u.status === "banned") && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs text-success border-success/30"
                          onClick={() => { setSelected(u); setActionKind("restore"); setActionNote(""); }}
                        >
                          <UserCheck className="size-3" /> Restore
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Confirm action dialog */}
      <Dialog
        open={!!selected && !!actionKind}
        onClose={() => { setSelected(null); setActionKind(null); }}
        title={
          actionKind === "warn" ? `Issue warning to ${selected?.name}` :
          actionKind === "suspend" ? `Suspend ${selected?.name}` :
          actionKind === "ban" ? `Permanently ban ${selected?.name}` :
          `Restore ${selected?.name}`
        }
        description={
          actionKind === "ban"
            ? "The member will be permanently blocked from the platform."
            : actionKind === "suspend"
            ? "The member will be unable to sign in until an admin restores access."
            : actionKind === "warn"
            ? "A formal warning will be recorded. Three warnings trigger an auto-suspension."
            : "The member's account will be restored to active status."
        }
      >
        <div className="space-y-4">
          {actionKind !== "warn" && actionKind !== "restore" && (
            <textarea
              rows={3}
              value={actionNote}
              onChange={(e) => setActionNote(e.target.value)}
              placeholder="Internal reason / note (logged in audit trail)…"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          )}
          <div className="flex gap-2">
            <Button
              variant={actionKind === "ban" ? "destructive" : actionKind === "restore" ? "default" : "outline"}
              onClick={confirmAction}
              className="flex-1"
            >
              {actionKind === "warn" ? "Issue Warning" :
               actionKind === "suspend" ? "Suspend" :
               actionKind === "ban" ? "Ban Member" : "Restore Access"}
            </Button>
            <Button variant="ghost" onClick={() => { setSelected(null); setActionKind(null); }}>Cancel</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
