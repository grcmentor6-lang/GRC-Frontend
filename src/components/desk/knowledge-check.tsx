"use client";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { api, ApiError } from "@/lib/api";
import { fmtDay, testDue } from "@/lib/desk/model";
import type { Progress } from "@/lib/desk/progress";
import { checkOf, kcHash, kcStatus, type KcAttempt, type KcQuestion, type KcResultQuestion, type KcState } from "@/lib/desk/kc";
import type { Week } from "@/lib/desk/model";
import { useDesk, type ViewItem } from "./desk-context";
import { Label, press } from "./ui";

/**
 * A knowledge check, the Foundation Gate Exam or the Final Exam.
 *
 * Two parts. The screen (#KC-01, #FGE, #FEX) holds the facts, the Start button and the graded attempts. Once an attempt
 * is started its questions live in the test dock (TestDock), which desk-app.tsx mounts beside the desk, not in it: the
 * learner can open tasks, tools and documents while the test stays where it is (owner, 12 Nov 2026). The clock is the
 * server's (services/desk_kc.py): questions are served only once the attempt is started, picks are saved as they are
 * made, and the attempt is submitted when the time is up with the answers given so far.
 *
 * Open book: every rule (R16, L03), reference page (Ref-Sampling) and document section (BKB-ADD-16 Section 2) a
 * question names is a link that opens it where it lives on the desk (owner, 12 Nov 2026: "open it where it actually
 * exists, in the toolbar"): Learn › Rule tables, Learn › Reference pages or the Policy Library document, as a window
 * beside the test, with the cited row or section brought into view and marked.
 *
 * The dock wears its own colour, ink indigo, used nowhere else on the desk at this weight: while a test runs it is the
 * one thing on screen that is on the clock, and it should read that way from anywhere on the desk.
 */
