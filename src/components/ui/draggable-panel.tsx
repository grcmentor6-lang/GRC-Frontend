"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useDragControls } from "framer-motion";
import { Icon } from "./icon";

/** Tracks whether the viewport is phone-sized (so the floating panel can shrink). */
function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const sync = () => setMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return mobile;
}

/**
 * A **non-modal**, free-floating draggable reference panel — the page stays interactive underneath,
 * so you drag it aside by its header and keep working. On mobile it shrinks to a compact window
 * (small footprint, capped height) so the working form stays usable; on desktop it's larger.
 * Drag is header-only (body stays scrollable) and constrained to the viewport.
 */
export function DraggablePanel({
  open,
  onClose,
  title,
  eyebrow,
  side = "right",
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  eyebrow?: string;
  /** Which edge it opens against on desktop. `left` sits over the Working Desk's tree — see below. */
  side?: "left" | "right";
  children: React.ReactNode;
}) {
  const controls = useDragControls();
  const boundsRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  // `left` lines the panel up with the desk's activity tree, whose left edge moves with the main
  // menu (collapsed or not). Read once as it opens — it is a starting point, and the panel is
  // dragged from there. Divided by the desktop zoom because the rect is in viewport pixels and the
  // panel is placed in the zoomed page's own.
  const [treeLeft, setTreeLeft] = useState<number | null>(null);
  useEffect(() => {
    if (!open || side !== "left") return;
    const tree = document.querySelector<HTMLElement>('[data-tour="desk-tree"]');
    const zoom = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--app-zoom")) || 1;
    const left = tree ? tree.getBoundingClientRect().left / zoom : 16;
    requestAnimationFrame(() => setTreeLeft(left + 12));
  }, [open, side]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Portalled for the same reason as FloatingDocs: a transformed or blurred ancestor turns `fixed`
  // into "fixed to that ancestor", so the panel scrolled with the page and hid under the sidebar.
  if (!open || typeof document === "undefined") return null;

  // Full-width but short on phones (drag mostly to slide it up/down); a roomier window on desktop.
  const panelSize = isMobile
    ? "inset-x-3 top-16 max-h-[42dvh]"
    : side === "left"
      ? "top-[calc(var(--hdr-h,64px)+12px)] max-h-[82dvh] w-[min(440px,calc(100vw-1.5rem))]"
      : "right-6 top-24 max-h-[82dvh] w-[min(440px,calc(100vw-1.5rem))]";

  return createPortal(
    // Full-viewport bounds box for drag constraints; click-through everywhere except the panel.
    <div ref={boundsRef} className="pointer-events-none fixed inset-0 z-[60]">
      <motion.div
        drag
        dragListener={false}
        dragControls={controls}
        dragConstraints={boundsRef}
        dragElastic={0.04}
        dragMomentum={false}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        style={!isMobile && side === "left" ? { left: treeLeft ?? 16 } : undefined}
        className={`pointer-events-auto absolute flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 shadow-[0_28px_80px_-24px_rgba(15,23,42,0.5)] ${panelSize}`}
      >
        {/* header = drag handle. ponytail: framer-motion moves this with a transform in the page's
            own pixels while the pointer is measured in the viewport's, so under the desktop zoom
            (globals.css) the panel trails the cursor by 10% and stops just short of the bounds.
            Nuisance, not a break — compensate by hand-writing `transformTemplate` (and the scale
            animation with it) only if anyone complains. */}
        <div
          onPointerDown={(e) => controls.start(e)}
          className="shrink-0 flex items-center justify-between gap-3 pl-4 pr-2.5 py-2.5 border-b border-slate-200 bg-slate-50/70 cursor-grab active:cursor-grabbing touch-none select-none"
        >
          <div className="min-w-0 flex items-center gap-2.5">
            <Icon name="move" size={15} className="text-slate-400 shrink-0" />
            <div className="min-w-0">
              {eyebrow && <div className="text-[10px] font-semibold tracking-[0.13em] uppercase text-indigo-600">{eyebrow}</div>}
              {title && <h2 className="text-[14.5px] font-semibold tracking-tight text-slate-900 mt-0.5 truncate">{title}</h2>}
            </div>
          </div>
          <button
            onClick={onClose}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label="Close reference material"
            className="shrink-0 w-11 h-11 -mr-1 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Icon name="x" size={18} />
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 sm:px-5 py-4">{children}</div>
      </motion.div>
    </div>,
    document.body,
  );
}
