"use client";

import { animate, motion, useMotionValue } from "framer-motion";
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { Icon, type IconName } from "@/components/ui/icon";

/**
 * The hero's Working Desk demo: a miniature of the real desk (components/desk/*) playing task F1.1's
 * first two steps exactly as a fresh learner meets them. Step 1 (Activity): the up-next row is open
 * with its "Do this step in" box → Open Onboarding record → the step's window (file, "Next: open"
 * bar, step panel) → Home › My Organisation from the toolbar, beside the file → fix the two planted
 * slips → Check my answers → Mark step complete. Step 2 (Decision), answered in the row: pick →
 * Check my answer → the best option plus the Why and "If you do this" of every option → Mark step
 * complete. Wording is the desk's own (public/desk/sample.json, backend/_seed/grc101_decisions.json,
 * the Onboarding record's planted values and verdicts). Styles are copied, not imported: the desk
 * components need the desk's context.
 *
 * Drawn on a fixed W×H canvas scaled to the card, so the cursor's targets are plain offsets. Only
 * transform and opacity animate. Paused off-screen; reduced motion gets the decision's answer, still.
 */
const W = 520;
const H = 556;
const EASE = [0.22, 1, 0.36, 1] as const;
const CSS_EASE = "cubic-bezier(0.22,1,0.36,1)";

// One beat each: where the cursor goes, whether it clicks on arrival, how long the beat holds.
// A click's effect shows from the next beat.
const BEATS: { to: string; click?: boolean; ms: number }[] = [
  { to: "rest", ms: 1300 }, //   0  F1.1: step 1 up next, its row open; a dot on Home
  { to: "open1", click: true, ms: 900 }, //   1  Open Onboarding record
  { to: "home", click: true, ms: 1500 }, //   2  the step's window: file, Next bar, step panel → Home
  { to: "myorg", click: true, ms: 900 }, //   3  Home menu → My Organisation
  { to: "office", ms: 1100 }, //   4  My Organisation beside the file: the office
  { to: "cellA", click: true, ms: 900 }, //   5  → the Org A home office cell
  { to: "cellO", click: true, ms: 900 }, //   6  Manila typed → the F1.2 task owner cell
  { to: "check1", click: true, ms: 900 }, //   7  → Check my answers
  { to: "result1", ms: 1500 }, //   8  every row's verdict; Mark step complete unlocks
  { to: "mark1", click: true, ms: 900 }, //   9  → Mark step complete
  { to: "ctx2", ms: 1100 }, //  10  1 ✓; step 2 up next, its question in the row
  { to: "optA", click: true, ms: 900 }, //  11  → A
  { to: "check2", click: true, ms: 900 }, //  12  → Check my answer
  { to: "best2", ms: 4300 }, //  13  the best, and every option's why
  { to: "mark2", click: true, ms: 900 }, //  14  → Mark step complete
  { to: "rest", ms: 1300 }, //  15  2 ✓; step 3 up next
  { to: "rest", ms: 600 }, //  16  fade, then from the top
];
const LAST = 13; // the still frame for reduced motion

// The Onboarding record's Assignment table as the programme office fills it: two values planted wrong.
// [field, value My Organisation holds, planted value, verdict after the check]
const ASSIGNMENT: [string, string, string?, string?][] = [
  ["Org A name", "GlobalConnect Customer Solutions"],
  ["Org A home office", "Manila, Philippines", "Warsaw, Poland", "Corrected. The file had “Warsaw, Poland”. Warsaw, Poland is one of GlobalConnect's offices, but not its home office."],
  ["Org B name", "LearnTech Educational Solutions"],
  ["Org B home office", "Amsterdam, Netherlands"],
  ["Task owner of F1.2", "Policy & Governance Analyst", "Cybersecurity Program Manager", "Corrected. The file had “Cybersecurity Program Manager”. Cybersecurity Program Manager owns F1.1, the task above F1.2."],
  ["Start date", "05-OCT-2026"],
];
const CELL = ["", "cellA", "", "", "cellO", ""];

// F1.1-D1, with each option's reason and consequence.
const OPTIONS: [string, string, string, string][] = [
  ["A", "Share it but change the password later", "Changing the password later does not undo it. While they are signed in, everything they do is recorded as yours.", "Work someone else did is filed under your name. That breaks the undertaking you sign at the end of step 3, and a confirmed conduct breach is an automatic fail."],
  ["B", "Share it just for today", "There is no safe short share. One day is enough for someone else's work to be recorded as yours.", "Same as A: the work is no longer yours, the undertaking you sign in step 3 is broken, and a confirmed breach is an automatic fail."],
  ["C", "Refuse and tell the programme office with \"Report a problem\"", "Your account is personal. Refusing keeps it that way, and reporting lets the programme office deal with the request.", "Your work stays yours and your record stays clean."],
];
// A few of the toolbar's fourteen tools; the dimmed ones open as later tasks reach them.
const DOCK: [string, IconName, boolean?, boolean?][] = [
  ["Home", "home", false, true],
  ["Evidence", "paperclip", true],
  ["Frameworks", "layers", true, true],
  ["Testing", "checkSquare"],
  ["Policies", "file", false, true],
  ["Learn", "book", false, true],
  ["Inbox", "inbox"],
  ["Help", "help"],
];

