"use client";

import * as React from "react";
import { circleById, type Circle, type CircleId } from "@/data/circles";
import { loadOnboarding } from "@/lib/onboarding";

const KEY = "bab_active_circle";

interface ActiveCircleContextValue {
  ready: boolean;
  hasOnboarding: boolean;
  joinedCircles: Circle[];
  activeCircle: Circle | null;
  setActiveCircle: (id: CircleId) => void;
}

const ActiveCircleContext = React.createContext<ActiveCircleContextValue>({
  ready: false,
  hasOnboarding: false,
  joinedCircles: [],
  activeCircle: null,
  setActiveCircle: () => {},
});

export function ActiveCircleProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [ready, setReady] = React.useState(false);
  const [hasOnboarding, setHasOnboarding] = React.useState(false);
  const [joined, setJoined] = React.useState<Circle[]>([]);
  const [activeId, setActiveId] = React.useState<CircleId | null>(null);

  React.useEffect(() => {
    const onboarding = loadOnboarding();
    if (!onboarding || onboarding.circles.length === 0) {
      setReady(true);
      return;
    }
    const circles = onboarding.circles
      .map((id) => circleById(id))
      .filter((c): c is Circle => Boolean(c));
    setJoined(circles);
    setHasOnboarding(true);

    const stored = localStorage.getItem(KEY) as CircleId | null;
    const valid =
      stored && circles.some((c) => c.id === stored)
        ? stored
        : (circles.find((c) => !c.isSpark)?.id ?? circles[0].id);
    setActiveId(valid);
    setReady(true);
  }, []);

  const setActiveCircle = React.useCallback((id: CircleId) => {
    try {
      localStorage.setItem(KEY, id);
    } catch {
      // ignore storage failures in the preview
    }
    setActiveId(id);
  }, []);

  const activeCircle = activeId ? (circleById(activeId) ?? null) : null;

  return (
    <ActiveCircleContext.Provider
      value={{
        ready,
        hasOnboarding,
        joinedCircles: joined,
        activeCircle,
        setActiveCircle,
      }}
    >
      {children}
    </ActiveCircleContext.Provider>
  );
}

export const useActiveCircle = () => React.useContext(ActiveCircleContext);
