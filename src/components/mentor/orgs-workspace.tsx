"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { loadOrg, peekOrg } from "@/components/mentor/desk-context";
import { isAuthError, type OrgDetail, type OrgSummary } from "@/lib/mentor";

/**
 * The organisations a mentor's learners are engaged on — the dashboard's second tab.
 *
 * The console's second home, and the one view the per-learner desk could not give. A mentor
 * reviews people, but the work those people do belongs to an organisation — and the same
 * organisation recurs across several learners, because the variant draws each learner's eight
 * engagements from one pool of seventeen. "What is happening at LearnTech, and who is on it" was
 * unanswerable without opening every mentee in turn.
 *
 * The briefing shown here is the seed's own text: the same context the mentee read and the grader
 * was grounded in. A reviewer judging "did they apply this to *this* organisation" is reading the
 * identical source rather than a summary of it.
 */
export function OrgsWorkspace({ orgs }: { orgs: OrgSummary[] | null }) {
  const params = useSearchParams();
  const selected = params.get("org");

  const active = selected ?? orgs?.[0]?.id ?? null;

  return (
    <div className="grid min-h-0 overflow-hidden rounded-2xl ring-1 ring-slate-200 md:grid-cols-[240px_minmax(0,1fr)] lg:grid-cols-[268px_minmax(0,1fr)]">
      <OrgSidebar
        orgs={orgs}
        activeId={active}
        onPick={(id) => selectOrg(id)}
      />
      {/* Three states, not two. `active` is null both while the list is still loading and when a
          mentor genuinely has no organisations, and rendering an empty div covered the first case
          with a blank panel for as long as the list took — which reads as broken, not as busy. */}
      {active ? (
        <OrgPane orgId={active} />
      ) : orgs === null ? (
        <PaneSkeleton />
      ) : (
        <div className="grid place-items-center bg-white p-10 text-center">
          <div>
            <div className="text-[13.5px] font-semibold text-slate-800">No organisations yet</div>
            <p className="mt-1 text-[12.5px] text-slate-500">
              They appear as soon as a learner is assigned to you.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Put the chosen organisation in the URL without navigating.
 *
 * `router.replace` looked right and was not: changing a search param that way is a navigation, so
 * every click cost a server round trip — measured at ~2s here — during which the pane went on
 * showing the *previous* organisation. Nothing was loading, so nothing said so, and clicking down
 * the list looked like clicking on nothing. `window.history.replaceState` is the documented way to
 * do this: Next integrates it with the router, so `useSearchParams` updates on the spot.
 */
function selectOrg(id: string): void {
  const params = new URLSearchParams(window.location.search);
  params.set("tab", "orgs");
  params.set("org", id);
  window.history.replaceState(null, "", `?${params.toString()}`);
}

function OrgSidebar({
  orgs,
  activeId,
  onPick,
}: {
  orgs: OrgSummary[] | null;
  activeId: string | null;
  onPick: (id: string) => void;
}) {
  const [q, setQ] = useState("");
  const [waitingOnly, setWaitingOnly] = useState(false);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (orgs ?? []).filter(
      (o) =>
        (!waitingOnly || o.pending > 0) &&
        (needle === "" ||
          `${o.name} ${o.industry} ${o.headOffice}`.toLowerCase().includes(needle)),
    );
  }, [orgs, q, waitingOnly]);

  const waiting = (orgs ?? []).filter((o) => o.pending > 0).length;

  return (
    <div className="flex max-h-[72vh] min-h-0 flex-col border-b border-[#e6eaf0] bg-slate-50/60 md:border-b-0 md:border-r">
      <div className="flex shrink-0 flex-col gap-2.5 px-3 pb-3 pt-4">
        <div className="flex items-center gap-2 px-0.5">
          <h2 className="text-[13px] font-semibold tracking-tight text-slate-900">Organisations</h2>
          <span className="flex h-[18px] items-center rounded-md bg-slate-200/70 px-1.5 text-[10px] font-semibold tabular-nums text-slate-600">
            {orgs?.length ?? "—"}
          </span>
        </div>
        <div className="relative">
          <Icon
            name="search"
            size={13}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search…"
            aria-label="Search organisations"
            className="h-8 w-full rounded-lg bg-white pl-8 pr-2.5 text-[12px] text-slate-700 ring-1 ring-slate-200 outline-none transition-all placeholder:text-slate-400 focus:ring-indigo-300"
          />
        </div>
        <button
          onClick={() => setWaitingOnly((v) => !v)}
          disabled={orgs === null}
          aria-pressed={waitingOnly}
          className={`h-7 rounded-lg text-[11px] font-medium transition-colors ${
            waitingOnly
              ? "bg-indigo-600 text-white"
              : "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-slate-300 disabled:text-slate-400"
          }`}
        >
          {waitingOnly
            ? "Showing queue only"
            : orgs === null
              ? "Awaiting my review"
              : `Awaiting my review (${waiting})`}
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-2 pb-4">
        {orgs === null ? (
          [0, 1, 2, 3].map((i) => (
            <div key={i} className="h-[46px] animate-pulse rounded-xl bg-slate-200/70" />
          ))
        ) : list.length === 0 ? (
          <div className="py-10 text-center text-[11.5px] text-slate-400">No match.</div>
        ) : (
          list.map((o) => {
            const on = o.id === activeId;
            return (
              <button
                key={o.id}
                onClick={() => onPick(o.id)}
                aria-current={on ? "true" : undefined}
                className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors ${
                  on
                    ? "bg-white shadow-[0_2px_8px_-4px_rgba(15,23,42,0.12)] ring-1 ring-slate-200"
                    : "hover:bg-white/70"
                }`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold ${
                    on ? "bg-indigo-600 text-white" : "bg-indigo-50 text-indigo-700"
                  }`}
                >
                  {o.id}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={`block truncate text-[12.5px] ${
                      on ? "font-semibold text-slate-900" : "font-medium text-slate-700"
                    }`}
                  >
                    {o.name}
                  </span>
                  <span className="block truncate text-[10.5px] tabular-nums text-slate-400">
                    {o.mentees} mentee{o.mentees === 1 ? "" : "s"} · {o.approved}/{o.gates} decided
                  </span>
                </span>
                {o.pending > 0 && (
                  <span
                    className={`flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full px-1 text-[10px] font-semibold tabular-nums ${
                      o.overdue > 0 ? "bg-[#a31d1d] text-white" : "bg-indigo-100 text-indigo-700"
                    }`}
                  >
                    {o.pending}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

export const PANES = [
  { id: "context", label: "Overview" },
  { id: "data", label: "Data & processes" },
  { id: "std", label: "Standards & regulators" },
  { id: "people", label: "Stakeholders" },
  { id: "infra", label: "Infrastructure" },
  { id: "mentees", label: "Mentees" },
] as const;

type PaneId = (typeof PANES)[number]["id"];

function OrgPane({ orgId }: { orgId: string }) {
  const [org, setOrg] = useState<OrgDetail | null>(() => peekOrg(orgId) ?? null);
  const [pane, setPane] = useState<PaneId>("context");

  // Reset during render when the organisation changes, so one org's briefing is never on screen
  // under another's name.
  // Seeded from the cache: an organisation already opened this session paints with no skeleton.
  const [prev, setPrev] = useState(orgId);
  if (prev !== orgId) {
    setPrev(orgId);
    setOrg(peekOrg(orgId) ?? null);
  }

  useEffect(() => {
    let live = true;
    loadOrg(orgId)
      .then((r) => live && setOrg(r))
      .catch((e) => {
        if (!isAuthError(e)) console.error(e);
      });
    return () => {
      live = false;
    };
  }, [orgId]);

  if (!org) return <PaneSkeleton />;

  return (
    <div className="flex min-h-0 flex-col bg-white px-5 py-5 lg:px-6">
      <div className="flex shrink-0 flex-wrap items-start gap-3.5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-[13px] font-bold text-white">
          {org.id}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[18px] font-semibold leading-tight tracking-[-0.02em] text-slate-900">
            {org.name}
          </h1>
          <div className="mt-0.5 flex flex-wrap items-center gap-2">
            <span className="text-[12px] font-medium text-indigo-700">{org.industry}</span>
            {org.subIndustry && (
              <>
                <span className="h-3 w-px bg-slate-200" />
                <span className="text-[11.5px] text-slate-500">{org.subIndustry}</span>
              </>
            )}
            {org.headOffice && (
              <>
                <span className="h-3 w-px bg-slate-200" />
                <span className="text-[11.5px] text-slate-400">{org.headOffice}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-5">
          {(
            [
              ["Mentees", org.mentees.length],
              ["Delivered", org.mentees.reduce((n, m) => n + m.gates, 0)],
              ["Awaiting", org.mentees.reduce((n, m) => n + m.pending, 0)],
            ] as const
          ).map(([label, value], i) => (
            <div key={label} className="text-right">
              <div
                className={`text-[17px] font-semibold leading-none tabular-nums ${
                  i === 2 && value > 0 ? "text-indigo-600" : "text-slate-900"
                }`}
              >
                {value}
              </div>
              <div className="mt-1 text-[10px] text-slate-400">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3.5 flex shrink-0 items-end gap-3 border-b border-slate-200">
        {/* Wraps rather than scrolls. `overflow-x-auto` makes the browser compute `overflow-y`
            as auto too, so this row — whose buttons sit 1px proud of it via `-mb-px` — grew a
            *vertical* scrollbar on a 36px-tall strip. Six short labels wrap onto a second line on
            a narrow screen, and then there is no overflow on either axis to scroll. */}
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-0.5">
          {PANES.map((s) => {
            const on = s.id === pane;
            return (
              <button
                key={s.id}
                onClick={() => setPane(s.id)}
                aria-pressed={on}
                className={`-mb-px h-9 whitespace-nowrap border-b-2 px-2.5 text-[12px] font-medium transition-colors ${
                  on
                    ? "border-indigo-600 text-slate-900"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                {s.label}
                {s.id === "mentees" && ` (${org.mentees.length})`}
              </button>
            );
          })}
        </div>
      </div>

      <div className="@container min-h-0 flex-1 pb-1 pt-3.5">
        {pane === "context" && <PaneOverview o={org} />}
        {pane === "data" && <PaneData o={org} />}
        {pane === "std" && <PaneStandards o={org} />}
        {pane === "people" && <PanePeople o={org} />}
        {pane === "infra" && <PaneInfra o={org} />}
        {pane === "mentees" && <PaneMentees o={org} />}
      </div>
    </div>
  );
}

/** What the detail side shows whenever it has nothing to show yet — list or organisation. */
function PaneSkeleton() {
  return (
    <div className="flex flex-col gap-3 bg-white p-5">
      <div className="h-11 w-80 animate-pulse rounded-lg bg-slate-100" />
      <div className="h-9 w-full max-w-[560px] animate-pulse rounded-lg bg-slate-100" />
      <div className="grid gap-3.5 @md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div className="h-52 animate-pulse rounded-2xl bg-slate-100" />
        <div className="h-52 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    </div>
  );
}

function Card({
  title,
  icon,
  meta,
  children,
}: {
  title: string;
  icon?: React.ComponentProps<typeof Icon>["name"];
  meta?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col rounded-2xl bg-white p-4 ring-1 ring-slate-200">
      <div className="mb-3 flex shrink-0 items-center gap-2">
        {icon && <Icon name={icon} size={14} className="text-indigo-500" />}
        <h4 className="text-[12.5px] font-semibold tracking-tight text-slate-900">{title}</h4>
        {meta && (
          <span className="ml-auto text-[9.5px] font-semibold uppercase tracking-[0.1em] text-slate-400">
            {meta}
          </span>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}

const Bullets = ({ items, empty }: { items: string[]; empty: string }) =>
  items.length === 0 ? (
    <p className="text-[11.5px] text-slate-400">{empty}</p>
  ) : (
    <div className="flex flex-col gap-1">
      {items.map((x) => (
        <div key={x} className="flex items-start gap-2 py-1">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
          <span className="text-[12px] leading-snug text-slate-700">{x}</span>
        </div>
      ))}
    </div>
  );

export function PaneOverview({ o }: { o: OrgDetail }) {
  const regional = o.officeLocations.regionalOffices ?? [];
  // Nine of the seventeen have no services list and most have no regulator rationale, so for them
  // the second column held nothing — and an empty track still takes its share of the row, which
  // squeezed the context into 55% of the width beside a blank half.
  const aside = o.services.length > 0 || !!o.regulatorRationale;
  return (
    <div
      className={`grid gap-3.5 ${aside ? "@md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]" : ""}`}
    >
      <div className="flex flex-col gap-3.5">
        <div className="rounded-2xl bg-gradient-to-br from-indigo-50/70 via-white to-white p-4 ring-1 ring-slate-200">
          <p className="text-[12.5px] leading-relaxed text-slate-600">{o.context || "—"}</p>
          {o.regulator && (
            <div className="mt-3 flex items-start gap-2 rounded-xl bg-indigo-50/70 px-3 py-2.5 ring-1 ring-indigo-100">
              <Icon name="shield" size={13} className="mt-0.5 shrink-0 text-indigo-500" />
              <div className="text-[11.5px] leading-snug text-slate-700">
                <span className="font-semibold text-slate-900">Primary regulator — </span>
                {o.regulator}
              </div>
            </div>
          )}
        </div>
        <Card title="Office locations" icon="mapPin" meta={`${regional.length + 1} site${regional.length ? "s" : ""}`}>
          <div className="flex flex-col gap-1.5">
            {[o.officeLocations.headOffice ?? o.headOffice, ...regional]
              .filter(Boolean)
              .map((city, i) => (
                <div key={city} className="flex items-center gap-2.5 rounded-xl bg-slate-50/80 px-3 py-2">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                  <span className="flex-1 truncate text-[12px] text-slate-700">{city}</span>
                  <span className="shrink-0 text-[9.5px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                    {i === 0 ? "Head office" : "Regional"}
                  </span>
                </div>
              ))}
          </div>
        </Card>
      </div>
      {aside && (
      <div className="flex flex-col gap-3.5">
        {/* An empty card announcing "0" reads as a fault in the page rather than a gap in the
            briefing, so each of these is present only when it has something to say. */}
        {o.services.length > 0 && (
          <Card title="Services & products" icon="briefcase" meta={`${o.services.length}`}>
            <div className="flex flex-wrap gap-1.5">
              {o.services.map((sv) => (
                <span
                  key={sv}
                  className="rounded-lg bg-indigo-50 px-2 py-1 text-[11px] leading-tight text-indigo-700 ring-1 ring-indigo-100"
                >
                  {sv}
                </span>
              ))}
            </div>
          </Card>
        )}
        {o.regulatorRationale && (
          <Card title="Why that regulator" icon="info">
            <p className="text-[12px] leading-relaxed text-slate-600">{o.regulatorRationale}</p>
          </Card>
        )}
      </div>
      )}
    </div>
  );
}

export const PaneData = ({ o }: { o: OrgDetail }) => (
  <div className="grid gap-3.5 @md:grid-cols-2">
    <Card title="Client data handled" icon="shield" meta={`${o.clientData.length} types`}>
      <div className="flex flex-wrap gap-1.5">
        {o.clientData.map((d) => (
          <span
            key={d}
            className="rounded-lg bg-slate-50 px-2 py-1 text-[11px] leading-tight text-slate-700 ring-1 ring-slate-200"
          >
            {d}
          </span>
        ))}
      </div>
    </Card>
    <Card title="Customer-facing processes" icon="refresh" meta={`${o.processes.length}`}>
      <Bullets items={o.processes} empty="None recorded." />
    </Card>
  </div>
);

export const PaneStandards = ({ o }: { o: OrgDetail }) => (
  <div className="grid gap-3.5 @md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
    <Card title="Standards" icon="checkCircle" meta={`${o.mandatoryStandards.length} mandatory`}>
      <div className="flex flex-col gap-1.5">
        {o.mandatoryStandards.map((s) => (
          <div
            key={s}
            className="flex items-center gap-2.5 rounded-xl bg-emerald-50/60 px-3 py-2 ring-1 ring-emerald-100"
          >
            <Icon name="check" size={12} className="shrink-0 text-emerald-600" />
            <span className="text-[12px] text-slate-700">{s}</span>
          </div>
        ))}
        {o.optionalStandards.length > 0 && (
          <>
            <div className="mt-2 text-[9.5px] font-semibold uppercase tracking-[0.1em] text-slate-400">
              Optional
            </div>
            {o.optionalStandards.map((s) => (
              <div key={s} className="flex items-center gap-2.5 px-3 py-1">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
                <span className="text-[12px] text-slate-600">{s}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </Card>
    <Card title="Regulatory requirements" icon="flag" meta={`${o.regulatoryRequirements.length}`}>
      <Bullets items={o.regulatoryRequirements} empty="None recorded." />
    </Card>
  </div>
);

export const PanePeople = ({ o }: { o: OrgDetail }) => (
  <div className="grid items-start gap-3.5 @md:grid-cols-2">
    <Card title="Internal parties" icon="users">
      <Bullets items={o.interestedParties.internal ?? []} empty="None recorded." />
    </Card>
    <Card title="External parties" icon="grid">
      <Bullets items={o.interestedParties.external ?? []} empty="None recorded." />
    </Card>
  </div>
);

export const PaneInfra = ({ o }: { o: OrgDetail }) => (
  <div className="grid items-start gap-3.5 @md:grid-cols-2">
    <Card title="On-premises" icon="cube" meta="Self-hosted">
      <Bullets items={o.informationAssets.onPremises ?? []} empty="None recorded." />
    </Card>
    <Card title="Cloud" icon="layers" meta="Hosted">
      <Bullets items={o.informationAssets.cloud ?? []} empty="None recorded." />
    </Card>
  </div>
);

export const PaneMentees = ({ o }: { o: OrgDetail }) => (
  <div className="grid items-start gap-3 @md:grid-cols-2 @4xl:grid-cols-3">
    {o.mentees.map((m) => (
      <div key={m.userId} className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
        <div className="flex items-start gap-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-[11px] font-semibold text-white">
            {m.name
              .split(/\s+/)
              .filter(Boolean)
              .slice(0, 2)
              .map((p) => p[0]?.toUpperCase() ?? "")
              .join("") || "?"}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-semibold tracking-tight text-slate-900">
              {m.name}
            </div>
            <div className="truncate text-[10.5px] text-slate-400">{m.email}</div>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2.5">
          <span className="block h-1 flex-1 overflow-hidden rounded-full bg-slate-100">
            <span
              className="block h-full rounded-full bg-indigo-500"
              style={{ width: `${m.gates ? (m.approved / m.gates) * 100 : 0}%` }}
            />
          </span>
          <span className="shrink-0 text-[10.5px] font-medium tabular-nums text-slate-500">
            {m.approved}/{m.gates}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="text-[11px] tabular-nums text-slate-500">
            {m.pending > 0 ? (
              <span className={m.waitedDays > 2 ? "text-[#a31d1d]" : undefined}>
                {m.pending} waiting · {m.waitedDays}d
              </span>
            ) : (
              "Nothing waiting"
            )}
          </span>
          <Link
            href={`/mentor/desk/${m.userId}`}
            className="inline-flex h-7 items-center gap-1.5 rounded-lg bg-slate-900 px-2.5 text-[11px] font-medium text-white no-underline transition-colors hover:bg-slate-800"
          >
            Review <Icon name="arrowRight" size={11} />
          </Link>
        </div>
      </div>
    ))}
  </div>
);
