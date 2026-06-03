/**
 * Access-token store. The backend issues a short-lived access_token in the JSON body and
 * keeps the refresh token in an httpOnly cookie (POST /auth/refresh takes no body), so we
 * only persist the access token here. Kept in memory + localStorage so it survives reloads.
 */
const KEY = "grc_access_token";

let memo: string | null = null;
const listeners = new Set<(t: string | null) => void>();

export function getAccessToken(): string | null {
  if (memo !== null) return memo;
  if (typeof window === "undefined") return null;
  memo = window.localStorage.getItem(KEY);
  return memo;
}

export function setAccessToken(token: string | null): void {
  memo = token;
  if (typeof window !== "undefined") {
    if (token) window.localStorage.setItem(KEY, token);
    else window.localStorage.removeItem(KEY);
  }
  listeners.forEach((fn) => fn(token));
}

export function onTokenChange(fn: (t: string | null) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
