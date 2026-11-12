/**
 * Pre-launch switch. With NEXT_PUBLIC_WAITLIST_MODE=1 the site serves only the landing page
 * and /waitlist — every other route redirects (see ../proxy.ts) and the landing CTAs point at
 * the waitlist instead of signup. Unset it and the full app comes back; nothing else changes.
 */
export const WAITLIST_MODE = process.env.NEXT_PUBLIC_WAITLIST_MODE === "1";

/**
 * "Sign in with LinkedIn" verification on the waitlist / reviewer forms. Set to "1" ONLY once the
 * backend LinkedIn env vars are configured — otherwise the button appears but /waitlist/linkedin/start
 * 404s. See src/lib/linkedin-verify.ts.
 */
export const LINKEDIN_ENABLED = process.env.NEXT_PUBLIC_LINKEDIN_ENABLED === "1";

/**
 * Every week of the Working Desk open for every mentee, not only admins (2026-10-20, by request,
 * for testing). ponytail: a constant, not an env var — set it to false to restore the weekly
 * release (week n opens 7·(n−1) days after the mentee's start).
 */
export const ALL_WEEKS_OPEN = true;

/**
 * Every knowledge check and exam open regardless of the week's submissions. Off since 12 Nov 2026 (owner: "enable the
 * locking now"); it was on from 11 Nov for testing.
 * ponytail: a constant like ALL_WEEKS_OPEN; backend/app/services/desk_kc.py KC_ALL_OPEN must say the same, since the
 * server enforces the rule too. Set both to false to restore "opens once the week's tasks are submitted".
 */
export const KC_ALL_OPEN = false;

/**
 * The accounts for whom the desk's order is lifted (owner, 12 Nov 2026): every task and step opens whatever came
 * before it, and every knowledge check whatever was submitted. Everyone else works in order (lib/desk/locks.ts).
 * backend/app/core/config.py `desk_open_for` must list the same addresses: the server enforces the checks' rule.
 */
export const OPEN_DESK_FOR = ["anshulchutani37@gmail.com"];
export const deskOpenFor = (email: string | null | undefined) => !!email && OPEN_DESK_FOR.includes(email.trim().toLowerCase());
