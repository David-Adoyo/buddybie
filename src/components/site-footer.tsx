"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { HelpCircle, ShieldAlert, MapPin, MessageCircleQuestion } from "lucide-react";
import { Logo } from "@/components/logo";
import { LowDataToggle } from "@/components/low-data-toggle";

/** Footer modelled on mastercard.com: a "Need help?" strip, four uppercase
 *  link columns, then a slim legal row. */
export function SiteFooter() {
  const t = useTranslations("footer");
  const tn = useTranslations("nav");
  const year = 2026;

  const help = [
    { href: "/safety-centre", label: "Get support", icon: HelpCircle },
    { href: "/safety-centre", label: "Report a member", icon: ShieldAlert },
    { href: "/discover", label: "Find buddies near me", icon: MapPin },
    { href: "/#faq", label: "FAQs", icon: MessageCircleQuestion },
  ];

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
      heading: "Make friends",
      links: [
        { href: "/discover/new-york/friends", label: "Make friends in New York" },
        { href: "/discover/los-angeles/friends", label: "Make friends in Los Angeles" },
        { href: "/discover/chicago/friends", label: "Make friends in Chicago" },
        { href: "/discover/miami/travel", label: "Travel buddies in Miami" },
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
    // `dark` scopes the dark-theme tokens to the footer: a black closing band.
    <footer className="dark mt-auto bg-[#141413] text-foreground">
      <div className="mx-auto max-w-7xl px-4 pt-14 lg:px-8">
        <div className="flex flex-col gap-6 rounded-[2rem] bg-cream p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">We&apos;re always here when you need us</p>
            <h2 className="font-display text-2xl font-semibold">Need help?</h2>
          </div>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {help.map(({ href, label, icon: Icon }) => (
              <li key={label}>
                <Link
                  href={href}
                  className="flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
                >
                  <Icon className="size-4 shrink-0" aria-hidden />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div className="space-y-4">
            <Logo />
            <p className="max-w-xs text-sm text-muted-foreground">
              The verified friendship app for making friends, finding buddies and meeting people worth meeting.
            </p>
          </div>
          {columns.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em]">{col.heading}</h2>
              <ul className="mt-4 space-y-3">
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

        <div className="flex flex-col gap-4 border-t py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            {t("rights", { year })} · {t("madeIn")}
          </p>
          <div className="flex items-center gap-6">
            <Link href="/legal/privacy" className="hover:text-foreground">{t("privacy")}</Link>
            <Link href="/legal/terms" className="hover:text-foreground">{t("terms")}</Link>
            <LowDataToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
