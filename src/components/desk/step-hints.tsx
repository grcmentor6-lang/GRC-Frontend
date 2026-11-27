"use client";

import { useDesk } from "./desk-context";
import { ReadFirst, stepSourceItems } from "./read-first";
import { GlossText } from "./gloss-tip";
import { hintsOpened, stepHelp } from "@/lib/desk/step-help";
import { stepKey } from "@/lib/desk/progress";
import type { Step, Task } from "@/lib/desk/model";

const LEVELS = [
  { n: 1, name: "A nudge", ask: "Show a nudge" },
  { n: 2, name: "Where to look", ask: "Show where to look" },
  { n: 3, name: "How to reason it out", ask: "Show how to reason it out" },
] as const;

/**
 * Three hints on a step (UX101 W9): a nudge, where to look (the step's Sources, named as text), and the
 * reasoning without the value. One at a time, in order. How far the learner went is kept in progress.hints; it changes
 * no score (the hint penalty, if any, is the owner's decision).
 */
export function StepHints({ task, s }: { task: Task; s: Step }) {
  const { desk, progress, update } = useDesk();
  const h = stepHelp(task.id, s.n);
  const open = hintsOpened(progress, task.id, s.n);
  if (!h) return <p className="text-[14px] text-[#5B6474]">No hints for this step.</p>;
  const next = LEVELS[open];
  return (
    <div data-guide="hints" className="grid gap-3">
      <p className="text-[14px] leading-[1.5] text-[#5B6474]">Three hints, one at a time. None gives the answer, they change no marks, and which you opened is kept with your progress.</p>
      <ol className="grid gap-2.5">
        {LEVELS.filter((l) => l.n <= open).map((l) => (
          <li key={l.n} data-hint={l.n} className="rounded border border-[#DDE1E8] bg-[#F7F8FA] px-3 py-2.5">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#3730A3]">Hint {l.n} of 3 · {l.name}</p>
            {l.n === 1 && <p className="mt-1 text-[14px] leading-relaxed text-[#111827]"><GlossText text={h.h1} /></p>}
            {l.n === 2 && (
              <>
                <p className="mt-1 text-[14px] leading-relaxed text-[#111827]">The facts or rules this step rests on are in these places. Open each from the toolbar, where the orange dot marks it.</p>
                <ReadFirst items={stepSourceItems(desk, s, task)} className="mt-2" title="Sources for this step" lead="" />
              </>
            )}
            {l.n === 3 && <p className="mt-1 text-[14px] leading-relaxed text-[#111827]"><GlossText text={h.h3} /></p>}
          </li>
        ))}
      </ol>
      {next && (
        <button
          type="button"
          data-hint-next
          onClick={() => update((p) => ({ ...p, hints: { ...p.hints, [stepKey(task.id, s.n)]: next.n } }))}
          className="inline-flex h-8 w-fit items-center rounded border border-[#C7CBF5] bg-[#EEF0FF] px-3 text-[13px] font-semibold text-[#3730A3] hover:bg-white focus-ring"
        >
          {next.ask}
        </button>
      )}
    </div>
  );
}
