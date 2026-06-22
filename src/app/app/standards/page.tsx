"use client";

import { useMemo } from "react";
import { Icon } from "@/components/ui/icon";
import { PageSkeleton } from "@/components/ui/skeleton";
import { learningsApi } from "@/lib/learnings";
import { useCachedQuery } from "@/lib/use-query";
import { STANDARDS, buildTaskIndex } from "@/lib/standards";
import { StandardCard } from "@/components/app/standards";

/** Standards Overview — the 5 GRC 101 standards as cards, each opening its overview page. */
export default function StandardsIndex() {
  const { data: learnings, loading } = useCachedQuery("learnings:grc101", () => learningsApi.get("grc101"));
  const taskByCode = useMemo(() => buildTaskIndex(learnings), [learnings]);

  if (loading) return <PageSkeleton cards={5} />;

  return (
    <div className="max-w-[920px] mx-auto px-6 py-7">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="inline-flex items-center gap-1.5 h-6 px-2 rounded-md text-[11px] font-medium ring-1 bg-indigo-50 text-indigo-600 ring-indigo-100"><Icon name="shield" size={12} /> Standards-first</span>
        </div>
        <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-slate-900">Standards Overview</h1>
        <p className="mt-1.5 text-[13px] text-slate-600 tracking-tight max-w-2xl" style={{ textWrap: "pretty" }}>
          The frameworks you work through in GRC 101. Open a standard to see the tasks it owns, the method applied per activity, and your progress.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {STANDARDS.map((s) => <StandardCard key={s.id} standard={s} taskByCode={taskByCode} />)}
      </div>
    </div>
  );
}
