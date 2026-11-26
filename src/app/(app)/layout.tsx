import type { ReactNode } from "react";
import { ActiveCircleProvider } from "@/lib/active-circle";
import { AppShell } from "@/components/app/app-shell";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <ActiveCircleProvider>
      <AppShell>{children}</AppShell>
    </ActiveCircleProvider>
  );
}
