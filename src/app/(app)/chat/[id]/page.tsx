"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, Send, Sparkles } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScamWarning } from "@/components/safety/scam-warning";
import { ExplicitWarning } from "@/components/safety/explicit-warning";
import { scanForExplicit } from "@/lib/moderation/explicit";
import { VerifiedBadge } from "@/components/safety/verified-badge";
import { cn } from "@/lib/utils";
import { memberById, seedGoals } from "@/data/demo-seed";
import { getMatches, getMessages, sendMessage, type ChatMessage } from "@/lib/data/match";
import { getSparkMatches } from "@/lib/data/spark";

const REPLIES = [
  "That's so cool — tell me more! 😊",
  "Love that. Count me in!",
  "Haha yes! When are you free this week?",
  "Same here honestly. Let's make it happen.",
  "Nice to meet you! 🙌",
];

export default function ConversationPage() {
  const t = useTranslations("chat");
  const params = useParams<{ id: string }>();
  const memberId = String(params?.id ?? "");
  const member = memberById(memberId);
  const matched =
    getMatches().includes(memberId) || getSparkMatches().includes(memberId);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [openers, setOpeners] = useState<string[]>([]);
  const replyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!member || !matched) return;
    const existing = getMessages(memberId);
    setMessages(existing);
    if (existing.length === 0) {
      const goal =
        seedGoals.find((g) => g.owner.id === memberId)?.title ?? "your goals";
      fetch("/api/icebreakers", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: member.name, goal }),
      })
        .then((r) => r.json())
        .then((d) => setOpeners(d.openers ?? []))
        .catch(() => {});
    }
    return () => {
      if (replyTimer.current) clearTimeout(replyTimer.current);
    };
  }, [memberId, member, matched]);

  if (!member) {
    return <p className="py-10 text-center text-muted-foreground">{t("notFound")}</p>;
  }

  if (!matched) {
    return (
      <div className="mx-auto max-w-sm space-y-4 py-16 text-center">
        <Avatar name={member.name} colour={member.colour} className="mx-auto size-14" />
        <h1 className="text-xl font-bold">{t("gateTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("gateBody")}</p>
        <Link href="/buddies" className="text-primary hover:underline">
          {t("gateCta")}
        </Link>
      </div>
    );
  }

  function send(body: string) {
    const text = body.trim();
    if (!text) return;
    setMessages([...sendMessage(memberId, "me", text)]);
    setDraft("");
    setOpeners([]);
    replyTimer.current = setTimeout(() => {
      const reply = REPLIES[getMessages(memberId).length % REPLIES.length];
      setMessages([...sendMessage(memberId, "them", reply)]);
    }, 1200);
  }

  return (
    <div className="flex min-h-[70vh] flex-col">
      <div className="mb-4 flex items-center gap-3 border-b pb-3">
        <Link href="/chat" aria-label={t("back")} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-5" />
        </Link>
        <Avatar name={member.name} colour={member.colour} />
        <div className="flex items-center gap-2">
          <span className="font-semibold">{member.name}</span>
          <VerifiedBadge level={member.verifiedLevel ?? 1} />
        </div>
      </div>

      <div className="flex-1 space-y-3">
        {messages.length === 0 && openers.length > 0 && (
          <Card className="space-y-2 p-4">
            <p className="flex items-center gap-2 text-sm font-medium">
              <Sparkles className="size-4 text-primary" aria-hidden />
              {t("icebreakersTitle")}
            </p>
            <p className="text-xs text-muted-foreground">{t("icebreakersHint")}</p>
            <div className="space-y-2">
              {openers.map((o, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => send(o)}
                  className="w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors hover:bg-secondary"
                >
                  {o}
                </button>
              ))}
            </div>
          </Card>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={cn("flex", m.from === "me" ? "justify-end" : "justify-start")}
          >
            <span
              className={cn(
                "max-w-[80%] rounded-2xl px-3 py-2 text-sm",
                m.from === "me"
                  ? "rounded-br-sm bg-primary text-primary-foreground"
                  : "rounded-bl-sm bg-secondary text-secondary-foreground",
              )}
            >
              {m.body}
            </span>
          </div>
        ))}
      </div>

      <div className="sticky bottom-16 mt-4 space-y-2 border-t bg-background pt-3 sm:bottom-0">
        <ExplicitWarning text={draft} />
        <ScamWarning text={draft} />
        <div className="flex gap-2">
          <Input
            value={draft}
            placeholder={t("composer")}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !scanForExplicit(draft).flagged) send(draft);
            }}
          />
          <Button
            onClick={() => send(draft)}
            disabled={!draft.trim() || scanForExplicit(draft).flagged}
            aria-label={t("send")}
          >
            <Send />
          </Button>
        </div>
      </div>
    </div>
  );
}
