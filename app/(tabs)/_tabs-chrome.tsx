"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { TabNav } from "./_tab-nav";

const GnbVisibilityContext = createContext<(hidden: boolean) => void>(() => undefined);

export function useHideTabsGnb(hidden: boolean) {
  const setHidden = useContext(GnbVisibilityContext);

  useEffect(() => {
    setHidden(hidden);
    return () => setHidden(false);
  }, [hidden, setHidden]);
}

export function TabsChrome({ children }: { children: ReactNode }) {
  const [gnbHidden, setGnbHidden] = useState(false);

  return (
    <GnbVisibilityContext.Provider value={setGnbHidden}>
      <main className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">{children}</main>
      {!gnbHidden ? (
        <div
          className="shrink-0 bg-surface-primary"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <TabNav />
        </div>
      ) : null}
    </GnbVisibilityContext.Provider>
  );
}
