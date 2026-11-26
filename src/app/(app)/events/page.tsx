"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { CalendarDays, ChevronRight, MapPin } from "lucide-react";
import { useActiveCircle } from "@/lib/active-circle";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MeetupDisclaimer } from "@/components/safety/meetup-disclaimer";
import { eventsForCircle, type SeedEvent } from "@/data/community-seed";
import { getRsvp, goingCount, spotsLeft } from "@/lib/data/community";

export default function EventsPage() {
  const t = useTranslations("events");
  const { activeCircle } = useActiveCircle();
  const [events, setEvents] = useState<SeedEvent[]>([]);

  useEffect(() => {
    if (activeCircle) setEvents(eventsForCircle(activeCircle.id));
  }, [activeCircle]);

  if (!activeCircle) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <CalendarDays className="size-6 text-primary" aria-hidden />
          {t("title")}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {t("subtitleIn", { circle: activeCircle.name })}
        </p>
      </div>

      <MeetupDisclaimer />

      {events.length === 0 ? (
        <p className="py-10 text-center text-muted-foreground">{t("empty")}</p>
      ) : (
        <div className="space-y-3">
          {events.map((e) => {
            const rsvp = getRsvp(e.id);
            const left = spotsLeft(e);
            return (
              <Link key={e.id} href={`/events/${e.id}`}>
                <Card className="flex items-center gap-3 p-4 transition-colors hover:bg-secondary">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{e.title}</span>
                      {e.womenOnly && <Badge variant="outline">{t("womenOnly")}</Badge>}
                      {e.verifiedOnly && <Badge variant="accent">{t("verifiedOnly")}</Badge>}
                      {rsvp === "going" && <Badge variant="success">{t("going")}</Badge>}
                      {rsvp === "waitlist" && <Badge variant="secondary">{t("waitlisted")}</Badge>}
                    </div>
                    <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="size-3.5" aria-hidden />
                      {e.venue} · {e.area} · {e.when}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {left > 0 ? t("spotsLeft", { count: left }) : t("full")} ·{" "}
                      {t("goingCount", { count: goingCount(e) })}
                    </p>
                  </div>
                  <ChevronRight className="size-5 text-muted-foreground" aria-hidden />
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
