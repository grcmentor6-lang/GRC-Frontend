"use client";

import Link from "next/link";
import { Fragment } from "react";
import type { ScoreBreakdown as Breakdown } from "@/lib/desk-record";

const KIND = { decision: "Decision", inbox: "Inbox reply", rows: "Table of picks" } as const;
const pts = (n: number) => (Math.round(n * 10) / 10).toString();

/**
 * How one task's score was made: each keyed item, its share of 100, what it earned, and the rule behind a loss.
 * Private record only (My Submissions, Reports): the CV and certificate never receive it.
 */
export function ScoreBreakdown({ b }: { b: Breakdown }) {
  return (
    <details className="border-t border-[#E9ECF1] px-4 py-2 text-[13px]">
      <summary className="cursor-pointer text-[12.5px] font-medium text-[#4338CA]">How this score was made</summary>
      <table className="mt-2 w-full border-collapse text-left">
        <thead>
          <tr className="text-[11px] uppercase tracking-[0.06em] text-[#5B6474]">
            <th className="py-1 pr-3 font-semibold">Item</th>
            <th className="py-1 pr-3 font-semibold">Worth</th>
            <th className="py-1 pr-3 font-semibold">Earned</th>
            <th className="py-1 font-semibold">Lost</th>
          </tr>
        </thead>
        <tbody>
          {b.items.map((i) => (
            <Fragment key={i.id}>
              <tr className="border-t border-[#EEF0F3] align-top">
                <td className="py-1.5 pr-3 text-[#111827]">
                  <span className="font-mono text-[12px] text-[#5B6474]">{i.id}</span> {KIND[i.kind]}: {i.title}
                  {i.kind === "rows" && <span className="text-[#5B6474]"> ({i.rowsRight} of {i.rowsTotal} rows right)</span>}
                </td>
                <td className="py-1.5 pr-3 font-mono tabular-nums">{pts(i.worth)}</td>
                <td className="py-1.5 pr-3 font-mono tabular-nums text-[#15803D]">{pts(i.earned)}</td>
                <td className="py-1.5 font-mono tabular-nums text-[#B45309]">{pts(i.lost)}</td>
              </tr>
              {i.wrong.length > 0 && (
                // The reason for a loss, the full width of the table: in the Item column it was a six-word line on a phone.
                <tr>
                  <td colSpan={4} className="pb-2">
                    <ul className="space-y-1 border-l-2 border-[#DDE1E8] pl-2.5 text-[12.5px] leading-relaxed text-[#3F4757]">
                      {i.wrong.map((w, k) => (
                        <li key={k}>
                          {w.label && <strong className="font-semibold">{w.label}: </strong>}
                          {i.kind === "rows" ? (
                            <>you chose {w.pick}; the key says {w.best}. {w.why}</>
                          ) : (
                            <>You chose {w.pick}. {w.why} The key says {w.best}. Rule: {i.why}</>
                          )}
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
          <tr className="border-t border-[#C9CFD9] font-semibold">
            <td className="py-1.5 pr-3">Score (earned, rounded)</td>
            <td className="py-1.5 pr-3 font-mono">100</td>
            <td className="py-1.5 pr-3 font-mono">{b.score}</td>
            <td className="py-1.5" />
          </tr>
        </tbody>
      </table>
      <p className="mt-2 text-[12px] text-[#5B6474]">
        {b.note} <Link href="/app/guide#marking" className="font-medium text-[#4338CA] underline">How cells and picks are marked</Link>
      </p>
    </details>
  );
}
