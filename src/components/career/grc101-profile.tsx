"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/icon";
import { Card } from "@/components/ui/primitives";
import { loadDesk, type Desk } from "@/lib/desk/model";
import { useProgress, type Progress } from "@/lib/desk/progress";
import { itemDone, itemHref, itemProgress, workIn } from "@/lib/desk/li";

/**
 * What GRC 101 develops, from the programme itself rather than the old mockup copy: its competency
 * domains (D1–D10; D11 is the Lead Implementer path on the Certification page), its six work threads, the standards that
 * bind the mentee's organisations, the pass rules, and the roles that assign the work. Everything is
 * the desk content (public/desk/sample.json) marked from the mentee's desk progress.
 */
export function Grc101Profile({ who, onProgress }: { who: string; /** Share of all desk steps done, 0–100. */ onProgress?: (pct: number) => void }) {
  const [desk, setDesk] = useState<Desk | null>(null);
  useEffect(() => {
    loadDesk().then(setDesk, () => {});
  }, []);
  if (!desk) return <div className="h-64 animate-pulse rounded-md bg-slate-100" aria-busy="true" />;
  return <Profile desk={desk} who={who} onProgress={onProgress} />;
}

type State = "acquired" | "developing" | "upcoming";
const STATE: Record<State, { l: string; icon: IconName; cls: string }> = {
  acquired: { l: "Acquired", icon: "check", cls: "bg-emerald-50 text-emerald-600 ring-emerald-100" },
  developing: { l: "Developing", icon: "play", cls: "bg-indigo-50 text-indigo-600 ring-indigo-100" },
  upcoming: { l: "Upcoming", icon: "minus", cls: "bg-slate-50 text-slate-300 ring-slate-200" },
};
/** Where a set of desk work stands: acquired when all of it is done, developing once any has begun. */
function stateOf(desk: Desk, p: Progress, ids: string[]): { s: State; done: number; total: number } {
  const done = ids.filter((id) => itemDone(desk, p, id)).length;
  const begun = ids.some((id) => itemProgress(desk, p, id).done > 0);
  return { s: ids.length && done === ids.length ? "acquired" : begun ? "developing" : "upcoming", done, total: ids.length };
}

function Head({ icon, action, children }: { icon: IconName; action?: ReactNode; children: ReactNode }) {
  return (
    <div className="mb-3.5 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon name={icon} size={14} className="text-slate-400" />
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.13em] text-slate-500">{children}</h3>
      </div>
      {action}
    </div>
  );
}

function Chips({ ids, desk, p }: { ids: string[]; desk: Desk; p: Progress }) {
  return (
    <span className="mt-1 flex flex-wrap gap-1">
      {ids.map((id) => {
        const href = itemHref(desk, id);
        const done = itemDone(desk, p, id);
        const cls = `rounded-[3px] border px-1.5 py-px font-mono text-[10.5px] font-semibold no-underline ${done ? "border-emerald-200 bg-emerald-50 text-emerald-700" : id.startsWith("LI-") ? "border-indigo-100 bg-indigo-50 text-indigo-700" : "border-slate-200 bg-white text-slate-600"}`;
        return href ? <Link key={id} href={href} className={`${cls} hover:border-slate-300 focus-ring`}>{id}</Link> : <span key={id} className={cls}>{id}</span>;
      })}
    </span>
  );
}

