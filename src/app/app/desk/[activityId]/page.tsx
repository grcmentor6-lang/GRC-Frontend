"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { Card, Bar, Ring } from "@/components/ui/primitives";
import { DVerb } from "@/components/ui/dverb";
import { Drawer } from "@/components/ui/drawer";
import { DraggablePanel } from "@/components/ui/draggable-panel";
import { RefBody } from "@/components/app/reference-material";
import { VERBS } from "@/lib/verbs";
import { deskApi, type ActivityDetail, type ActivityPayload, type SubmitResponse, type Review, type SubmissionDetail, type Layer1Result } from "@/lib/desk";
import { ApiError } from "@/lib/api";
import { VerbWorkspace } from "@/components/app/workspaces";
import { VERB_FORMS, GENERIC_FORM, type FieldSpec } from "@/lib/verb-forms";
import { useDeskLearnings } from "@/components/app/desk-context";
import { ACTIVITY_CONTENT } from "@/lib/activity-content";
import { WORKSPACE_REFS } from "@/lib/workspace-refs";
import { StandardBanner } from "@/components/app/standards";
import type { TaskReference } from "@/lib/taskmeta";

function ReviewPanel({ review }: { review: Review }) {
  const pass = review.decision === "pass";
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Ring pct={(review.overallScore / 5) * 100} size={72} stroke={8}>
          <span className="text-[15px] font-semibold text-slate-900">{review.overallScore.toFixed(1)}</span>
        </Ring>
        <div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 h-6 rounded-full text-[11px] font-medium ring-1 ${pass ? "bg-emerald-50 text-emerald-700 ring-emerald-100" : "bg-amber-50 text-amber-700 ring-amber-100"}`}>
              <Icon name={pass ? "check" : "refresh"} size={12} /> {pass ? "Passed" : "Needs revision"}
            </span>
            <span className="text-[11px] text-slate-400">overall / 5</span>
          </div>
          <p className="text-[11.5px] text-slate-400 mt-1">Graded by {review.model}</p>
        </div>
      </div>

      <div className="space-y-3">
        {review.dimensions.map((d) => (
          <div key={d.id}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[12.5px] font-medium text-slate-700 tracking-tight">{d.label}</span>
              <span className="text-[11.5px] font-semibold text-slate-900 tabular-nums">{d.score.toFixed(1)}</span>
            </div>
            <Bar pct={(d.score / 5) * 100} tone={d.score >= 4.3 ? "emerald" : d.score >= 4 ? "indigo" : "amber"} />
            <p className="text-[11.5px] text-slate-500 mt-1 leading-relaxed tracking-tight" style={{ textWrap: "pretty" }}>{d.justification}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-violet-50/40 ring-1 ring-violet-100 p-3.5">
        <div className="flex items-center gap-1.5 mb-1.5 text-[11px] font-semibold tracking-[0.1em] uppercase text-violet-600">
          <Icon name="chat" size={12} /> Feedback
        </div>
        <p className="text-[12.5px] text-slate-700 leading-relaxed tracking-tight" style={{ textWrap: "pretty" }}>{review.feedback}</p>
      </div>
    </div>
  );
}

/** Reference documents as an inline accordion (used inside the Resources drawer — no nested drawers). */
// Remounted (via `key`) when the focused ref changes, so `openId` initialises to the focused doc.
function RefAccordion({ references, focusId }: { references: TaskReference[]; focusId?: string | null }) {
  const [openId, setOpenId] = useState<string | null>(focusId ?? references[0]?.id ?? null);
  return (
    <div className="space-y-2">
      {references.map((r) => {
        const isOpen = openId === r.id;
        return (
          <div key={r.id} className="rounded-xl ring-1 ring-slate-200/70 overflow-hidden bg-white">
            <button
              onClick={() => setOpenId(isOpen ? null : r.id)}
              className="w-full flex items-center gap-3 text-left px-3.5 py-3 hover:bg-slate-50 transition-colors"
            >
              <span className="w-8 h-8 rounded-lg bg-indigo-50 ring-1 ring-indigo-100 text-indigo-600 flex items-center justify-center shrink-0"><Icon name="book" size={15} /></span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 flex-wrap">
                  <span className="text-[13px] font-medium text-slate-900 tracking-tight">{r.title}</span>
                  <span className="text-[9.5px] font-semibold tracking-[0.08em] uppercase text-slate-500 bg-slate-100 rounded px-1.5 py-0.5">{r.kind}</span>
                </span>
                <span className="block text-[12px] text-slate-500 tracking-tight mt-0.5" style={{ textWrap: "pretty" }}>{r.summary}</span>
              </span>
              <Icon name="chevronDown" size={15} className={`text-slate-400 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
            {isOpen && <div className="px-3.5 pb-3.5 pt-1 border-t border-slate-100"><RefBody text={r.body} /></div>}
          </div>
        );
      })}
    </div>
  );
}

