"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";
import { Icon } from "@/components/ui/icon";
import { ExtendAccessCard } from "@/components/app/extend-access-card";
import { MethodMedal } from "@/components/badges/method-medal";
import { loadDesk, type Desk } from "@/lib/desk/model";
import { useProgress, type Progress } from "@/lib/desk/progress";
import { BADGES, CAPSTONE, DIST_AVG, DIST_MIN, NO_BADGE, PASS, capstoneStanding, criteriaText, standing, type BadgeStanding, type BadgeState, type MethodBadge } from "@/lib/desk/badges";

/**
 * Badges — the GRC 101 method badges (pack v1.9.0): one per family of GRC work methods the mentee
 * practises on graded deliverables, plus the capstone. Read from the Working Desk's progress;
 * earning needs released task scores, which the desk does not have yet, so a badge whose tasks are
 * submitted shows "awaiting scores" rather than claiming to be earned.
 */
export default function BadgesPage() {
  const { user } = useAuth();
  const [desk, setDesk] = useState<Desk | null>(null);
  useEffect(() => {
    loadDesk().then(setDesk, () => {});
  }, []);
  if (!desk || !user) return <div className="page-shell"><div className="h-64 animate-pulse rounded-md bg-slate-100" aria-busy="true" /></div>;
  return <Badges desk={desk} who={user.email} />;
}

const STATE: Record<BadgeState, { l: string; cls: string }> = {
  distinction: { l: "Earned with distinction", cls: "border-[#E9D48A] bg-[#FFFBEB] text-[#92400E]" },
  earned: { l: "Earned", cls: "border-[#BBF7D0] bg-[#F0FDF4] text-[#15803D]" },
  "in-progress": { l: "In progress", cls: "border-[#C7CBF5] bg-[#EEF0FF] text-[#3730A3]" },
  "not-started": { l: "Not started", cls: "border-[#DDE1E8] bg-[#F7F8FA] text-[#5B6474]" },
};

function Pill({ s }: { s: BadgeState }) {
  return <span className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-[3px] border px-1.5 py-0.5 text-[11.5px] font-semibold ${STATE[s].cls}`}>{STATE[s].l}</span>;
}

/** A task on a badge: green once submitted, opening the task on the Working Desk. */
function TaskChip({ id, desk, p, muted }: { id: string; desk: Desk; p: Progress; muted?: boolean }) {
  const done = !!p.submitted[id];
  return (
    <Link
      href={`/app/desk#${id}`}
      title={`${id} ${desk.tasks[id]?.title ?? ""}${done ? " · submitted" : ""}`}
      className={`inline-flex items-center gap-1 rounded-[3px] border px-1.5 py-0.5 font-mono text-[11.5px] font-semibold no-underline focus-ring ${
        done ? "border-[#BBF7D0] bg-[#F0FDF4] text-[#15803D]" : muted ? "border-[#E9ECF1] bg-white text-[#8A91A3] hover:border-[#C9CED8]" : "border-[#DDE1E8] bg-white text-[#111827] hover:border-[#C9CED8]"
      }`}
    >
      {done && <Icon name="check" size={11} strokeWidth={3} />}
      {id}
    </Link>
  );
}

/** "2 of 3 tasks submitted · awaiting scores" — what stands between the mentee and the badge. */
function where(g: BadgeStanding) {
  if (g.state === "earned" || g.state === "distinction") return `Average ${Math.round(g.average ?? 0)}`;
  if (g.submitted === g.total) return `All ${g.total} submitted · awaiting released scores`;
  return `${g.submitted} of ${g.total} task${g.total === 1 ? "" : "s"} submitted`;
}

