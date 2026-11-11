"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { api, ApiError } from "@/lib/api";
import { fmtDay, testDue } from "@/lib/desk/model";
import { checkOf, kcHash, kcStatus, type KcAttempt, type KcQuestion, type KcResultQuestion, type KcState } from "@/lib/desk/kc";
import type { Week } from "@/lib/desk/model";
import { useDesk } from "./desk-context";
import { Label, press } from "./ui";

/**
 * A knowledge check, the Foundation Gate Exam or the Final Exam, as a screen of the desk (#KC-01, #FGE, #FEX).
 * The form comes from the server, drawn for this learner (backend services/desk_kc.py); nothing here knows an answer
 * before the attempt is submitted. Looks like the decision step (how-to.tsx Decision): numbered questions, options
 * as raised cards, then each option with its reason. A submitted attempt is read-only.
 */
export function KnowledgeCheck({ id }: { id: string }) {
  const { desk, start, update, openTask, progress } = useDesk();
  const [st, setSt] = useState<KcState | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [taking, setTaking] = useState(false);
  const [picks, setPicks] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState(false);
  const [showing, setShowing] = useState<number | null>(null); // which attempt's results are shown

  const load = useCallback(() => {
    api.get<KcState>(`/me/desk/kc/${id}`).then((s) => { setErr(null); setSt(s); }, (e: Error) => setErr(e.message));
  }, [id]);
  // One component per check: the desk keys its screen by the check's id, so moving to another check mounts afresh.
  useEffect(load, [load]);

  // The status lines on the week panel read the progress copy: keep it in step with what the server stored.
  const remember = useCallback(
    (s: KcState) => update((p) => ({ ...p, kc: { ...p.kc, [id]: { attempts: s.attempts.map(({ n, at, score, passed }) => ({ n, at: at ?? undefined, score, passed })) } } })),
    [id, update],
  );

  const submit = async () => {
    if (!st?.form) return;
    setBusy(true);
    setErr(null);
    try {
      const answers = st.form.questions.map((q) => ({ qid: q.qid, pick: q.options[picks[q.qid]] }));
      const next = await api.post<KcState>(`/me/desk/kc/${id}`, { attempt: st.form.attempt, answers });
      forgetStart(id, st.form.attempt);
      setSt(next);
      remember(next);
      setTaking(false);
      setPicks({});
      setShowing(next.attempts.length);
      document.querySelector("main")?.scrollTo({ top: 0 });
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Your answers did not reach the server. Check your connection and submit again.");
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
  const answered = st.form ? st.form.questions.filter((q) => picks[q.qid] !== undefined).length : 0;

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

      {taking && st.form ? (
        <>
          <Timer id={id} attempt={st.form.attempt} minutes={st.minutes} />
          <ol className="mt-4 grid gap-6">
            {st.form.questions.map((q, i) => (
              <QuestionCard key={q.qid} n={i + 1} q={q} pick={picks[q.qid]} onPick={(d) => setPicks((p) => ({ ...p, [q.qid]: d }))} />
            ))}
          </ol>
          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-[#E3E5EA] pt-4">
            <button
              type="button"
              data-kc="submit"
              disabled={busy || answered < st.form.questions.length}
              onClick={submit}
              className={`h-10 rounded-lg bg-[#111827] px-5 text-[13.5px] font-semibold text-white hover:brightness-110 disabled:cursor-not-allowed disabled:bg-[#E3E6EC] disabled:text-[#8A91A3] ${press}`}
            >
              {busy ? "Submitting…" : `Submit attempt ${st.form.attempt}`}
            </button>
            <span className="text-[12.5px] tabular-nums text-[#5B6474]">{answered} of {st.form.questions.length} answered. Your answers are locked once you submit.</span>
            {err && <span role="alert" className="text-[12.5px] text-[#B42318]">{err}</span>}
          </div>
        </>
      ) : (
        <>
          {result && <Results a={result} passMark={st.passMark} />}
          {st.attempts.length > 1 && (
            <div className="mt-4 flex gap-2 text-[12.5px]">
              {st.attempts.map((a) => (
                <button key={a.n} type="button" onClick={() => setShowing(a.n)} aria-pressed={a.n === result?.n} className={`rounded-md border px-2.5 py-1 ${a.n === result?.n ? "border-[#4338CA] bg-[#F5F6FF] text-[#3730A3]" : "border-[#DDE1E8] bg-white text-[#3F4757]"} ${press}`}>
                  Attempt {a.n} · {a.score ?? "–"}%
                </button>
              ))}
            </div>
          )}
          {st.form && (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button type="button" data-kc="start" onClick={() => setTaking(true)} className={`h-10 rounded-lg bg-[#4338CA] px-5 text-[13.5px] font-semibold text-white hover:brightness-110 ${press}`}>
                {st.attempts.length ? `Take attempt ${st.form.attempt} (new form)` : "Start the check"}
              </button>
              <span className="text-[12.5px] text-[#5B6474]">
                {st.attempts.length ? `${left} attempt left. It is a new form; your best score counts.` : `${st.size} questions. Every option shows why once you submit.`}
              </span>
            </div>
          )}
          {st.open && !st.form && st.attempts.length > 0 && (
            <p className="mt-6 text-[13px] text-[#5B6474]">Both attempts are used. Your best score, {st.bestScore}%, is on your record.</p>
          )}
        </>
      )}
    </Shell>
  );
}

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

function QuestionCard({ n, q, pick, onPick }: { n: number; q: KcQuestion; pick: number | undefined; onPick: (d: number) => void }) {
  return (
    <li data-kc-q={n}>
      <fieldset className="grid min-w-0 gap-2.5">
        <legend className="mb-2 flex gap-2.5 text-[15px] font-semibold leading-[1.5] text-[#111827]">
          <span className="shrink-0 tabular-nums text-[#4338CA]">{n}.</span>
          <span className="[text-wrap:pretty]">{q.stem}</span>
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

function Results({ a, passMark }: { a: KcAttempt; passMark: number | null }) {
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
      <ol className="mt-5 grid gap-6">
        {a.questions.map((q, i) => <ResultCard key={q.qid} n={i + 1} q={q} />)}
      </ol>
    </section>
  );
}

function ResultCard({ n, q }: { n: number; q: KcResultQuestion }) {
  return (
    <li data-kc-r={n} className="grid gap-2.5">
      <p className="flex gap-2.5 text-[15px] font-semibold leading-[1.5] text-[#111827]">
        <span className="shrink-0 tabular-nums text-[#4338CA]">{n}.</span>
        <span className="[text-wrap:pretty]">{q.stem}</span>
        <Icon name={q.correct ? "checkCircle" : "xCircle"} size={18} className={`ml-auto mt-0.5 shrink-0 ${q.correct ? "text-[#15803D]" : "text-[#B45309]"}`} aria-label={q.correct ? "Right" : "Not right"} />
      </p>
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
              <span className="mt-1.5 block text-[13.5px] leading-[1.55] text-[#374151]"><strong className="font-semibold text-[#111827]">Why: </strong>{q.reasons[d]}</span>
            </span>
          </div>
        );
      })}
    </li>
  );
}

