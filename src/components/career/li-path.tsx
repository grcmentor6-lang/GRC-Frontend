"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { loadDesk, type Desk } from "@/lib/desk/model";
import { useProgress, type Progress } from "@/lib/desk/progress";
import { itemDone, itemHref, itemProgress, loadLi, standing, workIn, type LiMap, type Standing } from "@/lib/desk/li";

/**
 * The mentee's path to ISO/IEC 27001 Lead Implementer, on the Certification page, from the LI sheets of
 * the Programme Workbook (scripts/build-li-map.py). Summary first, then the four views of the same
 * work: the skills, clauses 4–10, Annex A and the extensions that add an implementer's deliverable.
 * Every row is marked from the mentee's own progress; a chip opens that work on the Working Desk and
 * a clause or control opens its Standards Library page.
 *
 * The open tab, area and theme live in the URL (?li=…), so the browser's Back returns to exactly
 * this view after following a link out of it.
 */
const TABS = [
  { k: "summary", l: "Summary" },
  { k: "skills", l: "Skills" },
  { k: "clauses", l: "Clauses 4–10" },
  { k: "annex", l: "Annex A controls" },
  { k: "ext", l: "Extensions" },
] as const;
type TabKey = (typeof TABS)[number]["k"];

/** Where a library link from here says it came from, so the page can offer the way back. */
const FROM = "from=certification";

export function LeadImplementerPath({ who, onProgress }: { who: string; /** Share of all desk steps done, 0–100. */ onProgress?: (pct: number) => void }) {
  const [desk, setDesk] = useState<Desk | null>(null);
  const [li, setLi] = useState<LiMap | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    Promise.all([loadDesk(), loadLi()]).then(([d, m]) => (setDesk(d), setLi(m)), () => setFailed(true));
  }, []);
  if (failed) return <p className="border border-[#DDE1E8] bg-white px-4 py-3 text-[13.5px] text-[#5B6474]">The Lead Implementer path could not be loaded. Refresh to try again.</p>;
  if (!desk || !li) return <div className="h-64 animate-pulse rounded-md bg-slate-100" aria-busy="true" />;
  return <Path desk={desk} li={li} who={who} onProgress={onProgress} />;
}

function Path({ desk, li, who, onProgress }: { desk: Desk; li: LiMap; who: string; onProgress?: (pct: number) => void }) {
  const { progress } = useProgress(who);
  useEffect(() => {
    const steps = Object.values(desk.tasks).flatMap((t) => t.steps.map((s) => `${t.id}-${s.n}`));
    onProgress?.(Math.round((steps.filter((k) => progress.done[k]).length / steps.length) * 100));
  }, [desk, progress, onProgress]);

  // View state in the URL: replaced, not pushed, so switching tabs does not fill the history.
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const tab = (TABS.find((t) => t.k === params.get("li"))?.k ?? "summary") as TabKey;
  const view = (next: Record<string, string | number>) => {
    const q = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) q.set(k, String(v));
    router.replace(`${pathname}?${q}`, { scroll: false });
  };
  const ctx = { desk, li, p: progress, params, view };

  return (
    <section id="lead-implementer" aria-labelledby="li-path" className="scroll-mt-4 overflow-hidden rounded-md border border-[#DDE1E8] bg-white">
      <header className="flex flex-wrap items-start gap-3 border-b border-[#DDE1E8] px-5 py-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded bg-[#111827] text-white">
          <Icon name="shield" size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#4338CA]">GRC 101 prepares you for</p>
          <h2 id="li-path" className="text-[18px] font-bold tracking-[-0.01em] text-[#111827]">ISO/IEC 27001 Lead Implementer</h2>
          <p className="mt-0.5 max-w-3xl text-[13px] leading-relaxed text-[#5B6474]">
            A Lead Implementer builds and runs an organisation&apos;s information security management system to ISO/IEC 27001. GRC 101 has you practise every
            skill of that role on your two organisations. This shows which work practises each one, and how far you are.
          </p>
        </div>
      </header>

      <nav role="tablist" aria-label="Lead Implementer path" className="flex overflow-x-auto border-b border-[#DDE1E8] bg-[#F7F8FA] [scrollbar-width:none]">
        {TABS.map((t) => {
          const on = tab === t.k;
          return (
            <button
              key={t.k}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => view({ li: t.k })}
              className={`relative shrink-0 border-r border-[#E9ECF1] px-4 py-2.5 text-[13px] font-medium focus-ring ${on ? "bg-white text-[#111827]" : "text-[#5B6474] hover:bg-white/70 hover:text-[#111827]"}`}
            >
              {t.l}
              {on && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-[#4338CA]" aria-hidden />}
            </button>
          );
        })}
      </nav>

      <div role="tabpanel">
        {tab === "summary" && <Summary {...ctx} />}
        {tab === "skills" && <Skills {...ctx} />}
        {tab === "clauses" && <Clauses {...ctx} />}
        {tab === "annex" && <Annex {...ctx} />}
        {tab === "ext" && <Extensions {...ctx} />}
      </div>
    </section>
  );
}

