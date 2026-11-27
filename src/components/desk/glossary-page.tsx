"use client";

import { useMemo, useState } from "react";
import { useDesk } from "./desk-context";
import { allEntries, GLOSSARY_GROUPS } from "@/lib/desk/glossary";

/** Learn › Glossary: every code and term the desk shows, searchable (UX101 W5). The data is lib/desk/glossary.json. */
export function GlossaryPage() {
  const { desk } = useDesk();
  const [q, setQ] = useState("");
  const [group, setGroup] = useState("");
  const all = useMemo(() => allEntries(), [desk]); // eslint-disable-line react-hooks/exhaustive-deps
  const needle = q.trim().toLowerCase();
  const shown = all.filter((e) => (!group || e.group === group) && (!needle || [e.name, e.def, e.where ?? "", ...(e.forms ?? [])].some((s) => s.toLowerCase().includes(needle))));
  const groups = GLOSSARY_GROUPS.filter((g) => shown.some((e) => e.group === g));
  return (
    <div data-guide="glossary" className="bg-white p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search a code or term, for example KR2, SoA, UTC"
          aria-label="Search the glossary"
          className="min-w-0 flex-1 basis-60 rounded border border-[#C9CEDA] px-3 py-2 text-[13px] focus-ring"
        />
        <select value={group} onChange={(e) => setGroup(e.target.value)} aria-label="Show one group" className="rounded border border-[#C9CEDA] bg-white px-2 py-2 text-[13px] focus-ring">
          <option value="">All groups</option>
          {GLOSSARY_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>
      <p className="mb-3 text-[12px] text-[#5B6474]" aria-live="polite">{shown.length} of {all.length} entries. In your own words, so read the source document before you quote it.</p>
      {groups.map((g) => (
        <section key={g} className="mb-4">
          <h3 className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5B6474]">{g}</h3>
          <dl className="divide-y divide-[#E9ECF1] rounded border border-[#DDE1E8]">
            {shown.filter((e) => e.group === g).map((e) => (
              <div key={e.id} data-gloss-entry={e.id} className="px-3 py-2.5">
                <dt className="text-[13px] font-semibold text-[#111827]">{e.name}</dt>
                <dd className="mt-0.5 text-[13px] leading-[1.55] text-[#374151]">
                  {e.def}
                  {e.where && <span className="block text-[12px] text-[#6B7280]">Used in: {e.where}</span>}
                  {e.link && <span className="block text-[12px] text-[#6B7280]">Find it in: {e.link.label}</span>}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
      {!shown.length && <p className="rounded border border-dashed border-[#C9CEDA] px-3 py-6 text-center text-[13px] text-[#5B6474]">Nothing matches &ldquo;{q}&rdquo;. Try a shorter word, or the code without its number.</p>}
    </div>
  );
}
