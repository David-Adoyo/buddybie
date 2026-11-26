"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Lock, Plus, ShieldCheck, Users } from "lucide-react";
import { useActiveCircle } from "@/lib/active-circle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { groupsForCircle, type GroupKind, type SeedGroup } from "@/data/community-seed";
import {
  addGroup,
  createdGroups,
  groupMemberCount,
  isGroupMember,
  toggleGroup,
} from "@/lib/data/community";

const KINDS: GroupKind[] = ["public", "private", "verified_only", "women_only", "men_only"];

export default function GroupsPage() {
  const t = useTranslations("groups");
  const { activeCircle } = useActiveCircle();
  const [groups, setGroups] = useState<SeedGroup[]>([]);
  const [, force] = useState(0);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [kind, setKind] = useState<GroupKind>("public");

  function refresh() {
    if (!activeCircle) return;
    setGroups([...createdGroups(activeCircle.id), ...groupsForCircle(activeCircle.id)]);
  }
  useEffect(() => {
    refresh();
  }, [activeCircle]);

  if (!activeCircle) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="mt-1 text-muted-foreground">
            {t("subtitleIn", { circle: activeCircle.name })}
          </p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus />
          {t("create")}
        </Button>
      </div>

      {groups.length === 0 ? (
        <p className="py-10 text-center text-muted-foreground">{t("empty")}</p>
      ) : (
        <div className="space-y-3">
          {groups.map((g) => {
            const joined = isGroupMember(g.id);
            return (
              <Card key={g.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{g.name}</span>
                      <KindBadge kind={g.kind} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{g.description}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="size-3.5" aria-hidden />
                      {t("members", { count: groupMemberCount(g) })}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant={joined ? "outline" : "default"}
                    onClick={() => {
                      toggleGroup(g.id);
                      force((n) => n + 1);
                    }}
                  >
                    {joined ? t("leave") : t("join")}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} title={t("createTitle")}>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="g-name">{t("name")}</Label>
            <Input id="g-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="g-desc">{t("description")}</Label>
            <Textarea id="g-desc" value={desc} onChange={(e) => setDesc(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>{t("kind")}</Label>
            <div className="flex flex-wrap gap-2">
              {KINDS.map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKind(k)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    kind === k ? "border-primary bg-primary/10 text-primary" : "hover:bg-secondary",
                  )}
                >
                  {t(`kind_${k}`)}
                </button>
              ))}
            </div>
          </div>
          <Button
            className="w-full"
            disabled={!name.trim()}
            onClick={() => {
              addGroup(activeCircle.id, name, desc, kind);
              setName("");
              setDesc("");
              setKind("public");
              setOpen(false);
              refresh();
            }}
          >
            {t("createSubmit")}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

function KindBadge({ kind }: { kind: GroupKind }) {
  const t = useTranslations("groups");
  if (kind === "public") return <Badge variant="secondary">{t("kind_public")}</Badge>;
  if (kind === "private")
    return (
      <Badge variant="outline">
        <Lock className="size-3" aria-hidden />
        {t("kind_private")}
      </Badge>
    );
  if (kind === "verified_only")
    return (
      <Badge variant="accent">
        <ShieldCheck className="size-3" aria-hidden />
        {t("kind_verified_only")}
      </Badge>
    );
  return <Badge variant="outline">{t(`kind_${kind}`)}</Badge>;
}