type Ctx = { desk: Desk; li: LiMap; p: Progress; params: URLSearchParams | ReturnType<typeof useSearchParams>; view: (next: Record<string, string | number>) => void };

const STATE: Record<Standing, { l: string; cls: string }> = {
  done: { l: "Done", cls: "border-[#BBF7D0] bg-[#F0FDF4] text-[#15803D]" },
  started: { l: "In progress", cls: "border-[#C7CBF5] bg-[#EEF0FF] text-[#3730A3]" },
  open: { l: "Not started", cls: "border-[#DDE1E8] bg-[#F7F8FA] text-[#5B6474]" },
  none: { l: "Outside the desk", cls: "border-[#E9ECF1] bg-white text-[#8A91A3]" },
};
function State({ s }: { s: { state: Standing; done: number; total: number } }) {
  const x = STATE[s.state];
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-[3px] border px-1.5 py-0.5 text-[11.5px] font-semibold ${x.cls}`}>
      {x.l}
      {s.state === "started" && <span className="font-mono tabular-nums">{s.done}/{s.total}</span>}
    </span>
  );
}

/**
 * A cell as the pack writes it, with each piece of desk work in it as a chip that opens it: green
 * once done. Whatever else the cell says (test items, lab simulators, notes) stays plain text.
 */
function Work({ cell, desk, p }: { cell: string; desk: Desk; p: Progress }) {
  if (!cell || cell === "—") return <span className="text-[#C9CED8]">—</span>;
  return (
    <span className="flex flex-wrap items-center gap-1">
      {cell.split(/,\s*/).map((part, i) => {
        const id = workIn(part)[0];
        const href = id ? itemHref(desk, id) : null;
        if (!id || !href) return <span key={i} className="text-[12.5px] text-[#5B6474]">{part}</span>;
        const g = itemProgress(desk, p, id);
        const done = g.total > 0 && g.done === g.total;
        const rest = part.replace(id, "").trim();
        return (
          <span key={i} className="inline-flex flex-wrap items-center gap-1">
            <Link
              href={href}
              title={`${id}: ${g.done} of ${g.total} steps done — open on the Working Desk`}
              className={`inline-flex items-center gap-1 rounded-[3px] border px-1.5 py-0.5 font-mono text-[11.5px] font-semibold no-underline focus-ring ${
                done ? "border-[#BBF7D0] bg-[#F0FDF4] text-[#15803D]" : id.startsWith("LI-") ? "border-[#C7CBF5] bg-[#EEF0FF] text-[#3730A3] hover:bg-[#E0E3FF]" : "border-[#DDE1E8] bg-white text-[#111827] hover:bg-[#F7F8FA]"
              }`}
            >
              {done && <Icon name="check" size={11} strokeWidth={3} />}
              {id}
            </Link>
            {rest && <span className="text-[12px] text-[#5B6474]">{rest}</span>}
          </span>
        );
      })}
    </span>
  );
}

function Level({ from, to }: { from: string; to: string }) {
  return (
    <span className="whitespace-nowrap text-[12.5px]">
      <span className="text-[#8A91A3]">{from || "—"}</span> <span className="text-[#C9CED8]">→</span> <span className="font-semibold text-[#111827]">{to || "—"}</span>
    </span>
  );
}

function Bar({ n, of, bare }: { n: number; of: number; bare?: boolean }) {
  const pct = of ? Math.round((n / of) * 100) : 0;
  return (
    <span className="flex items-center gap-2">
      <span className="h-1.5 w-full min-w-[60px] overflow-hidden rounded-full bg-[#E9ECF1]">
        <span className="block h-full rounded-full bg-[#16A34A]" style={{ width: `${pct}%` }} />
      </span>
      {!bare && <span className="shrink-0 font-mono text-[12px] tabular-nums text-[#3F4757]">{n}/{of}</span>}
    </span>
  );
}

const th = "border-b border-r border-[#DDE1E8] border-r-[#E9ECF1] bg-[#F7F8FA] px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5B6474] last:border-r-0";
const td = "border-b border-r border-[#E9ECF1] px-3 py-2 align-top text-[13px] last:border-r-0";

function Table({ head, children, min = 760 }: { head: string[]; children: ReactNode; min?: number }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse" style={{ minWidth: min }}>
        <thead>
          <tr>{head.map((h) => <th key={h} className={th}>{h}</th>)}</tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function Pills<T extends string | number>({ items, on, pick, label }: { items: { k: T; l: ReactNode; title?: string }[]; on: T; pick: (k: T) => void; label: string }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-1.5 border-b border-[#DDE1E8] px-4 py-3">
      {items.map((x) => (
        <button
          key={String(x.k)}
          type="button"
          aria-pressed={x.k === on}
          title={x.title}
          onClick={() => pick(x.k)}
          className={`rounded-[3px] border px-2.5 py-1 text-[12.5px] font-medium focus-ring ${x.k === on ? "border-[#4338CA] bg-[#4338CA] text-white" : "border-[#DDE1E8] bg-white text-[#3F4757] hover:border-[#C9CED8]"}`}
        >
          {x.l}
        </button>
      ))}
    </div>
  );
}

/** The week a piece of work falls in, for "where you practise it". */
const weekOf = (desk: Desk, id: string) => (id.startsWith("LI-") ? desk.li[id]?.week : desk.tasks[id]?.week);

/** The desk work a row names, as chips with their week: green once done, each opening that work. */
function Where({ cells, desk, p }: { cells: string[]; desk: Desk; p: Progress }) {
  const ids = [...new Set(cells.flatMap(workIn))].filter((id) => itemHref(desk, id));
  if (!ids.length) return <span className="text-[12.5px] text-[#8A91A3]">{cells.filter((c) => c && c !== "—").join(" · ") || "—"}</span>;
  return (
    <span className="flex flex-wrap gap-x-2 gap-y-1">
      {ids.map((id) => (
        <span key={id} className="inline-flex items-center gap-1">
          <Work cell={id} desk={desk} p={p} />
          <span className="text-[11.5px] text-[#8A91A3]">wk {weekOf(desk, id)}</span>
        </span>
      ))}
    </span>
  );
}

const slug = (ref: string) => ref.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
/** A clause or control's Standards Library page. The library has two-level clauses: 6.1.2 opens 6.1. */
const clauseHref = (ref: string) => `/app/library/iso27001/clause-${slug(ref.split(".").slice(0, 2).join("."))}?${FROM}`;
const controlHref = (ref: string) => `/app/library/iso27001/annex-a-${slug(ref.replace(/^A\./, ""))}?${FROM}`;

function RefLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} title="Open in the Standards Library" className="whitespace-nowrap font-mono text-[12px] font-semibold text-[#3730A3] no-underline hover:underline focus-ring">
      {children}
    </Link>
  );
}

// ── Summary ──

function Summary({ desk, li, p, view }: Ctx) {
  const done = (cells: string[]) => standing(desk, p, cells).state === "done";
  const kpis: [string, number, number, TabKey][] = [
    ["Skills practised", li.statements.filter((s) => done([s.before, s.added])).length, li.statements.length, "skills"],
    ["Clauses 4–10 covered", li.clauses.filter((c) => done([c.before, c.added])).length, li.clauses.length, "clauses"],
    ["Annex A controls covered", li.controls.filter((c) => done([c.tasks, c.soa])).length, li.controls.length, "annex"],
    ["Extensions completed", li.extensions.filter((e) => itemDone(desk, p, e.id)).length, li.extensions.length, "ext"],
  ];
  return (
    <div>
      <dl className="grid grid-cols-2 border-b border-[#DDE1E8] lg:grid-cols-4">
        {kpis.map(([k, n, of, tab], i) => (
          <button
            key={k}
            type="button"
            onClick={() => view({ li: tab })}
            className={`grid gap-1.5 border-[#DDE1E8] px-4 py-3 text-left hover:bg-[#FAFAFC] focus-ring ${i % 2 === 0 ? "border-r" : "lg:border-r"} ${i < 2 ? "max-lg:border-b" : ""} last:border-r-0`}
          >
            <dt className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5B6474]">
              {k} <Icon name="chevronRight" size={13} className="text-[#8A91A3]" />
            </dt>
            <dd><Bar n={n} of={of} /></dd>
          </button>
        ))}
      </dl>
      <Table head={["Competency area", "Skills", "New to you in GRC 101", "Your progress", ""]}>
        {li.domains.map((d) => {
          const rows = li.statements.filter((s) => s.d === d.n);
          return (
            <tr key={d.n} className="hover:[&>td]:bg-[#FAFAFC]">
              <td className={`${td} font-medium text-[#111827]`}>
                <span className="mr-2 font-mono text-[12px] text-[#4338CA]">{d.n}</span>
                {d.title}
              </td>
              <td className={`${td} font-mono tabular-nums`}>{rows.length}</td>
              <td className={`${td} font-mono tabular-nums`}>{rows.filter((s) => s.change === "Gap closed").length}</td>
              <td className={`${td} w-[220px]`}><Bar n={rows.filter((s) => done([s.before, s.added])).length} of={rows.length} /></td>
              <td className={`${td} w-[1%] p-0`}>
                <button type="button" onClick={() => view({ li: "skills", area: d.n })} className="flex min-h-[38px] w-full items-center gap-1 whitespace-nowrap px-3 text-[12.5px] font-semibold text-[#3730A3] hover:bg-[#EEF0FF] focus-ring">
                  See skills <Icon name="chevronRight" size={13} />
                </button>
              </td>
            </tr>
          );
        })}
      </Table>
      <div className="grid gap-1.5 px-5 py-4 text-[12px] leading-relaxed text-[#5B6474]">
        <p>{li.intro}</p>
        <p>{li.levels}</p>
      </div>
    </div>
  );
}

