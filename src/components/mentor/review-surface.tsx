"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { StepBrief } from "@/components/app/deliverable";
import { Gloss } from "@/components/app/glossary";
import { RefBody } from "@/components/app/reference-material";
import { ControlReferences } from "@/components/app/control-references";
import { CONTROLS_BY_TASK } from "@/lib/controls";
import { FloatWindow } from "@/components/ui/float-window";
import { useMenteeGates } from "@/components/mentor/mentee-gates";
import { useDeskFilter, useMenteeTree } from "@/components/mentor/desk-context";
import {
  GATE_STATE,
  reviewable,
  stateOf,
  tabsFor,
  type GateState,
  type GateStateDef,
} from "@/components/mentor/gate-states";
import { ReviewDecision, useReviewCard } from "@/components/mentor/review-card";
import {
  CommentableSubmission,
  addressedAnchors,
  requiredAnchors,
} from "@/components/mentor/commentable-submission";
import { formatSubmitted, mentorApi, OUTCOME_LABEL } from "@/lib/mentor";
import type { Card, MenteeGate, ReviewComment } from "@/lib/mentor";
import type { LearningTask } from "@/lib/learnings";
import type { TaskReference } from "@/lib/taskmeta";

/**
 * One delivery, as a reviewer works it: the pipeline it has reached, the four verdicts, the brief
 * the mentee worked to, and every part they wrote with its own verdict.
 *
 * This is the *only* part of the Review Desk that a click replaces. Everything above it — the
 * console chrome, the mentee strip, the organisation strip, the record bar — is mounted by the
 * layouts in `app/mentor/(console)/desk/`, so moving between mentees, organisations and steps
 * leaves all of it standing and reloads just this section, with its own skeleton. Held here
 * instead, as it was, every click unmounted the whole console and blanked the screen to "Loading
 * the console…".
 *
 * What is on screen is identified entirely by the URL (`/mentor/desk/:mentee/:activity`), so a
 * reviewer can bookmark a delivery, and the Dashboard board and the old card links resolve without
 * a second routing scheme.
 */