function Profile({ desk, who, onProgress }: { desk: Desk; who: string; onProgress?: (pct: number) => void }) {
  const { progress: p } = useProgress(who);
  useEffect(() => {
    const steps = Object.values(desk.tasks).flatMap((t) => t.steps.map((s) => `${t.id}-${s.n}`));
    onProgress?.(Math.round((steps.filter((k) => p.done[k]).length / steps.length) * 100));
  }, [desk, p, onProgress]);
  const tasks = desk.order.map((id) => desk.tasks[id]);

  // Competency domains D1–D10, from the tasks each one tags.
  const domains = Object.entries(desk.domains)
    .filter(([k]) => k !== "D11")
    .map(([k, name]) => ({ k, name, ids: tasks.filter((t) => t.meta.domains.some((d) => d.startsWith(`${k} `))).map((t) => t.id) }))
    .filter((d) => d.ids.length);
  const acquired = domains.filter((d) => stateOf(desk, p, d.ids).s === "acquired").length;

  // The six threads that run through the programme, each a chain of tasks and extensions.
  const threads = desk.connections.threads.map(([code, name, desc, chain]) => ({ code, name, desc, ids: workIn(chain) }));

  // The standards that bind the two organisations, as the Framework Library lists them.
  const fw = (desk.tp["frameworks|Framework Library"]?.pl as { r?: string[][] } | undefined)?.r ?? [];

  // Who assigns the work: each task's owner role, with how many tasks they own.
  const owners = [...tasks.reduce((m, t) => m.set(t.owner, [...(m.get(t.owner) ?? []), t.id]), new Map<string, string[]>())].sort((a, b) => b[1].length - a[1].length);

  const submitted = tasks.filter((t) => p.submitted[t.id]).length;

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
      <div className="space-y-5 xl:col-span-2">
        <Card>
          <Head icon="bolt" action={<span className="text-[11px] font-medium text-slate-400">{acquired} of {domains.length} acquired</span>}>Skills acquired</Head>
          <p className="-mt-1.5 mb-3 text-[12px] text-slate-500">The GRC 101 competency domains. A domain is acquired when every task that practises it is done.</p>
          <div className="divide-y divide-slate-100">
            {domains.map((d) => {
              const g = stateOf(desk, p, d.ids);
              const x = STATE[g.s];
              return (
                <div key={d.k} className="flex items-center gap-3 py-2.5">
                  <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ring-1 ${x.cls}`}><Icon name={x.icon} size={13} /></span>
                  <div className="min-w-0 flex-1">
                    <div className={`text-[13px] font-semibold tracking-tight ${g.s === "upcoming" ? "text-slate-500" : "text-slate-900"}`}>
                      <span className="mr-1.5 font-mono text-[11px] text-indigo-600">{d.k}</span>
                      {d.name}
                    </div>
                    <Chips ids={d.ids} desk={desk} p={p} />
                  </div>
                  <span className="shrink-0 text-right text-[11px] font-semibold text-slate-500">
                    {x.l}
                    <span className="block font-mono font-normal tabular-nums text-slate-400">{g.done}/{g.total} tasks</span>
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <Head icon="layers">Expertise developed</Head>
          <p className="-mt-1.5 mb-3 text-[12px] text-slate-500">Six threads run through the programme; each task builds on the one before it in its thread.</p>
          <div className="space-y-2.5">
            {threads.map((t) => {
              const g = stateOf(desk, p, t.ids);
              return (
                <div key={t.code} className="rounded-xl bg-slate-50/60 p-3 ring-1 ring-slate-200">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[12.5px] font-semibold tracking-tight text-slate-900">{t.name}</div>
                      <div className="mt-0.5 text-[11.5px] leading-relaxed tracking-tight text-slate-500" style={{ textWrap: "pretty" }}>{t.desc}</div>
                    </div>
                    <span className="shrink-0 font-mono text-[11px] tabular-nums text-slate-400">{g.done}/{g.total}</span>
                  </div>
                  <Chips ids={t.ids} desk={desk} p={p} />
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <Head icon="briefcase">Roles you work for</Head>
          <p className="-mt-1.5 mb-3 text-[12px] text-slate-500">Each task is assigned by a role in the Group GRC Office. You produce their work, the way a junior on their team would.</p>
          <div className="flex flex-wrap gap-2">
            {owners.map(([role, ids]) => (
              <span key={role} title={ids.join(", ")} className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-indigo-50/70 px-3 text-[12px] font-medium tracking-tight text-indigo-700 ring-1 ring-indigo-100">
                <Icon name="user" size={12} /> {role}
                <span className="font-mono text-[11px] text-indigo-400">{ids.length}</span>
              </span>
            ))}
          </div>
        </Card>
      </div>

      <div className="space-y-5">
        <Card>
          <Head icon="target">How you pass GRC 101</Head>
          <ol className="space-y-2.5">
            {desk.gates.map((g, i) => (
              <li key={i} className="flex gap-2.5">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-slate-100 text-[10.5px] font-semibold tabular-nums text-slate-600">{i + 1}</span>
                <span className="text-[12px] leading-relaxed tracking-tight text-slate-600" style={{ textWrap: "pretty" }}>
                  {g}
                  {/^At least \d+ of \d+ tasks submitted/.test(g) && (
                    <span className="mt-1 block font-mono text-[11px] font-semibold text-indigo-600">You: {submitted} of {tasks.length} submitted</span>
                  )}
                </span>
              </li>
            ))}
          </ol>
        </Card>

        <Card>
          <Head icon="shield" action={<span className="text-[11px] font-medium text-slate-400">{fw.length}</span>}>Frameworks &amp; standards</Head>
          <p className="-mt-1.5 mb-3 text-[12px] text-slate-500">What binds your two organisations, from the Framework Library.</p>
          <div className="divide-y divide-slate-100">
            {fw.map(([std, type, applies, flag]) => (
              <div key={std} className="py-2">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[12.5px] font-semibold tracking-tight text-slate-900">{std}</span>
                  <span className={`shrink-0 text-[10.5px] font-semibold ${flag === "Mandatory" ? "text-indigo-700" : "text-slate-400"}`}>{flag}</span>
                </div>
                <div className="text-[11.5px] tracking-tight text-slate-500">{type} · {applies}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
