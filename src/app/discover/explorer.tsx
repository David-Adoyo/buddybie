"use client";
import { PageHero } from "@/components/page-hero";

import { useState } from "react";
import Link from "next/link";
import { Globe, ArrowRight } from "lucide-react";
import { cities } from "@/data/areas";
import { launchCircles } from "@/data/circles";
import { cn } from "@/lib/utils";

const cityGroups = [
  {
    label: "Africa",
    ids: ["nairobi", "lagos", "accra", "johannesburg", "cape-town", "cairo", "dar-es-salaam"],
  },
  {
    label: "Europe",
    ids: ["london", "paris", "amsterdam", "berlin", "barcelona", "stockholm"],
  },
  { label: "Middle East", ids: ["dubai"] },
  {
    label: "Americas",
    ids: ["new-york", "los-angeles", "toronto", "chicago", "miami"],
  },
  {
    label: "Asia-Pacific",
    ids: ["singapore", "mumbai", "bangkok", "tokyo", "seoul", "kuala-lumpur", "sydney", "melbourne"],
  },
];

export function DiscoverExplorer() {
  const [cityId, setCityId] = useState("");
  const [circleId, setCircleId] = useState("");

  const selectedCity = cities.find((c) => c.id === cityId);
  const selectedCircle = launchCircles.find((c) => c.id === circleId);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:py-24">
      <PageHero
        eyebrow="Discover"
        title={<>Meet people <span className="text-brand-gradient">worth meeting.</span></>}
        subtitle="Whether you're home, travelling, or somewhere brand new — real connections are close."
        photo="travel"
      />

      {/* Q1 — City */}
      <div className="mb-10 space-y-3">
        <label htmlFor="city-select" className="flex items-center gap-2 text-lg font-semibold">
          <Globe className="size-5 shrink-0 text-primary" aria-hidden />
          Any interesting city you are visiting or staying in?
        </label>
        <div className="relative">
          <select
            id="city-select"
            value={cityId}
            onChange={(e) => {
              setCityId(e.target.value);
            }}
            className="w-full appearance-none rounded-xl border bg-background px-4 py-3.5 pr-10 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">— Choose a city —</option>
            {cityGroups.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.ids.map((id) => {
                  const city = cities.find((c) => c.id === id);
                  return city ? (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ) : null;
                })}
              </optgroup>
            ))}
          </select>
          <span
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          >
            ▾
          </span>
        </div>
      </div>

      {/* Q2 — Circle */}
      <div className="mb-10 space-y-3">
        <p className="text-lg font-semibold">What kind of people are you looking for?</p>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {launchCircles.map((circle) => {
            const Icon = circle.icon;
            const active = circleId === circle.id;
            return (
              <button
                key={circle.id}
                type="button"
                onClick={() => setCircleId(active ? "" : circle.id)}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-4 text-left transition-all hover:shadow-sm",
                  active ? "border-2 shadow-sm" : "border hover:border-primary/40",
                )}
                style={
                  active
                    ? { borderColor: circle.accent, backgroundColor: `${circle.accent}12` }
                    : {}
                }
              >
                <span
                  className="flex size-10 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${circle.accent}20`, color: circle.accent }}
                >
                  <Icon className="size-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{circle.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{circle.tagline}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Nudge lines */}
      {cityId && !circleId && (
        <p className="mb-6 text-sm text-muted-foreground">
          Pick a Circle above to explore {selectedCity?.name}.
        </p>
      )}
      {!cityId && circleId && (
        <p className="mb-6 text-sm text-muted-foreground">
          Choose a city to see {selectedCircle?.name} there.
        </p>
      )}

      {/* Result card */}
      {cityId && circleId && selectedCity && selectedCircle && (
        <div
          className="rounded-2xl border-2 p-6 transition-all"
          style={{
            borderColor: selectedCircle.accent,
            backgroundColor: `${selectedCircle.accent}0a`,
          }}
        >
          <p className="text-xl font-bold">
            {selectedCircle.name} in {selectedCity.name}
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {selectedCircle.description}
          </p>
          <Link
            href={`/discover/${cityId}/${circleId}`}
            className="mt-5 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: selectedCircle.accent }}
          >
            Meet people here <ArrowRight className="size-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
