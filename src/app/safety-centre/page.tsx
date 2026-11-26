import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  ShieldCheck,
  UserCheck,
  MapPin,
  Bell,
  Flag,
  ArrowRight,
} from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Safety Centre",
  description:
    "Verified members, share-my-plan, check-in timer and in-app SOS. Safety is the product at Buddybie.",
  alternates: { canonical: "/safety-centre" },
};

export default async function SafetyCentrePage() {
  const t = await getTranslations("landing");
  const ts = await getTranslations("safety");
  const tm = await getTranslations("meetupDisclaimer");

  const pillars = [
    {
      icon: UserCheck,
      title: ts("levelPhone"),
      desc: "Every member verifies their phone number at sign-up. Selfie liveness and government ID checks unlock higher trust levels.",
    },
    {
      icon: MapPin,
      title: ts("planTitle"),
      desc: "Before any meetup, share your plan — where you're going, when and with whom — with a trusted contact in one tap.",
    },
    {
      icon: Bell,
      title: ts("checkInTitle"),
      desc: "Set a timer before you head out. If you don't check back in, we prompt you to alert your trusted contacts.",
    },
    {
      icon: ShieldCheck,
      title: ts("sosTitle"),
      desc: "One-tap SOS shares your live location with your trusted contacts instantly.",
    },
    {
      icon: Flag,
      title: "Report & block",
      desc: ts("reportSentBody"),
    },
    {
      icon: UserCheck,
      title: ts("stepIdTitle"),
      desc: ts("stepIdDesc"),
    },
  ];

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-16">
          {/* Hero */}
          <PageHero eyebrow="Safety is the product" title={ts("title")} subtitle={ts("subtitle")} photo="safety" />

          {/* Pillars */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <Card key={pillar.title} className="p-5">
                  <span className="mb-3 flex size-11 items-center justify-center rounded-lg bg-brand-teal/10 text-brand-teal">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <h2 className="font-semibold">{pillar.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{pillar.desc}</p>
                </Card>
              );
            })}
          </div>

          {/* Meetup tips */}
          <div className="mt-16 rounded-xl border p-6">
            <h2 className="mb-4 text-xl font-bold">Meetup safety tips</h2>
            <ul className="space-y-3">
              {(["tip1", "tip2", "tip3", "tip4", "tip5"] as const).map((key) => (
                <li key={key} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand-teal" aria-hidden />
                  {tm(key)}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-16 flex justify-center">
            <Link href="/signin" className={cn(buttonVariants({ size: "lg" }))}>
              {t("heroCtaPrimary")}
              <ArrowRight />
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
