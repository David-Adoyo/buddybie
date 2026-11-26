"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, ChevronDown } from "lucide-react";
import { useActiveCircle } from "@/lib/active-circle";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function CircleSwitcher() {
  const t = useTranslations("circleSwitcher");
  const { joinedCircles, activeCircle, setActiveCircle } = useActiveCircle();
  const [open, setOpen] = useState(false);

  if (!activeCircle) return null;
  const ActiveIcon = activeCircle.icon;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-full border bg-background py-1.5 pl-2 pr-3 text-sm font-medium transition-colors hover:bg-secondary"
      >
        <span
          className="flex size-6 items-center justify-center rounded-full"
          style={{
            backgroundColor: `${activeCircle.accent}1f`,
            color: activeCircle.accent,
          }}
        >
          <ActiveIcon className="size-4" aria-hidden />
        </span>
        <span className="max-w-32 truncate">{activeCircle.name}</span>
        <ChevronDown className="size-4 text-muted-foreground" aria-hidden />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            aria-hidden
            onClick={() => setOpen(false)}
          />
          <div
            role="listbox"
            className="absolute left-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border bg-popover p-1 shadow-lg"
          >
            <p className="px-3 py-2 text-xs font-medium text-muted-foreground">
              {t("label")}
            </p>
            {joinedCircles.map((circle) => {
              const Icon = circle.icon;
              const active = circle.id === activeCircle.id;
              return (
                <button
                  key={circle.id}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    setActiveCircle(circle.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-secondary",
                    active && "bg-secondary",
                  )}
                >
                  <span
                    className="flex size-7 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: `${circle.accent}1f`,
                      color: circle.accent,
                    }}
                  >
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <span className="flex-1 truncate font-medium">
                    {circle.name}
                  </span>
                  {circle.isSpark && (
                    <Badge variant="spark" className="px-1.5 py-0 text-[10px]">
                      18+
                    </Badge>
                  )}
                  {active && <Check className="size-4 text-primary" aria-hidden />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