/** Offset of `el` inside `root`, ignoring transforms (so a menu mid-animation still measures true). */
function centre(el: HTMLElement, root: HTMLElement) {
  let x = el.offsetWidth / 2;
  let y = el.offsetHeight / 2;
  for (let n: HTMLElement | null = el; n && n !== root; n = n.offsetParent as HTMLElement | null) {
    x += n.offsetLeft;
    y += n.offsetTop;
  }
  return { x, y };
}

const fade = (on: boolean, from = "translateY(6px)") => ({
  opacity: on ? 1 : 0,
  transform: on ? "none" : from,
  transition: `opacity 320ms ${CSS_EASE}, transform 420ms ${CSS_EASE}`,
  pointerEvents: "none" as const,
});

// Read through useSyncExternalStore so hydration renders the server's frame first, then switches.
const RM = "(prefers-reduced-motion: reduce)";
const onRM = (cb: () => void) => {
  const m = matchMedia(RM);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};

export function DeskDemo() {
  const reduce = useSyncExternalStore(onRM, () => matchMedia(RM).matches, () => false);
  const [beat, setBeat] = useState(0);
  const [seen, setSeen] = useState(false);
  const outer = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const cx = useMotionValue(W - 40);
  const cy = useMotionValue(H - 120);
  const cs = useMotionValue(1);
  const [clicks, setClicks] = useState(0);

  // Fit the canvas to the card.
  useEffect(() => {
    const o = outer.current;
    const c = canvas.current;
    if (!o || !c) return;
    const ro = new ResizeObserver(() => (c.style.transform = `scale(${o.clientWidth / W})`));
    ro.observe(o);
    return () => ro.disconnect();
  }, []);

  // Run only while on screen.
  useEffect(() => {
    const o = outer.current;
    if (!o) return;
    const io = new IntersectionObserver(([e]) => setSeen(e.isIntersecting), { threshold: 0.2 });
    io.observe(o);
    return () => io.disconnect();
  }, []);

  const p = reduce ? LAST : beat;

  useEffect(() => {
    if (reduce || !seen) return;
    const id = setTimeout(() => setBeat((b) => (b + 1) % BEATS.length), BEATS[beat].ms);
    return () => clearTimeout(id);
  }, [beat, seen, reduce]);

  // The cursor travels to the beat's target, then clicks.
  useEffect(() => {
    if (reduce) return;
    const root = canvas.current;
    const el = root?.querySelector<HTMLElement>(`[data-t="${BEATS[beat].to}"]`);
    if (!root || !el) return;
    const { x, y } = centre(el, root);
    const anims = [animate(cx, x, { duration: 0.6, ease: EASE }), animate(cy, y, { duration: 0.6, ease: EASE })];
    let id: ReturnType<typeof setTimeout> | undefined;
    if (BEATS[beat].click) {
      id = setTimeout(() => {
        anims.push(animate(cs, [1, 0.8, 1], { duration: 0.22, ease: "easeOut" }));
        setClicks((n) => n + 1);
      }, 640);
    }
    return () => {
      clearTimeout(id);
      anims.forEach((a) => a.stop());
    };
  }, [beat, reduce, cx, cy, cs]);

  const win = p >= 2 && p <= 9; // the step's window
  const menu = p === 3;
  const org = p >= 4 && p <= 9; // Home › My Organisation, beside the file
  const fixedA = p >= 6;
  const fixedO = p >= 7;
  const checked1 = p >= 8;
  const done1 = p >= 10;
  const picked = p >= 12;
  const checked2 = p >= 13;
  const done2 = p >= 15;
  const next = done2 ? 3 : done1 ? 2 : 1;
  const value = (i: number) => (i === 1 ? fixedA : i === 4 ? fixedO : true);
  const enter = reduce ? false : { opacity: 0, y: -4 };

  return (
    <div className="relative">
      <p className="sr-only">
        Animation of the Working Desk: a mentee opens the Onboarding record, checks it against Home › My Organisation, corrects the two wrong values and marks the step complete, then answers a decision about sharing their login and sees why each option is right or wrong.
      </p>
      <div aria-hidden="true" className="relative">
        <div className="absolute -inset-6 rounded-[32px] bg-gradient-to-br from-indigo-200/40 via-violet-100/30 to-emerald-100/40 blur-2xl" />
        <div ref={outer} className="relative overflow-hidden rounded-2xl bg-white text-left ring-1 ring-slate-200/80 shadow-[0_30px_60px_-30px_rgba(30,27,75,0.35)] select-none" style={{ aspectRatio: `${W} / ${H}` }} inert>
          <div ref={canvas} className="absolute left-0 top-0 origin-top-left" style={{ width: W, height: H }}>
            <div style={{ opacity: p === 16 ? 0 : 1, transition: `opacity 450ms ${CSS_EASE}` }} className="absolute inset-0 bg-white">
              {/* Task heading */}
              <div className="flex h-[38px] items-center justify-between gap-3 border-b border-[#DDE1E8] px-3">
                <span className="flex min-w-0 items-center gap-2">
                  <span className="rounded-[3px] bg-[#111827] px-1.5 py-0.5 font-mono text-[10px] font-bold text-white">F1.1</span>
                  <span className="truncate text-[13px] font-bold tracking-tight text-[#111827]">Onboarding to the Group GRC Office</span>
                </span>
                <span className="shrink-0 font-mono text-[9.5px] text-[#5B6474]">Week 1 of 12</span>
              </div>

              {/* Step by step */}
              <div className="flex items-baseline gap-2 px-3 pb-1.5 pt-2.5">
                <span className="text-[11px] font-bold text-[#111827]">Step by step</span>
                <span className="text-[10px] text-[#5B6474] tabular-nums">6 steps · 3 decisions · {done2 ? 2 : done1 ? 1 : 0}/6 complete</span>
              </div>
              <div className="border-t border-[#DDE1E8]">
                <div className="grid grid-cols-[34px_1fr_70px] border-b border-[#DDE1E8] bg-[#F7F8FA] text-[8.5px] font-semibold uppercase tracking-[0.06em] text-[#5B6474]">
                  <span className="py-1 text-center">#</span>
                  <span className="px-2 py-1">Step</span>
                  <span className="px-2 py-1">Type</span>
                </div>

                <Row n={1} done={done1} next={next === 1}>
                  Check the Assignment table of Onboarding record against Home › My Organisation
                </Row>
                {!done1 && (
                  <div className="border-b border-[#E9ECF1] bg-white px-2.5 py-2">
                    <div className="flex items-center gap-2 rounded border border-[#DDE1E8] px-2 py-1.5">
                      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-[3px] border border-[#E3E6EC] text-[#3F4757]"><Icon name="grid" size={11} /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[8.5px] text-[#4338CA]">Do this step in</span>
                        <span className="block truncate text-[10px] font-semibold text-[#111827]">Onboarding record, checking against Home › My Organisation</span>
                        <span className="block truncate text-[8.5px] text-[#5B6474]">Done when: Onboarding record · Assignment checked against My Organisation (6 values)</span>
                      </span>
                      <span data-t="open1" className="inline-flex shrink-0 items-center gap-1 rounded-[3px] bg-[#4338CA] px-2 py-1.5 text-[9.5px] font-semibold text-white">
                        Open Onboarding record <Icon name="arrowUpRight" size={10} strokeWidth={2.2} />
                      </span>
                    </div>
                  </div>
                )}

                <Row n={2} done={done2} next={next === 2} decision sub={next === 2 ? "What do you do?" : undefined}>
                  A colleague asks for your login so they can finish a step for you while you are offline
                </Row>
                {next === 2 && (
                  <motion.div initial={enter} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: EASE }} className="border-b border-[#E9ECF1] bg-white px-2.5 pb-2 pt-1.5">
                    <Decide />
                    <p data-t="ctx2" className="mt-1 rounded-[3px] border-l-2 border-[#C7CBF5] bg-[#F7F8FF] px-2 py-1 text-[9px] leading-snug text-[#111827]">
                      It is your first day in the Group GRC Office. Your platform account is in your name: every step, file and decision made in it is recorded as your work, and auditors rely on those records. This evening you will be offline, and a colleague messages you.
                    </p>
                    {checked2 && (
                      <motion.p initial={enter} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: EASE }} className="mt-1 flex items-center gap-1 rounded-[3px] bg-[#FFFBEB] px-2 py-1 text-[9.5px] font-semibold text-[#78350F]">
                        <Icon name="info" size={10} strokeWidth={2.2} /> Not the best option. The best is C.
                      </motion.p>
                    )}
                    <div className="mt-1 grid gap-[3px]">
                      {OPTIONS.map(([k, t, why, then]) => {
                        const mine = picked && k === "A";
                        const best = checked2 && k === "C";
                        const tone = checked2 && mine ? "border-[#FCD34D] bg-[#FFFBEB]" : best ? "border-[#86EFAC] bg-[#F0FDF4]" : mine ? "border-[#4338CA] bg-white" : "border-[#DDE1E8] bg-white";
                        return (
                          <div key={k} data-t={k === "A" ? "optA" : k === "C" ? "best2" : undefined} className={`rounded-[3px] border px-2 ${checked2 ? "py-1" : "py-[5px]"} ${tone}`}>
                            <div className="flex items-center gap-1.5 text-[9.5px] text-[#111827]">
                              <span className={`grid h-[9px] w-[9px] shrink-0 place-items-center rounded-full border ${mine ? "border-[#4338CA]" : "border-[#8A91A3]"}`}>{mine && <span className="h-[5px] w-[5px] rounded-full bg-[#4338CA]" />}</span>
                              <span className="font-semibold text-[#5B6474]">{k}</span>
                              <span className="truncate">{t}</span>
                              {checked2 && mine && <span className="shrink-0 rounded-[2px] bg-[#FDE68A] px-1 text-[8px] font-semibold text-[#78350F]">Your choice</span>}
                              {best && <span className="shrink-0 rounded-[2px] bg-[#BBF7D0] px-1 text-[8px] font-semibold text-[#14532D]">Best</span>}
                            </div>
                            {checked2 && (
                              <motion.div initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35, delay: 0.08 * (k.charCodeAt(0) - 65) }} className="mt-0.5 grid grid-cols-2 gap-2 pl-[15px] text-[9px] leading-[1.3] text-[#3F4757]">
                                <span><b className="font-semibold text-[#111827]">Why:</b> {why}</span>
                                <span><b className="font-semibold text-[#111827]">If you do this:</b> {then}</span>
                              </motion.div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {checked2 ? (
                      <p className="mt-1 text-[8.5px] leading-snug text-[#3F4757]"><b className="font-semibold text-[#111827]">The rule:</b> Accounts are personal. Sharing breaks the undertaking and makes the work not yours (BKB-POL-024 Section 3.1).</p>
                    ) : (
                      <div className="mt-1.5 flex items-center gap-2">
                        <span data-t="check2" className={`rounded-[3px] px-2 py-1 text-[9.5px] font-semibold ${picked ? "bg-[#111827] text-white" : "bg-[#EEF0F4] text-[#8A91A3]"}`}>Check my answer</span>
                        <span className="text-[8.5px] text-[#5B6474]">You see the best option and why straight away. Your choice is locked then.</span>
                      </div>
                    )}
                    <div className="mt-1.5 flex items-center justify-between gap-2">
                      <span className="text-[8.5px] text-[#5B6474]">Done when: <span className="text-[#3730A3]">Decision recorded</span></span>
                      <span className="flex items-center gap-2">
                        {!checked2 && <span className="text-[8.5px] text-[#92400E]">Pick an option and click Check my answer first.</span>}
                        <span data-t="mark2" className={`rounded-[3px] px-2 py-1 text-[9.5px] font-semibold ${checked2 ? "bg-[#4338CA] text-white" : "bg-[#EEF0F4] text-[#8A91A3]"}`}>Mark step complete</span>
                      </span>
                    </div>
                  </motion.div>
                )}

                <Row n={3} done={false} next={next === 3} decision>
                  You do not understand a rule. What do you use
                </Row>
                {next === 3 && (
                  <motion.div initial={enter} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: EASE }} className="border-b border-[#E9ECF1] bg-white px-2.5 pb-2 pt-1.5">
                    <Decide />
                    <p className="mt-1 rounded-[3px] border-l-2 border-[#C7CBF5] bg-[#F7F8FF] px-2 py-1 text-[9px] leading-snug text-[#111827]">
                      You are partway through a step and one of its rules does not make sense to you. You want to understand it before you go on: a guess would end up in your work, under your name.
                    </p>
                    <div className="mt-1 grid gap-[3px]">
                      {["The help note (?) on the step and the glossary in Learn", "A public chatbot, with the company names taken out", "Your own paid AI account, with training switched off"].map((t, i) => (
                        <div key={t} className="flex items-center gap-1.5 rounded-[3px] border border-[#DDE1E8] px-2 py-[5px] text-[9.5px] text-[#111827]">
                          <span className="h-[9px] w-[9px] shrink-0 rounded-full border border-[#8A91A3]" />
                          <span className="font-semibold text-[#5B6474]">{"ABC"[i]}</span>
                          {t}
                        </div>
                      ))}
                    </div>
                    <span className="mt-1.5 inline-block rounded-[3px] bg-[#EEF0F4] px-2 py-1 text-[9.5px] font-semibold text-[#8A91A3]">Check my answer</span>
                    <p className="mt-2 flex items-center gap-1.5 font-mono text-[7.5px] font-semibold uppercase tracking-[0.1em] text-[#3F4757]">
                      <span className="grid h-[12px] w-[12px] place-items-center rounded-full bg-[#111827] text-[7px] text-white">2</span>Tick and save the data rules, then sign the undertaking
                    </p>
                    <p className="mt-1 rounded-[3px] border border-dashed border-[#C9CED8] px-2 py-1 text-[8.5px] text-[#5B6474]">Opens once you check your answer above.</p>
                  </motion.div>
                )}
                <Row n={4} done={false} next={false} decision>
                  Your 01_Inputs folder holds a dataset with customer names and e-mail addresses (synthetic)
                </Row>
                <Row n={5} done={false} next={false}>
                  Check the Week 1 dates table of Onboarding record against Home › My plan
                </Row>
              </div>

              {/* The step's window: the file on the left, the step on the right */}
              <div style={{ opacity: win ? 1 : 0, transition: `opacity 300ms ${CSS_EASE}` }} className="absolute inset-0 z-10 bg-[#111827]/45" />
              <div style={fade(win, "translateY(10px) scale(0.98)")} className="absolute inset-x-2 top-2 z-20 flex h-[452px] flex-col overflow-hidden rounded-[4px] border border-[#C9CED8] bg-white shadow-[0_16px_40px_rgba(17,24,39,0.3)]">
                <div className="flex h-[34px] shrink-0 items-stretch border-b border-[#DDE1E8]">
                  <span className="grid w-[34px] place-items-center bg-[#111827] text-white"><Icon name="grid" size={13} /></span>
                  <span className="flex min-w-0 flex-1 flex-col justify-center px-2.5">
                    <span className="text-[8px] text-[#5B6474]">File · F1.1 · 01_Inputs</span>
                    <span className="text-[11px] font-bold leading-tight text-[#111827]">Onboarding record</span>
                  </span>
                  <span className="grid w-[34px] place-items-center border-l border-[#DDE1E8] text-[#3F4757]"><Icon name="x" size={12} /></span>
                </div>
                <div className="flex min-h-0 flex-1">
                  {/* The file */}
                  <div className="flex min-w-0 flex-1 flex-col bg-[#EEF0F4]">
                    <p className="flex shrink-0 items-center gap-1 border-b border-[#FDE68A] bg-[#FFFBEB] px-2 py-1 text-[8.5px] text-[#78350F]">
                      <span className="font-semibold">Next:</span> open <Path>Home › My Organisation</Path>. It opens beside this file.
                    </p>
                    <div className="m-2 rounded-[2px] border border-[#DDE1E8] bg-white px-2.5 pb-2.5 pt-2">
                      <p className="font-mono text-[7.5px] uppercase tracking-[0.06em] text-[#5B6474]">F1.1 · 01_Inputs · M2610-00001</p>
                      <p className="text-[11px] font-bold text-[#111827]">Onboarding record</p>
                      <p className="mt-1.5 border-t border-[#E9ECF1] pt-1.5 font-mono text-[7.5px] uppercase tracking-[0.08em] text-[#3F4757]">Onboarding record · Assignment</p>
                      <p className="mb-1 text-[8px] text-[#5B6474]">Filled in for you by the programme office. Check each value against <b className="text-[#111827]">Home › My Organisation</b> and correct any that differ.</p>
                      <div className="border border-[#DDE1E8]">
                        {ASSIGNMENT.map(([f, v, wrong, why], i) => (
                          <div key={f} className="grid grid-cols-[86px_1fr] border-b border-[#E9ECF1] last:border-b-0">
                            <span className="bg-[#F7F8FA] px-1.5 py-[5px] font-mono text-[8px] font-semibold text-[#111827]">{f}</span>
                            <span className="min-w-0 border-l border-[#E9ECF1] px-1">
                              <span data-t={CELL[i] || undefined} className={`relative my-[2px] block h-[15px] rounded-[2px] border px-1 text-[9px] leading-[13px] text-[#111827] ${(i === 1 && p === 6) || (i === 4 && p === 7) ? "border-[#6366F1]" : "border-transparent"}`}>
                                {wrong ? (
                                  <>
                                    <span style={{ opacity: value(i) ? 0 : 1, transition: `opacity 200ms ${CSS_EASE}` }} className="absolute inset-x-1 truncate">{wrong}</span>
                                    <span style={{ opacity: value(i) ? 1 : 0, transition: `opacity 200ms ${CSS_EASE}` }} className="absolute inset-x-1 truncate">{v}</span>
                                  </>
                                ) : (
                                  v
                                )}
                              </span>
                              {checked1 && (
                                <motion.span initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.04 * i }} className="block truncate px-1 pb-[3px] text-[7.5px] leading-tight text-[#15803D]">
                                  {why ?? "Right: matches My Organisation."}
                                </motion.span>
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                      {checked1 ? (
                        <motion.div data-t="result1" initial={reduce ? false : { opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: EASE }} className="mt-1.5 rounded-[2px] border border-[#DDE1E8] bg-[#F7F8FA] px-2 py-1">
                          <p className="text-[9px] font-semibold text-[#111827]">You found all 2 values that were wrong.</p>
                          <p className="text-[8.5px] text-[#15803D]">All 6 values now match Home › My Organisation.</p>
                        </motion.div>
                      ) : (
                        <span data-t="check1" className="mt-1.5 inline-flex items-center gap-1 rounded-[3px] bg-[#4338CA] px-2 py-1 text-[9px] font-semibold text-white">
                          <Icon name="check" size={9} strokeWidth={2.8} /> Check my answers
                        </span>
                      )}
                    </div>
                  </div>
                  {/* The step */}
                  <div className="flex w-[160px] shrink-0 flex-col border-l border-[#DDE1E8] bg-white">
                    <div className="flex items-center gap-1.5 border-b border-[#DDE1E8] px-2 py-1.5">
                      <span className="grid h-[15px] w-[15px] place-items-center rounded-full bg-[#4338CA] text-[8px] font-bold text-white">1</span>
                      <span className="font-mono text-[7.5px] font-semibold tracking-[0.06em] text-[#3730A3]">F1.1 · STEP 1 OF 6</span>
                    </div>
                    <div className="px-2 py-1.5">
                      <p className="text-[9.5px] font-bold leading-snug text-[#111827]">Check the Assignment table of Onboarding record against Home › My Organisation</p>
                      <p className="mt-1 text-[8px] leading-snug text-[#3F4757]">The programme office filled in the Assignment table from your enrolment record: the name of Org A, its home office, the name of Org B, its home office, the task owner of F1.2 and your start date. Check each value against My Organisation, correct any that differ, then click Check my answers.</p>
                    </div>
                    <div className="mt-auto flex items-start gap-1 border-t border-[#BBF7D0] bg-[#F0FDF4] px-2 py-1.5 text-[8px] leading-snug text-[#14532D]">
                      <Icon name="checkCircle" size={9} className="mt-px shrink-0" />
                      <span><b>Done when</b> Onboarding record · Assignment checked against My Organisation (6 values)</span>
                    </div>
                    <div className="flex items-stretch border-t border-[#DDE1E8]">
                      <span className="flex flex-1 items-center px-1.5 text-[7.5px] leading-tight text-[#78350F]">{checked1 ? <span className="text-[#5B6474]">Step 2 is a question, in the step list.</span> : "Finish the step's work above first."}</span>
                      <span data-t="mark1" className={`grid w-[72px] place-items-center py-2 text-[8.5px] font-semibold ${checked1 ? "bg-[#4338CA] text-white" : "bg-[#EEF0F4] text-[#8A91A3]"}`}>Mark step complete</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Home › My Organisation, opened from the toolbar: it sits beside the file */}
              <div style={fade(org, "translateY(8px) scale(0.98)")} className="absolute right-1 top-[44px] z-30 w-[208px] overflow-hidden rounded-[4px] border border-[#C9CED8] bg-white shadow-[0_14px_34px_rgba(17,24,39,0.28)]">
                <div className="flex items-center gap-1.5 border-b border-[#DDE1E8] px-2 py-1">
                  <span className="grid h-4 w-4 place-items-center rounded-[2px] bg-[#111827] text-white"><Icon name="grid" size={9} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[7px] text-[#5B6474]">Home · Reference</span>
                    <span className="block text-[9.5px] font-bold leading-tight text-[#111827]">Home › My Organisation</span>
                  </span>
                  <Icon name="x" size={10} className="text-[#3F4757]" />
                </div>
                <div className="grid grid-cols-[78px_1fr] border-b border-[#DDE1E8] text-[8px]">
                  <span className="bg-[#F7F8FA] px-1.5 py-1 font-mono">
                    <span className="block text-[6.5px] uppercase tracking-[0.06em] text-[#5B6474]">Mentee ID</span>
                    <span className="block font-semibold text-[#111827]">M2610-00001</span>
                    <span className="mt-1 block text-[6.5px] uppercase tracking-[0.06em] text-[#5B6474]">Start date</span>
                    <span className="block font-semibold text-[#111827]">05-OCT-2026</span>
                  </span>
                  <span className="border-l border-[#DDE1E8]">
                    <span className="grid grid-cols-[24px_1fr] border-b border-[#E9ECF1] font-mono text-[6.5px] uppercase text-[#5B6474]"><span className="px-1 py-0.5">Task</span><span className="px-1 py-0.5">Task owner</span></span>
                    <span className="grid grid-cols-[24px_1fr] border-b border-[#E9ECF1]"><span className="px-1 py-0.5 font-mono font-semibold">F1.1</span><span className="px-1 py-0.5">Cybersecurity Program Manager</span></span>
                    <span className={`grid grid-cols-[24px_1fr] ${p >= 6 && p <= 7 ? "bg-[#FFFBEB]" : ""}`}><span className="px-1 py-0.5 font-mono font-semibold">F1.2</span><span className="px-1 py-0.5">Policy &amp; Governance Analyst</span></span>
                  </span>
                </div>
                <div className="grid grid-cols-2 border-b border-[#DDE1E8] text-[8px]">
                  <span className="border-b-2 border-[#4338CA] px-1.5 py-1"><span className="block text-[6.5px] text-[#5B6474]">Org A · your main organisation</span><span className="block font-semibold leading-tight text-[#111827]">GlobalConnect Customer Solutions</span></span>
                  <span className="border-l border-[#DDE1E8] px-1.5 py-1"><span className="block text-[6.5px] text-[#5B6474]">Org B · your second organisation</span><span className="block font-semibold leading-tight text-[#5B6474]">LearnTech Educational Solutions</span></span>
                </div>
                <div className="flex gap-2.5 border-b border-[#DDE1E8] px-1.5 text-[7.5px] text-[#5B6474]">
                  <span className="border-b-2 border-[#111827] py-0.5 font-semibold text-[#111827]">Overview</span><span className="py-0.5">Offices</span><span className="py-0.5">Standards</span><span className="py-0.5">Records</span><span className="py-0.5">Legal</span>
                </div>
                <div className="px-1.5 py-1.5 text-[7.5px] leading-snug text-[#3F4757]">
                  <p>Large-scale BPO provider operating 35 call centres for Fortune 500 clients.</p>
                  <p data-t="office" className={`mt-1 rounded-[2px] px-1 py-0.5 ${p >= 4 && p <= 6 ? "bg-[#FFFBEB]" : ""}`}><span className="block text-[6.5px] uppercase tracking-[0.06em] text-[#5B6474]">Your office</span><span className="font-semibold text-[#111827]">Manila, Philippines</span></p>
                </div>
              </div>

              {/* The Home menu */}
              <div style={{ ...fade(menu, "translateY(6px) scale(0.97)"), transformOrigin: "bottom left" }} className="absolute bottom-[58px] left-[60px] z-40 w-[230px] overflow-hidden rounded-[4px] border border-[#C9CED8] bg-white shadow-[0_12px_32px_rgba(17,24,39,0.2)]">
                <div className="border-b border-[#DDE1E8] bg-[#F7F8FA] px-2.5 py-1.5">
                  <p className="font-mono text-[8px] font-semibold uppercase tracking-[0.08em] text-[#3F4757]">Home</p>
                  <p className="text-[9px] text-[#5B6474]">Your week and your two organisations</p>
                </div>
                <MenuRow n="Calendar" d="Weeks, tests and checkpoints" />
                <MenuRow n="My Organisation" d="Org A and Org B profiles" target />
                <MenuRow n="My Scores" d="My scores and gates" />
              </div>

              {/* The toolbar */}
              <div className="absolute inset-x-0 bottom-2 z-40 flex justify-center">
                <div className="flex overflow-hidden rounded-[6px] border border-[#12141C] bg-[#12141C] shadow-[0_10px_28px_rgba(17,24,39,0.25)]">
                  {DOCK.map(([l, icon, dim, end]) => {
                    const on = l === "Home" && menu;
                    return (
                      <span key={l} data-t={l === "Home" ? "home" : undefined} className={`relative flex h-[42px] min-w-[50px] flex-col items-center justify-center gap-[2px] px-1 text-[8.5px] ${end ? "border-r border-[#2A2E3B]" : ""} ${on ? "bg-white text-[#111827]" : dim ? "text-[#F1F2F6]/40" : "text-[#F1F2F6]"}`}>
                        <Icon name={icon} size={13} strokeWidth={1.7} />
                        {l}
                        {l === "Home" && !done1 && <span className="absolute right-[14px] top-[5px] h-[6px] w-[6px] rounded-full bg-[#F59E0B]" />}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
            <span data-t="rest" className="absolute bottom-[86px] right-[30px] h-1 w-1" />

            {/* The cursor */}
            {!reduce && (
              <motion.div className="absolute left-0 top-0 z-50" style={{ x: cx, y: cy, scale: cs }}>
                <motion.span
                  key={clicks}
                  initial={{ opacity: clicks ? 0.55 : 0, scale: 0.3 }}
                  animate={{ opacity: 0, scale: 1.6 }}
                  transition={{ duration: 0.5, ease: EASE }}
                  className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-indigo-500"
                />
                <svg width="18" height="22" viewBox="0 0 18 22" className="relative -ml-[2px] -mt-[1px] drop-shadow-[0_2px_3px_rgba(15,23,42,0.35)]">
                  <path d="M2 1.5v16.2l4.3-4.1 2.9 6.6 2.6-1.1-2.9-6.5h6z" fill="#0f172a" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" />
                </svg>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ n, done, next, decision, sub, children }: { n: number; done: boolean; next: boolean; decision?: boolean; sub?: string; children: ReactNode }) {
  return (
    <div className={`grid min-h-[30px] grid-cols-[34px_1fr_70px] border-b border-[#E9ECF1] ${next ? "bg-[#F3F4FF] shadow-[inset_2px_0_0_#4338CA]" : "bg-white"}`}>
      <span className="flex items-center justify-center">
        {done ? (
          <span className="inline-flex h-[17px] items-center gap-px rounded-full bg-[#16A34A] pl-1 pr-1.5 text-[9px] font-bold text-white tabular-nums">
            <Icon name="check" size={8} strokeWidth={3.5} />
            {n}
          </span>
        ) : next ? (
          <span className="grid h-[17px] w-[17px] place-items-center rounded-full border-[1.5px] border-[#4338CA] bg-white text-[9px] font-bold text-[#4338CA]">{n}</span>
        ) : (
          <span className="grid h-[17px] w-[17px] place-items-center rounded-full bg-[#EEF0F4] text-[9px] font-semibold text-[#5B6474]">{n}</span>
        )}
      </span>
      <span className="flex min-w-0 flex-col justify-center px-2 py-1">
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="min-w-0 truncate text-[10px] text-[#111827]">{children}</span>
          {next && <span className="shrink-0 rounded-[2px] bg-[#4338CA] px-1 text-[7.5px] font-semibold leading-[13px] text-white">UP NEXT</span>}
        </span>
        {sub && <span className="text-[8.5px] text-[#5B6474]">{sub}</span>}
      </span>
      <span className="flex items-center px-2">
        {decision ? (
          <span className="whitespace-nowrap rounded-[3px] border border-[#F2D29B] bg-[#FFF4DE] px-[5px] text-[8.5px] font-semibold leading-[14px] text-[#92400E]">Decision</span>
        ) : (
          <span className="whitespace-nowrap rounded-[3px] border border-[#DDE1E8] bg-[#F7F8FA] px-[5px] text-[8.5px] font-semibold leading-[14px] text-[#3F4757]">Activity</span>
        )}
      </span>
    </div>
  );
}

function Decide() {
  return (
    <p className="flex items-center gap-1.5 font-mono text-[7.5px] font-semibold uppercase tracking-[0.1em] text-[#3F4757]">
      <span className="grid h-[12px] w-[12px] place-items-center rounded-full bg-[#111827] text-[7px] text-white">1</span>Decide
    </p>
  );
}

function Path({ children }: { children: ReactNode }) {
  return <span className="rounded-[2px] border border-[#C7CBF5] bg-[#EEF0FF] px-1 font-semibold text-[#3730A3]">{children}</span>;
}

function MenuRow({ n, d, target }: { n: string; d: string; target?: boolean }) {
  return (
    <div data-t={target ? "myorg" : undefined} className={`flex items-center gap-2 border-b border-[#E9ECF1] px-2.5 py-1.5 last:border-b-0 ${target ? "bg-[#FFFBF2] shadow-[inset_3px_0_0_#D97706]" : "bg-white"}`}>
      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-[3px] border border-[#E3E6EC] text-[#3F4757]"><Icon name="home" size={10} /></span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-semibold text-[#111827]">{n}</span>
        <span className="block text-[8.5px] text-[#5B6474]">{d}</span>
      </span>
      {target && <span className="rounded-[3px] bg-[#FDE7B8] px-1.5 py-0.5 text-[8px] font-semibold text-[#78350F]">Step 1</span>}
    </div>
  );
}
