import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Check, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { memberPlans, bundlePlans, hostPlans } from "@/data/plans";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pricing — Be a Buddy",
  description:
    "Start free. Upgrade any Circle when you are ready — pay monthly or save 30% with an annual plan. Plans for members, bundles and hosts.",
  alternates: { canonical: "/pricing" },
};

function PlanCard({
  name,
  monthly,
  annual,
  features,
  isSpark,
  popular,
  alwaysFree,
  ctaLabel,
}: {
  name: string;
  monthly: number;
  annual?: number;
  features: string[];
  isSpark?: boolean;
  popular?: boolean;
  alwaysFree?: boolean;
  ctaLabel: string;
}) {
  return (
    <Card
      className={cn(
        "relative flex flex-col p-5",
        popular && "border-primary ring-1 ring-primary/30",
      )}
    >
      {popular && (
        <Badge className="absolute -top-2.5 right-4">Popular</Badge>
      )}
      <h3 className="flex items-center gap-1.5 font-semibold">
        {isSpark && <Sparkles className="size-4 text-spark" aria-hidden />}
        {name}
      </h3>
      <p className="mt-1">
        {alwaysFree ? (
          <span className="text-2xl font-bold">Free</span>
        ) : (
          <>
            <span className="text-2xl font-bold">${monthly}</span>
            <span className="text-sm text-muted-foreground">/mo</span>
          </>
        )}
      </p>
      {annual && !alwaysFree && (
        <p className="text-xs text-muted-foreground">
          or ${annual}/yr · save ~30%
        </p>
      )}
      <ul className="mt-3 flex-1 space-y-1.5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm">
            <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
            <span className="text-muted-foreground">{f}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/signin"
        className={cn(
          buttonVariants({ variant: isSpark ? "spark" : "default" }),
          "mt-4 w-full",
        )}
      >
        {ctaLabel}
      </Link>
    </Card>
  );
}

export default async function PricingPage() {
  const t = await getTranslations("landing");

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="mb-12 max-w-2xl">
            <h1 className="text-4xl font-extrabold tracking-tight">{t("pricingTitle")}</h1>
            <p className="mt-3 text-lg text-muted-foreground">{t("pricingSubtitle")}</p>
          </div>

          {/* Member plans */}
          <section className="mb-16">
            <h2 className="mb-6 text-2xl font-bold tracking-tight">Member plans</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {/* Free tier */}
              <Card className="flex flex-col p-5">
                <h3 className="font-semibold">{t("pricingFreeName")}</h3>
                <p className="mt-1">
                  <span className="text-2xl font-bold">$0</span>
                  <span className="text-sm text-muted-foreground">/mo</span>
                </p>
                <p className="mt-3 flex-1 text-sm text-muted-foreground">{t("pricingFreeDesc")}</p>
                <Link
                  href="/signin"
                  className={cn(buttonVariants({ variant: "outline" }), "mt-4 w-full")}
                >
                  {t("pricingCta")}
                </Link>
              </Card>

              {memberPlans.map((plan) => (
                <PlanCard
                  key={plan.code}
                  name={plan.name}
                  monthly={plan.monthly}
                  annual={plan.annual}
                  features={plan.features}
                  isSpark={plan.circleId === "spark"}
                  popular={plan.code === "spark-plus"}
                  ctaLabel={t("pricingCta")}
                />
              ))}
            </div>
          </section>

          {/* Bundle plans */}
          <section className="mb-16">
            <h2 className="mb-2 text-2xl font-bold tracking-tight">Bundles</h2>
            <p className="mb-6 text-muted-foreground">Unlock multiple Circles at a single price.</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {bundlePlans.map((plan) => (
                <PlanCard
                  key={plan.code}
                  name={plan.name}
                  monthly={plan.monthly}
                  annual={plan.annual}
                  features={plan.features}
                  ctaLabel={t("pricingCta")}
                />
              ))}
            </div>
          </section>

          {/* Host plans */}
          <section>
            <h2 className="mb-2 text-2xl font-bold tracking-tight">Host plans</h2>
            <p className="mb-6 text-muted-foreground">
              For churches, companies and venues running their own community.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {hostPlans.map((plan) => (
                <PlanCard
                  key={plan.code}
                  name={plan.name}
                  monthly={plan.monthly}
                  annual={plan.annual}
                  features={plan.features}
                  ctaLabel="Get started"
                />
              ))}
            </div>
          </section>

          <p className="mt-10 text-center text-sm text-muted-foreground">{t("pricingNote")}</p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
