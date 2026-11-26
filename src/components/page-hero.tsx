import Image from "next/image";
import type { ReactNode } from "react";
import { PHOTOS } from "@/data/photos";

/**
 * Inner-page hero in the landing style: cream panel, eyebrow + display
 * heading on the left, the area's people photo framed by the logo circles.
 */
export function PageHero({
  eyebrow,
  title,
  subtitle,
  photo,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle?: ReactNode;
  photo: keyof typeof PHOTOS;
  children?: ReactNode;
}) {
  const img = PHOTOS[photo];
  return (
    <section className="mb-14 grid overflow-hidden rounded-[2.5rem] bg-cream md:grid-cols-[1.1fr_1fr]">
      <div className="flex flex-col justify-center px-6 py-12 sm:px-10 md:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
        {subtitle && <p className="mt-4 max-w-prose text-lg text-muted-foreground">{subtitle}</p>}
        {children}
      </div>
      <div className="relative min-h-64 p-4 md:p-6">
        <span aria-hidden className="absolute left-0 top-8 z-10 size-12 rounded-full bg-[linear-gradient(135deg,#ef5a45,#d83a33)] shadow-lg" />
        <span aria-hidden className="absolute right-3 top-3 z-10 size-9 rounded-full bg-[linear-gradient(135deg,#ffa05e,#f57a45)] shadow-lg" />
        <span aria-hidden className="absolute bottom-3 left-1/3 z-10 size-10 rounded-full bg-[linear-gradient(135deg,#ff7aab,#f04c8c)] shadow-lg" />
        <div className="relative h-full min-h-64 overflow-hidden rounded-[2rem] md:rounded-l-[10rem]">
          <Image
            src={img.src}
            alt={img.alt}
            fill
            fetchPriority="high"
            loading="eager"
            sizes="(min-width: 768px) 45vw, 100vw"
            className="object-cover"
            data-decorative="true"
          />
        </div>
      </div>
    </section>
  );
}