export function KnowledgeCheck({ id }: { id: string }) {
  const { desk, start, openTask, progress, liveTest, openTest } = useDesk();
  const openRef = useOpenRef();
  const [st, setSt] = useState<KcState | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showing, setShowing] = useState<number | null>(null); // which attempt's results are shown

  const load = useCallback(() => {
    api.get<KcState>(`/me/desk/kc/${id}`).then((s) => { setErr(null); setSt(s); setShowing(null); }, (e: Error) => setErr(e.message));
  }, [id]);
  // One component per check: the desk keys its screen by the check's id, so moving to another check mounts afresh.
  useEffect(load, [load]);
  // The dock submitted (or started) this check: read it again.
  useEffect(() => {
    const on = (e: Event) => (e as CustomEvent<string>).detail === id && load();
    window.addEventListener(KC_CHANGED, on);
    return () => window.removeEventListener(KC_CHANGED, on);
  }, [id, load]);

  const begin = async () => {
    if (!st?.form) return;
    setBusy(true);
    setErr(null);
    try {
      const next = await api.post<KcState>(`/me/desk/kc/${id}/start`, { attempt: st.form.attempt });
      setSt(next);
      openTest(id);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "The check did not start. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  const week = desk.weeks.find((w) => w.kc?.split(" ")[0] === id);
  const due = week ? testDue(start, week.n) : null;

  if (err && !st)
    return (
      <Shell id={id} title="">
        <p className="text-[14px] text-[#3F4757]">This check did not load. {err}</p>
        <button type="button" onClick={load} className={`mt-3 h-9 rounded-lg bg-[#111827] px-4 text-[13px] font-semibold text-white ${press}`}>Try again</button>
      </Shell>
    );
  if (!st)
    return (
      <Shell id={id} title="">
        <div className="grid gap-3" aria-busy="true">{["h-6 w-1/2", "h-24", "h-24"].map((h, i) => <div key={i} className={`${h} animate-pulse rounded-md bg-slate-200/70`} />)}</div>
      </Shell>
    );

  const result = showing ? st.attempts.find((a) => a.n === showing) : st.attempts[st.attempts.length - 1];
  const left = st.attemptsAllowed - st.attempts.length;
  const other = liveTest && liveTest !== id ? liveTest : null;

  return (
    <Shell id={id} title={st.title === "Knowledge check" ? `Knowledge check ${id}` : `${id} · ${st.title}`}>
      <dl className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-[#3F4757]">
        <Fact k="Covers">{st.weeks.length > 2 ? `Weeks ${st.weeks[0]}–${st.weeks[st.weeks.length - 1]}` : st.weeks.map((w) => `Week ${w}`).join(" and ")}</Fact>
        <Fact k="Questions">{st.size}</Fact>
        <Fact k="Time">{st.minutes} minutes, open book</Fact>
        <Fact k="Pass mark">{st.passMark === null ? "Practice: scored, no pass mark" : `${st.passMark} %`}</Fact>
        <Fact k="Attempts">{st.attemptsAllowed === 2 ? "Two, a new form each time; the best counts" : st.attemptsAllowed}</Fact>
        {due && <Fact k="Due">{fmtDay(due)}</Fact>}
      </dl>
      {st.kind === "final" && (
        <p className="mt-3 text-[13px] text-[#5B6474]">This screen holds the exam&apos;s {st.size} questions. The practical station (an access extract with hidden exceptions) is not on the desk yet.</p>
      )}

      {!st.open && (
        <div data-kc="closed" className="mt-5 flex items-start gap-3 rounded-[10px] border border-[#E3E5EA] bg-[#F7F8FA] px-4 py-3.5">
          <Icon name="lock" size={17} className="mt-0.5 shrink-0 text-[#5B6474]" />
          <div className="text-[14px] text-[#111827]">
            <p className="font-semibold">{st.whyClosed}</p>
            <p className="mt-1 text-[13px] text-[#3F4757]">The questions come from this week&apos;s tasks and from your own work in them.</p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {st.opensAfter.filter((t) => !progress.submitted[t]).map((t) => (
                <button key={t} type="button" onClick={() => openTask(t)} className={`rounded-md border border-[#DDE1E8] bg-white px-2.5 py-1 font-mono text-[12px] font-semibold text-[#3730A3] hover:bg-[#F5F6FF] ${press}`}>{t}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {result && <Results a={result} passMark={st.passMark} onRef={openRef} />}
      {st.attempts.length > 1 && (
        <div className="mt-4 flex gap-2 text-[12.5px]">
          {st.attempts.map((a) => (
            <button key={a.n} type="button" onClick={() => setShowing(a.n)} aria-pressed={a.n === result?.n} className={`rounded-md border px-2.5 py-1 ${a.n === result?.n ? "border-[#4338CA] bg-[#F5F6FF] text-[#3730A3]" : "border-[#DDE1E8] bg-white text-[#3F4757]"} ${press}`}>
              Attempt {a.n} · {a.score ?? "–"}%
            </button>
          ))}
        </div>
      )}

      {st.form?.started ? (
        <div data-kc="in-progress" className="mt-6 flex flex-wrap items-center gap-3 rounded-[10px] bg-[#1E1B4B] px-4 py-3">
          <Icon name="clock" size={17} className="shrink-0 text-[#C7D2FE]" />
          <p className="min-w-0 flex-1 text-[13.5px] text-[#E0E7FF] [&>span]:text-white">
            <span className="font-semibold">Attempt {st.form.attempt} is in progress</span> in the test panel. The rest of the desk stays open while you answer.
          </p>
          <button type="button" data-kc="resume" onClick={() => openTest(id)} className={`h-9 rounded-lg bg-white px-4 text-[13px] font-semibold text-[#1E1B4B] hover:bg-[#EEF0FF] ${press}`}>Show the test</button>
        </div>
      ) : st.form ? (
        <div className="mt-6">
          <OpenBook minutes={st.minutes} />
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button type="button" data-kc="start" disabled={busy || !!other} onClick={begin} className={`h-10 rounded-lg bg-[#4338CA] px-5 text-[13.5px] font-semibold text-white hover:brightness-110 disabled:cursor-not-allowed disabled:bg-[#E3E6EC] disabled:text-[#8A91A3] ${press}`}>
              {busy ? "Starting…" : st.attempts.length ? `Start attempt ${st.form.attempt} (new form)` : "Start the check"}
            </button>
            <span className="text-[12.5px] text-[#5B6474]">
              {other
                ? `${other} is in progress. Submit it before starting another.`
                : st.attempts.length
                  ? `${left} attempt left. It is a new form; your best score counts.`
                  : `${st.size} questions. The ${st.minutes} minutes start when you press Start.`}
            </span>
            {err && <span role="alert" className="text-[12.5px] text-[#B42318]">{err}</span>}
          </div>
        </div>
      ) : (
        st.open && st.attempts.length > 0 && (
          <p data-kc="used" className="mt-6 text-[13px] text-[#5B6474]">
            {st.retakeAt
              ? `Both attempts are used and the pass mark of ${st.passMark} % is not met yet. A further attempt, on a new form, opens on ${new Date(st.retakeAt).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}. Use the days between to go back over the rules you missed.`
              : `Your attempts are used. Your best score, ${st.bestScore}%, is on your record.`}
          </p>
        )
      )}
    </Shell>
  );
}

/** What "open book" means here, said before the clock starts. */
function OpenBook({ minutes }: { minutes: number }) {
  return (
    <div data-kc="open-book" className="flex items-start gap-3 rounded-[10px] border border-[#E7DCC3] bg-[#FFFBF2] px-4 py-3.5 text-[13.5px] leading-[1.55] text-[#3F4757]">
      <Icon name="book" size={17} className="mt-0.5 shrink-0 text-[#92600E]" />
      <ul className="grid gap-1">
        <li><strong className="font-semibold text-[#111827]">Open book.</strong> A rule, reference page or document a question names is underlined: click it and it opens where it lives on the desk (Learn › Rule tables, Learn › Reference pages, the Policy Library), with the line it cites marked.</li>
        <li>The test sits in its own panel beside the desk, so the toolbar and your own task files stay in reach while you answer.</li>
        <li>You have {minutes} minutes from Start. Your answers are saved as you pick them, and when the time is up the test is submitted with the answers you have given.</li>
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------- the test dock
const KC_CHANGED = "grc101:kc-changed";
const LIVE_KEY = "grc101.kc.live";
/** The check in progress on this browser, so a reload brings its panel back. The server holds the attempt itself. */
export function liveStored(): string | null {
  try {
    return localStorage.getItem(LIVE_KEY);
  } catch {
    return null;
  }
}
export function storeLive(id: string | null) {
  try {
    if (id) localStorage.setItem(LIVE_KEY, id);
    else localStorage.removeItem(LIVE_KEY);
  } catch {
    /* storage blocked: the screen's "Show the test" still finds it */
  }
}

/** The progress copy the week panel reads: kept in step with what the server stored. */
function remember(update: (fn: (p: Progress) => Progress) => void, id: string, s: KcState) {
  update((p) => ({ ...p, kc: { ...p.kc, [id]: { attempts: s.attempts.map(({ n, at, score, passed }) => ({ n, at: at ?? undefined, score, passed })) } } }));
}

const clock = (s: number) => `${Math.floor(Math.max(s, 0) / 60)}:${String(Math.max(s, 0) % 60).padStart(2, "0")}`;

/**
 * The attempt in progress. Beside the desk on a wide screen (desk-app.tsx confines the desk's overlays to its own
 * column), over it on a narrow one; folded, it is a pill with the clock. It stays mounted while folded, so the clock
 * still submits the attempt when the time is up.
 */
export function TestDock({ id, folded, onFold }: { id: string; folded: boolean; onFold: (f: boolean) => void }) {
  const { update, endTest } = useDesk();
  const [st, setSt] = useState<KcState | null>(null);
  const [picks, setPicks] = useState<Record<string, number>>({});
  const [deadline, setDeadline] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const touched = useRef(false);
  const lastTry = useRef(0);
  const openRef = useOpenRef();
  // The desk's floating windows keep clear of the dock while it is open (float-window.tsx reads --test-dock).
  // The dock's width is a share of the desk's row, not of the viewport: the app is zoomed on large screens
  // (globals.css --app-zoom), where a vw width came out a quarter of the screen.
  const dock = useRef<HTMLElement>(null);
  useEffect(() => {
    if (folded) return;
    const set = () => document.documentElement.style.setProperty("--test-dock", `${(dock.current?.offsetWidth ?? 480) + 72}px`);
    set();
    window.addEventListener("resize", set);
    return () => { window.removeEventListener("resize", set); document.documentElement.style.removeProperty("--test-dock"); };
  }, [folded]);

  useEffect(() => {
    let live = true;
    api.get<KcState>(`/me/desk/kc/${id}`).then(
      (s) => {
        if (!live) return;
        // Submitted elsewhere, or never started: nothing to hold open.
        if (!s.form?.started) return endTest();
        setSt(s);
        setPicks(Object.fromEntries(s.form.picks));
        setDeadline(Date.now() + s.form.secondsLeft * 1000);
      },
      (e: Error) => live && setErr(e.message),
    );
    return () => { live = false; };
  }, [id, endTest]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // Each pick is saved (debounced), so what was answered survives a closed tab and counts when the time is up.
  useEffect(() => {
    if (!st?.form || !touched.current) return;
    const body = { attempt: st.form.attempt, picks: Object.entries(picks).map(([qid, pick]) => ({ qid, pick })) };
    const t = setTimeout(() => void api.put(`/me/desk/kc/${id}/picks`, body).catch(() => {}), 400);
    return () => clearTimeout(t);
  }, [picks, st, id]);

  const submit = useCallback(async () => {
    if (!st?.form || busy) return;
    setBusy(true);
    setErr(null);
    lastTry.current = Date.now();
    try {
      const answers = st.form.questions.filter((q) => picks[q.qid] !== undefined).map((q) => ({ qid: q.qid, pick: q.options[picks[q.qid]] }));
      const next = await api.post<KcState>(`/me/desk/kc/${id}`, { attempt: st.form.attempt, answers });
      remember(update, id, next);
      window.dispatchEvent(new CustomEvent(KC_CHANGED, { detail: id }));
      endTest();
      openKc(id);
      document.querySelector("main.desk-panel")?.scrollTo({ top: 0 });
    } catch (e) {
      // Already graded (another tab, or the time ran out on the server): show what was stored.
      if (e instanceof ApiError && e.status === 409) {
        window.dispatchEvent(new CustomEvent(KC_CHANGED, { detail: id }));
        endTest();
        openKc(id);
        return;
      }
      setErr(e instanceof ApiError ? e.message : "Your answers did not reach the server. Trying again.");
      setBusy(false);
    }
  }, [st, busy, picks, id, update, endTest]);

  const left = deadline ? Math.ceil((deadline - now) / 1000) : null;
  // Time up: submit what is answered; retried every few seconds if the network is down (the server grades the saved
  // picks anyway once its grace has passed).
  useEffect(() => {
    if (left !== null && left <= 0 && !busy && Date.now() - lastTry.current > 4000) void submit();
  }, [left, busy, submit]);

  const qs = st?.form?.questions ?? [];
  const answered = qs.filter((q) => picks[q.qid] !== undefined).length;
  const total = (st?.minutes ?? 0) * 60;
  const low = left !== null && left <= 300;
  const last = left !== null && left <= 60;
  const title = st ? (st.title === "Knowledge check" ? `Knowledge check ${id}` : `${id} · ${st.title}`) : id;
  const timer = (
    <span data-kc="timer" role="timer" aria-live="off" className={`inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-[13px] font-bold tabular-nums ${last ? "bg-[#FECACA] text-[#7F1D1D]" : low ? "bg-[#FDE68A] text-[#78350F]" : "bg-white/15 text-white"}`}>
      <Icon name="clock" size={13} />
      {left === null ? "–:––" : left > 0 ? `${clock(left)} left` : "Time is up"}
    </span>
  );

  if (folded)
    return (
      <button
        type="button"
        data-kc="pill"
        onClick={() => onFold(false)}
        className={`fixed bottom-[84px] left-3 z-[80] flex items-center gap-2.5 rounded-full bg-[#1E1B4B] py-1.5 pl-3.5 pr-1.5 text-[13px] font-semibold text-white shadow-[0_10px_28px_rgba(30,27,75,0.45)] lg:left-auto lg:right-3 ${press}`}
      >
        <span className="font-mono text-[12px] text-[#C7D2FE]">{id}</span>
        {timer}
        <span className="rounded-full bg-white px-3 py-1 text-[12.5px] text-[#1E1B4B]">Back to the test</span>
      </button>
    );

  const jump = (n: number, from: HTMLElement) => from.closest("aside")?.querySelector(`[data-kc-q="${n}"]`)?.scrollIntoView({ block: "start", behavior: "smooth" });
  return (
    <aside
      ref={dock}
      data-kc-dock={id}
      aria-label={`${id} in progress`}
      // Its own pane: a divider, a gutter of the desk's ground, then the test as a raised card. Nothing of the desk
      // runs under it and nothing of it touches the desk (owner, 12 Nov 2026: "there is no separation").
      className="flex flex-col max-lg:fixed max-lg:inset-0 max-lg:z-[80] lg:h-desk lg:w-[clamp(400px,36%,920px)] lg:shrink-0 lg:border-l lg:border-[#C5CAD6] lg:bg-[#DFE3EC] lg:p-2.5"
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#ECEEFB] lg:rounded-xl lg:shadow-[0_10px_28px_-10px_rgba(30,27,75,0.5)] lg:ring-1 lg:ring-[#1E1B4B]/30">
      <header className="shrink-0 bg-[#1E1B4B] text-white">
        <div className="flex items-center gap-2.5 px-4 pb-2 pt-2.5">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-semibold uppercase tracking-[0.08em] text-[#A5B4FC]">Test in progress · attempt {st?.form?.attempt ?? "–"}</p>
            <p className="truncate text-[15px] font-bold">{title}</p>
          </div>
          {timer}
          <button type="button" data-kc="fold" onClick={() => onFold(true)} title="Fold the test away; the clock keeps running" className={`flex shrink-0 items-center gap-1 rounded-md border border-white/25 px-2 py-1 text-[12.5px] font-medium text-white hover:bg-white/10 ${press}`}>
            <Icon name="chevronDown" size={14} />
            <span className="lg:hidden">Desk</span>
            <span className="max-lg:hidden">Fold</span>
          </button>
        </div>
        {/* The time left, as a bar that empties. */}
        <div className="h-[3px] bg-white/10" aria-hidden>
          <div
            className={`h-full origin-left transition-transform duration-1000 ease-linear ${last ? "bg-[#F87171]" : low ? "bg-[#FBBF24]" : "bg-[#A5B4FC]"}`}
            style={{ transform: `scaleX(${left === null || !total ? 1 : Math.min(Math.max(left / total, 0), 1)})` }}
          />
        </div>
        {qs.length > 0 && (
          <nav aria-label="Questions" className="flex flex-wrap items-center gap-1.5 px-4 py-2">
            {qs.map((q, i) => {
              const done = picks[q.qid] !== undefined;
              return (
                <button
                  key={q.qid}
                  type="button"
                  data-kc-jump={i + 1}
                  aria-label={`Question ${i + 1}, ${done ? "answered" : "not answered"}`}
                  onClick={(e) => jump(i + 1, e.currentTarget)}
                  className={`grid h-6 min-w-6 place-items-center rounded px-1 text-[11.5px] font-bold tabular-nums ${done ? "bg-white text-[#1E1B4B]" : "border border-white/30 text-[#C7D2FE] hover:bg-white/10"} ${press}`}
                >
                  {i + 1}
                </button>
              );
            })}
            <span className="ml-auto whitespace-nowrap text-[12px] tabular-nums text-[#C7D2FE]">Open book · {answered} of {qs.length} answered</span>
          </nav>
        )}
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-6 pt-3 [scrollbar-color:#B9BEE3_transparent] [scrollbar-width:thin] sm:px-4">
        {!st ? (
          err ? <p className="text-[13.5px] text-[#3F4757]">The test did not load. {err}</p> : <div className="grid gap-3" aria-busy="true">{["h-20", "h-24", "h-24"].map((h, i) => <div key={i} className={`${h} animate-pulse rounded-xl bg-white/70`} />)}</div>
        ) : (
          <ol className="grid gap-3">
            {qs.map((q, i) => (
              <QuestionCard
                key={q.qid}
                n={i + 1}
                q={q}
                pick={picks[q.qid]}
                locked={left !== null && left <= 0}
                onPick={(d) => { touched.current = true; setPicks((p) => ({ ...p, [q.qid]: d })); }}
                onRef={(it) => {
                  // On a narrow screen the test covers the desk: fold it, so the window it opens can be read.
                  if (window.matchMedia("(max-width: 1023px)").matches) onFold(true);
                  openRef(it);
                }}
              />
            ))}
          </ol>
        )}
      </div>
      {st && (
        <footer className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-[#D5D9F2] bg-white px-4 py-3 lg:pr-[84px]">
          <button
            type="button"
            data-kc="submit"
            disabled={busy || answered < qs.length}
            onClick={submit}
            className={`h-10 rounded-lg bg-[#1E1B4B] px-5 text-[13.5px] font-semibold text-white hover:brightness-125 disabled:cursor-not-allowed disabled:bg-[#E3E6EC] disabled:text-[#8A91A3] ${press}`}
          >
            {busy ? "Submitting…" : `Submit attempt ${st.form?.attempt}`}
          </button>
          <span className="min-w-0 flex-1 text-[12px] text-[#5B6474]">
            {answered < qs.length ? `${qs.length - answered} still to answer. When the time is up, the test is submitted as it stands.` : "All answered. Answers are locked once you submit."}
          </span>
          {err && <span role="alert" className="w-full text-[12.5px] text-[#B42318]">{err}</span>}
        </footer>
      )}
      </div>
    </aside>
  );
}

// ---------------------------------------------------------------------------- open book: the references a text names
type Part = string | { text: string; item: ViewItem };

/** Splits a question or reason into text and the references it names, for the ones this programme has. */
function useRefSplit(): (s: string) => Part[] {
  const { desk } = useDesk();
  const re = useMemo(() => {
    const pages = Object.keys(desk.pages).sort((a, b) => b.length - a.length).map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    return new RegExp(`\\b([RL]\\d{2})\\b|(${pages.join("|") || "(?!)"})(?![\\w-])|\\b(BKB-[A-Z]+-\\d+)(?: Sections? (\\d+(?:\\.\\d+)*))?`, "g");
  }, [desk]);
  return useCallback(
    (s: string) => {
      const out: Part[] = [];
      let at = 0;
      for (const m of s.matchAll(re)) {
        const [all, rule, page, doc, sec] = m;
        const item: ViewItem | null = rule ? (desk.rules[rule] ? { kind: "rule", id: rule } : null) : page ? { kind: "page", id: page } : { kind: "doc", id: sec ? `${doc}#${sec}` : doc };
        if (!item) continue;
        if (m.index! > at) out.push(s.slice(at, m.index));
        out.push({ text: all, item });
        at = m.index! + all.length;
      }
      if (at < s.length) out.push(s.slice(at));
      return out;
    },
    [re, desk],
  );
}

const WHERE: Record<string, string> = { rule: "Learn › Rule tables", page: "Learn › Reference pages", doc: "Policies › Policy Library" };

/**
 * Opens a reference where it lives on the desk, as the window its toolbar menu opens, then brings the rule's row or
 * the document's section into view and marks it.
 */
function useOpenRef(): (item: ViewItem) => void {
  const { openTool } = useDesk();
  return useCallback(
    (item: ViewItem) => {
      const [id, sec] = item.id.split("#");
      openTool(item.kind === "rule" ? "learn|Rule tables" : item.kind === "page" ? `page|${id}` : `doc|${id}`);
      if (item.kind === "page" || (item.kind === "doc" && !sec)) return;
      // ponytail: the window is found in the page and its line marked from here, not by threading a "spot" through
      // every window kind; move it into the windows if anything besides the checks needs it.
      let tries = 0;
      const find = () => {
        const win = [...document.querySelectorAll<HTMLElement>('section[role="dialog"]')].reverse().find((w) => {
          const label = w.getAttribute("aria-label") ?? "";
          return item.kind === "rule" ? label.includes("Rule tables") : label.startsWith(id);
        });
        const el = !win
          ? null
          : item.kind === "rule"
            ? ([...win.querySelectorAll("td")].find((td) => td.textContent?.trim() === id)?.parentElement ?? null)
            : (win.querySelector<HTMLElement>(`[data-sec="${sec}"]`) ?? win.querySelector<HTMLElement>(`[data-sec="${sec.split(".")[0]}"]`));
        if (!el) {
          if (++tries < 20) setTimeout(find, 120);
          return;
        }
        win!.querySelectorAll<HTMLElement>("[data-kc-spot]").forEach((x) => { x.removeAttribute("data-kc-spot"); x.style.boxShadow = ""; });
        const mark = (item.kind === "rule" ? el.firstElementChild : el) as HTMLElement;
        mark.setAttribute("data-kc-spot", id);
        mark.style.boxShadow = "inset 3px 0 0 #D97706";
        el.scrollIntoView({ block: item.kind === "rule" ? "center" : "start", behavior: "smooth" });
        el.animate([{ backgroundColor: "#FDE68A" }, { backgroundColor: "#FDE68A", offset: 0.7 }, { backgroundColor: "transparent" }], { duration: 3200, easing: "ease-out" });
      };
      setTimeout(find, 150);
    },
    [openTool],
  );
}

const refLink = "rounded-sm font-semibold text-[#7A4E07] underline decoration-[#D9B26A] decoration-dotted decoration-[1.5px] underline-offset-[3px] hover:decoration-solid focus-ring";

/** Text with its references as links that open them on the desk. */
function RefText({ text, onRef }: { text: string; onRef: (item: ViewItem) => void }) {
  const split = useRefSplit();
  return (
    <>
      {split(text).map((p, i) =>
        typeof p === "string" ? (
          <Fragment key={i}>{p}</Fragment>
        ) : (
          <button key={i} type="button" data-kc-ref={p.item.id} title={`Opens in ${WHERE[p.item.kind]}`} onClick={() => onRef(p.item)} className={refLink}>
            {p.text}
          </button>
        ),
      )}
    </>
  );
}

// ---------------------------------------------------------------------------- the screen's parts
function Shell({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <article data-kc-screen={id} className="mx-auto w-full max-w-[920px] px-4 pb-10 pt-5 sm:px-6">
      <Label>Before the week closes</Label>
      {title && <h1 className="mt-1 text-[20px] font-bold tracking-[-0.01em] text-[#111827]">{title}</h1>}
      <div className="mt-2">{children}</div>
    </article>
  );
}

function Fact({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-1.5">
      <dt className="text-[#5B6474]">{k}:</dt>
      <dd className="font-medium text-[#111827]">{children}</dd>
    </div>
  );
}

const card = "flex items-start gap-3 rounded-[10px] border px-4 py-3.5 transition-colors sm:gap-3.5 sm:px-5";

function QuestionCard({ n, q, pick, locked, onPick, onRef }: { n: number; q: KcQuestion; pick: number | undefined; locked: boolean; onPick: (d: number) => void; onRef: (item: ViewItem) => void }) {
  return (
    <li data-kc-q={n} className="scroll-mt-3 rounded-xl border border-[#D5D9F2] bg-white p-3.5 sm:p-4">
      <fieldset className="grid min-w-0 gap-2.5" disabled={locked}>
        <legend className="mb-2 flex gap-2.5 text-[15px] font-semibold leading-[1.5] text-[#111827]">
          <span className="shrink-0 tabular-nums text-[#4338CA]">{n}.</span>
          <span className="[text-wrap:pretty]"><RefText text={q.stem} onRef={onRef} /></span>
        </legend>
        {q.options.map((o, d) => {
          const on = pick === d;
          return (
            <label key={d} className={`${card} cursor-pointer ${on ? "border-[#4338CA] bg-[#F5F6FF] shadow-[0_0_0_1px_#4338CA]" : "border-[#E3E5EA] bg-white hover:border-[#C9CCD4] hover:bg-[#FAFAFC]"}`}>
              <input
                type="radio"
                name={q.qid}
                checked={on}
                onChange={() => onPick(d)}
                className="mt-[3px] h-[18px] w-[18px] shrink-0 cursor-pointer appearance-none rounded-full border-2 border-[#C9CCD4] bg-white transition-[border] checked:border-[5px] checked:border-[#4338CA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4338CA]/30"
              />
              <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-md text-[12.5px] font-bold ${on ? "bg-[#4338CA] text-white" : "bg-[#F1F2F5] text-[#4B5563]"}`}>{String.fromCharCode(65 + d)}</span>
              <span className="min-w-0 flex-1 break-words text-[15px] font-medium leading-6 text-[#111827]">{o}</span>
            </label>
          );
        })}
      </fieldset>
    </li>
  );
}

function Results({ a, passMark, onRef }: { a: KcAttempt; passMark: number | null; onRef: (item: ViewItem) => void }) {
  const right = a.questions.filter((q) => q.correct).length;
  const ok = a.passed !== false;
  return (
    <section data-kc="results" className="mt-5">
      <p className={`flex flex-wrap items-center gap-x-3 gap-y-1 rounded-[10px] border px-4 py-3 text-[14px] ${ok ? "border-[#86EFAC] bg-[#F0FDF4] text-[#14532D]" : "border-[#FCD34D] bg-[#FFFBEB] text-[#78350F]"}`}>
        <Icon name={ok ? "checkCircle" : "info"} size={18} className="shrink-0" />
        <span className="text-[18px] font-bold tabular-nums">{a.score ?? "–"}%</span>
        <span className="font-semibold">
          Attempt {a.n}: {right} of {a.questions.length} right.{" "}
          {a.passed === true ? `Passed (pass mark ${passMark} %).` : a.passed === false ? `Below the pass mark of ${passMark} %.` : "Practice check: no pass mark."}
        </span>
        {a.at && <span className="text-[12.5px] font-normal opacity-80">Submitted {new Date(a.at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</span>}
      </p>
      {a.late && <p className="mt-2 text-[13px] text-[#5B6474]">The time ran out before this attempt was sent, so the answers saved before then were graded.</p>}
      <ol className="mt-5 grid gap-6">
        {a.questions.map((q, i) => <ResultCard key={q.qid} n={i + 1} q={q} onRef={onRef} />)}
      </ol>
    </section>
  );
}

function ResultCard({ n, q, onRef }: { n: number; q: KcResultQuestion; onRef: (item: ViewItem) => void }) {
  return (
    <li data-kc-r={n} className="grid gap-2.5">
      <p className="flex gap-2.5 text-[15px] font-semibold leading-[1.5] text-[#111827]">
        <span className="shrink-0 tabular-nums text-[#4338CA]">{n}.</span>
        <span className="[text-wrap:pretty]"><RefText text={q.stem} onRef={onRef} /></span>
        <Icon name={q.correct ? "checkCircle" : "xCircle"} size={18} className={`ml-auto mt-0.5 shrink-0 ${q.correct ? "text-[#15803D]" : "text-[#B45309]"}`} aria-label={q.correct ? "Right" : "Not right"} />
      </p>
      {q.pick === null && <p className="text-[13px] font-medium text-[#92400E]">Not answered before the time ran out.</p>}
      {q.options.map((o, d) => {
        const isBest = d === q.best;
        const on = d === q.pick;
        const tone = isBest ? "border-[#86EFAC] bg-[#F0FDF4]" : on ? "border-[#FCD34D] bg-[#FFFBEB]" : "border-[#E3E5EA] bg-white";
        const chip = isBest ? "bg-[#DCFCE7] text-[#15803D]" : on ? "bg-[#FEF3C7] text-[#92400E]" : "bg-[#F1F2F5] text-[#4B5563]";
        return (
          <div key={d} className={`${card} ${tone}`}>
            <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-md text-[12.5px] font-bold ${chip}`}>{String.fromCharCode(65 + d)}</span>
            <span className="min-w-0 flex-1">
              <span className="break-words text-[15px] font-medium leading-6 text-[#111827]">{o}</span>
              {(isBest || on) && (
                <span className={`ml-2 inline-block whitespace-nowrap rounded-[4px] px-1.5 py-0.5 align-[2px] text-[11.5px] font-semibold ${isBest ? "bg-[#DCFCE7] text-[#15803D]" : "bg-[#FEF3C7] text-[#92400E]"}`}>
                  {isBest && on ? "Your answer · right" : isBest ? "Right answer" : "Your answer"}
                </span>
              )}
              <span className="mt-1.5 block text-[13.5px] leading-[1.55] text-[#374151]"><strong className="font-semibold text-[#111827]">Why: </strong><RefText text={q.reasons[d]} onRef={onRef} /></span>
            </span>
          </div>
        );
      })}
    </li>
  );
}

/** Opens a check as the desk's screen: desk-app.tsx follows the address. */
export const openKc = (id: string) => {
  location.hash = kcHash(id);
};

/** A check's standing in one chip: its best score, Open, or Not open yet (with the reason as its title). */
export function KcChip({ id }: { id: string }) {
  const { desk, progress, free } = useDesk();
  const s = kcStatus(desk, progress, id, free);
  const cls = s.tone === "done" ? "bg-[#DCFCE7] text-[#15803D]" : s.tone === "open" ? "bg-[#EEF0FF] text-[#3730A3]" : "bg-[#F3F4F6] text-[#6B7280]";
  return <span data-kc-chip={s.tone} title={s.why ?? undefined} className={`shrink-0 whitespace-nowrap rounded-full px-[9px] py-1 text-[11px] font-semibold tabular-nums ${cls}`}>{s.label}</span>;
}

/** The week panel's "Before the week closes" line for the week's check: a control that opens it. */
export function KcPanelItem({ week, onOpen }: { week: Week; onOpen?: () => void }) {
  const id = checkOf(week)!;
  return (
    <button
      type="button"
      onClick={() => {
        openKc(id);
        onOpen?.();
      }}
      className="flex w-full items-center gap-3 px-5 py-2.5 text-left text-[#111827] transition-colors hover:bg-[#FAFAFB] focus-ring"
    >
      {week.gate ? (
        <span className="grid w-[18px] shrink-0 place-items-center"><span className="h-2 w-2 rotate-45 bg-[#D97706]" /></span>
      ) : (
        <Icon name="checkSquare" size={18} className="shrink-0 text-[#4338CA]" />
      )}
      <span className="min-w-0 flex-1">{week.gate || "Knowledge check"} {id}</span>
      <KcChip id={id} />
    </button>
  );
}