// ── Skills ──

function Skills({ desk, li, p, params, view }: Ctx) {
  const area = Number(params.get("area")) || 1;
  const d = li.domains.find((x) => x.n === area) ?? li.domains[0];
  return (
    <div>
      <Pills label="Competency area" on={d.n} pick={(n) => view({ area: n })} items={li.domains.map((x) => ({ k: x.n, title: x.title, l: <><span className="font-mono">{x.n}</span> <span className="hidden sm:inline">{x.title}</span></> }))} />
      <Table head={["Skill", "Where you practise it", "Level you reach", "Status"]} min={820}>
        {li.statements.filter((s) => s.d === d.n).map((s) => (
          <tr key={s.ref}>
            <td className={`${td} min-w-[260px]`}>
              <span className="text-[#111827]">{s.text}</span>
              <span className="block text-[11.5px] text-[#8A91A3]">{s.type}</span>
            </td>
            <td className={td}><Where cells={[s.before, s.added]} desk={desk} p={p} /></td>
            <td className={td}><Level from={s.lvlBefore} to={s.lvlAfter} /></td>
            <td className={td}><State s={standing(desk, p, [s.before, s.added])} /></td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

// ── Clauses 4–10 ──

function Clauses({ desk, li, p }: Ctx) {
  return (
    <Table head={["Clause", "Title", "Where you practise it", "Level you reach", "Documented information it requires", "Status"]} min={980}>
      {li.clauses.map((c) => (
        <tr key={c.ref}>
          <td className={td}><RefLink href={clauseHref(c.ref)}>{c.ref}</RefLink></td>
          <td className={`${td} min-w-[180px] text-[#111827]`}>{c.title}</td>
          <td className={td}><Where cells={[c.before, c.added]} desk={desk} p={p} /></td>
          <td className={td}><Level from={c.lvlBefore} to={c.lvlAfter} /></td>
          <td className={`${td} text-[12.5px] text-[#3F4757]`}>{c.docs}</td>
          <td className={td}><State s={standing(desk, p, [c.before, c.added])} /></td>
        </tr>
      ))}
    </Table>
  );
}

// ── Annex A controls ──

function Annex({ desk, li, p, params, view }: Ctx) {
  const themes = [...new Set(li.controls.map((c) => c.theme))];
  const theme = themes.find((t) => t === params.get("theme")) ?? themes[0];
  return (
    <div>
      <Pills label="Theme" on={theme} pick={(t) => view({ theme: t })} items={themes.map((t) => ({ k: t, l: <>{t} <span className="font-mono opacity-70">{li.controls.filter((c) => c.theme === t).length}</span></> }))} />
      <Table head={["Control", "Title", "Where you practise it", "Technology Lab", "Depth you reach", "Status"]} min={980}>
        {li.controls.filter((c) => c.theme === theme).map((c) => (
          <tr key={c.ref}>
            <td className={td}><RefLink href={controlHref(c.ref)}>{c.ref}</RefLink></td>
            <td className={`${td} min-w-[200px] text-[#111827]`}>{c.title}</td>
            <td className={td}><Where cells={[c.tasks, c.soa]} desk={desk} p={p} /></td>
            <td className={`${td} text-[12.5px] text-[#5B6474]`}>{c.labs}</td>
            <td className={`${td} text-[12.5px] text-[#3F4757]`}>{c.depth}</td>
            <td className={td}><State s={standing(desk, p, [c.tasks, c.soa])} /></td>
          </tr>
        ))}
      </Table>
      <p className="px-5 py-3 text-[12px] text-[#5B6474]">Every control is also recorded in your Statement of Applicability, extension LI-05.</p>
    </div>
  );
}

// ── Extensions ──

function Extensions({ desk, li, p }: Ctx) {
  return (
    <div>
      <p className="border-b border-[#DDE1E8] px-5 py-3 text-[13px] text-[#3F4757]">
        An extension is a set of extra steps inside one of your tasks that produces a deliverable a Lead Implementer produces. They sit at the end of their task on the Working Desk.
      </p>
      <Table head={["Extension", "Inside task", "What you produce", "ISO/IEC 27001", "Your steps", ""]} min={980}>
        {li.extensions.map((e) => {
          const g = itemProgress(desk, p, e.id);
          const href = itemHref(desk, e.id);
          return (
            <tr key={e.id}>
              <td className={`${td} whitespace-nowrap font-mono text-[12px] font-semibold text-[#3730A3]`}>{e.id}</td>
              <td className={td}>
                <Work cell={e.task} desk={desk} p={p} />
                <span className="mt-0.5 block text-[11.5px] text-[#8A91A3]">week {e.week}</span>
              </td>
              <td className={`${td} min-w-[260px]`}>
                <span className="block font-medium text-[#111827]">{e.title}</span>
                <span className="mt-0.5 block text-[12.5px] leading-relaxed text-[#5B6474]">{e.objective}</span>
              </td>
              <td className={`${td} text-[12.5px] text-[#3F4757]`}>{e.iso}</td>
              <td className={`${td} w-[150px]`}><Bar n={g.done} of={g.total} /></td>
              <td className={`${td} w-[1%] p-0`}>
                {href && (
                  <Link href={href} className="flex min-h-[38px] items-center gap-1 whitespace-nowrap px-3 text-[12.5px] font-semibold text-[#3730A3] no-underline hover:bg-[#EEF0FF] focus-ring">
                    Open <Icon name="arrowUpRight" size={13} />
                  </Link>
                )}
              </td>
            </tr>
          );
        })}
      </Table>
    </div>
  );
}

/**
 * One ISO/IEC 27001 clause or control, as the Lead Implementer map has it — for its Standards
 * Library page. "Clause 6.1" gathers 6.1.1–6.1.3; "Annex A 5.1" is control A.5.1.
 */
export function LeadImplementerPanel({ itemRef, who }: { itemRef: string; who: string }) {
  const [desk, setDesk] = useState<Desk | null>(null);
  const [li, setLi] = useState<LiMap | null>(null);
  useEffect(() => {
    Promise.all([loadDesk(), loadLi()]).then(([d, m]) => (setDesk(d), setLi(m)), () => {});
  }, []);
  if (!desk || !li) return null;
  return <Panel desk={desk} li={li} who={who} itemRef={itemRef} />;
}

function Panel({ desk, li, who, itemRef }: { desk: Desk; li: LiMap; who: string; itemRef: string }) {
  const { progress: p } = useProgress(who);
  const clause = itemRef.match(/^Clause (\S+)$/)?.[1];
  const control = itemRef.match(/^Annex A (\S+)$/)?.[1];
  const rows: { ref: string; cells: [string, ReactNode][]; work: string[] }[] = clause
    ? li.clauses
        .filter((c) => c.ref === clause || c.ref.startsWith(`${clause}.`))
        .map((c) => ({
          ref: c.ref,
          work: [c.before, c.added],
          cells: [
            ["Level after GRC 101", <Level key="l" from={c.lvlBefore} to={c.lvlAfter} />],
            ["GRC 101 work", <Work key="w" cell={c.before} desk={desk} p={p} />],
            ["Lead Implementer extension", <Work key="a" cell={c.added} desk={desk} p={p} />],
            ["Mandatory documented information", c.docs],
          ],
        }))
    : li.controls
        .filter((c) => c.ref === `A.${control}`)
        .map((c) => ({
          ref: c.ref,
          work: [c.tasks, c.soa],
          cells: [
            ["Depth after GRC 101", c.depth],
            ["Core tasks / extensions", <Work key="w" cell={c.tasks} desk={desk} p={p} />],
            ["Statement of Applicability", <Work key="s" cell={c.soa} desk={desk} p={p} />],
            ["Technology Lab", c.labs],
          ],
        }));
  if (!rows.length) return null;
  return (
    <div className="overflow-hidden rounded-md border border-[#DDE1E8] bg-white">
      <p className="flex items-center gap-2 border-b border-[#DDE1E8] bg-[#F7F8FA] px-3 py-2">
        <Icon name="shield" size={13} className="text-[#4338CA]" />
        <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#3F4757]">Your Lead Implementer path</span>
        <Link href="/app/certification" className="ml-auto text-[12px] font-semibold text-[#3730A3] no-underline hover:underline focus-ring">
          Full map
        </Link>
      </p>
      {rows.map((r) => (
        <dl key={r.ref} className="grid gap-2 border-b border-[#E9ECF1] px-3 py-2.5 last:border-b-0">
          <div className="flex items-center justify-between gap-2">
            <dt className="font-mono text-[12px] font-semibold text-[#111827]">{r.ref}</dt>
            <dd><State s={standing(desk, p, r.work)} /></dd>
          </div>
          {r.cells.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[150px_minmax(0,1fr)] items-start gap-2 text-[12.5px]">
              <dt className="text-[#5B6474]">{k}</dt>
              <dd className="text-[#111827]">{v || "—"}</dd>
            </div>
          ))}
        </dl>
      ))}
    </div>
  );
}
