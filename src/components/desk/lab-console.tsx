"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { api } from "@/lib/api";
import { useAuth } from "@/components/auth/auth-provider";
import { GuidedTour, markTourSeen, useTourOnce, type TourStep } from "@/components/app/guided-tour";
import { useDesk } from "./desk-context";
import { FloatWindow } from "./float-window";
import { allCaptures, labFindings, partRows, type Lab, type LabCapture, type LabPart, type LabRef, type LabRow, type LabState } from "@/lib/desk/labs";

const BLANK = "(blank)";
const NONE: LabState = { parts: {} };
const $ = (sel: string) => document.querySelector<HTMLElement>(sel);
const utcNow = () => `${new Date().toISOString().slice(0, 16).replace("T", " ")} UTC`;

async function sha256(text: string) {
  if (!crypto.subtle) return "";
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
}

const partDone = (part: LabPart, s: LabState) => (part.kind === "capture" ? s.parts[part.id]?.correct === true : !!s.parts[part.id]?.rows);

/**
 * The Tech Lab's one console: any simulator's screens as views with filters and Search, Capture evidence, and the
 * lab's questions beside them, one at a time. Everything specific to a lab is its data (lib/desk/labs.ts).
 * A capture records the rows the filters left, so finding the defect IS the answer; the server compares them.
 */
