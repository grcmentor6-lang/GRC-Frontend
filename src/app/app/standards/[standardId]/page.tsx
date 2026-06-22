"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { Card } from "@/components/ui/primitives";
import { PageSkeleton } from "@/components/ui/skeleton";
import { learningsApi } from "@/lib/learnings";
import { useCachedQuery } from "@/lib/use-query";
import { STANDARD_BY_ID, buildTaskIndex } from "@/lib/standards";
import { StandardLanding } from "@/components/app/standards";

export default function StandardOverviewPage() {
  const { standardId } = useParams<{ standardId: string }>();
  const standard = STANDARD_BY_ID[standardId];
  const { data: learnings, loading } = useCachedQuery("learnings:grc101", () => learningsApi.get("grc101"));
  const taskByCode = useMemo(() => buildTaskIndex(learnings), [learnings]);

  if (!standard) {
    return (
      <div className="max-w-[680px] mx-auto px-6 py-10">
        <Card className="text-center py-12">
          <div className="w-11 h-11 mx-auto rounded-xl bg-rose-50 ring-1 ring-rose-100 flex items-center justify-center text-rose-500 mb-3"><Icon name="info" size={20} /></div>
          <div className="text-[13px] font-medium text-slate-700">Unknown standard</div>
          <Link href="/app/standards" className="inline-block mt-4 text-[12.5px] text-indigo-600 hover:text-indigo-700">← All standards</Link>
        </Card>
      </div>
    );
  }

  if (loading) return <PageSkeleton cards={4} />;

  return <StandardLanding standard={standard} taskByCode={taskByCode} />;
}
