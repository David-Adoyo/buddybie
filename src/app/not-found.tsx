import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Compass, Home } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="flex flex-1 items-center justify-center px-4 py-24">
        <div className="mx-auto max-w-md text-center">
          <p className="text-6xl font-extrabold tracking-tight text-primary">
            404
          </p>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="mt-2 text-muted-foreground">{t("body")}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/" className={cn(buttonVariants())}>
              <Home className="size-4" aria-hidden />
              {t("home")}
            </Link>
            <Link
              href="/discover"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              <Compass className="size-4" aria-hidden />
              {t("discover")}
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
