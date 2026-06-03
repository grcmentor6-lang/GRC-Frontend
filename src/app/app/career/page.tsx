"use client";

import { useEffect, useState } from "react";
import { Icon, type IconName } from "@/components/ui/icon";
import { Card, Bar } from "@/components/ui/primitives";
import { DVerb } from "@/components/ui/dverb";
import { CAREER_LADDER, CAREER_PROGRAMS, type CareerProgram } from "@/lib/career";
import { learningsApi } from "@/lib/learnings";

const CR_FW: Record<string, string> = {
  indigo: "bg-indigo-50 text-indigo-700 ring-indigo-100",
  violet: "bg-violet-50 text-violet-700 ring-violet-100",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  amber: "bg-amber-50 text-amber-800 ring-amber-100",
};

// Skill state — zero-progress users see everything "upcoming"; per-user acquisition arrives with grading (Phase 4).
const SKILL_STATE = {
  acquired: { label: "Acquired", icon: "check" as IconName, cls: "bg-emerald-50 text-emerald-600 ring-emerald-100", txt: "text-emerald-600" },
  developing: { label: "Developing", icon: "play" as IconName, cls: "bg-indigo-50 text-indigo-600 ring-indigo-100", txt: "text-indigo-600" },
  upcoming: { label: "Upcoming", icon: "minus" as IconName, cls: "bg-slate-50 text-slate-300 ring-slate-200/60", txt: "text-slate-400" },
};

function Head({ icon, action, children }: { icon: IconName; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3.5">
      <div className="flex items-center gap-2">
        <Icon name={icon} size={14} className="text-slate-400" />
        <h3 className="text-[11px] font-semibold tracking-[0.13em] uppercase text-slate-500">{children}</h3>
      </div>
      {action}
    </div>
  );
}

function CareerHero({ program, progress }: { program: CareerProgram; progress: number }) {
  const active = program.status === "active";
  return (
    <div className="relative overflow-hidden rounded-2xl text-white p-7 shadow-[0_12px_40px_-16px_rgba(79,70,229,0.5)]" style={{ background: "linear-gradient(135deg, #4f46e5 0%, #5b53e8 45%, #7c3aed 100%)" }}>
      <div className="pointer-events-none absolute -top-16 -right-10 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
      <div className="relative flex flex-col md:flex-row md:items-stretch gap-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-3">
            <span className="inline-flex items-center justify-center px-2 h-6 rounded-md bg-white/15 ring-1 ring-white/25 text-[11px] font-mono font-semibold">{program.code}</span>
            <span className={`inline-flex items-center gap-1.5 px-2.5 h-6 rounded-full text-[10.5px] font-medium tracking-tight ${active ? "bg-emerald-400/20 ring-1 ring-emerald-300/40 text-emerald-50" : "bg-white/10 ring-1 ring-white/20 text-indigo-50"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-emerald-300 animate-pulse" : "bg-indigo-200"}`} />
              {active ? "Currently enrolled" : "Locked · preview"}
            </span>
          </div>
          <h2 className="text-[23px] md:text-[26px] font-semibold tracking-[-0.025em] leading-tight max-w-xl">{program.title}</h2>
          <p className="text-[13.5px] text-indigo-50/90 mt-2 tracking-tight leading-relaxed max-w-xl" style={{ textWrap: "pretty" }}>{program.tagline}</p>
          <div className="mt-4 max-w-sm">
            <div className="flex items-center justify-between text-[11px] text-indigo-100 mb-1.5">
              <span>{active ? "Module progress" : "Not started"}</span>
              <span className="font-medium tabular-nums">{progress}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/20 overflow-hidden">
              <div className="h-full rounded-full bg-white transition-all duration-700" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
        <div className="shrink-0 md:w-[260px] rounded-xl bg-white/10 ring-1 ring-white/15 backdrop-blur-sm p-4 flex flex-col">
          <div className="text-[10px] font-semibold tracking-[0.13em] uppercase text-indigo-100/90 mb-2">Management level</div>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/15 ring-1 ring-white/25 flex items-center justify-center"><Icon name="rocket" size={18} /></div>
            <div>
              <div className="text-[16px] font-semibold tracking-tight leading-none">{program.level.label}</div>
              <div className="text-[11px] text-indigo-100/85 mt-1">{program.level.sub}</div>
            </div>
          </div>
          <p className="text-[11.5px] text-indigo-50/85 leading-relaxed tracking-tight" style={{ textWrap: "pretty" }}>{program.level.desc}</p>
        </div>
      </div>
    </div>
  );
}

