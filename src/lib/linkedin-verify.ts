"use client";

/**
 * Client half of "Sign in with LinkedIn" for the waitlist forms. The backend owns the OAuth
 * round-trip; this hook starts it, then reads the short-lived verification token the callback
 * hands back as ?lv=<jwt> (or ?lv_error=<code>). The token is decoded only for display — the
 * backend re-verifies its signature on submit.
 */
import { useEffect, useState } from "react";

import { LINKEDIN_ENABLED } from "@/lib/flags";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:8000";

const ERRORS: Record<string, string> = {
  linkedin_denied: "LinkedIn sign-in was cancelled. Please try again.",
  state_mismatch: "Your verification session expired. Please start again.",
  state_expired: "Your verification session expired. Please start again.",
  linkedin_error: "Couldn't reach LinkedIn just now. Please try again.",
  no_identity: "LinkedIn didn't share a verified email. Confirm your email on LinkedIn, then retry.",
};

export interface LinkedInIdentity {
  name: string;
  email: string;
}

/** Decode the JWT payload for display only (no verification — that's the backend's job). */
function decodeIdentity(token: string): LinkedInIdentity | null {
  try {
    const b64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const p = JSON.parse(atob(b64));
    if (p.email && p.name) return { name: p.name, email: p.email };
  } catch {
    /* malformed token */
  }
  return null;
}

export function useLinkedInVerify<T>(storageKey: string) {
  const [token, setToken] = useState<string | null>(null);
  const [identity, setIdentity] = useState<LinkedInIdentity | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [restored, setRestored] = useState<T | null>(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    const lv = url.searchParams.get("lv");
    const lvError = url.searchParams.get("lv_error");
    if (!lv && !lvError) return;

    // Bring back the form the user was filling before we bounced them to LinkedIn.
    const stashed = sessionStorage.getItem(storageKey);
    if (stashed) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- restores the stashed form after the redirect; sessionStorage cannot be read while rendering on the server
        setRestored(JSON.parse(stashed) as T);
      } catch {
        /* ignore */
      }
      sessionStorage.removeItem(storageKey);
    }

    if (lv) {
      const id = decodeIdentity(lv);
      if (id) {
        setToken(lv);
        setIdentity(id);
      } else {
        setError("That verification link was invalid. Please try again.");
      }
    } else if (lvError) {
      setError(ERRORS[lvError] ?? "LinkedIn verification failed. Please try again.");
    }

    // Strip the params so a refresh doesn't reprocess a spent token.
    url.searchParams.delete("lv");
    url.searchParams.delete("lv_error");
    window.history.replaceState({}, "", url.pathname + url.search);
  }, [storageKey]);

  const begin = (snapshot: T) => {
    sessionStorage.setItem(storageKey, JSON.stringify(snapshot));
    window.location.href = `${API_BASE}/waitlist/linkedin/start`;
  };

  return { enabled: LINKEDIN_ENABLED, token, identity, error, restored, begin };
}
