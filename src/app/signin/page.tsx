"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, Phone, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/env";

type Step = "phone" | "otp";

function normalisePhone(value: string) {
  return value.replace(/[^\d+]/g, "");
}

export default function SignInPage() {
  const t = useTranslations("auth");
  const tc = useTranslations("common");
  const router = useRouter();

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendCode() {
    const clean = normalisePhone(phone);
    if (!/^\+?\d{7,15}$/.test(clean)) {
      setError(t("errorInvalidPhone"));
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        const { error: otpError } = await supabase.auth.signInWithOtp({
          phone: clean,
        });
        if (otpError) throw otpError;
      }
      setPhone(clean);
      setStep("otp");
    } catch {
      setError(t("errorGeneric"));
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode() {
    if (!/^\d{6}$/.test(code)) {
      setError(t("errorInvalidCode"));
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          phone,
          token: code,
          type: "sms",
        });
        if (verifyError) throw verifyError;
      }
      router.push("/onboarding");
    } catch {
      setError(t("errorGeneric"));
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-full flex-col">
      <header className="flex items-center justify-between px-4 py-4">
        <Link href="/" aria-label="Buddybie home">
          <Logo />
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <span className="mb-2 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              {step === "phone" ? (
                <Phone className="size-6" aria-hidden />
              ) : (
                <ShieldCheck className="size-6" aria-hidden />
              )}
            </span>
            <CardTitle className="text-2xl">{t("title")}</CardTitle>
            <CardDescription>
              {step === "phone" ? t("subtitle") : t("codeSentTo", { phone })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === "phone" ? (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="phone">{t("phoneLabel")}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder={t("phonePlaceholder")}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendCode()}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t("phoneHint")}
                  </p>
                </div>
                {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
                <Button
                  className="w-full"
                  size="lg"
                  onClick={sendCode}
                  disabled={loading}
                >
                  {loading ? t("sending") : t("sendCode")}
                </Button>
              </>
            ) : (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="code">{t("codeLabel")}</Label>
                  <Input
                    id="code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder="______"
                    className="text-center text-2xl tracking-[0.5em]"
                    value={code}
                    onChange={(e) =>
                      setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    onKeyDown={(e) => e.key === "Enter" && verifyCode()}
                  />
                </div>
                {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
                <Button
                  className="w-full"
                  size="lg"
                  onClick={verifyCode}
                  disabled={loading}
                >
                  {loading ? t("verifying") : t("verify")}
                </Button>
                <div className="flex items-center justify-between text-sm">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setStep("phone");
                      setCode("");
                      setError(null);
                    }}
                  >
                    <ArrowLeft className="size-4" aria-hidden />
                    {t("changeNumber")}
                  </button>
                  <button
                    type="button"
                    className="text-primary hover:underline"
                    onClick={sendCode}
                    disabled={loading}
                  >
                    {t("resend")}
                  </button>
                </div>
              </>
            )}

            {!isSupabaseConfigured && (
              <p className="rounded-md bg-accent/15 px-3 py-2 text-xs text-accent-foreground">
                {t("demoNotice")}
              </p>
            )}
          </CardContent>
        </Card>
      </main>

      <footer className="px-4 py-4 text-center text-xs text-muted-foreground">
        {tc("appName")} · {tc("tagline")}
      </footer>
    </div>
  );
}