// The time allowed is the pack's, shown as a guide and not enforced: an open-book check is not cut off mid-answer.
// The start of an attempt is kept per browser, so a reload does not reset the clock.
const startKey = (id: string, n: number) => `grc101.kc.${id}.${n}.start`;
function forgetStart(id: string, n: number) {
  try {
    localStorage.removeItem(startKey(id, n));
  } catch {
    /* storage blocked: nothing was kept */
  }
}

function Timer({ id, attempt, minutes }: { id: string; attempt: number; minutes: number }) {
  const [began] = useState(() => {
    try {
      const v = Number(localStorage.getItem(startKey(id, attempt)));
      if (v) return v;
      localStorage.setItem(startKey(id, attempt), String(Date.now()));
    } catch {
      /* storage blocked: the clock starts at this render */
    }
    return Date.now();
  });
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const left = Math.round((began + minutes * 60_000 - now) / 1000);
  const mm = Math.floor(Math.abs(left) / 60), ss = String(Math.abs(left) % 60).padStart(2, "0");
  return (
    <p data-kc="timer" className={`mt-4 inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-[12.5px] tabular-nums ${left < 0 ? "border-[#FCD34D] bg-[#FFFBEB] text-[#92400E]" : "border-[#E3E5EA] bg-[#F7F8FA] text-[#3F4757]"}`}>
      <Icon name="clock" size={14} />
      {left >= 0 ? `${mm}:${ss} of ${minutes} minutes left` : `${mm}:${ss} over the ${minutes} minutes allowed. You can still submit.`}
    </p>
  );
}

/** Opens a check as the desk's screen: desk-app.tsx follows the address. */
export const openKc = (id: string) => {
  location.hash = kcHash(id);
};

/** A check's standing in one chip: its best score, Open, or Not open yet (with the reason as its title). */
export function KcChip({ id }: { id: string }) {
  const { desk, progress } = useDesk();
  const s = kcStatus(desk, progress, id);
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
