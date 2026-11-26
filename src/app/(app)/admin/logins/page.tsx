"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, MapPin, Monitor, Search, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getLoginEvents, type LoginEvent, type LoginFlag } from "@/lib/data/admin";

function fmtTime(ts: number) {
  return new Date(ts).toLocaleString("en-GB", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

const FLAG_META: Record<LoginFlag, { label: string; colour: string }> = {
  normal:        { label: "Normal",          colour: "text-success" },
  new_device:    { label: "New Device",       colour: "text-warning" },
  new_location:  { label: "New Location",     colour: "text-warning" },
  suspicious:    { label: "Suspicious",       colour: "text-destructive" },
  blocked:       { label: "Blocked",          colour: "text-destructive" },
};

const ACTION_LABELS: Record<LoginEvent["action"], string> = {
  sign_in:     "Signed in",
  sign_out:    "Signed out",
  otp_fail:    "OTP failed",
  otp_success: "OTP success",
  blocked:     "Access blocked",
};

type FlagFilter = "all" | LoginFlag;

export default function LoginsPage() {
  const [events, setEvents] = useState<LoginEvent[]>([]);
  const [query, setQuery] = useState("");
  const [flagFilter, setFlagFilter] = useState<FlagFilter>("all");

  useEffect(() => {
    setEvents(getLoginEvents());
  }, []);

  const suspicious = events.filter((e) => e.flag === "suspicious" || e.flag === "blocked");

  const filtered = events.filter((e) => {
    const q = query.toLowerCase();
    const matchQ =
      !q ||
      e.userName.toLowerCase().includes(q) ||
      e.ip.includes(q) ||
      e.city.toLowerCase().includes(q) ||
      e.device.toLowerCase().includes(q);
    const matchFlag = flagFilter === "all" || e.flag === flagFilter;
    return matchQ && matchFlag;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Login Activity</h1>
        <p className="text-sm text-muted-foreground">
          {events.length} events · {suspicious.length} suspicious or blocked
        </p>
      </div>

      {/* Alert summary */}
      {suspicious.length > 0 && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="size-4 text-destructive" aria-hidden />
            <span className="text-sm font-semibold text-destructive">
              {suspicious.length} suspicious login event{suspicious.length !== 1 ? "s" : ""} detected
            </span>
          </div>
          <div className="space-y-1.5">
            {suspicious.slice(0, 4).map((e) => (
              <div key={e.id} className="flex items-center gap-3 text-xs">
                <span className={FLAG_META[e.flag].colour}>{FLAG_META[e.flag].label}</span>
                <span className="font-medium">{e.userName}</span>
                <span className="text-muted-foreground">{e.ip}</span>
                <span className="text-muted-foreground">{e.city}</span>
                <span className="text-muted-foreground">{fmtTime(e.at)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search user, IP, city, device…"
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {(["all", "normal", "new_device", "new_location", "suspicious", "blocked"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFlagFilter(f)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                flagFilter === f
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background hover:bg-secondary",
              )}
            >
              {f === "all" ? "All" : FLAG_META[f].label}
            </button>
          ))}
        </div>
      </div>

      {/* Events table */}
      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="text-sm text-muted-foreground font-normal">
            Showing {filtered.length} event{filtered.length !== 1 ? "s" : ""}
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Time</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Member</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Action</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">IP</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">
                  <MapPin className="inline size-3 mr-1" aria-hidden />Location
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">
                  <Monitor className="inline size-3 mr-1" aria-hidden />Device
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Flag</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((e) => (
                <tr
                  key={e.id}
                  className={cn(
                    "transition-colors hover:bg-muted/20",
                    (e.flag === "suspicious" || e.flag === "blocked") && "bg-destructive/3",
                  )}
                >
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {fmtTime(e.at)}
                  </td>
                  <td className="px-4 py-3 font-medium">{e.userName}</td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "text-xs",
                      e.action === "blocked" || e.action === "otp_fail" ? "text-destructive" :
                      e.action === "otp_success" ? "text-success" : "text-foreground",
                    )}>
                      {ACTION_LABELS[e.action]}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground hidden sm:table-cell">{e.ip}</td>
                  <td className="px-4 py-3 text-xs hidden md:table-cell">{e.city}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">{e.device}</td>
                  <td className="px-4 py-3">
                    {e.flag === "normal" ? (
                      <Shield className="size-4 text-success" aria-hidden />
                    ) : (
                      <Badge
                        variant={e.flag === "suspicious" || e.flag === "blocked" ? "default" : "accent"}
                        className={cn(
                          "text-[10px]",
                          (e.flag === "suspicious" || e.flag === "blocked") && "bg-destructive",
                        )}
                      >
                        {FLAG_META[e.flag].label}
                      </Badge>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No login events match the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
