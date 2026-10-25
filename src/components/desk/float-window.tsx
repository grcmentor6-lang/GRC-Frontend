"use client";

import { useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Icon } from "@/components/ui/icon";

/**
 * A floating, non-modal window: dragged by its title bar, resized from its bottom-right corner,
 * closed with ×. The page under it stays usable, so a mentee can park a tool or an organisation
 * beside the work. Used for read-only tool windows, sources and the organisation boxes.
 *
 * Dragging is done here rather than by framer-motion's drag: the app is scaled with CSS `zoom`
 * (globals.css), and framer measures the screen in real pixels while moving the window in zoomed
 * ones, so its constraints stopped windows well short of the edges. Pointer moves are divided by
 * the zoom, and the window may go anywhere as long as a grip of its title bar stays on screen.
 *
 * ponytail: resize is the browser's own (`resize: both`); a custom handle only if it ever needs
 * snapping or edge handles. Positions are not remembered between visits, by request.
 */
const GRIP = 96; // px of title bar that always stays on screen, so a window can be grabbed back

export function FloatWindow({
  title,
  eyebrow,
  leading,
  onClose,
  children,
  index = 0,
  width = 560,
  z = 65,
  left,
  fit,
}: {
  title: string;
  eyebrow?: string;
  /** Shown before the title: an icon tile, an organisation's badge. */
  leading?: ReactNode;
  onClose: () => void;
  children: ReactNode;
  /** Its place in the stack of open windows, so new ones cascade instead of landing on top. */
  index?: number;
  width?: number;
  z?: number;
  /** Starting x offset; defaults to a cascade from the left edge of the work area. */
  left?: string;
  /** As tall as its content, up to the usual height, for a short text (a step's help). */
  fit?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  // Where the window has been dragged to, in the page's own (zoomed) pixels; null until moved.
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  const startDrag = (e: ReactPointerEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el || e.button !== 0) return;
    e.preventDefault();
    // The page's zoom: what one CSS pixel is on screen.
    const zoom = el.getBoundingClientRect().width / el.offsetWidth || 1;
    const from = { px: e.clientX, py: e.clientY, x: el.offsetLeft, y: el.offsetTop };
    const header = e.currentTarget;
    header.setPointerCapture(e.pointerId);
    const move = (ev: PointerEvent) => {
      const vw = window.innerWidth / zoom;
      const vh = window.innerHeight / zoom;
      const w = el.offsetWidth;
      const x = from.x + (ev.clientX - from.px) / zoom;
      const y = from.y + (ev.clientY - from.py) / zoom;
      setPos({
        x: Math.min(Math.max(x, GRIP - w), vw - GRIP),
        y: Math.min(Math.max(y, 0), vh - 44),
      });
    };
    const end = () => {
      header.removeEventListener("pointermove", move);
      header.removeEventListener("pointerup", end);
      header.removeEventListener("pointercancel", end);
    };
    header.addEventListener("pointermove", move);
    header.addEventListener("pointerup", end);
    header.addEventListener("pointercancel", end);
  };

  // Portalled to <body>: rendered in place, the window stacks inside the desk's own layer, where the
  // sticky step bar draws over it whatever z it is given.
  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="pointer-events-none fixed inset-0" style={{ zIndex: z }}>
      <motion.section
        ref={ref}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, transition: { duration: 0.12 } }}
        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
        role="dialog"
        aria-label={title}
        style={{
          top: pos ? pos.y : 72 + index * 28,
          left: pos ? pos.x : (left ?? `calc(84px + ${index * 28}px)`),
          width: `min(${width}px, calc(100vw - 24px))`,
        }}
        className={`pointer-events-auto absolute flex ${fit ? "max-h-[min(560px,calc(100dvh/var(--app-zoom)-160px))] min-h-[160px]" : "h-[min(560px,calc(100dvh/var(--app-zoom)-160px))] min-h-[220px]"} min-w-[300px] max-w-[calc(100vw/var(--app-zoom)-24px)] resize flex-col overflow-hidden rounded-lg border border-[#C9CED8] bg-white shadow-[0_24px_64px_-20px_rgba(17,24,39,0.45)] ${pos ? "" : "max-md:!left-3"}`}
      >
        <header onPointerDown={startDrag} className="flex shrink-0 cursor-grab touch-none select-none items-stretch border-b border-[#DDE1E8] active:cursor-grabbing">
          {leading && <span className="grid shrink-0 place-items-center pl-3">{leading}</span>}
          <div className="min-w-0 flex-1 px-3 py-2">
            {eyebrow && <p className="truncate text-[11.5px] text-[#5B6474]">{eyebrow}</p>}
            <h2 className="truncate text-[15px] font-bold text-[#111827]">{title}</h2>
          </div>
          <span className="flex items-center gap-1 pr-1 text-[#8A91A3]" aria-hidden>
            <Icon name="move" size={14} />
          </span>
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={onClose}
            aria-label={`Close ${title}`}
            className="grid w-11 shrink-0 place-items-center border-l border-[#DDE1E8] text-[#3F4757] hover:bg-[#F3F4F7] focus-ring"
          >
            <Icon name="x" size={16} />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-auto">{children}</div>
      </motion.section>
    </div>,
    document.body,
  );
}
