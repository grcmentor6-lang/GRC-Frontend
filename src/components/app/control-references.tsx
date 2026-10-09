"use client";

import { useMemo } from "react";
import Link from "next/link";
import { itemHref, resolveRef } from "@/lib/library";
import { VERB_TONES } from "@/lib/tones";
import { CONTROLS_BY_TASK, type Control } from "@/lib/controls";
import { Plaque } from "@/components/app/plaque";

/**
 * The crosswalk (form 02) — two authorities bridged.
 *
 * Exact tokens: the anchor half is navy (`#e8ecf7` on `#b9c4e0`, clause `#1f3564`), the mapped
 * half is steel (`#e2eff6` on `#a8cede`, clause `#0b6e99`), and the node sits on a hairline rule
 * between them. Hue is doing the work: navy is the standard the task is graded against, steel is
 * the frame it is being read across into.
 *
 * Both halves carry published references only — never our gloss. We hold the mapping at task
 * level, not clause-to-clause, so each half lists that standard's references for this task rather
 * than pretending to a one-to-one pairing the source data does not contain.
 *
 * A half-populated crosswalk is not a crosswalk: with nothing on the mapped side this renders
 * nothing at all, rather than an empty box implying a mapping exists.
 */
function Crosswalk({ anchor, mapped }: {
  anchor: { standard: string; controls: Control[] };
  mapped: { standard: string; controls: Control[] };
}) {
  const refs = (cs: Control[]) => cs.map((c) => c.num).join(" · ");
  return (
    <div className="grid grid-cols-[1fr_30px_1fr] items-stretch">
      <div className="border border-[#b9c4e0] bg-[#e8ecf7] px-3 py-2.5 min-w-0">
        <span className="block font-mono text-[10px] font-semibold tracking-[0.07em] text-[#1f3564] mb-1">
          {anchor.standard}
        </span>
        <p className="m-0 text-[12px] leading-[1.45] text-[#4e5a6b]" style={{ textWrap: "pretty" }}>
          {refs(anchor.controls)}
        </p>
      </div>
      <div className="relative grid place-items-center">
        <span aria-hidden className="absolute left-0 right-0 top-1/2 h-px bg-[#d3dbe6]" />
        <b aria-hidden className="relative w-6 h-6 rounded-full bg-white border border-[#d3dbe6] grid place-items-center text-[12px] font-normal text-[#4e5a6b]">
          &#8596;
        </b>
      </div>
      <div className="border border-[#a8cede] bg-[#e2eff6] px-3 py-2.5 min-w-0">
        <span className="block font-mono text-[10px] font-semibold tracking-[0.07em] text-[#0b6e99] mb-1">
          {mapped.standard}
        </span>
        <p className="m-0 text-[12px] leading-[1.45] text-[#4e5a6b]" style={{ textWrap: "pretty" }}>
          {refs(mapped.controls)}
        </p>
      </div>
    </div>
  );
}

/**
 * Every control a task is graded against: the cross-walk, then one plaque per control with our
 * plain-terms explanation under it.
 *
 * Shared on purpose. The learner opens it from the task brief; the mentor gets the same panel on
 * the review surface, where until now there was no view of the controls at all — someone judging
 * whether a deliverable traces back to its controls could not see them. Two implementations of
 * this would drift, and a mentor reading different words from the mentee is worse than either.
 */
export function ControlReferences({ taskCode, linkToLibrary = false }: {
  taskCode: string;
  /** Learner only: the library lives under /app, which the mentor console does not mount. */
  linkToLibrary?: boolean;
}) {
  const reg = CONTROLS_BY_TASK[taskCode];

  const byStandard = useMemo(() => {
    const m = new Map<string, Control[]>();
    for (const c of reg?.controls ?? []) m.set(c.standard, [...(m.get(c.standard) ?? []), c]);
    return [...m];
  }, [reg]);

  // The task's own standard is whichever the primary controls carry — they are pushed first in
  // lib/controls, ahead of the cross-walk. Everything after it is a frame it is read across into.
  const [anchorStd, ...mappedStds] = byStandard.map(([std]) => std);
  const controlsFor = (std: string) => byStandard.find(([s]) => s === std)?.[1] ?? [];

  if (!reg) return null;

  return (
    <>
        {/* Provenance, stated before the list rather than left to be inferred. Three different
            authorities used to be stacked in each card with nothing separating them — the clause
            reference and title are the standard's words, the plain-terms line is ours. Unlabelled,
            our summary sat where a quotation sits, and a learner would reasonably cite it as the
            control. A.5.9's summary says "complete inventory"; the standard does not say complete. */}
        <p className="text-[12.5px] text-slate-500 leading-relaxed tracking-tight" style={{ textWrap: "pretty" }}>
          The clauses and controls this task is graded against. Your deliverable should trace back to each one.
        </p>
        <p className="mt-2 mb-4 text-[11.5px] text-slate-600 bg-slate-50 ring-1 ring-slate-200 rounded-lg px-3 py-2 leading-relaxed tracking-tight" style={{ textWrap: "pretty" }}>
          Each control is identified by its reference and published title, then explained
          in <span className="font-semibold">our own words</span>. These explanations are written for
          the programme — they are not the wording of the standard, so quote the standard itself when
          your work has to cite it.
        </p>
        {/* Crosswalk (form 02) first: what this task is graded against, and what that maps onto.
            Nothing renders when the task has no mapped frame — a one-sided bridge is not a bridge. */}
        {mappedStds.length > 0 && (
          <div className="mb-5 space-y-2">
            <span className="block font-mono text-[9.5px] uppercase tracking-[0.08em] text-slate-400">
              Cross-walk
            </span>
            {mappedStds.map((std) => (
              <Crosswalk
                key={std}
                anchor={{ standard: anchorStd, controls: controlsFor(anchorStd) }}
                mapped={{ standard: std, controls: controlsFor(std) }}
              />
            ))}
          </div>
        )}

        <div className="space-y-4">
          {byStandard.map(([standard, controls]) => {
            const tone = VERB_TONES[controls[0].tone] ?? VERB_TONES.indigo;
            return (
              <div key={standard}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${tone.dot}`} />
                  <span className="text-[11.5px] font-semibold text-slate-700 tracking-tight">{standard}</span>
                  <span className="h-px flex-1 bg-slate-200/60" />
                </div>
                <div className="space-y-1.5">
                  {controls.map((c, i) => {
                    const lib = linkToLibrary ? resolveRef(c.num) : null;
                    return (
                      // The plaque only appears where we hold licensed clause text; everywhere else
                      // the reference card carries our own explanation, which is all the learner
                      // needs here and all we are entitled to publish.
                      // Plaque on top carrying the standard's own words — the clause where we are
                      // licensed to quote it, the published title otherwise — and our explanation
                      // joined beneath it as one object, so provenance reads top to bottom.
                      <div key={i} className="pt-1">
                        <Plaque
                          standard={c.standard}
                          reference={c.num}
                          quotation={c.text?.trim() || c.name}
                          verbatim={!!c.text?.trim()}
                          explanation={c.purpose}
                          domain={c.domain}
                        />
                        {lib && (
                          <Link
                            href={itemHref(lib.standard, lib.item, taskCode)}
                            className="focus-ring mt-1.5 ml-[5px] inline-flex items-center gap-1 text-[11.5px] font-medium text-sky-700 hover:text-sky-900"
                          >
                            {lib.item.ref === c.num ? "Open in the standards library" : `Open ${lib.item.ref} in the standards library`} &rarr;
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
    </>
  );
}
