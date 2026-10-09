"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";

/** The nearest ancestor that scrolls — on the desk that is the workspace column, not the window. */
function scrollParent(el: HTMLElement | null): HTMLElement | null {
  for (let n = el?.parentElement; n; n = n.parentElement) {
    if (/(auto|scroll)/.test(getComputedStyle(n).overflowY)) return n;
  }
  return null;
}

/**
 * The step's condensed title, sliding in over the content once the page's own heading has left.
 *
 * In the content column rather than the header: the header is one row that never changes shape,
 * and a title belongs with the work it names. Sticky with a negative bottom margin equal to its
 * height, so it overlays the content instead of pushing it down — it takes no space at all while
 * hidden and none while shown. A thin line along its foot shows how far through the step you are.
 *
 * Rendered as the first child of the step's root. That root is a centred, max-width column, and a
 * bar only as wide as it looked like a strip floating in the middle of the screen, so the bar
 * bleeds out to the full width of the desk's scroll column — the `@container` in the desk layout,
 * which sits on the wrapper *inside* the scroller and not on the scroller itself, or `cqw` keeps
 * the width the column had before its own scrollbar appeared and this bar overruns it —
 * while its contents stay lined up with the page's text. In both calc()s `50%` is half the root's
 * content box (what percentage margins and paddings resolve against) and `50cqw` half the column,
 * so their difference is exactly the gutter either side of the root's text. The `-mt-6` cancels
 * the root's `py-6`; change one and the other has to follow.
 *
 * Its 52px height is load-bearing elsewhere: everything else that pins inside a step sits below it
 * rather than under it — the reference strip and the gate step nav (`top-[60px]`), the floating
 * acceptance checklist (`--hdr-h` + 64px), and step-screen's "at the deliverable" band (-116px).
 */
export function StepBar({ code, eyebrow, title, watch, done, score, onScore, label = "Step" }: {
  code?: string;
  /** What the code is a code of: "Step" on a step, "Task" on the GRC 101 task file. */
  label?: string;
  eyebrow?: string;
  title: string;
  /** The page's own heading. While it is on screen the bar stays away — one title is enough. */
  watch: React.RefObject<HTMLElement | null>;
  /** Passed the step. */
  done?: boolean;
  /** The grade, as it reads on the page's own feedback button ("4.5/5", "revise"). */
  score?: string;
  /** Opens the feedback the score came from. */
  onScore?: () => void;
}) {
  const [on, setOn] = useState(false);
  const bar = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = watch.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    // Watched against the column it scrolls in, so "gone" means gone under the column's top edge.
    // Only upwards counts: a heading below the fold of a short window is not a reason to repeat it.
    const io = new IntersectionObserver(
      ([entry]) => setOn(!entry.isIntersecting && entry.boundingClientRect.top < (entry.rootBounds?.top ?? 0)),
      { root: scrollParent(el) },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [watch, title]);

  // Reading progress, written straight to the line's style: a scroll handler that set state would
  // re-render the bar sixty times a second for one number.
  useEffect(() => {
    const scroller = scrollParent(bar.current);
    const content = bar.current?.parentElement;
    if (!scroller || !content) return;
    const update = () => {
      const max = Math.max(1, content.offsetHeight - scroller.clientHeight);
      const f = Math.max(0, Math.min(1, scroller.scrollTop / max));
      if (line.current) line.current.style.width = `${(f * 100).toFixed(1)}%`;
    };
    update();
    scroller.addEventListener("scroll", update, { passive: true });
    return () => scroller.removeEventListener("scroll", update);
  }, []);

  const toTop = () => watch.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  const tab = on ? 0 : -1;

  return (
    <div
      ref={bar}
      aria-hidden={!on}
      className={`sticky top-0 z-30 -mt-6 mb-[-28px] mx-[calc(50%-50cqw)] px-[calc(50cqw-50%)] flex h-[52px] items-center gap-3 border-b border-[#e7e7f0] bg-[#f6f6fb]/90 backdrop-blur-[10px] transition-[opacity,transform,visibility] duration-200 ease-[cubic-bezier(.2,.7,.2,1)] motion-reduce:transition-none ${
        on ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2.5 opacity-0"
      }`}
    >
      {code && (
        <span className="grid h-6 min-w-6 shrink-0 place-items-center rounded-[7px] bg-[#191a2c] px-1 font-mono text-[12px] font-semibold text-white">
          {code}
        </span>
      )}
      {/* The title is the way back: the reason it is up here is that the top of the page is gone. */}
      <button onClick={toTop} tabIndex={tab} title={`${title} (back to top)`} className="group flex min-w-0 flex-1 flex-col gap-[3px] rounded-lg text-left">
        {eyebrow && (
          <span className="truncate font-mono text-[10px] font-semibold uppercase leading-none tracking-[0.12em] text-[#8a8ba3]">
            {code ? `${label} ${code} · ${eyebrow}` : eyebrow}
          </span>
        )}
        <b className="truncate text-[14px] font-semibold text-[#191a2c] group-hover:text-[#5b4fe9]">{title}</b>
      </button>
      {done && (
        <span className="hidden h-6 shrink-0 items-center gap-1 rounded-[7px] border border-[#bfe9cf] bg-[#e8f8ee] px-2 text-[12px] font-semibold text-[#15a04a] md:inline-flex">
          <Icon name="check" size={11} strokeWidth={3} /> Done
        </span>
      )}
      {score && onScore && (
        <button
          onClick={onScore}
          tabIndex={tab}
          title={`Submission feedback ${score}`}
          className="inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[9px] border border-[#bfe9cf] bg-white px-[11px] text-[12.5px] font-medium text-[#15a04a] transition-colors hover:bg-[#e8f8ee]"
        >
          <Icon name="messageSquare" size={13} strokeWidth={2.2} />
          <span className="hidden lg:inline">Feedback</span>
          <b className="tabular-nums">{score}</b>
        </button>
      )}
      <button
        onClick={toTop}
        tabIndex={tab}
        aria-label="Back to top"
        title="Back to top"
        className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] text-[#8a8ba3] transition-colors hover:bg-[#efedff] hover:text-[#5b4fe9]"
      >
        <Icon name="arrowLeft" size={16} className="rotate-90" />
      </button>
      <span ref={line} className="absolute -bottom-px left-0 h-0.5 w-0 rounded-r-sm bg-[#5b4fe9]" />
    </div>
  );
}
