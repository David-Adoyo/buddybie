import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Target, Wand2, ShieldCheck, Smartphone, ArrowRight } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "How It Works — Make Friends as an Adult",
  description:
    "Verify once, pick your Circles and meet real people near you. Buddybie connects you through shared goals, values and neighbourhood.",
  alternates: { canonical: "/how" },
};

export default async function HowItWorksPage() {
  const t = await getTranslations("landing");

  const steps = [
    { title: t("howStep1Title"), desc: t("howStep1Desc") },
    { title: t("howStep2Title"), desc: t("howStep2Desc") },
    { title: t("howStep3Title"), desc: t("howStep3Desc") },
  ];

  const features = [
    { icon: Target, title: t("featureGoalsTitle"), desc: t("featureGoalsDesc") },
    { icon: Wand2, title: t("featureMatcherTitle"), desc: t("featureMatcherDesc") },
    { icon: ShieldCheck, title: t("featureSafetyTitle"), desc: t("featureSafetyDesc") },
    { icon: Smartphone, title: t("featureMpesaTitle"), desc: t("featureMpesaDesc") },
  ];

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <PageHero
            eyebrow="Getting started"
            title={t("howTitle")}
            subtitle="Three simple steps to meet real people who share your goals and values."
            photo="welcome"
          />

          <ol className="grid gap-8 md:grid-cols-3">
            {steps.map((step, i) => (
              <li key={step.title} className="flex gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground text-lg">
                  {i + 1}
                </span>
                <div>
                  <h2 className="text-xl font-semibold">{step.title}</h2>
                  <p className="mt-2 text-muted-foreground">{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-20">
            <h2 className="mb-2 text-3xl font-bold tracking-tight">{t("featuresTitle")}</h2>
            <p className="mb-8 text-muted-foreground">{t("featuresSubtitle")}</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card key={feature.title} className="p-5">
                    <span className="mb-3 flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{feature.desc}</p>
                  </Card>
                );
              })}
            </div>
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
