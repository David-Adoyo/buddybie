import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { circles } from "@/data/circles";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Circles — Be a Buddy",
  description:
    "One identity, many Circles. Friends, Faith, Work, Spark, Goals, Fitness, Buddy Table and more — verify once, then choose where you show up.",
  alternates: { canonical: "/circles" },
};

export default async function CirclesPage() {
  const t = await getTranslations("landing");

  const wave1 = circles.filter((c) => c.launchWave === 1);
  const wave2plus = circles.filter((c) => c.launchWave > 1);

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="mb-12 max-w-2xl">
            <h1 className="text-4xl font-extrabold tracking-tight">{t("circlesTitle")}</h1>
            <p className="mt-3 text-lg text-muted-foreground">{t("circlesSubtitle")}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {wave1.map((circle) => {
              const Icon = circle.icon;
              return (
                <Card key={circle.id} className="flex items-start gap-4 p-5">
                  <span
                    className="flex size-11 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${circle.accent}22`, color: circle.accent }}
                  >
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <h2 className="font-semibold">{circle.name}</h2>
                    <p className="mt-0.5 text-sm font-medium text-muted-foreground">
                      {circle.tagline}
                    </p>
                    <p className="mt-1.5 text-sm text-muted-foreground">{circle.description}</p>
                    {circle.alwaysFree && (
                      <Badge variant="outline" className="mt-2 text-xs">
                        Always free
                      </Badge>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          {wave2plus.length > 0 && (
            <div className="mt-16">
              <h2 className="mb-2 text-2xl font-bold tracking-tight">Coming soon</h2>
              <p className="mb-6 text-muted-foreground">
                These Circles unlock as more cities reach the right density of members.
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {wave2plus.map((circle) => {
                  const Icon = circle.icon;
                  return (
                    <Card
                      key={circle.id}
                      className="flex items-start gap-4 p-5 opacity-60"
                    >
                      <span
                        className="flex size-11 shrink-0 items-center justify-center rounded-xl"
                        style={{ backgroundColor: `${circle.accent}22`, color: circle.accent }}
                      >
                        <Icon className="size-5" aria-hidden />
                      </span>
                      <div className="min-w-0">
                        <h3 className="font-semibold">{circle.name}</h3>
                        <p className="mt-0.5 text-sm text-muted-foreground">{circle.tagline}</p>
                        {circle.alwaysFree && (
                          <Badge variant="outline" className="mt-2 text-xs">
                            Always free
                          </Badge>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

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
