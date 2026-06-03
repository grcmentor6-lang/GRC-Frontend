import { Icon, type IconName } from "@/components/ui/icon";
import { Bar } from "@/components/ui/primitives";
import { DVerb } from "@/components/ui/dverb";
import { SOFT_TONES } from "@/lib/tones";
import { VERB_LIST } from "@/lib/verbs";
import { BADGES } from "@/lib/badges";
import type { Cv } from "@/lib/cv";

const STD_TONES: Record<string, { chip: string; dot: string }> = {
  indigo: { chip: "bg-indigo-50 text-indigo-700 ring-indigo-100", dot: "bg-indigo-500" },
  violet: { chip: "bg-violet-50 text-violet-700 ring-violet-100", dot: "bg-violet-500" },
  emerald: { chip: "bg-emerald-50 text-emerald-700 ring-emerald-100", dot: "bg-emerald-500" },
  amber: { chip: "bg-amber-50 text-amber-800 ring-amber-100", dot: "bg-amber-500" },
  rose: { chip: "bg-rose-50 text-rose-700 ring-rose-100", dot: "bg-rose-500" },
};

function relTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const days = Math.floor((Date.now() - then) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "1d ago";
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", year: "numeric" });
}

function Head({ icon, children, action }: { icon?: IconName; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3.5">
      <div className="flex items-center gap-2">
        {icon && <Icon name={icon} size={14} className="text-slate-400" />}
        <h3 className="text-[11px] font-semibold tracking-[0.13em] uppercase text-slate-500">{children}</h3>
      </div>
      {action}
    </div>
  );
}

