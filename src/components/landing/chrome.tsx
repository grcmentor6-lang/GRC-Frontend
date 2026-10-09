import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Logo } from "@/components/ui/primitives";
import { WAITLIST_MODE } from "@/lib/flags";

// Shared marketing chrome: the sticky nav and the site footer, used by the landing page and
// /work-with-us. Section links are absolute (/#tracks) so they work from either page.

// Pre-launch the app isn't reachable, so every CTA points at the waitlist instead of signup.
export const CTA_HREF = WAITLIST_MODE ? "/waitlist" : "/signup";

const NAV_LINKS: [string, string][] = [
  ["/#industries", "Industries"],
  ["/#program", "Program"],
  ["/#tracks", "Tracks"],
  ["/#faq", "FAQ"],
  ["/work-with-us", "Work with us"],
];

export function Nav({ active }: { active?: string }) {
  return (
    <header className="sticky top-0 z-50 bg-[#FAFAF7]/80 backdrop-blur-xl border-b border-slate-200">
      <div className="max-w-[1140px] 2xl:max-w-[1500px] 3xl:max-w-[1760px] mx-auto px-6 h-16 flex items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map(([href, label]) => (
            <a
              key={href}
              href={href}
              className={`focus-ring rounded-md px-1 py-0.5 text-[13.5px] tracking-tight no-underline transition-colors ${
                active === href
                  ? "font-semibold text-slate-900"
                  : "font-medium text-slate-600 hover:text-slate-900"
              }`}
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2.5">
          {/* Staff entry point, hidden in waitlist mode. Styled as a quiet secondary so it never
              competes with the CTA. (/mentor itself stays reachable via proxy.ts.)
              ponytail: below sm the label drops and it renders as a square shield — the header
              can't fit three labelled controls on a phone, but the button itself must stay. */}
          {!WAITLIST_MODE && (
            <Link
              href="/mentor"
              aria-label="Mentor sign-in"
              className="focus-ring inline-flex items-center justify-center gap-1.5 h-9 w-9 sm:w-auto sm:px-3 rounded-lg ring-1 ring-slate-200 bg-white text-[13px] font-medium text-slate-600 tracking-tight no-underline hover:text-slate-900 hover:ring-slate-300 transition-colors"
            >
              <Icon name="shield" size={13} className="text-indigo-500" />
              <span className="hidden sm:inline">Mentor sign-in</span>
            </Link>
          )}
          {!WAITLIST_MODE && (
            <Link href="/signin" className="focus-ring rounded-md px-1 py-0.5 hidden sm:inline text-[13.5px] font-medium text-slate-600 hover:text-slate-900 tracking-tight no-underline">
              Sign in
            </Link>
          )}
          <Link href={CTA_HREF} className="focus-ring inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-indigo-600 text-white text-[13px] font-semibold tracking-tight no-underline hover:bg-indigo-700 transition-colors shadow-[0_4px_14px_-4px_rgba(79,70,229,0.6)]">
            {WAITLIST_MODE ? "Enrol now" : "Get started"} <Icon name="arrowRight" size={14} />
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  // null href = not launched yet, rendered as plain text rather than a dead link
  const cols: [string, [string, string | null][]][] = [
    // Pre-launch, the track pages and auth routes are unreachable — don't link into a redirect.
    ["Programme", [["GRC 101", WAITLIST_MODE ? null : "/tracks/grc-101"], ["GRC 301 — coming soon", null], ["GRC 501 — coming soon", null]]],
    ["Explore", [["Industries", "/#industries"], ["How it works", "/#program"], ["Tracks", "/#tracks"], ["FAQ", "/#faq"], ["Work with us", "/work-with-us"]]],
    // On a phone the nav's mentor button is icon-only, so this is the labelled entry point.
    WAITLIST_MODE
      ? ["Access", [["Enrol now", "/waitlist"], ["Universities", "/waitlist"]]]
      : ["Account", [["Sign in", "/signin"], ["Create account", "/signup"], ["Mentor sign-in", "/mentor"]]],
  ];
  return (
    <footer className="bg-[#FAFAF7] border-t border-slate-200">
      <div className="max-w-[1140px] 2xl:max-w-[1500px] 3xl:max-w-[1760px] mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <Logo />
          <p className="mt-3 text-[12.5px] text-slate-500 leading-relaxed tracking-tight max-w-[220px]">
            Hands-on governance, risk and compliance mentorship that gets you hired.
          </p>
        </div>
        {cols.map(([title, items]) => (
          <div key={title}>
            <div className="text-[11px] font-semibold tracking-[0.12em] uppercase text-slate-500">{title}</div>
            <div className="mt-3 flex flex-col gap-2">
              {items.map(([l, h]) =>
                h ? (
                  <Link key={l} href={h} className="focus-ring rounded-md px-1 py-0.5 text-[13px] text-slate-600 hover:text-indigo-600 tracking-tight no-underline transition-colors">
                    {l}
                  </Link>
                ) : (
                  <span key={l} className="px-1 py-0.5 text-[13px] text-slate-400 tracking-tight">{l}</span>
                )
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-200">
        <div className="max-w-[1140px] 2xl:max-w-[1500px] 3xl:max-w-[1760px] mx-auto px-6 py-5 flex items-center justify-between flex-wrap gap-3">
          <span className="text-[12px] text-slate-500">© 2026 grcmentor · All rights reserved.</span>
          <div className="flex items-center gap-4 text-[12px] text-slate-500">
            <a href="#" className="focus-ring rounded-md px-1 py-0.5 no-underline hover:text-slate-700">Privacy</a>
            <a href="#" className="focus-ring rounded-md px-1 py-0.5 no-underline hover:text-slate-700">Terms</a>
            <a href="mailto:partner@grcmentor.ai" className="focus-ring rounded-md px-1 py-0.5 no-underline hover:text-slate-700">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
