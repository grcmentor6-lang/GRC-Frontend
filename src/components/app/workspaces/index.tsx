"use client";

// Verb → bespoke workspace registry + dispatcher. Replaces the generic SchemaForm in the
// activity page: each verb renders its own pre-scripted working area and lifts the mentee's
// graded inputs into `value`. Verbs without a bespoke workspace fall back to a simple note pad.

import type { WorkspaceProps } from "./kit";
import {
  RequestWorkspace, ConductWorkspace, RecordWorkspace, ApplyWorkspace,
  CrossRefWorkspace, IdentifyWorkspace, ReviewWorkspace, PresentWorkspace,
} from "./set-a";
import {
  DraftWorkspace, MapWorkspace, CalculateWorkspace, PrioritiseWorkspace,
  RecommendWorkspace, ValidateWorkspace, ScheduleWorkspace,
} from "./set-b";
import {
  AssessWorkspace, ScoreWorkspace, CompileWorkspace, BriefWorkspace,
  SignoffWorkspace, InterviewWorkspace, DocumentWorkspace,
} from "./set-c";
import { RuaWorkspace, ResearchWorkspace } from "./gates";
import { useState } from "react";
import { seed, useLift } from "./kit";

export const VERB_WORKSPACES: Record<string, (p: WorkspaceProps) => React.ReactElement> = {
  request: RequestWorkspace,
  conduct: ConductWorkspace,
  record: RecordWorkspace,
  apply: ApplyWorkspace,
  crossref: CrossRefWorkspace,
  identify: IdentifyWorkspace,
  review: ReviewWorkspace,
  present: PresentWorkspace,
  draft: DraftWorkspace,
  map: MapWorkspace,
  calculate: CalculateWorkspace,
  prioritise: PrioritiseWorkspace,
  recommend: RecommendWorkspace,
  validate: ValidateWorkspace,
  schedule: ScheduleWorkspace,
  assess: AssessWorkspace,
  score: ScoreWorkspace,
  compile: CompileWorkspace,
  brief: BriefWorkspace,
  signoff: SignoffWorkspace,
  interview: InterviewWorkspace,
  document: DocumentWorkspace,
  // task-boundary gates — RUA readiness gate opens a task, Research Submission closes it
  rua: RuaWorkspace,
  research: ResearchWorkspace,
};

/** Minimal fallback for any verb id not in the registry. */
function GenericWorkspace({ value, onChange }: WorkspaceProps) {
  const [text, setText] = useState(() => seed(value, "deliverable", ""));
  useLift({ deliverable: text }, onChange);
  return (
    <div>
      <div className="text-[12px] font-medium text-slate-700 tracking-tight mb-1.5">Deliverable</div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={8} placeholder="Capture your work for this step…"
        className="w-full rounded-lg bg-white ring-1 ring-slate-200/80 p-3 text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 resize-y" />
    </div>
  );
}

export function VerbWorkspace({ verbId, taskCode, activityCode, value, onChange, openRef }: {
  verbId: string; taskCode?: string; activityCode?: string;
} & WorkspaceProps) {
  const Component = VERB_WORKSPACES[verbId] ?? GenericWorkspace;
  // `key` resets internal workspace state when navigating between activities (incl. same verb).
  return <Component key={`${verbId}/${taskCode ?? ""}/${activityCode ?? ""}`} taskCode={taskCode} activityCode={activityCode} value={value} onChange={onChange} openRef={openRef} />;
}
