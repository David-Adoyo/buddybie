import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BellRing,
  HeartHandshake,
  MapPinned,
  ShieldCheck,
  Sparkles,
  Target,
  Timer,
  Wallet,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WaitlistForm } from "@/components/landing/waitlist-form";
import { LandingStructuredData } from "@/components/structured-data";
import { LogoMark } from "@/components/logo";
import { launchCircles } from "@/data/circles";
import { landingFaq } from "@/data/faq";
import { PHOTOS } from "@/data/photos";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const pill = "rounded-full h-12 px-7 text-base";
const darkPill = cn(buttonVariants({ size: "lg" }), pill, "bg-ink text-background hover:bg-ink/85");

/** Section eyebrow (uppercase label above headings, as on mastercard.com). */
function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("text-xs font-semibold uppercase tracking-[0.18em] text-primary", className)}>
      {children}
    </p>
  );
}

/** Media tile: area photo blended into the logo palette, plus a soft circle. */
function MediaArt({
  from,
  to,
  icon: Icon,
  photo,
  sizes,
}: {
  from: string;
  to: string;
  icon: React.ElementType;
  photo?: { src: string; alt: string };
  sizes: string;
}) {
  return (
    // Brand gradient only shows when the photo is hidden (low-data mode).
    <div className="absolute inset-0 overflow-hidden" style={{ background: `linear-gradient(140deg, ${from}, ${to})` }}>
      {photo && (
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes={sizes}
          data-decorative="true"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
      )}
      {/* Neutral black fade for legible captions — keeps the photos' own colour. */}
      <span
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(14,12,11,0.55)_72%,rgba(14,12,11,0.88)_100%)]"
      />
      <Icon aria-hidden className="absolute right-5 top-5 size-9 rounded-full bg-white/90 p-2 text-ink" />
    </div>
  );
}

const PALETTE = [
  ["#ef5a45", "#d83a33"],
  ["#ffa05e", "#f57a45"],
  ["#ff7aab", "#f04c8c"],
  ["#f57c47", "#ff5594"],
  ["#db4338", "#ff8161"],
  ["#ff8161", "#ff5594"],
] as const;

