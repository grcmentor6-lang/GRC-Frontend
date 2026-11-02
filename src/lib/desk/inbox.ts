import type { Desk } from "./model";
import { stepKey, type Progress } from "./progress";
import { reached, type Here } from "./tools";

/**
 * Where each task message (inject) arrives: the step of its task it belongs to (owner, 30 Oct: messages
 * arrive at their step, not at the start of the week). A message not listed here arrives when its task is
 * reached. Filled task by task in the rework pass, by the builder who checks the message fits the step.
 */
export const INJ_AT: Record<string, number> = {
  // The outside-data drill: once the data rules are saved and the undertaking signed (step 3), and the
  // storage question answered (step 4), whose best option the drill's option A would otherwise hint at.
  "F1.1-J2": 5,
  // The Warsaw row's Polish-only act: once the GDPR row's office is read and checked (step 4) and the evidence-ref
  // question answered (step 5), whose best option the message's option C ("named in the addendum") would hint at.
  "F1.2-J1": 6,
  // Who the lead regulator is, as the brief is about to go in: the learner has read Section 2's four authorities
  // (step 3). Step 6 cites no section, so the addendum opens whole and the Guidance line's Section 1 can be read.
  "F1.3-J1": 6,
  // The aggregated sheet: right after D2 and the R05 check (step 3), whose answer it would give away. The Guidance
  // line's R05 is on Learn › Rule tables, open since step 3, and no document section needs reading.
  "F2.1-J1": 4,
  // The late undated file: at the hand-in, once every code is checked (step 3) and D2 answered (step 4): its reasons name
  // "altered", which would help with step 3. Step 5 reads Evidence › Defect Codes (`reads`), which the Guidance line names.
  "F2.2-J1": 5,
  // A client's 24-hour clock beside the law's 72: once D2 has settled that a contract binds (step 4) and every row is linked (step 5),
  // and before the clocks are compared. Step 6 cites no section, so BKB-POL-016 opens whole and the Guidance line can be read.
  "T3.1-J2": 6,
  // The same client's rows: at the hand-in, on OBL-REG's second sheet, outside the 15 rows step 6 has just fixed.
  "T3.1-J3": 8,
  // A row with a policy and a control but no procedure, pressed to show green: once every row is rated by R11 (step 4), whose
  // answers it would give away. Its Guidance line's R11 is on Learn › Rule tables, which step 5 opens; no document is needed.
  "T3.2-J1": 5,
  // The ninth requirement: at the hand-in, on MAP-XW's second sheet, outside the 8 rows steps 1 to 6 have worked and checked.
  "T3.2-J3": 7,
  // Q7, a requirement naming the Phoenix office: as POL-GAP opens, so it goes through steps 2 to 5 with the six dataset rows (it is why step 4 has two answers).
  "T4.1-J3": 2,
  // Phoenix's stricter password value beside the Group rule of Q2's redline: once every fix location is checked (step 4), whose test its options would give away,
  // and as the redlines are written. Step 5 cites BKB-POL-000 Section 5 (`extra`), so the Guidance line can be read in the document's window.
  "T4.1-J2": 5,
  // A KPI for the SOP: once its time limits are checked (step 2) and its roles chosen (step 3), as the learner reads BKB-POL-021 Section 5, where the
  // policy owner reports KPIs. Step 4 also cites Section 10, so the Guidance line can be read in the document's window.
  "T4.2-J1": 4,
  // The records the SOP leaves: at the hand-in, on SOP-DOC's third sheet, after step 5 has checked the outputs its rows would otherwise give away.
  "T4.2-J3": 6,
  // Pressure to change C07's sample: once the samples are checked (step 3) and the owners too (step 4), since it names C07's owner. Its Guidance line's Ref-Sampling is
  // on Learn › Reference pages (`refs.pages`, step 5), and step 5 is where the dates start: the sample is settled before it goes on a request.
  "T5.1-J1": 5,
  // The seventh control: at the hand-in, on PBC-LIST's second sheet, outside the six rows steps 1 to 6 have worked and checked.
  "T5.1-J3": 7,
  // A control with enough files but two sampled items missing: once step 4 has checked every gap by R18, whose answer it would otherwise state, and as the follow-ups are
  // written. Step 5 cites BKB-POL-016 Section 6.2, so the Guidance line can be read in the document's window.
  "T5.2-J2": 5,
  // The five late files: at the hand-in, on EVP-IDX's second sheet, outside the 42 files steps 2 to 4 have checked.
  "T5.2-J3": 6,
  // A named account HR does not know, in the campaign's next extract: at step 7, after step 5 has shown why a generic account is not U2. It is outside the 216, so it changes
  // nothing the learner is concluding. Its Guidance line's Ref-UAR codes is read at step 7 (`refs.pages`), for the severities.
  "T6.1-J1": 7,
  // The second system: at the hand-in, on UAR-TEST's fourth sheet, outside the sheets steps 1 to 7 have checked. Step 8 reads Learn › Reference pages and Record Result.
  "T6.1-J3": 8,
  // The outside offer of real payroll data: as the learner matches HR's leavers to the logs, when "checking against the real thing" is tempting. Nothing about the answers.
  "T6.2-J4": 2,
  // When the SLA's clock starts, on a leaver outside the 29: as the disable times are measured against the SLA, once R21 is read (step 3). Its Guidance line's R21 is on Learn › Rule tables.
  "T6.2-J1": 4,
  // A cloud region moving country: once C1 and C2 have shown what a change event is (step 7), and as the note is written. Step 8 cites BKB-POL-017 Section 3.1 for its Guidance line.
  "T7.1-J1": 8,
  // Event N4: at the hand-in, on RR-UPD's own sheet, outside the 28 rows steps 2 to 8 have checked and later tasks read.
  "T7.1-J3": 9,
  // The offer of real board minutes: as the learner compares each score with the last board report, when "checking against the real thing" is tempting. Nothing about the answers.
  "T7.2-J4": 2,
  // What leads a five-minute board slot: at the hand-in, once the Top-5 and its "so what" lines are checked (steps 1 and 3), whose work its options describe. Step 5 reads Learn › Rule tables for its Guidance line.
  "T7.2-J1": 5,
  // The offer of a live scanner login: as the learner reads each closure's scan, when "checking the real thing" is tempting. Nothing about the answers.
  "T8.1-J4": 5,
  // A system owner contests V-0119 on the memo's unverified list: once steps 5 and 6 have checked the closures and the counts, as the memo is written. Step 7 cites BKB-POL-010 Sections 6.1 and 10 for its Guidance line.
  "T8.1-J2": 7,
  // The hosting provider's stale report: once step 2 has checked S3 on Lumen's report and S5's failure. It shows S3 failing, which Lumen's own report cannot, and states nothing about the CUECs or R28. Guidance: Ref-SOC checks, Learn › Reference pages (`reads`, step 3).
  "T9.2-J1": 3,
  // What Lumen sent after the decision: at the hand-in, on SOC-EXTRA, once R28's decision is checked (step 4), which the sheet's items would otherwise colour.
  "T9.2-J3": 5,
  // Q4's two records the export missed: as the sampled records are walked, so they go through A1 to A6 with the rest. Nothing about the answers. They are why step 4 has two ratings.
  "T8.2-J3": 3,
  // The control owner against the 5 % reading of R19: once the conclusion is checked (step 5), whose answer it would state. Step 6 reads Learn › Rule tables for its Guidance line.
  "T8.2-J2": 6,
  // The business owner's push to lower Lumen's tier: once all three tiers are checked (step 2), whose answer it would state. Step 3 cites R27, and the Guidance line's R35 is on the same Learn › Rule tables.
  "T9.1-J2": 3,
  // An outsider's offer of a real data-subject request: as the learner maps how the data moves, when "seeing a real case" is tempting. Nothing about the answers.
  "T10.1-J4": 3,
  // REG-EXTRA, already on the sheet: as the office lines are read at step 6. No key, no answer in it.
  "T11.2-J3": 6,
  // Amsterdam's push-back on Article 19: once step 6 has checked the row, whose answer it would state. Step 7 cites BKB-POL-016 Section 7.2 for its Guidance line.
  "T11.2-J2": 7,
  // An AI tool coming to the LMS: at the hand-in, after step 5, whose AI trigger it would otherwise confuse. Step 6 cites R29 and BKB-POL-017 for its Guidance line.
  "T10.1-J1": 6,
  // An outsider's offer of the leaked file: as the learner reads the record's data categories, when "seeing what is really in it" is tempting. Nothing about the answers.
  "T10.2-J4": 5,
  // A second event, a stolen encrypted laptop: once step 5 has checked R30's exception on INC-2610-3001, whose answer it would otherwise colour. Step 6 reads R30 and BKB-POL-014 Section 6.2 for its Guidance line.
  "T10.2-J1": 6,
  // An outsider's offer of Lumen's signed contracts: at the step that reads Lumen's draft, where a real file would tempt.
  "T9.1-J4": 4,
  // An outsider's offer of a real brand's sign-in page: as the learner reads the simulation plan's pretext on the Phishing Campaign Planner, when realism tempts. Nothing about the approvals. Step 4 cites BKB-POL-020 Section 3.1 for its Guidance line.
  "T11.1-J4": 4,
  // Staff on leave in the simulation week: at the hand-in of AWR-SIM, once step 5 has checked what a rate is out of, which the options would otherwise give away. Step 6 cites BKB-POL-020 Section 7.1 for its Guidance line.
  "T11.1-J2": 6,
  // ACT-EXTRA's three rows: at the start, as the tracker is read, so A-20 to A-22 go through every test with the rest. Nothing about the answers.
  "T12.1-J3": 1,
  // Owners promising evidence that has not arrived: at the hand-in, after steps 2 to 7 have settled the status and D4 has held the page against an owner, whose answers it would state. Step 10 reads Learn › Rule tables for its Guidance line.
  "T12.1-J2": 10,
  // The auditor's checklist on NC-1: at the step that answers NC-1, when reading it would be tempting. Nothing about the response.
  "T12.2-J4": 7,
  // "Do we pass?": at the hand-in, once NC-1 has its response, which the message would otherwise colour. Step 8 cites BKB-POL-016 Section 6.2 for its Guidance line and reads ISO 19011 in Learn › Framework Quick Reference.
  "T12.2-J2": 8,
};

/** The messages placed at a step that still wait for the learner's reply: the step cannot be completed until they have one. */
export const waitingAt = (desk: Desk, p: Progress, taskId: string, n: number) => desk.tasks[taskId].inj.filter((id) => INJ_AT[id] === n && !p.msgs[id]);

/** A message has arrived: its task is reached and, if it belongs to a step, the learner has got to that step. */
export function released(desk: Desk, p: Progress, here: Here | null | undefined, id: string): boolean {
  const m = desk.inj[id];
  if (!m || !desk.tasks[m.task] || !reached(desk, p, here, m.task)) return false;
  const n = INJ_AT[id];
  if (!n || n === 1 || p.submitted[m.task]) return true;
  return (here?.task === m.task && here.n >= n) || !!p.done[stepKey(m.task, n - 1)] || !!p.done[stepKey(m.task, n)];
}
