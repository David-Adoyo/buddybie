"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ChevronRight, MessageCircle } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { memberById } from "@/data/demo-seed";
import { getMatches, getMessages } from "@/lib/data/match";
import { getSparkMatches } from "@/lib/data/spark";
import { useActiveCircle } from "@/lib/active-circle";
import type { Member } from "@/lib/types";

export default function ChatListPage() {
  const t = useTranslations("chat");
  const { activeCircle } = useActiveCircle();
  const [rows, setRows] = useState<{ member: Member; last: string }[]>([]);

  useEffect(() => {
    // Spark chats stay isolated: in the Spark Circle we only list Spark matches.
    const ids = activeCircle?.isSpark ? getSparkMatches() : getMatches();
    const out: { member: Member; last: string }[] = [];
    for (const memberId of ids) {
      const member = memberById(memberId);
      if (!member) continue;
      const msgs = getMessages(memberId);
      out.push({ member, last: msgs.length ? msgs[msgs.length - 1].body : "" });
    }
    setRows(out);
  }, [activeCircle]);

  return (
    <div className="space-y-6">
      <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
        <MessageCircle className="size-6 text-primary" aria-hidden />
        {t("title")}
      </h1>

      {rows.length === 0 ? (
        <p className="py-10 text-center text-muted-foreground">{t("empty")}</p>
      ) : (
        <div className="space-y-2">
          {rows.map(({ member, last }) => (
            <Link key={member.id} href={`/chat/${member.id}`}>
              <Card className="flex items-center gap-3 p-4 transition-colors hover:bg-secondary">
                <Avatar name={member.name} colour={member.colour} />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{member.name}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {last || t("sayHi")}
                  </p>
                </div>
                <ChevronRight className="size-5 text-muted-foreground" aria-hidden />
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