export default async function LandingPage() {
  const t = await getTranslations("landing");

  const solutions = [
    { eyebrow: "Getting started", title: t("howTitle"), href: "/how", icon: BadgeCheck, tall: true, photo: "students" },
    { eyebrow: "Community", title: t("circlesTitle"), href: "/circles", icon: HeartHandshake, photo: "friends" },
    { eyebrow: "Near you", title: "Discover buddies in your city", href: "/discover", icon: MapPinned, tall: true, photo: "travel" },
    { eyebrow: "Trust", title: t("featureSafetyTitle"), href: "/safety-centre", icon: ShieldCheck, photo: "safety" },
    { eyebrow: "Growth", title: t("featureGoalsTitle"), href: "/how", icon: Target, photo: "goals" },
    { eyebrow: "Plans", title: t("pricingTitle"), href: "/pricing", icon: Wallet, photo: "buddy-table", wide: true },
  ];

  return (
    <>
      <LandingStructuredData />
      <SiteHeader />
      <main id="main-content" className="flex-1">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="mx-auto max-w-7xl px-4 pt-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-cream">
            <div aria-hidden data-decorative="true" className="orbit-lines pointer-events-none absolute inset-0" />
            <div className="relative grid md:grid-cols-[1.05fr_1fr]">
            <div className="relative max-w-2xl px-6 py-14 sm:px-12 md:py-24">
              <Eyebrow>{t("eyebrow")}</Eyebrow>
              <h1 className="mt-5 font-display text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
                Make friends. <span className="text-brand-gradient">Meet people worth meeting.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg text-muted-foreground">{t("heroSubtitle")}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/signin" className={darkPill}>
                  {t("heroCtaPrimary")}
                  <ArrowRight />
                </Link>
                <Link
                  href="/circles"
                  className={cn(buttonVariants({ variant: "outline", size: "lg" }), pill, "bg-background/70")}
                >
                  {t("heroCtaSecondary")}
                </Link>
              </div>
              <p className="mt-6 text-sm text-muted-foreground">{t("trustLine")}</p>
            </div>
            {/* Hero photo framed by the three logo circles */}
            <div className="relative min-h-80 px-6 pb-8 md:px-0 md:py-10 md:pr-10">
              <span aria-hidden className="absolute -left-2 top-6 z-10 size-16 rounded-full bg-[linear-gradient(135deg,#ef5a45,#d83a33)] shadow-lg md:-left-6" />
              <span aria-hidden className="absolute right-2 top-2 z-10 size-12 rounded-full bg-[linear-gradient(135deg,#ffa05e,#f57a45)] shadow-lg md:right-4" />
              <span aria-hidden className="absolute bottom-2 left-1/3 z-10 size-14 rounded-full bg-[linear-gradient(135deg,#ff7aab,#f04c8c)] shadow-lg" />
              <div className="relative h-full min-h-80 overflow-hidden rounded-[2rem] md:rounded-l-[12rem]">
                <Image
                  src={PHOTOS.hero.src}
                  alt={PHOTOS.hero.alt}
                  fill
                  fetchPriority="high"
                  loading="eager"
                  sizes="(min-width: 768px) 48vw, 100vw"
                  className="object-cover"
                />
              </div>
            </div>
            </div>
          </div>

          {/* Story carousel — Circles */}
          <div className="snap-row -mx-4 mt-6 flex gap-4 overflow-x-auto px-4 pb-2 lg:mx-0 lg:px-0">
            {launchCircles.map((circle, i) => {
              const [from, to] = PALETTE[i % PALETTE.length];
              return (
                <Link
                  key={circle.id}
                  href={`/discover/new-york/${circle.id}`}
                  className="group relative flex h-72 w-60 shrink-0 flex-col justify-end overflow-hidden rounded-[2rem] p-5 text-white"
                >
                  <MediaArt from={from} to={to} icon={circle.icon} photo={PHOTOS[circle.id]} sizes="240px" />
                  <div className="relative">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/80">Circle</p>
                    <h2 className="mt-1 font-display text-xl font-semibold leading-tight">{circle.name}</h2>
                    <p className="mt-1 text-sm text-white/85">{circle.tagline}</p>
                  </div>
                  <span className="absolute bottom-5 right-5 flex size-9 items-center justify-center rounded-full bg-white/95 text-ink transition-transform group-hover:-rotate-45">
                    <ArrowRight className="size-4" aria-hidden />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── Solutions grid ───────────────────────────────────── */}
        <section className="bg-[#141413] text-[#f6f1ec]">
          <div className="mx-auto max-w-7xl px-4 py-20 lg:px-8 lg:py-28">
          <div className="max-w-2xl">
            <Eyebrow className="text-brand-orange">Friends, faith, work, fun &amp; love</Eyebrow>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              Together, the possibilities are endless
            </h2>
            <p className="mt-4 text-lg text-[#f6f1ec]/70">
              Everything you need to make friends as an adult and keep them — in one verified community.
            </p>
          </div>
          <div className="mt-12 grid auto-rows-[220px] gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {solutions.map((s, i) => {
              const [from, to] = PALETTE[i % PALETTE.length];
              return (
                <Link
                  key={s.title}
                  href={s.href}
                  className={cn(
                    "group relative flex flex-col justify-end overflow-hidden rounded-[2rem] p-6 text-white",
                    "tall" in s && s.tall && "sm:row-span-2",
                    "wide" in s && s.wide && "sm:col-span-2",
                  )}
                >
                  <MediaArt from={from} to={to} icon={s.icon} photo={PHOTOS[s.photo]} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
                  <div className="relative flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/80">{s.eyebrow}</p>
                      <h3 className="mt-1 font-display text-2xl font-semibold leading-tight">{s.title}</h3>
                    </div>
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/95 text-ink transition-transform group-hover:rotate-45">
                      <ArrowUpRight className="size-4" aria-hidden />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
          </div>
        </section>

        {/* ── Benefits split ───────────────────────────────────── */}
        <section className="bg-cream">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 lg:grid-cols-2 lg:px-8 lg:py-28">
            <div className="flex flex-col justify-center">
              <Eyebrow>{t("featuresTitle")}</Eyebrow>
              <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
                Friendships with a reason to last
              </h2>
              <p className="mt-4 max-w-lg text-lg text-muted-foreground">{t("featuresSubtitle")}</p>
              <Link href="/how" className={cn(darkPill, "mt-8 w-fit")}>
                Learn more
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: Target, title: t("featureGoalsTitle"), desc: t("featureGoalsDesc") },
                { icon: Sparkles, title: t("featureMatcherTitle"), desc: t("featureMatcherDesc") },
                { icon: Wallet, title: t("featureMpesaTitle"), desc: t("featureMpesaDesc") },
                { icon: BadgeCheck, title: t("howStep1Title"), desc: t("howStep1Desc") },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="rounded-[2rem] bg-background p-6 shadow-sm">
                  <span className="flex size-12 items-center justify-center rounded-full bg-ink text-brand-orange">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <h3 className="mt-5 font-display text-xl font-semibold">{title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Dark experiences band (safety) ───────────────────── */}
        <section className="mx-auto max-w-7xl px-4 py-20 lg:px-8 lg:py-28">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-[#1c1714] px-6 py-16 text-[#f6f1ec] sm:px-12 lg:py-24">
            <div aria-hidden data-decorative="true" className="orbit-lines pointer-events-none absolute inset-0 opacity-70" />
            <div className="relative grid gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <Eyebrow className="text-brand-orange">Safety is the product</Eyebrow>
                <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
                  Meet in real life, with confidence
                </h2>
                <p className="mt-4 max-w-lg text-lg text-[#f6f1ec]/75">{t("featureSafetyDesc")}</p>
                <Link
                  href="/safety-centre"
                  className={cn(buttonVariants({ size: "lg" }), pill, "mt-8 bg-[#f6f1ec] text-[#1c1714] hover:bg-white")}
                >
                  Visit the Safety centre
                </Link>
              </div>
              <div className="space-y-6">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem]">
                <Image src={PHOTOS.safety.src} alt={PHOTOS.safety.alt} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
                <span aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,#1c1714)]" />
              </div>
              <ul className="grid gap-4 sm:grid-cols-2">
                {[
                  { icon: BadgeCheck, label: "Verified members" },
                  { icon: MapPinned, label: "Share-my-plan" },
                  { icon: Timer, label: "Check-in timer" },
                  { icon: BellRing, label: "In-app SOS" },
                ].map(({ icon: Icon, label }) => (
                  <li key={label} className="flex items-center gap-3 rounded-full border border-white/15 px-5 py-4">
                    <Icon className="size-5 text-brand-orange" aria-hidden />
                    <span className="font-medium">{label}</span>
                  </li>
                ))}
              </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ (SEO) ────────────────────────────────────────── */}
        <section id="faq" className="mx-auto max-w-4xl px-4 pb-20 lg:pb-28">
          <div className="text-center">
            <Eyebrow>FAQ</Eyebrow>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight">
              Questions about making friends with Buddybie
            </h2>
          </div>
          <div className="mt-10 divide-y rounded-[2rem] border bg-card">
            {landingFaq.map((f) => (
              <details key={f.q} className="group px-6 py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-semibold">
                  <h3>{f.q}</h3>
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full border transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ── Waitlist ─────────────────────────────────────────── */}
        <section id="waitlist" className="mx-auto max-w-7xl px-4 pb-20 lg:px-8">
          <div className="grid items-center gap-10 rounded-[2.5rem] bg-cream p-6 sm:p-12 md:grid-cols-2">
            <div className="space-y-4">
              <div className="relative mb-6 aspect-[16/10] overflow-hidden rounded-[2rem]">
                <Image src={PHOTOS.welcome.src} alt={PHOTOS.welcome.alt} fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
                <span className="absolute bottom-4 left-4 rounded-full bg-background/90 p-2 shadow">
                  <LogoMark className="size-8" />
                </span>
              </div>
              <h2 className="font-display text-4xl font-semibold tracking-tight">{t("waitlistTitle")}</h2>
              <p className="text-lg text-muted-foreground">{t("waitlistSubtitle")}</p>
            </div>
            <WaitlistForm />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
