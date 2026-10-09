"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useDragControls } from "framer-motion";
import { Icon } from "@/components/ui/icon";
import { OrgLogo, logoFor } from "@/components/app/org-logo";
import { loadDesk, type Desk, type Org } from "@/lib/desk/model";

/** The full organisation record a mentee works for, as the engine issues it. */
export type OrgFull = Org & {
  code: string;
  hq: string;
  addendum: string;
  assets: string;
  labels: string;
  audit: string;
  obj: string;
  tasks: string[];
  standards: string[][];
  records: [string, string][];
};
type Key = "A" | "B";
type Tab = "overview" | "offices" | "standards" | "records" | "legal";
const TABS: { k: Tab; l: string }[] = [
  { k: "overview", l: "Overview" },
  { k: "offices", l: "Offices" },
  { k: "standards", l: "Standards" },
  { k: "records", l: "Records" },
  { k: "legal", l: "Legal" },
];

const press = "transition-transform duration-150 ease-out active:scale-[0.97] focus-ring";

/** The organisation's badge, the same one the rest of the app draws for it. */
function Monogram({ org, size = "h-11 w-11", icon = 36 }: { org: OrgFull; size?: string; icon?: number }) {
  return <OrgLogo org={logoFor(org.name)} className={size} iconSize={icon} />;
}

function useDesk(): Desk | null {
  const [desk, setDesk] = useState<Desk | null>(null);
  useEffect(() => {
    loadDesk().then(setDesk, () => setDesk(null));
  }, []);
  return desk;
}

/**
 * One organisation in a box the mentee can drag anywhere, so its profile stays in view beside the
 * work. Each organisation has its own box, so both can be open side by side. The title bar is the
 * handle; the record is in tabs below.
 */
