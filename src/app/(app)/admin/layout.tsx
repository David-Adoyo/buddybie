"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertTriangle,
  BarChart2,
  CheckSquare,
  CreditCard,
  LayoutDashboard,
  LogIn,
  ShieldOff,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { isModerator, setModerator } from "@/lib/data/safety";
import {
  getAdminReports,
  getAdminFlags,
  getAdminVerifications,
  getLoginEvents,
} from "@/lib/data/admin";

const NAV = [
  { href: "/admin",              label: "Dashboard",      icon: LayoutDashboard },
  { href: "/admin/users",        label: "Members",        icon: Users },
  { href: "/admin/moderation",   label: "Moderation",     icon: AlertTriangle },
  { href: "/admin/logins",       label: "Login Activity", icon: LogIn },
  { href: "/admin/violations",   label: "Violations",     icon: ShieldOff },
  { href: "/admin/verifications",label: "Verifications",  icon: CheckSquare },
  { href: "/admin/plans",        label: "Plans & Billing",icon: CreditCard },
];

function useBadgeCounts() {
  const [counts, setCounts] = useState({ mod: 0, login: 0, ver: 0 });
  useEffect(() => {
    const reports = getAdminReports().filter((r) => r.status === "open").length;
    const flags = getAdminFlags().filter((f) => f.status === "pending").length;
    const loginSuspicious = getLoginEvents().filter(
      (l) => l.flag === "suspicious" || l.flag === "blocked",
    ).length;
    const ver = getAdminVerifications().filter((v) => v.status === "pending").length;
    setCounts({ mod: reports + flags, login: loginSuspicious, ver });
  }, []);
  return counts;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [ready, setReady] = useState(false);
  const pathname = usePathname();
  const counts = useBadgeCounts();

  useEffect(() => {
    setIsAdmin(isModerator());
    setReady(true);
  }, []);

  if (!ready) return null;

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md space-y-6 py-20 text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <BarChart2 className="size-7" aria-hidden />
        </span>
        <div>
          <h1 className="text-xl font-bold">Admin Access Required</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This area is restricted to platform staff. Enable demo admin mode to
            explore the console.
          </p>
        </div>
        <Button
          onClick={() => {
            setModerator(true);
            setIsAdmin(true);
          }}
        >
          Enable Demo Admin Mode
        </Button>
        <p className="text-xs text-muted-foreground">
          Demo mode only — no real actions are taken.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* Admin header bar */}
      <div className="mb-4 flex items-center justify-between rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-2">
        <span className="flex items-center gap-2 text-sm font-semibold text-destructive">
          <BarChart2 className="size-4" aria-hidden />
          Admin Console
          <Badge className="ml-1 text-[10px]" variant="default">Demo</Badge>
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={() => {
            setModerator(false);
            setIsAdmin(false);
          }}
        >
          Exit Admin
        </Button>
      </div>

      {/* Scrollable top-nav */}
      <nav
        className="mb-6 -mx-4 flex gap-1 overflow-x-auto px-4 pb-1 scrollbar-none"
        aria-label="Admin navigation"
      >
        {NAV.map((item) => {
          const exact = item.href === "/admin";
          const active = exact ? pathname === "/admin" : pathname.startsWith(item.href);
          const badge =
            item.href === "/admin/moderation"
              ? counts.mod
              : item.href === "/admin/logins"
              ? counts.login
              : item.href === "/admin/verifications"
              ? counts.ver
              : 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/70",
              )}
            >
              <item.icon className="size-4 shrink-0" aria-hidden />
              {item.label}
              {badge > 0 && (
                <span className={cn(
                  "ml-0.5 flex size-5 items-center justify-center rounded-full text-[10px] font-bold",
                  active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-destructive text-white",
                )}>
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {children}
    </div>
  );
}
