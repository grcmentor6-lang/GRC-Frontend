/**
 * The desk's saved work, one store per signed-in person, shared by every useProgress on the page.
 *
 * The server's copy is the only copy (GET and PATCH /me/desk/progress). `update` changes memory and notes which
 * keys moved: nothing here serialises the document or waits for the network. Saves go one at a time, as deltas.
 * See the note at the top of progress.ts.
 */
import { api } from "@/lib/api";
import type { Progress } from "./progress";

const PATH = "/me/desk/progress";
/** Pause after the last change before saving, and the longest a change waits while the learner keeps typing. */
const SAVE_AFTER_MS = 1000;
const SAVE_WITHIN_MS = 5000;
const RETRY_FROM_MS = 2000;
const RETRY_UP_TO_MS = 30000;
/** Below the server's MAX_DELTA_CHARS. */
const CHUNK_CHARS = 800_000;
/** A keepalive request's body must stay under 64 KB. */
const KEEPALIVE_BYTES = 60_000;

export const EMPTY: Progress = { done: {}, picks: {}, answers: {}, submitted: {}, msgs: {}, acks: {}, grids: {}, logs: {}, decisions: {} };

const OBJECT_SECTIONS = ["done", "picks", "answers", "submitted", "msgs", "acks", "grids", "logs", "decisions", "rowChecks", "labs"] as const;

export type LoadStatus = "loading" | "failed" | "ready";
export type SaveState = "saved" | "saving" | "unsaved";

/** "section\0key" → the value to set, or DROP. labCaptures, a list, is one entry with no key. */
const DROP = Symbol("drop");
const SEP = "\0";

/** The keys `next` changed from `prev`, by reference: an update touches one or two keys, and sections are copied on write. */
function changes(prev: Progress, next: Progress, into: Map<string, unknown>) {
  for (const s of OBJECT_SECTIONS) {
    const a = (prev[s] ?? {}) as Record<string, unknown>;
    const b = (next[s] ?? {}) as Record<string, unknown>;
    if (a === b) continue;
    for (const k in b) if (a[k] !== b[k]) into.set(s + SEP + k, b[k]);
    for (const k in a) if (!(k in b)) into.set(s + SEP + k, DROP);
  }
  if (prev.labCaptures !== next.labCaptures) into.set("labCaptures" + SEP, next.labCaptures ?? []);
}

/** The pending entries that fit in `limit` characters. `atLeastOne`: a single larger entry still goes, alone. */
function take(pending: Map<string, unknown>, limit: number, atLeastOne: boolean) {
  const out = new Map<string, unknown>();
  let chars = 0;
  for (const [id, v] of pending) {
    const n = id.length + (v === DROP ? 0 : JSON.stringify(v).length) + 8;
    if (chars + n > limit && !(atLeastOne && !out.size)) continue;
    out.set(id, v);
    chars += n;
  }
  return out;
}

function encode(entries: Map<string, unknown>, savedAt: number | undefined) {
  const set: Record<string, unknown> = {};
  const del: Record<string, string[]> = {};
  for (const [id, v] of entries) {
    const at = id.indexOf(SEP);
    const s = id.slice(0, at);
    const k = id.slice(at + 1);
    if (s === "labCaptures") set[s] = v;
    else if (v === DROP) (del[s] ??= []).push(k);
    else ((set[s] ??= {}) as Record<string, unknown>)[k] = v;
  }
  return JSON.stringify({ set, del, savedAt });
}

/**
 * F1.2 step 3 was checked against a key with two unscorable rows until 2026-10-28, when they got
 * answers. A check saved before then still carries a "not scored" row, so that step is reopened
 * empty: its check, completion and the rows it fills (column D, rows 2 onward; row 1 is step 2's).
 * ponytail: one hard-coded step; remove once testers have reloaded.
 */
function resetStaleRowChecks(p: Progress): Progress {
  const id = "F1.2-3";
  const chk = p.rowChecks?.[id];
  if (!chk || !Object.values(chk.rows).some((r) => r.correct === null)) return p;
  const rowChecks = { ...p.rowChecks };
  const done = { ...p.done };
  const logs = { ...p.logs };
  delete rowChecks[id];
  delete done[id];
  delete logs[id];
  const grids = Object.fromEntries(
    Object.entries(p.grids).map(([k, cells]) => [
      k,
      k.startsWith("F1.2|") ? Object.fromEntries(Object.entries(cells).filter(([c]) => !/^[1-9]\d*,3$/.test(c))) : cells,
    ]),
  );
  return { ...p, rowChecks, done, logs, grids };
}

const localKey = (who: string) => `grc101.desk.v7.${who}`;

export class ProgressStore {
  progress: Progress = EMPTY;
  status: LoadStatus = "loading";
  saveState: SaveState = "saved";

  private loading = false;
  private listeners = new Set<() => void>();
  private pending = new Map<string, unknown>();
  private sending = false;
  private failures = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private firstQueued = 0;

  constructor(private who: string) {}

  subscribe = (cb: () => void) => {
    this.listeners.add(cb);
    if (this.status !== "ready") void this.load();
    return () => void this.listeners.delete(cb);
  };

  private emit() {
    for (const l of [...this.listeners]) l();
  }

  private setSaveState(s: SaveState) {
    if (s === this.saveState) return;
    this.saveState = s;
    this.emit();
  }

