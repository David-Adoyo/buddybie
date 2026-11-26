"use client";

import * as React from "react";

const STORAGE_KEY = "bab_low_data";

interface LowDataContextValue {
  lowData: boolean;
  setLowData: (value: boolean) => void;
}

const LowDataContext = React.createContext<LowDataContextValue>({
  lowData: false,
  setLowData: () => {},
});

type ConnectionLike = { saveData?: boolean };

export function LowDataProvider({ children }: { children: React.ReactNode }) {
  const [lowData, setState] = React.useState(false);

  React.useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const saveData =
      (navigator as Navigator & { connection?: ConnectionLike }).connection
        ?.saveData ?? false;
    const initial = stored !== null ? stored === "true" : saveData;
    setState(initial);
    document.documentElement.setAttribute("data-low-data", String(initial));
  }, []);

  const setLowData = React.useCallback((value: boolean) => {
    localStorage.setItem(STORAGE_KEY, String(value));
    setState(value);
    document.documentElement.setAttribute("data-low-data", String(value));
  }, []);

  return (
    <LowDataContext.Provider value={{ lowData, setLowData }}>
      {children}
    </LowDataContext.Provider>
  );
}

export const useLowData = () => React.useContext(LowDataContext);
