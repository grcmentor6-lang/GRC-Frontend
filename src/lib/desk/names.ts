/**
 * The name swap behind the learner's desk identity (see identity.ts), with no imports so that content modules, the
 * API client and the hook can all use it without an import cycle.
 *
 * The content and the server's answer keys keep the canonical names. Fetched content is copied through `deepMap`;
 * the desk's static content modules (registers, guides, decision contexts, their JSON) register themselves with
 * `localizable` and are rewritten in place whenever the identity changes. With the canonical identity every
 * function here is the identity function and nothing is touched.
 */

export interface DeskOrg {
  key: "A" | "B";
  /** "GlobalConnect Customer Solutions" */
  name: string;
  /** "GlobalConnect" */
  short: string;
  /** "globalconnect.example" */
  domain: string;
}

export interface DeskIdentity {
  menteeId: string;
  orgs: DeskOrg[];
}

export const CANONICAL: DeskIdentity = {
  menteeId: "M2610-00001",
  orgs: [
    { key: "A", name: "GlobalConnect Customer Solutions", short: "GlobalConnect", domain: "globalconnect.example" },
    { key: "B", name: "LearnTech Educational Solutions", short: "LearnTech", domain: "learntech.example" },
  ],
};

const org = (id: DeskIdentity, k: "A" | "B") => id.orgs?.find((o) => o.key === k) ?? CANONICAL.orgs.find((o) => o.key === k)!;

/** The strings that name an identity, longest first: full names, full names as file-name parts, short names, domains, mentee ID. */
function terms(id: DeskIdentity): string[] {
  const [a, b] = [org(id, "A"), org(id, "B")];
  return [a.name, b.name, a.name.replace(/ /g, "_"), b.name.replace(/ /g, "_"), a.short, b.short, a.domain, b.domain, id.menteeId || CANONICAL.menteeId];
}

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** from → to on a string. Matched whole: never inside a longer word or number. */
export function swapper(from: DeskIdentity, to: DeskIdentity): (s: string) => string {
  const [f, t] = [terms(from), terms(to)];
  const map = new Map<string, string>();
  f.forEach((x, i) => x !== t[i] && !map.has(x) && map.set(x, t[i]));
  if (!map.size) return (s) => s;
  const re = new RegExp(`(?<![A-Za-z0-9])(?:${[...map.keys()].map(esc).join("|")})(?![A-Za-z0-9])`, "g");
  return (s) => s.replace(re, (m) => map.get(m)!);
}

/** A copy of `v` with every string (not keys) passed through `f`. */
export function deepMap<T>(v: T, f: (s: string) => string): T {
  if (typeof v === "string") return f(v) as T;
  if (Array.isArray(v)) return v.map((x) => deepMap(x, f)) as T;
  if (v && typeof v === "object" && Object.getPrototypeOf(v) === Object.prototype)
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, deepMap(x, f)])) as T;
  return v;
}

/** Rewrite every string inside `v`'s plain objects and arrays in place (functions and keys left alone). */
function mapInPlace(v: unknown, f: (s: string) => string, seen: WeakSet<object>): void {
  if (!v || typeof v !== "object" || seen.has(v)) return;
  seen.add(v);
  if (!Array.isArray(v) && Object.getPrototypeOf(v) !== Object.prototype) return;
  const o = v as Record<string, unknown>;
  for (const k of Object.keys(o)) {
    const x = o[k];
    if (typeof x === "string") {
      const y = f(x);
      if (y !== x) o[k] = y;
    } else mapInPlace(x, f, seen);
  }
}

let current: DeskIdentity = CANONICAL;
const CANON_KEY = JSON.stringify(CANONICAL);
let currentKey = CANON_KEY;
let learner = (s: string) => s;
let canon = (s: string) => s;
const targets: object[] = [];
const listeners = new Set<() => void>();

export const deskIdentityNow = () => current;
/** Canonical content → what this learner sees. */
export const toLearner = (s: string) => learner(s);
/** What this learner typed or picked → canonical, for the server's keys. */
export const toCanon = (s: string) => canon(s);

/**
 * Content modules hand their exported data here once; it is rewritten now if a learner identity is already set,
 * and again on every change. ponytail: strings a module builds inside a function from its own literals are not
 * reached; wrap those in `toLearner`.
 */
export function localizable(...objs: object[]): void {
  for (const o of objs) {
    targets.push(o);
    if (currentKey !== CANON_KEY) mapInPlace(o, learner, new WeakSet());
  }
}

/** Called when something cached from content (a parsed document) must be rebuilt for a new identity. */
export function onIdentityChange(fn: () => void): void {
  listeners.add(fn);
}

/** Make `next` the desk's identity. A no-op when it is already current, so it is safe to call on every render. */
export function setDeskIdentity(next: DeskIdentity | null | undefined): void {
  const n = next?.menteeId && next.orgs?.length ? next : CANONICAL;
  const key = JSON.stringify(n);
  if (key === currentKey) return;
  const step = swapper(current, n);
  const seen = new WeakSet<object>();
  for (const o of targets) mapInPlace(o, step, seen);
  current = n;
  currentKey = key;
  learner = swapper(CANONICAL, n);
  canon = swapper(n, CANONICAL);
  listeners.forEach((fn) => fn());
}
