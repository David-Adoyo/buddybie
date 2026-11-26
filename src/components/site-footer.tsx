"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Logo } from "@/components/logo";
import { LowDataToggle } from "@/components/low-data-toggle";

export function SiteFooter() {
  const t = useTranslations("footer");
  const tn = useTranslations("nav");
  const year = 2026;

  const columns = [
    {
      heading: t("exploreHeading"),
      links: [
        { href: "/how", label: tn("howItWorks") },
        { href: "/circles", label: tn("circles") },
        { href: "/pricing", label: tn("pricing") },
        { href: "/discover", label: t("discover") },
      ],
    },
    {
      heading: t("safetyHeading"),
      links: [
        { href: "/safety-centre", label: tn("safety") },
        { href: "/legal/safety-centre", label: t("safetyCentre") },
        { href: "/legal/community", label: t("community") },
      ],
    },
    {
      heading: t("legalHeading"),
      links: [
        { href: "/legal/privacy", label: t("privacy") },
        { href: "/legal/terms", label: t("terms") },
        { href: "/legal/refunds", label: t("refunds") },
      ],
    },
  ];

  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <Logo />
            <p className="max-w-xs text-sm text-muted-foreground">
              {t("rights", { year })} · {t("madeIn")}
            </p>
          </div>

          {columns.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <h2 className="text-sm font-semibold">{col.heading}</h2>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
          <LowDataToggle />
        </div>
      </div>
    </footer>
  );
}
