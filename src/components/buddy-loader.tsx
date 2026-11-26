"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Brand loader built from the logo's three circles (red, orange, pink).
 *
 * One loop (2.6s):
 *   1. Orbit — each circle travels a full clockwise turn around the centre on
 *      its own timing (staggered), starting from its place in the logo.
 *   2. Bounce — each circle drops onto an invisible baseline and bounces
 *      twice, one after another, then rises back into the logo triangle.
 *
 * Driven by the Web Animations API so every circle gets its own computed
 * keyframes. Falls back to a gentle pulse when reduced motion is requested.
 */

const CIRCLES = [
  { key: "red", from: "#ef5a45", to: "#d83a33", start: 210, lineX: -1 },
  { key: "orange", from: "#ffa05e", to: "#f57a45", start: 330, lineX: 0 },
  { key: "pink", from: "#ff7aab", to: "#f04c8c", start: 90, lineX: 1 },
] as const;

const DURATION = 2600;

function keyframesFor(i: number, unit: number): Keyframe[] {
  const c = CIRCLES[i];
  const R = unit * 0.62; // orbit radius
  const gap = unit * 1.05; // spacing on the baseline
  const lineY = unit * 0.55; // invisible line (below centre)
  const hop = unit * 1.05; // bounce height
  const stagger = i * 0.035; // circles move separately
  const pos = (deg: number) => {
    const r = (deg * Math.PI) / 180;
    return [Math.cos(r) * R, Math.sin(r) * R] as const;
  };
  const t = (x: number, y: number, sx = 1, sy = 1) =>
    `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) scale(${sx}, ${sy})`;

  const frames: Keyframe[] = [];
  // 1) Clockwise orbit (screen coordinates: increasing angle = clockwise).
  const orbitStart = stagger;
  const orbitEnd = 0.42 + stagger;
  const steps = 16;
  frames.push({ offset: 0, transform: t(...pos(c.start)) });
  for (let s = 0; s <= steps; s++) {
    const [x, y] = pos(c.start + (360 * s) / steps);
    frames.push({
      offset: orbitStart + ((orbitEnd - orbitStart) * s) / steps,
      transform: t(x, y),
      easing: "linear",
    });
  }
  // 2) Drop onto the invisible line, then bounce separately.
  const lx = c.lineX * gap;
  const b = 0.5 + i * 0.06; // each circle lands a beat after the previous one
  frames.push(
    { offset: b, transform: t(lx, lineY, 1.12, 0.84), easing: "cubic-bezier(.2,.7,.3,1)" },
    { offset: b + 0.07, transform: t(lx, lineY - hop, 0.94, 1.08), easing: "cubic-bezier(.6,0,.9,.4)" },
    { offset: b + 0.14, transform: t(lx, lineY, 1.14, 0.82), easing: "cubic-bezier(.2,.7,.3,1)" },
    { offset: b + 0.19, transform: t(lx, lineY - hop * 0.45, 0.97, 1.04), easing: "cubic-bezier(.6,0,.9,.4)" },
    { offset: b + 0.23, transform: t(lx, lineY, 1.06, 0.92), easing: "ease-out" },
  );
  // 3) Rise back into the logo triangle for the next loop.
  frames.push({ offset: 1, transform: t(...pos(c.start)), easing: "ease-in-out" });
  return frames;
}

export function BuddyLoader({
  size = 72,
  className,
  label = "Loading",
}: {
  size?: number;
  className?: string;
  label?: string;
}) {
  const refs = useRef<(HTMLSpanElement | null)[]>([]);
  const unit = size / 2.6;
  const dot = unit * 0.9;

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const anims = refs.current.map((el, i) => {
      if (!el || typeof el.animate !== "function") return null;
      if (reduce) {
        return el.animate(
          [{ opacity: 1 }, { opacity: 0.45 }, { opacity: 1 }],
          { duration: 1400, delay: i * 180, iterations: Infinity },
        );
      }
      return el.animate(keyframesFor(i, unit), {
        duration: DURATION,
        iterations: Infinity,
      });
    });
    return () => anims.forEach((a) => a?.cancel());
  }, [unit]);

  return (
    <span
      role="status"
      aria-label={label}
      className={cn("relative inline-block shrink-0", className)}
      style={{ width: size, height: size }}
    >
      {CIRCLES.map((c, i) => {
        const r = (c.start * Math.PI) / 180;
        return (
          <span
            key={c.key}
            ref={(el) => {
              refs.current[i] = el;
            }}
            aria-hidden
            className="absolute rounded-full shadow-sm will-change-transform"
            style={{
              width: dot,
              height: dot,
              left: size / 2 - dot / 2,
              top: size / 2 - dot / 2,
              background: `linear-gradient(135deg, ${c.from}, ${c.to})`,
              // Static logo position before JS runs (and for SSR).
              transform: `translate(${Math.cos(r) * unit * 0.62}px, ${Math.sin(r) * unit * 0.62}px)`,
            }}
          />
        );
      })}
      <span className="sr-only">{label}…</span>
    </span>
  );
}
