"use client";

import { useEffect, type ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import { useDesk, type ViewItem } from "./desk-context";
import { TableView, Label, press } from "./ui";
import type { ToolMock } from "@/lib/desk/model";

/** "<b>Frame:</b> Please send…" → bold label + text, without dangerouslySetInnerHTML. */
function Rich({ s }: { s: string }) {
  return (
    <>
      {s.split(/<b>(.*?)<\/b>/g).map((part, i) => (i % 2 ? <strong key={i} className="font-semibold text-slate-900">{part}</strong> : part))}
    </>
  );
}

/** The platform tool screens are mock-ups in v1.8.8: one renderer per payload kind. */
export function ToolScreen({ mock, flush }: { mock: Pick<ToolMock, "kind" | "pl" | "stamp">; flush?: boolean }) {
  const pl = mock.pl as Record<string, unknown>;
  const rows = (k: string) => (pl[k] as unknown[][] | undefined) ?? [];
  const table = Array.isArray(pl.h) ? <TableView t={{ h: pl.h as string[], r: rows("r") as string[][] }} flush={flush} /> : null;
  return (
    <div className={flush ? "grid" : "grid gap-3"}>
      {flush && table}
      <div className={flush ? "grid gap-3 p-4 empty:hidden" : "contents"}>
      {rows("kpis").length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-2">
          {rows("kpis").map(([k, v, s], i) => (
            <div key={i} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
              <div className="text-[11.5px] text-slate-500">{String(k)}</div>
              <div className="text-[18px] font-semibold text-slate-900 tabular-nums">{String(v)}</div>
              <div className="text-[11.5px] text-slate-500">{String(s)}</div>
            </div>
          ))}
        </div>
      )}
      {mock.kind === "console" && <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-slate-500">Tech Lab · synthetic training data · read-only</p>}
      {!flush && table}
      {rows("i").map(([t, d, s], i) => (
        <div key={i} className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5">
          <div className="min-w-0">
            <div className="text-[13px] font-medium text-slate-800">{String(t)}</div>
            <div className="text-[12.5px] text-slate-500">{String(d)}</div>
          </div>
          {s ? <span className="shrink-0 text-[11.5px] text-slate-500 tabular-nums">{String(s)}</span> : null}
        </div>
      ))}
      {rows("f").length > 0 && (
        <dl className="grid gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200">
          {rows("f").map(([k, v], i) => (
            <div key={i} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-3 bg-white px-3 py-2 text-[12.5px]">
              <dt className="text-slate-500">{String(k)}</dt>
              <dd className="text-slate-800">{String(v)}</dd>
            </div>
          ))}
        </dl>
      )}
      {rows("wide").map(([k, v], i) => (
        <div key={`w${i}`} className="grid gap-0.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[12.5px]">
          <div className="text-slate-500">{String(k)}</div>
          <div className="text-slate-800">{String(v)}</div>
        </div>
      ))}
      {rows("p").length > 0 && (
        <div className="grid gap-2 rounded-lg border border-slate-200 bg-white p-4 text-[13px] leading-relaxed text-slate-700">
          {(pl.p as string[]).map((p, i) => <p key={i}><Rich s={p} /></p>)}
        </div>
      )}
      {rows("b").map(([t, v, s], i) => (
        <div key={i} className="grid gap-1">
          <div className="flex justify-between gap-3 text-[12.5px]">
            <span className="truncate text-slate-700">{String(t)}</span>
            <span className="shrink-0 text-slate-500 tabular-nums">{String(v)} · {String(s)}</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-indigo-500" style={{ width: `${Math.min(100, Number(v))}%` }} />
          </div>
        </div>
      ))}
      {rows("k").length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-2">
          {rows("k").map(([k, v, s], i) => (
            <div key={i} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
              <div className="text-[11.5px] text-slate-500">{String(k)}</div>
              <div className="text-[18px] font-semibold text-slate-900 tabular-nums">{String(v)}</div>
              <div className="text-[11.5px] text-slate-500">{String(s)}</div>
            </div>
          ))}
        </div>
      )}
      {rows("capture").length > 0 && (
        <div className="grid gap-1.5 rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-[12.5px] font-semibold text-slate-800">Capture evidence</p>
          {(pl.capture as string[]).map((c) => (
            <p key={c} className="flex items-start gap-2 text-[12.5px] text-slate-600"><Icon name="check" size={13} className="mt-0.5 shrink-0 text-emerald-600" />{c}</p>
          ))}
        </div>
      )}
      {typeof pl.note === "string" && (
        <p className="flex items-start gap-2 text-[12px] leading-relaxed text-[#5B6474]">
          <Icon name="shield" size={13} className="mt-0.5 shrink-0 text-[#8A91A3]" />
          {pl.note}
        </p>
      )}
      </div>
    </div>
  );
}

