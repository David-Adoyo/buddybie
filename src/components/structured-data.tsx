import { env } from "@/lib/env";
import { launchCircles } from "@/data/circles";

/**
 * Organisation + WebSite JSON-LD for the landing page. Helps Google render rich
 * results (sitelinks search box, brand knowledge panel). Rendered server-side.
 */
export function LandingStructuredData() {
  const base = env.siteUrl.replace(/\/$/, "");

  const graph = [
    {
      "@type": "Organization",
      "@id": `${base}/#organisation`,
      name: "Be a Buddy",
      url: base,
      logo: `${base}/icons/icon-512.png`,
      description:
        "A warm, verified community where you meet real people who share your values — for faith, friendship, growth, love and every goal in between. Available worldwide.",
      areaServed: { "@type": "Place", name: "Worldwide" },
      sameAs: [] as string[],
    },
    {
      "@type": "WebSite",
      "@id": `${base}/#website`,
      url: base,
      name: "Be a Buddy",
      publisher: { "@id": `${base}/#organisation` },
      inLanguage: ["en"],
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${base}/discover?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "ItemList",
      "@id": `${base}/#circles`,
      name: "Be a Buddy Circles",
      itemListElement: launchCircles.map((circle, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: circle.name,
        description: circle.tagline,
      })),
    },
  ];

  const json = { "@context": "https://schema.org", "@graph": graph };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
