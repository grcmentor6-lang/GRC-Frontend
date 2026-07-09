"use client";

// Floating, draggable, resizable document windows for reference material — each document opens
// in its own sticky-note-coloured panel that can be dragged around the desk and kept open while
// working (multiple at once, click to bring to front, resize from the corner grip). Rendered
// with the same body renderer as the Reference-material drawer. Used by the RUA gate panes and
// by the normal verb workspaces on the activity page.

import { useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { RefBody } from "./reference-material";
import type { TaskReference } from "@/lib/taskmeta";

/** Open-window state: open (or re-focus), close, bring-to-front. Render <FloatingDocs> with it. */
export function useFloatingDocs() {
  const [docs, setDocs] = useState<TaskReference[]>([]);
  const open = (d: TaskReference) => setDocs((prev) => [...prev.filter((x) => x.id !== d.id), d]);
  const close = (id: string) => setDocs((prev) => prev.filter((x) => x.id !== id));
  const focus = (id: string) => setDocs((prev) => {
    const d = prev.find((x) => x.id === id);
    return d && prev[prev.length - 1] !== d ? [...prev.filter((x) => x.id !== id), d] : prev;
  });
  return { docs, open, close, focus };
}

/* sticky-note palette — colour is hashed from the doc id so a window keeps its note colour */
const STICKY = [
  { win: "bg-amber-100 ring-amber-300/60", head: "bg-amber-200/60 border-amber-200", icon: "text-amber-700" },
  { win: "bg-rose-100 ring-rose-300/60", head: "bg-rose-200/60 border-rose-200", icon: "text-rose-700" },
  { win: "bg-emerald-100 ring-emerald-300/60", head: "bg-emerald-200/60 border-emerald-200", icon: "text-emerald-700" },
  { win: "bg-sky-100 ring-sky-300/60", head: "bg-sky-200/60 border-sky-200", icon: "text-sky-700" },
  { win: "bg-violet-100 ring-violet-300/60", head: "bg-violet-200/60 border-violet-200", icon: "text-violet-700" },
];
const stickyOf = (id: string) => {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return STICKY[h % STICKY.length];
};

function DocWindow({ doc, index, z, onClose, onFocus }: {
  doc: TaskReference; index: number; z: number; onClose: () => void; onFocus: () => void;
}) {
  // cascade new windows down-right so they don't stack exactly on top of each other
  const [pos, setPos] = useState(() => ({ x: Math.min(140 + index * 32, window.innerWidth - 480), y: 90 + (index % 6) * 28 }));
  // height stays auto (capped) until the user resizes for the first time
  const [size, setSize] = useState<{ w: number; h: number | null }>({ w: 460, h: null });
  const winRef = useRef<HTMLDivElement>(null);
  const sticky = stickyOf(doc.id);

  const track = (move: (ev: PointerEvent) => void) => {
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const startDrag = (e: React.PointerEvent) => {
    onFocus();
    const sx = e.clientX - pos.x;
    const sy = e.clientY - pos.y;
    track((ev) => setPos({
      x: Math.min(Math.max(ev.clientX - sx, 16 - 400), window.innerWidth - 60),
      y: Math.min(Math.max(ev.clientY - sy, 8), window.innerHeight - 48),
    }));
  };

  const startResize = (e: React.PointerEvent) => {
    e.stopPropagation();
    onFocus();
    const startH = size.h ?? winRef.current?.offsetHeight ?? 420;
    const dw = size.w - e.clientX;
    const dh = startH - e.clientY;
    track((ev) => setSize({
      w: Math.min(Math.max(ev.clientX + dw, 320), window.innerWidth * 0.92),
      h: Math.min(Math.max(ev.clientY + dh, 200), window.innerHeight * 0.88),
    }));
  };

  return (
    <div ref={winRef} role="dialog" aria-label={doc.title} onPointerDown={onFocus}
      className={`fixed max-w-[92vw] rounded-xl shadow-[0_24px_70px_-24px_rgba(15,23,42,0.5)] ring-1 flex flex-col ${sticky.win}`}
      style={{ left: pos.x, top: pos.y, zIndex: z, width: size.w, height: size.h ?? undefined, maxHeight: size.h ? undefined : "72vh" }}>
      <div onPointerDown={startDrag} className={`cursor-move select-none touch-none px-4 py-2.5 border-b flex items-center gap-2.5 rounded-t-xl shrink-0 ${sticky.head}`}>
        <Icon name="pin" size={13} className={`shrink-0 ${sticky.icon}`} />
        <span className="min-w-0 flex-1">
          <span className="block text-[12.5px] font-medium text-slate-900 tracking-tight truncate">{doc.title}</span>
          <span className="block text-[10px] text-slate-600/70 tracking-tight truncate">{doc.kind} · view-only</span>
        </span>
        <button onClick={onClose} onPointerDown={(e) => e.stopPropagation()} aria-label="Close document"
          className="shrink-0 w-7 h-7 rounded-md text-slate-500 hover:text-slate-800 hover:bg-black/5 cursor-pointer focus-ring flex items-center justify-center transition-colors">
          <Icon name="x" size={14} />
        </button>
      </div>
      <div className="px-4 py-3 overflow-y-auto overscroll-contain flex-1 min-h-0">
        <RefBody text={doc.body} />
      </div>
      {/* corner resize grip */}
      <div onPointerDown={startResize} aria-hidden
        className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize touch-none flex items-end justify-end p-1">
        <svg width="10" height="10" viewBox="0 0 10 10" className="text-slate-500/60">
          <path d="M9 1v8H1M9 5v4H5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

/** Renders the open document windows (last = frontmost). */
export function FloatingDocs({ docs, onClose, onFocus }: {
  docs: TaskReference[]; onClose: (id: string) => void; onFocus: (id: string) => void;
}) {
  return (
    <>
      {docs.map((d, i) => (
        <DocWindow key={d.id} doc={d} index={i} z={55 + i} onClose={() => onClose(d.id)} onFocus={() => onFocus(d.id)} />
      ))}
    </>
  );
}

/** Compact "handed to you" list — one row per document with an Open button that spawns a window. */
export function DocOpenStrip({ docs, onOpen, label = "Reference material for this step", tone = "indigo", className = "" }: {
  docs: TaskReference[]; onOpen: (d: TaskReference) => void; label?: string; tone?: "indigo" | "violet"; className?: string;
}) {
  if (docs.length === 0) return null;
  const t = tone === "violet"
    ? { chip: "bg-violet-50 text-violet-600", btn: "text-violet-700 bg-violet-50 hover:bg-violet-100", icon: "text-violet-600" }
    : { chip: "bg-indigo-50 text-indigo-600", btn: "text-indigo-700 bg-indigo-50 hover:bg-indigo-100", icon: "text-indigo-600" };
  return (
    <div className={`rounded-xl bg-white ring-1 ring-slate-200/80 overflow-hidden ${className}`}>
      <div className="px-3.5 py-2 border-b border-slate-100 flex items-center gap-1.5">
        <Icon name="book" size={12} className={t.icon} />
        <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-slate-400">{label}</span>
        <span className="ml-auto text-[10px] text-slate-400">drag · resize · view-only</span>
      </div>
      <div className="divide-y divide-slate-50">
        {docs.map((d) => (
          <div key={d.id} className="flex items-center gap-2.5 px-3.5 py-2">
            <span className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${t.chip}`}><Icon name="file" size={12} /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-[12px] font-medium text-slate-800 tracking-tight truncate">{d.title}</span>
              <span className="block text-[10px] text-slate-400 tracking-tight truncate">{d.kind}</span>
            </span>
            <button onClick={() => onOpen(d)}
              className={`shrink-0 h-7 px-2.5 rounded-md text-[11px] font-medium cursor-pointer focus-ring flex items-center gap-1 transition-colors ${t.btn}`}>
              <Icon name="arrowUpRight" size={12} /> Open
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
