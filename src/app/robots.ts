import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

/**
 * Allow crawling of the marketing + discovery surface; keep the signed-in app,
 * onboarding and API endpoints out of the index (they are gated and personal).
 */
export default function robots(): MetadataRoute.Robots {
  const base = env.siteUrl.replace(/\/$/, "");
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/home",
        "/buddies",
        "/goals",
        "/chat",
        "/profile",
        "/safety",
        "/plans",
        "/groups",
        "/events",
        "/table",
        "/host",
        "/admin",
        "/settings",
        "/onboarding",
      ],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
