"use client";

// Shared building blocks for the bespoke per-verb Working-Desk workspaces.
// These replace the generic SchemaForm: each verb gets a tailored, pre-scripted working
// area (realistic enterprise data already loaded, like a real engagement). The mentee does
// the *analysis* — flags, classifications, rationales, decisions — and only those inputs are
// lifted into the graded `fields` payload. There are NO free message/chat inputs anywhere;
// stakeholder exchanges are pre-scripted and shown read-only.

import { useEffect } from "react";
import { Icon, type IconName } from "@/components/ui/icon";
import { Gloss } from "@/components/app/glossary";

/** Every workspace is a controlled component over the graded `fields` object. */
export interface WorkspaceProps {
  /** Current graded fields (seeded from a saved draft when present). */
  value: Record<string, unknown>;
  /** Lift the graded fields up to the page (becomes submission payload.fields). */
  onChange: (next: Record<string, unknown>) => void;
  /** Open a scripted reference artefact (by id) in the page's Reference-material panel. */
  openRef: (id?: string) => void;
  /** Parent task code (e.g. "AA-001"), used to select per-activity scripted content. */
  taskCode?: string;
  /** This activity's code (e.g. "1.1"), used to select per-activity scripted content. */
  activityCode?: string;
}

/**
 * Lift a workspace's serialised fields up to the page whenever they change. Init each piece of
 * internal state from `value` (the saved draft) when present, else from the scripted default —
 * then call useLift to round-trip changes back. JSON dependency keeps it cheap for small objects.
 */
export function useLift(fields: Record<string, unknown>, onChange: (v: Record<string, unknown>) => void) {
  const json = JSON.stringify(fields);
  useEffect(() => {
    onChange(JSON.parse(json));
  }, [json, onChange]);
}

/** Read a draft value by key with a typed fallback. */
export function seed<T>(value: Record<string, unknown>, key: string, fallback: T): T {
  const v = value[key];
  return v === undefined || v === null ? fallback : (v as T);
}

/* ── Layout primitives (ported from the mockup, restyled to sit inside the deliverable Card) ── */

export function SectionLabel({ children, hint, action }: { children: React.ReactNode; hint?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between mb-2.5">
      <div className="flex items-baseline gap-2">
        <h3 className="text-[10.5px] font-semibold tracking-[0.12em] uppercase text-slate-500">{children}</h3>
        {hint && <span className="text-[11px] text-slate-400">{hint}</span>}
      </div>
      {action}
    </div>
  );
}

export function WTextInput({ value, onChange, placeholder, type = "text", className = "" }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string; className?: string;
}) {
  return (
    <div className={`flex items-center gap-2 h-10 px-3 rounded-lg bg-white ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-indigo-500/30 transition-all ${className}`}>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="flex-1 bg-transparent outline-none text-[13px] text-slate-900 placeholder:text-slate-400" />
    </div>
  );
}

export function WTextArea({ value, onChange, placeholder, rows = 4, hint }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number; hint?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-white ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-indigo-500/30 transition-all">
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows}
        className="w-full px-4 py-3 bg-transparent outline-none resize-none text-[13.5px] text-slate-900 placeholder:text-slate-400 leading-relaxed tracking-tight" />
      {hint && (
        <div className="flex items-center justify-end px-4 py-2 border-t border-slate-100">
          <span className="text-[11px] text-slate-400 tabular-nums">{hint}</span>
        </div>
      )}
    </div>
  );
}

/** A small "given" hint line — the scripted instruction telling the mentee what is pre-loaded.
 *  Glossed here rather than at the ~48 call sites, so every verb workspace gets it for free. */
/** Given context — the study-card form (03), the only borderless one. The missing border is
 *  load-bearing: it says nothing is owed here, you are reading, not filling anything in. The
 *  moment this acquires a button it has to become a step marker or a prompt well instead. */
export function GivenNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-xl bg-sky-50/70 px-3.5 py-2.5 text-[12px] text-slate-600 tracking-tight">
      <Icon name="info" size={13} className="text-sky-600/70 shrink-0 mt-px" />
      <span style={{ textWrap: "pretty" }}><Gloss>{children}</Gloss></span>
    </div>
  );
}

/**
 * The source folio (form 07) — a document the organisation supplied, with an Open button that
 * puts it in the Reference-material panel.
 *
 * Ochre and the filing tab are not decoration: ochre means "this is theirs", which is the cue
 * that invites the mentee to test the material rather than obey it. The provenance line is
 * mandatory — a folio without one is a bug, because a document whose currency you cannot check
 * is a document you cannot rely on, and saying so is half of what this task teaches.
 */
