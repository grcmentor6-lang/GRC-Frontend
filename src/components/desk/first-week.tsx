"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { OrgName } from "@/lib/desk/org-tone";
import { docNow, loadDoc, pick, type DocSection } from "@/lib/desk/docs";
import { aboutMin, firstAction, interviewCard, lastDone } from "@/lib/desk/first-week";
import { badgeOfTask } from "@/lib/desk/badges";
import { useDesk } from "./desk-context";
import { DocText } from "./doc-text";
import { ConfirmBar } from "./confirm-lock";
import { PartHead } from "./how-to";
import type { Task } from "@/lib/desk/model";

/** UX101 W10: Week 0, the ungraded warm-up. Nothing in this file touches `progress`, the record, a score or the certificate. */
export const WEEK0_KEY = "grc101.week0";
export const week0Seen = (who: string) => {
  try { return !!localStorage.getItem(`${WEEK0_KEY}:${who}`); } catch { return false; }
};
export const markWeek0 = (who: string, v: "skipped" | "done") => {
  try { localStorage.setItem(`${WEEK0_KEY}:${who}`, v); } catch { /* storage blocked: it is offered again next time */ }
};
export const TOUR_EVENT = "desk:tour";

const btn = "h-9 rounded bg-[#111827] px-4 text-[13px] font-semibold text-white hover:brightness-110 focus-ring";
const ghost = "h-9 rounded border border-[#D1D5DB] bg-white px-4 text-[13px] font-semibold text-[#111827] hover:bg-[#F7F8FA] focus-ring";

/** A practice choice: its feedback is local and costs nothing; the answers here belong to Week 0 only. */
function Practice({ rule, q, options, best, why }: { /** A made-up rule to read before choosing. */ rule?: string; q: string; options: string[]; best: number; why: string[] }) {
  const [chosen, setChosen] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [sure, setSure] = useState(false);
  return (
    <div data-w0-practice className="rounded border border-[#DDE1E8] bg-white px-4 py-3.5">
      {rule && <p data-w0-rule className="mb-2 border-l-[3px] border-[#B7791F] bg-[#FFFCF2] px-3 py-2 text-[14px] leading-[1.5] text-[#3F4757]"><span className="font-semibold text-[#111827]">Read first · </span>{rule}</p>}
      <p className="text-[14px] font-semibold text-[#111827]">{q}</p>
      <ul className="mt-2 grid gap-1.5">
        {options.map((o, i) => (
          <li key={o}>
            <label className={`flex cursor-pointer items-start gap-2.5 rounded border px-3 py-2 text-[14px] leading-[1.5] ${chosen === i ? "border-[#4338CA] bg-[#F3F4FF]" : "border-[#E3E6EC] hover:bg-[#FAFAFC]"}`}>
              <input type="radio" name={q} disabled={checked} checked={chosen === i} onChange={() => setChosen(i)} className="mt-1" />
              <span>{o}</span>
            </label>
          </li>
        ))}
      </ul>
      {!checked && !sure && (
        <button type="button" disabled={chosen === null} onClick={() => setSure(true)} className={`mt-3 ${btn} disabled:bg-[#E3E6EC] disabled:text-[#6B7280]`}>Check answer</button>
      )}
      {!checked && sure && (
        <ConfirmBar className="mt-3" message="On the real desk this locks your answer. Here you can try again." yes="Check it" onYes={() => { setChecked(true); setSure(false); }} onNo={() => setSure(false)} />
      )}
      {checked && chosen !== null && (
        <div role="status" className="mt-3 text-[14px] leading-[1.5] text-[#3F4757]">
          <p className="font-semibold text-[#111827]">{chosen === best ? "That is the best option." : `The best option is: ${options[best]}`}</p>
          <p className="mt-1">{why[chosen]}</p>
          <button type="button" onClick={() => { setChecked(false); setChosen(null); }} className={`mt-2 ${ghost}`}>Try again</button>
        </div>
      )}
    </div>
  );
}

