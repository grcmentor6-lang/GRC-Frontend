#!/usr/bin/env python3
"""Writes Tech Lab TL-36-SOC-14-SIEM01-O: its console data (public/desk/labs/<id>.json) and its key
(backend/_seed/grc101_lab_keys.json, merged, so take the shared lock). Pack: techlab_catalogue.json, simulator LogLens,
template SIEM 01 "Log-source coverage", LearnTech, MISP + OpenCTI + sector ISAC feeds, week 10; this is the mentee's own
LogLens draw (the pack's Systems row). Screens and defects from p_techsim.py and sims_a.siem: Log sources, Retention
settings, Asset register extract; "Mission Critical system not sending logs", "Retention shorter than 12 months",
"Log source silent for > 7 days", "Clock skew between sources". Related task moved from T8.2 (the pack's, which a lab
already feeds, and whose Amsterdam scope has no Mission Critical asset) to T10.2 (week 10, LearnTech): the logs behind
INC-2610-3001's notification plan. Systems, offices and the internet-facing flag follow the pack's asset register
(sim_context.json, org 36) and BKB-ADD-36 Sections 5 and 8.1; sources, times and retention values are written here and
are synthetic. The incident's times are brc-t102.json's. Run from web/."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LAB = "TL-36-SOC-14-SIEM01-O"
AS_OF = "2026-12-09"

IST, AMS, MUM, NYC = "Istanbul, Turkey", "Amsterdam, Netherlands", "Mumbai, India", "New York, United States"
LMS = "Learning platform & content"
IA, EP, NP, CC, BA, ST, DB, EM = "Identity & access", "Endpoint & server", "Network & perimeter", "Cloud control plane", "Business applications", "Security tools", "Databases", "Email"
REP, NONE = "Reporting", "No events"
OLD = "2025-03-10 11:00"  # the day LearnTech's sources were connected (written here)

# The incident (brc-t102.json): link exposed 2026-12-07 17:30 and platform offline 2026-12-08 14:50, Amsterdam time (UTC+1).
EXPOSED, OFFLINE = "2026-12-07 16:30", "2026-12-08 13:50"
rec = dict(json.loads((ROOT / "src/lib/desk/brc-t102.json").read_text(encoding="utf8"))["record"])
assert rec["Link exposed by the software release"].startswith("2026-12-07 17:30") and rec["Platform taken offline"].startswith("2026-12-08 14:50"), rec
assert rec["System affected"] == f"{LMS} (Amsterdam)", rec

# Asset register extract: System, Office, Internet-facing. Istanbul's eight are BKB-ADD-36 Section 8.1's Mission Critical assets.
MC = ["Treasury management system", "Banking & payment files", "SIEM & log analytics platform", "Identity & access management (IAM)",
      "PKI & secrets / key management", "Enterprise directory & email", "Core network & infrastructure", "Student information system (SIS)"]
add36 = (ROOT / "public/desk/docs/BKB-ADD-36.md").read_text(encoding="utf8")
s81 = add36[add36.index("8.1 Mission Critical assets"):add36.index("8.2 Business impact")]
assert all(f"| {m} | Istanbul, Turkey |" in s81 for m in MC) and s81.count("| Istanbul, Turkey |") == len(MC)
assert "| BKB-POL-009 | Operations Security Policy | SIEM coverage | Mission Critical + internet-facing |" in add36
NET = {"Identity & access management (IAM)", "Enterprise directory & email", "Core network & infrastructure", "Student information system (SIS)",
       "Board & executive portal", LMS, "Assessment & proctoring data", "Customer support / ticketing", "Knowledge base & help centre",
       "Data protection / DSAR register"}
REG = [(m, IST) for m in MC] + [(s, IST) for s in ["ERP / financial system", "Financial planning & analysis models", "Board & executive portal"]] + [
    (s, AMS) for s in [LMS, "Learner analytics data", "Assessment & proctoring data", "Customer support / ticketing", "Knowledge base & help centre",
                       "Customer communications & CTI", "CRM platform", "Customer master data", "Data protection / DSAR register",
                       "Local tax & statutory filings", "Regional contracts repository", "Regional HR records", "Local payroll & benefits",
                       "Regional accounting ledger", "Local network & connectivity", "Local IT support & assets", "Building management & access control"]]
assert len({s for s, _ in REG}) == len(REG)

# Log sources: Source, System, Office, Source group, Status, Last event (UTC), Clock offset, Connected on (UTC).
def src(name, system, office, group, status=REP, last="2026-12-09 09:52", offset="+0 s", conn=OLD):
    return [name, system, office, group, status, last, offset, conn]
SRC = [
    src("kyriba-tms-ist", "Treasury management system", IST, BA, last="2026-12-09 09:41"),
    src("kyriba-pay-ist", "Banking & payment files", IST, BA, last="2026-12-09 09:44", offset="+1 s"),
    src("wazuh-health-ist", "SIEM & log analytics platform", IST, ST, last="2026-12-09 09:58"),
    src("entra-id-ist", "Identity & access management (IAM)", IST, IA, last="2026-12-09 09:58"),
    src("keycloak-ist", "Identity & access management (IAM)", IST, IA, last="2026-12-09 09:57", offset="-1 s"),
    src("m365-audit-ist", "Enterprise directory & email", IST, EM, last="2026-12-09 09:55"),
    src("sdwan-core-ist", "Core network & infrastructure", IST, NP, last="2026-12-09 09:58", offset="+2 s"),
    src("sis-app-audit-ist", "Student information system (SIS)", IST, BA, last="2026-12-09 09:56"),
    src("d365-erp-ist", "ERP / financial system", IST, BA, last="2026-12-09 09:31"),
    src("diligent-ist", "Board & executive portal", IST, BA, last="2026-12-09 08:12"),
    # The affected system, Amsterdam (planted: a source silent > 7 days, a clock 6 minutes fast, one connected after the platform went offline)
    src("lms-edge-waf-ams", LMS, AMS, NP, last="2026-12-09 09:58"),
    src("lms-app-audit-ams", LMS, AMS, BA, last="2026-12-09 10:03", offset="+6 min"),
    src("lms-db-audit-ams", LMS, AMS, DB, status=NONE, last="2026-11-26 03:12"),
    src("lms-cloudtrail-ams", LMS, AMS, CC, last="2026-12-09 09:57", offset="-1 s"),
    src("lms-api-gw-ams", LMS, AMS, CC, last="2026-12-09 09:58", conn="2026-12-08 15:10"),
    # The same system in other offices (decoys for the Office filter)
    src("lms-edge-waf-mum", LMS, MUM, NP, last="2026-12-09 09:58"),
    src("lms-app-audit-mum", LMS, MUM, BA, last="2026-12-09 09:57", offset="+1 s"),
    src("lms-app-audit-nyc", LMS, NYC, BA, last="2026-12-09 09:50"),
    # Amsterdam's other systems
    src("analytics-ams", "Learner analytics data", AMS, DB, last="2026-12-09 09:40"),
    src("proctor-ams", "Assessment & proctoring data", AMS, BA, last="2026-12-09 09:49"),
    src("zendesk-ams", "Customer support / ticketing", AMS, BA, last="2026-12-09 09:56"),
    src("zendesk-kb-ams", "Knowledge base & help centre", AMS, BA, last="2026-12-09 09:22"),
    src("genesys-ams", "Customer communications & CTI", AMS, BA, status=NONE, last="2026-12-08 07:15"),
    src("hubspot-ams", "CRM platform", AMS, BA, last="2026-12-09 09:47"),
    src("sf-hr-ams", "Regional HR records", AMS, BA, last="2026-12-09 09:12"),
    src("adp-payroll-ams", "Local payroll & benefits", AMS, BA, last="2026-12-09 06:00"),
    src("d365-ledger-ams", "Regional accounting ledger", AMS, BA, last="2026-12-09 09:33"),
    src("sdwan-ams", "Local network & connectivity", AMS, NP, last="2026-12-09 09:58", offset="+1 s"),
    src("glpi-ams", "Local IT support & assets", AMS, EP, last="2026-12-09 09:51"),
    src("genetec-ams", "Building management & access control", AMS, EP, last="2026-12-09 09:57"),
]
assert len({r[0] for r in SRC}) == len(SRC)
count = {s: sum(1 for r in SRC if r[1] == s and r[2] == o) for s, o in REG}
reg_rows = [[s, o, "Yes" if s in NET else "No", str(count[s])] for s, o in REG]
assert all(any(r[1] == s and r[2] == o for s, o in REG) for r in SRC if r[2] in (IST, AMS)), "a source of a system not in the extract"

RET = [[IA, "90", "1095"], [EP, "60", "1095"], [NP, "30", "180"], [CC, "90", "365"], [BA, "90", "1095"], [ST, "90", "1095"], [DB, "30", "90"], [EM, "90", "730"]]
ret_of = {g: int(t) for g, _, t in RET}

FOUND = [r[0] for r in SRC if r[1] == LMS and r[2] == AMS]
NOLOG = [r[0] for r in reg_rows if r[3] == "0"]
AS_IS, FIX, NO = "Use its times as they are", "Use it with its times corrected", "It cannot show the exposure"
LONG, SHORT = "Kept 12 months or more", "Kept less than 12 months"
MUST, NOT = "Must send logs (Section 5)", "Not required by Section 5"

public = {
    "id": LAB,
    "sim": "LogLens",
    "title": "Log-source coverage",
    "org": "LearnTech Educational Solutions",
    "product": "MISP + OpenCTI + sector ISAC feeds",
    "capability": "Threat intelligence",
    "tenant": "learntech.example / Security monitoring",
    "asOf": AS_OF,
    "related": "T10.2",
    "feed": "BRC-PLAN, row Log evidence check",
    "context": "At LearnTech, the partner-managed SIEM collects the logs, and threat intelligence from MISP and OpenCTI with sector ISAC feeds is matched against them. This lab's product, MISP + OpenCTI + sector ISAC feeds, is named here only for context. LogLens is a brand-neutral simulator that shows the same governance information. All log data is synthetic.",
    "atWork": "At work, a junior analyst checks the logs behind a breach notification before the DPO signs it: which sources can show what happened and when, how long that evidence is kept, and which systems that must send logs do not.",
    "owner": ["Data Protection Officer (DPO)", "INC-2610-3001's record says a release left the export link of the Learning platform & content (Amsterdam) exposed from 2026-12-07 17:30, and the platform was taken offline at 2026-12-08 14:50, both Amsterdam time (UTC+1). Your plan dates everything in UTC and says about 4,500 records were taken. Both rest on what LearnTech's security monitoring logged. Before I sign the plan, check LogLens: which of the affected system's log sources can go on the incident timeline as they are, and are their events kept long enough for the authorities' questions? The post-incident review will also ask whether every system that must send logs does: check that while you are in. Capture what you find, so I can rely on it without opening the console."],
    "rules": [
        ["BKB-POL-014 Sections 3.1 and 7.1", "Evidence is collected and preserved forensically; chain of custody maintained. … Preserve logs; note times in UTC. Start a single incident timeline."],
        ["What that means for a log source", "A source's events can go on the incident timeline only if it was reporting for the whole exposure: from the moment the export link was exposed until the platform was taken offline. The DPO's note gives both, in Amsterdam time. A source whose clock offset is a minute or more goes on only with its times corrected by that offset."],
        ["BKB-POL-009 Section 3.4, Log retention", "Security event logs are kept for at least 12 months (365 days). The hot, searchable period may be shorter."],
        ["BKB-ADD-36 Section 5, SIEM coverage", "BKB-POL-009 Operations Security Policy, SIEM coverage, LOW value: Mission Critical + internet-facing. That is: every Mission Critical system, and every internet-facing system, sends its logs to the security monitoring platform. BKB-ADD-36 Section 8.1 lists LearnTech's Mission Critical assets."],
    ],
    "views": [
        {"key": "src", "title": "Log sources", "sub": "Every source sending events to LogLens. System and Office are the asset register's. Source health shows how each one is doing.",
         "cols": ["Source", "System", "Office", "Source group"], "filters": ["System", "Office", "Source group"], "rows": [r[:4] for r in SRC]},
        {"key": "health", "title": "Source health", "sub": "Each source's state. Status is No events when nothing has arrived for 24 hours. Clock offset is how far the source's clock is from LogLens's (+ is ahead). Connected on is when the source began sending. All times UTC.",
         "cols": ["Source", "Status", "Last event (UTC)", "Clock offset", "Connected on (UTC)"], "filters": ["Status"], "rows": [[r[0], *r[4:]] for r in SRC]},
        {"key": "ret", "title": "Retention settings", "sub": "How long LogLens keeps events, per source group. Hot: searchable at once. Total: how long events are kept at all, older ones searchable after a restore.",
         "cols": ["Source group", "Hot (searchable) days", "Total retention (days)"], "filters": [], "rows": RET},
        {"key": "reg", "title": "Asset register extract", "sub": "From LearnTech's asset register, for this check: the head office's systems that serve every office, and the Amsterdam office's business systems. Connected sources counts the LogLens sources sending each system's events.",
         "cols": ["System", "Office", "Internet-facing", "Connected sources"], "filters": ["Office", "Internet-facing", "Connected sources"], "rows": reg_rows},
    ],
    "guide": {"view": "src", "col": "Office", "value": IST},
    "parts": [
        {"id": "src", "kind": "capture", "title": "The affected system's log sources",
         "ask": "Find every log source that carries the affected system's events, and capture exactly those.",
         "where": "Log sources. The DPO's note names the affected system and its office. Use two filters together. Press Capture evidence, then choose the capture here."},
        {"id": "time", "kind": "rows", "title": "Can each one go on the incident timeline?",
         "ask": "For each source you captured, decide how its events can go on the incident timeline.",
         "where": "Source health gives each source's Status, Last event, Clock offset and Connected on, in UTC. The DPO's note gives when the link was exposed and when the platform was taken offline, in Amsterdam time: one hour ahead of UTC in December. The rules you apply says when a source can be used.",
         "options": [AS_IS, FIX, NO], "from": [{"part": "src"}]},
        {"id": "keep", "kind": "rows", "title": "Are their events kept long enough?",
         "ask": "For each source you captured, decide whether LogLens keeps its events as long as the Group requires.",
         "where": "Log sources gives each source's Source group. Retention settings gives each group's retention. BKB-POL-009 Section 3.4 is in The rules you apply.",
         "options": [LONG, SHORT], "from": [{"part": "src"}]},
        {"id": "nolog", "kind": "capture", "title": "Systems that send nothing",
         "ask": "Find every system in the asset register extract that sends no logs to LogLens, and capture exactly those.",
         "where": "Asset register extract. Connected sources counts the LogLens sources sending each system's events."},
        {"id": "must", "kind": "rows", "title": "Which of them must send logs?",
         "ask": "For each system you captured, decide whether BKB-ADD-36 Section 5 requires its logs in LogLens.",
         "where": "Asset register extract gives Internet-facing. BKB-ADD-36 Section 8.1 (Policies › Policy Library) lists the Mission Critical assets. Section 5's SIEM coverage line is in The rules you apply.",
         "options": [MUST, NOT], "from": [{"part": "nolog"}]},
    ],
}

TIME = {
    "lms-edge-waf-ams": (AS_IS, "Reporting since 2025, and its clock is on time (+0 s): it saw every request to the export link, from the exposure at 2026-12-07 16:30 UTC to the platform going offline at 2026-12-08 13:50 UTC."),
    "lms-app-audit-ams": (FIX, "Reporting throughout, so it holds the export events, but its clock is 6 minutes fast. Each of its times goes on the timeline 6 minutes earlier, or its events and the WAF's will not line up."),
    "lms-db-audit-ams": (NO, "No events since 2026-11-26 03:12 UTC, eleven days before the link was exposed. It was silent through the whole exposure, so it shows nothing of it."),
    "lms-cloudtrail-ams": (AS_IS, "Reporting since 2025, and its clock is 1 second off, well under a minute: its events, the release among them, go on as they are."),
    "lms-api-gw-ams": (NO, "It is reporting now, but it was connected on 2026-12-08 at 15:10 UTC, after the platform went offline at 13:50 UTC. It holds nothing from the exposure."),
}
GROUP = {r[0]: r[3] for r in SRC}
KEEP = {s: (LONG if ret_of[GROUP[s]] >= 365 else SHORT) for s in FOUND}
KEEP_WHY = {
    "lms-edge-waf-ams": "Network & perimeter keeps events 180 days, short of 12 months. The requests of the exposure would be gone in early June 2027.",
    "lms-app-audit-ams": "Business applications keeps events 1,095 days, three years: more than 12 months.",
    "lms-db-audit-ams": "Databases keeps events 90 days, short of 12 months. Hot days are the searchable part; the total is what counts.",
    "lms-cloudtrail-ams": "Cloud control plane keeps events 365 days: 12 months, which meets the rule. Its 90 hot days are only the searchable part.",
    "lms-api-gw-ams": "Cloud control plane keeps events 365 days: 12 months, which meets the rule. Its 90 hot days are only the searchable part.",
}
MUSTW = {
    "PKI & secrets / key management": (MUST, "Section 8.1 lists it as a Mission Critical asset. It is not internet-facing, but Mission Critical alone requires its logs."),
    "Data protection / DSAR register": (MUST, "It is internet-facing: people send their data-subject requests through it. Section 5 requires every internet-facing system's logs."),
    "Financial planning & analysis models": (NOT, "Not in Section 8.1 and not internet-facing: Section 5 does not require it. Its platform's own logs are kept there."),
    "Customer master data": (NOT, "Not in Section 8.1 and not internet-facing: Section 5 does not require it."),
    "Local tax & statutory filings": (NOT, "Not in Section 8.1 and not internet-facing: Section 5 does not require it."),
    "Regional contracts repository": (NOT, "Not in Section 8.1 and not internet-facing: Section 5 does not require it."),
}

key = {
    "parts": {
        "src": {"view": "src", "ids": sorted(FOUND),
                "why": "Five sources carry the Learning platform & content's events in Amsterdam, the system and office the incident record names. The same system's sources in Mumbai and New York serve those offices' platforms, which the incident did not touch."},
        "time": {"rows": {s: {"best": b, "why": w} for s, (b, w) in TIME.items()}},
        "keep": {"rows": {s: {"best": KEEP[s], "why": KEEP_WHY[s]} for s in FOUND}},
        "nolog": {"view": "reg", "ids": sorted(NOLOG),
                  "why": "Six systems in the extract have no source connected: nothing they log reaches LogLens. Whether each must is the next question."},
        "must": {"rows": {s: {"best": b, "why": w} for s, (b, w) in MUSTW.items()}},
    },
    "findings": [
        "Incident timeline (BKB-POL-014 Section 7.1): of the Learning platform & content's five LogLens sources in Amsterdam, lms-edge-waf-ams and lms-cloudtrail-ams go on as they are, and lms-app-audit-ams only with its times moved 6 minutes earlier, its clock offset. The downloads and the 4,500 records rest on lms-app-audit-ams and lms-edge-waf-ams. Evidence {src}.",
        "lms-db-audit-ams has sent nothing since 2026-11-26, and lms-api-gw-ams was connected on 2026-12-08 at 15:10 UTC, after the platform went offline: neither shows the exposure. The silent source goes to the CISO. Evidence {src}.",
        "Retention (BKB-POL-009 Section 3.4, 12 months): Network & perimeter keeps 180 days and Databases 90, so lms-edge-waf-ams's events of the exposure would be gone by early June 2027. The IR team to export and preserve the incident's events now (BKB-POL-014 Section 3.1); the CISO to set both groups to 12 months. Evidence {src}.",
        "Coverage (BKB-ADD-36 Section 5): PKI & secrets / key management, a Mission Critical asset, and the Data protection / DSAR register, which is internet-facing, send no logs to LogLens. The CISO to connect both before the post-incident review. Evidence {nolog}.",
    ],
}

# The data agrees with its key.
p = key["parts"]
assert sorted(r[0] for r in SRC if r[1] == LMS and r[2] == AMS) == p["src"]["ids"] and set(p["time"]["rows"]) == set(p["keep"]["rows"]) == set(FOUND)
assert set(p["must"]["rows"]) == set(NOLOG), (sorted(p["must"]["rows"]), NOLOG)
by = {r[0]: r for r in SRC}
for s in FOUND:  # the window rule, worked from the rows
    r = by[s]
    reported = r[4] == REP and r[7] <= EXPOSED or r[5] >= OFFLINE and r[7] <= EXPOSED
    want = NO if not reported else FIX if r[6].endswith("min") else AS_IS
    assert p["time"]["rows"][s]["best"] == want, (s, want)
for s, o, net, n in reg_rows:
    if n == "0":
        assert p["must"]["rows"][s]["best"] == (MUST if s in MC or net == "Yes" else NOT), s
for part in public["parts"]:
    if part["kind"] == "rows":
        assert all(x["best"] in part["options"] for x in p[part["id"]]["rows"].values())

(ROOT / f"public/desk/labs/{LAB}.json").write_text(json.dumps(public, ensure_ascii=False, separators=(",", ":")), encoding="utf8")
seed = ROOT.parent / "backend/_seed/grc101_lab_keys.json"
all_keys = json.loads(seed.read_text(encoding="utf8"))
all_keys[LAB] = key
seed.write_text(json.dumps(all_keys, ensure_ascii=False, indent=1), encoding="utf8")
blob = json.dumps([public, key], ensure_ascii=False)
assert "§" not in blob
pub = json.dumps(public, ensure_ascii=False)
for w in ('"best"', '"why"', '"findings"', "silent through", "6 minutes fast"):
    assert w not in pub, w
print(LAB, len(SRC), "sources", len(reg_rows), "systems,", len(NOLOG), "with none")
