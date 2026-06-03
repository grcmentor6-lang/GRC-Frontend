"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { learningsApi, type Learnings } from "@/lib/learnings";

interface DeskLearningsValue {
  learnings: Learnings | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const DeskLearningsContext = createContext<DeskLearningsValue>({
  learnings: null,
  loading: true,
  refresh: async () => {},
});

/** Fetches the engagement tree once for the whole Working Desk and shares it (sidebar, overview, redirect). */
export function DeskLearningsProvider({ children }: { children: React.ReactNode }) {
  const [learnings, setLearnings] = useState<Learnings | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (initial = false) => {
    try {
      const l = await learningsApi.get("grc101");
      setLearnings(l);
    } catch {
      /* keep prior data on transient errors */
    } finally {
      if (initial) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(true);
  }, [load]);

  return (
    <DeskLearningsContext.Provider value={{ learnings, loading, refresh: () => load(false) }}>
      {children}
    </DeskLearningsContext.Provider>
  );
}

export const useDeskLearnings = () => useContext(DeskLearningsContext);
