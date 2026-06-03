"use client";

import { Icon } from "@/components/ui/icon";
import { inputCls } from "@/components/ui/forms";
import type { FieldSpec, Column } from "@/lib/verb-forms";

type Values = Record<string, unknown>;
type Row = Record<string, string>;

const asList = (v: unknown): string[] => (Array.isArray(v) ? (v as string[]) : []);
const asRows = (v: unknown): Row[] => (Array.isArray(v) ? (v as Row[]) : []);

/**
 * Renders a verb's tailored field-spec into a controlled form. Values flow up via onChange and
 * become the submission payload.fields. A free-text "Additional notes" field is always appended.
 */
export function SchemaForm({
  spec,
  value,
  onChange,
}: {
  spec: FieldSpec[];
  value: Values;
  onChange: (next: Values) => void;
}) {
  const set = (key: string, v: unknown) => onChange({ ...value, [key]: v });

  return (
    <div className="space-y-4">
      {spec.map((f) => (
        <div key={f.key}>
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-[12px] font-medium text-slate-700 tracking-tight">{f.label}</span>
            {f.hint && <span className="text-[11px] text-slate-400">{f.hint}</span>}
          </div>
          <Field f={f} value={value[f.key]} onChange={(v) => set(f.key, v)} />
        </div>
      ))}

      <div>
        <div className="text-[12px] font-medium text-slate-700 tracking-tight mb-1.5">Additional notes</div>
        <textarea
          value={String(value.notes ?? "")}
          onChange={(e) => set("notes", e.target.value)}
          rows={4}
          placeholder="Anything else for the mentor to consider…"
          className="w-full rounded-lg bg-white ring-1 ring-slate-200/80 p-3 text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 resize-y"
        />
      </div>
    </div>
  );
}

function Field({ f, value, onChange }: { f: FieldSpec; value: unknown; onChange: (v: unknown) => void }) {
  if (f.type === "textarea") {
    return (
      <textarea
        value={String(value ?? "")}
        onChange={(e) => onChange(e.target.value)}
        rows={5}
        className="w-full rounded-lg bg-white ring-1 ring-slate-200/80 p-3 text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 resize-y"
      />
    );
  }
  if (f.type === "select") {
    return (
      <select value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} className={`${inputCls} cursor-pointer`}>
        <option value="">Select…</option>
        {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  }
  if (f.type === "list") {
    const items = asList(value);
    const rows = items.length ? items : [""];
    const update = (next: string[]) => onChange(next.filter((x, i) => x !== "" || i < next.length));
    return (
      <div className="space-y-2">
        {rows.map((it, i) => (
          <div key={i} className="flex items-center gap-2">
            <input value={it} placeholder={(f.placeholder as string) ?? "Add an item"} onChange={(e) => { const n = [...rows]; n[i] = e.target.value; update(n); }} className={inputCls} />
            <button type="button" onClick={() => update(rows.filter((_, j) => j !== i))} className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-rose-600 shrink-0"><Icon name="x" size={14} /></button>
          </div>
        ))}
        <button type="button" onClick={() => update([...rows, ""])} className="inline-flex items-center gap-1.5 text-[12px] font-medium text-indigo-600 hover:text-indigo-700"><Icon name="plus" size={13} /> Add</button>
      </div>
    );
  }
  if (f.type === "table") {
    const rows = asRows(value);
    const display = rows.length ? rows : [Object.fromEntries(f.columns.map((c) => [c.key, ""])) as Row];
    const setCell = (ri: number, ck: string, v: string) => {
      const n = display.map((r) => ({ ...r }));
      n[ri][ck] = v;
      onChange(n);
    };
    return (
      <div className="overflow-x-auto rounded-xl ring-1 ring-slate-200/70">
        <table className="w-full text-left border-collapse min-w-[520px]">
          <thead>
            <tr className="bg-slate-50/80 text-[10px] font-semibold tracking-[0.08em] uppercase text-slate-500">
              {f.columns.map((c) => <th key={c.key} className="px-2.5 py-2 font-semibold">{c.label}</th>)}
              <th className="w-9" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {display.map((row, ri) => (
              <tr key={ri}>
                {f.columns.map((c: Column) => (
                  <td key={c.key} className="px-1.5 py-1.5">
                    {c.type === "select" ? (
                      <select value={row[c.key] ?? ""} onChange={(e) => setCell(ri, c.key, e.target.value)} className="w-full h-9 px-2 rounded-md bg-white ring-1 ring-slate-200/70 text-[12px] focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                        <option value="">—</option>
                        {(c.options ?? []).map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input value={row[c.key] ?? ""} onChange={(e) => setCell(ri, c.key, e.target.value)} className="w-full h-9 px-2 rounded-md bg-white ring-1 ring-slate-200/70 text-[12px] focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                    )}
                  </td>
                ))}
                <td className="px-1">
                  <button type="button" onClick={() => onChange(display.filter((_, j) => j !== ri))} className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-rose-600"><Icon name="x" size={13} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-2 border-t border-slate-100">
          <button type="button" onClick={() => onChange([...display, Object.fromEntries(f.columns.map((c) => [c.key, ""])) as Row])} className="inline-flex items-center gap-1.5 text-[12px] font-medium text-indigo-600 hover:text-indigo-700"><Icon name="plus" size={13} /> Add row</button>
        </div>
      </div>
    );
  }
  // text | date | number
  return <input type={f.type === "text" ? "text" : f.type} value={String(value ?? "")} placeholder={(f as { placeholder?: string }).placeholder} onChange={(e) => onChange(e.target.value)} className={inputCls} />;
}
