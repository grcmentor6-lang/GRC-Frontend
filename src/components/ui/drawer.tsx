"use client";

import { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./icon";

/** No store to watch — the value only changes once, when hydration happens. */
const NO_SUBSCRIBE = () => () => {};

/**
 * A right-side slide-in drawer. Closes on overlay click or Esc.
 *
 * Rendered into `document.body` rather than in place. `position: fixed` is only relative to the
 * viewport while no ancestor establishes a containing block — and `filter`, `transform`,
 * `backdrop-filter` and `will-change` all do. The mentor's decision sheet opens inside the working
 * sheet, which carries a `drop-shadow` filter for its folded corner, so `fixed inset-0` was
 * filling *that element* instead of the screen: the drawer opened above the fold of a long page
 * and the reviewer had to scroll up to find it. A portal is the fix that holds wherever this is
 * mounted, rather than one that depends on nothing upstream ever gaining a filter.
 */
export function Drawer({
  open,
  onClose,
  title,
  eyebrow,
  children,
  width = "min(520px,100vw)",
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  eyebrow?: string;
  children: React.ReactNode;
  /** CSS width for the panel. Defaults to the standard 520px drawer. */
  width?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    // The app's scroll container is <main>, not <body> — lock it so its scrollbars don't show
    // behind the drawer and the background can't scroll under it.
    const main = document.querySelector("main");
    document.body.style.overflow = "hidden";
    if (main) main.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      if (main) main.style.overflow = "";
    };
  }, [open, onClose]);

  // Portals need a DOM target, so nothing renders on the server pass or on the hydrating one —
  // rendering the portal on the client's first pass and null on the server's is a mismatch.
  // useSyncExternalStore rather than a mounted flag set in an effect: same result, and it is the
  // hook that exists for "the server and the client disagree about this".
  const hydrated = useSyncExternalStore(NO_SUBSCRIBE, () => true, () => false);
  if (!hydrated) return null;

  return createPortal(
    <div className={`fixed inset-0 z-[60] ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      {/* overlay */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
      />
      {/* panel */}
      <div
        role="dialog"
        aria-modal="true"
        style={{ width }}
        className={`absolute right-0 top-0 h-full bg-white shadow-[0_0_60px_-12px_rgba(15,23,42,0.4)] flex flex-col transition-transform duration-300 ease-out ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="shrink-0 flex items-start justify-between gap-4 px-6 py-4 border-b border-slate-200">
          <div className="min-w-0">
            {eyebrow && <div className="text-[10px] font-semibold tracking-[0.13em] uppercase text-indigo-600">{eyebrow}</div>}
            {title && <h2 className="text-[15px] font-semibold tracking-tight text-slate-900 mt-0.5">{title}</h2>}
          </div>
          <button onClick={onClose} aria-label="Close" className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <Icon name="x" size={17} />
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-6 py-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