export function CvSheet({ cv }: { cv: Cv }) {
  const p = cv.profile;
  const done = new Set(cv.completedTaskCodes);
  const badges = BADGES.map((b) => ({ ...b, earned: b.taskCodes.length > 0 && b.taskCodes.every((c) => done.has(c)) }));
  const earnedBadges = badges.filter((b) => b.earned);
  const lockedBadges = badges.filter((b) => !b.earned);
  const doneVerbs = new Set(cv.verbs.done);
  const activeVerbs = new Set(cv.verbs.active);
  const skillTone = (v: number) => (v >= 4.3 ? "emerald" : v >= 4.0 ? "indigo" : "amber");

  return (
    <div id="cv-sheet" className="bg-white rounded-2xl ring-1 ring-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_18px_50px_-24px_rgba(15,23,42,0.18)] overflow-hidden">
      {/* header band */}
      <div className="relative overflow-hidden text-white px-8 md:px-10 pt-9 pb-8" style={{ background: "linear-gradient(135deg, #4f46e5 0%, #5b53e8 45%, #7c3aed 100%)" }}>
        <div className="pointer-events-none absolute -top-20 -right-10 w-72 h-72 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-24 left-40 w-56 h-56 rounded-full bg-violet-300/20 blur-2xl" />
        <div className="relative flex items-start gap-5">
          <div className="w-[72px] h-[72px] rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur-sm flex items-center justify-center text-[26px] font-semibold tracking-tight shrink-0">{p.initials}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-[27px] md:text-[30px] font-semibold tracking-[-0.025em] leading-none">{p.name}</h2>
              {p.openToWork && (
                <span className="inline-flex items-center gap-1.5 px-2.5 h-[22px] rounded-full bg-emerald-400/20 ring-1 ring-emerald-300/40 text-[10.5px] font-medium tracking-tight text-emerald-50">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" /> Open to opportunities
                </span>
              )}
            </div>
            <p className="text-[14px] text-indigo-50/95 font-medium tracking-tight mt-2">{p.headline}</p>
            <div className="flex items-center gap-4 mt-3 text-[12px] text-indigo-100/90 flex-wrap">
              <span className="inline-flex items-center gap-1.5"><Icon name="user" size={13} /> {p.location}</span>
              <span className="inline-flex items-center gap-1.5"><Icon name="mail" size={13} /> {p.email}</span>
              <span className="inline-flex items-center gap-1.5"><Icon name="shield" size={13} /> Mentor-verified</span>
            </div>
          </div>
        </div>
        <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-7">
          {cv.metrics.map((m) => (
            <div key={m.label} className="rounded-xl bg-white/10 ring-1 ring-white/15 backdrop-blur-sm px-3.5 py-3">
              <div className="flex items-baseline gap-1">
                <span className="text-[22px] font-semibold tracking-[-0.02em]">{m.value}</span>
                {m.sub && <span className="text-[11px] text-indigo-100/80 font-medium">{m.sub}</span>}
              </div>
              <div className="text-[10.5px] text-indigo-100/85 tracking-tight mt-0.5">{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-8 md:px-10 py-8 space-y-8">
        {/* summary */}
        <section>
          <Head icon="user">Professional summary</Head>
          <p className="text-[13.5px] leading-relaxed text-slate-600 tracking-tight" style={{ textWrap: "pretty" }}>{p.summary}</p>
        </section>
        <div className="h-px bg-slate-100" />

        {/* badges */}
        <section>
          <Head icon="trophy" action={<span className="text-[11px] text-slate-400 font-medium">{earnedBadges.length} earned · {lockedBadges.length} in progress</span>}>Credentials &amp; badges</Head>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {earnedBadges.map((b) => (
              <div key={b.id} className="relative rounded-xl bg-white ring-1 ring-slate-200/70 p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center"><Icon name="check" size={10} strokeWidth={3.5} /></div>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ring-1 mb-2.5 ${SOFT_TONES[b.tone] ?? SOFT_TONES.indigo}`}><Icon name={b.icon} size={20} /></div>
                <div className="text-[12.5px] font-semibold tracking-tight text-slate-900 leading-tight">{b.name}</div>
                <div className="text-[10.5px] text-slate-400 tracking-tight leading-tight mt-0.5">{b.blurb}</div>
              </div>
            ))}
            {lockedBadges.map((b) => (
              <div key={b.id} className="rounded-xl bg-slate-50/60 ring-1 ring-dashed ring-slate-200 p-3.5">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center ring-1 bg-slate-100 text-slate-300 ring-slate-200/60 mb-2.5"><Icon name={b.icon} size={20} /></div>
                <div className="text-[12.5px] font-semibold tracking-tight text-slate-400 leading-tight">{b.name}</div>
                <div className="inline-flex items-center gap-1 mt-1.5 text-[10px] text-slate-400 font-medium"><Icon name="history" size={10} /> In progress</div>
              </div>
            ))}
          </div>
        </section>
        <div className="h-px bg-slate-100" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-9 gap-y-8">
          <div className="lg:col-span-7 space-y-8">
            {/* experience */}
            <section>
              <Head icon="checkSquare" action={<span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium"><Icon name="shield" size={12} /> Mentor-graded</span>}>Verified experience</Head>
              {cv.experience.length === 0 ? (
                <p className="text-[12.5px] text-slate-400 tracking-tight">Complete and pass your first mentor-graded activity to populate verified experience.</p>
              ) : (
                <div className="space-y-5">
                  {cv.experience.map((exp, ei) => (
                    <div key={ei} className="relative pl-5">
                      <span className="absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-indigo-100" />
                      <div className="absolute left-[4.5px] top-5 bottom-0 w-px bg-slate-100" />
                      <div className="flex items-baseline justify-between gap-3 flex-wrap">
                        <h4 className="text-[14px] font-semibold tracking-tight text-slate-900">{exp.org}</h4>
                        {exp.period && <span className="text-[11px] text-slate-400 tracking-tight">{exp.period}</span>}
                      </div>
                      <div className="text-[12px] text-slate-500 tracking-tight">{exp.industry} · {exp.phase}</div>
                      {exp.tasks.map((t) => (
                        <div key={t.code} className="mt-3.5 rounded-xl bg-slate-50/60 ring-1 ring-slate-200/60 p-4">
                          <div className="flex items-center gap-2.5 mb-3">
                            <span className="inline-flex items-center justify-center px-1.5 h-5 rounded-md text-[10.5px] font-mono font-medium bg-indigo-600 text-white">{t.code}</span>
                            <div className="min-w-0">
                              <div className="text-[13px] font-medium tracking-tight text-slate-900 truncate">{t.title}</div>
                              <div className="text-[10.5px] text-slate-400 tracking-tight">{t.standards}</div>
                            </div>
                          </div>
                          <div className="space-y-3">
                            {t.items.map((it, i) => (
                              <div key={i} className="flex gap-3">
                                <div className="mt-0.5 w-5 h-5 rounded-full bg-emerald-50 ring-1 ring-emerald-100 text-emerald-600 flex items-center justify-center shrink-0"><Icon name="check" size={11} strokeWidth={3} /></div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <DVerb verbId={it.verb} />
                                    <span className="font-mono text-[10px] text-slate-400">{it.step}</span>
                                    <span className="inline-flex items-center gap-1 px-1.5 h-[18px] rounded-md bg-amber-50 ring-1 ring-amber-100">
                                      <Icon name="star" size={9} className="text-amber-500" />
                                      <span className="text-[10px] font-semibold text-amber-700 tabular-nums">{it.score.toFixed(1)}</span>
                                    </span>
                                    <span className="text-[10.5px] text-slate-400 ml-auto">{relTime(it.when)}</span>
                                  </div>
                                  <p className="text-[12.5px] text-slate-700 tracking-tight mt-1">{it.text}</p>
                                  {it.note && (
                                    <div className="mt-1.5 flex items-start gap-1.5 text-[11.5px] text-slate-500 italic tracking-tight">
                                      <Icon name="chat" size={12} className="text-violet-400 mt-0.5 shrink-0" />
                                      <span style={{ textWrap: "pretty" }}>&ldquo;{it.note}&rdquo; — {it.by}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* skills */}
            {cv.skills.length > 0 && (
              <>
                <div className="h-px bg-slate-100" />
                <section>
                  <Head icon="chart" action={<span className="text-[11px] text-slate-400">mentor-rated / 5</span>}>Skill assessment</Head>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                    {cv.skills.map((r) => (
                      <div key={r.id}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[12px] text-slate-600 tracking-tight">{r.label}</span>
                          <span className="text-[11.5px] font-semibold text-slate-900 tabular-nums">{r.value.toFixed(1)}</span>
                        </div>
                        <Bar pct={(r.value / 5) * 100} tone={skillTone(r.value)} />
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}
          </div>

          <div className="lg:col-span-5 space-y-8">
            {/* standards */}
            {cv.standards.length > 0 && (
              <section>
                <Head icon="shield">Standards &amp; frameworks</Head>
                <div className="flex flex-wrap gap-2">
                  {cv.standards.map((s) => {
                    const t = STD_TONES[s.tone] ?? STD_TONES.indigo;
                    return (
                      <span key={s.label} className={`inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-[12px] font-medium tracking-tight ring-1 ${t.chip}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${t.dot}`} /> {s.label}
                      </span>
                    );
                  })}
                </div>
              </section>
            )}

            {/* method verbs */}
            <section>
              <Head icon="bolt" action={<span className="text-[11px] text-slate-400 font-medium">{cv.verbs.done.length}/22</span>}>Method competencies</Head>
              <div className="flex flex-wrap gap-1.5">
                {VERB_LIST.map((v) => {
                  const base = "inline-flex items-center gap-1 h-[22px] px-2 rounded-md font-mono text-[10px] font-medium";
                  if (doneVerbs.has(v.id)) return <span key={v.id} className={`${base} bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100`}><Icon name="check" size={10} strokeWidth={3} /> {v.label.toUpperCase()}</span>;
                  if (activeVerbs.has(v.id)) return <span key={v.id} className={`${base} bg-indigo-50/60 text-indigo-500 ring-1 ring-dashed ring-indigo-200`}><span className="w-1.5 h-1.5 rounded-full bg-current" /> {v.label.toUpperCase()}</span>;
                  return <span key={v.id} className={`${base} bg-slate-50 text-slate-300 ring-1 ring-slate-200/60`}>{v.label.toUpperCase()}</span>;
                })}
              </div>
            </section>

            {/* endorsement */}
            {cv.endorsement && (
              <>
                <div className="h-px bg-slate-100" />
                <section>
                  <Head icon="chat">Mentor endorsement</Head>
                  <div className="rounded-xl bg-violet-50/40 ring-1 ring-violet-100 p-4">
                    <p className="text-[13px] text-slate-700 italic leading-relaxed tracking-tight" style={{ textWrap: "pretty" }}>&ldquo;{cv.endorsement.quote}&rdquo;</p>
                    <div className="flex items-center gap-2.5 mt-3 pt-3 border-t border-violet-100/70">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white text-[12px] font-semibold shrink-0">{cv.endorsement.initials}</div>
                      <div className="min-w-0">
                        <div className="text-[12.5px] font-semibold tracking-tight text-slate-900">{cv.endorsement.name}</div>
                        <div className="text-[11px] text-slate-500 tracking-tight truncate">{cv.endorsement.role}</div>
                      </div>
                    </div>
                  </div>
                </section>
              </>
            )}

            {/* program */}
            {cv.program && (
              <>
                <div className="h-px bg-slate-100" />
                <section>
                  <Head icon="book">Program</Head>
                  <div className="flex items-start gap-3">
                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-600 text-white text-[12px] font-mono font-semibold shrink-0">G</span>
                    <div className="min-w-0">
                      <div className="text-[13px] font-semibold tracking-tight text-slate-900">{cv.program.title}</div>
                      <div className="text-[11.5px] text-slate-500 tracking-tight">{cv.program.code} · {cv.program.provider} · {cv.program.cohort}</div>
                      <div className="inline-flex items-center gap-1.5 mt-1.5 text-[11px] text-indigo-600 font-medium"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> {cv.program.status}</div>
                    </div>
                  </div>
                </section>
              </>
            )}
          </div>
        </div>
      </div>

      {/* provenance footer */}
      <div className="px-8 md:px-10 py-4 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400"><Icon name="refresh" size={12} /> Auto-compiled from verified grcmentor work · {cv.publicUrl}</div>
        <div className="flex items-baseline gap-0">
          <span className="text-[12px] font-semibold tracking-[-0.02em] text-slate-700">grc</span>
          <span className="text-[12px] font-semibold tracking-[-0.02em] text-indigo-600">mentor</span>
        </div>
      </div>
    </div>
  );
}
