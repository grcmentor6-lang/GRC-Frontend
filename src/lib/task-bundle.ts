"use client";

// Client loader for a task's full curriculum bundle, served per-task from the gated backend
// endpoint (GET /me/task-content/{code}) instead of shipping in the JS bundle. One in-flight
// request is shared across all consumers of the same task and cached for the session.
//
// Replaces the synchronous module lookups that used to expose the whole course in DevTools:
//   RUA_TASKS[code]            -> bundle.rua
//   RUA_REFS[code]             -> bundle.refs
//   TASK_CONTENT[code]         -> bundle.overview
//   ACTIVITY_CONTENT[code/act] -> bundle.activities[act]

import { createContext, createElement, useContext, useEffect, useState } from "react";
import { api, ApiError } from "./api";
import { userKey } from "./token";
import { persistJSON } from "./use-query";
import { isGateVerb } from "./verbs";
import type { RuaTask } from "./rua-tasks";
import type { RuaRef } from "./rua-refs";
import type { TaskContent } from "./task-content";
import type { ActivityContent } from "./activity-content";

export interface TaskBundle {
  rua: RuaTask;
  refs: RuaRef[];
  /** per-task overview: objective / whatToDo / references (was TASK_CONTENT[code]) */
  overview: TaskContent | null;
  /** keyed by activity code within the task, e.g. "1.1" (was ACTIVITY_CONTENT["code/act"]) */
  activities: Record<string, ActivityContent>;
}

const cache = new Map<string, Promise<TaskBundle>>();

/**
 * A task's bundle is seeded content rendered into this learner's organisation — identical on every
 * fetch for the life of the session — but the map above dies with the JS module graph, so every
 * refresh re-fetched the brief for the step already on screen. Mirrored per tab, namespaced by the
 * token's subject, exactly as `lib/use-query` does for the tree; sessionStorage so it goes when the
 * tab does, and a quota failure just means the next refresh fetches as it does today.
 */
const STORE = (cacheKey: string) => `grcb:${userKey()}:${cacheKey}`;

function readStored(cacheKey: string): TaskBundle | null {
  try {
    const raw = sessionStorage.getItem(STORE(cacheKey));
    return raw ? (JSON.parse(raw) as TaskBundle) : null;
  } catch {
    return null;
  }
}

function store(cacheKey: string, bundle: TaskBundle): void {
  persistJSON(STORE(cacheKey), bundle); // shares the query cache's quota handling
}

/**
 * Where a bundle comes from. The learner's own gated endpoint by default; the mentor console
 * swaps in a fetcher that reads the *mentee's* rendered bundle for the card being reviewed, so
 * the two gate workspaces can be replayed on the review card without a learner token.
 *
 * A context rather than a prop because `useTaskBundle` is called inside the workspaces
 * themselves — threading a fetcher through would mean touching all 24 of them.
 */
export interface TaskBundleSource {
  /** Cache namespace. Two sources may hold different renderings of the same task code. */
  key: string;
  fetch: (taskCode: string) => Promise<TaskBundle>;
}

const LEARNER_SOURCE: TaskBundleSource = {
  key: "me",
  fetch: (taskCode) => api.get<TaskBundle>(`/me/task-content/${taskCode}`),
};

const SourceContext = createContext<TaskBundleSource>(LEARNER_SOURCE);

export function TaskBundleSourceProvider({
  source,
  children,
}: {
  source: TaskBundleSource;
  children: React.ReactNode;
}) {
  return createElement(SourceContext.Provider, { value: source }, children);
}

// The bundle the backend returns is rendered into this learner's own organisation and scope
// objects, so it is per-user content on a per-user session — caching it by task code alone is
// still correct, and it is dropped when the tab goes.
export function fetchTaskBundle(
  taskCode: string,
  source: TaskBundleSource = LEARNER_SOURCE,
): Promise<TaskBundle> {
  // Namespaced by source: the mentor's copy is rendered into the mentee's organisation and scope
  // objects, so it must never be served to a learner from the same cache slot, or vice versa.
  const cacheKey = `${source.key}:${taskCode}`;
  let p = cache.get(cacheKey);
  if (!p) {
    const stored = readStored(cacheKey);
    p = stored
      ? Promise.resolve(stored)
      : source.fetch(taskCode).then(
          (bundle) => {
            store(cacheKey, bundle);
            return bundle;
          },
          (err) => {
            cache.delete(cacheKey); // don't cache failures — allow a retry
            throw err;
          },
        );
    cache.set(cacheKey, p);
  }
  return p;
}

/** Warm a task's bundle without rendering it. Hovering a task in the desk tree is the signal —
 *  a bundle is fetched once per task for the whole session, so at worst it is one early request
 *  for a task the learner was opening anyway. */
export function prefetchTaskBundle(taskCode: string): void {
  fetchTaskBundle(taskCode).catch(() => {}); // a prefetch that fails is nobody's error
}

/** An activity's brief from the fetched bundle. Task-boundary gates (RUA / Research Submission)
 *  get a brief synthesised from the task's RUA entry instead of hand-written copies.
 *  Bundle-based replacement for the old getActivityContent(taskCode, activityCode, verbId). */
export function activityBrief(
  bundle: TaskBundle,
  activityCode: string,
  verbId?: string,
): ActivityContent | undefined {
  const staticContent = bundle.activities[activityCode];
  if (staticContent || !verbId || !isGateVerb(verbId)) return staticContent;
  const deliverable = bundle.rua?.deliverable ?? "the deliverable";
  const org = bundle.rua?.org ?? "the organisation";
  if (verbId === "rua") {
    return {
      objective: `You will prove you understand this task — the governing controls, the templates, the key concepts and the contract for ${deliverable} — before any real work begins. No passed gate, no first step.`,
      whatToDo: [
        "Read the reference material handed to you for each step — control extracts, templates, briefs and concept primers.",
        "Study each governing control and pass its comprehension check; inspect every template.",
        "Explain every key concept in your own words — the mentor grades these, not copied definitions.",
        "Answer the readiness questions, accept the deliverable contract, and attest your readiness.",
      ],
      references: bundle.refs,
    };
  }
  return {
    objective: `You will evidence the research behind your ${deliverable} — the contextual, gap and horizon-scanning work that makes it ${org}'s deliverable rather than a template — before the task closes.`,
    whatToDo: [
      "Work each of the three research methods and capture your findings as notes.",
      "Cite at least one source per method — clause, report, advisory or internal document.",
      `Summarise how the research changed or confirmed the ${deliverable}.`,
    ],
  };
}

export interface TaskBundleState {
  bundle: TaskBundle | undefined;
  loading: boolean;
  error: ApiError | Error | null;
}

/** Fetch (and cache) one task's curriculum bundle. `undefined` taskCode → idle, no fetch. */
export function useTaskBundle(taskCode: string | undefined): TaskBundleState {
  const source = useContext(SourceContext);
  const [state, setState] = useState<TaskBundleState>({
    bundle: undefined,
    loading: !!taskCode,
    error: null,
  });

  useEffect(() => {
    if (!taskCode) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- shows the cached or empty state at once when the key changes
      setState({ bundle: undefined, loading: false, error: null });
      return;
    }
    let live = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    fetchTaskBundle(taskCode, source).then(
      (bundle) => { if (live) setState({ bundle, loading: false, error: null }); },
      (error) => { if (live) setState({ bundle: undefined, loading: false, error }); },
    );
    return () => { live = false; };
  }, [taskCode, source]);

  return state;
}
