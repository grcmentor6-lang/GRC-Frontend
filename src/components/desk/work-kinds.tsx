"use client";

import { waitingAt } from "@/lib/desk/inbox";
import { Fragment, useEffect, useState, useSyncExternalStore } from "react";
import { Icon } from "@/components/ui/icon";
import { useDesk } from "./desk-context";
import { isDecideCell, isFillCell, type Desk, type Step, type Task } from "@/lib/desk/model";
import { stepKey, type Progress, type RowsFeedback } from "@/lib/desk/progress";
import { api } from "@/lib/api";
import { gridKey, gridStatus } from "@/lib/desk/work";
import { BRIEFS, LADDER, REGISTERS, STUDY, briefOf, handedIn, regOf, compareOffices, joints, splitRow, splitRows, derivedAt, exposedRows, reportKey, briefFlags, briefSrcOk, givenLines, ladderSteps, addRow, type Register, addedBy, briefKey, briefStatus, cellOk, cellValue, liveRow, regEmpty, regKey, regRows, regStatus, removeRow, treeQuestions, type Ladder, type RowCheckSpec, type StudyPrompt, type ChecklistSpec } from "@/lib/desk/registers";
import { useDoc, useDocs } from "./doc-text";
import { RMF, dmyToIso, fileExts, fileNameOk, isDateRow, isoToDmy, openBefore, receiptHash, rmfAt, rmfExpected, rmfGiven, rmfKey, rmfMiss, same, submitCodes } from "@/lib/desk/forms";

/*
 * The work a "do" step asks for, in the shape the pack gives it (see workKind in lib/desk/model):
 * a register to fill, a value copied with its source, or a tick in the work log.
 */

/**
 * A task's register as the tool shows it, with the cells the pack leaves for the mentee as inputs.
 * Given cells are read-only; "◆" cells belong to a decision step and stay locked here. Read-only
 * after the task is submitted, and in a tool window opened for reading.
 */