/** Non-empty test for a single form value (string, list, or table-row array). */
function isFilled(v: unknown): boolean {
  return Array.isArray(v)
    ? v.some((x) => (typeof x === "string" ? x.trim() !== "" : Object.values(x ?? {}).some((c) => String(c ?? "").trim() !== "")))
    : String(v ?? "").trim() !== "";
}

/** [criterion-keyword, form-token] pairs — tie an acceptance criterion to the input(s) that satisfy it. */
const CRITERION_CONCEPTS: [RegExp, RegExp][] = [
  [/role|owner|accountable|stakeholder|audience|named/, /role|owner|accountable|stakeholder|audience/],
  [/deadline|date|target|time/, /date|deadline|target|time/],
  [/citation|cited|cite|standard|control|reference|cross-?ref|evidence|source/, /cit|standard|control|refer|cross|evidence|source/],
  [/rationale|justification|justif/, /rational|justif/],
  [/question/, /question|guide|interview/],
  [/subject/, /subject/],
  [/purpose/, /purpose/],
  [/agenda/, /agenda/],
  [/confirmation|confirmed/, /confirm/],
  [/method/, /method/],
  [/formula/, /formula/],
  [/result/, /result/],
  [/summary/, /executive|summary/],
  [/decision|sign-?off|approval|approved/, /decision|signoff|sign-?off|approv/],
  [/cover/, /cover/],
  [/deck|uploaded|slide|artefact/, /deck|slide|artefact|link/],
  [/feedback|prior/, /feedback|prior/],
  [/revision/, /revision/],
  [/discrepan/, /discrepan/],
  [/flag/, /flag/],
  [/action|recommend/, /action|recommend/],
  [/\bask\b/, /\bask\b/],
  [/section/, /section/],
  [/item|rank|mapping|\blink|finding|dimension|register|asset|entr/, /item|rank|map|link|find|dimension|register|asset|entr|name/],
];

type Atom = { tokens: string; filled: boolean };

/** Flatten a verb form-spec + current values into matchable atoms (one per field, one per table column). */
function formAtoms(spec: FieldSpec[], values: Record<string, unknown>): Atom[] {
  const atoms: Atom[] = [];
  for (const f of spec) {
    const v = values[f.key];
    if ("columns" in f && f.columns) {
      const rows = Array.isArray(v) ? (v as Record<string, unknown>[]) : [];
      atoms.push({ tokens: `${f.key} ${f.label}`.toLowerCase(), filled: rows.some((r) => Object.values(r ?? {}).some((c) => String(c ?? "").trim() !== "")) });
      for (const c of f.columns) atoms.push({ tokens: `${c.key} ${c.label}`.toLowerCase(), filled: rows.some((r) => String(r?.[c.key] ?? "").trim() !== "") });
    } else {
      const type = "type" in f ? f.type : "";
      atoms.push({ tokens: `${f.key} ${f.label} ${type}`.toLowerCase(), filled: isFilled(v) });
    }
  }
  return atoms;
}

/** Provisional, client-side guess at whether a Layer-1 criterion is met by the current inputs. */
function criterionMet(criterion: string, atoms: Atom[], allFilled: boolean, anyFilled: boolean): boolean {
  const t = criterion.toLowerCase();
  if (/if applicable|if any|if rejected|where applicable|n\/a/.test(t)) return anyFilled; // conditional/optional
  const relevant = CRITERION_CONCEPTS.filter(([kw, atomRe]) => kw.test(t) && atoms.some((a) => atomRe.test(a.tokens)));
  if (relevant.length === 0) return allFilled; // quality checks we can't verify client-side → gate on completion
  return relevant.some(([, atomRe]) => atoms.some((a) => atomRe.test(a.tokens) && a.filled));
}

/** Live acceptance-criteria checklist (always expanded). Heuristic before submit; authoritative after.
 *  Pass `onClose` to show a dismiss (✕) button (used by the floating HUD). */
