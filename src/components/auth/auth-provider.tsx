"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { authApi, type User } from "@/lib/auth";
import { ApiError, setRefreshHandler } from "@/lib/api";
import { getAccessToken, setAccessToken, userKey } from "@/lib/token";
import { hydrateQueryCache, invalidateQuery } from "@/lib/use-query";
import { flushProgress } from "@/lib/desk/progress-sync";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  /** Store a fresh access token and load the current user. `remember` picks the storage location. */
  signIn: (accessToken: string, remember?: boolean) => Promise<User>;
  /** Clears the session and hard-navigates to `to`. */
  signOut: (to?: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (u: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * The signed-in user, mirrored into the tab's own storage so a refresh has something to paint
 * before `GET /me` answers. Per-tab and namespaced by the token's subject: a different account
 * signing in on the same browser gets its own slot, and closing the tab takes the copy with it.
 * It is a *display* seed only — never an authorisation decision, which the backend makes on every
 * request regardless.
 */
const USER_KEY = () => `grcu:${userKey()}`;

function cachedUser(): User | null {
  try {
    const raw = sessionStorage.getItem(USER_KEY());
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function cacheUser(u: User): void {
  try {
    sessionStorage.setItem(USER_KEY(), JSON.stringify(u));
  } catch {
    /* storage unavailable — the spinner path still works */
  }
}

function forgetUser(): void {
  try {
    for (const k of Object.keys(sessionStorage)) if (k.startsWith("grcu:")) sessionStorage.removeItem(k);
  } catch {
    /* nothing was written either */
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Register the silent refresh used by lib/api on 401.
  const registered = useRef(false);
  if (!registered.current) {
    registered.current = true;
    setRefreshHandler(async () => {
      try {
        const r = await authApi.refresh();
        setAccessToken(r.accessToken);
        return true;
      } catch (e) {
        // Only a definitive rejection means the session is really gone — drop it and let
        // RouteGuard bounce them to sign in. A network blip / backend hiccup must NOT log a
        // learner out mid-activity; that path just fails the request and keeps the session.
        if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
          setAccessToken(null);
          setUserState(null);
        }
        return false;
      }
    });
  }

  const loadUser = useCallback(async () => {
    try {
      const me = await authApi.me();
      setUserState(me);
      cacheUser(me);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) setUserState(null);
      else setUserState(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    // Everything below is a network round trip, and RouteGuard holds the whole app behind a
    // full-screen spinner until it finishes — so a plain refresh cost a blank screen, then a
    // second cold wait while each page fetched rows it had shown a moment ago. Both are answered
    // from the tab's own storage first: the app paints from what it already knows and the network
    // becomes a revalidation. Done here rather than in a render initializer because this effect is
    // the first client-only code to run, and the pages it unblocks all mount after it.
    hydrateQueryCache();
    const known = cachedUser();
    if (known) {
      setUserState(known);
      setLoading(false); // revalidated below; a 401 there still drops them back to sign-in
    }
    (async () => {
      // No access token yet? Try the refresh cookie before giving up.
      if (!getAccessToken()) {
        try {
          const r = await authApi.refresh();
          setAccessToken(r.accessToken);
        } catch {
          /* not signed in */
        }
      }
      if (getAccessToken()) await loadUser();
      else if (known) setUserState(null); // the seed outlived the session
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [loadUser]);

  const signIn = useCallback(
    async (accessToken: string, remember = true) => {
      // The query cache is module-level and keyed by data, not by user — anything left from a
      // previous session would render under this one's name. Same on sign-out below.
      invalidateQuery();
      forgetUser();
      setAccessToken(accessToken, remember);
      const me = await authApi.me();
      setUserState(me);
      cacheUser(me);
      return me;
    },
    [],
  );

  const signOut = useCallback(async (to = "/") => {
    flushProgress(); // while the token is still good
    try {
      await authApi.logout();
    } catch {
      /* ignore — clear locally regardless */
    }
    invalidateQuery();
    forgetUser();
    setAccessToken(null);
    setUserState(null);
    // Hard navigation, not router.replace. A client-side route change keeps the JS module graph
    // alive, so every module-level cache, in-flight refresh promise and memo from this account
    // survives into the next one signing in on the same tab. Reloading drops the lot — including
    // any cache added here later, which a hand-maintained list of invalidations would miss.
    window.location.replace(to);
  }, []);

  const refreshUser = useCallback(() => loadUser(), [loadUser]);

  // Every write to the user goes through here, so the seed can't drift from what the app is
  // showing — a start date set this session must be in the copy the next refresh paints from, or
  // the desk flashes its start-date gate at somebody who already passed it.
  const setUser = useCallback((u: User) => {
    setUserState(u);
    cacheUser(u);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, signIn, signOut, refreshUser, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
