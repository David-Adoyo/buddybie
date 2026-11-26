import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { env } from "@/lib/env";
import { cities } from "@/data/areas";
import { launchCircles } from "@/data/circles";

interface Params {
  city: string;
  circle: string;
}

function resolve(params: Params) {
  const city = cities.find((c) => c.id === params.city);
  const circle = launchCircles.find((c) => c.id === params.circle);
  return { city, circle };
}

export function generateStaticParams() {
  return cities.flatMap((city) =>
    launchCircles.map((circle) => ({ city: city.id, circle: circle.id })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { city, circle } = resolve(await params);
  if (!city || !circle) return { title: "Not found" };
  const title = `${circle.name} in ${city.name}`;
  const description = `${circle.tagline} Connect with verified ${circle.name} members in ${city.name} — real meetups, goals-first matching and a warm community on Be a Buddy.`;
  const canonicalUrl = `/discover/${city.id}/${circle.id}`;
  return {
    title,
    description,
    keywords: [
      `${circle.name} ${city.name}`,
      `meet people in ${city.name}`,
      `${city.name} community app`,
      `${city.name} ${circle.tagline.toLowerCase()}`,
      "Be a Buddy",
      circle.name,
    ],
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${title} · Be a Buddy`,
      description,
      type: "website",
      url: canonicalUrl,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · Be a Buddy`,
      description,
    },
  };
}

export default async function DiscoverCirclePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { city, circle } = resolve(await params);
  if (!city || !circle) notFound();
  const Icon = circle.icon;

  const base = env.siteUrl.replace(/\/$/, "");
  const pageUrl = `${base}/discover/${city.id}/${circle.id}`;
  const ldJson = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${base}/#organisation`,
        name: "Be a Buddy",
        url: base,
      },
      {
        "@type": "WebPage",
        "@id": pageUrl,
        url: pageUrl,
        name: `${circle.name} in ${city.name} · Be a Buddy`,
        description: `${circle.tagline} Connect with verified ${circle.name} members in ${city.name} — real meetups, goals-first matching and a warm community.`,
        isPartOf: { "@id": `${base}/#website` },
        about: {
          "@type": "Place",
          name: city.name,
        },
        publisher: { "@id": `${base}/#organisation` },
        inLanguage: "en",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
      />
      <SiteHeader />
      <main id="main-content" className="flex-1">
        <section className="mx-auto max-w-4xl px-4 py-16 text-center">
          <span
            className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl"
            style={{ backgroundColor: `${circle.accent}1f`, color: circle.accent }}
          >
            <Icon className="size-8" aria-hidden />
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            {circle.name} in {city.name}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            {circle.description}
          </p>
          <div className="mt-8 flex justify-center">
            <Link href="/signin" className={cn(buttonVariants({ size: "lg" }))}>
              Join {circle.name}
              <ArrowRight />
            </Link>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Verified members · Safety tools built in · Free to join
          </p>
        </section>

        <section className="border-t bg-muted/30">
          <div className="mx-auto max-w-4xl px-4 py-12">
            <h2 className="mb-4 text-xl font-bold">Other Circles in {city.name}</h2>
            <div className="flex flex-wrap gap-2">
              {launchCircles
                .filter((c) => c.id !== circle.id)
                .map((c) => (
                  <Link
                    key={c.id}
                    href={`/discover/${city.id}/${c.id}`}
                    className="rounded-full border px-3 py-1.5 text-sm hover:bg-secondary"
                  >
                    {c.name}
                  </Link>
                ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

export const dynamicParams = true;
