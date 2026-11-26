// Where a guide card goes on a phone (guided-tour.tsx phonePlace): never over what it points at. Run: npx tsx <this file>
import assert from "node:assert/strict";
import { phonePlace } from "./guided-tour";

const VW = 390, VH = 844, FULL = 420, SHORT = 100;
const box = (top: number, height: number, left = 20, width = 350) => ({ top, left, width, height });
const covers = (p: { top: number }, h: number, t: { top: number; height: number }) => p.top < t.top + t.height && p.top + h > t.top;

// A target in the upper half: the whole card below it.
{
  const t = box(80, 120);
  const r = phonePlace([t], VW, VH, FULL, SHORT);
  assert.equal(r.fit, "full");
  assert.equal(r.pos.side, "bottom");
  assert.ok(!covers(r.pos, FULL, t));
}
// In the lower half: above it.
{
  const t = box(600, 120);
  const r = phonePlace([t], VW, VH, FULL, SHORT);
  assert.equal(r.fit, "full");
  assert.equal(r.pos.side, "top");
  assert.ok(!covers(r.pos, FULL, t));
}
// No room for the whole card on either side: the short form, still clear of it.
{
  const t = box(300, 300);
  const r = phonePlace([t], VW, VH, FULL, SHORT);
  assert.equal(r.fit, "compact");
  assert.ok(!covers(r.pos, SHORT, t));
}
// A tall target (a decision's options, a whole document): docked to the bottom edge.
{
  const r = phonePlace([box(60, 760)], VW, VH, FULL, SHORT);
  assert.equal(r.fit, "dock");
  assert.equal(r.pos.top, VH - SHORT - 14);
}
// A tall target with a cell pointed at inside it: beside the cell, never on it.
{
  const cell = box(200, 40);
  const r = phonePlace([box(60, 760), cell], VW, VH, FULL, SHORT);
  assert.equal(r.fit, "full");
  assert.ok(!covers(r.pos, FULL, cell));
}
// Never on a window raised over the card's layer.
{
  const t = box(80, 120);
  const raised = { top: 220, left: 0, width: 390, height: 500 };
  const r = phonePlace([t], VW, VH, FULL, SHORT, raised);
  assert.equal(r.fit, "dock");
}
console.log("guided-tour placement: ok");
