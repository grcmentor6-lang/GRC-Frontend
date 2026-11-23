"use client";

import { useEffect, useState } from "react";
import { userKey } from "./token";

/**
 * Tiny stale-while-revalidate cache for GET data, shared across the whole app via a
 * module-level cache. Repeat navigations render cached data instantly and revalidate in
 * the background — so moving between Dashboard / Learnings / Desk / Career feels instant
 * after the first load. Keyed by a stable string (e.g. "learnings:grc101").
 *
 * The map lives for as long as the JS module graph does, which is *not* as long as the tab: a
 * plain browser refresh drops it, and every screen went back to a cold network wait for rows it
 * had just shown. So each entry is mirrored into sessionStorage and read back by
 * `hydrateQueryCache()` on boot. sessionStorage rather than localStorage because this is one
 * learner's own progression, and a per-tab store already dies at exactly the point the data stops
 * being theirs to show; `userKey()` namespaces it besides, since a second account signing in on
 * the same browser must never inherit the first one's tree.
 */
const cache = new Map<string, unknown>();
const inflight = new Map<string, Promise<unknown>>();

const PREFIX = () => `grcq:${userKey()}:`;

/** Every prefix this module's eviction is allowed to sweep: the query cache and the task bundles
 *  in `lib/task-bundle`, which share the same few MB of sessionStorage and the same lifetime. */
const OWNED = ["grcq:", "grcb:"];

/** Drop everything we've written. Used on sign-out, and to make room when the tab's storage fills:
 *  once a quota error lands, nothing further persists until something goes, and silently falling
 *  back to a cold fetch forever is worse than starting the mirror again from empty. */
export function clearPersistedCache(): void {
  try {
    for (const k of Object.keys(sessionStorage)) {
      if (OWNED.some((p) => k.startsWith(p))) sessionStorage.removeItem(k);
    }
  } catch {
    /* storage unavailable — nothing was written either */
  }
}

/**
 * Mirror one value into sessionStorage under a fully-qualified key. Best-effort by design: if the
 * tab is out of room we evict our own entries once and retry, and if it still won't fit (or
 * storage is blocked entirely) the in-memory cache carries on alone and the only cost is a refetch
 * after a refresh — which is what every read cost before any of this existed.
 */
export function persistJSON(fullKey: string, value: unknown): void {
  let body: string;
  try {
    body = JSON.stringify(value);
  } catch {
    return; // not serialisable — nothing to mirror
  }
  try {
    sessionStorage.setItem(fullKey, body);
  } catch {
    clearPersistedCache();
    try {
      sessionStorage.setItem(fullKey, body);
    } catch {
      /* genuinely too big, or storage disabled */
    }
  }
}

function persist(key: string, value: unknown): void {
  persistJSON(PREFIX() + key, value);
}

function forget(key?: string): void {
  if (!key) return clearPersistedCache();
  try {
    sessionStorage.removeItem(PREFIX() + key);
  } catch {
    /* storage unavailable */
  }
}

/**
 * Pull the persisted entries back into memory. Called once from the auth bootstrap, which is the
 * only place guaranteed to run on the client *before* any authed page mounts — seeding during a
 * component's first render instead would make the client's markup disagree with the server's.
 */
export function hydrateQueryCache(): void {
  try {
    const p = PREFIX();
    for (const k of Object.keys(sessionStorage)) {
      if (!k.startsWith(p)) continue;
      const raw = sessionStorage.getItem(k);
      if (raw) cache.set(k.slice(p.length), JSON.parse(raw));
    }
  } catch {
    /* storage unavailable or a corrupt entry — fall back to fetching */
  }
}

/** Drop a cache entry (or all) — call after a mutation so the next read refetches. */
export function invalidateQuery(key?: string) {
  if (key) cache.delete(key);
  else cache.clear();
  forget(key);
}

/** Carry a cached value to another key so a key bump shows stale data (loader) not a cold skeleton. */
export function carryQuery(from: string, to: string) {
  if (cache.has(from)) {
    cache.set(to, cache.get(from));
    persist(to, cache.get(from));
  }
}

/**
 * Warm a key without rendering it — for data a screen is about to need but isn't showing yet.
 * No-ops when it's already cached or already being fetched, so calling it on hover or on mount
 * costs nothing after the first time.
 */
export function prefetchQuery<T>(key: string, fetcher: () => Promise<T>): void {
  if (cache.has(key) || inflight.has(key)) return;
  const p = fetcher();
  inflight.set(key, p);
  p.then((fresh) => { cache.set(key, fresh); persist(key, fresh); })
    .catch(() => {}) // a prefetch that fails is not an error anyone asked about
    .finally(() => inflight.delete(key));
}

export function useCachedQuery<T>(key: string | null, fetcher: () => Promise<T>) {
  const [data, setData] = useState<T | undefined>(() => (key ? (cache.get(key) as T | undefined) : undefined));
  const [loading, setLoading] = useState<boolean>(() => (key ? !cache.has(key) : false));
  const [error, setError] = useState<unknown>(null);

  // When the key changes (e.g. switching program tabs) reset synchronously during render to the
  // new key's cached value, so we never flash the previous key's data before the effect runs.
  const [prevKey, setPrevKey] = useState(key);
  if (key !== prevKey) {
    setPrevKey(key);
    setData(key ? (cache.get(key) as T | undefined) : undefined);
    setLoading(key ? !cache.has(key) : false);
    setError(null);
  }

  useEffect(() => {
    if (!key) return;
    let cancelled = false;

    const cached = cache.get(key) as T | undefined;
    if (cache.has(key)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- shows the cached or empty state at once when the key changes
      setData(cached);
      setLoading(false); // show stale data immediately
    } else {
      setLoading(true);
    }

    // Dedupe concurrent requests for the same key across components.
    let p = inflight.get(key) as Promise<T> | undefined;
    if (!p) {
      p = fetcher();
      inflight.set(key, p);
      p.finally(() => inflight.delete(key));
    }
    p.then((fresh) => {
      if (cancelled) return;
      cache.set(key, fresh);
      persist(key, fresh);
      setData(fresh);
      setError(null);
    })
      .catch((e) => { if (!cancelled) setError(e); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  /** Update the cache + local value optimistically (e.g. after a submit). */
  const mutate = (next: T) => {
    if (key) { cache.set(key, next); persist(key, next); }
    setData(next);
  };

  return { data, loading: loading && data === undefined, revalidating: loading, error, mutate };
}
