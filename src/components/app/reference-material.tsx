"use client";

import { useId, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Drawer } from "@/components/ui/drawer";
import { gloss } from "@/components/app/glossary";
import type { TaskReference } from "@/lib/taskmeta";
import { Plaque } from "@/components/app/plaque";
import { standardForRef, purposeForRef, normaliseRef } from "@/lib/controls";

/** Header rows in a control-reference table — skipped rather than rendered as a plaque. */
const HEADER_CELLS = new Set(["reference", "mapped reference", "intent", "outcome", "control"]);

/**
 * A `| ref | title |` row from a "Control Reference Extract" body, if it is one.
 *
 * Returns null for anything that is not a clean pair: header rows, rows whose reference cell is
 * empty (14 of them, an extraction defect), and rows the extractor split on a stray pipe inside a
 * parenthesis (5 more, e.g. `Article 4 (Definitions | personal data…`). Those fall through to the
 * ordinary table renderer rather than becoming a plaque with a blank or truncated clause line —
 * a malformed quotation is the one thing this form must never show.
 */
function plaqueRow(cells: string[]): { reference: string; title: string } | null {
  if (cells.length !== 2) return null;
  const [rawRef, title] = cells;
  const reference = normaliseRef(rawRef);
  if (!reference || !title) return null;
  if (HEADER_CELLS.has(reference.toLowerCase()) || HEADER_CELLS.has(title.toLowerCase())) return null;
  // Unbalanced bracket = the row was cut in half by the extractor; the reference is incomplete.
  if ((reference.match(/\(/g) ?? []).length !== (reference.match(/\)/g) ?? []).length) return null;
  return { reference, title };
}

/** Renders a reference body: "## " headings, "- " bullets, "| " table rows, blank lines split paragraphs.
 *  Technical terms are underlined and open a definition popover — first occurrence per body only.
 *
 *  `plaques` turns clean `| reference | title |` rows into form 01 — used for the RUA gate's
 *  "Control Reference Extract" documents, where those rows are a standard's own references and
 *  titles, the same material the task brief's Control references panel shows. Our surrounding
 *  prose (the opening line, "## Reading for you") stays outside the plaque, as it must. */