/** Three dummy documents to sort, then checked: a small register, with a wrong cell costing nothing. */
const DOCS: [string, string, string][] = [
  ["Acme Visitor Log, March", "Record", "A dated list of who came in"],
  ["Acme Password Rule", "Policy", "A rule everyone must follow"],
  ["Acme Laptop Setup Steps", "Procedure", "How to do a job, step by step"],
];
function DummyRegister() {
  const [v, setV] = useState<Record<number, string>>({});
  const [shown, setShown] = useState(false);
  return (
    <div data-w0-register className="overflow-x-auto rounded border border-[#DDE1E8] bg-white">
      <table className="w-full min-w-[420px] border-collapse text-[13px]">
        <thead className="bg-[#F7F8FA] text-left text-[11px] uppercase tracking-[0.06em] text-[#5B6474]">
          <tr><th className="px-3 py-2">Document (dummy data)</th><th className="px-3 py-2">What it is</th><th className="px-3 py-2">Type</th></tr>
        </thead>
        <tbody>
          {DOCS.map(([name, what, sentence], i) => (
            <tr key={name} className="border-t border-[#E9ECF1]">
              <td className="px-3 py-2 font-medium">{name}</td>
              <td className="px-3 py-2 text-[#3F4757]">{sentence}</td>
              <td className="px-3 py-2">
                <select aria-label={`Type of ${name}`} value={v[i] ?? ""} onChange={(e) => { setV({ ...v, [i]: e.target.value }); setShown(false); }} className="h-8 rounded border border-[#C9CED8] bg-white px-1.5 text-[13px]">
                  <option value="">Choose…</option>
                  {["Policy", "Procedure", "Record"].map((o) => <option key={o}>{o}</option>)}
                </select>
                {shown && <span className={`ml-2 text-[12px] font-semibold ${v[i] === what ? "text-[#15803D]" : "text-[#B45309]"}`}>{v[i] === what ? "right" : `not quite: ${what}`}</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex flex-wrap items-center gap-3 border-t border-[#E9ECF1] bg-[#F7F8FA] px-3 py-2">
        <button type="button" onClick={() => setShown(true)} className={ghost}>Check my rows</button>
        <span className="text-[12px] text-[#5B6474]">Practice only. A wrong row here is not recorded.</span>
      </div>
    </div>
  );
}

/** A real section of a real SITL policy (SITL-POL-010 sections 1 to 3), read with two questions. */
function ReadPolicy() {
  const [secs, setSecs] = useState<DocSection[] | null>(() => { const d = docNow("SITL-POL-010"); return d ? pick(d, "1-3") : null; });
  useEffect(() => { if (!secs) loadDoc("SITL-POL-010").then((d) => setSecs(pick(d, "1-3"))); }, [secs]);
  return (
    <div className="grid gap-3">
      <p className="text-[14px] leading-[1.5] text-[#3F4757]">
        A policy is read in a fixed order: <strong>Purpose</strong> says why it exists, <strong>Scope</strong> says who and what it covers, and the <strong>policy statements</strong> say what must be done. Read the sections of SITL-POL-010 below, then answer.
      </p>
      <div className="max-h-[320px] overflow-y-auto rounded border border-[#E7D9A8] border-t-[3px] border-t-[#B7791F] bg-[#FFFCF2] px-4 py-3">
        {secs ? <DocText sections={secs} /> : <p className="text-[13px] text-[#5B6474]">Opening the policy…</p>}
      </div>
      <Practice
        q="Which section tells you WHO the policy applies to?"
        options={["Section 1, Purpose", "Section 2, Scope and applicability", "Section 3, Policy statements"]}
        best={1}
        why={["Purpose says why the policy exists, not who it covers.", "Scope names the systems and the organisations the policy covers.", "The statements say what must be done; look to Scope for who."]}
      />
      <Practice
        q="A scan finds a weakness that cannot be fixed in time. What does Section 3 say should happen?"
        options={["Nothing, it is allowed to stay open", "An exception with a compensating control and an expiry date, or the asset is isolated", "The finding is deleted from the report"]}
        best={1}
        why={["The policy never lets a finding stay open without cover.", "The policy statements say exactly this.", "A finding is never deleted: it is covered or the asset is isolated."]}
      />
    </div>
  );
}

/**
 * Week 0: a 60 to 90 minute warm-up before F1.1. Ungraded, never in a score, the record, the CV or the certificate, and
 * it moves no date: week 1 is still week 1. Shown on its own for a learner with no work, skippable, and reopened from
 * Learn › Week 0 orientation or `#W0`.
 */
export function Week0({ onSkip, onDone, tool }: { onSkip?: () => void; onDone?: () => void; /** Opened from Learn: no skip/start buttons. */ tool?: boolean }) {
  const { desk, progress } = useDesk();
  const act = firstAction(desk, progress);
  return (
    <div data-week0 className="mx-auto w-full max-w-[860px] px-4 py-6 max-sm:px-3">
      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#4338CA]">Week 0 · orientation · about 60 to 90 minutes</p>
      <h1 className="mt-1 text-[22px] font-bold text-[#111827]">Warm up before F1.1</h1>
      <p className="mt-1 text-[14px] leading-[1.5] text-[#3F4757]">
        Nothing here is graded or recorded. It never counts towards a score, your record, a badge or your certificate, and it does not change your dates: your first week is still Week 1.{!tool && " You can skip it and open it later from Learn."}
      </p>

      <section className="mt-5">
        <PartHead n={1} label="Tour the desk · 5 min" />
        <p className="text-[14px] leading-[1.5] text-[#3F4757]">A short walk past the weeks, the tasks, the steps and the tools.</p>
        <button type="button" onClick={() => window.dispatchEvent(new Event(TOUR_EVENT))} className={`mt-2 ${ghost}`}>Start the tour</button>
      </section>

      <section className="mt-6">
        <PartHead n={2} label="Practice task · 20 to 30 min" />
        <p className="mb-2 text-[14px] leading-[1.5] text-[#3F4757]">A made-up company, Acme. Read the rule, then choose, check, sort. On the real desk the rule that settles a question is shown first in the same way. Feedback is instant and a wrong answer costs nothing.</p>
        <div className="grid gap-3">
          <Practice
            rule="Acme Meeting Room Rule: a room is booked for two hours at most. A booking nobody has started 15 minutes after its start time is released, and the room is free for anyone."
            q="You booked a room at Acme from 10:00 to 12:00. You arrive at 10:20 and a colleague is using it. Whose room is it?"
            options={["Yours: your booking runs until 12:00", "Your colleague's: your booking was released", "Whoever is more senior"]}
            best={1}
            why={["It feels fair, but the rule says otherwise: nobody started the booking within 15 minutes, so it was released at 10:15.", "Right: the rule releases a booking not started within 15 minutes. The answer was in the rule, not in what seems fair.", "The rule says nothing about seniority. If the rule does not say it, do not decide by it."]}
          />
          <DummyRegister />
        </div>
      </section>

      <section className="mt-6">
        <PartHead n={3} label="How to read a policy · 20 to 30 min" />
        <ReadPolicy />
      </section>

      {!tool && (
        <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-[#DDE1E8] pt-4">
          <button type="button" data-w0-done onClick={onDone} className={btn}>I am ready: {act ? `go to ${act.task.id} step ${act.n}` : "open the desk"}</button>
          <button type="button" data-w0-skip onClick={onSkip} className={ghost}>Skip Week 0</button>
        </div>
      )}
    </div>
  );
}

/** "Pick up where you left off": the last step done and the next, with its length. A returning learner's first sight of the desk. */
export function ResumeCard({ onGo, onClose }: { onGo?: () => void; onClose?: () => void }) {
  const { desk, progress } = useDesk();
  const last = lastDone(desk, progress);
  const act = firstAction(desk, progress);
  if (!last || !act) return null;
  return (
    <section data-resume className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-[#C7CBF5] bg-[#F3F4FF] px-4 py-2.5 text-[13px] text-[#1E1B4B]">
      <Icon name="play" size={14} className="shrink-0 text-[#4338CA]" />
      <p className="min-w-0 flex-1 basis-60">
        <strong className="font-semibold">Pick up where you left off.</strong> You last finished {last.task.id} step {last.n}. Next: {act.task.id} step {act.n}, {aboutMin(act.minutes)}.
      </p>
      <button type="button" onClick={onGo} className={btn}>Go to step {act.n}</button>
      {onClose && <button type="button" onClick={onClose} aria-label="Hide" className="focus-ring grid h-7 w-7 place-items-center rounded text-[#5B6474] hover:bg-white"><Icon name="x" size={13} /></button>}
    </section>
  );
}

/** After a hand-in: what the task lets the learner say, from the task's own catalogue fields and nothing else. */
export function InterviewCard({ task }: { task: Task }) {
  const { desk } = useDesk();
  const c = interviewCard(task);
  const badge = badgeOfTask(task.id);
  return (
    <section data-interview aria-label="What you can now say in an interview" className="border-t border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3.5">
      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#15803D]">Task sealed · what you can now say in an interview</p>
      <p className="mt-1 text-[14px] font-medium leading-snug text-[#14532D]">{c.line}</p>
      <p className="mt-1 text-[14px] leading-[1.5] text-[#3F4757]">The skill this task builds: {c.skill}. For <OrgName org={task.org} orgs={desk.orgs} />.</p>
      <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px]">
        <Link href="/app/cv" className="font-semibold text-[#3730A3] underline-offset-2 hover:underline focus-ring">See it on your CV</Link>
        {badge ? (
          <Link href={`/app/badges#${badge.code}`} className="font-semibold text-[#3730A3] underline-offset-2 hover:underline focus-ring">Towards the {badge.name} badge</Link>
        ) : (
          <span className="text-[#5B6474]">This task earns no badge: it is the prerequisite for the others.</span>
        )}
      </p>
    </section>
  );
}
