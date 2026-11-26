import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { cities } from "@/data/areas";
import { launchCircles } from "@/data/circles";

const LEGAL_DOCS = [
  "safety-centre",
  "privacy",
  "terms",
  "community",
  "refunds",
] as const;

/**
 * Public, crawlable URLs only. Signed-in app routes (`/home`, `/chat`, …),
 * `/onboarding` and API endpoints are intentionally excluded — they are gated
 * and carry no SEO value (also blocked in robots.ts).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = env.siteUrl.replace(/\/$/, "");
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/discover`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/signin`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  const legalRoutes: MetadataRoute.Sitemap = LEGAL_DOCS.map((doc) => ({
    url: `${base}/legal/${doc}`,
    lastModified: now,
    changeFrequency: "yearly",
    priority: 0.3,
  }));

  const discoverRoutes: MetadataRoute.Sitemap = cities.flatMap((city) =>
    launchCircles.map((circle) => ({
      url: `${base}/discover/${city.id}/${circle.id}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  );

  return [...staticRoutes, ...legalRoutes, ...discoverRoutes];
}
