"use client";

import { Icon } from "@/components/ui/icon";
import { type Desk, type Step, type Task } from "@/lib/desk/model";
import { QUICK_REF, stepSourceList } from "@/lib/desk/step-sources";
import { useDesk, type ViewItem } from "./desk-context";

/**
 * "Read first": the source a decision tests, named, before its options (UX101 W3, C-01).
 * It names the rule or document section; it never says what the rule requires. An Inbox message's sources are parsed
 * from its guidance line. A step's are the audit's list joined with its own `refs` (UX101 W4, C-05: lib/desk/
 * step-sources.ts); the same card, headed "Sources for this step", sits on every step that is not a decision.
 * Every source is plain text naming the place (desk method rule 3, 27 Nov 2026): the learner opens it from the toolbar,
 * whose orange dot marks it. `open`, `view` and `href` stay on the item only to say where it lives.
 */
type Item = { name: string; id: string; where?: string; view?: ViewItem; open?: { key: string; find?: (win: HTMLElement) => HTMLElement | null }; href?: string };

function name(desk: Desk, kind: string, id: string): string {
  if (kind === "rule") return desk.rules[id]?.[0] ?? "Rule";
  if (kind === "doc") {
    const [doc, secs] = id.split("#");
    return `${desk.docs[doc] ?? "Library document"}${secs ? ` · ${secs.split(",").map((x) => (/^\d/.test(x) ? `Section ${x}` : x)).join(", ")}` : ""}`;
  }
  if (kind === "clause") return desk.iso[id] ? `ISO/IEC 27001 · ${desk.iso[id]}` : "ISO/IEC 27001 clause";
  if (kind === "ds") return "Dataset";
  return "Reference page";
}

const WHERE: Record<string, string> = { doc: "Policies › Policy Library", rule: "Learn › Rule tables", page: "Learn › Reference pages" };
const toItem = (desk: Desk, kind: string, id: string): Item => ({ where: WHERE[kind], view: { kind, id } as ViewItem, id: id.split("#")[0], name: name(desk, kind, id) });

const bySec = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true });
const toolName = (desk: Desk, key: string) => `${desk.sections[key.split("|")[0]]?.t ?? key.split("|")[0]} › ${key.split("|")[1]}`;
const cellIs = (text: string) => (win: HTMLElement) => [...win.querySelectorAll<HTMLElement>("td:first-child")].find((td) => td.textContent?.trim() === text)?.closest<HTMLElement>("tr") ?? null;
const para = (start: string) => (win: HTMLElement) => [...win.querySelectorAll<HTMLElement>("p")].find((el) => el.textContent?.trim().startsWith(start)) ?? null;
const entry = (term: string) => (win: HTMLElement) => [...win.querySelectorAll<HTMLElement>("[data-term]")].find((el) => el.dataset.term === term) ?? null;

/** Everything a step reads, in the order to read it: documents, rules, pages, screens, data, then what is already to hand. */
export function stepSourceItems(desk: Desk, s: Step, task?: Task): Item[] {
  const t = task ?? desk.order.map((id) => desk.tasks[id]).find((x) => x.steps.includes(s));
  if (!t) return [];
  const quick = new Set((desk.tp[QUICK_REF]?.pl as { p?: string[] } | undefined)?.p?.map((p) => p.match(/^<b>(.*?)<\/b>/)?.[1] ?? "") ?? []);
  const out: Item[] = [];
  for (const x of stepSourceList(t, s.n)) {
    if (x.k === "doc") {
      const secs = [...x.secs].sort(bySec);
      out.push({ where: WHERE.doc, id: x.id, name: name(desk, "doc", secs.length ? `${x.id}#${secs.join(",")}` : x.id), open: { key: `doc|${x.id}`, find: x.spot ? para(x.spot) : secs.length ? (win) => win.querySelector<HTMLElement>(`[data-sec="${secs[0]}"]`) : undefined } });
    } else if (x.k === "rule") out.push({ where: WHERE.rule, id: x.id, name: `Rule · ${desk.rules[x.id]?.[0] ?? ""}`, open: { key: "learn|Rule tables", find: cellIs(x.id) } });
    // A sprint step reads seven or more LI task pages: their codes alone, so the card stays a few lines tall.
    else if (x.k === "page") out.push({ where: WHERE.page, id: x.id, name: x.id.startsWith("LI-A.") ? "" : "Reference page", open: { key: `page|${x.id}` } });
    else if (x.k === "ds") out.push({ id: x.id, name: "Dataset", view: { kind: "ds", id: x.id } });
    else if (x.k === "lib") out.push({ id: "Standards Library", name: "ISO/IEC 27001, clause by clause", href: `/app/library/${x.id}?task=${encodeURIComponent(t.id)}` });
    else if (x.k === "tool") {
      // The screen a table step is worked in is already open: only a decision, answered in its row, opens it to read.
      if (x.id !== s.key?.split("#")[0] || s.kind === "pick") out.push({ id: x.find ?? x.id.split("|")[1], name: toolName(desk, x.id), open: { key: x.id, find: x.find ? entry(x.find) : undefined } });
    } else if (x.k === "own") out.push({ id: x.id, name: `Your own work · ${x.task} step ${x.step}, in 02_Working` });
    else if (x.k === "sheet") out.push({ id: "This screen", name: s.kind === "pick" ? "The situation and the options" : "The table or file this step is worked in" });
  }
  // A clause the step cites: its summary in the Quick Reference, where the list has one and the step does not name it yet.
  for (const c of s.refs.clauses) {
    const term = `ISO/IEC 27001 Clause ${c}`;
    if (quick.has(term) && !out.some((o) => o.id === term)) out.push({ id: term, name: toolName(desk, QUICK_REF), open: { key: QUICK_REF, find: entry(term) } });
  }
  // The Quick Reference by itself says nothing once one of its entries is named. What opens comes first; what is already to hand, last.
  const list = out.some((o) => o.open?.key === QUICK_REF && o.open.find) ? out.filter((o) => !(o.open?.key === QUICK_REF && !o.open.find)) : out;
  const rank = (o: Item) => (o.open ? 0 : o.href ? 1 : o.view ? 2 : 3);
  return list.map((o, i) => [o, i] as const).sort((a, b) => rank(a[0]) - rank(b[0]) || a[1] - b[1]).map(([o]) => o);
}