function Badges({ desk, who }: { desk: Desk; who: string }) {
  const { progress: p } = useProgress(who);
  const rows = BADGES.map((b) => ({ b, g: standing(b, p) }));
  const cap = capstoneStanding(p);
  const earned = rows.filter((r) => r.g.state === "earned" || r.g.state === "distinction").length;
  const dist = rows.filter((r) => r.g.state === "distinction").length;
  const tasks = BADGES.flatMap((b) => b.earn);
  const submitted = tasks.filter((t) => p.submitted[t]).length;

  return (
    <div className="page-shell space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold tracking-[-0.01em] text-[#111827]">Badges</h1>
          <p className="max-w-3xl text-[13.5px] text-[#5B6474]">
            One badge for each family of GRC work methods you practise on graded deliverables, and a capstone for holding all of them. Issued by the Group GRC Office
            with your submissions attached as evidence.
          </p>
        </div>
        <Link href="/app/desk" className="inline-flex h-9 items-center gap-1.5 rounded bg-[#4338CA] px-4 text-[13px] font-semibold text-white no-underline hover:brightness-90 focus-ring">
          Open the Working Desk <Icon name="arrowRight" size={14} />
        </Link>
      </header>

      <dl className="grid grid-cols-2 overflow-hidden rounded-md border border-[#DDE1E8] bg-white lg:grid-cols-4">
        {[
          ["Method badges earned", `${earned} / ${BADGES.length}`],
          ["With distinction", String(dist)],
          ["Badge tasks submitted", `${submitted} / ${tasks.length}`],
          ["Method Portfolio", cap.state === "earned" ? "Earned" : `${earned} / ${BADGES.length}`],
        ].map(([k, v], i) => (
          <div key={k} className={`border-[#DDE1E8] px-4 py-3 ${i % 2 === 0 ? "border-r" : "lg:border-r"} ${i < 2 ? "max-lg:border-b" : ""} last:border-r-0`}>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5B6474]">{k}</dt>
            <dd className="mt-0.5 font-mono text-[18px] font-semibold tabular-nums text-[#111827]">{v}</dd>
          </div>
        ))}
      </dl>

      <p className="flex items-start gap-2 rounded-md border border-[#DDE1E8] bg-[#F7F8FA] px-4 py-2.5 text-[13px] text-[#3F4757]">
        <Icon name="info" size={15} className="mt-0.5 shrink-0 text-[#4338CA]" />
        <span>
          <strong className="text-[#111827]">How a badge is earned:</strong> every task that earns it is submitted and its released score is at least {PASS}.{" "}
          <strong className="text-[#111827]">With distinction:</strong> the average is at least {DIST_AVG} and no task is below {DIST_MIN}. Scores are released after the
          review of each task; until then a badge whose tasks you have submitted shows as awaiting scores.
        </span>
      </p>

      {/* The capstone: the ten method badges in one strip, each lit as it is earned. */}
      <section aria-labelledby="cap" className="flex flex-wrap items-center gap-x-6 gap-y-4 rounded-md border border-[#DDE1E8] bg-white px-5 py-4">
        <MethodMedal badge={CAPSTONE} state={cap.state} size={84} />
        <div className="min-w-[240px] flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 id="cap" className="text-[16px] font-bold text-[#111827]">{CAPSTONE.name}</h2>
            <span className="font-mono text-[11.5px] text-[#8A91A3]">{CAPSTONE.code}</span>
            <Pill s={cap.state} />
          </div>
          <p className="mt-1 text-[13px] leading-relaxed text-[#3F4757]">{CAPSTONE.can}</p>
          <p className="mt-1 text-[12px] text-[#5B6474]">{criteriaText(CAPSTONE)}</p>
        </div>
        <ol aria-label="Method badges" className="flex flex-wrap gap-1.5">
          {rows.map(({ b, g }) => (
            <li key={b.code} title={`${b.name} · ${STATE[g.state].l}`}>
              <a href={`#${b.code}`} className="block rounded focus-ring">
                <MethodMedal badge={b} state={g.state} size={40} />
              </a>
            </li>
          ))}
        </ol>
      </section>

      <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(min(100%,460px),1fr))]">
        {rows.map(({ b, g }) => (
          <BadgeCard key={b.code} b={b} g={g} desk={desk} p={p} />
        ))}
      </div>

      <section aria-labelledby="no-badge" className="overflow-hidden rounded-md border border-[#DDE1E8] bg-white">
        <h2 id="no-badge" className="border-b border-[#DDE1E8] bg-[#F7F8FA] px-4 py-2.5 text-[12px] font-semibold uppercase tracking-[0.06em] text-[#3F4757]">
          Method families without a badge in GRC 101
        </h2>
        <table className="w-full border-collapse text-[13px]">
          <tbody>
            {NO_BADGE.map(([f, why]) => (
              <tr key={f}>
                <th scope="row" className="w-[30%] border-b border-r border-[#E9ECF1] px-4 py-2 text-left align-top font-semibold text-[#111827]">{f}</th>
                <td className="border-b border-[#E9ECF1] px-4 py-2 text-[#3F4757]">{why}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {earned > 0 && <ExtendAccessCard kind="badge" />}
    </div>
  );
}

function BadgeCard({ b, g, desk, p }: { b: MethodBadge; g: BadgeStanding; desk: Desk; p: Progress }) {
  return (
    <article id={b.code} className="flex scroll-mt-4 gap-4 rounded-md border border-[#DDE1E8] bg-white p-4">
      <div className="shrink-0">
        <MethodMedal badge={b} state={g.state} size={88} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h2 className="text-[15.5px] font-bold text-[#111827]">{b.name}</h2>
          <span className="font-mono text-[11.5px] text-[#8A91A3]">{b.code}</span>
          <span className="ml-auto"><Pill s={g.state} /></span>
        </div>
        <p className="text-[12px] leading-snug text-[#5B6474]">
          <span className="font-semibold text-[#3F4757]">{b.family}</span> · {b.methods}
        </p>
        <p className="text-[13px] leading-relaxed text-[#111827]">{b.can}</p>
        <div className="grid gap-1.5 text-[12px]">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="w-[108px] shrink-0 font-semibold text-[#3F4757]">Earned by</span>
            {b.earn.map((t) => <TaskChip key={t} id={t} desk={desk} p={p} />)}
          </div>
          {b.support.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="w-[108px] shrink-0 text-[#5B6474]">Also practised in</span>
              {b.support.map((t) => <TaskChip key={t} id={t} desk={desk} p={p} muted />)}
            </div>
          )}
        </div>
        <p className="mt-auto border-t border-[#E9ECF1] pt-2 text-[12px] text-[#5B6474]">
          <span className="font-semibold text-[#3F4757]">{where(g)}.</span> {criteriaText(b)}
        </p>
      </div>
    </article>
  );
}