function AcceptanceChecklist({ criteria, spec, values, layer1, onClose }: {
  criteria: string[];
  spec: FieldSpec[];
  values: Record<string, unknown>;
  layer1?: Layer1Result | null;
  onClose?: () => void;
}) {
  const atoms = formAtoms(spec, values);
  const allFilled = spec.length > 0 && spec.every((f) => isFilled(values[f.key]));
  const anyFilled = atoms.some((a) => a.filled);
  // Once graded, defer to the backend's deterministic result (when it lines up 1:1 with the criteria).
  const graded = !!layer1 && layer1.checks.length === criteria.length;
  const states = criteria.map((c, i) => (graded ? layer1!.checks[i].passed : criterionMet(c, atoms, allFilled, anyFilled)));
  const met = states.filter(Boolean).length;
  const allMet = met === criteria.length;

  const pct = criteria.length ? (met / criteria.length) * 100 : 0;

  return (
    // Light, on-theme frosted glass: a brand indigo tint (the same language as the Brief cards) so it
    // separates from the white form without the white-on-white muddiness; blur + saturation keep it
    // glassy and soften whatever scrolls behind. Emerald shift once every check is met.
    <div className={`rounded-2xl overflow-hidden backdrop-blur-2xl backdrop-saturate-150 ring-1 [box-shadow:inset_0_1px_0_0_rgba(255,255,255,0.8),0_16px_44px_-14px_rgba(79,70,229,0.35)] ${allMet ? "bg-gradient-to-b from-emerald-50/85 to-emerald-100/80 ring-emerald-200/80" : "bg-gradient-to-b from-white/85 to-indigo-50/85 ring-indigo-200/70"}`}>
      {/* header */}
      <div className={`px-3.5 pt-3 pb-3 border-b ${allMet ? "border-emerald-200/60" : "border-indigo-100/80"}`}>
        <div className="flex items-center gap-2.5">
          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg shrink-0 ring-1 transition-colors ${allMet ? "bg-emerald-100 text-emerald-600 ring-emerald-200/70" : "bg-indigo-100 text-indigo-600 ring-indigo-200/70"}`}>
            <Icon name="checkSquare" size={15} />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-[12.5px] font-semibold tracking-tight text-slate-900 leading-tight">Acceptance criteria</h3>
            <p className="text-[10.5px] text-slate-500 tracking-tight leading-tight mt-px">{graded ? "From your last submission" : "Live — updates as you type"}</p>
          </div>
          <span className={`shrink-0 text-[12.5px] font-semibold tabular-nums ${allMet ? "text-emerald-600" : "text-slate-600"}`}>{met}<span className="text-slate-400 mx-px">/</span>{criteria.length}</span>
          {onClose && (
            <button onClick={onClose} aria-label="Hide acceptance criteria" className="focus-ring shrink-0 -mr-1 w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-900/5 transition-colors cursor-pointer">
              <Icon name="x" size={13} />
            </button>
          )}
        </div>
        <div className={`mt-2.5 h-1 rounded-full overflow-hidden ${allMet ? "bg-emerald-100" : "bg-indigo-100/80"}`}>
          <div className={`h-full rounded-full transition-all duration-500 ease-out ${allMet ? "bg-emerald-500" : "bg-indigo-500"}`} style={{ width: `${pct}%` }} />
        </div>
      </div>
      {/* rows */}
      <div className="p-1.5">
        {criteria.map((c, i) => {
          const ok = states[i];
          const failed = graded && !ok;
          return (
            <div key={i} className="flex items-start gap-2.5 px-2 py-1.5 rounded-lg">
              <span className={`mt-px w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0 transition-colors ${ok ? "bg-emerald-500 text-white" : failed ? "bg-rose-500 text-white" : "ring-[1.5px] ring-inset ring-slate-300 bg-white/70"}`}>
                {ok && <Icon name="check" size={11} strokeWidth={3.5} />}
                {failed && <Icon name="x" size={11} strokeWidth={3.5} />}
              </span>
              <span className={`text-[12px] leading-snug tracking-tight transition-colors ${ok ? "text-slate-700" : failed ? "text-rose-700 font-medium" : "text-slate-500"}`}>{c}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ActivityWorkspace() {
  const { activityId } = useParams<{ activityId: string }>();
  const { learnings, refresh: refreshTree } = useDeskLearnings();
  const [activity, setActivity] = useState<ActivityDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [values, setValues] = useState<Record<string, unknown>>({});
  const [notesVal, setNotesVal] = useState("");
  const [focusRefId, setFocusRefId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [history, setHistory] = useState<SubmissionDetail[]>([]);
  const [briefOpen, setBriefOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [briefShown, setBriefShown] = useState(true);
  // The criteria HUD stays closed until the user scrolls the deliverable into view (see observer below).
  const [criteriaHidden, setCriteriaHidden] = useState(true);
  const deliverableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    deskApi.submissions(activityId).then((h) => !cancelled && setHistory(h)).catch(() => {});
    deskApi.activity(activityId)
      .then((a) => {
        if (cancelled) return;
        setActivity(a);
        if (a.draft) {
          setValues(a.draft.fields ?? {});
          setNotesVal(a.draft.notes ?? "");
        }
      })
      .catch((e) => !cancelled && setLoadError(e instanceof ApiError ? e.message : "Couldn't load this activity."))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [activityId]);

  // Reveal the criteria HUD once the deliverable scrolls into view; keep it closed (chip) before then.
  // Re-attaches when the deliverable card mounts (after the activity loads).
  useEffect(() => {
    const el = deliverableRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => setCriteriaHidden(!entry.isIntersecting),
      { rootMargin: "-80px 0px -25% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [activity]);

  const payload = (): ActivityPayload => ({ fields: values, notes: notesVal, attachments: [] });
  const openRef = (id?: string) => { setFocusRefId(id ?? null); setBriefOpen(true); };
  const hasContent = notesVal.trim() !== "" || Object.entries(values).some(([, v]) =>
    Array.isArray(v) ? v.some((x) => (typeof x === "string" ? x.trim() : Object.values(x ?? {}).some(Boolean))) : String(v ?? "").trim() !== "",
  );

  const saveDraft = async () => {
    setBusy(true); setError(null);
    try {
      await deskApi.saveDraft(activityId, payload());
      setSavedAt(new Date().toLocaleTimeString());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save draft.");
    } finally { setBusy(false); }
  };

  const submit = async () => {
    setBusy(true); setError(null); setResult(null);
    try {
      const res = await deskApi.submit(activityId, payload());
      setResult(res);
      setFeedbackOpen(true); // surface the graded result immediately
      deskApi.submissions(activityId).then(setHistory).catch(() => {});
      if (res.review) {
        setActivity((a) => (a ? { ...a, status: res.review!.decision === "pass" ? "complete" : "in-progress", latestReview: res.review } : a));
        if (res.review.decision === "pass") {
          await refreshTree(); // refresh tree so the next step unlocks in place
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submission failed.");
    } finally { setBusy(false); }
  };

  if (loading) {
    return (
      <div className="max-w-[920px] mx-auto px-6 py-6 animate-pulse">
        {/* header */}
        <div className="mb-5">
          <div className="h-3 w-56 rounded bg-slate-200 mb-3" />
          <div className="flex items-center gap-3">
            <div className="w-12 h-7 rounded-md bg-slate-200" />
            <div className="h-5 w-72 max-w-[60%] rounded bg-slate-200" />
            <div className="h-5 w-20 rounded-full bg-slate-100" />
          </div>
        </div>
        {/* brief — two cards */}
        <div className="mb-5">
          <div className="h-3 w-48 rounded bg-slate-200 mb-2.5" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[0, 1].map((i) => (
              <div key={i} className="rounded-2xl ring-1 ring-slate-200/70 p-4 space-y-2.5">
                <div className="h-3 w-24 rounded bg-slate-200" />
                <div className="h-2.5 w-full rounded bg-slate-100" />
                <div className="h-2.5 w-[92%] rounded bg-slate-100" />
                <div className="h-2.5 w-3/4 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        </div>
        {/* deliverable card */}
        <div className="rounded-2xl ring-1 ring-slate-200/70 p-5 space-y-4">
          <div className="h-4 w-40 rounded bg-slate-200" />
          <div className="h-3 w-64 max-w-full rounded bg-slate-100" />
          <div className="h-28 w-full rounded-xl bg-slate-100" />
          <div className="h-10 w-36 rounded-lg bg-slate-200" />
        </div>
      </div>
    );
  }
  if (loadError || !activity) {
    return (
      <div className="max-w-[680px] mx-auto px-6 py-10">
        <Card className="text-center py-12">
          <div className="w-11 h-11 mx-auto rounded-xl bg-rose-50 ring-1 ring-rose-100 flex items-center justify-center text-rose-500 mb-3"><Icon name="info" size={20} /></div>
          <div className="text-[13px] font-medium text-slate-700">{loadError ?? "Activity not found"}</div>
          <Link href="/app/learnings" className="inline-block mt-4 text-[12.5px] text-indigo-600 hover:text-indigo-700">← Back to My Learnings</Link>
        </Card>
      </div>
    );
  }

  const verb = VERBS[activity.verb.id];
  const content = ACTIVITY_CONTENT[`${activity.taskCode}/${activity.code}`];
  const layer1 = result?.layer1;
  const review = result?.review ?? activity.latestReview;
  const passed = review?.decision === "pass" || activity.status === "complete";
  const hasFeedback = !!(layer1 || review);
  const hasBrief = !!(content?.objective || (content?.whatToDo && content.whatToDo.length > 0));
  const hasChecklist = !!(verb?.layer1 && verb.layer1.length > 0);
  const formSpec = verb ? VERB_FORMS[verb.id] ?? GENERIC_FORM : GENERIC_FORM;
  // Reference panel = the activity's required reading + the verb workspace's scripted artefacts
  // (Scope Statement, Asset Register, …) opened via the workspace "Open" buttons. Deduped by id.
  const references = [...(content?.references ?? []), ...(WORKSPACE_REFS[activity.verb.id] ?? [])]
    .filter((r, i, a) => a.findIndex((x) => x.id === r.id) === i);

  // After a pass the backend marks the next step "current" — find it (from the refreshed tree) to advance.
  let nextStepId: string | null = null;
  let nextTaskCode: string | null = null;
  if (learnings) {
    for (const o of learnings.orgs) {
      if (o.status === "locked") continue;
      for (const p of o.projects) for (const t of p.tasks) {
        const s = t.steps.find((x) => x.status === "current");
        if (s && s.id !== activityId) { nextStepId = s.id; nextTaskCode = t.code; break; }
      }
      if (nextStepId) break;
    }
  }

  return (
    <div className="max-w-[920px] mx-auto px-6 py-6">
      {/* standard banner — ties the step back to the framework it belongs to */}
      <StandardBanner taskCode={activity.taskCode} />

      {/* header — description left, submission-feedback trigger on the right */}
      <div className="mb-5 flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <Link href="/app/learnings" className="inline-flex items-center gap-1.5 text-[12px] text-slate-500 hover:text-slate-700 no-underline mb-2">
            <Icon name="chevronLeft" size={14} /> {activity.taskCode} · {activity.taskTitle}
          </Link>
          <div className="flex items-start gap-3">
            <span className="inline-flex items-center justify-center px-2 h-7 rounded-md bg-slate-900 text-white text-[12px] font-mono font-semibold shrink-0 mt-0.5">{activity.code}</span>
            <div className="min-w-0 flex-1">
              <h1 className="text-[20px] font-semibold tracking-[-0.02em] text-slate-900 leading-snug">{activity.title}</h1>
              {verb && <div className="mt-1.5"><DVerb verbId={verb.id} /></div>}
            </div>
          </div>
        </div>

        {/* submission-feedback trigger — only after a graded submission */}
        {hasFeedback && (
          <button
            onClick={() => setFeedbackOpen(true)}
            className={`shrink-0 inline-flex items-center gap-2 h-9 px-3 rounded-lg ring-1 transition-colors ${passed ? "bg-emerald-50 ring-emerald-200/70 hover:bg-emerald-100/70 text-emerald-700" : "bg-amber-50 ring-amber-200/70 hover:bg-amber-100/70 text-amber-700"}`}
          >
            <Icon name={passed ? "check" : "chat"} size={14} strokeWidth={passed ? 3 : 2} />
            <span className="text-[12.5px] font-medium tracking-tight">Submission feedback</span>
            <span className="text-[11.5px] font-semibold tabular-nums">
              {review ? (passed ? `· ${review.overallScore.toFixed(1)}/5` : "· revise") : layer1 && !layer1.passed ? "· not met" : ""}
            </span>
            <Icon name="arrowRight" size={13} className="opacity-60" />
          </button>
        )}
      </div>

      {/* brief — objective + what-to-do side by side, collapsible to reclaim space */}
      {hasBrief && (
        <div className="mb-5">
          <button onClick={() => setBriefShown((s) => !s)} className="w-full flex items-center gap-2 px-1 mb-2 text-left group">
            <Icon name="target" size={14} className="text-indigo-600 shrink-0" />
            <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-slate-500">Brief</span>
            <span className="text-[12px] text-slate-400 tracking-tight">— objective &amp; what to do</span>
            <span className="ml-auto inline-flex items-center gap-1 text-[11.5px] text-slate-400 group-hover:text-slate-600">
              {briefShown ? "Hide" : "Show"}
              <Icon name="chevronDown" size={14} className={`transition-transform ${briefShown ? "" : "-rotate-90"}`} />
            </span>
          </button>
          {/* grid-rows 0fr→1fr animates the auto height smoothly without measuring it */}
          <div className={`grid transition-all duration-300 ease-in-out ${briefShown ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
            <div className="overflow-hidden min-h-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
              {content?.objective && (
                <div className="rounded-2xl bg-gradient-to-br from-indigo-50/70 via-indigo-50/40 to-transparent ring-1 ring-indigo-100/80 p-4 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="target" size={14} className="text-indigo-600" />
                    <h2 className="text-[10.5px] font-semibold tracking-[0.12em] uppercase text-indigo-700">Objective</h2>
                  </div>
                  <p className="text-[13px] text-slate-700 leading-relaxed tracking-tight" style={{ textWrap: "pretty" }}>{content.objective}</p>
                </div>
              )}
              {content?.whatToDo && content.whatToDo.length > 0 && (
                <div className="rounded-2xl bg-gradient-to-br from-emerald-50/60 via-emerald-50/30 to-transparent ring-1 ring-emerald-100/80 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon name="list" size={14} className="text-emerald-700" />
                    <h2 className="text-[10.5px] font-semibold tracking-[0.12em] uppercase text-emerald-700">What to do</h2>
                  </div>
                  <ol className="space-y-2.5">
                    {content.whatToDo.map((step, i) => (
                      <li key={i} className="flex gap-2.5">
                        <span className="shrink-0 w-5 h-5 rounded-full bg-emerald-600 text-white text-[10.5px] font-semibold flex items-center justify-center mt-0.5 tabular-nums">{i + 1}</span>
                        <span className="text-[12.5px] text-slate-700 leading-relaxed tracking-tight" style={{ textWrap: "pretty" }}>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
            </div>
          </div>
        </div>
      )}

      {/* deliverable */}
      <div ref={deliverableRef}>
      <Card>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <h2 className="text-[14px] font-semibold tracking-tight text-slate-900">Your deliverable</h2>
            <p className="text-[12px] text-slate-500 mt-0.5">
              {verb ? `${verb.label} — ${verb.when}` : "Capture your work for this step."}
            </p>
          </div>
          <button
            onClick={() => setBriefOpen(true)}
            className="shrink-0 inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-slate-50 ring-1 ring-slate-200/70 text-slate-600 hover:bg-slate-100 text-[12px] font-medium tracking-tight transition-colors"
          >
            <Icon name="book" size={14} /> Reference material
            {references.length > 0 && (
              <span className="inline-flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded-full bg-indigo-600 text-white text-[10px] font-semibold tabular-nums">{references.length}</span>
            )}
          </button>
        </div>

        <VerbWorkspace verbId={activity.verb.id} value={values} onChange={setValues} openRef={openRef} />

        <div className="mt-5">
          <div className="text-[12px] font-medium text-slate-700 tracking-tight mb-1.5">Additional notes</div>
          <textarea
            value={notesVal}
            onChange={(e) => setNotesVal(e.target.value)}
            rows={3}
            placeholder="Anything else for the mentor to consider…"
            className="w-full rounded-lg bg-white ring-1 ring-slate-200/80 p-3 text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 resize-y"
          />
        </div>

        {error && <div className="mt-4 text-[12.5px] text-rose-700 bg-rose-50 ring-1 ring-rose-100 rounded-lg px-3 py-2">{error}</div>}

        <div className="mt-5">
          {passed && !busy ? (
            <div className="flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-emerald-50 ring-1 ring-emerald-200/70 text-emerald-700 text-[13px] font-medium tracking-tight">
                <Icon name="check" size={14} strokeWidth={3} /> Submitted — step complete{review ? ` · ${review.overallScore.toFixed(1)} / 5` : ""}
              </span>
              {nextStepId ? (
                <Link href={`/app/desk/${nextStepId}`} className="focus-ring inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-semibold tracking-tight no-underline shadow-[0_4px_14px_-4px_rgba(79,70,229,0.6)]">
                  Next step{nextTaskCode && nextTaskCode !== activity.taskCode ? ` · ${nextTaskCode}` : ""} <Icon name="arrowRight" size={15} />
                </Link>
              ) : (
                <Link href="/app/desk" className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-white ring-1 ring-slate-200/80 text-slate-700 text-[13px] font-semibold tracking-tight no-underline hover:bg-slate-50">
                  Back to Working Desk <Icon name="arrowRight" size={15} />
                </Link>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={submit} disabled={busy || !hasContent} className="focus-ring h-10 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:shadow-none text-white text-[13px] font-medium tracking-tight inline-flex items-center gap-2 shadow-[0_4px_14px_-4px_rgba(79,70,229,0.6)] transition-all">
                <Icon name="send" size={14} /> {busy ? "Grading…" : "Submit for review"}
              </button>
              <button onClick={saveDraft} disabled={busy} className="focus-ring h-10 px-4 rounded-lg bg-white ring-1 ring-slate-200/80 hover:bg-slate-50 disabled:opacity-50 text-slate-700 text-[13px] font-medium tracking-tight">
                Save draft
              </button>
              {savedAt && <span className="text-[11.5px] text-slate-400">Saved {savedAt}</span>}
            </div>
          )}
        </div>
      </Card>
      </div>

      {/* Acceptance criteria. Small screens: inline card under the deliverable. */}
      {hasChecklist && (
        <div className="md:hidden mt-5">
          <AcceptanceChecklist criteria={verb!.layer1!} spec={formSpec} values={values} layer1={layer1} />
        </div>
      )}

      {/* md+: translucent glass HUD fixed to the top-right so the full checklist stays in view
          throughout the activity (anchored top+right → no sidebar math, no layout reflow).
          Dismissable — cross-fades to a small "Criteria" chip that brings it back. Both elements
          stay mounted so the swap can fade rather than pop. */}
      {hasChecklist && (
        <>
          <div className={`hidden md:block fixed top-[84px] right-4 z-20 w-[300px] max-h-[calc(100vh-104px)] overflow-y-auto transition-all duration-200 ease-out motion-reduce:transition-none ${criteriaHidden ? "opacity-0 -translate-y-1 pointer-events-none" : "opacity-100 translate-y-0"}`}>
            <AcceptanceChecklist criteria={verb!.layer1!} spec={formSpec} values={values} layer1={layer1} onClose={() => setCriteriaHidden(true)} />
          </div>
          <button
            onClick={() => setCriteriaHidden(false)}
            aria-hidden={!criteriaHidden}
            className={`focus-ring hidden md:inline-flex fixed top-[84px] right-4 z-20 items-center gap-1.5 h-9 pl-2.5 pr-3.5 rounded-full bg-gradient-to-b from-white/85 to-indigo-50/85 backdrop-blur-2xl backdrop-saturate-150 ring-1 ring-indigo-200/70 shadow-[0_12px_40px_-14px_rgba(79,70,229,0.4)] text-indigo-700 hover:to-indigo-100/85 text-[12px] font-semibold tracking-tight transition-all duration-200 ease-out motion-reduce:transition-none cursor-pointer ${criteriaHidden ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1 pointer-events-none"}`}
          >
            <Icon name="checkSquare" size={14} className="text-indigo-600" /> Criteria
          </button>
        </>
      )}

      {/* ===== Reference material — draggable, non-modal panel (context · documents) ===== */}
      <DraggablePanel open={briefOpen} onClose={() => setBriefOpen(false)} title="Reference material" eyebrow={verb?.label}>
        <div className="space-y-6">
          {verb?.when && (
            <section>
              <h3 className="text-[11px] font-semibold tracking-[0.12em] uppercase text-slate-500 mb-1.5">When you use this</h3>
              <p className="text-[13px] text-slate-700 leading-relaxed tracking-tight" style={{ textWrap: "pretty" }}>{verb.when}</p>
            </section>
          )}

          {references.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-1.5">
                <h3 className="text-[11px] font-semibold tracking-[0.12em] uppercase text-slate-500">Reference documents</h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 bg-amber-50 ring-1 ring-amber-100 rounded-full px-2 h-5"><Icon name="info" size={10} /> Required</span>
              </div>
              <p className="text-[12px] text-slate-500 tracking-tight mb-2.5">The facts, rules and artefacts you need to complete this step correctly.</p>
              <RefAccordion key={focusRefId ?? "default"} references={references} focusId={focusRefId} />
            </section>
          )}
        </div>
      </DraggablePanel>

      {/* ===== Submission feedback drawer (results · revision history) ===== */}
      <Drawer
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        title="Submission feedback"
        eyebrow={review ? (passed ? "Passed" : "Needs revision") : "Result"}
      >
        <div className="space-y-6">
          {layer1 && (
            <section>
              <h3 className="text-[13px] font-semibold tracking-tight text-slate-900 mb-2.5">
                Layer 1 — Acceptance {layer1.passed ? <span className="text-emerald-600">· passed</span> : <span className="text-rose-600">· not met</span>}
              </h3>
              <div className="space-y-2">
                {layer1.checks.map((c, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${c.passed ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"}`}>
                      <Icon name={c.passed ? "check" : "x"} size={10} strokeWidth={3} />
                    </span>
                    <div className="min-w-0">
                      <div className="text-[12.5px] text-slate-700 tracking-tight">{c.label}</div>
                      {c.detail && c.detail !== "Passed." && <div className="text-[11.5px] text-slate-400">{c.detail}</div>}
                    </div>
                  </div>
                ))}
              </div>
              {!layer1.passed && <p className="mt-3 text-[12px] text-slate-500">Address the unmet checks above, then submit again.</p>}
            </section>
          )}

          {review ? (
            <section>
              {layer1 && <h3 className="text-[13px] font-semibold tracking-tight text-slate-900 mb-2.5">Layer 2 — Quality</h3>}
              <ReviewPanel review={review} />
            </section>
          ) : (
            !layer1 && <p className="text-[12.5px] text-slate-500">No feedback yet — submit your deliverable to get graded.</p>
          )}

          {history.length > 0 && (
            <section>
              <h3 className="text-[13px] font-semibold tracking-tight text-slate-900 mb-3">Revision history</h3>
              <div className="space-y-3">
                {history.map((h) => {
                  const r = h.review;
                  const pass = r?.decision === "pass";
                  return (
                    <div key={h.submission.id} className="flex gap-3">
                      <div className="flex flex-col items-center shrink-0">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold ring-1 ${r ? (pass ? "bg-emerald-50 text-emerald-700 ring-emerald-100" : "bg-amber-50 text-amber-700 ring-amber-100") : "bg-slate-50 text-slate-500 ring-slate-200/70"}`}>
                          v{h.submission.revisionNo}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {r ? (
                            <>
                              <span className={`inline-flex items-center gap-1 px-2 h-5 rounded-full text-[10.5px] font-medium ring-1 ${pass ? "bg-emerald-50 text-emerald-700 ring-emerald-100" : "bg-amber-50 text-amber-700 ring-amber-100"}`}>
                                {pass ? "Passed" : "Needs revision"}
                              </span>
                              <span className="text-[11px] font-semibold text-slate-700 tabular-nums">{r.overallScore.toFixed(1)} / 5</span>
                            </>
                          ) : (
                            <span className="inline-flex items-center px-2 h-5 rounded-full text-[10.5px] font-medium ring-1 bg-slate-50 text-slate-500 ring-slate-200/70">{h.submission.layer1 && !h.submission.layer1.passed ? "Layer 1 not met" : "Submitted"}</span>
                          )}
                          <span className="text-[10.5px] text-slate-400 ml-auto">{new Date(h.submission.createdAt).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                        {r?.feedback && <p className="text-[11.5px] text-slate-500 mt-1 leading-relaxed tracking-tight" style={{ textWrap: "pretty" }}>{r.feedback}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {passed && !busy && (
            <section className="rounded-xl bg-emerald-50/70 ring-1 ring-emerald-200/70 p-3.5">
              <div className="flex items-center gap-2 mb-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Icon name="check" size={11} strokeWidth={3} />
                </span>
                <span className="text-[12.5px] font-semibold text-emerald-800 tracking-tight">Step complete{review ? ` · ${review.overallScore.toFixed(1)} / 5` : ""}</span>
              </div>
              {nextStepId ? (
                <Link href={`/app/desk/${nextStepId}`} onClick={() => setFeedbackOpen(false)} className="focus-ring inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-semibold tracking-tight no-underline shadow-[0_4px_14px_-4px_rgba(79,70,229,0.6)]">
                  Next step{nextTaskCode && nextTaskCode !== activity.taskCode ? ` · ${nextTaskCode}` : ""} <Icon name="arrowRight" size={15} />
                </Link>
              ) : (
                <Link href="/app/desk" onClick={() => setFeedbackOpen(false)} className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-white ring-1 ring-slate-200/80 text-slate-700 text-[13px] font-semibold tracking-tight no-underline hover:bg-slate-50">
                  Back to Working Desk <Icon name="arrowRight" size={15} />
                </Link>
              )}
            </section>
          )}
        </div>
      </Drawer>
    </div>
  );
}