export function GridWork({ taskId, toolKey, readOnly }: { taskId: string; toolKey: string; readOnly: boolean }) {
  const { desk, progress, update } = useDesk();
  const pl = desk.tp[toolKey]?.pl as { h?: string[]; r?: unknown[][]; note?: string } | undefined;
  const h = pl?.h ?? [];
  const rows = pl?.r ?? [];
  const gk = gridKey(taskId, toolKey);
  const fills = progress.grids?.[gk] ?? {};
  const set = (cell: string, v: string) => update((p) => ({ ...p, grids: { ...p.grids, [gk]: { ...(p.grids?.[gk] ?? {}), [cell]: v } } }));
  const th = "whitespace-nowrap border-b border-r border-[#DDE1E8] border-r-[#E9ECF1] px-3 py-[9px] font-semibold last:border-r-0";
  const td = "border-b border-r border-[#E9ECF1] align-top last:border-r-0";
  return (
    <div className="overflow-x-auto border-b border-[#DDE1E8] bg-white">
      <table className="w-full border-collapse text-[13px]">
        <thead className="bg-[#F7F8FA] text-left text-[11px] uppercase tracking-[0.06em] text-[#5B6474]">
          <tr>{h.map((x) => <th key={x} className={th}>{x}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={ri}>
              {r.map((c, ci) => {
                const cell = `${ri},${ci}`;
                if (isFillCell(c)) {
                  const v = fills[cell] ?? "";
                  return (
                    <td key={ci} className={`${td} p-0`}>
                      <input
                        value={v}
                        readOnly={readOnly}
                        onChange={(e) => set(cell, e.target.value)}
                        placeholder={String(c || "fill in")}
                        aria-label={`${h[ci] ?? "Cell"}, row ${ri + 1}`}
                        className={`block h-full min-h-[38px] w-full min-w-[110px] px-3 py-2 text-[13px] outline-none placeholder:italic placeholder:text-[#8A91A3] focus:bg-white focus:shadow-[inset_0_0_0_2px_#4338CA] ${
                          v.trim() ? "bg-white text-[#111827]" : "bg-[#EEF0FF]/70"
                        } ${readOnly ? "cursor-default" : ""}`}
                      />
                    </td>
                  );
                }
                return (
                  <td key={ci} className={`${td} px-3 py-2 ${ci === 0 ? "font-mono text-[12px] font-semibold text-[#111827]" : "text-[#3F4757]"}`}>
                    {isDecideCell(c) ? <span className="whitespace-nowrap text-[12px] font-semibold text-[#92400E]" title="Filled by a decision step">◆ decided in a decision step</span> : String(c)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Beside the register: what the step asks, and how far the register is. */
export function GridProgress({ task, s }: { task: Task; s: Step }) {
  const { desk, progress } = useDesk();
  const g = gridStatus(desk, progress, task.id, s.key);
  return (
    <div className="mt-3 grid gap-2">
      <p className="flex items-start gap-2 text-[13.5px] leading-relaxed text-[#111827]">
        <Icon name="edit" size={15} className="mt-0.5 shrink-0 text-[#4338CA]" />
        Fill the tinted cells on the left, in the register itself. Finish every row you start.
      </p>
      <dl className="grid grid-cols-2 border border-[#DDE1E8]">
        <div className="border-r border-[#DDE1E8] px-3 py-2">
          <dt className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5B6474]">Cells filled</dt>
          <dd className="font-mono text-[15px] font-semibold tabular-nums text-[#111827]">{g.filled} / {g.cells}</dd>
        </div>
        <div className="px-3 py-2">
          <dt className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5B6474]">Rows complete</dt>
          <dd className="font-mono text-[15px] font-semibold tabular-nums text-[#111827]">{g.complete}{g.started > g.complete ? ` · ${g.started - g.complete} half-done` : ""}</dd>
        </div>
      </dl>
    </div>
  );
}

const field = "w-full rounded border border-[#C9CED8] bg-white px-3 py-2 text-[14px] text-[#111827] placeholder:text-[#8A91A3] focus:border-[#4338CA] focus:outline-none focus:ring-2 focus:ring-[#4338CA]/15";

/** A value copied, and where it came from — both required, as the pack's "with evidence ref" says. */
export function CopyWork({ task, s, readOnly }: { task: Task; s: Step; readOnly: boolean }) {
  const { progress, update } = useDesk();
  const key = stepKey(task.id, s.n);
  const set = (k: string, v: string) => update((p) => ({ ...p, answers: { ...p.answers, [k]: v } }));
  return (
    <div className="mt-3 grid gap-3">
      <label className="grid gap-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#3F4757]">Value(s) copied</span>
        <textarea rows={3} readOnly={readOnly} value={progress.answers[key] ?? ""} onChange={(e) => set(key, e.target.value)} placeholder="Paste or type exactly what you copied." className={`${field} resize-y leading-[1.5]`} />
      </label>
      <label className="grid gap-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#3F4757]">Evidence ref — where it came from</span>
        <input readOnly={readOnly} value={progress.answers[`${key}#ref`] ?? ""} onChange={(e) => set(`${key}#ref`, e.target.value)} placeholder="Document and section, e.g. BKB-ADD-16 Section 2" className={field} />
      </label>
    </div>
  );
}

/** A platform action recorded as the pack asks: a tick in the work log, stamped with the time. */
export function LogWork({ task, s, readOnly }: { task: Task; s: Step; readOnly: boolean }) {
  const { progress, update } = useDesk();
  const key = stepKey(task.id, s.n);
  const at = progress.logs?.[key];
  const toggle = () =>
    update((p) => {
      const logs = { ...(p.logs ?? {}) };
      if (logs[key]) delete logs[key];
      else logs[key] = new Date().toISOString();
      return { ...p, logs };
    });
  return (
    <div className="mt-3 grid gap-3">
      <label className={`flex items-start gap-3 rounded border px-3 py-2.5 text-[14px] ${at ? "border-[#BBF7D0] bg-[#F0FDF4]" : "cursor-pointer border-[#DDE1E8] hover:border-[#C9CED8]"}`}>
        <input type="checkbox" checked={!!at} disabled={readOnly} onChange={toggle} className="mt-0.5 h-4 w-4 accent-[#16A34A]" />
        <span className="min-w-0">
          <span className="block font-medium text-[#111827]">I did this: {s.t}</span>
          <span className="mt-0.5 block text-[12px] text-[#5B6474]">
            {at ? `Logged ${new Date(at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })} in your work log` : "Ticking records it in your work log with the time."}
          </span>
        </span>
      </label>
      <label className="grid gap-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#3F4757]">Note (optional)</span>
        <input readOnly={readOnly} value={progress.answers[key] ?? ""} onChange={(e) => update((p) => ({ ...p, answers: { ...p.answers, [key]: e.target.value } }))} placeholder="Anything worth recording, e.g. the seed the platform gave" className={field} />
      </label>
    </div>
  );
}

/**
 * One table of READ-ME-FIRST, as the file has it: a label column and a column to fill. Each row
 * is checked against the screen it is copied from, since KR1 asks for an exact copy.
 */
export function RmfForm({ task, t, readOnly }: { task: Task; t: number; readOnly: boolean }) {
  const { desk, progress, update, start } = useDesk();
  const table = RMF.tables[t];
  const gk = rmfKey(task.id);
  const cells = progress.grids?.[gk] ?? {};
  const want = rmfExpected(desk, start, t);
  // Tables 1 and 3 arrive pre-filled (with slips) for the learner to check against the screen.
  const given = rmfGiven(desk, start, t);
  const checked = !!cells[rmfAt(t)];
  const screen = table.from.split("›").pop()!.trim();
  const set = (cell: string, v: string) => update((p) => ({ ...p, grids: { ...p.grids, [gk]: { ...(p.grids?.[gk] ?? {}), [cell]: v } } }));
  useEffect(() => {
    if (readOnly || !given || table.rows.some((_, i) => cells[`${t},${i}`] !== undefined)) return;
    update((p) => ({ ...p, grids: { ...p.grids, [gk]: { ...(p.grids?.[gk] ?? {}), ...Object.fromEntries(given.v.map((v, i) => [`${t},${i}`, v])) } } }));
    // Once, when the file is first opened.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="mt-3 grid gap-1.5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#3F4757]">
        {RMF.file} · table {t + 1} “{table.title}”
      </p>
      <p className="text-[12.5px] text-[#5B6474]">
        {given && !readOnly ? (
          <>Filled in for you by the programme office. Check each value against <strong className="font-semibold text-[#111827]">{table.from}</strong> and correct any that differ.</>
        ) : (
          <>Copy from <strong className="font-semibold text-[#111827]">{table.from}</strong>, exactly as written there.</>
        )}
      </p>
      <table className="w-full border-collapse border border-[#DDE1E8] text-[13px]">
        <tbody>
          {table.rows.map((r, i) => {
            const cell = `${t},${i}`;
            const v = cells[cell] ?? "";
            // A pre-filled table shows no flag before its check: the flag would point at the slips.
            const off = !!v.trim() && !same(v, want[i]) && (!given || checked || readOnly);
            return (
              <tr key={i}>
                <th scope="row" className="w-[38%] border-b border-r border-[#E9ECF1] bg-[#F7F8FA] px-3 py-2 text-left align-top font-mono text-[12px] font-semibold text-[#111827]">{r}</th>
                <td className="border-b border-[#E9ECF1] p-0 align-top">
                  {isDateRow(t, i) ? (
                    // A date picker; what is stored (and checked) is the pack's DD-MMM-YYYY.
                    <span className="block">
                      <input
                        type="date"
                        value={dmyToIso(v)}
                        readOnly={readOnly}
                        onChange={(e) => set(cell, isoToDmy(e.target.value))}
                        aria-label={`${table.title}: ${r}`}
                        aria-invalid={off}
                        className={`block min-h-[38px] w-full px-3 py-2 text-[13px] outline-none focus:shadow-[inset_0_0_0_2px_#4338CA] ${v.trim() ? "bg-white text-[#111827]" : "bg-[#EEF0FF]/70 text-[#8A91A3]"}`}
                      />
                      {v && <span className="block px-3 pb-1.5 font-mono text-[11.5px] text-[#5B6474]">Recorded as {v}</span>}
                    </span>
                  ) : (
                    <input
                      value={v}
                      readOnly={readOnly}
                      onChange={(e) => set(cell, e.target.value)}
                      aria-label={`${table.title}: ${r}`}
                      aria-invalid={off}
                      className={`block min-h-[38px] w-full px-3 py-2 text-[13px] outline-none placeholder:italic placeholder:text-[#8A91A3] focus:shadow-[inset_0_0_0_2px_#4338CA] ${v.trim() ? "bg-white text-[#111827]" : "bg-[#EEF0FF]/70"}`}
                    />
                  )}
                  {off && <span className="block px-3 pb-1.5 text-[12px] text-[#92400E]">Not what {screen} shows. Read “{r}” there again.</span>}
                  {given && checked && !off && !readOnly && (
                    <span data-rmf-verdict={given.why[i] ? "fixed" : "right"} className="block px-3 pb-1.5 text-[12px] text-[#14532D]">
                      {given.why[i] ? `Corrected. The file had “${given.v[i]}”. ${given.why[i]}` : `Right: matches ${screen}.`}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {given && !readOnly && <RmfCheck task={task} t={t} />}
    </div>
  );
}

/**
 * Handing in a deliverable the way every task does: each file named by the convention, then Submit,
 * which returns the receipt the pack describes: a hash of what was handed in and the UTC time.
 */
export function SubmitWork({ task, s, readOnly }: { task: Task; s: Step; readOnly: boolean }) {
  const { desk, progress, update } = useDesk();
  const key = stepKey(task.id, s.n);
  const codes = submitCodes(task, s);
  const files = codes.filter((c) => fileExts(task, c).length);
  const name = (c: string) => progress.answers[`${key}#${c}`] ?? "";
  const named = files.every((c) => fileNameOk(desk, task, c, name(c)));
  const waiting = openBefore(progress, task, s);
  const msgs = waitingAt(desk, progress, task.id, s.n).length; // a message placed at the hand-in is answered first
  // A register handed in here (F1.2 FAM-MAP) goes in with no empty cell in the columns it hands in.
  const gaps = handedIn(task.id, s.n).reduce((n, r) => n + regEmpty(desk, progress, task, s.n, r).length, 0);
  const at = progress.logs?.[key];
  const submit = async () => {
    const list = files.map((c) => name(c).trim());
    const hash = await receiptHash(desk, progress, task, list);
    update((p) => ({ ...p, logs: { ...(p.logs ?? {}), [key]: new Date().toISOString() }, answers: { ...p.answers, [key]: (list.length ? list : codes).join(", "), [`${key}#hash`]: hash } }));
  };
  return (
    <div className="mt-3 grid gap-3">
      {files.map((c) => {
        const v = name(c);
        const ok = fileNameOk(desk, task, c, v);
        const ext = fileExts(task, c);
        return (
          <div key={c} data-guide="file-name" className="grid gap-1.5">
            <label htmlFor={`fn-${key}-${c}`} className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#3F4757]">File name for {c} · saved in 02_Working</label>
            <input
              id={`fn-${key}-${c}`}
              data-guide="file-name-input"
              readOnly={readOnly}
              value={v}
              onChange={(e) => update((p) => ({ ...p, answers: { ...p.answers, [`${key}#${c}`]: e.target.value } }))}
              placeholder="Type the file name"
              aria-invalid={!!v.trim() && !ok}
              aria-describedby={`fp-${key}-${c}`}
              className={`${field} font-mono text-[13px]`}
            />
            {/* The naming convention, spelled out with this mentee's own values: the four parts, what
                each one is, and the joins. "Mentee ID, task, code, version" alone said what to look up,
                not where; every value is here. */}
            <div id={`fp-${key}-${c}`} className="rounded border border-[#E9ECF1] bg-[#F7F8FA] px-3 py-2.5">
              <p className="text-[12px] text-[#3F4757]">Four parts, in this order:</p>
              <ol className="mt-1.5 grid gap-1">
                {[
                  [desk.mentee, "your mentee ID"],
                  [task.id, "this task"],
                  [c, "this file's code"],
                  ["v1", "first version"],
                ].map(([part, what], i) => (
                  <li key={what} className="grid grid-cols-[16px_auto_1fr] items-baseline gap-x-2 text-[12px]">
                    <span className="text-right font-mono text-[11px] text-[#8A91A3]">{i + 1}</span>
                    <span className="font-mono text-[13px] font-semibold text-[#111827]">{part}</span>
                    <span className="text-[#5B6474]">{what}</span>
                  </li>
                ))}
              </ol>
              <p className="mt-2 text-[12px] text-[#3F4757]">
                Join them with an underscore <span className="font-mono font-semibold text-[#111827]">_</span> and end with{" "}
                <span className="font-mono font-semibold text-[#111827]">.{ext.join(" or .")}</span>
              </p>
            </div>
            {v.trim() && !ok && <span className="text-[12px] text-[#92400E]">Not quite. Type the four parts above in order, joined by _, then .{ext[0]}.</span>}
          </div>
        );
      })}
      {!files.length && <p className="text-[13.5px] text-[#3F4757]">{codes.join(", ") || "Your work"} is handed in on the platform; no file to name.</p>}
      {at ? (
        <dl data-guide="receipt" className="grid gap-1 rounded border border-[#BBF7D0] bg-[#F0FDF4] px-3 py-2.5 text-[12.5px] text-[#14532D]">
          <dt className="text-[11px] font-semibold uppercase tracking-[0.08em]">Receipt</dt>
          <dd>{progress.answers[key]}</dd>
          <dd className="break-all font-mono text-[11.5px]">SHA-256 {progress.answers[`${key}#hash`]}</dd>
          <dd className="font-mono text-[11.5px]">{at.replace("T", " ").slice(0, 19)} UTC</dd>
        </dl>
      ) : null}
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-3">
          <button data-guide="submit" type="button" disabled={!named || waiting.length > 0 || gaps > 0 || msgs > 0} onClick={submit} className="h-9 rounded bg-[#111827] px-4 text-[13px] font-semibold text-white hover:brightness-110 disabled:cursor-not-allowed disabled:bg-[#E3E6EC] disabled:text-[#8A91A3]">
            {at ? "Submit again" : "Submit"}
          </button>
          {msgs > 0 ? (
            <span className="text-[12.5px] text-[#5B6474]">Reply to your message in the Inbox first.</span>
          ) : waiting.length > 0 ? (
            <span className="text-[12.5px] text-[#5B6474]">Finish step{waiting.length > 1 ? "s" : ""} {waiting.join(", ")} first.</span>
          ) : gaps > 0 ? (
            <span className="text-[12.5px] text-[#5B6474]">Fill the {gaps} empty cell{gaps > 1 ? "s" : ""} first.</span>
          ) : null}
        </div>
      )}
    </div>
  );
}

/**
 * A task's template register (lib/desk/registers): worked rows read-only, the mentee's rows with the
 * current step's columns open — a drop-down where the template or step gives options — and the rest
 * shown as filled so far. A register built from nothing takes rows from the steps that add them, up
 * to its target. Read-only in a reading window and after submission.
 */
const addendumOf = (desk: Desk) => (desk.orgs.A as { addendum?: string }).addendum ?? "The addendum";
/** "D–G": the first and last of the columns a register hands in. */
const handInSpan = (reg: Register) => {
  const c = reg.handIn!.cols.map((ci) => reg.cols[ci].h.split(" ")[0]);
  if (!c.every((x) => /^[A-Z]$/.test(x))) return reg.handIn!.cols.map((ci) => reg.cols[ci].h).join(", ");
  return c.length > 1 ? `${c[0]}–${c[c.length - 1]}` : c[0];
};

/** A list of IDs, each item on one line ("E-015 Accept"): a line break falls between items, never inside an ID. */
const listed = (v: string) =>
  v ? v.split(", ").map((x, i, a) => <Fragment key={i}><span className="whitespace-nowrap">{x}</span>{i < a.length - 1 ? ", " : ""}</Fragment>) : "";

/** A reason with every hyphenated ID ("E-035", "temp-user-99") kept on one line: a line never breaks inside one. */
const keepIds = (t: string) => t.split(/([A-Za-z][A-Za-z0-9]*-[A-Za-z0-9-]*[A-Za-z0-9])/).map((x, i) => (i % 2 ? <span key={i} className="whitespace-nowrap">{x}</span> : x));

/** A phone-width screen (≤ 600 px), where a checked row's reason moves under the row. */
const PHONE = "(width < 600px)";
const usePhone = () =>
  useSyncExternalStore(
    (cb) => { const m = window.matchMedia(PHONE); m.addEventListener("change", cb); return () => m.removeEventListener("change", cb); },
    () => window.matchMedia(PHONE).matches,
    () => false,
  );

export function RegisterWork({ task, s, readOnly, of }: { task: Task; s?: Step; readOnly: boolean; /** One of several registers a step hands in. */ of?: Register }) {
  const { desk, progress, update, here } = useDesk();
  const phone = usePhone();
  const reg = (of ?? regOf(task.id, s?.n ?? (here?.task === task.id ? here.n : undefined)) ?? REGISTERS[task.id])!;
  const gk = regKey(task.id, reg.code);
  const rows = regRows(reg, progress, task.id);
  const open = new Set(readOnly || !s ? [] : (reg.steps[s.n] ?? []));
  const adding = !readOnly && !!s && !!reg.grow && reg.grow.adds[s.n] !== undefined;
  // The trimming step (T3.1 step 6) removes rows; it adds none.
  const trimming = !readOnly && !!s && reg.grow?.trim === s.n;
  const full = !!reg.grow && rows.length >= (reg.grow.cap ?? reg.grow.target);
  const edit = (fn: (c: Record<string, string>) => Record<string, string>) => update((p) => ({ ...p, grids: { ...p.grids, [gk]: fn(p.grids?.[gk] ?? {}) } }));
  const set = (cell: string, v: string) => edit((c) => ({ ...c, [cell]: v }));
  // A value the column reads (`cells`) is recorded in its proper form once the mentee leaves the cell.
  const tidy = (ri: number, ci: number) => {
    const v = cellValue(reg, progress, task.id, ri, ci);
    const fixed = reg.cells?.[ci]?.fix(v, liveRow(reg, progress, task.id, ri), desk, ri, addedBy(reg, progress, task.id, ri));
    if (fixed && fixed !== v) set(`${ri},${ci}`, fixed);
  };
  const th = "whitespace-nowrap border-b border-r border-[#DDE1E8] border-r-[#E9ECF1] px-3 py-[9px] text-left font-semibold last:border-r-0";
  const td = "border-b border-r border-[#E9ECF1] align-top last:border-r-0";
  // A working step shows what it needs and no more: the row's identity (the columns before the first
  // one it fills), the columns it fills, and nothing a later step fills. Column A goes when every row
  // shown belongs to one organisation, and the worked rows fold away behind one line.
  // The report step (F2.2 step 4) works on one column it does not fill: each row's "Report data issue".
  const reporting = !!s && !readOnly && reg.report?.step === s.n;
  const working = !!s && !readOnly && (open.size > 0 || reporting || !!reg.view?.[s.n]);
  // The hand-in step (F1.2 step 6): the mentee's rows, the columns handed in, every empty cell marked.
  const checking = !!s && !readOnly && reg.handIn?.step === s.n;
  const empty = checking ? new Set(regEmpty(desk, progress, task, s!.n, reg)) : new Set<string>();
  const [showWorked, setShowWorked] = useState(false);
  const [showEarlier, setShowEarlier] = useState(false);
  const firstOpen = Math.min(...open);
  // A column written from the ones this step fills is shown filling itself beside them.
  const stepCols = new Set(Object.values(reg.steps).flat());
  const derivedHere = (ci: number) => !stepCols.has(ci) && !reg.derived?.[ci]?.quiet && !!reg.derived?.[ci]?.from.some((c) => open.has(c));
  // A checklist step (F2.2 step 2) shows each check's cell beside it: the table names the row only.
  const checkingList = !!s && !readOnly && !!reg.checklist?.[s.n];
  const ident = (ci: number) => (checkingList ? ci <= 1 : reg.ident ? reg.ident.includes(ci) : ci < firstOpen && ci > 0);
  // The row's name stays in view when the table scrolls sideways (F1.2: the Standard column).
  const stick = reg.ident ? reg.ident[0] : 1;
  // Copies are checked against the addendum on screen: re-render once it has loaded.
  useDoc(addendumOf(desk));
  useDocs(reg.load ?? []);
  // On a phone a list column moves to a full-width line under its row (`list`).
  const under = (ci: number) => (phone ? !!reg.cols[ci].list || !!reg.cols[ci].prose : reg.cols[ci].prose === "always") && !(s && reg.steps[s.n]?.includes(ci));
  const shown = (ci: number) => !under(ci) && shownAll(ci);
  const shownAll = (ci: number) =>
    reporting ? ci === 0 || ci === 1 || ci === reg.report!.col : s && reg.view?.[s.n]?.includes(ci) ? true : checking ? (reg.handIn!.ident ? reg.handIn!.ident.includes(ci) : ident(ci)) || reg.handIn!.cols.includes(ci) : !working || open.has(ci) || derivedHere(ci) || ident(ci);
  const awaits = (ri: number, ci: number) => !!reg.awaiting?.[ci]?.(liveRow(reg, progress, task.id, ri), ri, addedBy(reg, progress, task.id, ri));
  const awaitingRows = working ? rows.filter((r, ri) => reg.mine(r, desk) && [...open].some((ci) => awaits(ri, ci))) : [];
  // Copy down: once the first of the mentee's rows holds an allowed value, the rest can take it.
  const downCol = s && working ? reg.fillDown?.[s.n] : undefined;
  const mineIdx = rows.map((_, ri) => ri).filter((ri) => reg.mine(rows[ri], desk) && (downCol === undefined || !awaits(ri, downCol)));
  const downFrom = downCol !== undefined && mineIdx.length ? cellValue(reg, progress, task.id, mineIdx[0], downCol) : "";
  const downOk = downCol !== undefined && !!downFrom && cellOk(reg, desk, progress, task.id, rows, mineIdx[0], downCol);
  const downLeft = downCol !== undefined ? mineIdx.filter((ri) => !cellOk(reg, desk, progress, task.id, rows, ri, downCol)) : [];
  const workedCount = reg.rows.filter((r) => !reg.mine(r, desk)).length;
  // A consistency step (T3.2 step 12): the rows its last check flagged, fixed in place.
  const cons = s && !readOnly && reg.consistency?.step === s.n ? reg.consistency : undefined;
  const flagged = cons ? (progress.answers[`${stepKey(task.id, s!.n)}#checked`] ?? "").split(",").filter((x) => x && x !== "none").map(Number) : [];
  // A finding step (STUDY): only the worked rows, their cells clickable, the mentee's own rows folded
  // to one line. The step is about how a finished row looks, so those are the rows on the screen.
  const ladder = s && !readOnly ? LADDER[task.id]?.[s.n] : undefined;
  // A ladder step reads the same worked rows; nothing is clicked, its row is lit.
  const study = s && !readOnly ? (STUDY[task.id]?.[s.n] ?? (ladder ? [] : undefined)) : undefined;
  // A template with no worked rows (T3.2 LI-SOA): a finding step reads the template's own rows.
  const studyAll = !!study && workedCount === 0;
  const ladderDone = !!ladder && (progress.acks[s ? stepKey(task.id, s.n) : ""] ?? []).includes("done");
  const sk = s ? stepKey(task.id, s.n) : "";
  const found = study ? (progress.acks[sk] ?? []) : [];
  const active = study?.find((q) => !found.includes(q.id));
  const foundAt = new Set(study ? study.map((q) => progress.answers[`${sk}#${q.id}`]).filter(Boolean) : []);
  const missAt = study ? progress.answers[`${sk}#miss`] : undefined;
  const pick = (ri: number, ci: number) => {
    if (!active) return;
    const cell = `${ri},${ci}`;
    const hit = ci === active.col && (!active.row || active.row(rows[ri].map(String)));
    update((p) => hit
      ? { ...p, acks: { ...p.acks, [sk]: [...(p.acks[sk] ?? []), active.id] }, answers: { ...p.answers, [`${sk}#${active.id}`]: cell, [`${sk}#miss`]: "" } }
      : { ...p, answers: { ...p.answers, [`${sk}#miss`]: cell } });
  };
  const mineCount = rows.filter((r) => reg.mine(r, desk)).length;
  // A tree step (F2.1 step 2): its path and tier are written by the walk beside the table, never typed.
  // A row's path cell picks that row for the walk; the row being walked is lit.
  const tree = s && working ? reg.tree?.[s.n] : undefined;
  // A checklist step (F2.2 step 2) the same way: its decision cell picks the row to check.
  const chk = s && working ? reg.checklist?.[s.n] : undefined;
  const walkCol = tree?.path ?? chk?.col;
  // Once the step's answers are checked its rows are locked: no row is walked again.
  const rowsChecked = !!s && !!reg.checkRows?.[s.n] && !!progress.rowChecks?.[`${task.id}-${s.n}`];
  const walking = walkCol !== undefined && !rowsChecked ? treeRow(reg, desk, progress, task.id, s!.n, walkCol) : undefined;
  const reported = reporting ? (progress.answers[reportKey(task.id, s!.n)] ?? "").split(",").filter((x) => x && x !== "none").map(Number) : [];
  const reportMiss = reporting ? progress.answers[`${sk}#miss`] : undefined;
  const toggleReport = (ri: number) => {
    const exposed = exposedRows(reg, desk).includes(ri);
    if (!exposed && !reported.includes(ri)) return update((p) => ({ ...p, answers: { ...p.answers, [`${sk}#miss`]: String(ri) } }));
    const next = reported.includes(ri) ? reported.filter((x) => x !== ri) : [...reported, ri];
    update((p) => ({ ...p, answers: { ...p.answers, [reportKey(task.id, s!.n)]: next.join(","), [`${sk}#miss`]: "" } }));
  };
  // In a finding step the first column names the row when the rows differ (F2.1's Asset ID); one
  // organisation on every row (F1.2) is named above the table instead. Columns the worked rows leave
  // empty (a later step's) are not shown.
  const worked = rows.map((_, ri) => ri).filter((ri) => studyAll || !reg.mine(rows[ri], desk));
  const sameFirst = worked.every((ri) => rows[ri][0] === rows[worked[0]]?.[0]);
  // A later step's column the worked rows give nothing for is hidden too (F2.2 Fix: "—" by itself).
  const studyHide = (ci: number) => (ci === 0 && sameFirst) || worked.every((ri) => !cellValue(reg, progress, task.id, ri, ci)) || (stepCols.has(ci) && worked.every((ri) => !rows[ri][ci]));
  const filledBy = new Set([...Object.values(reg.steps).flat(), ...Object.keys(reg.derived ?? {}).map(Number)]);
  const firstFill = Math.min(...Object.keys(reg.steps).map(Number));
  return (
    <div data-guide="register" className="overflow-x-auto border-b border-[#DDE1E8] bg-white">
      <p className="sticky left-0 flex items-center gap-2 border-b border-[#E9ECF1] bg-[#F7F8FA] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5B6474]">
        <span>
          {reg.title}
          {!study && (!working || showWorked) && reg.rows.some((r) => !reg.mine(r, desk)) && (
            <> · <span className="text-[#3730A3]">your rows</span> · <span className="text-[#8A91A3]">worked examples (grey)</span></>
          )}
        </span>
        {reg.grow && <span className={`ml-auto font-mono tabular-nums ${full ? "text-[#15803D]" : "text-[#3F4757]"}`}>{rows.length} / {reg.grow.target} rows</span>}
      </p>
      {working && s && reg.helper?.[s.n] && (
        // Where every row's answer is read, said once: the same place serves all of them.
        <p data-guide="facts" className="sticky left-0 flex items-center gap-2 border-b border-[#E9ECF1] bg-[#FFFBF2] px-3 py-2 text-[12.5px] text-[#78350F]">
          <span className="h-[7px] w-[7px] shrink-0 rounded-full bg-[#F59E0B]" aria-hidden />
          <span>What kind of instrument each standard is: read it in <strong className="font-semibold">Learn › Framework Quick Reference</strong>.</span>
        </p>
      )}
      {awaitingRows.length > 0 && (
        // Rows the pack gives no content for in this step's column: said once, above the table.
        <p data-guide="awaiting" className="sticky left-0 flex items-start gap-2 border-b border-[#E9ECF1] bg-[#F7F8FA] px-3 py-2 text-[12.5px] leading-snug text-[#3F4757]">
          <Icon name="info" size={14} className="mt-px shrink-0 text-[#5B6474]" />
          {reg.awaitingNote ? (
            <span><strong className="font-semibold">Awaiting content:</strong> {reg.awaitingNote(desk, s?.n)}</span>
          ) : (
            <span>
              <strong className="font-semibold">Awaiting content:</strong> {awaitingRows.map((r) => String(r[1]).split(" (")[0]).join(" and ")}.{" "}
              {addendumOf(desk)} names {awaitingRows.length > 1 ? "them" : "it"} in no office row of Section 2, and Section 3 does not say &ldquo;all offices&rdquo;. The programme is adding this; leave {awaitingRows.length > 1 ? "these cells" : "this cell"} as {awaitingRows.length > 1 ? "they are" : "it is"}.
            </span>
          )}
        </p>
      )}
      {/* Not on a register the step itself fills (T6.2 LVR-KPI): its own work and check say what is left. */}
      {checking && open.size === 0 && (
        <p data-guide="empty-check" className={`sticky left-0 flex items-center gap-2 border-b px-3 py-2 text-[12.5px] ${empty.size ? "border-[#FDE68A] bg-[#FFFBEB] text-[#78350F]" : "border-[#BBF7D0] bg-[#F0FDF4] text-[#14532D]"}`}>
          <Icon name={empty.size ? "info" : "checkCircle"} size={14} className="shrink-0" />
          {empty.size
            ? `${empty.size} empty cell${empty.size > 1 ? "s" : ""} in columns ${handInSpan(reg)} of your rows, marked amber. Fill ${empty.size > 1 ? "them" : "it"} in the step that fills the column.`
            : `No empty cell in columns ${handInSpan(reg)} of your ${mineCount} rows.`}
        </p>
      )}
      {study && (
        <p className="sticky left-0 flex items-center gap-2 border-b border-[#E9ECF1] bg-[#F7F8FF] px-3 py-2 text-[12.5px] text-[#3730A3]">
          <Icon name="info" size={14} className="shrink-0" />
          {studyAll && Object.values(reg.steps).some((c) => c.length) ? `${reg.code} lists ${rows.length} rows. Your decisions fill them from step ${firstFill}.` : studyAll || mineCount === 0 ? `${reg.code} is given and fixed: ${rows.length} rows, read-only.` : <>Showing the {rows.length - mineCount} worked rows {sameFirst ? `of ${rows[worked[0]]?.[0]}` : `(${worked.map((ri) => rows[ri][0]).join(", ")})`}. Your {mineCount} rows are filled from step {firstFill}, the same way.</>}
        </p>
      )}
      <table className="w-full border-collapse text-[13px]">
        <thead className="bg-[#F7F8FA] text-[11px] uppercase tracking-[0.06em] text-[#5B6474]">
          <tr>
            {/* In a finding step column A is the same organisation on every row: named above instead. */}
            {reg.cols.map((c, ci) => (study && studyHide(ci)) || !shown(ci) ? null : <th key={c.h} style={c.wrap ? { whiteSpace: "normal", minWidth: c.w ?? 110 } : c.w ? { minWidth: c.w } : undefined} title={working && derivedHere(ci) ? "Filled by itself from the columns you fill" : tree && open.has(ci) ? "Written by the walk beside the table" : undefined} className={`${th} ${(working || checking || study) && ci === stick ? "sticky left-0 z-[1] bg-[#F7F8FA] shadow-[1px_0_0_#DDE1E8]" : ""} ${open.has(ci) || (study && filledBy.has(ci)) ? "bg-[#EEF0FF] text-[#3730A3]" : ""} ${c.auto ? "sticky left-0 z-[1] bg-[#F7F8FA] shadow-[1px_0_0_#DDE1E8]" : ""}`}>{c.h}</th>)}
            {(adding || trimming) && <th className={th}><span className="sr-only">Remove</span></th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => {
            const mine = reg.mine(r, desk);
            const by = reg.grow ? addedBy(reg, progress, task.id, ri) : 0;
            if (study && mine && !studyAll) return null;
            // A step that works on some rows only (T3.2 steps 10–11: the deep-dive controls).
            if (s && !readOnly && reg.only?.[s.n] && !reg.only[s.n](r.map(String), progress)) return null;
            if (cons && !flagged.includes(ri)) return null;
            const lit = !!ladder && ladder.row(r.map(String));
            if (study)
              return (
                <tr key={ri} data-guide={lit ? "ladder-row" : undefined} className={lit ? "bg-[#F7F8FF] shadow-[inset_3px_0_0_#4338CA]" : ""}>
                  {reg.cols.map((c, ci) => {
                    if (studyHide(ci)) return null;
                    const v = cellValue(reg, progress, task.id, ri, ci);
                    const cell = `${ri},${ci}`;
                    const tone = foundAt.has(cell) || (lit && ladderDone && ci === ladder!.col) ? "bg-[#DCFCE7] text-[#14532D] font-semibold shadow-[inset_0_0_0_2px_#16A34A]" : missAt === cell ? "bg-[#FEF3C7] shadow-[inset_0_0_0_2px_#F59E0B]" : ladder ? "" : "hover:bg-[#EEF0FF]";
                    return (
                      // The row's name stays in view when the table scrolls sideways.
                      <td key={ci} className={`${td} p-0 ${ci === stick ? "sticky left-0 z-[1] bg-white shadow-[1px_0_0_#DDE1E8]" : ""}`}>
                        <button
                          type="button"
                          onClick={() => pick(ri, ci)}
                          disabled={!active || !!ladder}
                          aria-label={`${c.h}, ${r[1]}: ${v || "empty"}`}
                          className={`block min-h-[38px] w-full px-3 py-2 text-left text-[13px] text-[#111827] focus-ring disabled:cursor-default ${tone}`}
                        >
                          {v}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            if ((working || checking) && !mine && !showWorked) return null;
            // An adding step works on its own new rows: the earlier steps' rows fold behind one line.
            if (adding && by !== s!.n && !showEarlier) return null;
            // A checked row's reason: beside the answer on a wide screen; on a phone, full width under the row,
            // since the verdict column can sit past the screen's edge (owner, 28 Oct 2026).
            const rcRow = s ? reg.checkRows?.[s.n] : undefined;
            const rowFb = rcRow && mine && shown(rcRow.col) ? progress.rowChecks?.[`${task.id}-${s!.n}`]?.rows[cellValue(reg, progress, task.id, ri, rcRow.label)] : undefined;
            return (
              <Fragment key={ri}>
              <tr data-row={ri} className={mine ? (walking === ri ? "bg-[#F7F8FF] shadow-[inset_3px_0_0_#4338CA]" : "") : "bg-[#FAFAFB] text-[#8A91A3]"}>
                {reg.cols.map((c, ci) => {
                  if (!shown(ci)) return null;
                  const v = cellValue(reg, progress, task.id, ri, ci);
                  const cell = `${ri},${ci}`;
                  const label = `${c.h}, row ${ri + 1}`;
                  // Awaiting even where a split copied a value in (T3.1: an article the new duty does not name).
                  if (mine && !r[ci] && (!v.trim() || reg.split) && awaits(ri, ci))
                    return (
                      <td key={ci} className={`${td} px-3 py-2 text-[12.5px] italic text-[#8A91A3]`} title="Not in the pack yet: see the note above the table">
                        Awaiting content
                      </td>
                    );
                  // A per-row decision already checked: the pick, locked, with its verdict and reason. First,
                  // so that a walk's tier, or a value the platform records, shows it too.
                  const rc = s ? reg.checkRows?.[s.n] : undefined;
                  const fb = rc && ci === rc.col && mine ? progress.rowChecks?.[`${task.id}-${s!.n}`]?.rows[cellValue(reg, progress, task.id, ri, rc.label)] : undefined;
                  if (fb)
                    return (
                      <td key={ci} data-verdict={fb.correct === true ? "right" : fb.correct === false ? "wrong" : "unscored"} className={`${td} px-3 py-2 ${fb.correct === true ? "bg-[#F0FDF4]" : fb.correct === false ? "bg-[#FFFBEB]" : "bg-[#F7F8FA]"}`}>
                        <span className="flex items-start gap-1.5 text-[13px] font-medium text-[#111827]">
                          <Icon name={fb.correct === true ? "checkCircle" : "info"} size={14} className={`mt-0.5 shrink-0 ${fb.correct === true ? "text-[#15803D]" : fb.correct === false ? "text-[#B45309]" : "text-[#5B6474]"}`} />
                          {fb.pick}
                        </span>
                        {fb.correct !== true && fb.best && (
                          <span className="mt-0.5 block text-[12px] text-[#78350F]">
                            {fb.correct === false ? "Answer: " : "Answer (not one of the options): "}
                            <strong className="font-semibold">{fb.best}</strong>
                          </span>
                        )}
                        <span className="mt-0.5 block max-w-[280px] text-[12px] leading-snug text-[#5B6474] max-[600px]:hidden">{keepIds(fb.why)}</span>
                      </td>
                    );
                  if (walkCol !== undefined && mine && ci === walkCol)
                    return (
                      <td key={ci} className={`${td} p-0`}>
                        <button
                          type="button"
                          data-walked={v ? "true" : undefined}
                          disabled={rowsChecked}
                          onClick={() => update((p) => ({ ...p, answers: { ...p.answers, [`${sk}#row`]: String(ri) } }))}
                          aria-label={tree ? `Walk the tree for ${r[0]}` : `Check ${r[0]} against the checklist`}
                          className={`block min-h-[38px] w-full min-w-[170px] px-3 py-2 text-left text-[12.5px] leading-snug focus-ring enabled:hover:bg-[#EEF0FF] disabled:cursor-default ${v ? "text-[#111827]" : "italic text-[#8A91A3]"}`}
                        >
                          {v || (walking === ri ? (tree ? "Walking it now" : "Checking it now") : tree ? "Not walked yet" : "Not checked yet")}
                        </button>
                      </td>
                    );
                  if ((tree && mine && ci === tree.tier) || (chk?.codes === ci && mine))
                    return <td key={ci} className={`${td} whitespace-nowrap px-3 py-2 ${v ? "font-medium text-[#111827]" : "text-[#C9CED8]"}`}>{v || "—"}</td>;
                  if (reporting && mine && ci === reg.report!.col)
                    return (
                      <td key={ci} className={`${td} px-3 py-2`}>
                        <span className="block text-[#111827]">{v}</span>
                        {!readOnly && (
                          <button
                            type="button"
                            data-reported={reported.includes(ri) ? "true" : undefined}
                            onClick={() => toggleReport(ri)}
                            aria-label={`Report data issue: ${r[0]}`}
                            className={`mt-1.5 inline-flex h-7 items-center gap-1 rounded border px-2 text-[12px] font-semibold focus-ring ${reported.includes(ri) ? "border-[#BBF7D0] bg-[#F0FDF4] text-[#15803D]" : "border-[#C9CED8] bg-white text-[#3F4757] hover:border-[#4338CA]"}`}
                          >
                            {reported.includes(ri) ? <><Icon name="check" size={12} /> Reported · undo</> : "Report data issue"}
                          </button>
                        )}
                        {reportMiss === String(ri) && <span className="mt-1 block max-w-[240px] text-[12px] leading-snug text-[#92400E]">Its content note says {v}: nothing to report here.</span>}
                      </td>
                    );
                  // A value the platform writes on this row (F2.2: an accepted item's defect code "none").
                  if (mine && open.has(ci) && derivedAt(reg, progress, task.id, ri, ci) !== null)
                    return <td key={ci} className={`${td} ${c.wrap ? "" : "whitespace-nowrap"} px-3 py-2 text-[#3F4757]`} title="Recorded by itself">{v}</td>;
                  if (mine && !r[ci] && !c.auto && open.has(ci) && (!adding || by === s!.n)) {
                    const base = `block min-h-[38px] w-full min-w-[150px] px-3 py-2 text-[13px] outline-none focus:shadow-[inset_0_0_0_2px_#4338CA] ${v.trim() ? "bg-white text-[#111827]" : "bg-[#EEF0FF]/70"}`;
                    const opts = c.opts === "step" ? s?.opt : typeof c.opts === "function" ? c.opts(desk, liveRow(reg, progress, task.id, ri)) : c.opts;
                    const rule = reg.cells?.[ci];
                    const off = !!rule && !!v.trim() && rule.fix(v, liveRow(reg, progress, task.id, ri), desk, ri, by) === null;
                    return (
                      <td key={ci} className={`${td} p-0`}>
                        {opts && opts.some((o) => o.length > 40) ? (
                          // A select cannot wrap: where the options are sentences (T7.2's "so what" lines) the chosen one would be
                          // cut at the cell's edge. The cell shows it wrapped in full; the select, invisible, lies over it and takes
                          // the click and the keyboard. Short drop-downs stay native.
                          <div className="relative focus-within:shadow-[inset_0_0_0_2px_#4338CA] max-[600px]:max-w-[230px]">
                            <span aria-hidden data-chosen className={`${base.replace(/focus:\S+/, "")} whitespace-normal pr-8 leading-snug ${v ? "" : "text-[#3F4757]"}`}>{v || "Choose…"}</span>
                            <Icon name="chevronDown" size={14} className="pointer-events-none absolute right-2.5 top-3 text-[#3F4757]" />
                            <select value={v} onChange={(e) => set(cell, e.target.value)} aria-label={label} aria-invalid={off} className="absolute inset-0 h-full w-full cursor-pointer opacity-0">
                              <option value="">Choose…</option>
                              {opts.map((o) => <option key={o}>{o}</option>)}
                            </select>
                          </div>
                        ) : opts ? (
                          <select value={v} onChange={(e) => set(cell, e.target.value)} aria-label={label} aria-invalid={off} className={base}>
                            <option value="">Choose…</option>
                            {opts.map((o) => <option key={o}>{o}</option>)}
                          </select>
                        ) : null}
                        {opts ? null : c.w ? (
                          // A long value (a sentence) wraps and the box grows with it, rather than clip.
                          <textarea rows={1} value={v} onChange={(e) => set(cell, e.target.value)} onKeyDown={(e) => e.key === "Enter" && e.preventDefault()} onBlur={() => tidy(ri, ci)} placeholder="fill in" aria-label={label} aria-invalid={off} className={`${base} block resize-none leading-snug [field-sizing:content] placeholder:italic placeholder:text-[#8A91A3]`} />
                        ) : (
                          <input value={v} onChange={(e) => set(cell, e.target.value)} onBlur={() => tidy(ri, ci)} placeholder="fill in" aria-label={label} aria-invalid={off} className={`${base} placeholder:italic placeholder:text-[#8A91A3]`} />
                        )}
                        {off && <span className="block max-w-[260px] px-3 pb-1.5 text-[12px] leading-snug text-[#92400E]">{rule!.hint(liveRow(reg, progress, task.id, ri), desk, ri, by)}</span>}
                      </td>
                    );
                  }
                  return (
                    <td key={ci} className={`${td} px-3 py-2 ${(working || checking) && ci === stick ? "sticky left-0 z-[1] bg-white shadow-[1px_0_0_#DDE1E8] max-[600px]:max-w-[132px] max-[600px]:text-[12px]" : ""} ${mine && v.length <= 24 && !c.wrap ? "whitespace-nowrap" : ""} ${empty.has(cell) ? "bg-[#FEF3C7] shadow-[inset_0_0_0_2px_#F59E0B]" : ""} ${c.auto ? "sticky left-0 z-[1] whitespace-nowrap bg-white font-mono text-[12px] font-semibold text-[#111827] shadow-[1px_0_0_#DDE1E8]" : ci === 1 && mine ? "font-medium text-[#111827]" : mine ? "text-[#3F4757]" : ""}`}>
                      {c.list && v ? listed(v) : v || (mine ? <span className="text-[#C9CED8]">—</span> : "")}
                      {c.auto && by > 0 && <span className="block text-[10.5px] font-normal text-[#8A91A3]">step {by}</span>}

                    </td>
                  );
                })}
                {(adding || trimming) && (
                  <td className={`${td} p-0`}>
                    <button type="button" onClick={() => edit((cells) => removeRow(cells, ri))} aria-label={`Remove row ${ri + 1}`} className="grid h-[38px] w-10 place-items-center text-[#8A91A3] hover:bg-[#FEF2F2] hover:text-[#B91C1C] focus-ring">
                      <Icon name="x" size={14} />
                    </button>
                  </td>
                )}
              </tr>
              {reg.cols.map((c, ci) => (under(ci) && shownAll(ci) ? (
                <tr key={`u${ci}`} data-under-row={ri}>
                  <td colSpan={reg.cols.filter((_, cj) => shown(cj)).length + (adding || trimming ? 1 : 0)} className="border-b border-[#E9ECF1] bg-white p-0">
                    <p className={`sticky left-0 ${phone ? "w-[calc(100vw-26px)]" : "max-w-[760px]"} px-3 py-1.5 text-[12.5px] leading-snug text-[#3F4757]`}>
                      <span className="font-semibold text-[#5B6474]">{c.h}:</span> {(c.prose ? cellValue(reg, progress, task.id, ri, ci) : listed(cellValue(reg, progress, task.id, ri, ci))) || "—"}
                    </p>
                  </td>
                </tr>
              ) : null))}
              {phone && rowFb?.why && (
                <tr data-why-row={ri}>
                  <td colSpan={reg.cols.filter((_, ci) => shown(ci)).length + (adding || trimming ? 1 : 0)} className="border-b border-[#E9ECF1] bg-[#FAFAFB] p-0">
                    <p className="sticky left-0 w-[calc(100vw-26px)] px-3 py-1.5 text-[12px] leading-snug text-[#5B6474]">
                      {/* The verdict too: on a phone the verdict cell can sit off screen beside the row's name. */}
                      <span className={`font-semibold ${rowFb.correct === true ? "text-[#15803D]" : rowFb.correct === false ? "text-[#B45309]" : "text-[#3F4757]"}`}>
                        {cellValue(reg, progress, task.id, ri, rcRow!.label)} · {rowFb.correct === true ? "right" : rowFb.correct === false ? `answer: ${rowFb.best}` : "not scored"}.{" "}
                      </span>
                      {keepIds(rowFb.why)}
                    </p>
                  </td>
                </tr>
              )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
      {cons && !flagged.length && (
        <p className="sticky left-0 px-3 py-4 text-center text-[13px] text-[#5B6474]">
          {progress.answers[`${stepKey(task.id, s!.n)}#checked`] ? "The last check flagged no row: nothing to fix." : "Click Check consistency, beside the table: the rows it flags are listed here, to fix."}
        </p>
      )}
      {downCol !== undefined && downLeft.length > 0 && (
        <div data-guide="fill-down" className="sticky left-0 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-[#E9ECF1] bg-[#F7F8FF] px-3 py-2 text-[12.5px] text-[#3F4757]">
          <button
            type="button"
            disabled={!downOk}
            onClick={() => edit((c) => ({ ...c, ...Object.fromEntries(downLeft.map((ri) => [`${ri},${downCol}`, downFrom])) }))}
            className="inline-flex h-8 items-center gap-1.5 rounded border border-[#C7CBF5] bg-white px-3 text-[13px] font-semibold text-[#3730A3] hover:bg-[#EEF0FF] focus-ring disabled:cursor-not-allowed disabled:border-[#E3E6EC] disabled:text-[#8A91A3]"
          >
            <Icon name="arrowDown" size={13} /> Copy to every row
          </button>
          <span>{downOk ? `Copies “${downFrom}” into the ${downLeft.length} row${downLeft.length > 1 ? "s" : ""} not yet filled.` : "Fill the first row; then copy it down."}</span>
        </div>
      )}
      {(working || checking) && workedCount > 0 && (
        <button type="button" onClick={() => setShowWorked(!showWorked)} className="sticky left-0 flex w-full items-center gap-1.5 border-t border-[#E9ECF1] bg-[#F7F8FA] px-3 py-2 text-left text-[12.5px] text-[#3F4757] hover:bg-[#F3F4F7] focus-ring">
          <Icon name={showWorked ? "chevronDown" : "chevronRight"} size={13} />
          {showWorked ? "Hide" : "Show"} the {workedCount} worked rows ({sameFirst ? rows[worked[0]]?.[0] : worked.length > 4 ? `${rows[worked[0]][0]} to ${rows[worked[worked.length - 1]][0]}` : worked.map((ri) => rows[ri][0]).join(", ")})
        </button>
      )}
      {adding && rows.some((_, ri) => addedBy(reg, progress, task.id, ri) !== s!.n) && (
        <button type="button" data-guide="earlier-rows" onClick={() => setShowEarlier(!showEarlier)} className="sticky left-0 flex w-full items-center gap-1.5 border-t border-[#E9ECF1] bg-[#F7F8FA] px-3 py-2 text-left text-[12.5px] text-[#3F4757] hover:bg-[#F3F4F7] focus-ring">
          <Icon name={showEarlier ? "chevronDown" : "chevronRight"} size={13} />
          {showEarlier ? "Hide" : "Show"} the {rows.filter((_, ri) => addedBy(reg, progress, task.id, ri) !== s!.n).length} rows from earlier steps
        </button>
      )}
      {adding && (
        <button
          type="button"
          disabled={full}
          onClick={() => edit((cells) => addRow(cells, s!.n))}
          className="flex w-full items-center justify-center gap-1.5 border-t border-dashed border-[#C7CBF5] bg-[#F7F8FF] px-3 py-2.5 text-[13px] font-semibold text-[#3730A3] hover:bg-[#EEF0FF] focus-ring disabled:cursor-not-allowed disabled:bg-[#F7F8FA] disabled:text-[#8A91A3]"
        >
          <Icon name="plus" size={14} /> {full ? `${rows.length} rows: every source row is in` : "Add a row"}
        </button>
      )}
      {reg.grow && !rows.length && !adding && <p className="px-3 py-6 text-center text-[13px] text-[#8A91A3]">No rows yet. Rows are added by the steps that copy obligations in.</p>}
    </div>
  );
}

/**
 * A consistency check (T3.2 step 12, "Click Check consistency. Fix any row the platform highlights by
 * re-applying L06"): the button lists the rows that break the rule, which are then fixed in the table and
 * checked again. The step is done once a check has run and no row breaks the rule.
 */
export function ConsistencyWork({ task, s }: { task: Task; s: Step }) {
  const { desk, progress, update } = useDesk();
  const reg = regOf(task.id, s.n)!;
  const c = reg.consistency!;
  const key = `${stepKey(task.id, s.n)}#checked`;
  const ran = progress.answers[key];
  const rows = regRows(reg, progress, task.id);
  const bad = rows.map((_, ri) => ri).filter((ri) => c.bad(liveRow(reg, progress, task.id, ri), desk));
  const run = () => update((p) => ({ ...p, answers: { ...p.answers, [key]: bad.length ? bad.join(",") : "none" } }));
  const listed = (ran ?? "").split(",").filter((x) => x && x !== "none").map(Number);
  return (
    <div data-guide="consistency" className="mt-3 grid gap-2">
      <button type="button" onClick={run} className="inline-flex h-9 w-fit items-center gap-1.5 rounded bg-[#111827] px-4 text-[13px] font-semibold text-white hover:brightness-110 focus-ring">
        <Icon name="checkCircle" size={14} /> {ran ? "Check consistency again" : "Check consistency"}
      </button>
      {ran && (
        <div data-guide="consistency-result" className={`rounded border px-3 py-2 text-[13px] leading-snug ${listed.length ? "border-[#FDE68A] bg-[#FFFBEB] text-[#78350F]" : "border-[#BBF7D0] bg-[#F0FDF4] text-[#14532D]"}`}>
          {listed.length ? (
            <>
              <p className="font-semibold">{listed.length} row{listed.length > 1 ? "s break" : " breaks"} rule L06:</p>
              <ul className="mt-1 grid gap-0.5">
                {listed.map((ri) => <li key={ri}><span className="font-mono font-semibold">{rows[ri][0]}</span> · {c.why(liveRow(reg, progress, task.id, ri), desk)}</li>)}
              </ul>
              <p className="mt-1">Fix each in the table, then check again.</p>
            </>
          ) : (
            <p>No row breaks rule L06: every control marked Not applicable is one Ref-SoA exclusions lists.</p>
          )}
        </div>
      )}
      {c.also && <p className="flex items-start gap-2 text-[12.5px] leading-snug text-[#3F4757]"><Icon name="info" size={14} className="mt-px shrink-0 text-[#5B6474]" />{c.also}</p>}
    </div>
  );
}

/** Beside the register: what this step does to it, and how far. */
export function RegisterProgress({ task, s }: { task: Task; s: Step }) {
  const { desk, progress } = useDesk();
  const reg = regOf(task.id, s.n)!;
  const g = regStatus(desk, progress, task, s.n);
  const cols = reg.steps[s.n] ?? [];
  const adds = reg.grow?.adds[s.n];
  // Columns the pack gives nothing for on any row (awaiting) are not named as work.
  const rows0 = regRows(reg, progress, task.id);
  const typed = (ci: number) => rows0.some((r, ri) => reg.mine(r, desk) && !reg.awaiting?.[ci]?.(liveRow(reg, progress, task.id, ri), ri, addedBy(reg, progress, task.id, ri)) && derivedAt(reg, progress, task.id, ri, ci) === null);
  const names = <strong>{cols.filter(typed).map((ci) => reg.cols[ci].h).join(", ")}</strong>;
  // Columns the platform writes from these (F1.2 F: the rules used), said so they are not typed.
  const autoCols = Object.entries(reg.derived ?? {}).filter(([ci, d]) => !d.quiet && !Object.values(reg.steps).flat().includes(+ci) && d.from.some((c) => cols.includes(c))).map(([ci]) => reg.cols[+ci].h);
  const auto = autoCols.map((h) => h.split(" ")[0]);
  const note = reg.note?.[s.n]?.(desk, progress);
  const keep = reg.grow?.keep;
  const kept = keep ? rows0.filter((_, ri) => cellValue(reg, progress, task.id, ri, keep.col) === keep.value).length : 0;
  const chk = reg.checkRows?.[s.n];
  return (
    <div className="mt-3 grid gap-2">
      {chk && <RowCheck task={task} s={s} chk={chk} />}
      {note && (
        // Where this step's rows come from, and how many: said once, before the work.
        <p data-guide="step-note" className="rounded border-l-2 border-[#C7CBF5] bg-[#F7F8FF] px-3 py-2 text-[13px] leading-snug text-[#111827]">{note}</p>
      )}
      <p className="flex items-start gap-2 text-[13.5px] leading-relaxed text-[#111827]">
        <Icon name="edit" size={15} className="mt-0.5 shrink-0 text-[#4338CA]" />
        <span>
          {!reg.grow && cols.length > 0 && !cols.some(typed) ? (
            <>Nothing to fill in this step yet: the note above the table says why. Mark the step complete to go on.</>
          ) : reg.grow && !cols.length ? (
            <>
              The register must hold exactly <strong>{reg.grow.target} rows</strong>
              {keep ? <>, at least {keep.min} of them of Type “{keep.value}”</> : null}. Remove a row with the × at its end.
              {keep && <span className={`block text-[12.5px] ${kept >= keep.min ? "text-[#15803D]" : "text-[#92400E]"}`}>{kept} of your rows are of Type “{keep.value}”.</span>}
              {/* Which rows had to go is checked once the register is down to size: right or not, and why. */}
              {reg.grow.drop && rows0.length === reg.grow.target && (
                <span data-guide="trim-verdict" className={`block text-[12.5px] ${rows0.some((_, ri) => reg.grow!.drop!.bad(liveRow(reg, progress, task.id, ri), desk)) ? "text-[#92400E]" : "text-[#15803D]"}`}>
                  {rows0.some((_, ri) => reg.grow!.drop!.bad(liveRow(reg, progress, task.id, ri), desk))
                    ? "Not yet: a row you kept binds neither of your two offices. Read Section 2 again for the laws each office names. To bring back a row you removed, add it again in the step that added it, then remove this one here."
                    : `Right. ${reg.grow.drop.why(desk)}`}
                </span>
              )}
            </>
          ) : adds !== undefined ? (
            <>
              {adds > 0 ? <>Add <strong>{adds} row{adds > 1 ? "s" : ""}</strong> with “Add a row”</> : <>Add rows if you need them</>}, one for each source line, and fill {names} on each row you add.
            </>
          ) : cols.length === reg.cols.length ? (
            <>Fill <strong>every column</strong> of each row in {reg.code}.</>
          ) : (
            <>Fill {names} on every row of the register.</>
          )}
          {auto.length > 0 && (auto.every((x) => /^[A-Z]$/.test(x)) ? ` Column ${auto.join(", ")} records the rule by itself as you fill it.` : ` ${autoCols.join(", ")} fills itself from your choice.`)}
          {reg.rows.some((r) => !reg.mine(r, desk) && cols.some((ci) => r[ci])) && ` ${reg.worked ?? "The grey rows are worked examples to copy the pattern from."}`}
        </span>
      </p>
      {(reg.grow || g.cells > 0) && <dl className="grid grid-cols-2 border border-[#DDE1E8]">
        {reg.grow && (
          <div className="border-r border-[#DDE1E8] px-3 py-2">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5B6474]">{adds !== undefined ? "Rows this step" : "Rows"}</dt>
            <dd className="font-mono text-[15px] font-semibold tabular-nums text-[#111827]">
              {adds !== undefined ? g.rows : regRows(reg, progress, task.id).length}
              {!cols.length ? ` / ${reg.grow.target}` : ""}
            </dd>
          </div>
        )}
        {cols.length > 0 && (
          <div className="px-3 py-2">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5B6474]">Cells filled</dt>
            <dd className="font-mono text-[15px] font-semibold tabular-nums text-[#111827]">{g.filled} / {g.cells}</dd>
          </div>
        )}
      </dl>}
    </div>
  );
}

/**
 * A fixed-section document template (lib/desk/registers BRIEFS) drawn as a page: the worked section
 * as given, the others as the mentee fills them, with the step's own section open and each section's
 * "Source:" line. The label sits in the footer, where the pack says it is printed. A copied value
 * that differs from its source (open beside it) is flagged under it, as READ-ME-FIRST flags a value
 * that differs from its screen. On a finding step (STUDY) the worked section's lines are the answers.
 * On the hand-in step the page is drawn at A4 and says whether it fits on one.
 */
export function BriefWork({ task, s, readOnly, handIn }: { task: Task; s?: Step; readOnly: boolean; handIn?: boolean }) {
  const { desk, progress, update, here } = useDesk();
  const b = (briefOf(task.id, s?.n ?? (here?.task === task.id ? here.n : undefined)) ?? BRIEFS[task.id])!;
  const gk = briefKey(task.id, b.code);
  const v = progress.grids?.[gk] ?? {};
  const cur = readOnly || !s || handIn ? -1 : (b.steps[s.n] ?? -1);
  const set = (k: string, x: string) => update((p) => ({ ...p, grids: { ...p.grids, [gk]: { ...(p.grids?.[gk] ?? {}), [k]: x } } }));
  useDoc(addendumOf(desk)); // the copies are compared with it
  const given = b.sections.find((x) => x.given);
  useDoc(given?.given?.[0] ?? addendumOf(desk));
  // A section copied from a Group document (F2.1: BKB-STD-001 Section 6) is compared with it too.
  useDoc(b.sections.map((x) => x.src?.(desk).split(" ")[0]).find((d) => d && d !== addendumOf(desk)) ?? addendumOf(desk));
  // A finding step: the prompts' answers are lines of the worked section.
  const sk = s ? stepKey(task.id, s.n) : "";
  const study = s && !readOnly ? STUDY[task.id]?.[s.n] : undefined;
  const found = study ? (progress.acks[sk] ?? []) : [];
  const active = study?.find((q) => !found.includes(q.id));
  const foundAt = new Set(study ? study.map((q) => progress.answers[`${sk}#${q.id}`]).filter(Boolean) : []);
  const missAt = study ? progress.answers[`${sk}#miss`] : undefined;
  const pick = (li: number, lines: string[]) => {
    if (!active?.line) return;
    const hit = active.line(lines) === li;
    update((p) => hit
      ? { ...p, acks: { ...p.acks, [sk]: [...(p.acks[sk] ?? []), active.id] }, answers: { ...p.answers, [`${sk}#${active.id}`]: String(li), [`${sk}#miss`]: "" } }
      : { ...p, answers: { ...p.answers, [`${sk}#miss`]: String(li) } });
  };
  // Hand-in: the page at A4 (794 × 1123 px at 96 dpi), scaled to the room there is; does it fit?
  const [fit, setFit] = useState<{ scale: number; over: boolean } | null>(null);
  const [box, setBox] = useState<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!handIn || !box) return;
    const measure = () => {
      const page = box.querySelector<HTMLElement>("[data-page-body]");
      if (!page) return;
      const scale = Math.min(1, (box.clientWidth - 32) / 794);
      const over = page.offsetHeight > 1123 - 96; // the page's top and bottom margins (56 + 40)
      setFit((f) => (f && Math.abs(f.scale - scale) < 0.01 && f.over === over ? f : { scale, over }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(box);
    return () => ro.disconnect();
  }, [handIn, box, progress.grids]);
  const input = "w-full rounded border border-[#C9CED8] bg-white px-2.5 py-1.5 text-[13.5px] text-[#111827] placeholder:italic placeholder:text-[#8A91A3] focus:border-[#4338CA] focus:outline-none focus:ring-2 focus:ring-[#4338CA]/15 aria-[invalid=true]:border-[#F59E0B]";
  const flag = (t: string) => <span className="block text-[12px] leading-snug text-[#92400E]">{t}</span>;
  // The A4 page is laid out at A4 width and scaled down; the phone's narrow-screen layout must not reflow it,
  // or a page that fits measures as two (T3.1 step 19 at 390 px). Narrow-screen classes apply off the page only.
  const m = (c: string) => (handIn ? "" : c);
  return (
    <div ref={setBox} className="flex-1 bg-[#E9ECF1] p-4">
      {handIn && fit && (
        <p data-guide="page-fit" className={`mx-auto mb-3 flex max-w-[794px] items-center gap-2 rounded border px-3 py-2 text-[12.5px] ${fit.over ? "border-[#FDE68A] bg-[#FFFBEB] text-[#78350F]" : "border-[#BBF7D0] bg-[#F0FDF4] text-[#14532D]"}`}>
          <Icon name={fit.over ? "info" : "checkCircle"} size={14} className="shrink-0" />
          {fit.over ? "Printed on A4, the brief runs onto a second page (the dashed line is where page 1 ends)." : `Printed on A4, it fits on one page${b.label ? `, with the label “${b.label}” in its footer` : ""}.`}
        </p>
      )}
      <div style={handIn && fit ? { zoom: fit.scale } : undefined} className={handIn ? "mx-auto w-[794px]" : ""}>
        <article
          aria-label={b.title}
          data-guide={handIn ? "brief-page" : undefined}
          className={`relative mx-auto bg-white shadow-[0_1px_3px_rgba(17,24,39,0.12)] ${handIn ? "min-h-[1123px] w-[794px] px-[60px] pb-[40px] pt-[56px]" : "max-w-[720px] px-7 py-6"}`}
        >
          {handIn && fit?.over && <span aria-hidden className="pointer-events-none absolute inset-x-0 top-[1123px] border-t-2 border-dashed border-[#F59E0B]" />}
          <div data-page-body className="grid gap-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5B6474]">{b.title}</p>
            {b.sections.map((sec, i) => {
              const editing = i === cur;
              const src = (v[`${i},src`] ?? "").trim();
              const srcOff = !!src && !briefSrcOk(desk, sec, src);
              const list = (v[`${i},0`] ?? "").split("\n");
              const flags = sec.lines ? briefFlags(desk, sec, sec.lines.map((_, li) => v[`${i},${li}`] ?? "")) : briefFlags(desk, sec, list);
              const lines = sec.given ? givenLines(sec) : null;
              return (
                <section key={sec.h} data-guide={editing ? "brief-section" : sec.given && study ? "brief-worked" : undefined} className={`grid gap-1.5 ${editing ? "-mx-3 rounded border border-[#C7CBF5] bg-[#F7F8FF] px-3 py-2.5" : ""}`}>
                  <h3 className="text-[14px] font-bold text-[#111827]">
                    {sec.h}
                    {sec.given && <span className="ml-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#8A91A3]">worked example</span>}
                    {editing && <span className="ml-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#4338CA]">this step</span>}
                  </h3>
                  {sec.given ? (
                    !lines ? (
                      <div className="h-24 animate-pulse rounded bg-[#F3F4F7]" aria-busy="true" />
                    ) : (
                      <ul className="grid gap-0.5 text-[13.5px] text-[#111827]">
                        {[...lines, `Source: ${sec.given[0]} Section ${sec.given[1]}`].map((t, li) => {
                          const last = li === lines.length;
                          const tone = foundAt.has(String(li)) ? "bg-[#DCFCE7] font-semibold text-[#14532D] shadow-[inset_0_0_0_2px_#16A34A]" : missAt === String(li) ? "bg-[#FEF3C7] shadow-[inset_0_0_0_2px_#F59E0B]" : study ? "hover:bg-[#EEF0FF]" : "";
                          const cls = last ? "mt-1 text-[12.5px] text-[#5B6474]" : "";
                          return (
                            <li key={li}>
                              {study ? (
                                <button type="button" data-line={li} onClick={() => pick(li, lines)} disabled={!active} className={`-mx-1.5 block w-[calc(100%+12px)] rounded px-1.5 py-0.5 text-left focus-ring disabled:cursor-default ${cls} ${tone}`}>
                                  {t}
                                </button>
                              ) : (
                                <span className={`block ${cls}`}>{t}</span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )
                  ) : sec.lines ? (
                    <dl className="grid gap-1.5 text-[13.5px]">
                      {sec.lines.map((l, li) => (
                        <div key={l.l} className={`grid grid-cols-[120px_minmax(0,1fr)] items-start gap-2 ${m("max-[480px]:grid-cols-1 max-[480px]:gap-0.5")}`}>
                          <dt className={`pt-1.5 text-[#5B6474] ${m("max-[480px]:pt-0")}`}>
                            {l.l}
                            {editing && l.at && <span className="block text-[11px] leading-tight text-[#8A91A3]">{l.at}</span>}
                          </dt>
                          <dd>
                            {l.awaiting ? (
                              <span className={`block pt-1.5 text-[12.5px] italic text-[#8A91A3] ${m("max-[480px]:pt-0")}`} title="Not in the pack yet">Awaiting content: the platform does not have {l.col}.</span>
                            ) : editing ? (
                              <>
                                <input value={v[`${i},${li}`] ?? ""} onChange={(e) => set(`${i},${li}`, e.target.value)} aria-label={`${l.l}`} aria-invalid={!!flags?.[li]} placeholder="copy word for word" className={input} />
                                {flags?.[li] && flag(flags[li]!)}
                              </>
                            ) : (
                              <span className={`block pt-1.5 text-[#111827] ${m("max-[480px]:pt-0")}`}>{v[`${i},${li}`] || <span className="text-[#C9CED8]">—</span>}</span>
                            )}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  ) : editing ? (
                    <>
                      <textarea
                        rows={Math.max(5, list.length + 1)}
                        value={v[`${i},0`] ?? ""}
                        onChange={(e) => set(`${i},0`, e.target.value)}
                        aria-label={`Section ${sec.h}`}
                        aria-invalid={!!flags?.some(Boolean)}
                        data-first-ok={!!list[0]?.trim() && !!flags && !flags[0] ? "true" : undefined}
                        placeholder="One item per line, word for word"
                        className={`${input} resize-y leading-[1.5]`}
                      />
                      {flags?.map((f, li) => f && <span key={li} className="block text-[12px] leading-snug text-[#92400E]">Line {li + 1}, “{list[li].trim()}”: {f}</span>)}
                    </>
                  ) : (
                    <p className="whitespace-pre-line text-[13.5px] text-[#111827]">{v[`${i},0`] || <span className="text-[#C9CED8]">—</span>}</p>
                  )}
                  {!sec.given &&
                    (editing ? (
                      <label className="grid grid-cols-[120px_minmax(0,1fr)] items-start gap-2 text-[13px] max-[480px]:grid-cols-1 max-[480px]:gap-0.5">
                        <span className="pt-1.5 font-semibold text-[#3F4757] max-[480px]:pt-0">Source:</span>
                        <span>
                          <input data-guide="brief-source" value={v[`${i},src`] ?? ""} onChange={(e) => set(`${i},src`, e.target.value)} aria-label={`Source of section ${sec.h}`} aria-invalid={srcOff} placeholder="document and section" className={input} />
                          {srcOff && flag(`Name the document, then the section it was copied from (${sec.src!(desk).split(" ")[0]} and its section number).`)}
                        </span>
                      </label>
                    ) : (
                      src && <p className="text-[12.5px] text-[#5B6474]">Source: {src.replace(/^source:\s*/i, "")}</p>
                    ))}
                </section>
              );
            })}
          </div>
          {b.label && <footer data-guide="brief-label" className={`border-t border-[#DDE1E8] pt-2 text-center text-[11px] font-semibold uppercase tracking-[0.1em] text-[#5B6474] ${handIn ? "absolute inset-x-[60px] bottom-[14px]" : "mt-6"}`}>{b.label}</footer>}
        </article>
      </div>
    </div>
  );
}

/** Beside the brief: which section this step fills, and whether it is complete. */
export function BriefProgress({ task, s }: { task: Task; s: Step }) {
  const { desk, progress } = useDesk();
  const b = briefOf(task.id, s.n)!;
  const g = briefStatus(progress, task, s.n, desk);
  const sec = b.sections[b.steps[s.n]];
  return (
    <div className="mt-3 grid gap-2">
      <p className="flex items-start gap-2 text-[13.5px] leading-relaxed text-[#111827]">
        <Icon name="edit" size={15} className="mt-0.5 shrink-0 text-[#4338CA]" />
        <span>
          Fill section <strong>{sec.h}</strong> on the page, word for word from its source{sec.lines ? "" : ", one item per line"}, then its Source line. Anything that differs from the source is flagged under it.
        </span>
      </p>
      <dl className="border border-[#DDE1E8] px-3 py-2">
        <dt className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5B6474]">{sec.lines ? "Lines filled" : "Parts filled (list, Source)"}</dt>
        <dd className="font-mono text-[15px] font-semibold tabular-nums text-[#111827]">{g.filled} / {g.cells}</dd>
      </dl>
      {/* A copy is done when it is the source's, not when it is typed: said once every part is in. */}
      {g.filled === g.cells && (
        <p data-guide="brief-verdict" className={`flex items-start gap-2 text-[12.5px] leading-snug ${g.right ? "text-[#15803D]" : "text-[#92400E]"}`}>
          <Icon name={g.right ? "checkCircle" : "info"} size={14} className="mt-px shrink-0" />
          {g.right
            ? "Every line matches its source."
            : !sec.lines && g.want && g.items < g.want
              ? `${g.items} of the ${g.want} items of the source are listed. Read the source again for the rest.`
              : "Something differs from the source: see the flag on the page."}
        </p>
      )}
    </div>
  );
}

/**
 * The READ-ME-FIRST file, opened at the table this step fills — each table is its own step (1, 4,
 * 5), so the others are not shown here. It is what the step's modal shows; the screen the values
 * come from opens in its own window beside it, from the toolbar.
 */
export function RmfFile({ task, t, readOnly, handIn }: {
  task: Task;
  t: number;
  readOnly: boolean;
  /** The step that hands the file in: all three tables, as filled, under the name it is saved as. */
  handIn?: { name: string };
}) {
  const { desk } = useDesk();
  return (
    <div className="flex-1 bg-[#E9ECF1] p-4">
      <article aria-label={RMF.file} data-guide={handIn ? "rmf-file" : undefined} className="mx-auto grid max-w-[760px] gap-5 bg-white px-6 py-5 shadow-[0_1px_3px_rgba(17,24,39,0.12)]">
        <header className="border-b border-[#DDE1E8] pb-3">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5B6474]">
            {task.id} · {handIn ? "02_Working" : "01_Inputs"} · {desk.mentee}
          </p>
          <h3 className="break-all text-[18px] font-bold text-[#111827]">{handIn?.name || RMF.file}</h3>
          <p className="text-[12.5px] text-[#5B6474]">
            {handIn
              ? "The file you hand in: all three tables, as you checked and filled them in steps 1, 4 and 5."
              : `Table ${t + 1} of ${RMF.tables.length}. The other tables are filled in their own steps.`}
          </p>
        </header>
        {handIn ? (
          RMF.tables.map((_, i) => <RmfForm key={i} task={task} t={i} readOnly />)
        ) : (
          <div data-guide="rmf-table">
            <RmfForm task={task} t={t} readOnly={readOnly} />
          </div>
        )}
      </article>
    </div>
  );
}

/**
 * Under a pre-filled table (F1.1 steps 1 and 5): Check my answers, then how many slips were found.
 * No count before the check (it would say how many are left); rows still wrong stay open until they match.
 */
function RmfCheck({ task, t }: { task: Task; t: number }) {
  const { desk, progress, start, update } = useDesk();
  const table = RMF.tables[t];
  const gk = rmfKey(task.id);
  const cells = progress.grids?.[gk] ?? {};
  const want = rmfExpected(desk, start, t);
  const given = rmfGiven(desk, start, t)!;
  const right = (i: number) => !!(cells[`${t},${i}`] ?? "").trim() && same(cells[`${t},${i}`], want[i]);
  const left = table.rows.filter((_, i) => !right(i)).length;
  const at = cells[rmfAt(t)];
  const slips = given.why.flatMap((w, i) => (w ? [i] : []));
  const missed = (cells[rmfMiss(t)] ?? "").split(",").filter(Boolean).map(Number);
  const found = slips.filter((i) => !missed.includes(i)).length;
  // The verdict comes into view when it appears (on a phone it lands below the fold), not on every visit.
  const [justChecked, setJustChecked] = useState(false);
  useEffect(() => {
    if (justChecked) document.querySelector('[data-guide="rmf-result"]')?.scrollIntoView({ block: "nearest" });
  }, [justChecked]);
  const check = () => {
    update((p) => ({ ...p, grids: { ...p.grids, [gk]: { ...(p.grids?.[gk] ?? {}), [rmfAt(t)]: new Date().toISOString(), [rmfMiss(t)]: table.rows.flatMap((_, i) => (right(i) ? [] : [i])).join(",") } } }));
    setJustChecked(true);
  };
  if (!at)
    return (
      <button type="button" data-guide="rmf-check" onClick={check} className="mt-2 inline-flex h-9 w-fit items-center gap-1.5 rounded bg-[#4338CA] px-4 text-[13px] font-semibold text-white hover:brightness-90">
        <Icon name="check" size={14} strokeWidth={2.5} /> Check my answers
      </button>
    );
  return (
    <div data-guide="rmf-result" role="status" className="mt-2 grid gap-1 rounded border border-[#DDE1E8] bg-[#F7F8FA] px-3 py-2 text-[13px] leading-snug text-[#111827]">
      <p className="font-semibold">
        {slips.length === 1
          ? found ? "You found the value that was wrong." : "You did not find the value that was wrong."
          : found === slips.length ? `You found all ${slips.length} values that were wrong.` : `You found ${found} of the ${slips.length} values that were wrong.`}
      </p>
      {missed.some((i) => !slips.includes(i)) && <p>A value that was right was changed. It is flagged in the table.</p>}
      <p className={left ? "text-[#92400E]" : "text-[#14532D]"}>
        {left ? `${left} still ${left === 1 ? "differs" : "differ"} from the screen: correct the flagged ${left === 1 ? "row" : "rows"}.` : `All ${table.rows.length} values now match ${table.from}.`}
      </p>
    </div>
  );
}

/** Beside the file: which table this step fills, where its values are, and how far it is. */
export function RmfProgress({ task, t }: { task: Task; t: number }) {
  const { desk, progress, start } = useDesk();
  const table = RMF.tables[t];
  const cells = progress.grids?.[rmfKey(task.id)] ?? {};
  // Counted once a value matches its screen: a typed value that differs is not in yet.
  const want = rmfExpected(desk, start, t);
  const filled = table.rows.filter((_, i) => (cells[`${t},${i}`] ?? "").trim() && same(cells[`${t},${i}`], want[i])).length;
  // A pre-filled table is checked under the table (RmfCheck); no count here, it would say how many slips are left.
  if (rmfGiven(desk, start, t))
    return (
      <p className="mt-3 flex items-start gap-2 text-[13.5px] leading-relaxed text-[#111827]">
        <Icon name="edit" size={15} className="mt-0.5 shrink-0 text-[#4338CA]" />
        <span>
          Check table {t + 1} <strong>“{table.title}”</strong> in READ-ME-FIRST, on the left, against <strong>{table.from}</strong>: open it from the toolbar at the bottom of the screen and it appears beside the file. Correct any value that differs, then click Check my answers under the table.
        </span>
      </p>
    );
  return (
    <div className="mt-3 grid gap-2">
      <p className="flex items-start gap-2 text-[13.5px] leading-relaxed text-[#111827]">
        <Icon name="edit" size={15} className="mt-0.5 shrink-0 text-[#4338CA]" />
        <span>
          Fill table {t + 1} <strong>“{table.title}”</strong> in READ-ME-FIRST, on the left. The values are on <strong>{table.from}</strong>: open it from the toolbar at the bottom of the screen and it appears beside the file.
        </span>
      </p>
      <dl className="border border-[#DDE1E8] px-3 py-2">
        <dt className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5B6474]">Values that match the screen</dt>
        <dd className="font-mono text-[15px] font-semibold tabular-nums text-[#111827]">{filled} / {table.rows.length}</dd>
      </dl>
    </div>
  );
}

/**
 * Beside the worked rows: the finding prompts (STUDY), one at a time. Each found answer shows what
 * was found and why that column exists; a wrong cell gets the prompt's hint.
 */
export function StudyWork({ task, s, prompts }: { task: Task; s: Step; prompts: StudyPrompt[] }) {
  const { desk, progress } = useDesk();
  const reg = regOf(task.id, s.n)!;
  const key = stepKey(task.id, s.n);
  const found = progress.acks[key] ?? [];
  const active = prompts.find((q) => !found.includes(q.id));
  const miss = progress.answers[`${key}#miss`];
  // In a brief (F1.3) the answers are lines of its worked section, the last one its Source line.
  const worked = briefOf(task.id, s.n)?.sections.find((x) => x.given);
  const lines = worked ? givenLines(worked) : null;
  const valueAt = (cell: string) => {
    if (worked) return lines?.[+cell] ?? `Source: ${worked.given![0]} Section ${worked.given![1]}`;
    const [ri, ci] = cell.split(",").map(Number);
    // An empty cell found (F2.2: E-002 shows no timestamp) is named by its column.
    return cellValue(reg, progress, task.id, ri, ci) || `${reg.cols[ci].h}: empty`;
  };
  return (
    <div data-guide="study" className="mt-3 grid gap-2">
      <p className="text-[13.5px] leading-snug text-[#111827]">
        {worked ? "Your sections must be copied the same way. Check section 1 against its source and click the line each question asks for." : !Object.keys(reg.steps).length ? "Answer each question by clicking the cell that answers it." : reg.rows.every((r) => reg.mine(r, desk)) ? `Check ${reg.code} against the standard before you fill it. Click the cell each question asks for.` : "Your rows must end up like these. Find each answer in the worked rows and click its cell."}
      </p>
      <ol className="grid gap-2">
        {prompts.map((q, i) => {
          const done = found.includes(q.id);
          const on = q === active;
          return (
            <li key={q.id} data-found={done ? q.id : undefined} className={`rounded border px-3 py-2.5 ${done ? "border-[#BBF7D0] bg-[#F0FDF4]" : on ? "border-[#C7CBF5] bg-[#F7F8FF]" : "border-[#E9ECF1] bg-white"}`}>
              <p className={`flex items-start gap-2 text-[13.5px] ${done || on ? "font-semibold text-[#111827]" : "text-[#8A91A3]"}`}>
                <span className={`mt-px grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-bold ${done ? "bg-[#16A34A] text-white" : on ? "bg-[#4338CA] text-white" : "bg-[#EEF0F4] text-[#8A91A3]"}`}>
                  {done ? <Icon name="check" size={11} strokeWidth={3} /> : i + 1}
                </span>
                {q.ask}
              </p>
              {done && (
                <div className="mt-1.5 pl-7 text-[13px] leading-snug text-[#3F4757]">
                  <p className="font-mono text-[12.5px] font-semibold text-[#14532D]">{valueAt(progress.answers[`${key}#${q.id}`] ?? "")}</p>
                  <p className="mt-1">{q.why}</p>
                </div>
              )}
              {on && miss && <p className="mt-1.5 pl-7 text-[12.5px] text-[#92400E]">Not that cell. {q.hint}</p>}
            </li>
          );
        })}
      </ol>
      <p className="text-[12.5px] text-[#5B6474] tabular-nums">{found.length} of {prompts.length} found</p>
    </div>
  );
}

/**
 * Beside the worked rows: a question-in-order rule applied to one worked row. Each question is
 * answered yes or no; a wrong answer says why from the row itself; the first right "yes" is the
 * rule's outcome, which is the value the row already shows.
 */
/** Learn › Framework Quick Reference's description of a standard, if it has one ("ISO/IEC 27001:2022" →
 *  the "ISO/IEC 27001" entry). A family entry ("GDPR / DPA 2012 / KVKK") matches each of its names. */
function quickRef(desk: Desk, name: string): string | undefined {
  const lines = (desk.tp["learn|Framework Quick Reference"]?.pl as { p?: string[] } | undefined)?.p ?? [];
  for (const l of lines) {
    const m = l.match(/^<b>(.+?)<\/b>\s*(.*)$/);
    if (m && m[1].split(" / ").some((x) => name.toLowerCase().startsWith(x.trim().toLowerCase()))) return m[2];
  }
  return undefined;
}

export function LadderWork({ task, s, ladder }: { task: Task; s: Step; ladder: Ladder }) {
  const { desk, progress, update } = useDesk();
  const reg = regOf(task.id, s.n)!;
  const key = stepKey(task.id, s.n);
  const steps = ladderSteps(desk.rules[ladder.rule]?.[1] ?? "");
  const ri = reg.rows.findIndex((r) => ladder.row(r.map(String)));
  const row = reg.rows[ri] ?? [];
  const value = String(row[ladder.col] ?? "");
  const stop = steps.findIndex((x) => x.then === value);
  const acks = progress.acks[key] ?? [];
  const at = acks.filter((a) => a.startsWith("q")).length; // questions answered right so far
  const done = acks.includes("done");
  const [miss, setMiss] = useState<number | null>(null);
  const answer = (i: number, yes: boolean) => {
    if (yes !== (i === stop)) return setMiss(i);
    setMiss(null);
    update((p) => ({ ...p, acks: { ...p.acks, [key]: [...(p.acks[key] ?? []), `q${i}`, ...(yes ? ["done"] : [])] } }));
  };
  return (
    <div data-guide="ladder" className="mt-3 grid gap-2">
      <p className="text-[13.5px] leading-snug text-[#111827]">
        Rule {ladder.rule}, applied to the lit row: <strong className="font-semibold">{String(row[1])}</strong>. Ask the questions in order and
        stop at the first yes.
      </p>
      <ol className="grid gap-1.5">
        {steps.map((x, i) => {
          const last = i === steps.length - 1; // "Otherwise": not a question
          const answered = i < at;
          const on = !done && i === at;
          if (i > at && !done) return null;
          if (done && i > stop) return null;
          return (
            <li key={i} data-q={i} className={`rounded border px-3 py-2 ${on ? "border-[#C7CBF5] bg-[#F7F8FF]" : "border-[#E9ECF1] bg-white"}`}>
              <p className="flex items-start gap-2 text-[13.5px] text-[#111827]">
                <span className="mt-px font-mono text-[12px] text-[#8A91A3]">{i + 1}.</span>
                <span className="flex-1">{last ? "Otherwise" : x.q}</span>
                {answered && (
                  <span className={`shrink-0 rounded-[3px] px-1.5 py-0.5 text-[11.5px] font-semibold ${i === stop ? "bg-[#DCFCE7] text-[#15803D]" : "bg-[#F3F4F7] text-[#3F4757]"}`}>
                    {i === stop ? "Yes" : "No"}
                  </span>
                )}
              </p>
              {on && !last && (
                <div className="mt-2 flex gap-2 pl-5">
                  <button type="button" onClick={() => answer(i, true)} className="h-8 rounded border border-[#C9CED8] bg-white px-4 text-[13px] font-semibold text-[#111827] hover:border-[#4338CA] focus-ring">Yes</button>
                  <button type="button" onClick={() => answer(i, false)} className="h-8 rounded border border-[#C9CED8] bg-white px-4 text-[13px] font-semibold text-[#111827] hover:border-[#4338CA] focus-ring">No</button>
                </div>
              )}
              {on && miss === i && (
                <p className="mt-1.5 pl-5 text-[12.5px] text-[#92400E]">
                  {/* About this question only: what the standard is, in the reference's words. Never the
                      answer, the question that stops, or the type: the walk is how the learner gets there. */}
                  {(() => {
                    const ref = quickRef(desk, String(row[1]));
                    return ref
                      ? <>Not quite. Learn › Framework Quick Reference says {String(row[1]).split(":")[0]} is “{ref}” Read the question again with that in mind.</>
                      : <>Not quite. Read what {String(row[1]).split(":")[0]} is in Learn › Framework Quick Reference, then answer again.</>;
                  })()}
                </p>
              )}
            </li>
          );
        })}
      </ol>
      {done && (
        <p data-guide="ladder-done" className="rounded border border-[#BBF7D0] bg-[#F0FDF4] px-3 py-2 text-[13.5px] text-[#14532D]">
          First yes at question {stop + 1} → <strong className="font-semibold">{value}</strong>. That is what the row shows in column D. In step 3 you ask these questions for each of your own rows.
        </p>
      )}
    </div>
  );
}

/**
 * Beside a register whose column is chosen with a question-in-order rule (F1.2 step 3, R01): one row
 * at a time, the rule's questions in order; the first yes writes that type into the row's cell, and
 * the helper moves to the next empty row. The mentee answers about the standard themselves, so this
 * is their decision, made the rule's way: there is no key here and no right-or-wrong shown.
 * Picking straight from the drop-down in the table works just as well.
 */
export function RuleHelper({ task, s, helper }: { task: Task; s: Step; helper: { rule: string; col: number } }) {
  const { desk, progress, update } = useDesk();
  const reg = regOf(task.id, s.n)!;
  const gk = regKey(task.id, reg.code);
  const steps = ladderSteps(desk.rules[helper.rule]?.[1] ?? "");
  const mine = reg.rows.map((r, ri) => ri).filter((ri) => reg.mine(reg.rows[ri], desk));
  const value = (ri: number) => cellValue(reg, progress, task.id, ri, helper.col);
  const left = mine.filter((ri) => !value(ri).trim());
  const [pick, setPick] = useState<number | null>(null);
  const ri = pick ?? left[0];
  const [at, setAt] = useState(0);
  const write = (v: string) => {
    update((p) => ({ ...p, grids: { ...p.grids, [gk]: { ...(p.grids?.[gk] ?? {}), [`${ri},${helper.col}`]: v } } }));
    setPick(null);
    setAt(0);
  };
  const g = regStatus(desk, progress, task, s.n);
  return (
    <div data-guide="rule-helper" className="mt-3 grid gap-2">
      <p className="flex items-center justify-between gap-2 text-[13.5px] text-[#111827]">
        <span>Pick each row&apos;s type in column <strong>{reg.cols[helper.col].h.split(" ")[0]}</strong>.</span>
        <span className="shrink-0 font-mono text-[12.5px] text-[#3F4757] tabular-nums">{g.filled} / {g.cells}</span>
      </p>
      {ri === undefined ? (
        <p className="rounded border border-[#BBF7D0] bg-[#F0FDF4] px-3 py-2 text-[13.5px] text-[#14532D]">Every row has a type. Check them, then mark the step complete.</p>
      ) : (
        <section className="rounded border border-[#C7CBF5] bg-[#F7F8FF] px-3 py-2.5">
          <p className="text-[12px] text-[#5B6474]">Not sure? Work it out with rule {helper.rule}:</p>
          <p className="mt-0.5 text-[14px] font-semibold text-[#111827]">{String(reg.rows[ri][1])}</p>
          <p className="mt-0.5 text-[12px] text-[#5B6474]">Read what it is in Learn › Framework Quick Reference.</p>
          <ol className="mt-2 grid gap-1.5">
            {steps.map((x, i) => {
              if (i > at) return null;
              const last = i === steps.length - 1;
              return (
                <li key={i} data-q={i} className="text-[13.5px] text-[#111827]">
                  <p className="flex items-start gap-2">
                    <span className="mt-px font-mono text-[12px] text-[#8A91A3]">{i + 1}.</span>
                    <span className="flex-1">{last ? `Otherwise: ${x.then}` : x.q}</span>
                    {i < at && <span className="shrink-0 rounded-[3px] bg-[#F3F4F7] px-1.5 py-0.5 text-[11.5px] font-semibold text-[#3F4757]">No</span>}
                  </p>
                  {i === at && (
                    <div className="mt-1.5 flex gap-2 pl-5">
                      {last ? (
                        <button type="button" onClick={() => write(x.then)} className="h-8 rounded bg-[#4338CA] px-3 text-[13px] font-semibold text-white hover:brightness-90 focus-ring">Use {x.then}</button>
                      ) : (
                        <>
                          <button type="button" onClick={() => write(x.then)} className="h-8 rounded border border-[#C9CED8] bg-white px-4 text-[13px] font-semibold text-[#111827] hover:border-[#4338CA] focus-ring">Yes</button>
                          <button type="button" onClick={() => setAt(i + 1)} className="h-8 rounded border border-[#C9CED8] bg-white px-4 text-[13px] font-semibold text-[#111827] hover:border-[#4338CA] focus-ring">No</button>
                        </>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
          <p className="mt-2 text-[12px] text-[#5B6474]">A yes writes that type into the row. You can change any row in the table.</p>
        </section>
      )}
      {left.length > 1 && (
        <p className="text-[12px] text-[#5B6474]">
          Or jump to:{" "}
          {left.filter((x) => x !== ri).map((x, i) => (
            <button key={x} type="button" onClick={() => { setPick(x); setAt(0); }} className="mr-2 font-medium text-[#3730A3] underline-offset-2 hover:underline focus-ring">
              {String(reg.rows[x][1]).split(" (")[0]}{i < left.length - 2 ? "" : ""}
            </button>
          ))}
        </p>
      )}
    </div>
  );
}

/** The row a tree step is walking: the one the mentee picked, else the first of theirs not yet walked. */
function treeRow(reg: Register, desk: Desk, p: Progress, taskId: string, n: number, col: number): number | undefined {
  const picked = p.answers[`${stepKey(taskId, n)}#row`];
  if (picked) return Number(picked);
  const i = reg.rows.findIndex((r, ri) => reg.mine(r, desk) && !cellValue(reg, p, taskId, ri, col));
  return i >= 0 ? i : undefined;
}

/**
 * Beside a register whose rows are classified with a decision tree (F2.1 step 2, BKB-STD-001 Section 5): the
 * tree's own questions for one row at a time, in order. The first yes gives the outcome; the walk
 * writes the path (each question and its answer) and the tier into the row. The tier is the mentee's
 * decision, answered from the row's facts; once every row is walked, Check my answers (`checkRows`)
 * compares the tiers with the key, which comes from the backend only then.
 */
export function TreeWork({ task, s, tree }: { task: Task; s: Step; tree: { doc: string; sec: string; path: number; tier: number } }) {
  const { desk, progress, update } = useDesk();
  const reg = regOf(task.id, s.n)!;
  const gk = regKey(task.id, reg.code);
  const sk = stepKey(task.id, s.n);
  useDoc(tree.doc);
  const qs = treeQuestions(tree.doc, tree.sec);
  // Checked against the key: the rows are locked, so nothing is walked again.
  const rc = reg.checkRows?.[s.n];
  const checked = !!rc && !!progress.rowChecks?.[`${task.id}-${s.n}`];
  const ri = checked ? undefined : treeRow(reg, desk, progress, task.id, s.n, tree.path);
  // How far the row in hand has got (every question before `at` answered no), and a yes awaiting its tier.
  const [walk, setWalk] = useState<{ ri?: number; at: number; yes: boolean }>({ at: 0, yes: false });
  const cur = walk.ri === ri ? walk : { ri, at: 0, yes: false };
  const walked = reg.rows.filter((r, i) => reg.mine(r, desk) && cellValue(reg, progress, task.id, i, tree.path)).length;
  const mineN = reg.rows.filter((r) => reg.mine(r, desk)).length;
  const tierOf = (n: string) => s.opt?.find((o) => o.startsWith(`Tier ${n}`)) ?? `Tier ${n}`;
  const write = (tier: string, last: string) => {
    const path = [...Array.from({ length: cur.at }, (_, i) => `Q${i + 1} No`), last, tier.split(" —")[0]].join(" → ");
    update((p) => ({
      ...p,
      grids: { ...p.grids, [gk]: { ...(p.grids?.[gk] ?? {}), [`${ri},${tree.path}`]: path, [`${ri},${tree.tier}`]: tier } },
      answers: { ...p.answers, [`${sk}#row`]: "" },
    }));
    setWalk({ at: 0, yes: false });
  };
  const btn = "h-8 rounded border border-[#C9CED8] bg-white px-4 text-[13px] font-semibold text-[#111827] hover:border-[#4338CA] focus-ring";
  const rec = "h-8 rounded bg-[#4338CA] px-3 text-[13px] font-semibold text-white hover:brightness-90 focus-ring";
  return (
    <div data-guide="tree" className="mt-3 grid gap-2">
      <p className="flex items-center justify-between gap-2 text-[13.5px] text-[#111827]">
        <span>Walk the tree for each of your rows. Each walk fills the row&apos;s path and tier.</span>
        <span className="shrink-0 font-mono text-[12.5px] text-[#3F4757] tabular-nums">{walked} / {mineN}</span>
      </p>
      {ri === undefined ? (
        <>
          {!checked && (
            <p className="rounded border border-[#BBF7D0] bg-[#F0FDF4] px-3 py-2 text-[13.5px] text-[#14532D]">
              Every row has a path and a tier. To change one, click its path in the table and walk it again{rc ? " before you check your answers" : ""}.
            </p>
          )}
          {rc && <RowCheck task={task} s={s} chk={rc} />}
        </>
      ) : (
        <section data-guide="tree-row" className="rounded border border-[#C7CBF5] bg-[#F7F8FF] px-3 py-2.5">
          <p className="text-[12px] text-[#5B6474]">{cellValue(reg, progress, task.id, ri, tree.path) ? "Walking again" : "Now walking"} · lit in the table</p>
          <p className="mt-0.5 text-[14px] font-semibold text-[#111827]">{reg.rows[ri][0]} · {reg.rows[ri][1]}</p>
          <p className="mt-0.5 text-[12px] text-[#5B6474]">Answer from the row&apos;s facts. The questions of {tree.doc} Section {tree.sec}, in order: stop at the first yes.</p>
          {!qs ? (
            <div className="mt-2 h-20 animate-pulse rounded bg-[#EEF0FF]" aria-busy="true" />
          ) : (
            <ol className="mt-2 grid gap-1.5">
              {qs.map((x, i) => {
                if (i > cur.at) return null;
                const last = i === qs.length - 1; // "Otherwise": not a question
                const tiers = [...x.then.matchAll(/Tier (\d)/g)].map((m) => m[1]);
                return (
                  <li key={i} data-q={i} className="text-[13.5px] text-[#111827]">
                    <p className="flex items-start gap-2">
                      <span className="mt-px text-[12px] font-semibold text-[#8A91A3]">Q{i + 1}</span>
                      <span className="flex-1">{last ? `Otherwise → ${x.then}` : x.q}</span>
                      {i < cur.at && <span className="shrink-0 rounded-[3px] bg-[#F3F4F7] px-1.5 py-0.5 text-[11.5px] font-semibold text-[#3F4757]">No</span>}
                    </p>
                    {i === cur.at && (
                      <div className="mt-1.5 flex flex-wrap items-center gap-2 pl-6">
                        {last ? (
                          <button type="button" onClick={() => write(tierOf(tiers[0]), "Otherwise")} className={rec}>Record {tierOf(tiers[0])}</button>
                        ) : cur.yes && tiers.length ? (
                          <>
                            <span className="w-full text-[12.5px] text-[#3F4757]">Yes → {x.then}.</span>
                            {tiers.map((t) => (
                              <button key={t} type="button" onClick={() => write(tierOf(t), `Q${i + 1} Yes`)} className={rec}>Record {tierOf(t)}</button>
                            ))}
                            <button type="button" onClick={() => setWalk({ ...cur, yes: false })} className="text-[12.5px] font-medium text-[#3730A3] underline-offset-2 hover:underline focus-ring">Back</button>
                          </>
                        ) : cur.yes ? (
                          // An outcome that is not a Group tier (Section 5: "apply the national scheme (Section 4.1)").
                          <p className="text-[12.5px] leading-snug text-[#92400E]">
                            Yes → {x.then}. That is not a Group tier: read in {tree.doc} which organisations it covers, then answer again.{" "}
                            <button type="button" onClick={() => setWalk({ ...cur, yes: false })} className="font-semibold underline underline-offset-2 focus-ring">Answer again</button>
                          </p>
                        ) : (
                          <>
                            <button type="button" onClick={() => setWalk({ ...cur, yes: true })} className={btn}>Yes</button>
                            <button type="button" onClick={() => setWalk({ ...cur, at: i + 1 })} className={btn}>No</button>
                          </>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </section>
      )}
      {ri !== undefined && walked > 0 && <p className="text-[12px] text-[#5B6474]">Click a row&apos;s path in the table to walk it again.</p>}
    </div>
  );
}

/**
 * Beside a register whose rows are decided with a checklist (F2.2 step 2, rule R09: the checks D1–D10 of
 * Ref-Defect codes, in order): one row at a time, each check with the cell it reads. The mentee marks the
 * check that fails, which records the fail value, or records the pass value when none fails. Their own
 * decision, made the rule's way: no key here and no right-or-wrong shown.
 */
export function ChecklistWork({ task, s, chk }: { task: Task; s: Step; chk: ChecklistSpec }) {
  const { desk, progress, update } = useDesk();
  const reg = regOf(task.id, s.n)!;
  const gk = regKey(task.id, reg.code);
  const sk = stepKey(task.id, s.n);
  const checks = (chk.checks?.() ?? desk.pages[chk.page]?.r ?? []) as string[][];
  const mark = chk.mark ?? "Fails";
  const order = checks.map(([c]) => c);
  const rc = reg.checkRows?.[s.n];
  const checked = !!rc && !!progress.rowChecks?.[`${task.id}-${s.n}`];
  const ri = checked ? undefined : treeRow(reg, desk, progress, task.id, s.n, chk.col);
  const done = reg.rows.filter((r, i) => reg.mine(r, desk) && cellValue(reg, progress, task.id, i, chk.col)).length;
  const mineN = reg.rows.filter((r) => reg.mine(r, desk)).length;
  // With `codes` (T5.2), every failing check is marked first, then recorded with its code; the marks of the row in
  // hand are kept as "<row>:D4,D6", and a row checked again starts from the codes it holds.
  const marksKey = `${sk}#marks`;
  const held = progress.answers[marksKey] ?? "";
  const marks = ri === undefined || chk.codes === undefined ? [] : held.startsWith(`${ri}:`) ? held.slice(String(ri).length + 1).split(",").filter(Boolean) : cellValue(reg, progress, task.id, ri, chk.codes).split(";").map((x) => x.trim()).filter((x) => order.includes(x));
  const toggle = (code: string) => update((p) => ({ ...p, answers: { ...p.answers, [marksKey]: `${ri}:${(marks.includes(code) ? marks.filter((x) => x !== code) : [...marks, code]).sort((a, b) => order.indexOf(a) - order.indexOf(b)).join(",")}` } }));
  const write = (v: string) =>
    update((p) => ({
      ...p,
      grids: { ...p.grids, [gk]: { ...(p.grids?.[gk] ?? {}), [`${ri},${chk.col}`]: v, ...(chk.codes !== undefined ? { [`${ri},${chk.codes}`]: v === chk.pass ? "none" : marks.join("; ") } : {}) } },
      answers: { ...p.answers, [`${sk}#row`]: "", [marksKey]: "", [`${sk}#last`]: String(ri) },
    }));
  const note = reg.note?.[s.n]?.(desk, progress);
  const lastAt = progress.answers[`${sk}#last`];
  const last = lastAt ? Number(lastAt) : undefined;
  return (
    <div data-guide="checklist" className="mt-3 grid gap-2">
      {note && <p data-guide="step-note" className="rounded border-l-2 border-[#C7CBF5] bg-[#F7F8FF] px-3 py-2 text-[13px] leading-snug text-[#111827]">{note}</p>}
      <p className="flex items-center justify-between gap-2 text-[13.5px] text-[#111827]">
        <span>{chk.line ? `${chk.line} The result fills its` : `Check each of your items against ${order[0]} to ${order[order.length - 1]}; the result fills its`} {reg.cols[chk.col].h}{chk.codes !== undefined ? ` and ${reg.cols[chk.codes].h}` : ""}.</span>
        <span className="shrink-0 font-mono text-[12.5px] text-[#3F4757] tabular-nums">{done} / {mineN}</span>
      </p>
      {ri === undefined ? (
        <>
          {!checked && (
            <p className="rounded border border-[#BBF7D0] bg-[#F0FDF4] px-3 py-2 text-[13.5px] text-[#14532D]">
              Every item is decided. To change one, click its {reg.cols[chk.col].h} in the table and check it again{rc ? " before you check your answers" : ""}.
            </p>
          )}
          {rc && <RowCheck task={task} s={s} chk={rc} />}
        </>
      ) : (
        <section data-guide="checklist-row" className="rounded border border-[#C7CBF5] bg-[#F7F8FF] px-3 py-2.5">
          <p className="text-[12px] text-[#5B6474]">{cellValue(reg, progress, task.id, ri, chk.col) ? "Checking again" : "Now checking"} · lit in the table</p>
          <p className="mt-0.5 text-[14px] font-semibold text-[#111827]">{(chk.head ?? [0, 1]).map((c) => cellValue(reg, progress, task.id, ri, c)).filter(Boolean).join(" · ")}</p>
          {/* Above the list, so it stays in reach on a phone, where the ten checks run past the screen. */}
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <p className="min-w-0 flex-1 basis-[180px] text-[12px] leading-snug text-[#5B6474]">
              {chk.codes === undefined ? "Read the checks in order. If one fails, click Fails on it. If none fails:" : chk.mark ? (marks.length ? `Marked ${mark.toLowerCase()}: ${marks.join(", ")}. When every one is read:` : `Mark each one that is ${mark.toLowerCase()}. If none is:`) : marks.length ? `Marked as failing: ${marks.join(", ")}. When every check is read:` : "Read the checks in order and mark every one that fails. If none fails:"}
            </p>
            {chk.codes !== undefined && marks.length ? (
              <button type="button" data-guide="record" onClick={() => write(chk.fail)} className="h-8 shrink-0 rounded bg-[#4338CA] px-3 text-[13px] font-semibold text-white hover:brightness-90 focus-ring">
                {/* Rule R09: a D9 file is also reported as a data issue, and its content is not copied. */}
                Record {chk.fail}{marks.includes("D9") ? " and report data issue" : ""}
              </button>
            ) : (
              <button type="button" data-guide="record" onClick={() => write(chk.pass)} className="h-8 shrink-0 rounded bg-[#4338CA] px-3 text-[13px] font-semibold text-white hover:brightness-90 focus-ring">
                Record {chk.pass}
              </button>
            )}
          </div>
          <ol className="mt-2 grid gap-1">
            {checks.map(([code, what]) => {
              const at = chk.reads[code];
              return (
                <li key={code} data-check={code} className={`grid ${what ? "grid-cols-[34px_minmax(0,1fr)_auto]" : "grid-cols-[minmax(0,1fr)_auto]"} items-start gap-x-2 rounded bg-white px-2 py-1.5 text-[13px] text-[#111827]`}>
                  {what && <span className="font-mono text-[12px] font-semibold text-[#3730A3]">{code}</span>}
                  <span className="min-w-0">
                    <span className={`block leading-snug ${what ? "" : "font-semibold text-[#3730A3]"}`}>{what || code}</span>
                    {at !== undefined &&
                      [at].flat().map((c) => (
                        <span key={c} className="block text-[12px] leading-snug text-[#5B6474]">
                          {reg.cols[c].h === code ? "" : `${reg.cols[c].h}: `}<span className="text-[#111827]">{cellValue(reg, progress, task.id, ri, c) || <em>empty</em>}</span>
                        </span>
                      ))}
                  </span>
                  {chk.codes === undefined ? (
                    <button type="button" onClick={() => write(chk.fail)} className="h-7 rounded border border-[#C9CED8] bg-white px-2.5 text-[12px] font-semibold text-[#111827] hover:border-[#B45309] hover:text-[#92400E] focus-ring">
                      Fails
                    </button>
                  ) : (
                    <button type="button" aria-pressed={marks.includes(code)} aria-label={`${code} ${mark.toLowerCase()}`} onClick={() => toggle(code)} className={`h-7 rounded border px-2.5 text-[12px] font-semibold focus-ring ${marks.includes(code) ? "border-[#B45309] bg-[#FFFBEB] text-[#92400E]" : "border-[#C9CED8] bg-white text-[#111827] hover:border-[#B45309] hover:text-[#92400E]"}`}>
                      {marks.includes(code) ? `${mark} ✓` : mark}
                    </button>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      )}
      {ri !== undefined && done > 0 && (
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-[#5B6474]">
          {/* The file just recorded, checked again from here: on a phone the table is a long way up. */}
          {chk.codes !== undefined && last !== undefined && last !== ri && (
            <button type="button" data-guide="check-again" onClick={() => update((p) => ({ ...p, answers: { ...p.answers, [`${sk}#row`]: String(last) } }))} className="h-7 rounded border border-[#C9CED8] bg-white px-2.5 text-[12px] font-semibold text-[#3730A3] hover:border-[#4338CA] focus-ring">
              Check {reg.rows[last][0]} again
            </button>
          )}
          <span>Click an item&apos;s {reg.cols[chk.col].h} in the table to check it again.</span>
        </p>
      )}
    </div>
  );
}

/**
 * Beside a register on its report step (F2.2 step 4, D9): how many items are reported, and, when the
 * mentee finds none to report, the line that says so. Reports are made on the rows themselves.
 */
export function ReportWork({ task, s }: { task: Task; s: Step }) {
  const { desk, progress, update } = useDesk();
  const reg = regOf(task.id, s.n)!;
  const key = reportKey(task.id, s.n);
  const v = progress.answers[key] ?? "";
  const n = v.split(",").filter((x) => x && x !== "none").length;
  const [miss, setMiss] = useState(false);
  const none = () => {
    if (exposedRows(reg, desk).length) return setMiss(true);
    setMiss(false);
    update((p) => ({ ...p, answers: { ...p.answers, [key]: "none", [`${stepKey(task.id, s.n)}#miss`]: "" } }));
  };
  return (
    <div data-guide="report" className="mt-3 grid gap-2">
      <p className="text-[13.5px] leading-snug text-[#111827]">
        Read the {reg.cols[reg.report!.col].h} of each of your items in the table. Report any that is not “{reg.report!.clean}”, on its row.
      </p>
      {v === "none" ? (
        <p data-guide="report-none" className="rounded border border-[#BBF7D0] bg-[#F0FDF4] px-3 py-2 text-[13.5px] text-[#14532D]">Recorded: none of your items shows unmasked data, so there is nothing to report.</p>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          {n === 0 && (
            <button type="button" onClick={none} className="h-8 rounded border border-[#C9CED8] bg-white px-3 text-[13px] font-semibold text-[#111827] hover:border-[#4338CA] focus-ring">
              None of my items shows unmasked data
            </button>
          )}
          <span className="text-[12.5px] text-[#5B6474] tabular-nums">{n} reported</span>
        </div>
      )}
      {miss && <p className="text-[12.5px] text-[#92400E]">Look again: one of your items has a {reg.cols[reg.report!.col].h} that is not “{reg.report!.clean}”.</p>}
    </div>
  );
}

/**
 * Beside a register whose rows are split with rule R10 (T3.1 step 2): each row copied in by the earlier
 * step, its text with every " and " and ";" as a button. A joint that joins two duties is clicked: the row
 * keeps the first duty and a new row below takes the second, every other cell copied. Whether a joint
 * joins two duties is the mentee's call; the step is done when no row has a joint left.
 */
export function SplitWork({ task, s }: { task: Task; s: Step }) {
  const { progress, update } = useDesk();
  const reg = regOf(task.id, s.n)!;
  const { col } = reg.split![s.n];
  const gk = regKey(task.id, reg.code);
  const rs = splitRows(reg, progress, task.id, s.n);
  const left = rs.filter((ri) => joints(cellValue(reg, progress, task.id, ri, col)).length);
  const cut = (ri: number, j: { at: number; len: number }) =>
    update((p) => ({ ...p, grids: { ...p.grids, [gk]: splitRow(p.grids?.[gk] ?? {}, ri, col, cellValue(reg, p, task.id, ri, col), j, s.n, reg.cols.length) } }));
  return (
    <div data-guide="split" className="mt-3 grid gap-2">
      <p className="text-[13.5px] leading-snug text-[#111827]">
        Rule R10: where “and” or “;” joins two duties, each duty gets its own row. Click the joint to split the row there; the second duty moves to a new row below it.
      </p>
      <ol className="grid gap-1.5">
        {rs.map((ri) => {
          const v = cellValue(reg, progress, task.id, ri, col);
          const js = joints(v);
          const id = cellValue(reg, progress, task.id, ri, 0);
          return (
            <li key={ri} data-split-row={ri} className={`rounded border px-3 py-2 text-[13.5px] ${js.length ? "border-[#C7CBF5] bg-[#F7F8FF]" : "border-[#BBF7D0] bg-[#F0FDF4]"}`}>
              <span className="mr-2 font-mono text-[12px] font-semibold text-[#3F4757]">{id}</span>
              <span className="mr-2 text-[12px] text-[#5B6474]">{cellValue(reg, progress, task.id, ri, 5)}</span>
              <span className="text-[#111827]">
                {js.map((j, k) => (
                  <span key={k}>
                    {v.slice(k ? js[k - 1].at + js[k - 1].len : 0, j.at)}
                    <button type="button" data-joint={j.w} onClick={() => cut(ri, j)} aria-label={`Split ${id} at “${j.w}”`} className="mx-0.5 rounded border border-[#4338CA] bg-white px-1.5 font-semibold text-[#3730A3] hover:bg-[#EEF0FF] focus-ring">
                      {j.w}
                    </button>
                  </span>
                ))}
                {js.length ? v.slice(js[js.length - 1].at + js[js.length - 1].len) : v}
              </span>
              {!js.length && <span className="ml-2 whitespace-nowrap text-[12px] font-semibold text-[#15803D]">one duty</span>}
            </li>
          );
        })}
      </ol>
      <p className="text-[12.5px] text-[#5B6474]">
        {left.length ? `${left.length} row${left.length > 1 ? "s" : ""} still joined.` : "Every row holds one duty."} You can reword a new row in the table so that it reads as a whole duty.
      </p>
    </div>
  );
}

/**
 * Beside the register on a compare step (T3.1 step 7): for each office of the rows copied from Section 2, its
 * clock there, and the mentee's call against the second source for its country (BKB-ERM-001 Annex A),
 * same or different. A wrong call says what the second source reads.
 */
export function CompareWork({ task, s }: { task: Task; s: Step }) {
  const { desk, progress, update } = useDesk();
  const reg = regOf(task.id, s.n)!;
  const gk = regKey(task.id, reg.code);
  useDocs(["BKB-ERM-001", addendumOf(desk)]);
  const offices = compareOffices(reg, desk, progress, task.id);
  const set = (city: string, v: string) => update((p) => ({ ...p, grids: { ...p.grids, [gk]: { ...(p.grids?.[gk] ?? {}), [`cmp:${city}`]: v } } }));
  if (!offices) return <div className="mt-3 h-24 animate-pulse rounded bg-[#F3F4F7]" aria-busy="true" />;
  return (
    <div data-guide="compare" className="mt-3 grid gap-2">
      <p className="text-[13.5px] leading-snug text-[#111827]">
        For each office, find its country in BKB-ERM-001 Annex A and compare the breach-notification clock there with the one in your register.
      </p>
      {offices.map((o) => {
        const wrong = !!o.got && o.got !== (o.differs ? "differs" : "same");
        return (
          <section key={o.city} data-compare={o.city} className={`rounded border px-3 py-2.5 ${o.got && !wrong ? "border-[#BBF7D0] bg-[#F0FDF4]" : "border-[#C7CBF5] bg-[#F7F8FF]"}`}>
            <p className="text-[14px] font-semibold text-[#111827]">
              {o.city} <span className="font-normal text-[#5B6474]">· Annex A row: {o.country}</span>
            </p>
            <p className="mt-1 text-[13px] text-[#3F4757]">
              <span className="text-[#5B6474]">Your register ({addendumOf(desk)} Section 2):</span> {o.ours}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {(["same", "differs"] as const).map((v) => (
                <button key={v} type="button" onClick={() => set(o.city, v)} aria-pressed={o.got === v} className={`h-8 rounded border px-3 text-[13px] font-semibold focus-ring ${o.got === v ? "border-[#4338CA] bg-[#4338CA] text-white" : "border-[#C9CED8] bg-white text-[#111827] hover:border-[#4338CA]"}`}>
                  {v === "same" ? "Same as Annex A" : "Differs from Annex A"}
                </button>
              ))}
            </div>
            {wrong && <p className="mt-1.5 text-[12.5px] leading-snug text-[#92400E]">Look again: Annex A reads “{o.theirs}” for {o.country}.</p>}
            {o.got === "differs" && o.differs && <p className="mt-1.5 text-[12.5px] text-[#14532D]">Record both values in Frequency / deadline and write “Differs — addendum governs”.</p>}
            {o.got === "same" && !o.differs && <p className="mt-1.5 text-[12.5px] text-[#14532D]">Recorded: the two sources agree, so there is no difference to note.</p>}
          </section>
        );
      })}
    </div>
  );
}

/**
 * Under a per-row decision's progress: "Check my answers" once every row is decided. The rows lock and
 * each shows whether it matches the key, the key's value and why — before the step is completed, so
 * the learner knows what was right. The key comes from the backend only then.
 */
function RowCheck({ task, s, chk }: { task: Task; s: Step; chk: RowCheckSpec }) {
  const { desk, progress, update } = useDesk();
  const reg = regOf(task.id, s.n)!;
  const id = `${task.id}-${s.n}`;
  const fb = progress.rowChecks?.[id];
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const ready = regStatus(desk, progress, task, s.n).ok;
  const check = async () => {
    setBusy(true);
    setFailed(false);
    // Sent and returned as lists: the API client case-converts object keys, which would mangle labels.
    const picks: { label: string; pick: string }[] = [];
    // The rows this step decides: a step that works on some rows only (`only`, or the rows it added)
    // checks those. The label is read as filled, since a register built row by row has no given cells.
    const own = (r: string[], ri: number) => reg.mine(r, desk) && (!reg.only?.[s.n] || reg.only[s.n](r, progress)) && (reg.grow?.adds[s.n] === undefined || addedBy(reg, progress, task.id, ri) === s.n);
    regRows(reg, progress, task.id).forEach((r, ri) => {
      // A value the platform wrote itself (derived) is not the learner's answer, so it is not checked.
      if (own(r, ri) && derivedAt(reg, progress, task.id, ri, chk.col) === null) picks.push({ label: cellValue(reg, progress, task.id, ri, chk.ask ?? chk.label), pick: cellValue(reg, progress, task.id, ri, chk.col) });
    });
    // Looked up by another column (`ask`, T3.1 step 5: the policy of the row's Process): the answers come
    // back in the order sent, each stored under the row's own label.
    const shown = regRows(reg, progress, task.id).flatMap((r, ri) => (own(r, ri) && derivedAt(reg, progress, task.id, ri, chk.col) === null ? [cellValue(reg, progress, task.id, ri, chk.label)] : []));
    // The answer follows from the learner's own row by the step's rule: checked here, no key needed.
    if (chk.rule) {
      const rows: RowsFeedback["rows"] = {};
      regRows(reg, progress, task.id).forEach((r, ri) => {
        // As above: a value the platform wrote (T4.1: a covered row's fix location "—") is not checked.
        if (!own(r, ri) || derivedAt(reg, progress, task.id, ri, chk.col) !== null) return;
        const pick = cellValue(reg, progress, task.id, ri, chk.col);
        const { best, why } = chk.rule!(liveRow(reg, progress, task.id, ri), desk);
        // An empty answer: the rule says nothing for this row, so it is not scored.
        rows[cellValue(reg, progress, task.id, ri, chk.label)] = { pick, best, correct: best ? pick === best : null, why };
      });
      update((p) => ({ ...p, rowChecks: { ...(p.rowChecks ?? {}), [id]: { rows, at: new Date().toISOString() } } }));
      setBusy(false);
      return;
    }
    try {
      const r = await api.post<{ rows: ({ label: string } & RowsFeedback["rows"][string])[]; note?: string | null }>("/me/desk/rows", { id, picks });
      const byOrder = chk.ask !== undefined && r.rows.length === picks.length;
      const fb: RowsFeedback = { rows: Object.fromEntries(r.rows.map(({ label, ...x }, i) => [byOrder ? shown[i] : label, x])), note: r.note, at: new Date().toISOString() };
      update((p) => ({ ...p, rowChecks: { ...(p.rowChecks ?? {}), [id]: fb } }));
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };
  if (fb) {
    const all = Object.values(fb.rows);
    const right = all.filter((x) => x.correct === true).length;
    const scored = all.filter((x) => x.correct !== null).length;
    return (
      <div data-guide="row-result" className="rounded border border-[#DDE1E8] bg-[#F7F8FA] px-3 py-2.5 text-[13px] text-[#111827]">
        <p className="font-semibold">{right} of {scored} right{scored < all.length ? ` · ${all.length - scored} not scored` : ""}</p>
        <p className="mt-0.5 text-[12.5px] text-[#5B6474]">Each row in the table now shows the answer and why. Rows are locked.</p>
        {scored < all.length && fb.note && <p className="mt-1 text-[12px] text-[#78350F]">{fb.note}</p>}
      </div>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        data-guide="check-rows"
        disabled={!ready || busy}
        onClick={check}
        className="h-9 rounded bg-[#111827] px-4 text-[13px] font-semibold text-white hover:brightness-110 disabled:cursor-not-allowed disabled:bg-[#E3E6EC] disabled:text-[#8A91A3]"
      >
        {busy ? "Checking…" : "Check my answers"}
      </button>
      <span className="text-[12px] text-[#5B6474]">{failed ? "Could not check. Try again." : ready ? "Each row then shows the answer and why, and your rows lock." : "Opens once every row has a value."}</span>
    </div>
  );
}