function Body({ item }: { item: ViewItem }): { eyebrow: string; title: string; body: ReactNode } {
  const { desk } = useDesk();
  switch (item.kind) {
    case "rule": {
      const [name, text] = desk.rules[item.id] ?? ["Unknown rule", ""];
      return { eyebrow: "Learn › Rule tables", title: `${item.id} · ${name}`, body: <p className="text-[14px] leading-relaxed text-slate-700">{text}</p> };
    }
    case "page":
      return { eyebrow: "Learn › Reference pages", title: item.id, body: desk.pages[item.id] ? <TableView t={desk.pages[item.id]} /> : <p>Not in this programme.</p> };
    case "tpl": {
      const [task, code, desc, where] = desk.tpls[item.id] ?? ["", "", "", ""];
      return {
        eyebrow: "Template",
        title: item.id,
        body: (
          <div className="grid gap-3 text-[13.5px] text-slate-700">
            <p>{desc}</p>
            <p><span className="text-slate-500">Produces</span> {code} <span className="text-slate-500">for</span> {task}</p>
            <p><span className="text-slate-500">Issued in</span> {where}</p>
          </div>
        ),
      };
    }
    case "ds":
      return { eyebrow: "Your data file", title: item.id, body: desk.ds[item.id] ? <TableView t={desk.ds[item.id]} max={40} /> : <p>Released with its week.</p> };
    case "doc": {
      const lib = desk.library.docs.find(([code, title]) => code === item.id || title === desk.docs[item.id]);
      return {
        eyebrow: "Library",
        title: `${item.id} · ${desk.docs[item.id] ?? lib?.[1] ?? ""}`,
        body: lib ? (
          <ol className="grid gap-1 text-[13px] text-slate-700">
            {lib[2].map(([n, h]) => <li key={n}><span className="inline-block w-12 text-slate-400 tabular-nums">§{n}</span>{h}</li>)}
          </ol>
        ) : (
          <p className="text-[13.5px] text-slate-600">The task cites this document by section. Its headings are listed in the Library drawer.</p>
        ),
      };
    }
    case "clause":
      return { eyebrow: "ISO/IEC 27001:2022", title: `Clause ${item.id}`, body: <p className="text-[14px] text-slate-700">{desk.iso[item.id] ?? "Clause title not listed."}</p> };
    case "tool": {
      const m = desk.tp[item.id];
      return { eyebrow: `Platform tool · ${m?.stamp ?? ""}`, title: m?.tool ?? item.id.replace("|", " › "), body: m ? <ToolScreen mock={m} /> : <p>This tool opens in a later release.</p> };
    }
    case "panel": {
      const p = desk.tasks[item.id].panel;
      return { eyebrow: `Platform tool · ${p.stamp}`, title: p.tool, body: <ToolScreen mock={p} /> };
    }
  }
}

export function Viewer({ item, onClose }: { item: ViewItem | null; onClose: () => void }) {
  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [item, onClose]);
  if (!item) return null;
  return <Sheet item={item} onClose={onClose} />;
}

function Sheet({ item, onClose }: { item: ViewItem; onClose: () => void }) {
  const { eyebrow, title, body } = Body({ item });
  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-slate-950/25 desk-fade" />
      <aside className="desk-sheet relative flex h-full w-full max-w-[640px] flex-col bg-[#FAFAF7] shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div className="min-w-0">
            <Label>{eyebrow}</Label>
            <h2 className="mt-1 text-[18px] font-semibold text-slate-900 text-balance">{title}</h2>
          </div>
          <button type="button" onClick={onClose} className={`rounded-md p-1.5 text-slate-500 hover:bg-slate-100 ${press}`} aria-label="Close">
            <Icon name="x" size={18} />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{body}</div>
      </aside>
    </div>
  );
}
