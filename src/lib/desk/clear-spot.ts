/** Where a toolbar menu or a floating window may sit so it does not cover the step panel's controls (laptop widths). */
export type R = { l: number; t: number; r: number; b: number };

const area = (a: R, b: R) => Math.max(0, Math.min(a.r, b.r) - Math.max(a.l, b.l)) * Math.max(0, Math.min(a.b, b.b) - Math.max(a.t, b.t));

/**
 * The first candidate that costs least: covering a panel control is 50x worse than covering other modal controls.
 * Ties keep the earlier candidate, so list the default spot first and nothing moves unless something is covered.
 */
export function pickSpot(cands: { x: number; y: number }[], w: number, h: number, panel: R[], other: R[]) {
  const cost = (c: { x: number; y: number }) => {
    const win = { l: c.x, t: c.y, r: c.x + w, b: c.y + h };
    return 50 * panel.reduce((s, p) => s + area(win, p), 0) + other.reduce((s, p) => s + area(win, p), 0);
  };
  return cands.reduce((best, c) => (cost(c) < cost(best) ? c : best), cands[0]);
}

/**
 * Where a window at (x, y) sits when pushed down just under the panel controls it would cover (a button in the panel's
 * top strip), or null if that leaves it past the bottom edge. A window beside the step can then lie over the panel's
 * text rather than over "Show me how".
 */
export function clearBelow(x: number, y: number, w: number, h: number, panel: R[], vh: number): number | null {
  const hit = panel.filter((c) => c.r > x && c.l < x + w && c.b > y && c.t < y + h);
  if (!hit.length) return y;
  const to = Math.max(...hit.map((c) => c.b)) + 8;
  const again = panel.some((c) => c.r > x && c.l < x + w && c.b > to && c.t < to + h);
  return again || to + h > vh - 90 ? null : to;
}

/** A menu's left edge: where it wants to be, or beside the step panel (left of it, else right) when that would sit across it. */
export function menuLeft(want: number, w: number, min: number, max: number, panel: R | null) {
  const clamp = (x: number) => Math.max(min, Math.min(x, max));
  const x = clamp(want);
  if (!panel || x + w <= panel.l || x >= panel.r) return x;
  if (panel.l - w - 8 >= min) return panel.l - w - 8;
  if (panel.r + 8 <= max) return panel.r + 8;
  return x; // no room: where it was
}
