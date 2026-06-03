"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { authApi, type User } from "@/lib/auth";
import { ApiError, setRefreshHandler } from "@/lib/api";
import { getAccessToken, setAccessToken } from "@/lib/token";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  /** Store a fresh access token and load the current user. */
  signIn: (accessToken: string) => Promise<User>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (u: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

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
      } catch {
        setAccessToken(null);
        return false;
      }
    });
  }

  const loadUser = useCallback(async () => {
    try {
      const me = await authApi.me();
      setUserState(me);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) setUserState(null);
      else setUserState(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
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
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [loadUser]);

  const signIn = useCallback(
    async (accessToken: string) => {
      setAccessToken(accessToken);
      const me = await authApi.me();
      setUserState(me);
      return me;
    },
    [],
  );

  const signOut = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      /* ignore — clear locally regardless */
    }
    setAccessToken(null);
    setUserState(null);
  }, []);

  const refreshUser = useCallback(() => loadUser(), [loadUser]);

  return (
    <AuthContext.Provider
      value={{ user, loading, signIn, signOut, refreshUser, setUser: setUserState }}
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