export function ReviewSurface() {
  const router = useRouter();
  const { menteeId, activityId } = useParams<{ menteeId: string; activityId?: string }>();
  const { gates, byActivity, refresh, loading: gatesLoading, menteeName, noteStarted } =
    useMenteeGates();
  const { taskOf, orgOf } = useMenteeTree();

  const [refsOpen, setRefsOpen] = useState(false);
  const [ctrlOpen, setCtrlOpen] = useState(false);
  const [histOpen, setHistOpen] = useState(false);
  // The review lives here and nowhere else until the decision writes it — at the surface rather
  // than inside the delivery because the pipeline bar reads it too. Seeded empty rather than from
  // the card: `card.comments` were sent with a previous decision, and echoing them into this
  // reviewer's working set would send them a second time.
  const [marks, setMarks] = useState<ReviewComment[]>([]);

  const gate = activityId ? (byActivity.get(activityId) ?? null) : null;
  const task = gate ? (taskOf.get(gate.taskCode) ?? null) : null;

  // What the state tabs and the step row are showing. The tab defaults to the first one holding
  // work rather than to a fixed choice, so a reviewer never lands on an empty list and has to hunt
  // past it — but once they pick, their pick stands.
  const { orgId, tab, setTab, expanded, setExpanded } = useDeskFilter();
  // With nothing chosen the bands are the page — there is nothing else to show.
  const bands = !activityId || expanded;
  const tabs = useMemo(() => tabsFor(gates), [gates]);
  const activeTab: GateState =
    tab ??
    (tabs.find((t) => t.def.id === "submitted" && t.count > 0)?.def.id ??
      tabs.find((t) => t.count > 0)?.def.id ??
      "submitted");

  const steps = useMemo(
    () =>
      gates.filter(
        (g) =>
          reviewable(g) &&
          stateOf(g) === activeTab &&
          (orgId === "all" || orgOf.get(g.taskCode)?.id === orgId),
      ),
    [gates, activeTab, orgId, orgOf],
  );

  const { card, loadError } = useReviewCard(gate?.submissionId ?? null);

  // A new submission is a new review. Reset during render rather than in an effect, so the
  // previous delivery's verdicts are never on screen against this one's parts.
  const [markedSub, setMarkedSub] = useState(gate?.submissionId ?? null);
  if ((gate?.submissionId ?? null) !== markedSub) {
    setMarkedSub(gate?.submissionId ?? null);
    setMarks([]);
  }

  const outstanding = card
    ? requiredAnchors(card).filter((a) => !addressedAnchors(marks).has(a)).length
    : 0;

  // The first verdict on any part is what puts the step under "In progress" — the only trace a
  // review in progress leaves, since the verdicts themselves stay in the browser until a decision.
  // Merely opening the card used to do it, which marked a step started when a reviewer had done no
  // more than glance at whether it was worth picking up.
  //
  // Fire-and-forget: it must not interrupt the reviewer mid-markup, and a failure costs nothing
  // worse than the step still reading as Submitted until they decide it.
  const startedSub =
    gate?.state === "awaiting" && !gate.started && marks.length > 0 ? gate.submissionId : null;
  useEffect(() => {
    if (startedSub === null) return;
    mentorApi
      .markStarted(startedSub)
      .then(() => noteStarted(startedSub))
      .catch(() => {});
  }, [startedSub, noteStarted]);

  const go = (a: string) => router.push(`/mentor/desk/${menteeId}/${a}`);

  /**
   * Land on the first step rather than on an invitation to pick one.
   *
   * A reviewer opening a learner is going to open a step; making them choose one first is a click
   * that only ever has one sensible answer, and the empty record area beside a full step row read
   * as though something had failed to load. The first step of the current tab is the one the tab
   * ordering already says is most worth doing.
   *
   * `router.replace`, not `history.replaceState`: this changes the route segment rather than a
   * search param, so the child page has to actually mount. Replace so that Back leaves the desk
   * instead of returning to a page that would immediately forward again.
   */
  useEffect(() => {
    if (activityId || gatesLoading || steps.length === 0) return;
    router.replace(`/mentor/desk/${menteeId}/${steps[0].activityId}`);
  }, [activityId, gatesLoading, steps, menteeId, router]);

  // A new step starts at the top of its own deliverable, not wherever the last one was left.
  // The console shell owns the only scroller on the page, so this reaches for it by name rather
  // than keeping one of its own.
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    root.current?.closest("main")?.scrollTo({ top: 0 });
  }, [activityId]);

  return (
    <div ref={root}>
      {bands && (
        <>
          <TabStrip tabs={tabs} activeTab={activeTab} onTab={setTab} />
          <StepRow
            steps={steps}
            activeId={activityId ?? null}
            taskOf={taskOf}
            onPick={go}
            emptyHint={GATE_STATE[activeTab].hint}
          />
        </>
      )}

      <Toolbar
        gate={gate}
        card={card}
        task={task}
        menteeName={menteeName}
        bands={bands}
        canCollapse={!!activityId}
        onToggleBands={() => setExpanded(!expanded)}
        steps={steps}
        activeId={activityId ?? null}
        onPick={go}
        outstanding={outstanding}
        total={card ? requiredAnchors(card).length : 0}
        marks={marks}
        onDecided={refresh}
        onHistory={() => setHistOpen(true)}
      />

      <div className="bg-[#f7f8fa] p-4">
        <div className="mx-auto max-w-[1240px] rounded-lg border border-[#e6eaf0] bg-white">
          {gate && <Heading card={card} gate={gate} task={task} menteeName={menteeName} />}

          <div className="px-6 py-5">
            {gatesLoading ? (
              <Skeleton />
            ) : !activityId ? (
              <Empty
                title="Pick a step to review"
                body="Their work is in the row above, sorted by what you can do about it."
              />
            ) : !gate ? (
              <Empty
                title="Nothing to review here"
                body="This step is not a gate on this learner's programme, or it is not one you review."
              />
            ) : gate.submissionId === null ? (
              <Empty
                title="Nothing submitted yet"
                body={`${menteeName || "This mentee"} has not delivered ${stepName(gate)} yet.`}
              />
            ) : loadError ? (
              <div className="rounded-lg border border-[#f0c2c2] bg-[#fdecec] px-4 py-3 text-[12.5px] text-[#a31d1d]">
                {loadError}
              </div>
            ) : !card ? (
              <Skeleton />
            ) : (
              <Delivery
                card={card}
                onRefs={() => setRefsOpen(true)}
                onControls={() => setCtrlOpen(true)}
                menteeName={menteeName}
                marks={marks}
                setMarks={setMarks}
              />
            )}
          </div>
        </div>
      </div>

      {refsOpen && card?.brief && (
        <FloatWindow
          title="Reference material"
          sub={card.taskName}
          icon="paperclip"
          width={460}
          height={520}
          onClose={() => setRefsOpen(false)}
        >
          <RefPane references={card.brief.references} />
        </FloatWindow>
      )}
      {ctrlOpen && card && (
        <FloatWindow
          title="Control references"
          sub={card.taskName}
          icon="shield"
          width={520}
          height={620}
          onClose={() => setCtrlOpen(false)}
        >
          <ControlReferences taskCode={card.taskCode} />
        </FloatWindow>
      )}
      {histOpen && card && (
        <FloatWindow
          title={`History — ${card.menteeName}`}
          sub={`${card.orgName} · ${card.taskName}`}
          icon="history"
          width={420}
          height={520}
          onClose={() => setHistOpen(false)}
        >
          <History card={card} />
        </FloatWindow>
      )}
    </div>
  );
}

/** What the content column shows while the gate map is still in flight. */
export function DeskSectionSkeleton() {
  return (
    <div className="bg-[#f7f8fa] p-4">
      <div className="mx-auto max-w-[1240px] rounded-lg border border-[#e6eaf0] bg-white px-6 py-5">
        <Skeleton />
      </div>
    </div>
  );
}


