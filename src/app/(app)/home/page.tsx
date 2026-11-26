"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Eye,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Utensils,
} from "lucide-react";
import { useActiveCircle } from "@/lib/active-circle";
import { SparkGate } from "@/components/spark/spark-gate";
import { SparkHome } from "@/components/spark/spark-home";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getCircleProfile,
  getMe,
  isMine,
  listGoals,
} from "@/lib/data/store";
import type { CircleProfile, Goal, Member } from "@/lib/types";

export default function AppHomePage() {
  const t = useTranslations("app");
  const tp = useTranslations("profile");
  const { activeCircle } = useActiveCircle();

  const [me, setMe] = useState<Member | null>(null);
  const [profile, setProfile] = useState<CircleProfile | null>(null);
  const [myGoals, setMyGoals] = useState<Goal[]>([]);

  useEffect(() => {
    if (!activeCircle || activeCircle.isSpark) return;
    setMe(getMe());
    setProfile(getCircleProfile(activeCircle.id));
    setMyGoals(listGoals(activeCircle.id).filter(isMine));
  }, [activeCircle]);

  if (!activeCircle) return null;
  if (activeCircle.isSpark) {
    return (
      <SparkGate>
        <SparkHome />
      </SparkGate>
    );
  }

  const Icon = activeCircle.icon;
  const visLabel = profile ? tp(`vis_${profile.visibility}`) : "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t("welcomeBack", { name: me?.name ?? "" })}
        </h1>
        <p className="mt-1 flex items-center gap-2 text-muted-foreground">
          <span
            className="flex size-6 items-center justify-center rounded-full"
            style={{
              backgroundColor: `${activeCircle.accent}1f`,
              color: activeCircle.accent,
            }}
          >
            <Icon className="size-4" aria-hidden />
          </span>
          {t("inCircle", { circle: activeCircle.name })}
        </p>
      </div>

      {/* Explore hub */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[
          { href: "/buddies", label: t("exploreBuddies"), icon: Sparkles },
          { href: "/groups", label: t("exploreGroups"), icon: Users },
          { href: "/events", label: t("exploreEvents"), icon: CalendarDays },
          { href: "/table", label: t("exploreTable"), icon: Utensils },
          { href: "/safety", label: t("exploreSafety"), icon: ShieldCheck },
          { href: "/plans", label: t("explorePlans"), icon: Sparkles },
          { href: "/host", label: t("exploreHost"), icon: Building2 },
          { href: "/admin", label: t("exploreAdmin"), icon: LayoutDashboard },
        ].map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="flex items-center gap-3 p-4 transition-colors hover:bg-secondary">
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <item.icon className="size-5" aria-hidden />
              </span>
              <span className="font-medium">{item.label}</span>
            </Card>
          </Link>
        ))}
      </div>

      {/* Per-Circle profile summary */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">
            {t("yourProfileHere", { circle: activeCircle.name })}
          </CardTitle>
          <Link
            href="/profile"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            {t("editProfile")}
          </Link>
        </CardHeader>
        <CardContent className="flex items-start gap-3">
          {me && <Avatar name={profile?.displayName ?? me.name} colour={me.colour} />}
          <div className="min-w-0">
            <p className="font-medium">{profile?.displayName}</p>
            <p className="text-sm text-muted-foreground">
              {profile?.bio || "—"}
            </p>
            <Badge variant="outline" className="mt-2">
              <Eye className="size-3" aria-hidden />
              {visLabel}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Goals in this Circle */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">
            {t("yourGoalsHere", { circle: activeCircle.name })}
          </CardTitle>
          <Link
            href="/goals"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            {t("viewBoard")}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </CardHeader>
        <CardContent className="space-y-2">
          {myGoals.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("noGoalsHere")}</p>
          ) : (
            myGoals.map((goal) => (
              <div key={goal.id} className="flex items-center gap-2 text-sm">
                <Target className="size-4 shrink-0 text-primary" aria-hidden />
                <span>{goal.title}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
