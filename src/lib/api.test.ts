// Run: npx tsx src/lib/api.test.ts
// Parallel 401s must collapse into ONE /auth/refresh. Rotating the refresh cookie more than once
// makes the backend's reuse detection revoke the whole token family and log the learner out.
import assert from "node:assert/strict";
import { ApiError, api, refreshOnce, setRefreshHandler } from "./api";

const tick = () => new Promise((r) => setTimeout(r, 10));

let calls = 0;
const handler = (result: boolean) => async () => {
  calls++;
  await tick();
  return result;
};

async function main() {
  // 5 requests hit 401 together -> one rotation, everyone gets the same answer.
  setRefreshHandler(handler(true));
  calls = 0;
  const results = await Promise.all([refreshOnce(), refreshOnce(), refreshOnce(), refreshOnce(), refreshOnce()]);
  assert.equal(calls, 1, `5 parallel refreshes should rotate once, rotated ${calls}x`);
  assert.deepEqual(results, [true, true, true, true, true], "every waiter gets the refreshed result");

  // The slot clears afterwards, so a later expiry can still refresh.
  await refreshOnce();
  assert.equal(calls, 2, "a refresh after the first settles must actually run");

  // A failed refresh resolves false and must not wedge the slot shut.
  setRefreshHandler(handler(false));
  calls = 0;
  assert.deepEqual(await Promise.all([refreshOnce(), refreshOnce()]), [false, false], "failure propagates");
  assert.equal(calls, 1, "failures dedupe too");
  await refreshOnce();
  assert.equal(calls, 2, "slot reopens after a failure");

  // A rejecting handler must not leave the slot permanently occupied either.
  setRefreshHandler(async () => {
    calls++;
    throw new Error("network down");
  });
  calls = 0;
  await assert.rejects(refreshOnce(), /network down/);
  await assert.rejects(refreshOnce(), /network down/);
  assert.equal(calls, 2, "a rejected refresh clears the slot for the next attempt");

  // No handler registered (signed out) -> false, never a crash.
  setRefreshHandler(null);
  assert.equal(await refreshOnce(), false, "no handler = no refresh");

  // A desk check that never answers is given up on after DESK_TIMEOUT_MS (the clock is shortened here), with an ApiError of
  // status 0; a path that is not a desk check is left alone. A 429 reports the limiter's own text, a proxy's HTML 502 its status.
  const realFetch = globalThis.fetch;
  const realSet = globalThis.setTimeout;
  (globalThis as { setTimeout: unknown }).setTimeout = ((fn: () => void, ms?: number, ...a: unknown[]) => realSet(fn, ms === 15000 ? 5 : ms, ...a)) as typeof setTimeout;
  globalThis.fetch = ((_u: unknown, init?: RequestInit) => new Promise((_res, rej) => init?.signal?.addEventListener("abort", () => rej(new DOMException("aborted", "AbortError"))))) as typeof fetch;
  const stalled = await api.post("/me/desk/rows", { id: "T1.1-1", picks: [] }).catch((e) => e);
  assert.ok(stalled instanceof ApiError && stalled.status === 0 && /did not answer/.test(stalled.message), "a stalled check times out");
  globalThis.fetch = ((_u: unknown, init?: RequestInit) => new Promise((_res, rej) => init?.signal?.addEventListener("abort", () => rej(new Error("x"))))) as typeof fetch;
  let other = "pending";
  void api.get("/me/progress").then(() => (other = "answered"), () => (other = "failed"));
  await new Promise((r) => realSet(r, 60));
  assert.equal(other, "pending", "no timeout on a path that is not a desk check");
  globalThis.fetch = (async () => new Response(JSON.stringify({ error: "Rate limit exceeded: 120 per 1 hour" }), { status: 429 })) as typeof fetch;
  const limited = await api.post("/me/desk/rows", { id: "T1.1-1", picks: [] }).catch((e) => e);
  assert.ok(limited instanceof ApiError && limited.status === 429 && limited.message === "Rate limit exceeded: 120 per 1 hour", "the 429 says the server's text");
  globalThis.fetch = (async () => new Response("<html>bad gateway</html>", { status: 502, statusText: "Bad Gateway" })) as typeof fetch;
  const gateway = await api.post("/me/desk/rows", { id: "T1.1-1", picks: [] }).catch((e) => e);
  assert.ok(gateway instanceof ApiError && gateway.status === 502, "an HTML error page is a status, not a parse error");
  globalThis.fetch = realFetch;
  globalThis.setTimeout = realSet;

  console.log("ok — refreshOnce dedupes concurrent refreshes");
}

main();
