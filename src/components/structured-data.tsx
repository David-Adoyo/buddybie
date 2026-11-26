import { env } from "@/lib/env";
import { launchCircles } from "@/data/circles";
import { landingFaq } from "@/data/faq";

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
      name: "Buddybie",
      url: base,
      logo: `${base}/icons/icon-512.png`,
      slogan: "Meet People Worth Meeting",
      description:
        "A warm, verified community where you meet real people who share your values — for faith, friendship, growth, love and every goal in between. Available worldwide.",
      areaServed: { "@type": "Place", name: "Worldwide" },
      sameAs: [] as string[],
    },
    {
      "@type": "WebSite",
      "@id": `${base}/#website`,
      url: base,
      name: "Buddybie",
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
      name: "Buddybie Circles",
      itemListElement: launchCircles.map((circle, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: circle.name,
        description: circle.tagline,
      })),
    },
    {
      "@type": "WebApplication",
      "@id": `${base}/#app`,
      name: "Buddybie",
      url: base,
      applicationCategory: "SocialNetworkingApplication",
      operatingSystem: "Web, iOS, Android",
      description:
        "Verified friendship app to make friends, find accountability and travel buddies, and meet people near you.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      publisher: { "@id": `${base}/#organisation` },
    },
    {
      "@type": "FAQPage",
      "@id": `${base}/#faq`,
      mainEntity: landingFaq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
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
