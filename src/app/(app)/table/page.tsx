"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Lock, MapPin, Utensils } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MeetupDisclaimer } from "@/components/safety/meetup-disclaimer";
import { PremiumGate } from "@/components/app/premium-gate";
import { seedTables, type SeedTable } from "@/data/community-seed";
import {
  isSeated,
  tableFilledSeats,
  tableRevealed,
  tableStartLabel,
  toggleSeat,
} from "@/lib/data/community";

export default function BuddyTablePage() {
  const t = useTranslations("table");
  const [, force] = useState(0);
  useEffect(() => {
    /* read from localStorage on mount */ force((n) => n + 1);
  }, []);

  return (
    <PremiumGate planCode="table-pass" circleId="buddy-table">
      <div className="space-y-6">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Utensils className="size-6 text-primary" aria-hidden />
            {t("title")}
          </h1>
          <p className="mt-1 text-muted-foreground">{t("subtitle")}</p>
        </div>

        <MeetupDisclaimer />

        <div className="space-y-4">
          {seedTables.map((table) => (
            <TableCard key={table.id} table={table} onChange={() => force((n) => n + 1)} />
          ))}
        </div>
      </div>
    </PremiumGate>
  );
}

function TableCard({ table, onChange }: { table: SeedTable; onChange: () => void }) {
  const t = useTranslations("table");
  const seated = isSeated(table.id);
  const filled = tableFilledSeats(table);
  const revealed = tableRevealed(table);
  const full = filled >= table.seats && !seated;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base">
          {t("tableIn", { when: tableStartLabel(table) })}
        </CardTitle>
        <Badge variant="secondary">{t("seatsFilled", { filled, total: table.seats })}</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="flex items-center gap-2 text-sm">
          <MapPin className="size-4 text-muted-foreground" aria-hidden />
          {revealed ? (
            <span>
              <span className="font-medium">{table.venue}</span> · {table.area}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <Lock className="size-3.5" aria-hidden />
              {t("venueHidden", { hours: table.revealHours, area: table.area })}
            </span>
          )}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          {table.sitters.map((s) => (
            <span key={s.name} className="inline-flex items-center gap-1.5 rounded-full border py-1 pl-1 pr-3 text-sm">
              <Avatar name={s.name} colour={s.colour} className="size-6 text-xs" />
              {s.name.split(" ")[0]}
            </span>
          ))}
          {seated && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary py-1 pl-1 pr-3 text-sm text-primary">
              <Avatar name="You" colour="#e8604c" className="size-6 text-xs" />
              {t("you")}
            </span>
          )}
        </div>

        <Button
          variant={seated ? "outline" : "default"}
          disabled={full}
          onClick={() => {
            toggleSeat(table.id);
            onChange();
          }}
        >
          {seated ? t("leaveSeat") : full ? t("tableFull") : t("takeSeat")}
        </Button>
      </CardContent>
    </Card>
  );
}
