"use client";

import { useEffect, useState } from "react";
import {
  Ban,
  CheckCircle2,
  ChevronDown,
  Filter,
  MoreHorizontal,
  Search,
  ShieldAlert,
  UserCheck,
  UserX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  getAdminUsers,
  updateUserStatus,
  addUserWarning,
  type AdminUser,
  type UserStatus,
  type RiskLevel,
} from "@/lib/data/admin";

const STATUS_LABELS: Record<UserStatus, string> = {
  active: "Active",
  suspended: "Suspended",
  banned: "Banned",
  pending: "Pending",
  flagged: "Flagged",
};

const STATUS_VARIANT: Record<UserStatus, string> = {
  active: "success",
  suspended: "accent",
  banned: "default",
  pending: "secondary",
  flagged: "accent",
};

const RISK_COLOUR: Record<RiskLevel, string> = {
  low: "text-success",
  medium: "text-warning",
  high: "text-destructive",
  critical: "text-destructive font-bold",
};

function fmtDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
function fmtTime(ts: number) {
  const diff = Date.now() - ts;
  const hrs = Math.floor(diff / 3_600_000);
  if (hrs < 1) return "just now";
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

type FilterStatus = "all" | UserStatus;
type FilterRisk = "all" | RiskLevel;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterRisk, setFilterRisk] = useState<FilterRisk>("all");
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [actionTarget, setActionTarget] = useState<AdminUser | null>(null);
  const [actionKind, setActionKind] = useState<"suspend" | "ban" | "restore" | "warn" | null>(null);
  const [actionNote, setActionNote] = useState("");

  function reload() {
    setUsers(getAdminUsers());
  }

  useEffect(reload, []);

  const filtered = users.filter((u) => {
    const q = query.toLowerCase();
    const matchQ =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.city.toLowerCase().includes(q) ||
      u.phone.includes(q);
    const matchStatus = filterStatus === "all" || u.status === filterStatus;
    const matchRisk = filterRisk === "all" || u.riskLevel === filterRisk;
    return matchQ && matchStatus && matchRisk;
  });

  function openAction(u: AdminUser, kind: typeof actionKind) {
    setActionTarget(u);
    setActionKind(kind);
    setActionNote("");
  }

  function confirmAction() {
    if (!actionTarget || !actionKind) return;
    if (actionKind === "warn") {
      addUserWarning(actionTarget.id);
    } else {
      const status: UserStatus =
        actionKind === "suspend" ? "suspended" :
        actionKind === "ban" ? "banned" : "active";
      updateUserStatus(actionTarget.id, status, actionNote || undefined);
    }
    setActionTarget(null);
    setActionKind(null);
    reload();
  }

  const counts = {
    all: users.length,
    active: users.filter((u) => u.status === "active").length,
    flagged: users.filter((u) => u.status === "flagged").length,
    suspended: users.filter((u) => u.status === "suspended").length,
    banned: users.filter((u) => u.status === "banned").length,
    pending: users.filter((u) => u.status === "pending").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Members</h1>
          <p className="text-sm text-muted-foreground">{users.length} total members</p>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2">
        {(["all", "active", "flagged", "suspended", "banned", "pending"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilterStatus(s)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              filterStatus === s
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background hover:bg-secondary",
            )}
          >
            {s === "all" ? "All" : STATUS_LABELS[s]}
            <span className={cn(
              "ml-1.5 rounded-full px-1.5 py-0.5 text-[10px]",
              filterStatus === s ? "bg-primary-foreground/20" : "bg-muted text-muted-foreground",
            )}>
              {counts[s]}
            </span>
          </button>
        ))}
      </div>

      {/* Search + risk filter */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, city…"
            className="pl-9"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value as FilterRisk)}
            className="h-11 w-full rounded-md border border-input bg-background pl-9 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring sm:w-40"
          >
            <option value="all">All risks</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="overflow-x-auto p-0">
          {filtered.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">No members match the current filters.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Member</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">City</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Trust</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">Risk</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">Joined</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Last seen</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((u) => (
                  <tr
                    key={u.id}
                    className={cn(
                      "group transition-colors hover:bg-muted/30",
                      (u.status === "banned" || u.status === "suspended") && "bg-destructive/3",
                    )}
                  >
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        className="flex items-center gap-2 text-left"
                        onClick={() => setSelected(u)}
                      >
                        <Avatar name={u.name} className="size-7 text-xs" />
                        <div className="min-w-0">
                          <p className="font-medium truncate max-w-[120px]">{u.name}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[120px]">{u.email}</p>
                        </div>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{u.city}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={STATUS_VARIANT[u.status] as Parameters<typeof Badge>[0]["variant"]}
                        className={cn(u.status === "banned" && "bg-destructive")}
                      >
                        {STATUS_LABELS[u.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 tabular-nums hidden md:table-cell">
                      <span className={cn(u.trustScore < 40 ? "text-destructive" : u.trustScore < 60 ? "text-warning" : "text-success")}>
                        {u.trustScore}
                      </span>
                    </td>
                    <td className={cn("px-4 py-3 hidden lg:table-cell capitalize", RISK_COLOUR[u.riskLevel])}>
                      {u.riskLevel}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{fmtDate(u.joinedAt)}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{fmtTime(u.lastSeenAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setSelected(u)}
                          title="View details"
                          className="rounded p-1 text-muted-foreground hover:text-foreground"
                        >
                          <MoreHorizontal className="size-4" aria-hidden />
                        </button>
                        {u.status !== "banned" && (
                          <button
                            type="button"
                            onClick={() => openAction(u, "warn")}
                            title="Issue warning"
                            className="rounded p-1 text-warning hover:bg-warning/10"
                          >
                            <ShieldAlert className="size-4" aria-hidden />
                          </button>
                        )}
                        {u.status === "active" || u.status === "flagged" || u.status === "pending" ? (
                          <>
                            <button
                              type="button"
                              onClick={() => openAction(u, "suspend")}
                              title="Suspend"
                              className="rounded p-1 text-warning hover:bg-warning/10"
                            >
                              <UserX className="size-4" aria-hidden />
                            </button>
                            <button
                              type="button"
                              onClick={() => openAction(u, "ban")}
                              title="Ban"
                              className="rounded p-1 text-destructive hover:bg-destructive/10"
                            >
                              <Ban className="size-4" aria-hidden />
                            </button>
                          </>
                        ) : u.status === "suspended" ? (
                          <button
                            type="button"
                            onClick={() => openAction(u, "restore")}
                            title="Restore access"
                            className="rounded p-1 text-success hover:bg-success/10"
                          >
                            <UserCheck className="size-4" aria-hidden />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Detail drawer */}
      <Dialog
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.name ?? ""}
        description={selected ? `${selected.email} · ${selected.phone}` : undefined}
      >
        {selected && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              {[
                ["City", selected.city],
                ["Joined", fmtDate(selected.joinedAt)],
                ["Last seen", fmtTime(selected.lastSeenAt)],
                ["Status", STATUS_LABELS[selected.status]],
                ["Verified level", `Level ${selected.verifiedLevel}`],
                ["Trust score", selected.trustScore],
                ["Reports filed against", selected.reports],
                ["Warnings", selected.warnings],
              ].map(([k, v]) => (
                <div key={String(k)} className="rounded-lg bg-muted/40 p-2">
                  <p className="text-xs text-muted-foreground">{k}</p>
                  <p className="font-medium">{String(v)}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Circles</p>
              <div className="flex flex-wrap gap-1">
                {selected.circles.map((c) => (
                  <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                ))}
              </div>
            </div>
            {selected.planCode && (
              <p className="text-xs"><span className="text-muted-foreground">Plan:</span> {selected.planCode}</p>
            )}
            {selected.notes && (
              <div className="rounded-lg border border-warning/30 bg-warning/5 p-3">
                <p className="text-xs font-medium text-warning mb-0.5">Admin notes</p>
                <p className="text-xs">{selected.notes}</p>
              </div>
            )}
            <div className="flex flex-wrap gap-2 pt-2">
              {(selected.status === "active" || selected.status === "flagged") && (
                <>
                  <Button size="sm" variant="outline" onClick={() => { setSelected(null); openAction(selected, "warn"); }}>
                    <ShieldAlert className="size-4" /> Warn
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { setSelected(null); openAction(selected, "suspend"); }}>
                    <UserX className="size-4" /> Suspend
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => { setSelected(null); openAction(selected, "ban"); }}>
                    <Ban className="size-4" /> Ban
                  </Button>
                </>
              )}
              {selected.status === "suspended" && (
                <Button size="sm" variant="outline" onClick={() => { setSelected(null); openAction(selected, "restore"); }}>
                  <UserCheck className="size-4" /> Restore
                </Button>
              )}
              {selected.status === "banned" && (
                <Button size="sm" variant="outline" onClick={() => { setSelected(null); openAction(selected, "restore"); }}>
                  <CheckCircle2 className="size-4" /> Lift Ban
                </Button>
              )}
            </div>
          </div>
        )}
      </Dialog>

      {/* Action confirm dialog */}
      <Dialog
        open={!!actionTarget && !!actionKind}
        onClose={() => { setActionTarget(null); setActionKind(null); }}
        title={
          actionKind === "warn" ? `Issue warning to ${actionTarget?.name}` :
          actionKind === "suspend" ? `Suspend ${actionTarget?.name}` :
          actionKind === "ban" ? `Ban ${actionTarget?.name}` :
          `Restore ${actionTarget?.name}`
        }
        description={
          actionKind === "ban"
            ? "This will permanently ban the member. They will not be able to sign in."
            : actionKind === "suspend"
            ? "The member's account will be suspended until restored by an admin."
            : actionKind === "warn"
            ? "A formal warning will be logged against this member's account."
            : "Access will be restored and the member can sign in normally."
        }
      >
        <div className="space-y-4">
          {actionKind !== "warn" && actionKind !== "restore" && (
            <div>
              <label htmlFor="action-note" className="mb-1 block text-xs font-medium text-muted-foreground">
                Reason / internal note (optional)
              </label>
              <textarea
                id="action-note"
                rows={3}
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                placeholder="Describe the reason for this action…"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
          )}
          <div className="flex gap-2">
            <Button
              variant={actionKind === "ban" ? "destructive" : actionKind === "restore" ? "default" : "outline"}
              onClick={confirmAction}
              className="flex-1"
            >
              {actionKind === "warn" ? "Issue Warning" :
               actionKind === "suspend" ? "Suspend Account" :
               actionKind === "ban" ? "Ban Account" : "Restore Access"}
            </Button>
            <Button variant="ghost" onClick={() => { setActionTarget(null); setActionKind(null); }}>
              Cancel
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
