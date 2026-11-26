import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Fredoka } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import "./globals.css";
import { ThemeProvider, ThemeScript } from "@/components/providers/theme-provider";
import { LowDataProvider } from "@/components/providers/low-data-provider";
import { PwaRegister } from "@/components/pwa-register";
import { CookieConsent } from "@/components/cookie-consent";
import { ScrollToTop } from "@/components/scroll-to-top";
import { RouteLoader } from "@/components/route-loader";
import { env } from "@/lib/env";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Rounded display face that echoes the "buddybie." wordmark.
const fredoka = Fredoka({
  variable: "--font-display-round",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const TITLE = "Buddybie — Make Friends & Meet Verified People Near You";
const DESCRIPTION =
  "Buddybie is the verified friendship app to make friends as an adult, find accountability and travel buddies, and meet people who share your values — online and in real life, in cities worldwide.";

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: {
    default: TITLE,
    template: "%s · Buddybie",
  },
  description: DESCRIPTION,
  applicationName: "Buddybie",
  manifest: "/manifest.webmanifest",
  keywords: [
    "Buddybie",
    "app to make friends",
    "friendship app",
    "make friends as an adult",
    "meet new people near me",
    "meet people with similar interests",
    "verified community app",
    "accountability buddy app",
    "travel buddy app",
    "faith community app",
    "networking meetups",
    "group activities near me",
    "safe meetups",
  ],
  authors: [{ name: "Buddybie" }],
  creator: "Buddybie",
  publisher: "Buddybie",
  category: "social networking",
  alternates: { canonical: "/" },
  formatDetection: { telephone: false, email: false, address: false },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Buddybie",
  },
  // favicon.ico (16/32/48), icon.png (32) and apple-icon.png (180) live in
  // src/app and are wired up automatically by the file conventions.
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
    siteName: "Buddybie",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fffbf7" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1613" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${fredoka.variable} h-full antialiased`}
    >
      <head>
        <ThemeScript />
        <noscript>
          <style>{"[data-route-loader]{display:none!important}"}</style>
        </noscript>
      </head>
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider>
          <ThemeProvider>
            <LowDataProvider>
              <RouteLoader />
              <ScrollToTop />
              {children}
              <PwaRegister />
              <CookieConsent />
            </LowDataProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
