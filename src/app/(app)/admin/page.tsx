"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CreditCard,
  LogIn,
  ShieldOff,
  TrendingUp,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  getAdminReports,
  getAdminFlags,
  getAdminUsers,
  getAdminVerifications,
  getLoginEvents,
  getPlatformMetrics,
  getAuditLog,
  type PlatformMetrics,
  type AdminReport,
  type LoginEvent,
  type AuditEntry,
} from "@/lib/data/admin";

function fmtTime(ts: number) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function MetricCard({
  label,
  value,
  sub,
  href,
  alert,
}: {
  label: string;
  value: string | number;
  sub?: string;
  href?: string;
  alert?: boolean;
}) {
  const content = (
    <Card className={cn("transition-colors", href && "hover:bg-secondary/50", alert && "border-destructive/40 bg-destructive/5")}>
      <CardContent className="flex flex-col gap-1 p-5">
        <p className={cn("text-xs font-medium uppercase tracking-wide", alert ? "text-destructive" : "text-muted-foreground")}>{label}</p>
        <p className={cn("text-3xl font-bold tabular-nums", alert && "text-destructive")}>{value}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
        {href && (
          <span className="mt-1 flex items-center gap-1 text-xs text-primary">
            View all <ArrowRight className="size-3" aria-hidden />
          </span>
        )}
      </CardContent>
    </Card>
  );
  if (href) return <Link href={href}>{content}</Link>;
  return content;
}

function severityDot(s: "low" | "medium" | "high") {
  return (
    <span className={cn(
      "inline-block size-2 rounded-full",
      s === "high" ? "bg-destructive" : s === "medium" ? "bg-warning" : "bg-muted-foreground",
    )} />
  );
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [logins, setLogins] = useState<LoginEvent[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [flagged, setFlagged] = useState(0);

  useEffect(() => {
    setMetrics(getPlatformMetrics());
    setReports(getAdminReports().filter((r) => r.status === "open").slice(0, 5));
    setLogins(
      getLoginEvents()
        .filter((l) => l.flag === "suspicious" || l.flag === "blocked" || l.flag === "new_location")
        .slice(0, 5),
    );
    setAudit(getAuditLog().slice(0, 8));
    const u = getAdminUsers();
    setFlagged(u.filter((x) => x.status === "flagged" || x.status === "suspended" || x.status === "banned").length);
  }, []);

  if (!metrics) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Platform Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time overview · {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <MetricCard label="Daily Active Users" value={metrics.dau.toLocaleString()} sub={`${metrics.mau.toLocaleString()} MAU`} />
        <MetricCard label="New Today" value={metrics.newUsersToday} sub={`+${metrics.newUsersWeek} this week`} />
        <MetricCard label="MRR" value={`$${metrics.mrrUsd.toFixed(0)}`} sub="Monthly recurring revenue" />
        <MetricCard label="Total Members" value={metrics.totalMembers} sub={`${metrics.suspendedCount} suspended · ${metrics.bannedCount} banned`} href="/admin/users" />
        <MetricCard label="Open Reports" value={metrics.reportsOpen} href="/admin/moderation" alert={metrics.reportsOpen > 0} />
        <MetricCard label="Pending Flags" value={metrics.flagsPending} href="/admin/moderation" alert={metrics.flagsPending > 0} />
        <MetricCard label="KYC Queue" value={metrics.verificationsPending} href="/admin/verifications" alert={metrics.verificationsPending > 0} />
        <MetricCard label="At-Risk Members" value={flagged} href="/admin/violations" alert={flagged > 0} />
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Sign-up → Verified", value: "68%", icon: Users },
          { label: "No-show Rate", value: "18%", icon: ShieldOff },
          { label: "Paid Conversion", value: "7.2%", icon: CreditCard },
          { label: "Safety Reports / 1k", value: weeklyStats.safetyPer1k, icon: AlertTriangle },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <s.icon className="size-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">{s.label}</p>
                <p className="text-lg font-bold">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent open reports */}
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Open Reports</CardTitle>
            <Link href="/admin/moderation" className="flex items-center gap-1 text-xs text-primary hover:underline">
              All reports <ArrowRight className="size-3" aria-hidden />
            </Link>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {reports.length === 0 ? (
              <p className="text-sm text-muted-foreground">No open reports.</p>
            ) : (
              reports.map((r) => (
                <div key={r.id} className="flex items-start gap-2 rounded-lg border p-3 text-sm">
                  {severityDot(r.severity)}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{r.reason}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {r.reporterName} → {r.targetName} · {r.targetType}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{fmtTime(r.createdAt)}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Suspicious logins */}
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Suspicious Logins</CardTitle>
            <Link href="/admin/logins" className="flex items-center gap-1 text-xs text-primary hover:underline">
              Full audit <ArrowRight className="size-3" aria-hidden />
            </Link>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {logins.length === 0 ? (
              <p className="text-sm text-muted-foreground">No alerts.</p>
            ) : (
              logins.map((l) => (
                <div key={l.id} className="flex items-center gap-2 rounded-lg border p-3 text-sm">
                  <LogIn className={cn(
                    "size-4 shrink-0",
                    l.flag === "blocked" ? "text-destructive" : "text-warning",
                  )} aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{l.userName}</p>
                    <p className="text-xs text-muted-foreground">{l.city} · {l.device}</p>
                  </div>
                  <Badge
                    variant={l.flag === "blocked" ? "default" : "accent"}
                    className={cn("text-[10px] shrink-0", l.flag === "blocked" && "bg-destructive")}
                  >
                    {l.flag.replace("_", " ")}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Audit log */}
      {audit.length > 0 && (
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Recent Admin Actions</CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" aria-hidden />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="divide-y">
              {audit.map((e) => (
                <div key={e.id} className="flex items-start gap-3 py-2 text-sm">
                  <span className="shrink-0 text-xs text-muted-foreground tabular-nums w-14">{fmtTime(e.at)}</span>
                  <div className="min-w-0 flex-1">
                    <span className="font-medium">{e.action}</span>
                    {" — "}
                    <span className="text-muted-foreground">{e.target}</span>
                    {e.note && <p className="mt-0.5 text-xs text-muted-foreground truncate">{e.note}</p>}
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{e.by}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

const weeklyStats = { safetyPer1k: "2.3" };
