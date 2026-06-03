"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { Card, Bar, Ring } from "@/components/ui/primitives";
import { DVerb } from "@/components/ui/dverb";
import { VERBS } from "@/lib/verbs";
import { VERB_TONES } from "@/lib/tones";
import { deskApi, type ActivityDetail, type ActivityPayload, type SubmitResponse, type Review, type SubmissionDetail } from "@/lib/desk";
import { ApiError } from "@/lib/api";
import { SchemaForm } from "@/components/app/schema-form";
import { VERB_FORMS, GENERIC_FORM } from "@/lib/verb-forms";
import { useDeskLearnings } from "@/components/app/desk-context";

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
          <Icon name="chat" size={12} /> Mentor feedback
        </div>
        <p className="text-[12.5px] text-slate-700 leading-relaxed tracking-tight" style={{ textWrap: "pretty" }}>{review.feedback}</p>
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
  const [busy, setBusy] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [history, setHistory] = useState<SubmissionDetail[]>([]);

  useEffect(() => {
    let cancelled = false;
    deskApi.submissions(activityId).then((h) => !cancelled && setHistory(h)).catch(() => {});
    deskApi.activity(activityId)
      .then((a) => {
        if (cancelled) return;
        setActivity(a);
        if (a.draft) {
          setValues({ ...(a.draft.fields ?? {}), notes: a.draft.notes ?? "" });
        }
      })
      .catch((e) => !cancelled && setLoadError(e instanceof ApiError ? e.message : "Couldn't load this activity."))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [activityId]);

  const payload = (): ActivityPayload => {
    const { notes, ...fields } = values;
    return { fields, notes: String(notes ?? ""), attachments: [] };
  };
  const hasContent = Object.entries(values).some(([, v]) =>
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
      deskApi.submissions(activityId).then(setHistory).catch(() => {});
      if (res.review) {
        setActivity((a) => (a ? { ...a, status: res.review!.decision === "pass" ? "complete" : "in-progress", latestReview: res.review } : a));
        if (res.review.decision === "pass") await refreshTree(); // refresh tree so the next step unlocks in place
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submission failed.");
    } finally { setBusy(false); }
  };

  if (loading) {
    return <div className="h-full flex items-center justify-center text-slate-400"><div className="w-6 h-6 rounded-full border-2 border-slate-200 border-t-indigo-500 animate-spin" /></div>;
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
  const tone = verb ? VERB_TONES[verb.color] ?? VERB_TONES.indigo : VERB_TONES.indigo;
  const layer1 = result?.layer1;
  const review = result?.review ?? activity.latestReview;
  const passed = review?.decision === "pass" || activity.status === "complete";

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
    <div className="max-w-[1180px] mx-auto px-6 py-6">
      {/* header */}
      <div className="mb-5">
        <Link href="/app/learnings" className="inline-flex items-center gap-1.5 text-[12px] text-slate-500 hover:text-slate-700 no-underline mb-2">
          <Icon name="chevronLeft" size={14} /> {activity.taskCode} · {activity.taskTitle}
        </Link>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="inline-flex items-center justify-center px-2 h-7 rounded-md bg-slate-900 text-white text-[12px] font-mono font-semibold">{activity.code}</span>
          <h1 className="text-[20px] font-semibold tracking-[-0.02em] text-slate-900">{activity.title}</h1>
          {verb && <DVerb verbId={verb.id} />}
        </div>
        {verb && <p className="text-[13px] text-slate-500 mt-1.5 tracking-tight">{verb.when}</p>}
      </div>

      {passed && (
        <div className="mb-5 rounded-2xl ring-1 ring-emerald-200/70 bg-emerald-50/60 px-5 py-4 flex items-center gap-4 flex-wrap">
          <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <Icon name="check" size={18} strokeWidth={3} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[14px] font-semibold tracking-tight text-slate-900">Step complete{review ? ` · ${review.overallScore.toFixed(1)} / 5` : ""}</div>
            <div className="text-[12.5px] text-slate-600 tracking-tight">
              {nextStepId ? "Nice work — your next step is unlocked." : "Nice work — you've finished the steps available here."}
            </div>
          </div>
          {nextStepId ? (
            <Link href={`/app/desk/${nextStepId}`} className="shrink-0 inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-semibold tracking-tight no-underline">
              Next step{nextTaskCode && nextTaskCode !== activity.taskCode ? ` · ${nextTaskCode}` : ""} <Icon name="arrowRight" size={15} />
            </Link>
          ) : (
            <Link href="/app/desk" className="shrink-0 inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-white ring-1 ring-slate-200/80 text-slate-700 text-[13px] font-semibold tracking-tight no-underline hover:bg-slate-50">
              Back to Working Desk <Icon name="arrowRight" size={15} />
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* workspace */}
        <div className="xl:col-span-2 space-y-5">
          <Card>
            <h2 className="text-[14px] font-semibold tracking-tight text-slate-900 mb-1">Your deliverable</h2>
            <p className="text-[12px] text-slate-500 mb-3">
              {verb ? `${verb.label} — ${verb.when}` : "Capture your work for this step."}
            </p>
            <SchemaForm spec={verb ? VERB_FORMS[verb.id] ?? GENERIC_FORM : GENERIC_FORM} value={values} onChange={setValues} />

            {error && <div className="mt-4 text-[12.5px] text-rose-700 bg-rose-50 ring-1 ring-rose-100 rounded-lg px-3 py-2">{error}</div>}

            <div className="mt-5 flex items-center gap-2">
              <button onClick={submit} disabled={busy || !hasContent} className="h-10 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-[13px] font-medium tracking-tight inline-flex items-center gap-2">
                <Icon name="send" size={14} /> {busy ? "Grading…" : "Submit for review"}
              </button>
              <button onClick={saveDraft} disabled={busy} className="h-10 px-4 rounded-lg bg-white ring-1 ring-slate-200/80 hover:bg-slate-50 disabled:opacity-50 text-slate-700 text-[13px] font-medium tracking-tight">
                Save draft
              </button>
              {savedAt && <span className="text-[11.5px] text-slate-400">Saved {savedAt}</span>}
            </div>
          </Card>

          {/* layer 1 result + review */}
          {layer1 && (
            <Card>
              <h2 className="text-[14px] font-semibold tracking-tight text-slate-900 mb-3">
                Layer 1 — Acceptance {layer1.passed ? <span className="text-emerald-600">· passed</span> : <span className="text-rose-600">· not met</span>}
              </h2>
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
            </Card>
          )}

          {review && (
            <Card>
              <h2 className="text-[14px] font-semibold tracking-tight text-slate-900 mb-3">Layer 2 — Mentor grade</h2>
              <ReviewPanel review={review} />
            </Card>
          )}

          {history.length > 0 && (
            <Card>
              <h2 className="text-[14px] font-semibold tracking-tight text-slate-900 mb-3">Revision history</h2>
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
            </Card>
          )}
        </div>

        {/* context rail */}
        <div className="space-y-4">
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-6 h-6 rounded-md ${tone.bg} ${tone.text} flex items-center justify-center ring-1 ${tone.ring}`}><Icon name="shield" size={12} /></div>
              <h3 className="text-[12.5px] font-semibold tracking-tight text-slate-900">Layer 1 — Acceptance</h3>
            </div>
            <p className="text-[11.5px] text-slate-500 mb-3 tracking-tight">Deterministic checks your submission must pass.</p>
            <div className="space-y-2">
              {(verb?.layer1 ?? []).map((c, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="mt-0.5 w-4 h-4 rounded border-2 border-slate-300 shrink-0" />
                  <span className="text-[12px] leading-snug text-slate-600 tracking-tight">{c}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-md bg-violet-50 text-violet-600 flex items-center justify-center ring-1 ring-violet-200/70"><Icon name="sliders" size={12} /></div>
              <h3 className="text-[12.5px] font-semibold tracking-tight text-slate-900">Layer 2 — Rubric</h3>
            </div>
            <p className="text-[11.5px] text-slate-500 mb-3 tracking-tight">Dimensions the AI mentor scores, / 5.</p>
            <div className="flex flex-wrap gap-1.5">
              {(verb?.layer2 ?? []).map((d) => (
                <span key={d} className="inline-flex items-center h-[22px] px-2 rounded-md text-[10.5px] font-medium bg-slate-50 text-slate-600 ring-1 ring-slate-200/70 tracking-tight">{d}</span>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
