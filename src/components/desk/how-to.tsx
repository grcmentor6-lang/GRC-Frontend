"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon, type IconName } from "@/components/ui/icon";
import { useDesk } from "./desk-context";
import { Label, press } from "./ui";
import { QUESTIONS, qTitle, krActivities, krFor, splitKr, stepRefs, type QuestionKey, type Step, type Task } from "@/lib/desk/model";
import { stepKey, type Progress } from "@/lib/desk/progress";

const REF_ICON: Record<string, IconName> = { rule: "shield", page: "table", tpl: "file", ds: "grid", doc: "book", clause: "pin" };

export function isStepComplete(p: Progress, task: Task, s: Step): boolean {
  return !!p.done[stepKey(task.id, s.n)];
}

/** A decision is answered when every option slot has a pick; per-row decisions need one per row. */
export function decided(p: Progress, task: Task, s: Step): boolean {
  const pick = p.picks[stepKey(task.id, s.n)];
  if (s.kind === "pick") return typeof pick === "string";
  if (s.kind === "each") {
    const rows = task.panel.pl.r ?? [];
    return typeof pick === "object" && rows.length > 0 ? rows.every((_, i) => pick[i]) : typeof pick === "object" && Object.keys(pick).length > 0;
  }
  return true;
}

/**
 * The How-to tab: every activity as a numbered step, the current one open, the others a click
 * away. One step is open at a time: opening another closes it, and the key results follow.
 */
