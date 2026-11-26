"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChevronDown, ChevronRight, Menu, Search, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { launchCircles } from "@/data/circles";
import { cities } from "@/data/areas";
import { cn } from "@/lib/utils";

type MenuGroup = { heading: string; links: { href: string; label: string }[] };
type MenuItem = { id: string; label: string; intro: string; groups: MenuGroup[] };

/**
 * Mega-menu header modelled on mastercard.com: a slim bar with the brand
 * symbol, audience-led top-level menus that open full-width panels, a search
 * shortcut and a pill call-to-action.
 */
export function SiteHeader() {
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  const menus: MenuItem[] = [
    {
      id: "you",
      label: "For you",
      intro: "Make friends, find your people and keep your goals on track.",
      groups: [
        {
          heading: "Get started",
          links: [
            { href: "/how", label: t("howItWorks") },
            { href: "/signin", label: "Create your free profile" },
            { href: "/pricing", label: t("pricing") },
          ],
        },
        {
          heading: "Find your Circle",
          links: launchCircles.slice(0, 5).map((c) => ({ href: "/circles", label: c.name })),
        },
        {
          heading: "More Circles",
          links: [
            ...launchCircles.slice(5).map((c) => ({ href: "/circles", label: c.name })),
            { href: "/circles", label: "Explore all Circles" },
          ],
        },
      ],
    },
    {
      id: "discover",
      label: t("discover"),
      intro: "Meet new people near you — groups, events and buddies city by city.",
      groups: [
        {
          heading: "Popular cities",
          links: cities.slice(0, 6).map((c) => ({
            href: `/discover/${c.id}/friends`,
            label: `Make friends in ${c.name}`,
          })),
        },
        {
          heading: "Travel buddies",
          links: cities.slice(6, 12).map((c) => ({
            href: `/discover/${c.id}/travel`,
            label: `Meet people in ${c.name}`,
          })),
        },
        {
          heading: "Explore",
          links: [{ href: "/discover", label: "All cities & Circles" }],
        },
      ],
    },
    {
      id: "safety",
      label: t("safety"),
      intro: "Verified members and built-in safety tools — because trust is the product.",
      groups: [
        {
          heading: "Protecting you",
          links: [
            { href: "/safety-centre", label: "Safety centre" },
            { href: "/legal/safety-centre", label: "Safe meetup guide" },
            { href: "/legal/community", label: "Community guidelines" },
          ],
        },
        {
          heading: "Your data",
          links: [
            { href: "/legal/privacy", label: "Privacy" },
            { href: "/legal/terms", label: "Terms" },
            { href: "/legal/refunds", label: "Refunds" },
          ],
        },
      ],
    },
  ];

  // Close panels on route change, outside click and Escape.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpenMenu(null);
    setMobileOpen(false);
  }
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenMenu(null);
    const onDown = (e: MouseEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) setOpenMenu(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, []);

  const active = menus.find((m) => m.id === openMenu);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75"
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:ring-2 focus:ring-primary"
      >
        Skip to main content
      </a>
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-4 lg:px-8">
        <Link href="/" aria-label="Buddybie home" className="shrink-0">
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {menus.map((m) => (
            <button
              key={m.id}
              type="button"
              aria-expanded={openMenu === m.id}
              aria-controls="mega-panel"
              onClick={() => setOpenMenu((v) => (v === m.id ? null : m.id))}
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-4 py-2 text-[15px] font-medium transition-colors hover:bg-secondary",
                openMenu === m.id && "bg-secondary",
              )}
            >
              {m.label}
              <ChevronDown
                className={cn("size-4 transition-transform", openMenu === m.id && "rotate-180")}
                aria-hidden
              />
            </button>
          ))}
          <Link
            href="/pricing"
            className="rounded-full px-4 py-2 text-[15px] font-medium transition-colors hover:bg-secondary"
          >
            {t("pricing")}
          </Link>
        </nav>

        <div className="flex items-center gap-1">
          <Link
            href="/discover"
            aria-label="Search cities and Circles"
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "rounded-full")}
          >
            <Search />
          </Link>
          <ThemeToggle />
          <Link
            href="/signin"
            className={cn(
              buttonVariants({ size: "sm" }),
              "ml-1 hidden h-10 rounded-full bg-ink px-5 text-background hover:bg-ink/85 sm:inline-flex",
            )}
          >
            {tc("signIn")}
          </Link>
          <button
            type="button"
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "rounded-full lg:hidden")}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Desktop mega-panel */}
      {active && (
        <div id="mega-panel" className="absolute inset-x-0 top-full hidden border-b bg-background shadow-xl lg:block">
          <div className="mx-auto grid max-w-7xl grid-cols-[1fr_3fr] gap-10 px-8 py-10">
            <div>
              <p className="font-display text-3xl font-semibold tracking-tight">{active.label}</p>
              <p className="mt-3 max-w-xs text-muted-foreground">{active.intro}</p>
            </div>
            <div className="grid grid-cols-3 gap-8">
              {active.groups.map((g) => (
                <div key={g.heading}>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {g.heading}
                  </p>
                  <ul className="mt-4 space-y-3">
                    {g.links.map((l) => (
                      <li key={l.label}>
                        <Link href={l.href} className="text-[15px] font-medium hover:text-primary">
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="max-h-[calc(100dvh-72px)] overflow-y-auto border-t lg:hidden">
          <nav aria-label="Mobile" className="mx-auto flex max-w-7xl flex-col px-4 py-3">
            {menus.map((m) => (
              <details key={m.id} className="group border-b py-1">
                <summary className="flex cursor-pointer list-none items-center justify-between py-3 text-base font-semibold">
                  {m.label}
                  <ChevronRight className="size-4 transition-transform group-open:rotate-90" aria-hidden />
                </summary>
                {m.groups.map((g) => (
                  <div key={g.heading} className="pb-3">
                    <p className="pb-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      {g.heading}
                    </p>
                    {g.links.map((l) => (
                      <Link key={l.label} href={l.href} className="block py-1.5 text-sm text-foreground/90">
                        {l.label}
                      </Link>
                    ))}
                  </div>
                ))}
              </details>
            ))}
            <Link href="/pricing" className="border-b py-4 text-base font-semibold">
              {t("pricing")}
            </Link>
            <Link
              href="/signin"
              className={cn(buttonVariants({ size: "lg" }), "mt-4 rounded-full bg-ink text-background hover:bg-ink/85")}
            >
              {tc("signIn")}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
