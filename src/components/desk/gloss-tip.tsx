"use client";

import { Fragment, useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { glossParts, type GEntry } from "@/lib/desk/glossary";

/**
 * A code or term with its definition (UX101 W5): hover or keyboard focus shows it, a tap toggles it, Escape or a tap
 * elsewhere closes it. One component for step text, cards and table headers. A span, not a button, because step text
 * sits inside option buttons and a button may not hold a button.
 */
export function GlossTip({ entry, children }: { entry: GEntry; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [box, setBox] = useState<{ left: number; top?: number; bottom?: number; w: number } | null>(null);
  const ref = useRef<HTMLSpanElement>(null);
  const pop = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const id = useId();

  const show = () => {
    clearTimeout(timer.current);
    const r = ref.current?.getBoundingClientRect();
    if (r) {
      const w = Math.min(320, window.innerWidth - 24);
      const left = Math.max(12, Math.min(r.left, window.innerWidth - w - 12));
      setBox(r.bottom > window.innerHeight * 0.6 ? { left, bottom: window.innerHeight - r.top + 6, w } : { left, top: r.bottom + 6, w });
    }
    setOpen(true);
  };
  const hide = (ms = 0) => { clearTimeout(timer.current); timer.current = setTimeout(() => setOpen(false), ms); };

  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") { e.stopPropagation(); setOpen(false); ref.current?.focus(); } };
    const away = (e: PointerEvent) => { const t = e.target as Node; if (!ref.current?.contains(t) && !pop.current?.contains(t)) setOpen(false); };
    document.addEventListener("keydown", key, true);
    document.addEventListener("pointerdown", away);
    return () => { document.removeEventListener("keydown", key, true); document.removeEventListener("pointerdown", away); };
  }, [open]);
  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <>
      <span
        ref={ref}
        role="button"
        tabIndex={0}
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        data-gloss={entry.id}
        onPointerEnter={(e) => { if (e.pointerType === "mouse") { clearTimeout(timer.current); timer.current = setTimeout(show, 150); } }}
        onPointerLeave={(e) => { if (e.pointerType === "mouse") hide(150); }}
        onFocus={(e) => { if (e.currentTarget.matches(":focus-visible")) show(); }}
        onBlur={(e) => { if (!pop.current?.contains(e.relatedTarget as Node)) hide(100); }}
        onClick={(e) => { e.stopPropagation(); e.preventDefault(); if (open) setOpen(false); else show(); }}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); if (open) setOpen(false); else show(); } }}
        className="cursor-help rounded-[2px] underline decoration-[#8A91A3] decoration-dotted underline-offset-[3px] hover:decoration-[#4338CA] focus-ring"
      >
        {children}
      </span>
      {open && box && typeof document !== "undefined" && createPortal(
        <div
          ref={pop}
          id={id}
          role="dialog"
          aria-label={entry.name}
          onPointerEnter={() => clearTimeout(timer.current)}
          onPointerLeave={(e) => { if (e.pointerType === "mouse") hide(150); }}
          style={{ position: "fixed", left: box.left, top: box.top, bottom: box.bottom, width: box.w, zIndex: 10000 }}
          className="rounded-md border border-[#DDE1E8] bg-white p-3 text-left text-[12.5px] font-normal normal-case leading-[1.5] tracking-normal text-[#111827] shadow-[0_8px_24px_rgba(17,24,39,0.16)]"
        >
          <p className="text-[12.5px] font-semibold text-[#111827]">{entry.name}</p>
          <p className="mt-1 text-[#374151]">{entry.def}</p>
          {entry.where && <p className="mt-1 text-[11.5px] text-[#6B7280]">Used in: {entry.where}</p>}
          {entry.link && <p className="mt-1 text-[11.5px] text-[#6B7280]">Find it in: {entry.link.label}</p>}
          <p className="mt-1 text-[11.5px] text-[#6B7280]">All terms: Learn › Glossary</p>
        </div>,
        document.body,
      )}
    </>
  );
}

/** Plain text with its codes and terms made hoverable. `rowIds`: also the row IDs (a code chip's own text). */
export function GlossText({ text, rowIds = false }: { text: string; rowIds?: boolean }) {
  const parts = useMemo(() => glossParts(text, rowIds), [text, rowIds]);
  return (
    <>
      {parts.map((p, i) => (p.entry ? <GlossTip key={i} entry={p.entry}>{p.text}</GlossTip> : <Fragment key={i}>{p.text}</Fragment>))}
    </>
  );
}
