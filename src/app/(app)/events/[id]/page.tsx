"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, Check, MapPin, QrCode, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MeetupDisclaimer } from "@/components/safety/meetup-disclaimer";
import { cn } from "@/lib/utils";
import { eventById } from "@/data/community-seed";
import {
  checkIn,
  getRating,
  getRsvp,
  goingCount,
  isCheckedIn,
  rateEvent,
  spotsLeft,
  toggleRsvp,
  type RsvpStatus,
} from "@/lib/data/community";

export default function EventDetailPage() {
  const t = useTranslations("events");
  const params = useParams<{ id: string }>();
  const event = eventById(String(params?.id ?? ""));

  const [rsvp, setRsvp] = useState<RsvpStatus>("none");
  const [checked, setChecked] = useState(false);
  const [stars, setStars] = useState(0);
  const [noShow, setNoShow] = useState(false);
  const [rated, setRated] = useState(false);

  useEffect(() => {
    if (!event) return;
    setRsvp(getRsvp(event.id));
    setChecked(isCheckedIn(event.id));
    const r = getRating(event.id);
    if (r) {
      setStars(r.stars);
      setNoShow(r.noShow);
      setRated(true);
    }
  }, [event]);

  if (!event) {
    return <p className="py-10 text-center text-muted-foreground">{t("notFound")}</p>;
  }

  return (
    <div className="space-y-6">
      <Link href="/events" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden />
        {t("back")}
      </Link>

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">{event.title}</h1>
          {event.womenOnly && <Badge variant="outline">{t("womenOnly")}</Badge>}
          {event.verifiedOnly && <Badge variant="accent">{t("verifiedOnly")}</Badge>}
        </div>
        <p className="mt-1 flex items-center gap-1 text-muted-foreground">
          <MapPin className="size-4" aria-hidden />
          {event.venue} · {event.area} · {event.when}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {spotsLeft(event) > 0 ? t("spotsLeft", { count: spotsLeft(event) }) : t("full")} ·{" "}
          {t("goingCount", { count: goingCount(event) })}
        </p>
      </div>

      <MeetupDisclaimer />

      {/* RSVP */}
      <Card>
        <CardContent className="flex items-center justify-between gap-3 p-5">
          <div>
            <p className="font-medium">{t("rsvpTitle")}</p>
            <p className="text-sm text-muted-foreground">
              {rsvp === "going"
                ? t("rsvpGoing")
                : rsvp === "waitlist"
                  ? t("rsvpWaitlist")
                  : t("rsvpNone")}
            </p>
          </div>
          <Button
            variant={rsvp === "none" ? "default" : "outline"}
            onClick={() => setRsvp(toggleRsvp(event))}
          >
            {rsvp === "none" ? t("rsvp") : t("cancelRsvp")}
          </Button>
        </CardContent>
      </Card>

      {/* QR check-in (demo) */}
      {rsvp === "going" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <QrCode className="size-4 text-primary" aria-hidden />
              {t("checkInTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3">
            <div className="grid size-28 grid-cols-5 gap-0.5 rounded-lg border p-2" aria-hidden>
              {Array.from({ length: 25 }).map((_, i) => (
                <span
                  key={i}
                  className={cn("rounded-[1px]", (i * 7 + event.id.length) % 3 ? "bg-foreground" : "bg-transparent")}
                />
              ))}
            </div>
            <p className="font-mono text-sm">{event.id.slice(0, 6).toUpperCase()}</p>
            {checked ? (
              <Badge variant="success">
                <Check className="size-3" aria-hidden />
                {t("checkedIn")}
              </Badge>
            ) : (
              <Button
                variant="outline"
                onClick={() => {
                  checkIn(event.id);
                  setChecked(true);
                }}
              >
                {t("checkInButton")}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Post-meetup rating */}
      {checked && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("rateTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-label={`${n}`}
                  onClick={() => {
                    setStars(n);
                    setRated(false);
                  }}
                >
                  <Star
                    className={cn(
                      "size-7",
                      n <= stars ? "fill-accent text-accent" : "text-muted-foreground",
                    )}
                  />
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={noShow}
                onChange={(e) => setNoShow(e.target.checked)}
                className="size-4"
              />
              {t("reportNoShow")}
            </label>
            <Button
              disabled={stars === 0 || rated}
              onClick={() => {
                rateEvent(event.id, stars, noShow);
                setRated(true);
              }}
            >
              {rated ? t("rated") : t("submitRating")}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
