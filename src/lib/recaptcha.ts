/**
 * Google reCAPTCHA helper. Built for v3 (invisible, score-based): we lazy-load the script
 * and call grecaptcha.execute(siteKey, { action }) to mint a token on form submit.
 *
 * If the configured site key turns out to be v2, only this file changes (swap to a rendered
 * widget). See ../../docs/ARCHITECTURE.md locked decision #5.
 */
const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";

interface Grecaptcha {
  ready: (cb: () => void) => void;
  execute: (siteKey: string, opts: { action: string }) => Promise<string>;
}
declare global {
  interface Window {
    grecaptcha?: Grecaptcha;
  }
}

let scriptPromise: Promise<void> | null = null;

function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(label)), ms)),
  ]);
}

function loadScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("reCAPTCHA needs a browser"));
  if (window.grecaptcha) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = withTimeout(
    new Promise<void>((resolve, reject) => {
      const s = document.createElement("script");
      s.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`;
      s.async = true;
      s.defer = true;
      s.onload = () => resolve();
      s.onerror = () =>
        reject(new Error("Couldn't load reCAPTCHA — check your connection or disable ad/privacy blockers."));
      document.head.appendChild(s);
    }),
    10000,
    "reCAPTCHA timed out loading — check your connection or disable ad/privacy blockers.",
  ).catch((e) => {
    scriptPromise = null; // allow a retry on the next submit
    throw e;
  });

  return scriptPromise;
}

/** Wait until grecaptcha is fully initialised (execute exists) — it isn't ready the instant the script loads. */
async function waitForGrecaptcha(ms = 8000): Promise<Grecaptcha | null> {
  const start = Date.now();
  while (Date.now() - start < ms) {
    const g = window.grecaptcha;
    if (g && typeof g.execute === "function" && typeof g.ready === "function") return g;
    await new Promise((r) => setTimeout(r, 80));
  }
  return null;
}

/** Returns a captcha token for the given action; "" if no site key is configured (dev fallback). */
export async function getCaptchaToken(action: string): Promise<string> {
  if (!SITE_KEY) return "";
  await loadScript();

  const grecaptcha = await waitForGrecaptcha();
  if (!grecaptcha) {
    // Only after waiting do we conclude it's genuinely unavailable (e.g. a v2 key).
    throw new Error("reCAPTCHA isn't available (the site key may be v2, not v3).");
  }

  await new Promise<void>((resolve) => grecaptcha.ready(() => resolve()));
  try {
    return await withTimeout(grecaptcha.execute(SITE_KEY, { action }), 10000, "reCAPTCHA timed out.");
  } catch (e) {
    throw new Error(e instanceof Error ? e.message : "reCAPTCHA failed.");
  }
}