export function HowTo({ task, focus, onFocus, locked }: { task: Task; focus: number; onFocus: (n: number) => void; locked: boolean }) {
  const { progress } = useDesk();
  const doneCount = task.steps.filter((x) => isStepComplete(progress, task, x)).length;
  // The first step not yet done is the one to do next; it carries the UP NEXT tag.
  const next = locked ? 0 : (task.steps.find((x) => !isStepComplete(progress, task, x))?.n ?? 0);
  // Grid of the redesign: # · step · type · KR · where · chevron. Below 760px of sheet the three
  // middle columns fold into the step cell rather than scrolling sideways.
  const cols = "grid grid-cols-[44px_minmax(0,1fr)_40px] @[760px]:grid-cols-[52px_minmax(0,1fr)_96px_64px_minmax(160px,240px)_44px]";
  const cell = "border-r border-[#E9ECF1]";
  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-baseline gap-x-2.5 border-b border-[#DDE1E8] px-4 py-2.5">
        <h2 className="text-[14px] font-bold text-[#111827]">Step by step</h2>
        <span className="text-[13px] text-[#5B6474] tabular-nums">
          {task.steps.length} activities · {task.ndec} decisions · {doneCount}/{task.steps.length} complete
        </span>
      </div>
      <div
        role="row"
        className={`${cols} border-b border-[#DDE1E8] bg-[#F7F8FA] text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5B6474]`}
      >
        <span className={`${cell} py-2 text-center`}>#</span>
        <span className={`${cell} px-3.5 py-2 @[760px]:border-r`}>Step</span>
        <span className={`${cell} hidden px-3 py-2 @[760px]:block`}>Type</span>
        <span className={`${cell} hidden px-3 py-2 @[760px]:block`}>KR</span>
        <span className={`${cell} hidden px-3 py-2 @[760px]:block`}>Where</span>
        <span className="py-2" />
      </div>
      <ol>
        {task.steps.map((s) => {
          const open = s.n === focus;
          const done = isStepComplete(progress, task, s);
          const isNext = s.n === next;
          const kr = krFor(task, s.n);
          const tag = kr ? splitKr(kr.kr).tag.replace(" KR", "") : "";
          const decision = s.kind !== "do";
          return (
            <li key={s.n} id={`act-${s.n}`} className="min-w-0 scroll-mt-16 border-b border-[#E9ECF1] last:border-b-[#DDE1E8]">
              <button
                type="button"
                onClick={() => onFocus(open ? 0 : s.n)}
                aria-expanded={open}
                className={`${cols} w-full items-stretch text-left focus-ring ${
                  open || isNext ? "bg-[#F3F4FF] shadow-[inset_3px_0_0_#4338CA]" : "bg-white hover:bg-[#FAFAFC]"
                }`}
              >
                <span className={`${cell} flex items-center justify-center`}>
                  {done ? (
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-[#16A34A] text-white"><Icon name="check" size={13} strokeWidth={3} /></span>
                  ) : locked ? (
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-[#EEF0F4] text-[#8A91A3]"><Icon name="lock" size={12} /></span>
                  ) : isNext || open ? (
                    <span className="grid h-6 w-6 place-items-center rounded-full border-2 border-[#4338CA] bg-white text-[12px] font-bold text-[#4338CA] tabular-nums">{s.n}</span>
                  ) : (
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-[#EEF0F4] text-[12px] font-semibold text-[#5B6474] tabular-nums">{s.n}</span>
                  )}
                </span>
                <span className={`${cell} flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 px-3.5 py-3 ${locked ? "text-[#6B7280]" : "text-[#111827]"}`}>
                  <span className="min-w-0 text-[14px] leading-snug">
                    <span className="mr-2 font-mono text-[12px] text-[#5B6474]">{String(s.n).padStart(2, "0")}</span>
                    {s.t}
                  </span>
                  {isNext && <span className="rounded-[3px] bg-[#4338CA] px-1.5 py-0.5 text-[11px] font-semibold text-white">UP NEXT</span>}
                  {s.li && <span className="rounded-[3px] border border-[#C7CBF5] bg-[#EEF0FF] px-1.5 py-0.5 font-mono text-[11px] font-semibold text-[#3730A3]">{s.li}</span>}
                  {/* Narrow sheet: the folded columns ride along under the step. */}
                  <span className="flex w-full flex-wrap items-center gap-2 text-[12px] text-[#5B6474] @[760px]:hidden">
                    {decision && <TypeChip each={s.kind === "each"} />}
                    {tag && <span className="font-mono font-semibold text-[#3730A3]">{tag}</span>}
                    <span>{s.tool}</span>
                  </span>
                </span>
                <span className={`${cell} hidden items-center px-3 text-[13px] text-[#3F4757] @[760px]:flex`}>{decision ? <TypeChip each={s.kind === "each"} /> : "Activity"}</span>
                <span className={`${cell} hidden items-center px-3 font-mono text-[12px] font-semibold @[760px]:flex ${tag ? "text-[#3730A3]" : "text-[#8A91A3]"}`}>{tag || "—"}</span>
                <span className={`${cell} hidden items-center px-3 text-[13px] text-[#3F4757] @[760px]:flex`}>{s.tool}</span>
                <span className={`flex items-center justify-center ${isNext && !open ? "text-[#4338CA]" : "text-[#8A91A3]"}`}>
                  <Icon name={isNext && !open ? "chevronRight" : "chevronDown"} size={16} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
                </span>
              </button>
              {open && <Activity task={task} s={s} locked={locked} onNext={() => onFocus(s.n < task.steps.length ? s.n + 1 : 0)} />}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** "Decision" in the redesign's amber chip; a per-row decision says so. */
function TypeChip({ each }: { each: boolean }) {
  return (
    <span className="whitespace-nowrap rounded-[3px] border border-[#F2D29B] bg-[#FFF4DE] px-[7px] py-0.5 text-[12px] font-semibold text-[#92400E]" title={each ? "A decision for each row" : "A decision"}>
      Decision
    </span>
  );
}

function Activity({ task, s, locked, onNext }: { task: Task; s: Step; locked: boolean; onNext: () => void }) {
  const { desk, progress, update, view, openTool } = useDesk();
  // Closed until asked for: the card floats over the work area, so it should not cover it unbidden.
  const [q, setQ] = useState<QuestionKey | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Partial<Record<QuestionKey, HTMLButtonElement | null>>>({});
  // Where the card sits: under its tab, kept inside the bar, with the pointer on the tab's centre.
  const [anchor, setAnchor] = useState({ left: 0, width: 520, caret: 40 });
  useLayoutEffect(() => {
    if (!q) return;
    const place = () => {
      const bar = barRef.current;
      const tab = tabRefs.current[q];
      if (!bar || !tab) return;
      const total = bar.clientWidth;
      const width = Math.min(560, total);
      const centre = tab.offsetLeft + tab.offsetWidth / 2 - (tab.offsetParent === bar ? 0 : -((tab.offsetParent as HTMLElement | null)?.offsetLeft ?? 0));
      const left = Math.max(0, Math.min(total - width, centre - width / 2));
      setAnchor({ left, width, caret: Math.max(18, Math.min(width - 18, centre - left)) });
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [q]);
  useEffect(() => {
    if (!q) return;
    const onDown = (e: MouseEvent) => !barRef.current?.contains(e.target as Node) && setQ(null);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setQ(null);
      if ((e.target as HTMLElement).closest("input, textarea, select")) return;
      const i = QUESTIONS.findIndex((x) => x.key === q);
      if (e.key === "ArrowRight" && i < QUESTIONS.length - 1) setQ(QUESTIONS[i + 1].key);
      if (e.key === "ArrowLeft" && i > 0) setQ(QUESTIONS[i - 1].key);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [q]);
  const key = stepKey(task.id, s.n);
  const done = !!progress.done[key];
  const readOnly = locked || done || !!progress.submitted[task.id];
  const kr = krFor(task, s.n);
  // Steps naming a tool with a screen are worked in that tool's modal; the two that name none stay here.
  const inTool = !!s.key && !!desk.tp[s.key];
  const krActs = kr ? krActivities(kr.kr) : [];
  const note = desk.notes[task.id]?.find(([n]) => n === s.n)?.[2] ?? s.help;
  const rules = s.refs.rules.map((id) => [id, ...(desk.rules[id] ?? ["", ""])] as const);
  const refs = stepRefs(s);
  const qi = QUESTIONS.findIndex((x) => x.key === q);
  const cur = qi >= 0 ? QUESTIONS[qi] : null;

  const refName = (kind: string, id: string): string => {
    if (kind === "rule") return desk.rules[id]?.[0] ?? "Rule";
    if (kind === "tpl") return desk.tpls[id]?.[2] ?? "Template";
    if (kind === "doc") return desk.docs[id] ?? "Library document";
    if (kind === "clause") return desk.iso[id] ? `ISO/IEC 27001 · ${desk.iso[id]}` : "ISO/IEC 27001 clause";
    if (kind === "page") return "Reference page";
    return "Your data file";
  };
  const whereLines = (typeof task.card["Where to add"] === "string" ? task.card["Where to add"] : "")
    .split(/(?<=\.)\s+(?=[A-Z])/)
    .filter(Boolean);
  const important = task.card["Why is this important"];

  const answer: Record<QuestionKey, ReactNode> = {
    do: (
      <div className="grid gap-3">
        <p className="text-[14.5px] leading-relaxed text-slate-800">{s.w}</p>
        <p className="flex items-start gap-2.5 rounded-xl bg-emerald-50 px-3.5 py-2.5 text-[13px] text-emerald-900 ring-1 ring-inset ring-emerald-100">
          <Icon name="checkCircle" size={16} className="mt-px shrink-0 text-emerald-600" />
          <span><span className="font-semibold">Done when</span> {s.o}</span>
        </p>
      </div>
    ),
    how: (
      <figure className="grid gap-3">
        <blockquote className="rounded-xl bg-slate-50 px-4 py-3.5 text-[14px] leading-relaxed text-slate-800 ring-1 ring-inset ring-slate-200">{note}</blockquote>
        <figcaption className="flex items-center gap-2 text-[12.5px] text-slate-500">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-indigo-100 text-[10px] font-semibold text-indigo-700">
            {task.owner.split(/\s+/).filter((w) => /^[A-Z]/.test(w)).slice(0, 2).map((w) => w[0]).join("")}
          </span>
          In simpler words, from the {task.owner}
        </figcaption>
      </figure>
    ),
    why: kr ? (
      <div className="grid gap-3">
        <p className="text-[14.5px] leading-relaxed text-slate-800">
          <span className="mr-2 rounded-md bg-indigo-50 px-1.5 py-0.5 text-[12px] font-semibold text-indigo-700">{splitKr(kr.kr).tag}</span>
          {splitKr(kr.kr).text}
        </p>
        <div className="grid gap-1.5">
          <div className="flex gap-1">
            {krActs.map((a) => (
              <span
                key={a}
                className={`h-1.5 flex-1 rounded-full ${progress.done[stepKey(task.id, a)] ? "bg-emerald-500" : a === s.n ? "bg-indigo-500" : "bg-slate-200"}`}
              />
            ))}
          </div>
          <p className="text-[12.5px] text-slate-500">This is activity {krActs.indexOf(s.n) + 1} of {krActs.length} in {splitKr(kr.kr).tag}.</p>
        </div>
      </div>
    ) : <p className="text-[14.5px] leading-relaxed text-slate-800">It serves the task objective: {task.obj}</p>,
    where: (
      <div className="grid gap-3">
        <button
          type="button"
          onClick={() => (desk.tp[s.key] ? openTool(s.key) : view({ kind: "panel", id: task.id }))}
          className={`group flex items-center gap-3 rounded-xl bg-indigo-50/70 p-3 text-left ring-1 ring-inset ring-indigo-100 hover:bg-indigo-50 hover:ring-indigo-200 ${press}`}
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white text-indigo-600 shadow-sm ring-1 ring-indigo-100"><Icon name="grid" size={18} /></span>
          <span className="min-w-0 flex-1">
            <span className="block text-[12px] text-indigo-700">Platform tool</span>
            <span className="block truncate text-[14px] font-semibold text-slate-900">{s.tool}</span>
          </span>
          <span className="flex items-center gap-1 text-[12.5px] font-medium text-indigo-700">Open<Icon name="arrowUpRight" size={14} className="transition-transform duration-150 group-hover:-translate-y-px group-hover:translate-x-px" /></span>
        </button>
        {whereLines.length > 0 && (
          <ul className="grid gap-1.5 text-[13px] leading-relaxed text-slate-600">
            {whereLines.map((l) => (
              <li key={l} className="flex gap-2"><Icon name="folder" size={14} className="mt-1 shrink-0 text-slate-400" />{l}</li>
            ))}
          </ul>
        )}
      </div>
    ),
    read: refs.length ? (
      <ul className="grid gap-1.5">
        {refs.map((r) => (
          <li key={r.kind + r.id}>
            <button
              type="button"
              onClick={() => view(r)}
              className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left ring-1 ring-inset ring-slate-200 hover:bg-slate-50 hover:ring-slate-300 ${press}`}
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600"><Icon name={REF_ICON[r.kind]} size={15} /></span>
              <span className="min-w-0 flex-1">
                <span className="block font-mono text-[12px] font-medium text-slate-900">{r.id}</span>
                <span className="block truncate text-[12.5px] text-slate-500">{refName(r.kind, r.id)}</span>
              </span>
              <Icon name="chevronRight" size={15} className="text-slate-300 transition-colors group-hover:text-slate-500" />
            </button>
          </li>
        ))}
      </ul>
    ) : <p className="text-[14px] text-slate-600">Nothing extra to read. The instruction is complete on its own.</p>,
    deliver: (
      <div className="grid gap-3">
        <div className="grid gap-1">
          <p className="text-[12.5px] font-medium text-slate-500">This activity produces</p>
          <p className="text-[14.5px] leading-relaxed text-slate-800">{s.o}</p>
        </div>
        <div className="grid gap-1.5">
          <p className="text-[12.5px] font-medium text-slate-500">It goes into</p>
          <div className="flex flex-wrap gap-1.5">
            {task.subs.map((x) => (
              <span key={x.code} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-[12.5px] text-slate-700 ring-1 ring-inset ring-slate-200">
                <span className="font-mono text-[11.5px] font-semibold text-slate-900">{x.code}</span>
                {x.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    ),
    learn: rules.length ? (
      <div className="grid gap-2">
        {rules.map(([id, name, text]) => (
          <div key={id} className="grid gap-1 rounded-xl bg-slate-50 p-3.5 ring-1 ring-inset ring-slate-200">
            <button type="button" onClick={() => view({ kind: "rule", id })} className="w-fit text-left text-[13.5px] font-semibold text-indigo-700 hover:underline">
              {id} · {name}
            </button>
            <p className="text-[13.5px] leading-relaxed text-slate-700">{text}</p>
          </div>
        ))}
      </div>
    ) : <p className="text-[14px] leading-relaxed text-slate-700">{s.why ?? "No rule for this activity. Follow the instruction exactly."}</p>,
    impact: (
      <div className="grid gap-3">
        {kr ? <KrProgress task={task} kr={kr.kr} /> : <p className="text-[14px] text-slate-700">Counts toward the task objective.</p>}
        {typeof important === "string" && (
          <p className="rounded-xl bg-amber-50/70 px-3.5 py-3 text-[13px] leading-relaxed text-amber-950 ring-1 ring-inset ring-amber-100">{important}</p>
        )}
      </div>
    ),
  };

  const markDone = () => {
    update((p) => ({ ...p, done: { ...p.done, [key]: true } }));
    onNext();
  };

  return (
    <div className="border-t border-[#E9ECF1] bg-white px-4 pb-4 pt-3">
      {/* The activity bar: the eight questions, answered for this activity. A tab opens its card
          beneath; the card closes with x and walks on to the next question. */}
      <div ref={barRef} className="relative">
      <div role="tablist" aria-label="About this activity" className="flex overflow-x-auto rounded border border-[#DDE1E8] bg-[#F7F8FA] [scrollbar-width:none]">
        {QUESTIONS.map((x, i) => {
          const on = q === x.key;
          return (
            <button
              key={x.key}
              ref={(el) => {
                tabRefs.current[x.key] = el;
              }}
              role="tab"
              type="button"
              aria-selected={on}
              onClick={() => setQ(on ? null : x.key)}
              title={`${i + 1}. ${qTitle(x)}`}
              className={`group relative flex h-9 min-w-[84px] flex-1 items-center justify-center gap-1.5 border-r border-[#E9ECF1] px-2.5 text-[12.5px] font-medium last:border-r-0 ${press} ${
                on ? "text-slate-900" : "text-slate-600 hover:bg-white/60 hover:text-slate-900"
              }`}
            >
              {on && <motion.span layoutId={`qbar-${key}`} className="absolute inset-0 bg-white shadow-[inset_0_-2px_0_#4338CA]" transition={{ type: "spring", duration: 0.3, bounce: 0.12 }} />}
              <Icon name={x.icon} size={16} strokeWidth={1.7} className={`relative shrink-0 transition-colors duration-150 ${on ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"}`} />
              <span className="relative">{x.label}</span>
            </button>
          );
        })}
      </div>
      <AnimatePresence>
        {cur && (
          // The pointer is drawn beside the card, not inside it, so the card's own entrance
          // transform never moves it off the tab it points at.
          <motion.svg
            key="caret"
            aria-hidden
            width="20"
            height="10"
            viewBox="0 0 20 10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, x: anchor.left + anchor.caret - 10 }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            transition={{ type: "spring", duration: 0.32, bounce: 0.1 }}
            className="pointer-events-none absolute left-0 top-[calc(100%+3px)] z-40 overflow-visible"
          >
            <path d="M0 10 L10 0.8 L20 10" className="fill-white stroke-slate-200" strokeWidth="1" />
            <path d="M0.8 10.6 H19.2" className="stroke-white" strokeWidth="1.6" />
          </motion.svg>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {cur && (
          <motion.section
            role="tabpanel"
            aria-label={qTitle(cur)}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1, x: anchor.left }}
            exit={{ opacity: 0, y: -4, scale: 0.98, transition: { duration: 0.12 } }}
            transition={{ type: "spring", duration: 0.32, bounce: 0.1 }}
            style={{ width: anchor.width, transformOrigin: `${anchor.caret}px top` }}
            className="absolute left-0 top-[calc(100%+12px)] z-30 rounded-2xl bg-white shadow-[0_24px_56px_-18px_rgba(15,23,42,0.38),0_2px_6px_rgba(15,23,42,0.06)] ring-1 ring-slate-200/90"
          >
            <header className="flex items-center gap-3 px-5 pb-3 pt-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-600 text-white shadow-[0_6px_14px_-6px_rgba(79,70,229,0.7)]">
                <Icon name={cur.icon} size={20} strokeWidth={1.7} />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-[15.5px] font-semibold leading-tight text-slate-900">{qTitle(cur)}</h3>
                <p className="mt-0.5 text-[12px] text-slate-500 tabular-nums">Step {s.n} · question {qi + 1} of {QUESTIONS.length}</p>
              </div>
              <button type="button" onClick={() => setQ(null)} aria-label="Close card" className={`grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 ${press}`}>
                <Icon name="x" size={16} />
              </button>
            </header>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={cur.key}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.08 } }}
                transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                className="max-h-[min(46vh,420px)] overflow-y-auto px-5 pb-4"
              >
                {answer[cur.key]}
              </motion.div>
            </AnimatePresence>
            <footer className="flex items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
              <button
                type="button"
                disabled={qi === 0}
                onClick={() => setQ(QUESTIONS[qi - 1].key)}
                className={`inline-flex h-8 items-center gap-1 rounded-lg px-2.5 text-[12.5px] font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:invisible ${press}`}
              >
                <Icon name="arrowLeft" size={14} />
                {qi > 0 && QUESTIONS[qi - 1].label}
              </button>
              <div className="flex items-center gap-1.5" aria-label="Questions">
                {QUESTIONS.map((x, i) => (
                  <button
                    key={x.key}
                    type="button"
                    onClick={() => setQ(x.key)}
                    aria-label={qTitle(x)}
                    aria-current={i === qi ? "true" : undefined}
                    className={`h-1.5 rounded-full transition-[width,background-color] duration-200 ${i === qi ? "w-5 bg-indigo-600" : "w-1.5 bg-slate-300 hover:bg-slate-400"}`}
                  />
                ))}
              </div>
              <button
                type="button"
                disabled={qi === QUESTIONS.length - 1}
                onClick={() => setQ(QUESTIONS[qi + 1].key)}
                className={`inline-flex h-8 items-center gap-1 rounded-lg bg-slate-900 px-3 text-[12.5px] font-semibold text-white hover:bg-slate-800 disabled:invisible ${press}`}
              >
                {qi < QUESTIONS.length - 1 && QUESTIONS[qi + 1].label}
                <Icon name="arrowRight" size={14} />
              </button>
            </footer>
          </motion.section>
        )}
      </AnimatePresence>
      </div>


      {inTool ? (
        // The work happens in the platform tool the step names: the step guides, the tool is where.
        <div className="mt-3 flex flex-wrap items-center gap-3 rounded border border-[#DDE1E8] bg-[#F7F8FA] p-3">
          <span className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded border border-[#E3E6EC] bg-white text-[#3F4757]">
            <Icon name="grid" size={15} />
          </span>
          <span className="min-w-[11rem] flex-1">
            <span className="block text-[12px] text-indigo-700">{done ? "Done in" : "Do this step in"}</span>
            <span className="block text-[14px] font-semibold text-slate-900">{s.tool}</span>
            <span className="block text-[12px] text-slate-500">Done when: {s.o}</span>
          </span>
          {done ? (
            <span className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-emerald-700"><Icon name="checkCircle" size={16} />Complete</span>
              <button type="button" onClick={() => openTool(s.key)} className={`h-9 rounded-lg px-3 text-[13px] font-medium text-indigo-700 ring-1 ring-inset ring-indigo-200 hover:bg-white ${press}`}>
                Review
              </button>
            </span>
          ) : (
            <button
              type="button"
              disabled={locked}
              onClick={() => openTool(s.key)}
              className={`inline-flex h-9 items-center gap-1.5 rounded bg-[#4338CA] px-4 text-[13px] font-semibold text-white hover:brightness-90 disabled:cursor-not-allowed disabled:bg-[#E3E6EC] disabled:text-[#8A91A3] ${press}`}
            >
              Open {s.tool.split("›").pop()?.trim()} <Icon name="arrowUpRight" size={14} />
            </button>
          )}
        </div>
      ) : (
        <>
          <Work task={task} s={s} readOnly={readOnly} />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[12.5px] text-slate-500">
              <span className="font-medium text-slate-700">Done when:</span> {s.o}
            </p>
            {done ? (
              <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-emerald-700"><Icon name="checkCircle" size={16} />Complete</span>
            ) : (
              <button
                type="button"
                disabled={readOnly || !decided(progress, task, s)}
                onClick={markDone}
                className={`rounded-lg bg-indigo-600 px-4 py-2 text-[13px] font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 ${press}`}
              >
                Mark activity complete
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/** Where the mentee does the activity. File uploads replace the typed box in Phase 3. */
export function Work({ task, s, readOnly }: { task: Task; s: Step; readOnly: boolean }) {
  const { progress, update } = useDesk();
  const key = stepKey(task.id, s.n);
  const pick = progress.picks[key];
  const setPick = (v: string | Record<string, string>) => update((p) => ({ ...p, picks: { ...p.picks, [key]: v } }));

  if (s.kind === "pick" && s.opt)
    return (
      <fieldset className="mt-4 grid gap-2" disabled={readOnly}>
        <legend className="mb-2"><Label>Your decision</Label></legend>
        {s.opt.map((o, i) => {
          const letter = String.fromCharCode(65 + i);
          const on = pick === letter;
          return (
            <label key={o} className={`flex cursor-pointer items-start gap-3 rounded border px-3 py-2.5 text-[14px] ${on ? "border-[#4338CA] bg-[#F3F4FF]" : "border-[#DDE1E8] hover:border-[#C9CED8] hover:bg-[#FAFAFC]"}`}>
              <input type="radio" name={key} checked={on} onChange={() => setPick(letter)} className="mt-0.5 accent-indigo-600" />
              <span><span className="mr-1.5 font-semibold text-slate-500">{letter}</span>{o}</span>
            </label>
          );
        })}
        <p className="text-[12px] text-slate-500">The best option and its reason appear after the task is reviewed.</p>
      </fieldset>
    );

  if (s.kind === "each" && s.opt) {
    const rows = task.panel.pl.r ?? [];
    const picks = typeof pick === "object" ? pick : {};
    return (
      <fieldset className="mt-4 grid gap-2" disabled={readOnly}>
        <legend className="mb-2"><Label>Your decision for each row</Label></legend>
        {(rows.length ? rows : [["All rows"]]).map((r, i) => (
          <label key={i} className="grid grid-cols-[minmax(0,1fr)_minmax(140px,220px)] items-center gap-3 rounded border border-[#DDE1E8] px-3 py-2 text-[13px]">
            <span className="min-w-0 truncate text-slate-700"><span className="font-medium">{r[0]}</span>{r[1] ? ` · ${r[1]}` : ""}</span>
            <select
              value={picks[i] ?? ""}
              onChange={(e) => setPick({ ...picks, [i]: e.target.value })}
              className="rounded border border-[#C9CED8] bg-white px-2 py-1.5 text-[13px] focus-ring"
            >
              <option value="" disabled>Choose…</option>
              {s.opt!.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
        ))}
      </fieldset>
    );
  }

  return (
    <div className="mt-4 grid gap-1.5">
      <label htmlFor={`w-${key}`}><Label>Your work</Label></label>
      <textarea
        id={`w-${key}`}
        rows={3}
        readOnly={readOnly}
        value={progress.answers[key] ?? ""}
        onChange={(e) => update((p) => ({ ...p, answers: { ...p.answers, [key]: e.target.value } }))}
        placeholder="Type what you found or did: the values you copied, the row you used, the reference you followed."
        className="w-full resize-y rounded border border-[#C9CED8] bg-white px-3 py-2.5 text-[14px] leading-[1.5] text-[#111827] placeholder:text-[#8A91A3] focus:border-[#4338CA] focus:outline-none focus:ring-2 focus:ring-[#4338CA]/15"
      />
    </div>
  );
}

export function KrProgress({ task, kr }: { task: Task; kr: string }) {
  const { progress } = useDesk();
  const acts = krActivities(kr);
  const n = acts.filter((a) => progress.done[stepKey(task.id, a)]).length;
  const { tag, text } = splitKr(kr);
  return (
    <div className="grid gap-2">
      <p><span className="font-medium">{tag}.</span> {text}</p>
      <div className="flex items-center gap-3">
        <div className="h-1.5 flex-1 rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-emerald-500 transition-[width] duration-300 ease-out" style={{ width: `${acts.length ? (n / acts.length) * 100 : 0}%` }} />
        </div>
        <span className="text-[12px] text-slate-500 tabular-nums">{n} / {acts.length} activities</span>
      </div>
    </div>
  );
}
