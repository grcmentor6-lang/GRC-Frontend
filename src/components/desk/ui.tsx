"use client";

import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/ui/icon";
import type { Table } from "@/lib/desk/model";

/** Press feedback shared by every clickable on the desk. */
export const press = "transition-transform duration-150 ease-out active:scale-[0.97] focus-ring";

/** A data table in the desk's grid language. `flush` drops the outer frame for a full-bleed table. */
export function TableView({ t, max, flush }: { t: Partial<Table>; max?: number; flush?: boolean }) {
  const rows = (t.r ?? []).slice(0, max);
  if (!t.h?.length) return null;
  return (
    <div className={`overflow-x-auto bg-white ${flush ? "border-b border-[#DDE1E8]" : "rounded border border-[#DDE1E8]"}`}>
      <table className="w-full border-collapse text-[13px] tabular-nums">
        <thead className="bg-[#F7F8FA] text-left text-[11px] uppercase tracking-[0.06em] text-[#5B6474]">
          <tr>
            {t.h.map((h) => (
              <th key={h} className="whitespace-nowrap border-b border-r border-[#DDE1E8] border-r-[#E9ECF1] px-3.5 py-[9px] font-semibold last:border-r-0">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="hover:[&>td]:bg-[#FAFAFC]">
              {r.map((c, j) => (
                <td key={j} className="border-b border-r border-[#E9ECF1] px-3.5 py-[11px] align-top text-[#3F4757] last:border-r-0 first:font-medium first:text-[#111827]">{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {max && (t.r?.length ?? 0) > max && (
        <p className="border-t border-[#E9ECF1] px-3.5 py-2 text-[12px] text-[#5B6474]">{(t.r?.length ?? 0) - max} more rows</p>
      )}
    </div>
  );
}

export function Label({ children }: { children: ReactNode }) {
  return <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#3F4757]">{children}</div>;
}

export function Chip({ icon, children, onClick, tone = "slate" }: { icon?: IconName; children: ReactNode; onClick?: () => void; tone?: "slate" | "indigo" | "amber" | "emerald" }) {
  const tones = {
    slate: "bg-white text-slate-700 ring-slate-200 hover:ring-slate-300",
    indigo: "bg-indigo-50 text-indigo-700 ring-indigo-200 hover:ring-indigo-300",
    amber: "bg-amber-50 text-amber-800 ring-amber-200 hover:ring-amber-300",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200 hover:ring-emerald-300",
  }[tone];
  const cls = `inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] font-medium ring-1 ${tones}`;
  return onClick ? (
    <button type="button" onClick={onClick} className={`${cls} ${press}`}>
      {icon && <Icon name={icon} size={13} />}
      {children}
    </button>
  ) : (
    <span className={cls}>
      {icon && <Icon name={icon} size={13} />}
      {children}
    </span>
  );
}

/** Answer text from the task card: a sentence or a list of them. */
export function Answer({ a }: { a: string | string[] | undefined }) {
  if (!a) return <p className="text-slate-500">Not answered for this item.</p>;
  if (Array.isArray(a))
    return (
      <ul className="grid gap-1.5 pl-4 list-disc marker:text-slate-300">
        {a.map((x) => <li key={x}>{x}</li>)}
      </ul>
    );
  return <p>{a}</p>;
}
