"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { VERDICT } from "@/lib/verdicts";
import { deskApi, type MentorReview } from "@/lib/desk";

/**
 * The mentor's decision at a review gate, shown to the learner (HITL programme §4.5): the
 * outcome, the reasons selected, and for a disapproval the corrective action verbatim.
 *
 * This is the decision that actually released or reopened the step, so the copy says what it did.
 * `advisory` flips it back to a "does not affect your result" note if shadow mode is ever
 * restored, rather than leaving the two out of step.
 */
export function MentorDecision({
  review,
  onAcknowledged,
}: {
  review: MentorReview;
  /** Called after acknowledging so the page can refetch — the step completes at that moment. */
  onAcknowledged?: () => void;
}) {
  const [acking, setAcking] = useState(false);
  const approved = review.outcome === "approve" || review.outcome === "approve_note";
  const escalated = review.outcome === "disapprove_escalate";
  const tone = approved
    ? { ring: "ring-emerald-200", bg: "bg-emerald-50/60", band: "bg-emerald-700", icon: "checkCircle" as const }
    : { ring: "ring-rose-200", bg: "bg-rose-50/60", band: "bg-rose-700", icon: "flag" as const };
  const headline = review.needsAcknowledgement
    ? "Your mentor approved this — with something to read"
    : approved
      ? "Your mentor approved this step"
      : escalated
        ? "Your mentor escalated this step"
        : "Your mentor returned this step";

  return (
    // A solid band, a human timestamp and a signature rule — the three things the form language
    // reserves for a decision a person actually made, and that machine-note.tsx is barred from
    // wearing. The scarcest thing in the programme is mentor attention; the card should show it.
    <div className={`rounded-2xl ring-1 ${tone.ring} bg-white overflow-hidden`}>
      <div className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 ${tone.band} text-white`}>
        <Icon name={tone.icon} size={14} />
        <b className="text-[11px] font-bold uppercase tracking-[0.05em]">{headline}</b>
        <time
          dateTime={review.decidedAt}
          className="ml-auto shrink-0 text-[10.5px] tabular-nums opacity-85"
        >
          {new Date(review.decidedAt).toLocaleDateString(undefined, {
            day: "numeric",
            month: "short",
          })}
        </time>
      </div>

      <div className={`${tone.bg} p-5`}>
        <div className="min-w-0 flex-1">
          <ul className="space-y-2">
            {review.reasons.map((r) => (
              <li key={r.text}>
                <div className="flex gap-2 text-[13px] text-slate-700 leading-relaxed">
                  <span className="text-slate-300 mt-1.5 shrink-0">•</span>
                  <span>{r.text}</span>
                </div>
                {r.action && (
                  <div className="ml-4 mt-1 text-[12.5px] text-amber-800 leading-relaxed">
                    <span className="font-semibold">What to do:</span> {r.action}
                  </div>
                )}
              </li>
            ))}
          </ul>

          {review.note && (
            <p className="mt-3 text-[12.5px] text-slate-600 italic leading-relaxed border-l-2 border-slate-200 pl-3">
              {review.note}
            </p>
          )}

          {/* What your mentor decided about each part you wrote. Each one names the part and
              carries its own verdict, because "changes requested" on a delivery you cannot locate
              in your own work is not something you can act on. Every one of these is your mentor's
              own words — a machine grade never appears here, and never wears this band. */}
          {(review.comments ?? []).length > 0 && (
            <div className="mt-3">
              <div className="text-[10.5px] font-semibold tracking-[0.1em] uppercase text-slate-500 mb-1.5">
                On specific parts of your delivery
              </div>
              <ul className="space-y-1.5">
                {review.comments.map((c) => {
                  const v = VERDICT[c.kind];
                  return (
                    <li key={c.id} className={`rounded-lg ring-1 px-3 py-2 ${v.card}`}>
                      <div className="flex items-baseline gap-2 flex-wrap mb-0.5">
                        {c.anchorLabel && (
                          <span className="text-[10.5px] font-medium text-slate-500">
                            {c.anchorLabel}
                          </span>
                        )}
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.06em] ${v.pill}`}
                        >
                          {v.short}
                        </span>
                      </div>
                      <p className="text-[12.5px] text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {c.body}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {escalated && (
            <p className="mt-3 text-[12.5px] text-rose-800 leading-relaxed">
              This has been raised with the Programme Manager. It is not something to fix by
              resubmitting — someone will be in touch.
            </p>
          )}

          {review.needsAcknowledgement && (
            <div className="mt-3 border-t border-slate-200 pt-3">
              <p className="text-[12.5px] text-slate-600 leading-relaxed">
                This step stays open until you confirm you have read the note above. Nothing needs
                resubmitting — your work was accepted.
              </p>
              <button
                onClick={async () => {
                  setAcking(true);
                  try {
                    await deskApi.acknowledgeMentorFeedback(review.decisionId);
                    onAcknowledged?.();
                  } finally {
                    setAcking(false);
                  }
                }}
                disabled={acking}
                className="mt-2.5 inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-slate-900 text-white text-[12.5px] font-semibold hover:bg-slate-800 disabled:opacity-50 transition-colors"
              >
                {acking ? "Saving…" : "I've read this"}
              </button>
            </div>
          )}

          {review.advisory && (
            <p className="mt-3 text-[11.5px] text-slate-500 leading-relaxed border-t border-slate-200 pt-2.5">
              This is guidance from a practitioner reviewing your work. Your grade and your progress
              come from the AI assessment above and are not changed by it.
            </p>
          )}

          {!review.advisory && !review.needsAcknowledgement && !approved && !escalated && (
            <p className="mt-3 text-[11.5px] text-slate-500 leading-relaxed border-t border-slate-200 pt-2.5">
              This step has reopened and the work that followed it is on hold until you resubmit.
              You have been given an extra attempt for it.
            </p>
          )}

          {/* The signature rule. A person put their name to this, and the gate it was decided at
              is part of the record — both belong at the foot of the decision, not beside a heading. */}
          <div className="mt-4 pt-2.5 border-t border-slate-200 flex flex-wrap items-baseline gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.06em] text-slate-500">
            <span>
              {review.reviewerName} · {review.reviewerRole}
            </span>
            <span className="ml-auto">{review.gateName}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
