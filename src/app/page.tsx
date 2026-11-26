import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  ShieldCheck,
  ArrowRight,
  Users,
  Tag,
  Wand2,
  HelpCircle,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WaitlistForm } from "@/components/landing/waitlist-form";
import { LandingStructuredData } from "@/components/structured-data";
import { launchCircles } from "@/data/circles";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default async function LandingPage() {
  const t = await getTranslations("landing");

  const teasers = [
    {
      href: "/how",
      icon: HelpCircle,
      label: t("howTitle"),
      desc: "Verify once, pick your Circles and meet real people near you.",
      cta: "See how it works",
    },
    {
      href: "/circles",
      icon: Users,
      label: t("circlesTitle"),
      desc: t("circlesSubtitle"),
      cta: "Explore all Circles",
    },
    {
      href: "/pricing",
      icon: Tag,
      label: t("pricingTitle"),
      desc: t("pricingSubtitle"),
      cta: "View plans",
    },
    {
      href: "/safety-centre",
      icon: ShieldCheck,
      label: t("featureSafetyTitle"),
      desc: t("featureSafetyDesc"),
      cta: "Safety centre",
    },
  ];

  return (
    <>
      <LandingStructuredData />
      <SiteHeader />
      <main id="main-content" className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            data-decorative="true"
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 60% at 80% 0%, color-mix(in oklab, var(--accent) 22%, transparent), transparent), radial-gradient(50% 50% at 0% 100%, color-mix(in oklab, var(--primary) 18%, transparent), transparent)",
            }}
          />
          <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
            <div className="space-y-6">
              <Badge variant="outline" className="bg-background/70">
                {t("eyebrow")}
              </Badge>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
                {t("heroTitle")}
              </h1>
              <p className="max-w-prose text-lg text-muted-foreground">
                {t("heroSubtitle")}
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/signin" className={cn(buttonVariants({ size: "lg" }))}>
                  {t("heroCtaPrimary")}
                  <ArrowRight />
                </Link>
                <Link
                  href="/circles"
                  className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
                >
                  {t("heroCtaSecondary")}
                </Link>
              </div>
              <p className="text-sm text-muted-foreground">{t("trustLine")}</p>
            </div>

            {/* Decorative buddy cluster */}
            <div
              data-decorative="true"
              aria-hidden
              className="relative mx-auto hidden h-80 w-full max-w-sm md:block"
            >
              {launchCircles.slice(0, 7).map((circle, i) => {
                const Icon = circle.icon;
                const positions = [
                  "left-1/2 top-4 -translate-x-1/2",
                  "left-6 top-24",
                  "right-6 top-20",
                  "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 scale-125",
                  "left-10 bottom-10",
                  "right-10 bottom-14",
                  "left-1/2 bottom-2 -translate-x-1/2",
                ];
                return (
                  <span
                    key={circle.id}
                    className={cn(
                      "absolute flex size-16 items-center justify-center rounded-full border bg-card shadow-md",
                      positions[i],
                    )}
                    style={{ color: circle.accent }}
                  >
                    <Icon className="size-7" />
                  </span>
                );
              })}
            </div>
          </div>
        </section>

        {/* Section teasers */}
        <section className="border-t bg-muted/30">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <h2 className="mb-8 text-2xl font-bold tracking-tight">
              Everything you need to find your people
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {teasers.map((item) => {
                const Icon = item.icon;
                return (
                  <Card key={item.href} className="flex flex-col p-5">
                    <span className="mb-3 flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <h3 className="font-semibold">{item.label}</h3>
                    <p className="mt-1 flex-1 text-sm text-muted-foreground">{item.desc}</p>
                    <Link
                      href={item.href}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "sm" }),
                        "mt-4 -ml-2 w-fit gap-1 text-primary",
                      )}
                    >
                      {item.cta} <ArrowRight className="size-3.5" />
                    </Link>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Waitlist */}
        <section id="waitlist" className="border-t bg-muted/30">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tight">
                {t("waitlistTitle")}
              </h2>
              <p className="text-muted-foreground">{t("waitlistSubtitle")}</p>
            </div>
            <WaitlistForm />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
