"use client";

import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { Icon } from "@/components/ui/icon";
import { LeadImplementerPath } from "@/components/career/li-path";
import { CERT_FAMILIES } from "@/lib/certifications";

/**
 * Certification — the professional certifications GRC work prepares a mentee for, as three rows
 * that wrap rather than scroll: the family (ISO, NIST …), its standards, and the roles each
 * standard certifies (lib/certifications). A live role opens its map of skills to desk work; a
 * planned one says which programme brings it.
 *
 * The chosen family, standard and role live in the URL (?fam=…&std=…&role=…), like the tabs inside them, so the
 * browser's Back returns to the same view.
 */
export default function CertificationPage() {
  return (
    <Suspense fallback={<div className="page-shell"><div className="h-64 animate-pulse rounded-md bg-slate-100" aria-busy="true" /></div>}>
      <Certification />
    </Suspense>
  );
}

/** Marks what the mentee's programme covers. */
const Dot = ({ on }: { on?: boolean }) => <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${on ? "bg-white" : "bg-[#16A34A]"}`} title="Available in your programme" />;

function Certification() {
  const { user } = useAuth();
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const fam = CERT_FAMILIES.find((f) => f.k === params.get("fam")) ?? CERT_FAMILIES[0];
  const std = fam.standards.find((s) => s.k === params.get("std")) ?? fam.standards[0];
  const role = std.roles.find((r) => r.k === params.get("role")) ?? std.roles[0];
  // A new family, standard or role starts its view fresh: the inner tab belonged to the old one.
  const pick = (f: string, s?: string, r?: string) => {
    const q = new URLSearchParams({ fam: f });
    if (s) q.set("std", s);
    if (r) q.set("role", r);
    router.replace(`${pathname}?${q}`, { scroll: false });
  };
  const isLive = (rs: { live?: boolean }[]) => rs.some((r) => r.live);

  return (
    <div className="page-shell space-y-4">
      <header>
        <h1 className="text-[22px] font-bold tracking-[-0.01em] text-[#111827]">Certification</h1>
        <p className="max-w-3xl text-[13.5px] text-[#5B6474]">
          The professional certifications your GRC work prepares you for. Choose a family, a standard and a role to see every skill it asks for and the work where
          you practise it. <span className="inline-flex items-center gap-1"><Dot /> marks what your programme covers.</span>
        </p>
      </header>

      <nav aria-label="Certifications" className="rounded-md border border-[#DDE1E8] bg-white">
        {/* Family: a slim tab strip spanning the bar; equal segments that wrap rather than scroll. */}
        <div role="group" aria-label="Family" className="grid grid-cols-[repeat(auto-fit,minmax(104px,1fr))] border-b border-[#DDE1E8] bg-[#F7F8FA]">
          {CERT_FAMILIES.map((f) => {
            const on = f.k === fam.k;
            return (
              <button
                key={f.k}
                type="button"
                aria-pressed={on}
                title={f.about}
                onClick={() => pick(f.k)}
                className={`relative inline-flex items-center justify-center gap-1.5 whitespace-nowrap px-3 py-2 text-[13px] font-semibold focus-ring ${on ? "bg-white text-[#111827]" : "text-[#5B6474] hover:bg-white/60 hover:text-[#111827]"}`}
              >
                {f.name}
                {isLive(f.standards.flatMap((s) => s.roles)) && <Dot />}
                {on && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-[#4338CA]" aria-hidden />}
              </button>
            );
          })}
        </div>
        {/* Standards: one-line chips; the family prefix is dropped (ISO/IEC 27001 → 27001), the
            full name and what it covers are on hover and on the line below. */}
        {/* A family of one standard needs no choice here: the line below names it. */}
        {fam.standards.length > 1 && (
        <div role="group" aria-label={`${fam.name} standards`} className="grid grid-cols-[repeat(auto-fit,minmax(112px,1fr))] gap-1.5 border-b border-[#E9ECF1] px-4 py-2.5">
          {fam.standards.map((s) => {
            const on = s.k === std.k;
            return (
              <button
                key={s.k}
                type="button"
                aria-pressed={on}
                title={`${s.name} · ${s.about}`}
                onClick={() => pick(fam.k, s.k)}
                className={`inline-flex h-8 items-center justify-center gap-1.5 whitespace-nowrap rounded-[3px] border px-2.5 font-mono text-[12.5px] font-semibold focus-ring ${
                  on ? "border-[#4338CA] bg-[#4338CA] text-white" : "border-[#DDE1E8] bg-white text-[#111827] hover:border-[#C9CED8]"
                }`}
              >
                {s.name.replace(/^ISO(\/IEC)? /, "")}
                {isLive(s.roles) && <Dot on={on} />}
              </button>
            );
          })}
        </div>
        )}
        {/* The chosen standard, named in full, and its roles. */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5">
          <p className="min-w-0 text-[13px] text-[#5B6474]">
            <span className="font-semibold text-[#111827]">{std.name}</span> · {std.about}
          </p>
          <div role="group" aria-label={`${std.name} roles`} className="flex w-full flex-wrap gap-1.5 sm:ml-auto sm:w-auto">
            {std.roles.map((r) => {
              const on = r.k === role.k;
              return (
                <button
                  key={r.k}
                  type="button"
                  aria-pressed={on}
                  onClick={() => pick(fam.k, std.k, r.k)}
                  className={`inline-flex h-8 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-[3px] border px-2.5 text-[12.5px] font-semibold focus-ring sm:flex-none ${
                    on ? "border-[#4338CA] bg-[#4338CA] text-white" : "border-[#DDE1E8] bg-white text-[#111827] hover:border-[#C9CED8]"
                  }`}
                >
                  {!r.live && <Icon name="lock" size={11} className={on ? "text-white/80" : "text-[#8A91A3]"} />}
                  {r.name}
                  <span className={`rounded-[2px] px-1 text-[10.5px] ${on ? "bg-white/20 text-white" : r.live ? "bg-[#F0FDF4] text-[#15803D]" : "bg-[#F3F4F7] text-[#5B6474]"}`}>
                    {r.live ? r.programme : "Planned"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {role.live && std.k === "iso27001" && role.k === "lead-implementer" ? (
        user && <LeadImplementerPath who={user.email} />
      ) : (
        <section className="rounded-md border border-[#DDE1E8] bg-white px-6 py-10 text-center">
          <span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-[#F3F4F7] text-[#8A91A3]">
            <Icon name="lock" size={18} />
          </span>
          <h2 className="mt-3 text-[16px] font-bold text-[#111827]">
            {std.name} {role.name}
          </h2>
          <p className="mx-auto mt-1 max-w-md text-[13.5px] text-[#3F4757]">{role.does}</p>
          <p className="mx-auto mt-2 max-w-md text-[13px] text-[#5B6474]">Not part of GRC 101. This path is planned for GRC 301 and GRC 501, which add more standards and roles.</p>
          <button
            type="button"
            onClick={() => pick("iso", "iso27001", "lead-implementer")}
            className="mt-4 inline-flex items-center gap-1.5 rounded bg-[#4338CA] px-4 py-2 text-[13px] font-semibold text-white hover:brightness-90 focus-ring"
          >
            ISO/IEC 27001 Lead Implementer, in GRC 101 <Icon name="arrowRight" size={14} />
          </button>
        </section>
      )}
    </div>
  );
}
