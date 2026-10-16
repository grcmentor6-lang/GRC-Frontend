"use client";

import { Icon } from "@/components/ui/icon";
import { useDesk } from "./desk-context";
import { isDecideCell, isFillCell, type Step, type Task } from "@/lib/desk/model";
import { stepKey } from "@/lib/desk/progress";
import { gridKey, gridStatus } from "@/lib/desk/work";
import { BRIEFS, REGISTERS, addRow, addedBy, briefKey, briefStatus, cellValue, regKey, regRows, regStatus, removeRow } from "@/lib/desk/registers";
import { DocCitation } from "./doc-text";
import { RMF, fileExts, fileNameOk, openBefore, receiptHash, rmfExpected, rmfKey, same, submitCodes } from "@/lib/desk/forms";

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
        <input readOnly={readOnly} value={progress.answers[`${key}#ref`] ?? ""} onChange={(e) => set(`${key}#ref`, e.target.value)} placeholder="Document and section, e.g. BKB-ADD-16 §2" className={field} />
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
  const set = (cell: string, v: string) => update((p) => ({ ...p, grids: { ...p.grids, [gk]: { ...(p.grids?.[gk] ?? {}), [cell]: v } } }));
  return (
    <div className="mt-3 grid gap-1.5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#3F4757]">
        {RMF.file} · table {t + 1} “{table.title}”
      </p>
      <p className="text-[12.5px] text-[#5B6474]">
        Copy from <strong className="font-semibold text-[#111827]">{table.from}</strong>, exactly as written there.
      </p>
      <table className="w-full border-collapse border border-[#DDE1E8] text-[13px]">
        <tbody>
          {table.rows.map((r, i) => {
            const cell = `${t},${i}`;
            const v = cells[cell] ?? "";
            const off = !!v.trim() && !same(v, want[i]);
            return (
              <tr key={i}>
                <th scope="row" className="w-[38%] border-b border-r border-[#E9ECF1] bg-[#F7F8FA] px-3 py-2 text-left align-top font-mono text-[12px] font-semibold text-[#111827]">{r}</th>
                <td className="border-b border-[#E9ECF1] p-0 align-top">
                  <input
                    value={v}
                    readOnly={readOnly}
                    onChange={(e) => set(cell, e.target.value)}
                    placeholder={t === 2 ? "DD-MMM-YYYY" : "copy here"}
                    aria-label={`${table.title}: ${r}`}
                    aria-invalid={off}
                    className={`block min-h-[38px] w-full px-3 py-2 text-[13px] outline-none placeholder:italic placeholder:text-[#8A91A3] focus:shadow-[inset_0_0_0_2px_#4338CA] ${v.trim() ? "bg-white text-[#111827]" : "bg-[#EEF0FF]/70"}`}
                  />
                  {off && <span className="block px-3 pb-1.5 text-[12px] text-[#92400E]">Not what {table.from.split("›").pop()!.trim()} shows. Check it again.</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
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
          <label key={c} className="grid gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#3F4757]">File name for {c} · saved in 02_Working</span>
            <input readOnly={readOnly} value={v} onChange={(e) => update((p) => ({ ...p, answers: { ...p.answers, [`${key}#${c}`]: e.target.value } }))} placeholder={`<mentee ID>_${task.id}_${c}_v1.${ext[0]}`} className={`${field} font-mono text-[13px]`} />
            <span className={`text-[12px] ${v.trim() && !ok ? "text-[#92400E]" : "text-[#5B6474]"}`}>
              {v.trim() && !ok ? `Follow the convention: ${desk.mentee}_${task.id}_${c}_v1.${ext.join(" or .")}` : `Your mentee ID is ${desk.mentee}.`}
            </span>
          </label>
        );
      })}
      {!files.length && <p className="text-[13.5px] text-[#3F4757]">{codes.join(", ") || "Your work"} is handed in on the platform; no file to name.</p>}
      {at ? (
        <dl className="grid gap-1 rounded border border-[#BBF7D0] bg-[#F0FDF4] px-3 py-2.5 text-[12.5px] text-[#14532D]">
          <dt className="text-[11px] font-semibold uppercase tracking-[0.08em]">Receipt</dt>
          <dd>{progress.answers[key]}</dd>
          <dd className="break-all font-mono text-[11.5px]">SHA-256 {progress.answers[`${key}#hash`]}</dd>
          <dd className="font-mono text-[11.5px]">{at.replace("T", " ").slice(0, 19)} UTC</dd>
        </dl>
      ) : null}
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" disabled={!named || waiting.length > 0} onClick={submit} className="h-9 rounded bg-[#111827] px-4 text-[13px] font-semibold text-white hover:brightness-110 disabled:cursor-not-allowed disabled:bg-[#E3E6EC] disabled:text-[#8A91A3]">
            {at ? "Submit again" : "Submit"}
          </button>
          {waiting.length > 0 && <span className="text-[12.5px] text-[#5B6474]">Finish step{waiting.length > 1 ? "s" : ""} {waiting.join(", ")} first.</span>}
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
export function RegisterWork({ task, s, readOnly }: { task: Task; s?: Step; readOnly: boolean }) {
  const { desk, progress, update } = useDesk();
  const reg = REGISTERS[task.id];
  const gk = regKey(task.id, reg.code);
  const rows = regRows(reg, progress, task.id);
  const open = new Set(readOnly || !s ? [] : (reg.steps[s.n] ?? []));
  const adding = !readOnly && !!s && !!reg.grow && reg.grow.adds[s.n] !== undefined;
  const full = !!reg.grow && rows.length >= reg.grow.target;
  const edit = (fn: (c: Record<string, string>) => Record<string, string>) => update((p) => ({ ...p, grids: { ...p.grids, [gk]: fn(p.grids?.[gk] ?? {}) } }));
  const set = (cell: string, v: string) => edit((c) => ({ ...c, [cell]: v }));
  const th = "whitespace-nowrap border-b border-r border-[#DDE1E8] border-r-[#E9ECF1] px-3 py-[9px] text-left font-semibold last:border-r-0";
  const td = "border-b border-r border-[#E9ECF1] align-top last:border-r-0";
  return (
    <div className="overflow-x-auto border-b border-[#DDE1E8] bg-white">
      <p className="flex items-center gap-2 border-b border-[#E9ECF1] bg-[#F7F8FA] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5B6474]">
        <span>
          {reg.title}
          {reg.rows.some((r) => !reg.mine(r, desk)) && (
            <> · <span className="text-[#3730A3]">your rows</span> · <span className="text-[#8A91A3]">worked examples (grey)</span></>
          )}
        </span>
        {reg.grow && <span className={`ml-auto font-mono tabular-nums ${full ? "text-[#15803D]" : "text-[#3F4757]"}`}>{rows.length} / {reg.grow.target} rows</span>}
      </p>
      <table className="w-full border-collapse text-[13px]">
        <thead className="bg-[#F7F8FA] text-[11px] uppercase tracking-[0.06em] text-[#5B6474]">
          <tr>
            {reg.cols.map((c, ci) => <th key={c.h} className={`${th} ${open.has(ci) ? "bg-[#EEF0FF] text-[#3730A3]" : ""} ${c.auto ? "sticky left-0 z-[1] bg-[#F7F8FA] shadow-[1px_0_0_#DDE1E8]" : ""}`}>{c.h}</th>)}
            {adding && <th className={th}><span className="sr-only">Remove</span></th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => {
            const mine = reg.mine(r, desk);
            const by = reg.grow ? addedBy(reg, progress, task.id, ri) : 0;
            return (
              <tr key={ri} className={mine ? "" : "bg-[#FAFAFB] text-[#8A91A3]"}>
                {reg.cols.map((c, ci) => {
                  const v = cellValue(reg, progress, task.id, ri, ci);
                  const cell = `${ri},${ci}`;
                  const label = `${c.h}, row ${ri + 1}`;
                  if (mine && !r[ci] && !c.auto && open.has(ci)) {
                    const base = `block min-h-[38px] w-full min-w-[150px] px-3 py-2 text-[13px] outline-none focus:shadow-[inset_0_0_0_2px_#4338CA] ${v.trim() ? "bg-white text-[#111827]" : "bg-[#EEF0FF]/70"}`;
                    const opts = c.opts === "step" ? s?.opt : c.opts;
                    return (
                      <td key={ci} className={`${td} p-0`}>
                        {opts ? (
                          <select value={v} onChange={(e) => set(cell, e.target.value)} aria-label={label} className={base}>
                            <option value="">Choose…</option>
                            {opts.map((o) => <option key={o}>{o}</option>)}
                          </select>
                        ) : (
                          <input value={v} onChange={(e) => set(cell, e.target.value)} placeholder="fill in" aria-label={label} className={`${base} placeholder:italic placeholder:text-[#8A91A3]`} />
                        )}
                      </td>
                    );
                  }
                  return (
                    <td key={ci} className={`${td} px-3 py-2 ${c.auto ? "sticky left-0 z-[1] whitespace-nowrap bg-white font-mono text-[12px] font-semibold text-[#111827] shadow-[1px_0_0_#DDE1E8]" : ci === 1 && mine ? "font-medium text-[#111827]" : mine ? "text-[#3F4757]" : ""}`}>
                      {v || (mine ? <span className="text-[#C9CED8]">—</span> : "")}
                      {c.auto && by > 0 && <span className="block text-[10.5px] font-normal text-[#8A91A3]">step {by}</span>}
                    </td>
                  );
                })}
                {adding && (
                  <td className={`${td} p-0`}>
                    <button type="button" onClick={() => edit((cells) => removeRow(cells, ri))} aria-label={`Remove row ${ri + 1}`} className="grid h-[38px] w-10 place-items-center text-[#8A91A3] hover:bg-[#FEF2F2] hover:text-[#B91C1C] focus-ring">
                      <Icon name="x" size={14} />
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
      {adding && (
        <button
          type="button"
          disabled={full}
          onClick={() => edit((cells) => addRow(cells, s!.n))}
          className="flex w-full items-center justify-center gap-1.5 border-t border-dashed border-[#C7CBF5] bg-[#F7F8FF] px-3 py-2.5 text-[13px] font-semibold text-[#3730A3] hover:bg-[#EEF0FF] focus-ring disabled:cursor-not-allowed disabled:bg-[#F7F8FA] disabled:text-[#8A91A3]"
        >
          <Icon name="plus" size={14} /> {full ? `${reg.grow!.target} rows: the register is full` : "Add a row"}
        </button>
      )}
      {reg.grow && !rows.length && !adding && <p className="px-3 py-6 text-center text-[13px] text-[#8A91A3]">No rows yet. Rows are added by the steps that copy obligations in.</p>}
    </div>
  );
}

/** Beside the register: what this step does to it, and how far. */
export function RegisterProgress({ task, s }: { task: Task; s: Step }) {
  const { desk, progress } = useDesk();
  const reg = REGISTERS[task.id];
  const g = regStatus(desk, progress, task, s.n);
  const cols = reg.steps[s.n] ?? [];
  const adds = reg.grow?.adds[s.n];
  const names = <strong>{cols.map((ci) => reg.cols[ci].h).join(", ")}</strong>;
  return (
    <div className="mt-3 grid gap-2">
      <p className="flex items-start gap-2 text-[13.5px] leading-relaxed text-[#111827]">
        <Icon name="edit" size={15} className="mt-0.5 shrink-0 text-[#4338CA]" />
        <span>
          {reg.grow && !cols.length ? (
            <>The register must hold exactly <strong>{reg.grow.target} rows</strong>. Remove any beyond that, last rows first.</>
          ) : adds !== undefined ? (
            <>
              {adds > 0 ? <>Add at least <strong>{adds} row{adds > 1 ? "s" : ""}</strong> with “Add a row”</> : <>Add rows if you need them</>}, one obligation per row (R10), and fill {names} on each row you add.
            </>
          ) : cols.length === reg.cols.length ? (
            <>Fill <strong>every column</strong> of each row in {reg.code}.</>
          ) : (
            <>Fill {names} on every row of the register.</>
          )}
          {reg.rows.some((r) => !reg.mine(r, desk)) && " The grey rows are worked examples to copy the pattern from."}
        </span>
      </p>
      <dl className="grid grid-cols-2 border border-[#DDE1E8]">
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
      </dl>
    </div>
  );
}

/**
 * A fixed-section document template (lib/desk/registers BRIEFS) drawn as a page: the worked section
 * as given, the others as the mentee fills them, with the step's own section open and each section's
 * "Source:" line. The label sits in the footer, where the pack says it is printed.
 */
export function BriefWork({ task, s, readOnly }: { task: Task; s?: Step; readOnly: boolean }) {
  const { progress, update } = useDesk();
  const b = BRIEFS[task.id];
  const gk = briefKey(task.id, b.code);
  const v = progress.grids?.[gk] ?? {};
  const cur = readOnly || !s ? -1 : (b.steps[s.n] ?? -1);
  const set = (k: string, x: string) => update((p) => ({ ...p, grids: { ...p.grids, [gk]: { ...(p.grids?.[gk] ?? {}), [k]: x } } }));
  const input = "w-full rounded border border-[#C9CED8] bg-white px-2.5 py-1.5 text-[13.5px] text-[#111827] placeholder:italic placeholder:text-[#8A91A3] focus:border-[#4338CA] focus:outline-none focus:ring-2 focus:ring-[#4338CA]/15";
  return (
    <div className="flex-1 bg-[#E9ECF1] p-4">
      <article aria-label={b.title} className="mx-auto grid max-w-[720px] gap-4 bg-white px-7 py-6 shadow-[0_1px_3px_rgba(17,24,39,0.12)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5B6474]">{b.title}</p>
        {b.sections.map((sec, i) => {
          const editing = i === cur;
          const src = (v[`${i},src`] ?? "").trim();
          return (
            <section key={sec.h} className={`grid gap-1.5 ${editing ? "-mx-3 rounded border border-[#C7CBF5] bg-[#F7F8FF] px-3 py-2.5" : ""}`}>
              <h3 className="text-[14px] font-bold text-[#111827]">
                {sec.h}
                {sec.given && <span className="ml-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#8A91A3]">worked example</span>}
                {editing && <span className="ml-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#4338CA]">this step</span>}
              </h3>
              {sec.given ? (
                <div className="text-[13px] [&_h3]:hidden"><DocCitation id={sec.given[0]} cites={sec.given[1]} /></div>
              ) : sec.lines ? (
                <dl className="grid gap-1 text-[13.5px]">
                  {sec.lines.map((l, li) => (
                    <div key={l} className="grid grid-cols-[120px_minmax(0,1fr)] items-center gap-2">
                      <dt className="text-[#5B6474]">{l}</dt>
                      <dd>{editing ? <input value={v[`${i},${li}`] ?? ""} onChange={(e) => set(`${i},${li}`, e.target.value)} placeholder="copy word for word" className={input} /> : <span className="text-[#111827]">{v[`${i},${li}`] || <span className="text-[#C9CED8]">—</span>}</span>}</dd>
                    </div>
                  ))}
                </dl>
              ) : editing ? (
                <textarea rows={5} value={v[`${i},0`] ?? ""} onChange={(e) => set(`${i},0`, e.target.value)} placeholder="One item per line, word for word, in the same order" className={`${input} resize-y leading-[1.5]`} />
              ) : (
                <p className="whitespace-pre-line text-[13.5px] text-[#111827]">{v[`${i},0`] || <span className="text-[#C9CED8]">—</span>}</p>
              )}
              {!sec.given &&
                (editing ? (
                  <label className="grid grid-cols-[120px_minmax(0,1fr)] items-center gap-2 text-[13px]">
                    <span className="font-semibold text-[#3F4757]">Source:</span>
                    <input value={v[`${i},src`] ?? ""} onChange={(e) => set(`${i},src`, e.target.value)} placeholder="e.g. BKB-ADD-16 §9" className={input} />
                  </label>
                ) : (
                  src && <p className="text-[12.5px] text-[#5B6474]">Source: {src}</p>
                ))}
            </section>
          );
        })}
        <footer className="mt-2 border-t border-[#DDE1E8] pt-2 text-center text-[11px] font-semibold uppercase tracking-[0.1em] text-[#5B6474]">{b.label}</footer>
      </article>
    </div>
  );
}

/** Beside the brief: which section this step fills, and whether it is complete. */
export function BriefProgress({ task, s }: { task: Task; s: Step }) {
  const { progress } = useDesk();
  const b = BRIEFS[task.id];
  const g = briefStatus(progress, task, s.n);
  return (
    <div className="mt-3 grid gap-2">
      <p className="flex items-start gap-2 text-[13.5px] leading-relaxed text-[#111827]">
        <Icon name="edit" size={15} className="mt-0.5 shrink-0 text-[#4338CA]" />
        <span>
          Fill section <strong>{b.sections[b.steps[s.n]].h}</strong> on the page, word for word from the source, then its Source line.
        </span>
      </p>
      <dl className="border border-[#DDE1E8] px-3 py-2">
        <dt className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5B6474]">Lines filled</dt>
        <dd className="font-mono text-[15px] font-semibold tabular-nums text-[#111827]">{g.filled} / {g.cells}</dd>
      </dl>
    </div>
  );
}
