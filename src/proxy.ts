import { NextResponse, type NextRequest } from "next/server";

import { WAITLIST_MODE } from "@/lib/flags";

// Next 16 renamed the `middleware` convention to `proxy`.
// Pre-launch, the only things the public may reach are the landing page, the waitlist form and
// the Assessment Board recruitment page.
// Everything else — the app, signin, signup, tracks, cv — redirects to /waitlist.
// /verify/<id> stays open: an issued certificate's link and QR must work whatever the launch state.
const PUBLIC_PATHS = new Set(["/", "/waitlist", "/work-with-us"]);

// The mentor console is staff tooling, not part of the public launch. Mentors review and
// calibrate during the pre-launch window, so waitlist mode must not lock them out of it.
// Its own login guards it; the waitlist gate is about hiding the unlaunched learner product.
const STAFF_PREFIX = "/mentor";

export function proxy(request: NextRequest) {
  if (!WAITLIST_MODE) return NextResponse.next();

  const { pathname } = request.nextUrl;
  if (PUBLIC_PATHS.has(pathname)) return NextResponse.next();
  if (pathname === STAFF_PREFIX || pathname.startsWith(`${STAFF_PREFIX}/`)) return NextResponse.next();
  if (pathname.startsWith("/verify/")) return NextResponse.next();

  return NextResponse.redirect(new URL("/waitlist", request.url));
}

export const config = {
  // Skip Next internals and anything with a file extension (favicon, images, robots.txt) so
  // static assets on the landing page keep loading.
  matcher: ["/((?!_next/static|_next/image|.*\\.[\\w]+$).*)"],
};