export function LabWindow({ lab: ref, index, onClose }: { lab: LabRef; index: number; onClose: () => void }) {
  const { desk, progress, update } = useDesk();
  const { user } = useAuth();
  const [lab, setLab] = useState<Lab | null>(null);
  const [failed, setFailed] = useState(false);
  const [viewKey, setViewKey] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [q, setQ] = useState("");
  const [guideAt, setGuideAt] = useState(-1);

  useEffect(() => {
    fetch(`/desk/labs/${ref.id}.json`, { cache: "no-cache" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((l: Lab) => {
        setLab(l);
        setViewKey(l.views[0].key);
      })
      .catch(() => setFailed(true));
  }, [ref.id]);

  const view = lab?.views.find((v) => v.key === viewKey);
  const shown = useMemo(() => {
    if (!view) return [];
    const needle = q.trim().toLowerCase();
    return view.rows.filter((r) => view.filters.every((c) => {
      const f = filters[c];
      return !f || (r[view.cols.indexOf(c)] || BLANK) === f;
    }) && (!needle || r.some((x) => x.toLowerCase().includes(needle))));
  }, [view, filters, q]);
  const filterText = view ? [...view.filters.filter((c) => filters[c]).map((c) => `${c} = ${filters[c]}`), ...(q.trim() ? [`Search “${q.trim()}”`] : [])].join("; ") || "No filter" : "";

  const captures = allCaptures(progress);
  const mine = captures.filter((c) => c.lab === ref.id);
  const state = progress.labs?.[ref.id] ?? NONE;
  const setState = useCallback((fn: (s: LabState) => LabState) => update((p) => ({ ...p, labs: { ...p.labs, [ref.id]: fn(p.labs?.[ref.id] ?? NONE) } })), [ref.id, update]);

  const capture = async () => {
    if (!view) return;
    const ids = shown.map((r) => r[0]);
    const utc = utcNow();
    const sha = await sha256(JSON.stringify([ref.id, view.key, filterText, ids, utc, desk.mentee]));
    update((p) => {
      const all = p.labCaptures ?? [];
      const c: LabCapture = { ref: `E${all.length + 1}`, lab: ref.id, view: view.key, viewTitle: view.title, filter: filterText, ids, utc, sha };
      return { ...p, labCaptures: [...all, c] };
    });
  };
  const clear = () => {
    setFilters({});
    setQ("");
  };

  // The guide practises on a harmless filter, so it never shows an answer.
  const live = useRef({ filters, count: mine.length });
  useEffect(() => {
    live.current = { filters, count: mine.length };
  }, [filters, mine.length]);
  const startCount = useRef(0);
  const guide: TourStep[] = useMemo(() => {
    if (!lab) return [];
    const g = lab.guide;
    return [
      { title: "What you will do", body: `${lab.atWork} Here you filter the console, capture what it shows and answer one question at a time.`, getEl: () => $('[data-lab="task"]') },
      { title: "The console's screens", body: "These tabs are the application's own screens. The question on the right says which one to read.", getEl: () => $('[data-lab="tabs"]') },
      { title: "Try a filter", body: `Practice first: set ${g.col} to ${g.value}. The table keeps only the rows that match.`, getEl: () => $(`[data-lab-filter="${g.col}"]`), nextWhen: () => live.current.filters[g.col] === g.value, doIt: `Set ${g.col} to ${g.value}` },
      { title: "Capture evidence", body: "Press Capture evidence. It records this screen, the filters and exactly the rows left in the table, with the UTC time.", getEl: () => $('[data-lab="capture"]'), onEnter: () => { startCount.current = live.current.count; }, waitFor: () => live.current.count > startCount.current, doIt: "Press Capture evidence" },
      { title: "Your evidence ref", body: "This is the reference a colleague can rely on: E-number, screen, filter, rows, UTC time and a SHA-256. This one was practice, so it answers no question. Evidence › Capture Screenshot keeps every capture.", getEl: () => $('[data-lab="trail"]') },
      { title: "Now the questions", body: "Each question asks for a capture holding exactly the right rows. Clear filters, find them, capture, then choose the capture here. Replay any time with ▶ Show me how.", getEl: () => $('[data-lab="guide"]') },
    ];
  }, [lab]);
  const base = `grc101.guide.lab.${ref.id}`;
  const startGuide = useCallback(() => setGuideAt(0), []);
  useTourOnce(base, user?.email, !!lab, startGuide, 700);

  const current = lab?.parts.find((p) => !partDone(p, state));
  const findings = labFindings(progress, ref.id);

  return (
    <FloatWindow
      tall
      title={`${lab?.sim ?? "Tech Lab"} · ${lab?.title ?? ""}`}
      eyebrow={lab ? `Systems · Tech Lab · ${lab.product} · ${lab.org}` : "Systems · Tech Lab"}
      leading={<span className="grid h-7 w-7 place-items-center rounded bg-[#111827] text-white"><Icon name="grid" size={14} /></span>}
      onClose={onClose}
      index={index}
      width={1240}
      left="max(12px, calc((100vw / var(--app-zoom) - 1240px) / 2))"
    >
      {!lab ? (
        <p className="p-4 text-[13.5px] text-[#5B6474]">{failed ? "The console could not load. Close it and open it again." : "Opening the console…"}</p>
      ) : (
        <div className="flex min-h-full flex-col min-[900px]:h-full min-[900px]:flex-row">
          <aside data-lab="task" className="order-1 flex shrink-0 flex-col gap-3 border-b border-[#DDE1E8] bg-[#F7F8FA] p-3 min-[900px]:order-2 min-[900px]:w-[372px] min-[900px]:overflow-y-auto min-[900px]:border-b-0 min-[900px]:border-l">
            <Brief lab={lab} onGuide={startGuide} />
            {lab.parts.map((p, i) =>
              partDone(p, state) ? <DonePart key={p.id} n={i + 1} part={p} state={state} captures={captures} open={lab.parts[i + 1] === current} /> : p === current ? <Part key={p.id} n={i + 1} part={p} state={state} setState={setState} labId={ref.id} captures={mine} total={lab.parts.length} /> : null,
            )}
            {!current && (
              <section data-lab="findings" className="grid gap-2 rounded border border-[#BBF7D0] bg-white p-3 text-[13px]">
                <p className="font-semibold text-[#111827]">Findings for the memo</p>
                <ul className="grid list-disc gap-1.5 pl-4 leading-relaxed text-[#3F4757]">{findings.map((f) => <li key={f}>{f}</li>)}</ul>
                {state.done ? (
                  <p className="text-[12.5px] text-[#15803D]">Complete. These lines are in UAR-MEMO, row Tenant check.</p>
                ) : (
                  <button type="button" onClick={() => setState((s) => ({ ...s, done: new Date().toISOString() }))} className="h-9 rounded bg-[#111827] px-4 text-[13px] font-semibold text-white hover:brightness-110">Mark complete</button>
                )}
              </section>
            )}
            <section data-lab="trail" className="rounded border border-[#DDE1E8] bg-white p-3">
              <p className="text-[12px] font-semibold text-[#3F4757]">Your captures</p>
              {mine.length === 0 ? <p className="mt-1 text-[12.5px] text-[#5B6474]">None yet. Capture evidence records what the table shows.</p> : (
                <ul className="mt-1 grid gap-1.5">
                  {mine.map((c) => (
                    <li key={c.ref} data-capture={c.ref} className="text-[12px] leading-snug text-[#3F4757]">
                      <span className="font-mono font-semibold text-[#111827]">{c.ref}</span> · {c.viewTitle} · {c.filter} · {c.ids.length} {c.ids.length === 1 ? "row" : "rows"}
                      <span className="block font-mono text-[11px] text-[#5B6474]">{c.utc}{c.sha ? ` · SHA-256 ${c.sha}` : ""}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
            <p className="text-[12px] leading-relaxed text-[#5B6474]">{lab.context}</p>
          </aside>

          <div className="order-2 flex min-h-0 min-w-0 flex-1 flex-col bg-white min-[900px]:order-1">
            <p className="flex flex-wrap gap-x-3 border-b border-[#2A2E3B] bg-[#12141C] px-3 py-1.5 font-mono text-[11.5px] text-[#F1F2F6]">
              <span>{lab.sim}</span><span>{lab.tenant}</span><span>as of {lab.asOf}</span><span className="text-[#FDE7B8]">Training simulation · synthetic data</span>
            </p>
            <div data-lab="tabs" role="tablist" className="flex flex-wrap border-b border-[#DDE1E8] bg-[#F7F8FA]">
              {lab.views.map((v) => (
                <button key={v.key} type="button" role="tab" aria-selected={v.key === viewKey} onClick={() => { setViewKey(v.key); clear(); }} className={`min-h-9 px-3 py-1.5 text-[13px] font-semibold focus-ring ${v.key === viewKey ? "bg-white text-[#111827] shadow-[inset_0_-2px_0_#111827]" : "text-[#5B6474] hover:text-[#111827]"}`}>{v.title}</button>
              ))}
            </div>
            {view && (
              <>
                <p className="px-3 pt-2 text-[12.5px] text-[#5B6474]">{view.sub}</p>
                <div className="flex flex-wrap items-end gap-2 px-3 py-2">
                  {view.filters.map((c) => {
                    const i = view.cols.indexOf(c);
                    const vals = [...new Set(view.rows.map((r) => r[i] || BLANK))].sort();
                    return (
                      <label key={c} data-lab-filter={c} className="grid gap-0.5 text-[11.5px] text-[#5B6474]">
                        {c}
                        <select value={filters[c] ?? ""} onChange={(e) => setFilters((f) => ({ ...f, [c]: e.target.value }))} className="h-8 max-w-[170px] rounded border border-[#C9CED8] bg-white px-1.5 text-[13px] text-[#111827]">
                          <option value="">All</option>
                          {vals.map((x) => <option key={x}>{x}</option>)}
                        </select>
                      </label>
                    );
                  })}
                  <label className="grid gap-0.5 text-[11.5px] text-[#5B6474]">
                    Search
                    <input value={q} onChange={(e) => setQ(e.target.value)} className="h-8 w-[130px] rounded border border-[#C9CED8] px-1.5 text-[13px] text-[#111827]" />
                  </label>
                  <button type="button" onClick={clear} className="h-8 rounded border border-[#C9CED8] bg-white px-2.5 text-[12.5px] font-semibold text-[#3F4757] hover:bg-[#F3F4F7]">Clear filters</button>
                  <span data-lab="count" className="h-8 content-center text-[12.5px] tabular-nums text-[#3F4757]">{shown.length} of {view.rows.length} rows</span>
                  <button type="button" data-lab="capture" onClick={capture} disabled={!shown.length} className="ml-auto inline-flex h-8 items-center gap-1.5 rounded bg-[#111827] px-3 text-[13px] font-semibold text-white hover:brightness-110 disabled:bg-[#E3E6EC] disabled:text-[#8A91A3]"><Icon name="camera" size={14} /> Capture evidence</button>
                </div>
                <div data-lab="table" className="max-h-[380px] min-h-0 flex-1 overflow-auto border-t border-[#DDE1E8] min-[900px]:max-h-none">
                  <table className="w-full border-collapse text-[12.5px]">
                    <thead className="sticky top-0 z-[1] bg-[#F7F8FA] text-left text-[11px] uppercase tracking-[0.06em] text-[#5B6474]">
                      <tr>{view.cols.map((c) => <th key={c} className="whitespace-nowrap border-b border-r border-[#DDE1E8] px-2.5 py-1.5 font-semibold last:border-r-0">{c}</th>)}</tr>
                    </thead>
                    <tbody>
                      {shown.map((r) => <tr key={r[0]}>{r.map((c, j) => <td key={j} className={`border-b border-r border-[#E9ECF1] px-2.5 py-1.5 align-top text-[#3F4757] last:border-r-0 first:font-medium first:text-[#111827] ${c.length > 40 ? "min-w-[260px]" : "whitespace-nowrap"}`}>{c}</td>)}</tr>)}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
          {guideAt >= 0 && (
            <GuidedTour
              steps={guide}
              step={guideAt}
              onStep={setGuideAt}
              onClose={() => {
                setGuideAt(-1);
                clear();
                markTourSeen(base, user?.email);
              }}
            />
          )}
        </div>
      )}
    </FloatWindow>
  );
}

function Brief({ lab, onGuide }: { lab: Lab; onGuide: () => void }) {
  return (
    <section className="grid gap-2 text-[13px] leading-relaxed text-[#3F4757]">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#5B6474]">Lab · for {lab.related}</p>
        <button type="button" data-lab="guide" onClick={onGuide} className="inline-flex h-7 items-center gap-1 rounded border border-[#C9CED8] bg-white px-2 text-[12px] font-semibold text-[#3F4757]"><Icon name="play" size={12} /> Show me how</button>
      </div>
      <p><span className="font-semibold text-[#111827]">{lab.owner[0]}:</span> {lab.owner[1]}</p>
      <details className="border-y-[3px] border-double border-[#C9CED8] py-1.5">
        <summary className="cursor-pointer text-[12.5px] font-semibold text-[#111827]">The rules you apply</summary>
        <dl className="mt-1 grid gap-1.5 text-[12.5px]">
          {lab.rules.map(([k, v]) => <div key={k}><dt className="font-semibold text-[#3F4757]">{k}</dt><dd>{v}</dd></div>)}
        </dl>
      </details>
    </section>
  );
}

function Part({ n, total, part, state, setState, labId, captures }: { n: number; total: number; part: LabPart; state: LabState; setState: (fn: (s: LabState) => LabState) => void; labId: string; captures: LabCapture[] }) {
  const [ref, setRef] = useState("");
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const r = state.parts[part.id];
  const rows = part.kind === "rows" ? partRows(part, state, captures) : [];

  type Out = { correct?: boolean | null; hint?: string | null; why?: string | null; rows?: ({ label: string } & LabRow)[]; findings?: string[] };
  const send = async (body: object, apply: (o: Out, s: LabState) => LabState) => {
    setBusy(true);
    setError(false);
    try {
      const o = await api.post<Out>("/me/desk/lab", { id: labId, part: part.id, ...body });
      setState((s) => {
        const next = apply(o, s);
        return o.findings?.length ? { ...next, findings: o.findings } : next;
      });
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  };
  const checkCapture = () => {
    const c = captures.find((x) => x.ref === ref);
    if (c) send({ view: c.view, ids: c.ids }, (o, s) => ({ ...s, parts: { ...s.parts, [part.id]: { ref, correct: o.correct, hint: o.hint ?? undefined, why: o.why ?? undefined } } }));
  };
  const checkRows = () =>
    send({ picks: rows.map((label) => ({ label, pick: picks[label] })) }, (o, s) => ({ ...s, parts: { ...s.parts, [part.id]: { rows: Object.fromEntries((o.rows ?? []).map(({ label, ...x }) => [label, x])) } } }));

  return (
    <section data-lab="part" data-part={part.id} className="grid gap-2 rounded border-[1.5px] border-[#111827] bg-white p-3 text-[13px]">
      <p className="text-[12px] font-semibold text-[#5B6474]">Question {n} of {total}</p>
      <h3 className="text-[14px] font-bold text-[#111827]">{part.title}</h3>
      <p className="leading-relaxed text-[#3F4757]">{part.ask}</p>
      <p className="rounded bg-[#FFFBF2] px-2 py-1.5 text-[12.5px] leading-relaxed text-[#78350F]"><span className="font-semibold">Where to look:</span> {part.where}</p>
      {part.kind === "capture" ? (
        <>
          <label className="grid gap-0.5 text-[12px] text-[#5B6474]">
            The capture that answers this
            <select aria-label="The capture that answers this" value={ref} onChange={(e) => setRef(e.target.value)} className="h-9 rounded border border-[#C9CED8] bg-white px-1.5 text-[13px] text-[#111827]">
              <option value="">{captures.length ? "Choose a capture" : "No capture yet"}</option>
              {captures.map((c) => <option key={c.ref} value={c.ref}>{c.ref} · {c.viewTitle} · {c.ids.length} {c.ids.length === 1 ? "row" : "rows"}</option>)}
            </select>
          </label>
          <button type="button" disabled={!ref || busy} onClick={checkCapture} className="h-9 rounded bg-[#111827] px-4 text-[13px] font-semibold text-white disabled:bg-[#E3E6EC] disabled:text-[#8A91A3]">{busy ? "Checking…" : "Check this capture"}</button>
          {r?.correct === false && <p role="status" data-lab="hint" className="text-[12.5px] leading-relaxed text-[#B91C1C]">{r.hint}</p>}
        </>
      ) : (
        <>
          <div className="grid gap-1.5">
            {rows.map((l) => (
              <label key={l} data-row={l} className="grid grid-cols-[110px_1fr] items-center gap-2 text-[13px]">
                <span className="font-mono text-[12.5px] font-semibold text-[#111827]">{l}</span>
                <select aria-label={l} value={picks[l] ?? ""} onChange={(e) => setPicks((x) => ({ ...x, [l]: e.target.value }))} className="h-9 min-w-0 rounded border border-[#C9CED8] bg-white px-1.5 text-[13px] text-[#111827]">
                  <option value="">Choose</option>
                  {part.options.map((o) => <option key={o}>{o}</option>)}
                </select>
              </label>
            ))}
          </div>
          <button type="button" disabled={busy || rows.some((l) => !picks[l])} onClick={checkRows} className="h-9 rounded bg-[#111827] px-4 text-[13px] font-semibold text-white disabled:bg-[#E3E6EC] disabled:text-[#8A91A3]">{busy ? "Checking…" : "Check my answers"}</button>
        </>
      )}
      {error && <p className="text-[12.5px] text-[#B91C1C]">Could not check. Try again.</p>}
    </section>
  );
}

/** A finished part, one line that opens on the answer. The last finished stays open: its why is what the learner reads next. */
function DonePart({ n, part, state, captures, open }: { n: number; part: LabPart; state: LabState; captures: LabCapture[]; open: boolean }) {
  const r = state.parts[part.id];
  const rows = Object.entries(r.rows ?? {});
  const right = rows.filter(([, x]) => x.correct).length;
  const cap = captures.find((c) => c.ref === r.ref);
  return (
    <details open={open} data-lab="done" data-part={part.id} className="rounded border border-[#DDE1E8] bg-white px-3 py-2 text-[13px]">
      <summary className="cursor-pointer font-semibold text-[#111827]">{n}. {part.title} · {part.kind === "capture" ? <span className="text-[#15803D]">Right, {r.ref}</span> : <span className={right === rows.length ? "text-[#15803D]" : "text-[#B91C1C]"}>{right} of {rows.length} right</span>}</summary>
      {part.kind === "capture" ? (
        <div className="mt-1 grid gap-1 text-[12.5px] leading-relaxed text-[#3F4757]">
          <p className="font-mono text-[12px] text-[#111827]">{cap?.ids.join(", ")}</p>
          <p>{r.why}</p>
        </div>
      ) : (
        <ul className="mt-1 grid gap-1.5 text-[12.5px] leading-relaxed text-[#3F4757]">
          {rows.map(([l, x]) => (
            <li key={l} data-row-result={l}>
              <span className="font-mono font-semibold text-[#111827]">{l}</span>: {x.correct ? <span className="text-[#15803D]">right, {x.best}</span> : <span className="text-[#B91C1C]">you chose {x.pick}. Answer: {x.best}</span>}. {x.why}
            </li>
          ))}
        </ul>
      )}
    </details>
  );
}