function CareerLadder({ program }: { program: CareerProgram }) {
  const byRung: Record<number, CareerProgram> = {};
  CAREER_PROGRAMS.forEach((p) => (byRung[p.level.rung] = p));
  const selRung = program.level.rung;
  const fillPct = (selRung / (CAREER_LADDER.length - 1)) * 100;
  return (
    <Card>
      <Head icon="chart" action={<span className="text-[11px] text-slate-400">progression across GRC 101 → 501</span>}>Career trajectory</Head>
      <div className="relative pt-7 pb-1 px-2">
        <div className="absolute left-2 right-2 top-[44px] h-1 rounded-full bg-slate-100" />
        <div className="absolute left-2 top-[44px] h-1 rounded-full bg-indigo-500 transition-all duration-700" style={{ width: `calc((100% - 16px) * ${fillPct / 100})` }} />
        <div className="relative grid grid-cols-5">
          {CAREER_LADDER.map((rung, i) => {
            const prog = byRung[i];
            const isSel = prog && prog.id === program.id;
            const reached = i <= selRung;
            return (
              <div key={rung.label} className="flex flex-col items-center text-center px-1">
                <div className="h-5 mb-1.5 flex items-center">
                  {prog && <span className={`font-mono text-[10px] font-semibold tracking-tight ${isSel ? "text-indigo-600" : "text-slate-400"}`}>{prog.code}</span>}
                </div>
                {prog ? (
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center ring-2 transition-all ${isSel ? "bg-indigo-600 ring-indigo-200 scale-110" : reached ? "bg-indigo-500 ring-indigo-100" : "bg-white ring-slate-200"}`}>
                    {reached ? <Icon name={isSel ? "target" : "check"} size={13} className="text-white" strokeWidth={isSel ? 2 : 3} /> : <span className="w-2 h-2 rounded-full bg-slate-300" />}
                  </div>
                ) : (
                  <div className={`w-3 h-3 rounded-full ${reached ? "bg-indigo-400" : "bg-slate-200"}`} />
                )}
                <div className={`mt-2 text-[11.5px] font-medium tracking-tight leading-tight ${isSel ? "text-slate-900" : prog ? "text-slate-600" : "text-slate-400"}`}>{rung.label}</div>
                <div className="text-[10px] text-slate-400 tracking-tight leading-tight mt-0.5">{rung.sub}</div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

function CareerSkills({ program }: { program: CareerProgram }) {
  const isAcquired = program.skillsMode === "acquired";
  return (
    <Card>
      <Head icon="bolt" action={<span className="text-[11px] text-slate-400 font-medium">{isAcquired ? "0 acquired" : `${program.skills.length} to develop`}</span>}>
        {isAcquired ? "Skills acquired" : "Skills you'll develop"}
      </Head>
      <div className="space-y-2">
        {program.skills.map((s, i) => {
          const st = SKILL_STATE.upcoming; // zero-progress; real state arrives with grading
          return (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
              <span className={`w-7 h-7 rounded-lg flex items-center justify-center ring-1 shrink-0 ${st.cls}`}>
                <Icon name={st.icon} size={13} strokeWidth={2} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium tracking-tight text-slate-400">{s.label}</span>
                  {s.verb && <DVerb verbId={s.verb} />}
                </div>
                <div className="text-[11px] text-slate-400 tracking-tight truncate">{s.note}</div>
              </div>
              <span className={`text-[10.5px] font-medium shrink-0 ${st.txt}`}>{st.label}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function CareerCompetencies({ program }: { program: CareerProgram }) {
  return (
    <Card>
      <Head icon="target" action={<span className="text-[11px] text-slate-400">assessed when you begin</span>}>Assessed competencies</Head>
      <div className="space-y-3">
        {program.competencyLabels.map((label) => (
          <div key={label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[12px] tracking-tight text-slate-400">{label}</span>
              <Icon name="history" size={12} className="text-slate-300" />
            </div>
            <Bar pct={0} tone="slate" />
          </div>
        ))}
      </div>
    </Card>
  );
}

function CareerFrameworks({ program }: { program: CareerProgram }) {
  return (
    <Card>
      <Head icon="shield" action={<span className="text-[11px] text-slate-400 font-medium">{program.frameworks.length}</span>}>Frameworks & standards</Head>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {program.frameworks.map((f) => (
          <div key={f.label} className="rounded-xl ring-1 ring-slate-200/70 bg-white p-3 flex items-center gap-3">
            <span className={`w-9 h-9 rounded-lg flex items-center justify-center ring-1 ${CR_FW[f.tone] ?? CR_FW.indigo}`}><Icon name="shield" size={16} /></span>
            <div className="min-w-0">
              <div className="text-[12.5px] font-semibold tracking-tight text-slate-900 truncate">{f.label}</div>
              <div className="text-[10.5px] text-slate-400 tracking-tight truncate">{f.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function CareerExpertise({ program }: { program: CareerProgram }) {
  return (
    <Card>
      <Head icon="layers">Expertise developed</Head>
      <div className="space-y-2.5">
        {program.expertise.map((e) => (
          <div key={e.title} className="flex gap-3 rounded-xl bg-slate-50/60 ring-1 ring-slate-200/50 p-3">
            <span className="w-9 h-9 rounded-lg bg-white ring-1 ring-slate-200/70 flex items-center justify-center text-indigo-600 shrink-0">
              <Icon name={e.icon as IconName} size={17} />
            </span>
            <div className="min-w-0">
              <div className="text-[12.5px] font-semibold tracking-tight text-slate-900">{e.title}</div>
              <div className="text-[11.5px] text-slate-500 tracking-tight leading-relaxed mt-0.5" style={{ textWrap: "pretty" }}>{e.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function CareerRoles({ program }: { program: CareerProgram }) {
  return (
    <Card>
      <Head icon="briefcase">Roles this stage prepares you for</Head>
      <div className="flex flex-wrap gap-2">
        {program.roles.map((r) => (
          <span key={r} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-indigo-50/70 ring-1 ring-indigo-100 text-[12px] font-medium tracking-tight text-indigo-700">
            <Icon name="user" size={12} /> {r}
          </span>
        ))}
      </div>
    </Card>
  );
}

export default function CareerPage() {
  const [programId, setProgramId] = useState("grc101");
  const [progress, setProgress] = useState(0);
  const program = CAREER_PROGRAMS.find((p) => p.id === programId)!;

  useEffect(() => {
    let cancelled = false;
    setProgress(0);
    if (program.status === "active") {
      learningsApi.progress(programId).then((p) => !cancelled && setProgress(p.overallPct)).catch(() => {});
    }
    return () => {
      cancelled = true;
    };
  }, [programId, program.status]);

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-6 space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[20px] font-semibold tracking-[-0.02em] text-slate-900">Career</h1>
          <p className="text-[13px] text-slate-500 tracking-tight mt-0.5 max-w-xl" style={{ textWrap: "pretty" }}>
            What each program develops — the skills, frameworks, management level and expertise that shape your GRC career path.
          </p>
        </div>
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100/80 ring-1 ring-slate-200/60 w-fit">
          {CAREER_PROGRAMS.map((p) => {
            const sel = p.id === programId;
            return (
              <button key={p.id} onClick={() => setProgramId(p.id)} className={`inline-flex items-center gap-1.5 px-4 h-9 rounded-lg text-[13px] font-medium tracking-tight transition-all ${sel ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/70" : "text-slate-500 hover:text-slate-700"}`}>
                {p.status === "locked" && <Icon name="history" size={13} className={sel ? "text-slate-400" : "text-slate-300"} />}
                {p.code}
              </button>
            );
          })}
        </div>
      </div>

      <CareerHero program={program} progress={progress} />
      <CareerLadder program={program} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 space-y-5">
          <CareerSkills program={program} />
          <CareerExpertise program={program} />
          <CareerRoles program={program} />
        </div>
        <div className="space-y-5">
          <CareerCompetencies program={program} />
          <CareerFrameworks program={program} />
        </div>
      </div>

      <div className="text-center text-[11px] text-slate-400 pt-2 pb-4">
        grcmentor · {program.code} · {program.title}
      </div>
    </div>
  );
}
