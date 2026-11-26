"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Home,
  MessageCircle,
  Settings,
  ShieldCheck,
  Target,
  UserRound,
  Users,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { CircleSwitcher } from "@/components/app/circle-switcher";
import { useActiveCircle } from "@/lib/active-circle";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("app");
  const { ready, hasOnboarding } = useActiveCircle();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (ready && !hasOnboarding) router.replace("/onboarding");
  }, [ready, hasOnboarding, router]);

  const nav = [
    { href: "/home", label: t("navHome"), icon: Home },
    { href: "/buddies", label: t("navBuddies"), icon: Users },
    { href: "/goals", label: t("navGoals"), icon: Target },
    { href: "/chat", label: t("navChat"), icon: MessageCircle },
    { href: "/profile", label: t("navProfile"), icon: UserRound },
  ];

  if (!ready || !hasOnboarding) {
    return (
      <div className="flex min-h-full items-center justify-center">
        <Logo showWordmark={false} />
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:ring-2 focus:ring-primary"
      >
        Skip to main content
      </a>
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between gap-3 px-4">
          <div className="flex items-center gap-3">
            <Link href="/home" aria-label="Be a Buddy home">
              <Logo />
            </Link>
            <CircleSwitcher />
          </div>
          <div className="flex items-center gap-1">
            <nav className="mr-1 hidden items-center gap-1 sm:flex">
              {nav.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <item.icon className="size-4" aria-hidden />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <Link
              href="/safety"
              aria-label={t("navSafety")}
              className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
            >
              <ShieldCheck className="size-4" aria-hidden />
            </Link>
            <Link
              href="/settings"
              aria-label={t("navSettings")}
              className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
            >
              <Settings className="size-4" aria-hidden />
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main id="main-content" className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 pb-24 sm:pb-6">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav aria-label="Main navigation" className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 backdrop-blur sm:hidden">
        <div className="mx-auto grid max-w-4xl grid-cols-5">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <item.icon className="size-5" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
