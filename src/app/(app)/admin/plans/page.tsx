"use client";

import { useEffect, useState } from "react";
import {
  BadgeCheck,
  ChevronDown,
  CreditCard,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  getAdminSubscriptions,
  setAdminSubscriptionStatus,
  type AdminSubscription,
} from "@/lib/data/admin";

function fmtDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
function fmtUsd(n: number) {
  return `$${n.toFixed(2)}`;
}

const STATUS_META: Record<AdminSubscription["status"], { label: string; className: string }> = {
  active:           { label: "Active",           className: "bg-success/10 text-success border-success/30" },
  cancelled:        { label: "Cancelled",         className: "bg-muted text-muted-foreground" },
  past_due:         { label: "Past Due",          className: "bg-warning/10 text-warning border-warning/30" },
  refund_requested: { label: "Refund Requested",  className: "bg-destructive/10 text-destructive border-destructive/30" },
};

type FilterStatus = "all" | AdminSubscription["status"];

export default function PlansPage() {
  const [subs, setSubs] = useState<AdminSubscription[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [focus, setFocus] = useState<AdminSubscription | null>(null);

  function reload() {
    setSubs(getAdminSubscriptions());
  }
  useEffect(reload, []);

  const filtered = subs.filter((s) => {
    const q = query.toLowerCase();
    const matchQ = !q || s.userName.toLowerCase().includes(q) || s.planName.toLowerCase().includes(q) || s.paymentMethod.toLowerCase().includes(q);
    const matchF = filter === "all" || s.status === filter;
    return matchQ && matchF;
  });

  const mrr = subs
    .filter((s) => s.status === "active")
    .reduce((sum, s) => sum + (s.interval === "annual" ? s.amountUsd / 12 : s.amountUsd), 0);

  const refundRequests = subs.filter((s) => s.status === "refund_requested");
  const pastDue = subs.filter((s) => s.status === "past_due");

  function processRefund(s: AdminSubscription) {
    setAdminSubscriptionStatus(s.id, "cancelled");
    setFocus(null);
    reload();
  }

  function retryPayment(s: AdminSubscription) {
    setAdminSubscriptionStatus(s.id, "active");
    setFocus(null);
    reload();
  }

  function cancelSub(s: AdminSubscription) {
    setAdminSubscriptionStatus(s.id, "cancelled");
    setFocus(null);
    reload();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Plans & Billing</h1>
        <p className="text-sm text-muted-foreground">
          {subs.filter((s) => s.status === "active").length} active subscriptions · MRR {fmtUsd(mrr)}
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "MRR", value: fmtUsd(mrr), colour: "text-primary" },
          { label: "Active", value: subs.filter((s) => s.status === "active").length, colour: "text-success" },
          { label: "Past Due", value: pastDue.length, colour: pastDue.length > 0 ? "text-warning" : "text-muted-foreground" },
          { label: "Refund Requests", value: refundRequests.length, colour: refundRequests.length > 0 ? "text-destructive" : "text-muted-foreground" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className={cn("text-2xl font-bold", s.colour)}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Refund alert */}
      {refundRequests.length > 0 && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 space-y-2">
          <p className="text-sm font-semibold text-destructive">
            {refundRequests.length} refund request{refundRequests.length !== 1 ? "s" : ""} pending
          </p>
          {refundRequests.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-3 rounded-lg bg-background border p-3 text-sm">
              <div className="min-w-0">
                <p className="font-medium">{s.userName}</p>
                <p className="text-xs text-muted-foreground truncate">{s.refundReason}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" variant="destructive" onClick={() => { setFocus(s); }}>
                  Review
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search member name, plan, payment method…"
            className="pl-9"
          />
        </div>
        <div className="relative">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterStatus)}
            className="h-11 w-full rounded-md border border-input bg-background px-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring sm:w-52"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="past_due">Past Due</option>
            <option value="refund_requested">Refund Requested</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Member</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Plan</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Amount</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">Payment</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Started</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">Next Bill</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((s) => (
                <tr
                  key={s.id}
                  className={cn(
                    "transition-colors hover:bg-muted/20",
                    s.status === "refund_requested" && "bg-destructive/3",
                    s.status === "past_due" && "bg-warning/3",
                  )}
                >
                  <td className="px-4 py-3 font-medium">{s.userName}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <div>
                      <p>{s.planName}</p>
                      <p className="text-xs text-muted-foreground capitalize">{s.interval}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 tabular-nums hidden md:table-cell">{fmtUsd(s.amountUsd)}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">{s.paymentMethod}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">{fmtDate(s.startedAt)}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">
                    {s.status === "cancelled" ? "—" : fmtDate(s.nextBillingAt)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "rounded-full border px-2 py-0.5 text-[10px] font-medium",
                      STATUS_META[s.status].className,
                    )}>
                      {STATUS_META[s.status].label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs"
                      onClick={() => setFocus(s)}
                    >
                      Manage
                    </Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No subscriptions match the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Manage dialog */}
      <Dialog
        open={!!focus}
        onClose={() => setFocus(null)}
        title={focus ? `${focus.userName} — ${focus.planName}` : ""}
        description={focus ? `${focus.interval === "annual" ? "Annual" : "Monthly"} · ${fmtUsd(focus.amountUsd)} · ${focus.paymentMethod}` : undefined}
      >
        {focus && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-2">
              {[
                ["Started", fmtDate(focus.startedAt)],
                ["Next billing", focus.status === "cancelled" ? "Cancelled" : fmtDate(focus.nextBillingAt)],
                ["Status", STATUS_META[focus.status].label],
                ["Amount", fmtUsd(focus.amountUsd)],
              ].map(([k, v]) => (
                <div key={String(k)} className="rounded-lg bg-muted/40 p-2">
                  <p className="text-xs text-muted-foreground">{k}</p>
                  <p className="font-medium">{String(v)}</p>
                </div>
              ))}
            </div>

            {focus.refundReason && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                <p className="text-xs font-medium text-destructive mb-1">Refund reason</p>
                <p className="text-xs">{focus.refundReason}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {focus.status === "refund_requested" && (
                <Button variant="destructive" size="sm" onClick={() => processRefund(focus)}>
                  <CreditCard className="size-4" /> Process Refund
                </Button>
              )}
              {focus.status === "past_due" && (
                <Button variant="outline" size="sm" onClick={() => retryPayment(focus)}>
                  <RefreshCw className="size-4" /> Mark as Paid
                </Button>
              )}
              {focus.status === "active" && (
                <Button variant="outline" size="sm" onClick={() => cancelSub(focus)}>
                  <XCircle className="size-4" /> Cancel Subscription
                </Button>
              )}
              {focus.status === "cancelled" && (
                <Button variant="outline" size="sm" onClick={() => retryPayment(focus)}>
                  <BadgeCheck className="size-4" /> Reactivate
                </Button>
              )}
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
