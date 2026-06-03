/**
 * Thin typed client for the FastAPI backend.
 * - Converts request bodies camelCase -> snake_case, responses snake_case -> camelCase.
 * - Sends credentials (so the httpOnly refresh cookie flows) and attaches the access token.
 * - On a 401 it tries a single silent refresh via the registered handler, then retries once.
 * - Throws ApiError on non-2xx so callers can branch on status.
 *
 * The backend (http://localhost:8000) owns auth + domain. See ../docs/ARCHITECTURE.md.
 */
import { camelToSnake, snakeToCamel } from "./case";
import { getAccessToken } from "./token";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export interface RequestOptions {
  /** Explicit bearer token; falls back to the stored access token. */
  token?: string;
  /** Skip attaching any auth token (e.g. public auth endpoints). */
  noAuth?: boolean;
  /** Don't attempt the refresh-and-retry dance on 401. */
  noRefresh?: boolean;
  query?: Record<string, string | number | boolean | undefined>;
  init?: RequestInit;
}

/** Registered by the auth layer to avoid a circular import. Returns true if a new token was obtained. */
let refreshHandler: (() => Promise<boolean>) | null = null;
export function setRefreshHandler(fn: (() => Promise<boolean>) | null): void {
  refreshHandler = fn;
}

/** Turn a backend error body into a readable string. FastAPI 422 `detail` is an array of {loc,msg,type}. */
function extractErrorMessage(parsed: unknown, res: Response): string {
  const fallback = res.statusText || `Request failed (${res.status})`;
  if (!parsed || typeof parsed !== "object") return fallback;
  const detail = (parsed as { detail?: unknown }).detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const msgs = detail
      .map((e) => (e && typeof e === "object" && "msg" in e ? String((e as { msg: unknown }).msg) : null))
      .filter(Boolean);
    if (msgs.length) return msgs.join("; ");
  }
  if (detail && typeof detail === "object" && "msg" in detail) return String((detail as { msg: unknown }).msg);
  const message = (parsed as { message?: unknown }).message;
  if (typeof message === "string") return message;
  return fallback;
}

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const url = new URL(path.startsWith("/") ? path : `/${path}`, BASE_URL);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

async function rawRequest(
  method: string,
  path: string,
  body: unknown,
  opts: RequestOptions,
): Promise<Response> {
  const headers = new Headers(opts.init?.headers);
  headers.set("Accept", "application/json");

  const token = opts.noAuth ? undefined : (opts.token ?? getAccessToken() ?? undefined);
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let payload: BodyInit | undefined;
  if (body !== undefined) {
    headers.set("Content-Type", "application/json");
    payload = JSON.stringify(camelToSnake(body));
  }

  return fetch(buildUrl(path, opts.query), {
    credentials: "include",
    ...opts.init,
    method,
    headers,
    body: payload,
  });
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  opts: RequestOptions = {},
): Promise<T> {
  let res = await rawRequest(method, path, body, opts);

  // FastAPI's HTTPBearer returns 403 when the header is missing and 401 when a token is
  // present but invalid/expired — treat both as "try a silent refresh, then retry once".
  const isAuthFailure = res.status === 401 || res.status === 403;
  if (isAuthFailure && !opts.noRefresh && !opts.noAuth && refreshHandler) {
    const refreshed = await refreshHandler();
    if (refreshed) res = await rawRequest(method, path, body, { ...opts, noRefresh: true });
  }

  const text = await res.text();
  const parsed = text ? snakeToCamel(JSON.parse(text)) : undefined;

  if (!res.ok) {
    throw new ApiError(res.status, extractErrorMessage(parsed, res), parsed);
  }

  return parsed as T;
}

export const api = {
  get: <T>(path: string, opts?: RequestOptions) => request<T>("GET", path, undefined, opts),
  post: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>("POST", path, body, opts),
  patch: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>("PATCH", path, body, opts),
  put: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>("PUT", path, body, opts),
  delete: <T>(path: string, opts?: RequestOptions) =>
    request<T>("DELETE", path, undefined, opts),
};