  /** Opening: /app/desk?reset=1 empties this person's desk; otherwise the server's copy, after any one-time move up. */
  load = async () => {
    if (this.loading || this.status === "ready" || !this.who) return;
    this.loading = true;
    this.status = "loading";
    this.emit();
    try {
      const url = new URL(location.href);
      if (url.pathname.endsWith("/app/desk") && url.searchParams.has("reset")) {
        // Dated now, and sent whole: it replaces what the server holds. The address is cleaned so a reload cannot wipe again.
        const empty = { ...EMPTY, savedAt: Date.now() };
        await api.put(PATH, { data: JSON.stringify(empty) });
        this.forgetLocal();
        url.searchParams.delete("reset");
        history.replaceState(null, "", url);
        this.progress = empty;
      } else {
        const r = await api.get<{ data?: string | null }>(PATH);
        const server = r?.data ? ({ ...EMPTY, ...JSON.parse(r.data) } as Progress) : null;
        this.progress = await this.moveUp(server);
      }
      this.status = "ready";
      const fixed = resetStaleRowChecks(this.progress);
      if (fixed !== this.progress) this.update(() => fixed);
    } catch {
      this.status = "failed"; // the desk shows Try again: nothing is ever saved over a copy we could not read
    }
    this.loading = false;
    this.emit();
  };

  /**
   * One time only: a browser that still holds a copy from before the move to the database, newer than the
   * server's, sends it up whole. A failed send keeps the copy for the next try.
   */
  private async moveUp(server: Progress | null): Promise<Progress> {
    let local: Progress | null = null;
    try {
      const raw = localStorage.getItem(localKey(this.who));
      if (raw) local = { ...EMPTY, ...JSON.parse(raw) } as Progress;
    } catch {
      /* blocked storage or a broken copy: nothing to move */
    }
    if (local && (!server || (local.savedAt ?? 0) > (server.savedAt ?? 0))) {
      await api.put(PATH, { data: JSON.stringify(local) });
      this.forgetLocal();
      return local;
    }
    this.forgetLocal();
    return server ?? EMPTY;
  }

  private forgetLocal() {
    try {
      for (const v of ["", "v2.", "v3.", "v4.", "v5.", "v6.", "v7."]) localStorage.removeItem(`grc101.desk.${v}${this.who}`);
    } catch {
      /* blocked storage: nothing was there to read either */
    }
  }

  /** ponytail: dropped before the load. Only the desk writes, and it mounts once the load is done. */
  update = (fn: (p: Progress) => Progress) => {
    if (this.status !== "ready") return;
    const prev = this.progress;
    const next = fn(prev);
    if (next === prev) return;
    const before = this.pending.size;
    changes(prev, next, this.pending);
    this.progress = { ...next, savedAt: Date.now() };
    if (!this.pending.size && !before) return this.emit();
    if (!this.firstQueued) this.firstQueued = this.progress.savedAt!;
    if (!this.failures) this.schedule(Math.min(SAVE_AFTER_MS, Math.max(0, this.firstQueued + SAVE_WITHIN_MS - Date.now())));
    if (this.saveState === "saved") this.saveState = "saving";
    this.emit();
  };

  private schedule(ms: number) {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.timer = null;
      void this.send(false);
    }, ms);
  }

  /** One request at a time; what queues behind it goes next, together. A delta is repeatable, so a retry is safe. */
  private async send(closing: boolean) {
    if ((this.sending && !closing) || !this.pending.size) return;
    const entries = closing ? take(this.pending, KEEPALIVE_BYTES - 10_000, false) : take(this.pending, CHUNK_CHARS, true);
    if (!entries.size) return;
    for (const id of entries.keys()) this.pending.delete(id);
    const data = encode(entries, this.progress.savedAt);
    // keepalive on every small save, so one in the air when the tab closes still lands.
    const keepalive = data.length < KEEPALIVE_BYTES && new TextEncoder().encode(JSON.stringify({ data })).length < KEEPALIVE_BYTES;
    if (!closing) this.sending = true;
    this.firstQueued = 0;
    try {
      await api.patch(PATH, { data }, { init: { keepalive } });
      this.failures = 0;
    } catch {
      for (const [id, v] of entries) if (!this.pending.has(id)) this.pending.set(id, v); // a newer value stays
      this.failures++;
      this.setSaveState("unsaved");
    }
    if (!closing) this.sending = false;
    if (!this.pending.size) {
      if (!this.sending) this.setSaveState("saved");
    } else if (this.failures) {
      this.schedule(Math.min(RETRY_FROM_MS * 2 ** (this.failures - 1), RETRY_UP_TO_MS));
    } else if (!closing) {
      this.schedule(SAVE_AFTER_MS);
    }
  }

  /** The tab is hiding or closing, the connection is back, or the learner is signing out: send now. */
  flush(closing: boolean) {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    void this.send(closing);
    // ponytail: what does not fit one keepalive body waits here; if the tab really closes, that part is lost.
    if (this.pending.size) this.schedule(this.failures ? RETRY_FROM_MS : SAVE_AFTER_MS);
  }

  get unsaved() {
    return this.pending.size > 0 || this.sending;
  }
}

const stores = new Map<string, ProgressStore>();

export function storeFor(who: string): ProgressStore {
  let s = stores.get(who);
  if (!s) stores.set(who, (s = new ProgressStore(who)));
  if (stores.size === 1 && typeof window !== "undefined") listen();
  return s;
}

/** Before the token goes (sign-out) or the page does. */
export const flushProgress = (closing = true) => stores.forEach((s) => s.flush(closing));

function listen() {
  addEventListener("pagehide", () => flushProgress());
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushProgress();
  });
  addEventListener("online", () => flushProgress(false));
  // There is no copy in the browser any more, so unsaved work that cannot leave would die with the tab.
  addEventListener("beforeunload", (e) => {
    if ([...stores.values()].some((s) => s.saveState === "unsaved")) e.preventDefault();
  });
}
