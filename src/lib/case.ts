/**
 * Boundary helpers between the FastAPI backend (snake_case) and our frontend (camelCase).
 * The backend is the system of record; we convert only at the edge in lib/api.ts.
 */

type Json = null | boolean | number | string | Json[] | { [k: string]: Json };

const snakeToCamelKey = (k: string): string =>
  k.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase());

const camelToSnakeKey = (k: string): string =>
  k.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);

function convertKeys(value: unknown, mapKey: (k: string) => string): unknown {
  if (Array.isArray(value)) return value.map((v) => convertKeys(v, mapKey));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [
        mapKey(k),
        convertKeys(v, mapKey),
      ]),
    );
  }
  return value;
}

/** Deeply convert backend snake_case payloads to camelCase. */
export const snakeToCamel = <T = unknown>(value: Json | unknown): T =>
  convertKeys(value, snakeToCamelKey) as T;

/** Deeply convert frontend camelCase bodies to snake_case for the backend. */
export const camelToSnake = <T = unknown>(value: unknown): T =>
  convertKeys(value, camelToSnakeKey) as T;
