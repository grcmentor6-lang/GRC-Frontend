"use client";

import type { ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import type { TreeStep } from "@/lib/desk/tree-text";

/**
 * A question walk (a decision tree, a rule's questions in order), drawn the way the owner's guide draws its steps
 * (docs/redesign-guide/guide.html): a round marker on a rail, the question beside it, its answer as a tag. Answered
 * questions stay, greyed; the one in hand is lit; later ones stay hidden until reached; an outcome ends in a green tick.
 */
export const MARK = {
  done: "text-[#9CA3AF]",
  now: "text-[#4338CA]",
  default: "text-[#111827]",
  stop: "text-[#16A34A]",
} as const;

/** The walk's card (owner, 11 Nov 2026): an indigo "Decision tree · Your work" bar over a light body, so the walk reads as
 *  the learner's own instrument, set apart from the step text around it. `readOnly`: the same card for a tree that is only
 *  read (a document's or a rule's), without the "Your work" pill. */
export function WalkCard({ title, guide, readOnly, children }: { title: string; guide?: string; readOnly?: boolean; children: ReactNode }) {
  return (
    <section data-guide={guide} className="overflow-hidden rounded-2xl border-2 border-[#4338CA] bg-[#F7F7FF] shadow-[0_10px_24px_-14px_rgba(67,56,202,0.45)]">
      <header className="flex items-center justify-between gap-2 bg-[#4338CA] px-4 py-2.5 text-white">
        <span className="flex items-center gap-2 font-sans text-[12.5px] font-bold uppercase tracking-[0.08em]"><Icon name="treeDown" size={15} />{title}</span>
        {!readOnly && (
          <span className="flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 font-sans text-[11px] font-bold uppercase tracking-[0.06em] text-[#3730A3]">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[#F97316]" />Your work
          </span>
        )}
      </header>
      <div className="px-4 pb-4 pt-3.5">{children}</div>
    </section>
  );
}

/** `action`: a control of the row's own (a checklist's Fails button), drawn at the right and placed after the row's
 *  lines, so the row reads code, text, cells, then the button. `check`: data-check. */
export function WalkStep({ q, mark, label, text, tag, guide, check, action, children }: {
  q?: number; mark: keyof typeof MARK; label: ReactNode; text: ReactNode; tag?: "Yes" | "No"; guide?: string; check?: string; action?: ReactNode; children?: ReactNode;
}) {
  return (
    <li data-q={q} data-guide={guide} data-check={check} className={`grid ${action ? "grid-cols-[34px_minmax(0,1fr)_auto]" : "grid-cols-[34px_1fr]"} gap-2 border-t border-[#E6E8F6] py-3 first:border-t-0 first:pt-0 last:pb-0`}>
      <span className={`pt-px text-[13.5px] font-semibold tabular-nums ${MARK[mark]}`}>{label}</span>
      <div className="min-w-0 text-[14.5px] leading-[1.5]">
        <p className={`flex items-start justify-between gap-3 ${mark === "done" ? "text-[#6B7280]" : "font-medium text-[#111827]"}`}>
          <span>{text}</span>
          {tag && <span className={`h-fit shrink-0 rounded-full px-2.5 py-[3px] text-[11px] font-bold uppercase tracking-[0.06em] ${tag === "Yes" ? "bg-[#DCFCE7] text-[#166534]" : "bg-[#ECEDF2] text-[#4B5563]"}`}>{tag}</span>}
        </p>
        {children}
      </div>
      {action}
    </li>
  );
}

/** A decision tree to read, not walk (BKB-STD-001 Section 5, rule R01): its questions in order, each with the outcome
 *  of a yes, then "Otherwise". */
export function TreeCard({ title, steps }: { title: string; steps: TreeStep[] }) {
  return (
    <WalkCard title={title} readOnly>
      <ol data-tree>
        {steps.map((x, i) => (
          <WalkStep key={i} mark="default" label={x.otherwise ? "" : `Q${i + 1}`} text={x.q}>
            <p className="mt-1 text-[13.5px] leading-snug text-[#4B5563]">
              {x.otherwise ? "→" : "Yes →"} <strong className="font-semibold text-[#111827]">{x.then}</strong>
            </p>
          </WalkStep>
        ))}
      </ol>
    </WalkCard>
  );
}
