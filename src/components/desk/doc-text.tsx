"use client";

import { useEffect, useRef, useState } from "react";
import { blocks, clean, docNow, loadDoc, pick, type DocSection } from "@/lib/desk/docs";
import { treeRun } from "@/lib/desk/tree-text";
import { TreeCard } from "./walk-card";

/** Sections of a source document, drawn as the pack writes them: paragraphs and tables. */
export function DocText({ sections }: { sections: DocSection[] }) {
  return (
    <div className="grid gap-5">
      {sections.map((s) => (
        <section key={s.num} data-sec={s.num} className="grid scroll-mt-12 gap-2">
          <h3 className="text-[14.5px] font-bold text-[#111827]">
            <span className="mr-2 font-mono text-[12.5px] text-[#4338CA]">{/^\d/.test(s.num) ? `Section ${s.num}` : s.num}</span>
            {s.title}
          </h3>
          <Body md={s.body} tree={/decision tree/i.test(s.title)} />
        </section>
      ))}
    </div>
  );
}

/** `tree`: a "decision tree" section, whose "question? → outcome … Otherwise → outcome" lines are drawn as the tree card. */
function Body({ md, tree }: { md: string; tree?: boolean }) {
  const parts = blocks(md);
  const run = tree ? treeRun(parts.map((b) => (b.t === "p" ? clean(b.text) : ""))) : null;
  return (
    <div className="grid gap-2">
      {parts.map((b, i) =>
        run && i >= run.start && i < run.end ? (
          i === run.start && <div key={i} className="my-1"><TreeCard title="Decision tree" steps={run.steps} /></div>
        ) : b.t === "p" ? (
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
export function DocCitation({ id, cites, spot }: { id: string; cites: string[]; /** A table row to mark and bring into view on opening: its first cell. */ spot?: string }) {
  const [sections, setSections] = useState<DocSection[] | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const want = cites.join("|"); // a stable key: callers pass a fresh array each render
  useEffect(() => {
    let live = true;
    const list = want ? want.split("|") : [];
    loadDoc(id).then((all) => live && setSections(list.length ? list.flatMap((c) => pick(all, c)) : all));
    return () => {
      live = false;
    };
  }, [id, want]);
  useEffect(() => {
    if (!sections || !spot) return;
    const tr = [...(box.current?.querySelectorAll("tr") ?? [])].find((x) => x.querySelector("td")?.textContent?.trim() === spot);
    if (!tr) return;
    tr.style.background = "#FFFBEB";
    tr.dataset.spot = "";
    tr.scrollIntoView({ block: "center" });
  }, [sections, spot]);
  if (!sections) return <div className="h-24 animate-pulse rounded bg-[#F3F4F7]" aria-busy="true" />;
  if (!sections.length) return <p className="text-[13.5px] text-[#5B6474]">The text of this document is not on the platform yet.</p>;
  return <div ref={box}><DocText sections={sections} /></div>;
}

/** A document's sections once loaded (re-renders when they arrive), for checks against the source. */
export function useDoc(id: string): DocSection[] | null {
  const [, setTick] = useState(0);
  useEffect(() => {
    let live = true;
    if (!docNow(id)) loadDoc(id).then(() => live && setTick((t) => t + 1));
    return () => {
      live = false;
    };
  }, [id]);
  return docNow(id);
}

/** Several documents at once (a register's checks read from more than one), re-rendering as each loads. */
export function useDocs(ids: string[]): void {
  const [, setTick] = useState(0);
  const key = ids.join("|");
  useEffect(() => {
    let live = true;
    for (const id of key ? key.split("|") : []) if (!docNow(id)) loadDoc(id).then(() => live && setTick((t) => t + 1));
    return () => {
      live = false;
    };
  }, [key]);
}
