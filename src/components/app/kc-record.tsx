"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

interface KcRow { id: string; title: string; week: number; passMark: number | null; attempts: number; attemptsAllowed: number; bestScore: number | null; passed: boolean | null }

/**
 * Reports: the knowledge checks and the two exams, from GET /me/record (backend services/desk_kc.summary), where
 * every stored attempt is re-checked against the keys. Best attempt counts, as the pack's scheme says.
 * ponytail: its own GET of /me/record beside useTaskScores'; share one fetch if the page grows a third reader.
 */
export function KcRecord() {
  const [rows, setRows] = useState<KcRow[] | null>(null);
  useEffect(() => {
    let live = true;
    api
      .get<{ knowledgeChecks?: KcRow[] }>("/me/record")
      .then((r) => r.knowledgeChecks ?? [])
      .catch(() => [])
      .then((r) => live && setRows(r));
    return () => {
      live = false;
    };
  }, []);
  if (!rows?.length) return null;
  const th = "px-3 py-2 text-left font-semibold";
  const td = "border-t border-slate-100 px-3 py-2 align-top";
  return (
    <section data-report="knowledge-checks" className="rounded-xl bg-white ring-1 ring-slate-200">
      <h2 className="px-4 pt-3.5 text-[14px] font-semibold text-slate-900">Knowledge checks and exams</h2>
      <p className="px-4 pb-2 text-[12px] text-slate-500">Best attempt of each, checked against the answer key. Take them from the Working Desk, in the week they fall.</p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-[12.5px]">
          <thead className="bg-slate-50 text-[11px] uppercase tracking-[0.05em] text-slate-500">
            <tr><th className={th}>Wk</th><th className={th}>Test</th><th className={th}>Pass mark</th><th className={th}>Attempts</th><th className={th}>Best score</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td className={`${td} tabular-nums text-slate-500`}>{r.week}</td>
                <td className={td}>
                  <Link href={`/app/desk#${r.id}`} className="font-mono font-semibold text-indigo-700">{r.id}</Link>{" "}
                  <span className="text-slate-600">{r.title}</span>
                </td>
                <td className={`${td} text-slate-600`}>{r.passMark === null ? "Practice" : `${r.passMark} %`}</td>
                <td className={`${td} tabular-nums text-slate-600`}>{r.attempts} of {r.attemptsAllowed}</td>
                <td className={`${td} tabular-nums font-semibold ${r.passed === false ? "text-amber-700" : "text-slate-900"}`}>
                  {r.bestScore === null ? <span className="font-normal text-slate-400">Not taken</span> : `${r.bestScore}%${r.passed === true ? " · passed" : r.passed === false ? " · below the pass mark" : ""}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
