"use client";

/**
 * Small, reusable Framer Motion primitives shared across pages.
 * All respect `prefers-reduced-motion` — when set, they render a plain element
 * with no animation (and crucially no lingering opacity:0 state).
 */
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import { useEffect, type CSSProperties, type ReactNode, type RefObject } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Premium enter/exit for header dropdowns: a small scale + lift that grows from the
 * anchor corner (default top-right, since header menus align right). AnimatePresence
 * keeps the panel mounted through its exit so closing eases out instead of snapping.
 * Reduced-motion collapses to a plain fade.
 *
 * The surface itself lives here so every header menu reads the same: a solid white
 * panel (opaque — content behind must not bleed through), a hairline ring, and a
 * *layered* shadow — a tight contact shadow under the panel plus a soft wide ambient
 * — instead of one flat blur. Callers pass only position + width.
 */
const DROPDOWN_EASE = [0.16, 1, 0.3, 1] as const;

const DROPDOWN_SURFACE =
  "rounded-[18px] bg-white ring-1 ring-slate-900/10 overflow-hidden z-50 " +
  "shadow-[0_1px_1px_rgba(15,23,42,0.04),0_12px_24px_-10px_rgba(15,23,42,0.16),0_32px_60px_-18px_rgba(15,23,42,0.28)]";

/**
 * How every header menu closes: a click or tap outside it, Escape, or focus leaving it (tabbing out).
 * `ref` wraps the trigger and the panel together, so a click on the trigger is inside and its own
 * toggle stays in charge.
 */
export function useDismiss(ref: RefObject<HTMLElement | null>, open: boolean, close: () => void) {
  useEffect(() => {
    if (!open) return;
    const outside = (t: EventTarget | null) => !!ref.current && !ref.current.contains(t as Node);
    const onDown = (e: PointerEvent) => outside(e.target) && close();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    const onFocus = (e: FocusEvent) => outside(e.target) && close();
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    document.addEventListener("focusin", onFocus);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("focusin", onFocus);
    };
  }, [ref, open, close]);
}

export function DropdownPanel({
  open,
  children,
  className,
  origin = "top right",
}: {
  open: boolean;
  children: ReactNode;
  className?: string;
  origin?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={[DROPDOWN_SURFACE, className].filter(Boolean).join(" ")}
          style={{ transformOrigin: origin, willChange: "transform, opacity" }}
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: -8 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -6 }}
          transition={{ duration: 0.2, ease: DROPDOWN_EASE }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Fade + slide up when the element scrolls into view. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 14,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-60px" }}
      transition={{ duration: 0.5, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

const containerV: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const itemV: Variants = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } } };

/** Wrap a group whose direct {@link StaggerItem} children should cascade in. */
export function Stagger({
  children,
  className,
  amount = 0.15,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  amount?: number;
  once?: boolean;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} variants={containerV} initial="hidden" whileInView="show" viewport={{ once, amount }}>
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className} style={style}>{children}</div>;
  return (
    <motion.div className={className} style={style} variants={itemV}>
      {children}
    </motion.div>
  );
}