/** An Inbox guidance line ("Clause 4.2 c); your CTX-IP", "SITL-POL-010 Sections 7.1 and 10") as sources that exist. */
export function messageSourceItems(desk: Desk, ref: string): Item[] {
  const out: Item[] = [];
  const clause = (c: string) => {
    let id = c.replace(/[^\d.A]/g, "").replace(/\.$/, "");
    while (id && !desk.iso[id]) id = id.includes(".") ? id.slice(0, id.lastIndexOf(".")) : "";
    if (id && !out.some((o) => o.id === id)) out.push(toItem(desk, "clause", id));
  };
  if (/^Your data rules/.test(ref)) return [toItem(desk, "doc", "SITL-POL-024#3.1")];
  for (const part of ref.split(";").map((x) => x.trim())) {
    let m: RegExpMatchArray | null;
    if ((m = part.match(/^Rules? ([RL]\d+)/)) && desk.rules[m[1]]) out.push(toItem(desk, "rule", m[1]));
    else if ((m = part.match(/^(SITL-[A-Z]+-\d+)(?: Sections? (.+))?$/)) && desk.docs[m[1]]) {
      const secs = (m[2] ?? "").split(/\s+and\s+|,\s*/).map((x) => x.trim()).filter(Boolean);
      out.push(toItem(desk, "doc", secs.length ? `${m[1]}#${secs.join(",")}` : m[1]));
    } else if ((m = part.match(/^Clauses? (.+?)(?: [a-z]\))?$/))) m[1].split(/\s+and\s+/).forEach(clause);
    else if (/^A\.\d+\.\d+/.test(part)) clause(part.split(/[ ;]/)[0]);
    else if (/^(LI-A\.|Ref-)/.test(part) && desk.pages[part]) out.push(toItem(desk, "page", part));
    else if (desk.ds[part]) out.push(toItem(desk, "ds", part));
  }
  return out;
}

export function ReadFirst({ items, className = "", title = "Read first", lead = "What this decision tests is set out here. Find it from the toolbar before you choose." }: { items: Item[]; className?: string; title?: string; lead?: string }) {
  if (!items.length) return null;
  // Plain text, never a link or a button (desk method rule 3): the learner opens each place from the toolbar, whose orange dot points at it.
  const box = "inline-flex min-h-8 max-w-full flex-wrap items-center gap-x-2 rounded border border-[#DDE1E8] bg-white px-2.5 py-1 text-left text-[12.5px]";
  return (
    <section data-guide="read-first" aria-label={title} className={`rounded border border-[#E7D9A8] border-t-[3px] border-t-[#B7791F] bg-[#FFFCF2] px-3.5 py-3 ${className}`}>
      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7A4F0B]">{title}</p>
      {lead && <p className="mt-0.5 text-[13px] leading-snug text-[#5B6474]">{lead}</p>}
      <ul className="mt-2 flex flex-wrap gap-2">
        {items.map((it) => (
          <li key={it.name + it.id} data-source={it.id} className="max-w-full">
            <span className={box}>
              <Icon name="book" size={13} className="shrink-0 text-[#7A4F0B]" />
              {it.where && <span className="text-[#5B6474]">{it.where} ›</span>}
              <span className={`font-mono font-semibold text-[#111827] ${/\s/.test(it.id) ? "" : "whitespace-nowrap"}`}>{it.id}</span>
              {it.name && <span className="text-[#5B6474]">{it.name}</span>}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** A decision step's own card ("Read first"), or any other step's ("Sources for this step"). */
export function StepReadFirst({ s, className, sources }: { s: Step; className?: string; /** Not a decision still to take: headed as the step's sources. */ sources?: boolean }) {
  const { desk } = useDesk();
  const items = stepSourceItems(desk, s);
  return sources ? (
    <ReadFirst items={items} className={className} title="Sources for this step" lead="Where this step's facts and rules are. Open each from the toolbar, where the orange dot marks it." />
  ) : (
    <ReadFirst items={items} className={className} />
  );
}
