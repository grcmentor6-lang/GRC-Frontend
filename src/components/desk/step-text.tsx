"use client";

import { Fragment, useMemo, type ReactNode } from "react";
import { Icon } from "@/components/ui/icon";

/**
 * How a step's words are set on the desk (owner, 4–5 Nov 2026): say what to do, once, plainly.
 *
 * - A toolbar path is drawn as a chip in ONE place per view — the step's "where" (the Where column, the tool
 *   window's top bar) — and stays plain text everywhere else, so the eye is sent to one place, not four.
 * - An instruction is split into its sentences. Sentences that tell you to do something are numbered and
 *   set dark; sentences that only explain sit between them in quiet type, so the actions read as a list.
 */

/** One toolbar path, set as a chip: section › tool. */
export function PathChip({ path, wrap = false }: { path: string; wrap?: boolean }) {
  const parts = path.split(/\s*›\s*/);
  return (
    <span className={`mx-0.5 inline-flex max-w-full items-center gap-1 ${wrap ? "flex-wrap" : "whitespace-nowrap"} rounded border border-[#C7CBF5] bg-[#EEF0FF] px-1.5 py-px align-baseline text-[0.92em] font-semibold leading-[1.45] text-[#3730A3]`}>
      <Icon name="grid" size={11} className="shrink-0 opacity-70" />
      {parts.map((p, i) => (
        <Fragment key={i}>
          {i > 0 && <Icon name="chevronRight" size={11} className="shrink-0 opacity-60" />}
          <span className={wrap ? "" : "truncate"}>{p}</span>
        </Fragment>
      ))}
    </span>
  );
}

// The pack's instructions open each action with its verb ("Check each value…", "Open the file…"), or with a
// short lead before it ("For each rejected item, choose…"). Anything else explains rather than instructs.
const VERBS =
  "add|answer|apply|bring|change|check|choose|click|compare|complete|copy|correct|count|decide|do|fill|find|give|list|mark|match|name|open|pick|place|put|read|record|repeat|save|select|start|submit|test|tick|type|use|walk|work|write";
const ACTION = new RegExp(`^(?:(?:${VERBS})\\b|(?:for each|for every|in|with|before|then|if)\\b[^.]*?,\\s*(?:then\\s+)?(?:${VERBS})\\b|then\\s+(?:${VERBS})\\b)`, "i");

/** Sentences, kept whole across "e.g." and "i.e.". */
function sentences(text: string): string[] {
  const out: string[] = [];
  for (const part of text.split(/(?<=[.!?])\s+(?=[A-Z"“(<])/)) {
    if (out.length && /\b(e\.g|i\.e)\.$/i.test(out[out.length - 1])) out[out.length - 1] += ` ${part}`;
    else out.push(part);
  }
  return out.map((s) => s.trim()).filter(Boolean);
}

/**
 * A step's instruction: actions numbered and dark, explanations quiet between them. `opened`: the step is
 * shown inside its tool window, where the file or screen it says to open is already in front of the learner
 * and the window's top bar names whatever opens beside it, so "Open …" sentences are dropped.
 */
export function StepInstruction({ text, opened = false, className = "" }: { text: string; opened?: boolean; className?: string }) {
  const lines = useMemo(
    () => sentences(text).filter((s) => !(opened && /^open\b/i.test(s))).map((s) => ({ s, act: ACTION.test(s) })),
    [text, opened],
  );
  if (!lines.length) return null;
  const acts = lines.filter((l) => l.act).length;
  // One sentence, or nothing to number: a single plain line reads better than a list of one.
  if (lines.length < 2 || acts < 2) {
    return <p className={`text-[14px] leading-[1.6] text-[#1F2433] ${className}`}>{lines.map((l) => l.s).join(" ")}</p>;
  }
  let n = 0;
  return (
    <ol className={`flex flex-col gap-1.5 ${className}`}>
      {lines.map(({ s, act }, i) =>
        act ? (
          <li key={i} className="flex gap-2.5 text-[14px] leading-[1.55] text-[#111827]">
            <span className="mt-[3px] grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full bg-[#4338CA] text-[10.5px] font-bold text-white tabular-nums">{++n}</span>
            <span className="min-w-0">{s}</span>
          </li>
        ) : (
          <li key={i} className="pl-[28px] text-[12.5px] leading-[1.5] text-[#6B7280]">{s}</li>
        ),
      )}
    </ol>
  );
}

/** A step's "where": its toolbar path as a chip, or the plain place when it is not one. `wrap` for a narrow
 *  column, where a one-line chip would cut both names to "Frame… › Framework…". */
export function Where({ tool, wrap = false }: { tool: string; wrap?: boolean }): ReactNode {
  return /›/.test(tool) ? <PathChip path={tool} wrap={wrap} /> : tool;
}
