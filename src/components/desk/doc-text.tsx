"use client";

import { useEffect, useState } from "react";
import { loadDoc, pick, type DocSection } from "@/lib/desk/docs";

/** Sections of a source document, drawn as the pack writes them: paragraphs and tables. */
export function DocText({ sections }: { sections: DocSection[] }) {
  return (
    <div className="grid gap-5">
      {sections.map((s) => (
        <section key={s.num} className="grid gap-2">
          <h3 className="text-[14.5px] font-bold text-[#111827]">
            <span className="mr-2 font-mono text-[12.5px] text-[#4338CA]">{/^\d/.test(s.num) ? `§${s.num}` : s.num}</span>
            {s.title}
          </h3>
          <Body md={s.body} />
        </section>
      ))}
    </div>
  );
}

const clean = (t: string) => t.replace(/\\([~.<>&#_*-])/g, "$1").replace(/\s*•\s*/g, "\n• ").trim();

function Body({ md }: { md: string }) {
  const blocks: ({ t: "p"; text: string } | { t: "table"; rows: string[][] })[] = [];
  let open = false; // inside a table
  for (const raw of md.split("\n")) {
    const line = raw.trim();
    if (!line) {
      open = false; // a blank line ends a table, so two tables never merge
      continue;
    }
    if (line.startsWith("|")) {
      const cells = line.split("|").slice(1, -1).map((c) => c.trim());
      if (cells.every((c) => /^:?-+:?$/.test(c))) continue; // the |:-:| rule under the header
      const last = blocks[blocks.length - 1];
      if (open && last?.t === "table") last.rows.push(cells);
      else blocks.push({ t: "table", rows: [cells] });
      open = true;
    } else {
      open = false;
      blocks.push({ t: "p", text: line });
    }
  }
  return (
    <div className="grid gap-2">
      {blocks.map((b, i) =>
        b.t === "p" ? (
          <p key={i} className="text-[13.5px] leading-relaxed text-[#3F4757]">{clean(b.text)}</p>
        ) : (
          <div key={i} className="overflow-x-auto rounded border border-[#DDE1E8] bg-white">
            <table className="w-full border-collapse text-[13px]">
              {b.rows[0].some(Boolean) && (
                <thead className="bg-[#F7F8FA] text-left text-[11px] uppercase tracking-[0.06em] text-[#5B6474]">
                  <tr>{b.rows[0].map((c, j) => <th key={j} className="border-b border-r border-[#DDE1E8] border-r-[#E9ECF1] px-3 py-2 font-semibold last:border-r-0">{clean(c)}</th>)}</tr>
                </thead>
              )}
              <tbody>
                {b.rows.slice(b.rows[0].some(Boolean) ? 1 : 0).map((r, ri) => (
                  <tr key={ri}>
                    {r.map((c, j) => (
                      <td key={j} className={`whitespace-pre-line border-b border-r border-[#E9ECF1] px-3 py-2 align-top last:border-r-0 ${j === 0 ? "font-medium text-[#111827]" : "text-[#3F4757]"}`}>{clean(c)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ),
      )}
    </div>
  );
}

/** The cited sections of one document, loaded on demand. */
export function DocCitation({ id, cites }: { id: string; cites: string[] }) {
  const [sections, setSections] = useState<DocSection[] | null>(null);
  const want = cites.join("|"); // a stable key: callers pass a fresh array each render
  useEffect(() => {
    let live = true;
    const list = want ? want.split("|") : [];
    loadDoc(id).then((all) => live && setSections(list.length ? list.flatMap((c) => pick(all, c)) : all));
    return () => {
      live = false;
    };
  }, [id, want]);
  if (!sections) return <div className="h-24 animate-pulse rounded bg-[#F3F4F7]" aria-busy="true" />;
  if (!sections.length) return <p className="text-[13.5px] text-[#5B6474]">The text of this document is not on the platform yet.</p>;
  return <DocText sections={sections} />;
}