export function OrgBox({ open, orgKey, onClose }: { open: boolean; orgKey: Key; onClose: () => void }) {
  const desk = useDesk();
  const key = orgKey;
  const [tab, setTab] = useState<Tab>("overview");
  const controls = useDragControls();
  const bounds = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const org = desk?.orgs[key] as OrgFull | undefined;

  return (
    <AnimatePresence>
      {open && (
        <div ref={bounds} className={`pointer-events-none fixed inset-0 ${key === "A" ? "z-[60]" : "z-[61]"}`}>
          <motion.section
            drag
            dragListener={false}
            dragControls={controls}
            dragMomentum={false}
            dragConstraints={bounds}
            dragElastic={0.04}
            initial={{ opacity: 0, scale: 0.96, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.12 } }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            style={{ transformOrigin: "top left" }}
            className={`pointer-events-auto absolute top-[72px] flex ${key === "A" ? "left-3 md:left-[84px]" : "left-3 md:left-[84px] lg:left-[660px]"} max-h-[calc(100dvh-96px)] w-[min(560px,calc(100vw-24px))] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_28px_70px_-22px_rgba(15,23,42,0.45),0_2px_8px_rgba(15,23,42,0.08)] ring-1 ring-slate-200`}
            role="dialog"
            aria-label={org?.name ?? `Org ${key}`}
          >
            <header
              onPointerDown={(e) => controls.start(e)}
              className="flex shrink-0 cursor-grab touch-none select-none items-center gap-3 border-b border-slate-100 px-4 pb-3 pt-3.5 active:cursor-grabbing"
            >
              {org ? <Monogram org={org} size="h-10 w-10" icon={34} /> : <span className="h-10 w-10 animate-pulse rounded-full bg-slate-100" />}
              <div className="min-w-0 flex-1">
                <p className="text-[11.5px] font-medium text-slate-500">Org {key} · {key === "A" ? "your main organisation" : "your second organisation"}</p>
                <h2 className="truncate text-[15.5px] font-semibold text-slate-900">{org?.name ?? "Loading…"}</h2>
              </div>
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={onClose}
                aria-label="Close"
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 ${press}`}
              >
                <Icon name="x" size={16} />
              </button>
            </header>

            <nav role="tablist" aria-label="Organisation details" className="flex shrink-0 gap-1 overflow-x-auto border-b border-slate-100 px-3 [scrollbar-width:none]">
              {TABS.map((t) => (
                <button
                  key={t.k}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.k}
                  onClick={() => setTab(t.k)}
                  className={`relative shrink-0 px-2.5 py-2.5 text-[13px] font-medium focus-ring ${tab === t.k ? "text-slate-900" : "text-slate-500 hover:text-slate-800"}`}
                >
                  {t.l}
                  {tab === t.k && <motion.span layoutId={`org-tab-${key}`} className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-indigo-600" transition={{ type: "spring", duration: 0.3, bounce: 0.1 }} />}
                </button>
              ))}
            </nav>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              {!org ? (
                <div className="grid gap-2" aria-busy="true">
                  {[0, 1, 2].map((i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />)}
                </div>
              ) : (
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={tab}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, transition: { duration: 0.08 } }}
                    transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                  >
                    {tab === "overview" && <Overview org={org} />}
                    {tab === "offices" && <Offices org={org} />}
                    {tab === "standards" && <Standards org={org} />}
                    {tab === "records" && <Records org={org} />}
                    {tab === "legal" && <Legal org={org} />}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </motion.section>
        </div>
      )}
    </AnimatePresence>
  );
}

function Overview({ org }: { org: OrgFull }) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-1">
        <p className="text-[12px] font-medium text-slate-500">{org.industry}</p>
        <p className="text-[14px] leading-relaxed text-slate-800">{org.context}</p>
      </div>
      <p className="rounded-xl bg-indigo-50/70 px-4 py-3 text-[13px] leading-relaxed text-indigo-950 ring-1 ring-inset ring-indigo-100">{org.obj}</p>
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-slate-200 ring-1 ring-slate-200">
        {[
          ["Home office", org.office],
          ["Assets", org.assets],
          ["Audit focus", org.audit],
          ["Classification labels", org.labels.replaceAll("‣", "·")],
        ].map(([k, v]) => (
          <div key={k} className="bg-white px-4 py-3">
            <dt className="text-[11.5px] font-medium text-slate-500">{k}</dt>
            <dd className="mt-0.5 text-[13px] leading-snug text-slate-800">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function Offices({ org }: { org: OrgFull }) {
  return (
    <ul className="grid gap-2">
      {org.offices.map((o) => {
        const home = o === org.office;
        return (
          <li key={o} className={`flex items-center gap-3 rounded-xl px-4 py-3 ring-1 ring-inset ${home ? "bg-indigo-50/70 ring-indigo-200" : "bg-white ring-slate-200"}`}>
            <Icon name="mapPin" size={16} className={home ? "text-indigo-500" : "text-slate-400"} />
            <span className="flex-1 text-[13.5px] text-slate-800">{o}</span>
            {home && <span className="rounded-md bg-indigo-600 px-1.5 py-0.5 text-[11px] font-semibold text-white">Home office</span>}
          </li>
        );
      })}
    </ul>
  );
}

function Standards({ org }: { org: OrgFull }) {
  const mandatory = org.standards.filter((x) => x[1] === "Mandatory").length;
  return (
    <div className="grid gap-2">
      <p className="text-[12.5px] text-slate-500 tabular-nums">{mandatory} mandatory, {org.standards.length - mandatory} optional</p>
      <ul className="grid gap-2">
        {org.standards.map(([name, req, why]) => (
          <li key={name} className="grid gap-1 rounded-xl bg-white px-4 py-3 ring-1 ring-inset ring-slate-200">
            <div className="flex items-start justify-between gap-3">
              <span className="text-[13.5px] font-semibold text-slate-900">{name}</span>
              <span className={`shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${req === "Mandatory" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"}`}>{req}</span>
            </div>
            {why && <p className="text-[12.5px] leading-relaxed text-slate-600">{why}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Records({ org }: { org: OrgFull }) {
  return (
    <ol className="grid gap-2">
      {org.records.map(([task, rec]) => (
        <li key={task + rec} className="grid grid-cols-[56px_minmax(0,1fr)] gap-2 rounded-xl bg-white px-4 py-3 text-[13px] leading-relaxed ring-1 ring-inset ring-slate-200">
          <span className="font-mono text-[12px] font-semibold text-indigo-600">{task}</span>
          <span className="text-slate-700">{rec.replace("{MENTEE_ID}", "your-id")}</span>
        </li>
      ))}
    </ol>
  );
}

function Legal({ org }: { org: OrgFull }) {
  return (
    <div className="grid gap-3">
      <p className="text-[14px] leading-relaxed text-slate-800">{org.legal_note}</p>
      <dl className="grid gap-px overflow-hidden rounded-xl bg-slate-200 ring-1 ring-slate-200">
        {[
          ["Addendum", org.addendum],
          ["Head office", org.hq],
        ].map(([k, v]) => (
          <div key={k} className="grid grid-cols-[120px_minmax(0,1fr)] gap-3 bg-white px-4 py-3 text-[13px]">
            <dt className="text-slate-500">{k}</dt>
            <dd className="text-slate-800">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="text-[12px] text-slate-500">The addendum holds the law, authority, breach clocks and transfer rules for each office. You copy from it; you never guess.</p>
    </div>
  );
}

/** An ⓘ per organisation in the app header, on every page; each opens that organisation's box. */
export function OrgInfoButton() {
  const desk = useDesk();
  const [open, setOpen] = useState<Record<Key, boolean>>({ A: false, B: false });
  if (!desk) return null;
  return (
    <>
      <div className="flex items-center gap-1.5">
        {(["A", "B"] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setOpen((o) => ({ ...o, [k]: !o[k] }))}
            aria-expanded={open[k]}
            aria-label={`About Org ${k}, ${desk.orgs[k].name}`}
            title={`Org ${k}: ${desk.orgs[k].name}`}
            className={`group flex h-9 items-center gap-2 rounded-full border bg-white py-1 pl-1 pr-2.5 text-[12.5px] font-medium shadow-[0_1px_2px_rgba(15,23,42,0.06)] ${press} ${
              open[k] ? "border-[#c9c3ff] bg-[#f5f3ff] text-[#4338ca] ring-2 ring-[#5b4fe9]/15" : "border-[#e2e2ec] text-[#34354a] hover:border-[#cfcfe0] hover:bg-[#fafaff]"
            }`}
          >
            <OrgLogo org={logoFor(desk.orgs[k].name)} className="h-7 w-7" iconSize={24} />
            <span className="hidden xl:inline">{desk.orgs[k].short}</span>
            <span className="hidden whitespace-nowrap sm:inline xl:hidden">Org {k}</span>
            <Icon name="info" size={14} className={open[k] ? "text-[#5b4fe9]" : "text-slate-400 group-hover:text-slate-600"} />
          </button>
        ))}
      </div>
      {(["A", "B"] as const).map((k) => (
        <OrgBox key={k} open={open[k]} orgKey={k} onClose={() => setOpen((o) => ({ ...o, [k]: false }))} />
      ))}
    </>
  );
}

/** Org A and Org B for the dashboard, each opening the organisation box. */
export function DashboardOrgs() {
  const desk = useDesk();
  const [open, setOpen] = useState<Record<Key, boolean>>({ A: false, B: false });

  if (!desk)
    return (
      <div className="grid gap-4 sm:grid-cols-2" aria-busy="true">
        {[0, 1].map((i) => <div key={i} className="h-[168px] animate-pulse rounded-xl bg-slate-100" />)}
      </div>
    );

  const orgs = (["A", "B"] as const).map((k) => desk.orgs[k] as OrgFull);
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {orgs.map((o) => {
          const mandatory = o.standards.filter((x) => x[1] === "Mandatory").length;
          return (
            <button
              key={o.key}
              type="button"
              onClick={() => setOpen((x) => ({ ...x, [o.key]: true }))}
              className={`group flex h-full flex-col gap-3 rounded-xl bg-slate-50/60 p-4 text-left ring-1 ring-slate-200 transition-[background-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-card hover:ring-indigo-200/70 ${press}`}
            >
              <div className="flex items-center gap-3">
                <Monogram org={o} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13.5px] font-semibold tracking-tight text-slate-900">{o.name}</div>
                  <div className="truncate text-[11.5px] text-slate-500">{o.industry}</div>
                </div>
                <span className="shrink-0 rounded-full bg-indigo-50 px-2 py-0.5 text-[10.5px] font-semibold text-indigo-700 ring-1 ring-indigo-100">Org {o.key}</span>
              </div>
              <p className="line-clamp-2 text-[12px] leading-relaxed text-slate-500">{o.context}</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  ["Offices", o.offices.length],
                  ["Standards", `${mandatory}/${o.standards.length}`],
                  ["Tasks", o.tasks.length],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-lg bg-white px-2 py-1.5 text-center ring-1 ring-slate-200">
                    <div className="text-[15px] font-semibold tabular-nums tracking-[-0.02em] text-slate-900">{v}</div>
                    <div className="text-[10px] text-slate-500">{k}</div>
                  </div>
                ))}
              </div>
              <div className="mt-auto flex items-center gap-2 border-t border-slate-200 pt-3 text-[11.5px] text-slate-500">
                <Icon name="mapPin" size={12} className="text-slate-400" />
                {o.office}
                <span className="ml-auto inline-flex items-center gap-1 font-medium text-indigo-600 opacity-0 transition-opacity group-hover:opacity-100">
                  Details <Icon name="arrowRight" size={13} />
                </span>
              </div>
            </button>
          );
        })}
      </div>
      {(["A", "B"] as const).map((k) => (
        <OrgBox key={k} open={open[k]} orgKey={k} onClose={() => setOpen((x) => ({ ...x, [k]: false }))} />
      ))}
    </>
  );
}
