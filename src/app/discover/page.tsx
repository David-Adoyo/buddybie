import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { DiscoverExplorer } from "./explorer";

export const metadata: Metadata = {
  title: "Discover — Meet People Worth Meeting Anywhere",
  description:
    "Find like-minded people in any city around the world. Choose your destination and your Circle — friends, fitness, faith, work, travel and more.",
  alternates: { canonical: "/discover" },
};

export default function DiscoverIndexPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="flex-1">
        <DiscoverExplorer />
      </main>
      <SiteFooter />
    </>
  );
}
