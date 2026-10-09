"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { LibraryProvenance, OverviewPoster, TaskContext } from "@/components/app/library";
import { LIBRARY_BY_ID, itemHref, partsOf, slugOf, summaryOf, taskCovers } from "@/lib/library";
import { STANDARD_BY_ID } from "@/lib/standards";

export default function LibraryStandardPage({ params, searchParams }: {
  params: Promise<{ standardId: string }>;
  searchParams: Promise<{ task?: string }>;
}) {
  const { standardId } = use(params);
  const { task } = use(searchParams);
  const standard = LIBRARY_BY_ID[standardId];
  if (!standard) notFound();
  const meta = STANDARD_BY_ID[standardId];

  return (
    <div className="page-shell space-y-4">
      <Link href="/app/library" className="focus-ring inline-flex items-center gap-1.5 text-[12px] text-slate-500 hover:text-slate-800">
        <Icon name="arrowLeft" size={13} /> Standards library
      </Link>
      {task && <TaskContext task={task} />}
      <header>
        <span className="font-mono text-[10.5px] tracking-[0.08em] text-[#1f3564]">{meta?.fullName}</span>
        <h1 className="mt-0.5 text-[22px] font-semibold tracking-tight text-slate-900">{meta?.code}</h1>
        <p className="mt-1 text-[13px] text-slate-500 tracking-tight max-w-[72ch]" style={{ textWrap: "pretty" }}>{meta?.description}</p>
      </header>
      <LibraryProvenance standard={standard} />

      {partsOf(standard).map((part) => (
        <div key={part} className="max-w-[900px]">
          <OverviewPoster standard={standard} part={part} slug={`${standard.id}-${slugOf(part)}`} />
        </div>
      ))}

      {standard.groups.map((group) => (
        <section key={group.name}>
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-[13px] font-semibold text-slate-800 tracking-tight">{group.name}</h2>
            <span className="font-mono text-[10.5px] text-slate-400">{group.items.length} {group.unit}</span>
            <span className="h-px flex-1 bg-slate-200/70" />
          </div>
          <ul className="list-none p-0 m-0 rounded-xl ring-1 ring-slate-200 bg-white divide-y divide-slate-100 overflow-hidden">
            {group.items.map((item) => {
              const inTask = !!task && taskCovers(task, item.ref);
              return (
                <li key={item.ref}>
                  <Link
                    href={itemHref(standard, item, task)}
                    className={`focus-ring grid grid-cols-[112px_1fr_auto] gap-3 items-baseline px-3.5 py-2.5 hover:bg-slate-50 ${inTask ? "bg-sky-50/60" : ""}`}
                  >
                    <span className="font-mono text-[11px] text-[#1f3564]">{item.ref}</span>
                    <span className="min-w-0">
                      <span className="block text-[13px] text-slate-800 tracking-tight">{item.title}</span>
                      <span className="block text-[12px] text-slate-500 tracking-tight" style={{ textWrap: "pretty" }}>{summaryOf(item)}</span>
                    </span>
                    {inTask && <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-sky-700">In your task</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
