#!/usr/bin/env python3
"""Writes Tech Lab TL-36-SOC-14-SIEM01-O (LogLens, "Log-source coverage"): console data (public/desk/labs/<id>.json) and key
(backend/_seed/grc101_lab_keys.json, merged, so take the shared lock).

LI101 rebuild (26 Nov 2026): a required part of T9.2 (control sprint 11, A.8.15 and A.8.16), opened after step 5. It shows the
Manila SIEM as SPR-11 describes it: the 10 Mission Critical systems send logs (SITL-ADD-16 Section 8.1), the remote-access VPN
gateway also since November 2026 (risk R-16-HQ-16, T5.1), the customer portal and the e-mail gateway, both internet-facing,
send none; the SIEM keeps events 90 days against SITL-POL-009 Section 3.4's 12 months; device logs are overwritten after 7
days. Sources and times are written here and are synthetic. Questions are factual: step 9's decision is not answered here.
Run from web/."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LAB = "TL-36-SOC-14-SIEM01-O"
AS_OF = "2026-11-30"

VPN = "Remote-access VPN gateway"
IA, NP, BA, ST, DB, EM = "Identity & access", "Network & perimeter", "Business applications", "Security tools", "Databases", "Email"
PROD, TEST = "Production", "Test"
REP, NONE = "Reporting", "No events"
ADD16 = (ROOT / "public/desk/docs/SITL-ADD-16.md").read_text(encoding="utf8")
s81 = ADD16[ADD16.index("8.1 Mission Critical assets"):ADD16.index("9\\. Processing activities")]
MC = ["Treasury management system", "Banking & payment files", "SIEM & log analytics platform", "Identity & access management (IAM)",
      "PKI & secrets / key management", "Enterprise directory & email", "Core network & infrastructure", "Client data security controls",
      "Production delivery platform", "Client transaction data"]
assert all(f"| {m} | Manila, Philippines |" in s81 for m in MC) and s81.count("| Manila, Philippines |") == len(MC)
EXTRA = [(VPN, "Yes"), ("Customer portal", "Yes"), ("E-mail gateway", "Yes"), ("Call recording servers", "No"), ("HR and payroll systems", "No"),
         ("Intranet wiki", "No"), ("Print and badge services", "No")]
OLD = "2026-01-12 09:00"


def src(name, system, group, env=PROD, status=REP, last="2026-11-30 09:52", offset="+0 s", conn=OLD):
    return [name, system, group, env, status, last, offset, conn]


SRC = [
    src("tms-app-mnl", "Treasury management system", BA), src("pay-files-mnl", "Banking & payment files", BA, offset="+1 s"),
    src("siem-health-mnl", "SIEM & log analytics platform", ST), src("iam-core-mnl", "Identity & access management (IAM)", IA),
    src("iam-sso-mnl", "Identity & access management (IAM)", IA, offset="-1 s"), src("pki-ca-mnl", "PKI & secrets / key management", ST),
    src("dir-mail-mnl", "Enterprise directory & email", EM), src("core-fw-mnl", "Core network & infrastructure", NP, offset="+2 s"),
    src("core-sw-mnl", "Core network & infrastructure", NP), src("dlp-ctl-mnl", "Client data security controls", ST),
    src("delivery-app-mnl", "Production delivery platform", BA), src("txn-db-mnl", "Client transaction data", DB),
    # The VPN gateway (planted: a clock 4 minutes fast, a source silent since 24 November, a test source that is not production)
    src("vpn-gw-auth-mnl", VPN, IA, conn="2026-11-03 08:00", offset="+1 s"),
    src("vpn-gw-sys-mnl", VPN, NP, conn="2026-11-03 08:00", offset="+4 min"),
    src("vpn-gw-fw-mnl", VPN, NP, status=NONE, last="2026-11-24 17:21", conn="2026-11-03 08:00"),
    src("vpn-gw-test-mnl", VPN, NP, env=TEST, last="2026-11-27 15:10", conn="2026-11-10 10:30"),
]
assert len({r[0] for r in SRC}) == len(SRC)
count = {s: sum(1 for r in SRC if r[1] == s) for s in MC + [x for x, _ in EXTRA]}
REG = [[m, "Yes", "No" if m != "Enterprise directory & email" else "Yes", str(count[m])] for m in MC]
# Internet-facing for the Mission Critical rows: the directory and e-mail, the IAM and the core network are reachable from outside.
INET = {"Identity & access management (IAM)", "Enterprise directory & email", "Core network & infrastructure", "Production delivery platform"}
REG = [[m, "Yes", "Yes" if m in INET else "No", str(count[m])] for m in MC] + [[s, "No", i, str(count[s])] for s, i in EXTRA]
FOUND = sorted(r[0] for r in SRC if r[1] == VPN and r[3] == PROD)
NOLOG = sorted(r[0] for r in REG if r[3] == "0")
AS_IS, FIX, NO = "Use its events as they are", "Use it with its times corrected", "It cannot show the whole week"
MUST, NOT = "Must send logs (Section 4)", "Not required by Section 4"
SETTINGS = [["SIEM retention, all source groups", "90 days"], ["Device log retention (logs not sent to the SIEM)", "7 days, then overwritten"],
            ["Who can delete a server's logs", "The server's administrators"], ["Alert review", "08:00 to 17:00 on weekdays, by two analysts"]]
public = {
    "id": LAB, "sim": "LogLens", "title": "Log-source coverage",
    "org": "GlobalConnect Customer Solutions", "product": "SIEM", "capability": "Security monitoring",
    "tenant": "globalconnect.example / Security monitoring", "asOf": AS_OF, "related": "T9.2",
    "feed": "T9.2's evidence for A.8.15 and A.8.16",
    "context": "At GlobalConnect Manila the SIEM collects the security logs of the Mission Critical systems and, since November 2026, of the remote-access VPN gateway. LogLens is a brand-neutral simulator that shows the same governance information. All log data is synthetic.",
    "atWork": "At work, a junior analyst checks what the SIEM really holds before a logging control is rated: which sources can show what happened and when, how long that evidence is kept, and which systems that must send logs do not.",
    "owner": ["Chief Information Security Officer (CISO)", "Your sprint rates A.8.15 and A.8.16 from what the Manila office says about its logging. Before you build their evidence, check the SIEM itself on 30 November 2026. The remote-access VPN gateway began sending its logs this month, under the risk treatment plan: can its sources show last week, 23 to 29 November? How long does the SIEM keep events? And which systems send nothing, and must they? Capture what you find, so I can rely on it without opening the console."],
    "rules": [
        ["SITL-POL-009 Section 3.4, Logging and monitoring", "Systems within the SIEM coverage of Section 4 send their security event logs to the Group security monitoring platform. Logs are kept for at least 12 months (365 days); the hot, searchable period may be shorter. System clocks are synchronised to the Group time source, so that events from different systems can be put on one timeline."],
        ["SITL-POL-009 Section 4, SIEM coverage", "For a GRC 101 organisation, SIEM coverage is Mission Critical + internet-facing: every Mission Critical system and every internet-facing system sends its logs. SITL-ADD-16 Section 8.1 lists Manila's Mission Critical assets."],
        ["SITL-POL-009 Section 7.1", "A source counts as covered only when its events arrive at the monitoring platform and an alert would fire on them; a source that has gone silent is not covered."],
        ["What that means for a source", "A source can show a period only if it was connected before the period began and was reporting through it. A source whose clock is a minute or more out goes on a timeline only with its times corrected by that offset."],
    ],
    "views": [
        {"key": "src", "title": "Log sources", "sub": "Every source sending events to LogLens. System is the asset register's. Environment says whether the source is production or test.",
         "cols": ["Source", "System", "Source group", "Environment"], "filters": ["System", "Source group", "Environment"], "rows": [r[:4] for r in SRC]},
        {"key": "health", "title": "Source health", "sub": "Each source's state. Status is No events when nothing has arrived for 24 hours. Clock offset is how far the source's clock is from LogLens's (+ is ahead). Connected on is when the source began sending. All times UTC.",
         "cols": ["Source", "Status", "Last event (UTC)", "Clock offset", "Connected on (UTC)"], "filters": ["Status"], "rows": [[r[0], *r[4:]] for r in SRC]},
        {"key": "ret", "title": "Retention and settings", "sub": "How long events are kept and who may delete them, as the SIEM is set today.", "cols": ["Setting", "Value"], "filters": [], "rows": SETTINGS},
        {"key": "reg", "title": "Asset register extract", "sub": "From Manila's asset register, for this check: the Mission Critical systems and the other systems that serve every office or face the internet. Connected sources counts the LogLens sources sending each system's events.",
         "cols": ["System", "Mission Critical", "Internet-facing", "Connected sources"], "filters": ["Mission Critical", "Internet-facing", "Connected sources"], "rows": REG},
    ],
    "guide": {"view": "src", "col": "Environment", "value": TEST},
    "parts": [
        {"id": "src", "kind": "capture", "title": "The VPN gateway's production log sources",
         "ask": "Find every production log source of the remote-access VPN gateway, and capture exactly those.",
         "where": "Log sources. Use two filters together: one for the system, one for the environment. Press Capture evidence, then choose the capture here."},
        {"id": "time", "kind": "rows", "title": "Can each one show last week?",
         "ask": "For each source you captured, decide whether it can show the VPN gateway's week of 23 to 29 November 2026.",
         "where": "Source health gives each source's Status, Last event, Clock offset and Connected on, in UTC. The rules you apply say when a source can be used.",
         "options": [AS_IS, FIX, NO], "from": [{"part": "src"}]},
        {"id": "keep", "kind": "capture", "title": "How long the SIEM keeps events",
         "ask": "Which setting says how long the SIEM keeps events? Search for it and capture that one row.",
         "where": "Retention and settings. Type part of the setting's name in Search so that only its row is left."},
        {"id": "nolog", "kind": "capture", "title": "Systems that send nothing",
         "ask": "Find every system in the asset register extract that sends no logs to LogLens, and capture exactly those.",
         "where": "Asset register extract. Connected sources counts the LogLens sources sending each system's events."},
        {"id": "must", "kind": "rows", "title": "Which of them must send logs?",
         "ask": "For each system you captured, decide whether SITL-POL-009 Section 4 requires its logs in LogLens.",
         "where": "Asset register extract gives Mission Critical and Internet-facing. Section 4's SIEM coverage line is in The rules you apply.",
         "options": [MUST, NOT], "from": [{"part": "nolog"}]},
    ],
}
TIME = {
    "vpn-gw-auth-mnl": (AS_IS, "Connected on 2026-11-03, before the week, and reporting now. Its clock is 1 second out, well under a minute: its events go on as they are."),
    "vpn-gw-sys-mnl": (FIX, "Connected before the week and reporting, but its clock is 4 minutes fast. Each of its times goes on the timeline 4 minutes earlier, or its events and the other sources' will not line up."),
    "vpn-gw-fw-mnl": (NO, "No events since 2026-11-24 17:21 UTC, in the middle of the week. Under SITL-POL-009 Section 7.1 a source that has gone silent is not covered: it shows nothing of 25 to 29 November."),
}
MUSTW = {
    "Customer portal": (MUST, "It is internet-facing, and Section 4 covers every internet-facing system. It sends no logs."),
    "E-mail gateway": (MUST, "It is internet-facing, and Section 4 covers every internet-facing system. It sends no logs."),
    "Call recording servers": (NOT, "Not in Section 8.1's Mission Critical list and not internet-facing: Section 4 does not require its logs, though it holds Client-Restricted recordings."),
    "HR and payroll systems": (NOT, "Not Mission Critical and not internet-facing: Section 4 does not require it."),
    "Intranet wiki": (NOT, "Not Mission Critical and not internet-facing: Section 4 does not require it."),
    "Print and badge services": (NOT, "Not Mission Critical and not internet-facing: Section 4 does not require it."),
}
key = {"parts": {
    "src": {"view": "src", "ids": FOUND,
            "why": "Three production sources carry the VPN gateway's events. A fourth, vpn-gw-test-mnl, belongs to the test environment and is not evidence of production."},
    "time": {"rows": {s: {"best": b, "why": w} for s, (b, w) in TIME.items()}},
    "keep": {"view": "ret", "ids": ["SIEM retention, all source groups"],
             "why": "The SIEM keeps events 90 days, against the 12 months (365 days) of SITL-POL-009 Section 3.4. The hot, searchable period may be shorter, but the total may not."},
    "nolog": {"view": "reg", "ids": NOLOG,
              "why": "Six systems in the extract have no source connected: nothing they log reaches LogLens. Whether each must is the next question."},
    "must": {"rows": {s: {"best": b, "why": w} for s, (b, w) in MUSTW.items()}}},
    "findings": [
        "A.8.16: of the VPN gateway's three production sources, vpn-gw-auth-mnl goes on a timeline as it is, vpn-gw-sys-mnl only with its times moved 4 minutes earlier, and vpn-gw-fw-mnl has been silent since 24 November, so by SITL-POL-009 Section 7.1 it is not covered. Evidence {src}.",
        "A.8.15: the SIEM keeps events 90 days, against the 12 months of SITL-POL-009 Section 3.4; logs not sent to the SIEM are kept 7 days. Evidence {keep}.",
        "A.8.16 (SITL-POL-009 Section 4): the customer portal and the e-mail gateway, both internet-facing, send no logs to the SIEM: the Org CISO to connect them. Four other systems send nothing and are not required to. Evidence {nolog}.",
    ]}
p = key["parts"]
assert FOUND == sorted(TIME) and set(p["must"]["rows"]) == set(NOLOG) and len(NOLOG) == 6
for part in public["parts"]:
    if part["kind"] == "rows":
        assert all(x["best"] in part["options"] for x in p[part["id"]]["rows"].values())
blob = json.dumps(public, ensure_ascii=False, separators=(",", ":"))
assert "§" not in blob and "LearnTech" not in blob
for w in ('"best"', '"why"', '"findings"', "silent since"):
    assert w not in blob, w
(ROOT / f"public/desk/labs/{LAB}.json").write_text(blob, encoding="utf8")
seed = ROOT.parent / "backend/_seed/grc101_lab_keys.json"
all_keys = json.loads(seed.read_text(encoding="utf8"))
all_keys[LAB] = key
seed.write_text(json.dumps(all_keys, ensure_ascii=False, indent=1), encoding="utf8")
print(LAB, len(SRC), "sources", len(REG), "systems")
