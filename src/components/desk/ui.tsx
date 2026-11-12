"use client";

import { Fragment, type ReactNode } from "react";
import { Icon, type IconName } from "@/components/ui/icon";
import type { Table } from "@/lib/desk/model";
import { cellTone } from "@/lib/desk/cell-tone";
import { ladderCell } from "@/lib/desk/tree-text";
import { TreeCard } from "./walk-card";

/** Press feedback shared by every clickable on the desk. */
export const press = "transition-transform duration-150 ease-out active:scale-[0.97] focus-ring";

/** A data table in the desk's grid language. `flush` drops the outer frame for a full-bleed table. */
export function TableView({ t, max, flush }: { t: Partial<Table>; max?: number; flush?: boolean }) {
  const rows = (t.r ?? []).slice(0, max);
  if (!t.h?.length) return null;
  return (
    <div className={`@container overflow-x-auto bg-white ${flush ? "border-b border-[#DDE1E8]" : "rounded border border-[#DDE1E8]"}`}>
      {/* The register look (register.html): no column rules, a quiet header, the register's vocabulary as chips. */}
      <table className="w-full border-collapse text-[13.5px] leading-[1.5] tabular-nums text-[#4B5563]">
        <thead className="bg-[#F8F9FB] font-sans text-left text-[10.5px] uppercase tracking-[0.08em] text-[#6B7280]">
          <tr>
            {t.h.map((h) => (
              <th key={h} className="min-w-[84px] border-y border-b-[#E3E5EA] border-t-[#E8EAEF] px-3.5 py-3 align-bottom font-semibold leading-[1.4]">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            // A numbered ladder cell (Ref-Rules R01) is drawn as the tree card: inside its cell where the table is wide
            // enough, else in a full-width row under it, so a phone reads it without a sideways scroll.
            const lj = r.findIndex((c) => typeof c === "string" && ladderCell(c));
            const lad = lj >= 0 ? ladderCell(r[lj] as string) : null;
            const card = lad && <TreeCard title={t.h?.[0] === "Rule" ? `Rule ${r[0]}` : "Decision tree"} steps={lad.steps} />;
            return (
              <Fragment key={i}>
                <tr className="hover:[&>td]:bg-[#FAFAFC]">
                  {r.map((c, j) => (
                    <td key={j} className={`border-b border-[#EEF0F3] px-3.5 py-3 align-top first:font-semibold first:text-[#111827] ${lad ? "@max-xl:border-b-0" : ""}`}>
                      {j === lj && lad ? (
                        <div className="grid gap-2 @xl:min-w-[260px]">
                          {lad.lead && <p>{lad.lead}</p>}
                          <div className="@max-xl:hidden">{card}</div>
                          {lad.tail && <p>{lad.tail}</p>}
                        </div>
                      ) : typeof c === "string" && c ? (
                        <Toned v={c} h={t.h?.[j]} />
                      ) : (
                        c
                      )}
                    </td>
                  ))}
                </tr>
                {card && (
                  <tr className="@xl:hidden">
                    <td colSpan={t.h?.length} className="border-b border-[#EEF0F3] px-3.5 pb-3">
                      {/* The table may still scroll sideways (a long word elsewhere): the card keeps to the visible width. */}
                      <div className="sticky left-3.5 w-[calc(100cqw-1.75rem)]">{card}</div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
      {max && (t.r?.length ?? 0) > max && (
        <p className="border-t border-[#E9ECF1] px-3.5 py-2 text-[12px] text-[#5B6474]">{(t.r?.length ?? 0) - max} more rows</p>
      )}
    </div>
  );
}

/**
 * A register's value as a real register draws it (redesign, register.html): its vocabulary as a coloured
 * chip, Yes/No in bold, "See description" quiet; anything else as written (lib/desk/cell-tone).
 */
export function Toned({ v, h }: { v: string; h?: string }) {
  const t = cellTone(v, h);
  if (!t) return <>{v}</>;
  if (t.kind === "strong") return <span className="font-semibold text-[#111827]">{v}</span>;
  if (t.kind === "muted") return <span className="italic text-[#6B7280]">{v}</span>;
  return <span data-tone className={`inline-block rounded-md border px-2 py-[2px] text-[12px] font-semibold leading-[1.4] ${t.cls.includes("border-[") ? t.cls : `border-transparent ${t.cls}`}`}>{v}</span>;
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
