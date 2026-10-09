"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { Plaque } from "@/components/app/plaque";
import { ItemPoster, LibraryProvenance, TaskContext } from "@/components/app/library";
import { LIBRARY_BY_ID, entriesOf, findEntry, itemHref, nameOf, summaryOf, tasksCovering } from "@/lib/library";
import { TASK_META } from "@/lib/taskmeta";

export default function LibraryItemPage({ params, searchParams }: {
  params: Promise<{ standardId: string; itemId: string }>;
  searchParams: Promise<{ task?: string }>;
}) {
  const { standardId, itemId } = use(params);
  const { task } = use(searchParams);
  const standard = LIBRARY_BY_ID[standardId];
  const entry = standard && findEntry(standard, itemId);
  if (!standard || !entry) notFound();
  const { item, group } = entry;

  const all = entriesOf(standard);
  const at = all.findIndex((e) => e.item.ref === item.ref);
  const prev = all[at - 1]?.item;
  const next = all[at + 1]?.item;
  const tasks = tasksCovering(item.ref);

  return (
    <div className="page-shell space-y-4">
      <Link
        href={`/app/library/${standard.id}${task ? `?task=${encodeURIComponent(task)}` : ""}`}
        className="focus-ring inline-flex items-center gap-1.5 text-[12px] text-slate-500 hover:text-slate-800"
      >
        <Icon name="arrowLeft" size={13} /> {nameOf(standard)}
      </Link>
      {task && <TaskContext task={task} />}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start">
        <div className="space-y-4 min-w-0">
          {standard.publishedTitles ? (
            <Plaque standard={nameOf(standard)} reference={item.ref} quotation={item.title} explanation={summaryOf(item)} domain={group.name} />
          ) : (
            // SOC 2: the title is our label, so it may not sit in the plaque, which promises the
            // standard's own words. A study card — steel, borderless — carries the programme's.
            <div className="bg-sky-50/70 px-5 py-4">
              <span className="block font-mono text-[10.5px] font-semibold tracking-[0.08em] text-sky-800">{nameOf(standard)} · {item.ref}</span>
              <h1 className="mt-1.5 font-serif text-[16px] text-slate-900">{item.title}</h1>
              <p className="mt-2 text-[13px] leading-relaxed tracking-tight text-slate-600" style={{ textWrap: "pretty" }}>{summaryOf(item)}</p>
              <span className="mt-3 block font-mono text-[9.5px] uppercase tracking-[0.07em] text-slate-500">{group.name} · our label and summary</span>
            </div>
          )}

          {item.points && (
            <div>
              <span className="block font-mono text-[9.5px] uppercase tracking-[0.08em] text-sky-700 mb-2">In plain terms · grcmentor</span>
              <ol className="list-none p-0 m-0 space-y-2">
                {item.points.map((p, i) => (
                  <li key={i} className="flex gap-2.5">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-sky-700 text-white text-[10.5px] font-semibold flex items-center justify-center mt-0.5 tabular-nums">{i + 1}</span>
                    <span className="text-[13px] text-slate-700 leading-relaxed tracking-tight" style={{ textWrap: "pretty" }}>{p}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <LibraryProvenance standard={standard} />

          <div>
            <span className="block font-mono text-[9.5px] uppercase tracking-[0.08em] text-slate-400 mb-2">Where GRC 101 uses it</span>
            {tasks.length ? (
              <ul className="list-none p-0 m-0 space-y-1">
                {tasks.map((code) => (
                  <li key={code}>
                    <Link
                      href={`/app/desk/task/${code}`}
                      className={`focus-ring flex items-baseline gap-3 rounded-lg px-2.5 py-1.5 hover:bg-slate-50 ${code === task ? "bg-sky-50/60" : ""}`}
                    >
                      <span className="font-mono text-[11px] text-slate-500 w-[64px] shrink-0">{code}</span>
                      <span className="text-[12.5px] text-slate-700 tracking-tight">{TASK_META[code]?.name ?? code}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[12.5px] text-slate-500 tracking-tight">No GRC 101 task is graded against this one.</p>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            {prev ? (
              <Link href={itemHref(standard, prev, task)} className="focus-ring inline-flex items-center gap-1.5 text-[12px] text-slate-500 hover:text-slate-800">
                <Icon name="arrowLeft" size={13} /> {prev.ref}
              </Link>
            ) : <span />}
            {next && (
              <Link href={itemHref(standard, next, task)} className="focus-ring inline-flex items-center gap-1.5 text-[12px] text-slate-500 hover:text-slate-800">
                {next.ref} <Icon name="arrowRight" size={13} />
              </Link>
            )}
          </div>
        </div>

        <div className="min-w-0 lg:sticky lg:top-6">
          <ItemPoster standard={standard} group={group} item={item} slug={`${standard.id}-${itemId}`} />
        </div>
      </div>
    </div>
  );
}