/**
 * The four review states, as a tab strip.
 *
 * They replaced a five-stage progress pipeline — Submitted → In review → Changes → Approved →
 * Certified — that tracked a single gate. It answered "where is this one?" when a reviewer's
 * question is "what needs me?", and its last stage could never light up, because a certificate is
 * issued at 100% programme completion and not at a gate.
 *
 * A band of its own rather than a corner of the toolbar. Sharing a line with the four verdicts,
 * the progress pill and History, it wrapped onto a second row on a 1920px screen and left the
 * decision cluster floating in the middle of the bar — the tabs choose *what to look at* and the
 * verdicts say *what to do about it*, and two jobs on one line fit neither.
 */
function TabStrip({
  tabs,
  activeTab,
  onTab,
}: {
  tabs: { def: GateStateDef; count: number }[];
  activeTab: GateState;
  onTab: (v: GateState) => void;
}) {
  return (
    <div className="flex shrink-0 items-end gap-1 overflow-x-auto border-b border-[#e6eaf0] bg-white px-3">
      {tabs.map(({ def, count }) => {
        const on = def.id === activeTab;
        return (
          <button
            key={def.id}
            onClick={() => onTab(def.id)}
            title={def.hint}
            aria-pressed={on}
            className={`-mb-px flex shrink-0 items-center gap-2 border-b-2 px-3 py-2 text-[12.5px] transition-colors ${
              on
                ? "border-slate-900 font-semibold text-slate-900"
                : "border-transparent font-medium text-slate-500 hover:text-slate-800"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${def.dot}`} />
            {def.label}
            <span
              className={`rounded-full px-1.5 text-[11px] font-semibold tabular-nums ${
                on ? def.on : def.badge
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * The one row that is always on screen: where you are, and what you can do about it.
 *
 * Everything above it — the mentee strip, the organisations, the tabs, the step row — is how a
 * reviewer *finds* work, and collapses the moment they have found it. On a laptop those four
 * bands were more than half the window, so the deliverable being judged opened below the fold.
 * This is what remains: about 44px carrying the breadcrumb, the step stepper, the progress and the
 * verdicts.
 *
 * The stepper matters more than it looks. It walks the same filtered list the step row shows, so a
 * reviewer can work straight down "Submitted" without opening the pickers once — which is the
 * whole reason collapsing them is not a loss.
 */
function Toolbar({
  gate,
  card,
  task,
  menteeName,
  bands,
  canCollapse,
  onToggleBands,
  steps,
  activeId,
  onPick,
  outstanding,
  total,
  marks,
  onDecided,
  onHistory,
}: {
  gate: MenteeGate | null;
  card: Card | null;
  task: LearningTask | null;
  menteeName: string;
  bands: boolean;
  canCollapse: boolean;
  onToggleBands: () => void;
  steps: MenteeGate[];
  activeId: string | null;
  onPick: (activityId: string) => void;
  outstanding: number;
  total: number;
  marks: ReviewComment[];
  onDecided: () => void;
  onHistory: () => void;
}) {
  const at = steps.findIndex((g) => g.activityId === activeId);

  return (
    // Sticky, unlike the bands above it. Those are for finding work and may scroll away; this
    // carries the decision, and a reviewer who has just read to the bottom of a thirty-row
    // register should not have to scroll back to the top to record it.
    <div className="sticky top-0 z-20 flex items-center gap-2 border-b border-[#e6eaf0] bg-white px-3 py-1.5">
      {canCollapse && (
        <button
          onClick={onToggleBands}
          aria-pressed={bands}
          title={
            bands
              ? "Hide the pickers — they also come away as you scroll into the work"
              : "Show mentees, organisations and steps"
          }
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          <Icon name={bands ? "chevronUp" : "menu"} size={16} />
        </button>
      )}

      {/* Whose work, which task, which step — the one thing that must never be off screen. */}
      <div className="flex min-w-0 flex-1 items-center gap-1.5 text-[12px]">
        {gate ? (
          <>
            <span className="shrink-0 font-semibold text-slate-800">{menteeName || "…"}</span>
            <Icon name="chevronRight" size={12} className="shrink-0 text-slate-300" />
            <span className="hidden shrink-0 font-mono text-[11px] text-slate-400 sm:inline">
              {gate.taskCode}
            </span>
            <span className="hidden min-w-0 truncate text-slate-500 lg:inline">
              {task?.title ?? ""}
            </span>
            <Icon name="chevronRight" size={12} className="hidden shrink-0 text-slate-300 lg:inline" />
            <span className="min-w-0 truncate font-medium text-slate-900">{stepName(gate)}</span>
          </>
        ) : (
          <span className="text-slate-500">
            {steps.length} step{steps.length === 1 ? "" : "s"} to choose from
          </span>
        )}
      </div>

      {at >= 0 && steps.length > 1 && (
        <div className="flex shrink-0 items-center gap-1">
          <span className="hidden text-[11.5px] tabular-nums text-slate-400 sm:inline">
            {at + 1}/{steps.length}
          </span>
          <div className="flex">
            <button
              onClick={() => steps[at - 1] && onPick(steps[at - 1].activityId)}
              disabled={at === 0}
              aria-label="Previous step in this list"
              className="grid h-7 w-7 place-items-center rounded-l-md text-slate-600 ring-1 ring-slate-300 hover:bg-slate-50 disabled:text-slate-300"
            >
              <Icon name="chevronLeft" size={14} />
            </button>
            <button
              onClick={() => steps[at + 1] && onPick(steps[at + 1].activityId)}
              disabled={at === steps.length - 1}
              aria-label="Next step in this list"
              className="-ml-px grid h-7 w-7 place-items-center rounded-r-md text-slate-600 ring-1 ring-slate-300 hover:bg-slate-50 disabled:text-slate-300"
            >
              <Icon name="chevronRight" size={14} />
            </button>
          </div>
        </div>
      )}

      <div className="flex shrink-0 items-center gap-1.5">
        {card && total > 0 && <PartsProgress done={total - outstanding} total={total} />}
        {card && (
          <ReviewDecision
            card={card}
            onDecided={onDecided}
            outstanding={outstanding}
            marks={marks.map((m) => ({
              kind: m.kind,
              anchor: m.anchor,
              anchorLabel: m.anchorLabel,
              body: m.body,
            }))}
          />
        )}
        {card && (
          <button
            onClick={onHistory}
            title={`${card.history.length} previous decision${card.history.length === 1 ? "" : "s"} on this gate`}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-slate-900 px-2.5 py-1.5 text-[12px] font-semibold text-white hover:bg-slate-800"
          >
            <Icon name="history" size={13} />
            <span className="rounded-full bg-white/20 px-1.5 text-[10px] tabular-nums">
              {card.history.length}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * The steps in the chosen state, as a row rather than a rail.
 *
 * A rail down the left read well and cost the width the deliverable needs — a register of a dozen
 * columns is the thing being judged, and squeezing it to make room for a list you consult between
 * steps is the wrong trade. A row scrolls sideways, which a list of steps tolerates and a table of
 * findings does not.
 *
 * Each chip leads with its task code, because the same gate name recurs across tasks and the code
 * is the only thing that tells two of them apart at a glance.
 */
/** The narrowest a chip may be before the row shows one fewer, and the gap between two. */
const MIN_CHIP = 224;
const CHIP_GAP = 6;

/**
 * The steps in the chosen state, a screenful at a time.
 *
 * Paginated, not scrolled. It was a scroller with its own arrows and the native bar hidden by CSS,
 * which is a promise the browser does not have to keep: `scrollbar-width` is recent, overlay-vs-
 * classic bars differ by platform, and a hidden bar still leaves a scrollable box that a trackpad
 * or a shift-wheel can slide half a chip sideways. Rendering only the current page means there is
 * nothing to scroll — no overflow, so no bar to hide and no half-chip to land on, on any browser.
 *
 * How many fit is measured, not fixed: the row shows as many whole chips as the window allows and
 * they share the width evenly, so the page is always exactly full.
 */
function StepRow({
  steps,
  activeId,
  taskOf,
  onPick,
  emptyHint,
}: {
  steps: MenteeGate[];
  activeId: string | null;
  taskOf: Map<string, LearningTask>;
  onPick: (activityId: string) => void;
  emptyHint: string;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [perPage, setPerPage] = useState(0);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    // Floor, never round: rounding up is how a chip ends up narrower than it can be read at.
    const measure = () =>
      setPerPage(Math.max(1, Math.floor((el.clientWidth + CHIP_GAP) / (MIN_CHIP + CHIP_GAP))));
    // In a frame, not in the effect body: the row has to be laid out before it can be measured,
    // and a synchronous setState here is a cascading render for a value that is not final yet.
    const first = requestAnimationFrame(measure);
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      cancelAnimationFrame(first);
      ro.disconnect();
    };
    // Not `[]`: the element being measured does not exist until the gates land, so a
    // mount-only effect finds nothing and never runs again — leaving one chip per page forever.
  }, [steps]);

  const size = perPage || 1;
  const pages = Math.max(1, Math.ceil(steps.length / size));
  const [page, setPage] = useState(0);

  // Re-derive the page whenever the selection, the list or the window changes — never on a manual
  // turn, so paging ahead to look at what is coming stays where the reviewer put it. Reset during
  // render rather than in an effect, so a page is never painted before being corrected.
  const key = `${activeId}|${steps.length}|${size}`;
  const [prevKey, setPrevKey] = useState(key);
  if (prevKey !== key) {
    setPrevKey(key);
    const at = steps.findIndex((g) => g.activityId === activeId);
    setPage(at >= 0 ? Math.floor(at / size) : 0);
  }

  const here = Math.min(page, pages - 1);
  const shown = steps.slice(here * size, here * size + size);

  if (steps.length === 0) {
    return (
      <div className="border-b border-[#e6eaf0] bg-slate-50/60 px-4 py-2.5 text-[11.5px] text-slate-500">
        {emptyHint}
      </div>
    );
  }

  const arrow = (enabled: boolean) =>
    `grid h-9 w-9 shrink-0 place-items-center rounded-lg border transition-colors ${
      enabled
        ? "border-slate-300 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-900"
        : "border-slate-200 bg-slate-50 text-slate-300"
    }`;

  return (
    <div className="flex items-center gap-1.5 border-b border-[#e6eaf0] bg-slate-50/60 px-3 py-2">
      <button
        onClick={() => setPage(here - 1)}
        disabled={here === 0}
        aria-label="Previous steps"
        className={arrow(here > 0)}
      >
        <Icon name="chevronLeft" size={16} />
      </button>

      {/* No overflow of any kind on this element or its child: that is the whole point. */}
      <div ref={track} className="flex min-w-0 flex-1 items-stretch gap-1.5">
        {shown.map((g) => {
          const on = g.activityId === activeId;
          const def = GATE_STATE[stateOf(g)];
          return (
            <button
              key={g.activityId}
              onClick={() => onPick(g.activityId)}
              aria-current={on ? "page" : undefined}
              title={`${taskOf.get(g.taskCode)?.title ?? g.taskCode} — ${stepName(g)}`}
              className={`flex min-w-0 flex-1 items-center gap-2 rounded-lg border py-1.5 pl-2.5 pr-3 text-left transition-colors ${
                on
                  ? "border-indigo-500 bg-white shadow-[0_0_0_3px_rgba(99,102,241,0.15)]"
                  : "border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50"
              }`}
            >
              <span className={`h-2 w-2 shrink-0 rounded-full ${def.dot}`} />
              <span className="min-w-0 leading-tight">
                <span className="block font-mono text-[10px] text-slate-400">
                  {g.taskCode} &middot; {g.activityCode}
                </span>
                <span
                  className={`block truncate text-[12px] ${
                    on ? "font-semibold text-slate-900" : "font-medium text-slate-700"
                  }`}
                >
                  {stepName(g)}
                </span>
              </span>
            </button>
          );
        })}
        {/* Keeps the last page's chips the same width as every other page's, rather than letting
            two survivors stretch across the whole row. */}
        {Array.from({ length: Math.max(0, size - shown.length) }).map((_, i) => (
          <span key={`pad${i}`} className="min-w-0 flex-1" aria-hidden="true" />
        ))}
      </div>

      <button
        onClick={() => setPage(here + 1)}
        disabled={here >= pages - 1}
        aria-label="More steps"
        className={arrow(here < pages - 1)}
      >
        <Icon name="chevronRight" size={16} />
      </button>

      <span className="shrink-0 pl-1 text-[11px] tabular-nums text-slate-400">
        {here + 1}/{pages}
      </span>
    </div>
  );
}

/**
 * How much of the delivery has been decided.
 *
 * It replaced the words "2 PARTS STILL TO DECIDE" sitting beside four greyed-out buttons, which
 * read as something broken rather than something not finished yet. A filling bar says the same
 * thing as progress, and turns green at the moment the verdicts become available — so the reason
 * they were disabled and the moment they stop being disabled are the same object.
 */
function PartsProgress({ done, total }: { done: number; total: number }) {
  const complete = done >= total;
  return (
    <span
      title={
        complete
          ? "Every part has a verdict — the delivery can be decided."
          : `${total - done} of ${total} parts still need a verdict before you can decide the delivery.`
      }
      className={`inline-flex shrink-0 items-center gap-2 rounded-md px-2 py-1 text-[11.5px] font-semibold ${
        complete ? "bg-[#f2f9f5] text-[#1e7a46]" : "bg-slate-100 text-slate-600"
      }`}
    >
      <span className="tabular-nums">
        {done}/{total}
      </span>
      <span className="hidden h-1.5 w-12 overflow-hidden rounded-full bg-black/10 sm:block">
        <span
          className={`block h-full rounded-full transition-[width] duration-300 ${
            complete ? "bg-[#1e7a46]" : "bg-slate-400"
          }`}
          style={{ width: `${total ? (done / total) * 100 : 0}%` }}
        />
      </span>
    </span>
  );
}

function Heading({
  card,
  gate,
  task,
  menteeName,
}: {
  card: Card | null;
  gate: MenteeGate | null;
  task: LearningTask | null;
  menteeName: string;
}) {
  return (
    <div className="px-6 pb-4 pt-5">
      <div className="flex flex-wrap items-start gap-4">
        <div className="min-w-0 flex-1 basis-[260px]">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            {card && (
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-indigo-700">
                {card.verbFamily}
              </span>
            )}
            {card && (
              <span className="text-[11.5px] text-slate-500">
                {card.entries.length} part{card.entries.length === 1 ? "" : "s"} delivered ·
                revision {card.revision}
              </span>
            )}
          </div>
          <h1 className="text-[24px] font-semibold leading-tight tracking-[-0.02em] text-slate-900">
            {card?.activityTitle ?? (gate ? stepName(gate) : null) ?? task?.title ?? "…"}
          </h1>
          <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-1.5">
            {/* A reviewer deep in a thirty-row register with no name in front of them has nothing
                to catch the mistake of reading the wrong person's answers, and every deliverable
                looks the same whoever wrote it. The strip that would otherwise say so collapses;
                this does not. */}
            <Meta label="Mentee">{menteeName || "—"}</Meta>
            <Rule />
            <Meta label="Task">{task?.title ?? "—"}</Meta>
            <Rule />
            <Meta label="Reviewer role">{card?.reviewerRole ?? "—"}</Meta>
            <Rule />
            <Meta label="Standard">
              <span className="font-mono text-[12px]">{task?.standards ?? "—"}</span>
            </Meta>
            <Rule />
            <Meta label="Submitted">{card ? formatSubmitted(card.submittedAt) : "—"}</Meta>
          </div>
        </div>
      </div>
    </div>
  );
}

const Rule = () => <span className="h-3.5 w-px bg-slate-200" />;

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className="text-[10.5px] font-semibold uppercase tracking-[0.09em] text-slate-400">
        {label}
      </span>
      <span className="text-[12.5px] text-slate-700">{children}</span>
    </span>
  );
}

/**
 * The delivery: the brief the mentee worked to, every part they wrote with its own verdict, and
 * the verdict on the whole underneath.
 *
 * The parts and the delivery decision are one act — the verdicts are drafts until the decision
 * releases them — so the button that sends them sits directly under the thing being decided.
 */
function Delivery({
  card,
  onRefs,
  onControls,
  menteeName,
  marks,
  setMarks,
}: {
  card: Card;
  onRefs: () => void;
  onControls: () => void;
  menteeName: string;
  marks: ReviewComment[];
  setMarks: React.Dispatch<React.SetStateAction<ReviewComment[]>>;
}) {
  const checks = card.brief?.whatToDo ?? [];
  const deliveryRef = useRef<HTMLDivElement>(null);
  const atTheWork = useReachedOnce(deliveryRef, card.submissionId);
  const [pref, setPref] = useState<ChecksPref>("auto");

  // Reset during render when the step changes, not in an effect: an effect-time reset would leave
  // the previous step's answer standing for a frame under this step's checks.
  const [prevSub, setPrevSub] = useState(card.submissionId);
  if (card.submissionId !== prevSub) {
    setPrevSub(card.submissionId);
    setPref("auto");
  }

  // "auto" defers to where the reviewer has scrolled; the other two are their explicit answer.
  const showing = pref === "open" || (pref === "auto" && atTheWork);

  return (
    <div>
      {card.brief && (
        <StepBrief
          objective={card.brief.objective}
          // The checklist is lifted out of the brief and into the rail below, so it is still on
          // screen at the thirtieth row of a register. Printing it in both places would make the
          // reviewer wonder which one they had already worked through.
          objectiveTitle="What they were asked for"
          // Open. It is what the delivery is being judged against, and a reviewer who has to press
          // "Show" before they can check anything will sometimes not press it.
          defaultOpen
        />
      )}

      {/* The two companions to a submission, opened the same way and each into its own window:
          what the mentee was told to produce, and what they were given to produce it from. */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {checks.length > 0 && (
          <ChecksButton count={checks.length} showing={showing} onSet={setPref} />
        )}
        {/* The controls the delivery is graded against. A reviewer was being asked whether the work
            traces back to its controls with no way to see them — the same panel the mentee reads,
            so the two are never judging against different words. */}
        {(CONTROLS_BY_TASK[card.taskCode]?.controls.length ?? 0) > 0 && (
          <button
            onClick={onControls}
            className="inline-flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1 text-[11.5px] font-semibold text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
          >
            <Icon name="shield" size={12} />
            Control references
            <span className="tabular-nums text-slate-400">{CONTROLS_BY_TASK[card.taskCode]!.controls.length}</span>
          </button>
        )}
        {card.brief && card.brief.references.length > 0 && (
          <button
            onClick={onRefs}
            className="inline-flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1 text-[11.5px] font-semibold text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
          >
            <Icon name="paperclip" size={12} />
            Reference material
            <span className="tabular-nums text-slate-400">{card.brief.references.length}</span>
          </button>
        )}
      </div>

      {checks.length > 0 && <ChecksWindow items={checks} showing={showing} onSet={setPref} />}

      <div
        ref={deliveryRef}
        className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500"
      >
        {menteeName ? `${menteeName.split(" ")[0]}'s delivery` : "The delivery"}
      </div>
      <CommentableSubmission card={card} comments={marks} onChange={setMarks} />
    </div>
  );
}

/**
 * The checks the work is measured against, in a window of their own.
 *
 * Five shapes preceded this, and each was ruled out by something measurable. A docked side panel —
 * Canvas SpeedGrader's answer, and the right one when a grader has the whole window — left the
 * delivery 462px at a 1097px viewport and did not dock at all below 1024; this console spends 336
 * of those pixels on its own sidebar before the review starts. A pinned bar cost no width but
 * could not stop growing with the content: 630 checklists across the programme run 2-8 items and
 * 142 characters at the median but 941 at the worst, one item reaching 312.
 *
 * A floating window has neither problem. It costs nothing from the layout at all, it can be
 * dragged off whatever it covers, it resizes for the long ones, and it is closed when it is not
 * wanted. It is also how this console already shows the other thing a reviewer holds up against
 * the work — the reference material — so it is one interaction, not two.
 *
 * It is something to read, so it is set as something to read: numbered, hanging-indented, ruled
 * between items, and in the console's own greys. It carried checkbox markers for a while — first
 * tickable, then not — and an unticked box a reviewer cannot tick is a control that does nothing,
 * which is worse than no control. A tally would also have been the wrong idea underneath: what the
 * programme keeps is the verdict and its note, and boxes ticked beside them would read as though a
 * gate had been approved BECAUSE eight of them were ticked.
 *
 * It arrives when the reviewer does. At the top of a card they are reading the brief, not marking
 * anything, and a window over that is in the way; it opens once the delivery itself is on screen,
 * which is the point the checks start being useful. Closing it is the reviewer overruling that,
 * and nothing reopens it except the button. Three states, not two — auto, open, closed — because
 * "has not decided yet" and "has decided against" must not collapse into the same value, or
 * scrolling would undo the close.
 *
 * All three are per VISIT, and deliberately not stored anywhere. Closing this step's checks says
 * "I have read these", which is true of this reading of this step and of nothing else: the next
 * step has different checks, and coming back to this one is a fresh look at it. Remembered
 * globally — the first version — one close meant the window never appeared again on any card.
 * Remembered per submission it would still have gone quiet on the second visit to a step, which
 * is exactly when a reviewer returning to finish something wants the checks back.
 *
 * One control to dismiss it, not two. FloatWindow's fold is off here: a second way to make a
 * window go away is one too many when reopening it is a single click.
 */
type ChecksPref = "auto" | "open" | "closed";

/**
 * True once the reviewer has scrolled far enough to reach the delivery, and true from then on.
 *
 * An observer rather than a scroll handler: the question is "has this element come into the frame",
 * which IntersectionObserver answers directly and a scroll listener can only recompute on every
 * frame from numbers it has to measure itself.
 *
 * Two details, both learned by watching it get them wrong. The bottom inset means the delivery
 * counts as reached when it rises into the upper part of the screen, not when its first pixel
 * appears at the very bottom — on an 864px viewport the heading is already visible at page load,
 * so without it the window opened before the reviewer had scrolled anywhere. And it LATCHES: the
 * first version tracked visibility, so the window vanished the moment the heading scrolled off the
 * top, which is precisely when a reviewer is deepest in the work and most wants it.
 *
 * The latch resets per submission, so the next card starts from the top again.
 */
function useReachedOnce(ref: React.RefObject<HTMLElement | null>, resetKey: number): boolean {
  const [seen, setSeen] = useState(false);

  // Reset during render, not in an effect: an effect-time reset would leave the previous card's
  // answer on screen for a frame under the new card's heading.
  const [prevKey, setPrevKey] = useState(resetKey);
  if (resetKey !== prevKey) {
    setPrevKey(resetKey);
    setSeen(false);
  }

  useEffect(() => {
    if (seen) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setSeen(true);
      },
      { rootMargin: "0px 0px -40% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, seen, resetKey]);

  return seen;
}

/**
 * What to call a step.
 *
 * The register names a gate by the acceptance statement it checks — "Apply the organisation's
 * classification scheme (Public ‣ Internal ‣ Confidential ‣ Restricted) to every asset, working by
 * data-subject category." The card, and the learner's own step list, name it by its title —
 * "Apply Public / Internal / Confidential classification". Those differ on 66 of the 70 gates, so
 * the step picker was labelling a step one way and the card another, and a reviewer telling a
 * mentee which step they meant had two names to choose from.
 *
 * The title wins: it is short enough to pick out of a row of chips, and it is the name the mentee
 * already uses. The acceptance statement is what the gate CHECKS, not what the step IS.
 */
const stepName = (g: { activityTitle?: string; gateName: string }) =>
  g.activityTitle?.trim() || g.gateName;

/** Reopens the window, and shows it is there to reopen. Sits beside Reference material. */
function ChecksButton({
  count,
  showing,
  onSet,
}: {
  count: number;
  showing: boolean;
  onSet: (p: ChecksPref) => void;
}) {
  return (
    <button
      onClick={() => onSet(showing ? "closed" : "open")}
      aria-pressed={showing}
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11.5px] font-semibold ring-1 transition-colors ${
        showing
          ? "bg-indigo-50 text-indigo-700 ring-indigo-200"
          : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"
      }`}
    >
      <Icon name="list" size={12} />
      What to check
      <span className={`tabular-nums ${showing ? "text-indigo-400" : "text-slate-400"}`}>
        {count}
      </span>
    </button>
  );
}

function ChecksWindow({
  items,
  showing,
  onSet,
}: {
  items: string[];
  showing: boolean;
  onSet: (p: ChecksPref) => void;
}) {
  if (!showing) return null;

  return (
    // No height: the window hugs its content, and FloatWindow's own cap and inner scroll take over
    // when the content is longer than the screen — which at 941 characters it can be.
    <FloatWindow
      title="What to check"
      icon="list"
      width={420}
      foldable={false}
      onClose={() => onSet("closed")}
    >
      {/* Numbered, because these really are the mentee's steps in order — the numbering is the
          content's own, not decoration added to it, and it gives a reviewer a way to say which
          check failed. Hairlines rather than boxes: eight items need separating, and a rule does
          that with one pixel where a card does it with four borders and a fill.
          The number sits in its own column so wrapped lines align under the text, not under the
          digit — a hanging indent is what makes a long item read as one item. */}
      <ol className="divide-y divide-slate-100">
        {items.map((c, i) => (
          <li key={i} className="flex gap-3 py-2.5 first:pt-0.5 last:pb-0.5">
            <span
              aria-hidden
              className="w-4 shrink-0 pt-[2px] text-right text-[11px] font-medium tabular-nums text-slate-400"
            >
              {i + 1}
            </span>
            <span
              className="min-w-0 flex-1 text-[12.5px] leading-relaxed text-slate-700"
              style={{ textWrap: "pretty" }}
            >
              <Gloss>{c}</Gloss>
            </span>
          </li>
        ))}
      </ol>
    </FloatWindow>
  );
}

/**
 * The reference documents, read inside the window that opened them.
 *
 * `ReferenceMaterial` — what the learner's desk uses — is a list whose cards open a right-side
 * drawer. That is right on a full page and wrong here: the float window IS the panel, so a card
 * inside it that opens a second panel over the top covers the very work the reference is being
 * held up against, which is the one thing the float window exists to avoid.
 *
 * A single document opens straight into its body; there is nothing to choose between.
 */
function RefPane({ references }: { references: TaskReference[] }) {
  const [open, setOpen] = useState<TaskReference | null>(
    references.length === 1 ? references[0] : null,
  );

  if (open) {
    return (
      <div>
        {references.length > 1 && (
          <button
            onClick={() => setOpen(null)}
            className="mb-3 inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-indigo-600 hover:text-indigo-800"
          >
            <Icon name="chevronLeft" size={13} />
            All {references.length} documents
          </button>
        )}
        <div className="text-[9.5px] font-semibold uppercase tracking-[0.08em] text-slate-500">
          {open.kind}
        </div>
        <h3 className="mb-3 text-[14px] font-semibold tracking-tight text-slate-900">
          {open.title}
        </h3>
        <RefBody text={open.body} kind={open.kind} />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {references.map((r) => (
        <button
          key={r.id}
          onClick={() => setOpen(r)}
          className="group flex w-full items-center gap-3 rounded-xl bg-white px-3.5 py-3 text-left ring-1 ring-slate-200 transition-colors hover:bg-slate-50"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
            <Icon name="book" size={16} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-[13px] font-medium tracking-tight text-slate-900">{r.title}</span>
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                {r.kind}
              </span>
            </span>
            <span className="mt-0.5 block text-[12px] tracking-tight text-slate-500">
              {r.summary}
            </span>
          </span>
          <Icon
            name="arrowRight"
            size={15}
            className="shrink-0 text-slate-300 group-hover:text-indigo-500"
          />
        </button>
      ))}
    </div>
  );
}

function History({ card }: { card: Card }) {
  if (card.history.length === 0)
    return <p className="text-[12.5px] text-slate-500">Nothing decided here yet.</p>;
  return (
    <ol className="space-y-3">
      {card.history.map((h, i) => (
        <li key={i} className="border-l-2 border-slate-200 pl-3">
          <div className="text-[12px] font-semibold text-slate-800">
            {OUTCOME_LABEL[h.outcome]}
          </div>
          <div className="text-[11px] text-slate-500">
            {h.mentorName} · {formatSubmitted(h.decidedAt)}
          </div>
          {h.note && (
            <p className="mt-1 whitespace-pre-wrap text-[12px] leading-relaxed text-slate-700">
              {h.note}
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}

function Empty({ title, body }: { title: string; body: string }) {
  return (
    <div className="py-14 text-center">
      <div className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-slate-100 text-slate-400">
        <Icon name="inbox" size={19} />
      </div>
      <div className="mt-3 text-[14px] font-semibold text-slate-800">{title}</div>
      <p className="mt-1 text-[12.5px] text-slate-500">{body}</p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="h-4 w-40 rounded bg-slate-200" />
      <div className="h-24 rounded-lg bg-slate-100" />
      <div className="h-4 w-28 rounded bg-slate-200" />
      <div className="h-16 rounded-lg bg-slate-100" />
    </div>
  );
}
