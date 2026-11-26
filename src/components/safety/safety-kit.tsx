"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Clock,
  Copy,
  MapPin,
  Plus,
  Share2,
  Siren,
  Trash2,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  addContact,
  clearCheckIn,
  getCheckIn,
  getContacts,
  removeContact,
  startCheckIn,
  type CheckIn,
  type TrustedContact,
} from "@/lib/data/safety";

export function SafetyKit() {
  const t = useTranslations("safety");
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  useEffect(() => setContacts(getContacts()), []);

  return (
    <div className="space-y-5">
      {/* Meetup safety reminder at the top of the kit */}
      <div className="flex items-start gap-3 rounded-xl border border-brand-teal/30 bg-brand-teal/8 px-4 py-3">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-teal/15 text-brand-teal">
          <MapPin className="size-4" aria-hidden />
        </span>
        <div>
          <p className="text-sm font-semibold text-brand-teal">{t("meetupReminderTitle")}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{t("meetupReminderBody")}</p>
        </div>
      </div>

      <TrustedContacts contacts={contacts} setContacts={setContacts} />
      <SharePlan contacts={contacts} />
      <CheckInTimer />
      <Sos contacts={contacts} />
    </div>
  );
}

function TrustedContacts({
  contacts,
  setContacts,
}: {
  contacts: TrustedContact[];
  setContacts: (c: TrustedContact[]) => void;
}) {
  const t = useTranslations("safety");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <UserPlus className="size-4 text-primary" aria-hidden />
          {t("contactsTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {contacts.length === 0 && (
          <p className="text-sm text-muted-foreground">{t("contactsEmpty")}</p>
        )}
        {contacts.map((c) => (
          <div key={c.id} className="flex items-center justify-between text-sm">
            <span>
              <span className="font-medium">{c.name}</span>{" "}
              <span className="text-muted-foreground">{c.phone}</span>
            </span>
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("remove")}
              onClick={() => setContacts(removeContact(c.id))}
            >
              <Trash2 className="size-4 text-muted-foreground" />
            </Button>
          </div>
        ))}
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            placeholder={t("contactName")}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            placeholder={t("contactPhone")}
            value={phone}
            inputMode="tel"
            onChange={(e) => setPhone(e.target.value)}
          />
          <Button
            disabled={!name.trim() || !phone.trim()}
            onClick={() => {
              setContacts(addContact(name, phone));
              setName("");
              setPhone("");
            }}
          >
            <Plus />
            {t("add")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function SharePlan({ contacts }: { contacts: TrustedContact[] }) {
  const t = useTranslations("safety");
  const [what, setWhat] = useState("");
  const [where, setWhere] = useState("");
  const [when, setWhen] = useState("");
  const [contactId, setContactId] = useState("");
  const [copied, setCopied] = useState(false);

  const contact = contacts.find((c) => c.id === contactId);
  const summary =
    what && where && when
      ? t("planSummary", { what, where, when, name: contact?.name ?? "a buddy" })
      : "";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Share2 className="size-4 text-primary" aria-hidden />
          {t("planTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-2 sm:grid-cols-3">
          <Input placeholder={t("planWhat")} value={what} onChange={(e) => setWhat(e.target.value)} />
          <Input placeholder={t("planWhere")} value={where} onChange={(e) => setWhere(e.target.value)} />
          <Input placeholder={t("planWhen")} value={when} onChange={(e) => setWhen(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="plan-contact">{t("planContact")}</Label>
          <select
            id="plan-contact"
            value={contactId}
            onChange={(e) => setContactId(e.target.value)}
            className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">{t("planContactNone")}</option>
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        {summary && (
          <div className="rounded-md bg-secondary p-3 text-sm">{summary}</div>
        )}
        <Button
          variant="outline"
          disabled={!summary}
          onClick={() => {
            navigator.clipboard?.writeText(summary).then(
              () => setCopied(true),
              () => setCopied(true),
            );
          }}
        >
          <Copy />
          {copied ? t("planCopied") : t("planCopy")}
        </Button>
      </CardContent>
    </Card>
  );
}

function CheckInTimer() {
  const t = useTranslations("safety");
  const [checkIn, setCheckIn] = useState<CheckIn | null>(null);
  const [now, setNow] = useState(0);
  const [minutes, setMinutes] = useState("30");
  const [note, setNote] = useState("");

  useEffect(() => {
    setCheckIn(getCheckIn());
    setNow(Date.now());
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);

  const remaining = checkIn ? checkIn.until - now : 0;
  const overdue = checkIn && remaining <= 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="size-4 text-primary" aria-hidden />
          {t("checkInTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!checkIn ? (
          <>
            <p className="text-sm text-muted-foreground">{t("checkInDesc")}</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                type="number"
                min={5}
                max={240}
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                className="sm:w-28"
              />
              <Input
                placeholder={t("checkInNote")}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <Button
                onClick={() =>
                  setCheckIn(startCheckIn(Math.max(5, Number(minutes) || 30), note))
                }
              >
                {t("checkInStart")}
              </Button>
            </div>
          </>
        ) : overdue ? (
          <div className="space-y-3">
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
              {t("checkInOverdue")}
            </p>
            <Button
              variant="outline"
              onClick={() => {
                clearCheckIn();
                setCheckIn(null);
              }}
            >
              {t("checkInSafe")}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-2xl font-bold tabular-nums">
              {formatRemaining(remaining)}
            </p>
            {checkIn.note && (
              <p className="text-sm text-muted-foreground">{checkIn.note}</p>
            )}
            <Button
              variant="outline"
              onClick={() => {
                clearCheckIn();
                setCheckIn(null);
              }}
            >
              {t("checkInSafe")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function formatRemaining(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function Sos({ contacts }: { contacts: TrustedContact[] }) {
  const t = useTranslations("safety");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [status, setStatus] = useState<"idle" | "locating" | "error">("idle");

  function trigger() {
    if (!("geolocation" in navigator)) {
      setStatus("error");
      return;
    }
    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setStatus("idle");
      },
      () => setStatus("error"),
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }

  const mapsUrl = coords
    ? `https://www.google.com/maps?q=${coords.lat},${coords.lng}`
    : "";

  return (
    <Card className="border-destructive/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base text-destructive">
          <Siren className="size-4" aria-hidden />
          {t("sosTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          {contacts.length === 0 ? t("sosNoContacts") : t("sosDesc")}
        </p>
        <Button variant="destructive" onClick={trigger} disabled={status === "locating"}>
          <Siren />
          {status === "locating" ? t("sosLocating") : t("sosButton")}
        </Button>
        {status === "error" && (
          <p className="text-sm text-destructive">{t("sosError")}</p>
        )}
        {coords && (
          <div className="space-y-2 rounded-md bg-secondary p-3 text-sm">
            <p className="flex items-center gap-1">
              <MapPin className="size-4" aria-hidden />
              {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
            </p>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {t("sosOpenMap")}
            </a>
            <p className="text-xs text-muted-foreground">{t("sosDemoNote")}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