export function RefBox({ title, meta, tab = "Supplied by org", icon = "file", refId, openRef, children }: {
  title: string; meta?: string; tab?: string; icon?: IconName; refId: string; openRef: (id?: string) => void; children?: React.ReactNode;
}) {
  return (
    <div className="relative mt-[22px] rounded-[0_8px_8px_8px] bg-amber-50/70 border border-amber-200/80">
      {/* The filing tab, drawn as a real tab: same fill and edge, no bottom border, sitting above. */}
      <span className="absolute -top-[21px] -left-px h-[21px] px-3 flex items-center bg-amber-50/70 border border-b-0 border-amber-200/80 rounded-t-md font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-amber-800">
        {tab}
      </span>
      <div className="px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0"><Icon name={icon} size={14} /></span>
          <div className="min-w-0">
            <div className="text-[13px] font-medium text-slate-900 tracking-tight truncate">{title}</div>
            {/* No `meta &&` guard: a missing provenance line should look like the defect it is,
                not disappear. */}
            <div className={`text-[10px] font-mono uppercase tracking-[0.06em] truncate ${meta ? "text-amber-700" : "text-slate-400"}`}>
              {meta ?? "provenance not recorded"}
            </div>
          </div>
        </div>
        <button onClick={() => openRef(refId)} className="shrink-0 h-8 px-2.5 rounded-md text-[11.5px] font-medium text-amber-900 bg-amber-100 hover:bg-amber-200 flex items-center gap-1.5 transition-colors">
          <Icon name="arrowUpRight" size={13} /> Open
        </button>
      </div>
      {children}
    </div>
  );
}

/**
 * The dialogue script (form 14) — something you perform with a person, in real time.
 *
 * Deliberately not a chat: chat bubbles say "this happened, read it", and a script says "this is
 * how the conversation goes, run it". The label column carries who speaks; the dotted rail is
 * what stops it reading as a transcript. If it could be completed at a desk it was authored wrong.
 */
export function ScriptedExchange({ title, turns }: {
  title: string;
  turns: { who: "you" | "stakeholder"; initials: string; name?: string; text: string }[];
}) {
  return (
    <div>
      <SectionLabel>{title}</SectionLabel>
      <div className="relative rounded-[16px_4px_4px_16px] bg-white ring-1 ring-slate-200 px-4 py-3">
        <span aria-hidden className="absolute left-[110px] top-2.5 bottom-2.5 border-l border-dotted border-slate-200" />
        {turns.map((t, i) => {
          const mine = t.who === "you";
          return (
            <div key={i} className="grid grid-cols-[96px_1fr] gap-4 items-baseline py-1.5 text-[13px]">
              <span className={`font-mono text-[9.5px] uppercase tracking-[0.08em] text-right ${mine ? "text-sky-700" : "text-slate-400"}`}>
                {mine ? "You say" : t.name ?? t.initials}
              </span>
              <p className={`m-0 leading-relaxed ${mine ? "text-slate-900" : "text-slate-600"}`}><Gloss>{t.text}</Gloss></p>
            </div>
          );
        })}
      </div>
      <p className="mt-1.5 text-[10.5px] text-slate-400 tracking-tight">Stakeholder responses are pre-scripted for this engagement — capture and act on them below.</p>
    </div>
  );
}

/* ── Static tone maps (Tailwind v4 purges dynamic `bg-${x}` classes, so we map to literals) ── */

export type Tone = "emerald" | "amber" | "rose" | "indigo" | "violet" | "slate";

/** Selected/active "soft chip" tone: bg + text + ring. */
export const SOFT: Record<Tone, string> = {
  emerald: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  amber: "bg-amber-50 text-amber-800 ring-amber-200",
  rose: "bg-rose-50 text-rose-800 ring-rose-200",
  indigo: "bg-indigo-50 text-indigo-800 ring-indigo-200",
  violet: "bg-violet-50 text-violet-800 ring-violet-200",
  slate: "bg-slate-100 text-slate-700 ring-slate-200",
};

/** Solid dot / fill tone. */
export const DOT: Record<Tone, string> = {
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  indigo: "bg-indigo-500",
  violet: "bg-violet-500",
  slate: "bg-slate-400",
};

/** Classification pill tones used across Record/Apply. */
export const CLASS_TONE: Record<string, string> = {
  Public: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Internal: "bg-amber-50 text-amber-700 ring-amber-200",
  Confidential: "bg-rose-50 text-rose-700 ring-rose-200",
  Low: "bg-slate-100 text-slate-600 ring-slate-200",
  Medium: "bg-amber-50 text-amber-700 ring-amber-200",
  High: "bg-rose-50 text-rose-700 ring-rose-200",
};
