"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { useDeskBase, useDeskLearnings } from "./desk-context";
import { TASK_META } from "@/lib/taskmeta";

/**
 * Form 13, the locked slip — dashed edge, mute hue, and its release condition stated on it.
 *
 * The form is deliberately absent for a locked *worked answer*: showing one advertises that an
 * answer exists and invites burning attempts to reach it. Nothing is hidden here — the step is
 * already in the tree wearing a padlock, and the learner arrived by typing its URL — so what the
 * slip does is say why the page is empty and where they actually are. No blur: there is nothing
 * behind it to tease.
 *
 * Dashed because the step is not yet in their possession (law 4), mute because it is not theirs
 * yet, and no fill, so it never reads as an object they can act on.
 */
export function LockedNotice({ what }: { what: "step" | "task" }) {
  const base = useDeskBase();
  const { learnings } = useDeskLearnings();

  // Where the learner actually is: the first step the backend marks `current`. Steps open one at
  // a time, so there is at most one — and none at all once the programme is finished.
  let current: { stepId: string; taskCode: string; title: string } | null = null;
  outer: for (const o of learnings?.orgs ?? []) {
    for (const p of o.projects) {
      for (const t of p.tasks) {
        const s = t.steps.find((x) => x.status === "current");
        if (s) {
          current = { stepId: s.id, taskCode: t.code, title: s.title };
          break outer;
        }
      }
    }
  }
  const taskName = current ? TASK_META[current.taskCode]?.name ?? current.taskCode : null;

  return (
    <div className="rounded-2xl border border-dashed border-slate-300 px-5 py-6 text-center">
      <div className="w-11 h-11 mx-auto rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 mb-3">
        <Icon name="lock" size={20} />
      </div>
      <h1 className="text-[15px] font-semibold tracking-tight text-slate-700">
        This {what} isn&apos;t unlocked yet
      </h1>
      <p className="mt-1.5 text-[12.5px] text-slate-500 tracking-tight leading-relaxed" style={{ textWrap: "pretty" }}>
        {what === "step"
          ? "Steps open one at a time, in order. Finish the ones before it and this one opens on its own — nothing you do here would save or submit until then."
          : "Tasks open in order. Finish the task before it and this one opens on its own."}
      </p>

      {current ? (
        <>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">You&apos;re on</p>
          <p className="text-[12.5px] text-slate-600 tracking-tight">
            {taskName} · {current.title}
          </p>
          <Link
            href={`${base}/${current.stepId}`}
            className="mt-3 inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-semibold tracking-tight no-underline shadow-[0_4px_14px_-4px_rgba(79,70,229,0.6)]"
          >
            Go to your current step <Icon name="arrowRight" size={15} />
          </Link>
        </>
      ) : (
        <Link
          href={base}
          className="mt-4 inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-white ring-1 ring-slate-200 text-slate-700 text-[13px] font-semibold tracking-tight no-underline hover:bg-slate-50"
        >
          Back to Working Desk <Icon name="arrowRight" size={15} />
        </Link>
      )}
    </div>
  );
}
