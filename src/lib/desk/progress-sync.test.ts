/**
 * Self-check for the desk's save queue. Run: npx tsx src/lib/desk/progress-sync.test.ts
 * ponytail: plain asserts with a stubbed fetch, as use-query.test.ts. The browser behaviour is in the walks.
 */
import assert from "node:assert/strict";

const g = globalThis as unknown as Record<string, unknown>;
const mem = new Map<string, string>();
g.localStorage = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => mem.set(k, v), removeItem: (k: string) => mem.delete(k) };
g.location = { href: "http://x/app/desk" };
let serverDoc: string | null = null;
let down = false;
const patches: string[] = [];
let inFlight = 0;
let most = 0;
g.fetch = async (url: string, init: RequestInit) => {
  if (init.method === "GET") {
    if (down) throw new Error("down");
    return new Response(JSON.stringify({ data: serverDoc }));
  }
  inFlight++;
  most = Math.max(most, inFlight);
  await new Promise((r) => setTimeout(r, 20));
  inFlight--;
  if (down) throw new Error("down");
  if (init.method === "PATCH") patches.push(JSON.parse(init.body as string).data);
  else serverDoc = JSON.parse(init.body as string).data;
  return new Response("{}");
};
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const { ProgressStore } = await import("./progress-sync");

  // A failed read leaves nothing to save over, and a retry recovers.
  down = true;
  const a = new ProgressStore("a");
  await a.load();
  assert.equal(a.status, "failed");
  a.update((p) => ({ ...p, done: { x: true } }));
  assert.equal(a.progress.done.x, undefined);
  down = false;
  serverDoc = JSON.stringify({ done: { old: true }, grids: { G: { "0,0": "a" } } });
  await a.load();
  assert.equal(a.status, "ready");
  assert.equal(a.progress.done.old, true);

  // Fast typing: one request carrying the last value, a delete, and no whole document.
  for (let i = 0; i < 5; i++) a.update((p) => ({ ...p, answers: { ...p.answers, k: `v${i}` } }));
  a.update((p) => ({ ...p, done: {} }));
  assert.equal(a.saveState, "saving");
  await wait(1200);
  assert.equal(patches.length, 1);
  const first = JSON.parse(patches[0]);
  assert.deepEqual(first.set, { answers: { k: "v4" } });
  assert.deepEqual(first.del, { done: ["old"] });
  assert.equal(a.saveState, "saved");

  // A failure keeps the value, a newer one wins the retry, and only one request is ever out.
  down = true;
  a.update((p) => ({ ...p, msgs: { m: "A" }, labCaptures: [] }));
  await wait(1100);
  assert.equal(a.saveState, "unsaved");
  a.update((p) => ({ ...p, msgs: { m: "B" } }));
  down = false;
  await wait(2200);
  assert.equal(a.saveState, "saved");
  assert.equal(most, 1);
  const last = JSON.parse(patches[patches.length - 1]);
  assert.equal(last.set.msgs.m, "B");
  assert.deepEqual(last.set.labCaptures, []);

  // Closing: under the keepalive limit now, the larger entry stays queued.
  a.update((p) => ({ ...p, answers: { ...p.answers, small: "s", big: "x".repeat(70_000) } }));
  a.flush(true);
  await wait(60);
  assert.equal(JSON.parse(patches[patches.length - 1]).set.answers.small, "s");
  assert.equal(JSON.parse(patches[patches.length - 1]).set.answers.big, undefined);
  await wait(1200);
  assert.equal(JSON.parse(patches[patches.length - 1]).set.answers.big.length, 70_000);

  // One-time move: a newer browser copy goes up and the key goes; an older one is dropped.
  mem.set("grc101.desk.v7.b", JSON.stringify({ done: { mine: true }, savedAt: 9 }));
  serverDoc = JSON.stringify({ done: {}, savedAt: 5 });
  const b = new ProgressStore("b");
  await b.load();
  assert.equal(b.progress.done.mine, true);
  assert.equal(JSON.parse(serverDoc!).done.mine, true);
  assert.equal(mem.size, 0);
  mem.set("grc101.desk.v7.c", JSON.stringify({ done: { stale: true }, savedAt: 1 }));
  const c = new ProgressStore("c");
  await c.load();
  assert.equal(c.progress.done.stale, undefined);
  assert.equal(mem.size, 0);

  // A full document: an update is the caller's copy plus a compare of the section it changed.
  const grids: Record<string, Record<string, string>> = {};
  for (let i = 0; i < 300; i++) grids[`T${i}`] = Object.fromEntries(Array.from({ length: 300 }, (_, j) => [`${j},1`, "x".repeat(20)]));
  const doc = { grids, done: Object.fromEntries(Array.from({ length: 400 }, (_, i) => [`T-${i}`, true])) };
  serverDoc = JSON.stringify(doc);
  const d = new ProgressStore("d");
  await d.load();
  const began = performance.now();
  for (let i = 0; i < 100; i++) d.update((p) => ({ ...p, grids: { ...p.grids, T7: { ...p.grids.T7, "0,1": `v${i}` } } }));
  const ms = (performance.now() - began) / 100;
  console.log(`update on a ${(serverDoc.length / 1e6).toFixed(1)} MB document: ${ms.toFixed(3)} ms`);
  assert.ok(ms < 16);
  console.log("PASS progress-sync");
  process.exit(0);
}
main();