export function RefBody({ text, kind }: { text: string; kind?: string }) {
  // One place decides, so a caller cannot forget: only a control-reference extract gets plaques.
  const plaques = kind === "Control Reference Extract";
  const uid = useId();
  // Fresh per render, so a term stays interactive on its first appearance in this body and nowhere else.
  const seen = new Set<string>();
  const g = (s: string, k: string) => gloss(s, seen, `${uid}${k}`);
  const out: React.ReactNode[] = [];
  let bullets: string[] = [];
  let rows: string[][] = [];
  const flushBullets = (k: string) => {
    if (bullets.length) {
      out.push(<ul key={k} className="list-disc pl-5 space-y-1.5 my-2">{bullets.map((b, j) => <li key={j} className="text-[13px] text-slate-700 leading-relaxed tracking-tight">{g(b, `${k}-${j}`)}</li>)}</ul>);
      bullets = [];
    }
  };
  const flushRows = (k: string) => {
    if (rows.length) {
      // Control-reference rows become plaques; anything malformed falls through to the table.
      if (plaques) {
        const parsed = rows.map(plaqueRow);
        if (parsed.some(Boolean)) {
          out.push(
            <div key={`${k}-plaques`} className="my-3 space-y-2">
              {rows.map((r, ri) => {
                const row = parsed[ri];
                if (!row) {
                  // A header row labels columns that no longer exist once the rows are plaques,
                  // so it is dropped rather than left behind as a stray "Reference — Intent" line.
                  const header = r.every((c) => !c || HEADER_CELLS.has(c.toLowerCase()));
                  if (header || !r.some((c) => c)) return null;
                  return <p key={ri} className="text-[12px] text-slate-600 tracking-tight m-0">{r.filter(Boolean).join(" — ")}</p>;
                }
                return (
                  <Plaque
                    key={ri}
                    standard={standardForRef(row.reference)}
                    reference={row.reference}
                    quotation={row.title}
                    explanation={purposeForRef(row.reference)}
                  />
                );
              })}
            </div>,
          );
          rows = [];
          return;
        }
      }
      out.push(
        <div key={k} className="my-2 rounded-lg ring-1 ring-slate-200 overflow-hidden">
          {rows.map((r, ri) => (
            <div key={ri} className={`flex gap-3 px-3 py-1.5 text-[12px] ${ri === 0 ? "bg-slate-50 font-medium text-slate-600" : "text-slate-700"} ${ri ? "border-t border-slate-100" : ""}`}>
              {r.map((c, ci) => <span key={ci} className="flex-1 min-w-0 tracking-tight">{c}</span>)}
            </div>
          ))}
        </div>,
      );
      rows = [];
    }
  };
  text.split("\n").forEach((line, i) => {
    const t = line.trim();
    if (t.startsWith("## ")) { flushBullets(`b${i}`); flushRows(`r${i}`); out.push(<h3 key={i} className="text-[11px] font-semibold tracking-[0.12em] uppercase text-slate-500 mt-5 mb-1.5 first:mt-0">{t.slice(3)}</h3>); }
    else if (t.startsWith("- ")) { flushRows(`r${i}`); bullets.push(t.slice(2)); }
    // Strip the row's leading AND trailing pipe before splitting. Only the leading one was
    // stripped before, so every table in the app carried a stray "|" glued to its last cell —
    // invisible enough in a grey table row, not invisible at all once that cell is the quotation
    // inside a plaque, and it also stopped header rows matching and being skipped.
    else if (t.startsWith("| ")) { flushBullets(`b${i}`); rows.push(t.replace(/^\|\s*/, "").replace(/\s*\|$/, "").split(" | ").map((c) => c.trim())); }
    else if (t === "") { flushBullets(`b${i}`); flushRows(`r${i}`); }
    else { flushBullets(`b${i}`); flushRows(`r${i}`); out.push(<p key={i} className="text-[13px] text-slate-700 leading-relaxed tracking-tight my-1.5" style={{ textWrap: "pretty" }}>{g(t, `p${i}`)}</p>); }
  });
  flushBullets("bend"); flushRows("rend");
  return <>{out}</>;
}

/** A list of reference cards; each opens a right-side drawer with its body. */
export function ReferenceMaterial({ references }: { references: TaskReference[] }) {
  const [openRef, setOpenRef] = useState<TaskReference | null>(null);
  if (!references.length) return null;
  return (
    <>
      <div className="space-y-2">
        {references.map((r) => (
          <button key={r.id} onClick={() => setOpenRef(r)} className="w-full flex items-center gap-3 text-left rounded-xl ring-1 ring-slate-200 bg-white hover:bg-slate-50 px-3.5 py-3 transition-colors group">
            <span className="w-9 h-9 rounded-lg bg-indigo-50 ring-1 ring-indigo-100 text-indigo-600 flex items-center justify-center shrink-0"><Icon name="book" size={16} /></span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2 flex-wrap">
                <span className="text-[13px] font-medium text-slate-900 tracking-tight">{r.title}</span>
                <span className="text-[9.5px] font-semibold tracking-[0.08em] uppercase text-slate-500 bg-slate-100 rounded px-1.5 py-0.5">{r.kind}</span>
              </span>
              <span className="block text-[12px] text-slate-500 tracking-tight mt-0.5" style={{ textWrap: "pretty" }}>{r.summary}</span>
            </span>
            <Icon name="arrowRight" size={15} className="text-slate-300 group-hover:text-indigo-500 shrink-0" />
          </button>
        ))}
      </div>
      <Drawer open={!!openRef} onClose={() => setOpenRef(null)} title={openRef?.title} eyebrow={openRef?.kind}>
        {openRef && <RefBody text={openRef.body} kind={openRef.kind} />}
      </Drawer>
    </>
  );
}
