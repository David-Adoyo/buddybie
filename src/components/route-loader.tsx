"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { BuddyLoader } from "@/components/buddy-loader";

/** Minimum time the loader stays up so the orbit → bounce loop reads. */
const MIN_VISIBLE_MS = 650;

function RouteLoaderInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Visible on first paint (initial page load); hidden once hydrated.
  const [visible, setVisible] = useState(true);
  const shownAt = useRef(0);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = () => {
    const wait = Math.max(0, MIN_VISIBLE_MS - (Date.now() - shownAt.current));
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setVisible(false), wait);
  };

  // Initial load: keep the loader until the window has finished loading.
  useEffect(() => {
    shownAt.current = Date.now();
    if (document.readyState === "complete") hide();
    else window.addEventListener("load", hide, { once: true });
    return () => window.removeEventListener("load", hide);
  }, []);

  // Any internal link click starts the loader…
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || !a.href || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      // Same page (hash jumps, identical URL) — nothing is loading.
      if (url.pathname === location.pathname && url.search === location.search) return;
      if (hideTimer.current) clearTimeout(hideTimer.current);
      shownAt.current = Date.now();
      setVisible(true);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  // …and the new route committing ends it.
  useEffect(() => {
    hide();
  }, [pathname, searchParams]);

  return (
    <div
      data-route-loader
      aria-hidden={!visible}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-background/85 backdrop-blur-sm transition-opacity duration-300"
      style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? "auto" : "none" }}
    >
      {visible && <BuddyLoader size={96} />}
    </div>
  );
}

/** Full-screen brand loader on first load and on every internal link click. */
export function RouteLoader() {
  return (
    <Suspense fallback={null}>
      <RouteLoaderInner />
    </Suspense>
  );
}
