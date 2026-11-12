/**
 * Decision trees written as text, found so they can be drawn as the desk's decision-tree card
 * (components/desk/walk-card.tsx) instead of as a run of lines.
 */
export type TreeStep = { q: string; then: string; otherwise?: boolean };

const Q_LINE = /^(.+\?)\s*→\s*(.+?)\.?$/;
const ELSE_LINE = /^Otherwise\s*→\s*(.+?)\.?$/;

/**
 * A document section's paragraphs (BKB-STD-001 Section 5): the first run of "question? → outcome" lines
 * that ends in "Otherwise → outcome", as [start, end) of `paras` and its steps; null when there is none.
 */
export function treeRun(paras: string[]): { start: number; end: number; steps: TreeStep[] } | null {
  for (let start = 0; start < paras.length; start++) {
    const steps: TreeStep[] = [];
    let i = start;
    for (; i < paras.length; i++) {
      const q = paras[i].trim().match(Q_LINE);
      if (!q) break;
      steps.push({ q: q[1], then: q[2] });
    }
    const e = paras[i]?.trim().match(ELSE_LINE);
    if (steps.length && e) return { start, end: i + 1, steps: [...steps, { q: "Otherwise", then: e[1], otherwise: true }] };
  }
  return null;
}

/**
 * A cell that is a numbered ladder (Ref-Rules R01: 'Ask in this order and stop at the first "yes": 1) Made by a
 * parliament or a regulator? → Law / regulation. … 5) Otherwise → Voluntary framework.'): the words before it, its
 * steps, and any words after it. Null unless every step is a question or "Otherwise", and there are two or more.
 */
export function ladderCell(text: string): { lead: string; steps: TreeStep[]; tail: string } | null {
  const ms = [...text.matchAll(/(\d+)\)\s*(.+?)\s*→\s*(.+?)\.(?=\s+\d+\)|\s*$|\s+[A-Z])/g)];
  if (ms.length < 2 || ms.some((m, i) => m[1] !== String(i + 1))) return null;
  const steps = ms.map((m) => (/^Otherwise$/i.test(m[2]) ? { q: "Otherwise", then: m[3], otherwise: true } : { q: m[2], then: m[3] }));
  if (steps.some((x) => !x.otherwise && !x.q.endsWith("?"))) return null;
  const last = ms[ms.length - 1];
  return { lead: text.slice(0, ms[0].index).trim(), steps, tail: text.slice(last.index + last[0].length).trim() };
}
