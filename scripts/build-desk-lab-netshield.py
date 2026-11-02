#!/usr/bin/env python3
"""Writes Tech Lab TL-36-INF-07-NET02-C: its console data (public/desk/labs/<id>.json) and its key
(backend/_seed/grc101_lab_keys.json, merged, so take the shared lock). Pack: techlab_catalogue.json, simulator
NetShield, template NET 02 "Remote-admin exposure", related T8.2, LearnTech, Fortinet FortiGate; screens and
defects from p_techsim.py and sims_b.py. The rule base is written here and is synthetic. Run from web/."""
import json
import random
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LAB = "TL-36-INF-07-NET02-C"
AS_OF = "2026-11-23"
rng = random.Random(36)

PAM, NET, EXT, ITL = "PAM-GW-AMS", "Internet", "ext-support-nl", "IT-Ops-LAN"
LMS, EXAM, CRM, BILL, DESK, DATA, CORE = "Learning-MGMT", "Assess-MGMT", "CRM-MGMT", "Billing-MGMT", "Ticketing-MGMT", "Analytics-MGMT", "Core-Net-IST"
objects = [
    [NET, "Zone", "Any public address"],
    [PAM, "Host", "10.44.8.10: the PAM session gateway, Amsterdam"],
    [EXT, "Range", "203.0.113.0/24: a supplier's support office"],
    [ITL, "Subnet", "10.44.20.0/24: IT Operations desks, Amsterdam"],
    ["User-LAN", "Subnet", "10.44.32.0/20: staff desks, Amsterdam"],
    ["Guest-WiFi", "Subnet", "10.44.90.0/24: visitors' Wi-Fi, Amsterdam"],
    ["DMZ-Web", "Subnet", "10.44.2.0/24: public web front ends"],
    ["Server-VLAN", "Subnet", "10.44.10.0/23: application servers, Amsterdam"],
    [LMS, "Group", "Management interfaces of Learning platform & content"],
    [EXAM, "Group", "Management interfaces of Assessment & proctoring data"],
    [CRM, "Group", "Management interfaces of Student support / CRM"],
    [BILL, "Group", "Management interfaces of Regional billing & AR records"],
    [DESK, "Group", "Management interfaces of Customer support / ticketing"],
    [DATA, "Group", "Management interfaces of Learner analytics data"],
    [CORE, "Group", "Management interfaces of Core network & infrastructure, Istanbul, over the site tunnel"],
]
ADMIN = "Remote access"
SSH, RDP, ADM = "SSH 22", "RDP 3389", "HTTPS admin 8443"
NO, IO, PE = "Network Operations", "IT Operations", "Platform Engineering"
# Rule, Name, Source, Destination, Service, Category, Action, Owner, Ticket, Last hit (the console drops Name and Last hit: no question reads them, and a name would give a rule away)
planted = [
    ["FW-1104", "pam-learning-ssh", PAM, LMS, SSH, ADMIN, "Accept", IO, "CHG-51204", "2026-11-22"],
    ["FW-1105", "pam-assess-ssh", PAM, EXAM, SSH, ADMIN, "Accept", IO, "CHG-51205", "2026-11-21"],
    ["FW-1106", "pam-crm-rdp", PAM, CRM, RDP, ADMIN, "Accept", IO, "CHG-51206", "2026-11-22"],
    ["FW-1108", "pam-corenet-admin", PAM, CORE, ADM, ADMIN, "Accept", NO, "CHG-51208", "2026-11-20"],
    ["FW-1120", "block-guest-admin", "Guest-WiFi", LMS, SSH, ADMIN, "Deny", NO, "CHG-51120", "2026-11-19"],
    ["FW-1121", "block-users-admin", "User-LAN", CORE, ADM, ADMIN, "Deny", NO, "CHG-51121", "2026-11-22"],
    ["FW-1131", "corenet-remote-admin", NET, CORE, ADM, ADMIN, "Accept", NO, "CHG-51412", "2026-11-18"],
    ["FW-1132", "learning-remote-ssh", NET, LMS, SSH, ADMIN, "Accept", IO, "CHG-50876", "2026-11-20"],
    ["FW-1133", "billing-support-rdp", EXT, BILL, RDP, ADMIN, "Accept", IO, "CHG-53077", "2026-11-05"],
    ["FW-1134", "crm-remote-ssh", NET, CRM, SSH, ADMIN, "Accept", "", "", "2026-11-12"],
    ["FW-1135", "ticketing-ops-ssh", ITL, DESK, SSH, ADMIN, "Accept", IO, "CHG-49930", "2026-11-22"],
    ["FW-1136", "analytics-ops-ssh", ITL, DATA, SSH, ADMIN, "Accept", IO, "CHG-52211", "2026-11-21"],
]
fill = [("User-LAN", NET, "HTTPS 443", "Web"), ("DMZ-Web", "Server-VLAN", "HTTPS 443", "Web"), (NET, "DMZ-Web", "HTTPS 443", "Web"), ("User-LAN", "Server-VLAN", "HTTPS 443", "Web"), ("Server-VLAN", NET, "DNS 53", "Network service"), ("User-LAN", "Server-VLAN", "DNS 53", "Network service"), ("Server-VLAN", NET, "NTP 123", "Network service"), ("Server-VLAN", "DMZ-Web", "PostgreSQL 5432", "Database"), ("DMZ-Web", "Server-VLAN", "PostgreSQL 5432", "Database"), ("Server-VLAN", NET, "SMTP 25", "Email"), ("Guest-WiFi", NET, "HTTPS 443", "Web")]
rules = list(planted)
for i in range(1000, 1048):
    s, d, svc, cat = fill[i % len(fill)]
    name = f"{s}-{d}-{svc.split()[0]}".lower().replace("-lan", "").replace("-vlan", "")[:24]
    rules.append([f"FW-{i}", name, s, d, svc, cat, "Accept", rng.choice([NO, IO, PE]), f"CHG-{rng.randint(47000, 53999)}", f"2026-11-{rng.randint(10, 22)}"])
rules.sort(key=lambda r: r[0])

exceptions = [
    ["FX-12", "FW-1017", "Web front end kept on an older cipher set until the Q1 release", "Head of Infrastructure + CISO", "Web application firewall in front", "2026-05-04", "2027-04-30"],
    ["FX-17", "FW-1132", "Learning platform vendor's on-call engineers, until the gateway contract is signed", "Head of Infrastructure + CISO", "Source narrowed by time of day", "2025-10-01", "2026-09-30"],
    ["FX-19", "FW-1135", "Ticketing appliance's agent cannot be proxied by the PAM gateway", "Head of Infrastructure + CISO", "Named users, keys only", "2025-04-14", "2026-12-31"],
    ["FX-21", "FW-1136", "Analytics appliance's agent cannot be proxied by the PAM gateway", "Head of Infrastructure + CISO", "Named users, keys only, weekly log review", "2026-03-02", "2027-02-28"],
]
changes = [
    ["FWC-3388", "2026-11-03", "FW-1136", "Rule changed", "adm-sharma3", "CHG-52211", "Comment updated"],
    ["FWC-3341", "2026-09-08", "FW-1133", "Rule changed", "adm-rahman0", "CHG-53077", "Source moved to object ext-support-nl"],
    ["FWC-3312", "2026-07-21", "FW-1133", "Rule added", "adm-rahman0", "CHG-53077", "Temporary, for vendor troubleshooting, remove by 2026-08-14"],
    ["FWC-3290", "2026-06-26", "FW-1129", "Rule removed", "adm-jansen9", "CHG-52640", "Vendor troubleshooting finished"],
    ["FWC-3244", "2026-05-11", "FW-1129", "Rule added", "adm-jansen9", "CHG-52640", "Temporary, for vendor troubleshooting, remove by 2026-06-30"],
    ["FWC-3198", "2026-03-30", "FW-1134", "Rule added", "adm-sharma3", "", "No reason recorded"],
    ["FWC-3171", "2026-03-02", "FW-1136", "Rule added", "adm-sharma3", "CHG-52211", "Analytics appliance support"],
    ["FWC-3122", "2026-01-19", "FW-1131", "Rule added", "adm-nilsen4", "CHG-51412", "Remote support of the core network"],
    ["FWC-3010", "2025-10-01", "FW-1132", "Rule added", "adm-jansen9", "CHG-50876", "Vendor on-call access"],
    ["FWC-2894", "2025-04-14", "FW-1135", "Rule added", "adm-sharma3", "CHG-49930", "Ticketing appliance support"],
]

PAMS, NOT = ["FW-1104", "FW-1105", "FW-1106", "FW-1108"], ["FW-1131", "FW-1132", "FW-1133", "FW-1134", "FW-1135"]
VALID = "Covered by a valid exception"
NONE = "Not covered"
public = {
    "id": LAB,
    "sim": "NetShield",
    "title": "Remote-admin exposure",
    "org": "LearnTech Educational Solutions",
    "product": "Fortinet FortiGate",
    "capability": "Next-generation firewalls (perimeter & internal)",
    "tenant": "learntech.example / FW-AMS-01",
    "asOf": AS_OF,
    "related": "T8.2",
    "feed": "CT-MEMO, row Network path check",
    "context": "At LearnTech, the perimeter and internal firewalls run on Fortinet FortiGate, named here only for context. NetShield is a brand-neutral simulator that shows the same governance information. All rule-base data is synthetic.",
    "atWork": "At work, a junior analyst reads the firewall rule base when a privileged-access test needs backing up: the review shows who holds access, the rule base shows how they can reach the system.",
    "owner": ["Information Security Auditor", "Your test shows whether LearnTech's privileged-access reviews ran. It does not show how those accounts reach their systems. Before the memo goes, check the Amsterdam firewall: where can admin traffic come from, and does any of it go around the PAM tool? Capture what you find, so I can rely on it without opening the console."],
    "rules": [
        ["BKB-POL-006 Section 3.1", "Multi-factor authentication is required for remote, privileged and Tier 3/4 access … Privileged access is held in a privileged-access management (PAM) tool, granted just in time, and recorded where Section 4 requires."],
        ["What that means on a firewall", "Admin traffic should start at the PAM gateway. A path from anywhere else goes around the PAM tool, and a path from the internet leaves an admin interface reachable from outside."],
        ["BKB-POL-006 Section 8", "Exceptions require a documented risk assessment, compensating controls, a named owner, an expiry date (maximum 12 months) and approval per the delegated authority in the GRC Charter Section 6.1."],
        ["Rule R26, Deviation rating", "High = affects a Mission Critical system or no evidence exists. Medium = done late or partly. Low = record-keeping only."],
    ],
    "views": [
        {"key": "rules", "title": "Rules", "sub": "The rule base of FW-AMS-01, today. Category Remote access covers the admin ports: SSH 22, RDP 3389 and HTTPS admin 8443.", "cols": ["Rule", "Source", "Destination", "Service", "Category", "Action", "Owner", "Ticket"], "filters": ["Category", "Action", "Source", "Owner"], "rows": [[r[0], *r[2:9]] for r in rules]},
        {"key": "objects", "title": "Objects", "sub": "What each name in the rule base stands for. A 10.x.x.x address is private, inside LearnTech's network. Any other address is public: it is on the internet.", "cols": ["Object", "Type", "Contains"], "filters": [], "rows": objects},
        {"key": "exceptions", "title": "Exceptions", "sub": "Documented exceptions to the network rules, by rule. An exception counts only within its dates and the policy's limits.", "cols": ["Exception", "Rule", "Reason", "Approved by", "Compensating control", "Approved on", "Expiry"], "filters": [], "rows": exceptions},
        {"key": "changes", "title": "Change log", "sub": "Rule changes, newest first. Detail is what the engineer wrote.", "cols": ["Change", "Date", "Rule", "Event", "By", "Ticket", "Detail"], "filters": ["Event"], "rows": changes},
    ],
    "guide": {"view": "rules", "col": "Owner", "value": NO},
    "parts": [
        {"id": "admin", "kind": "capture", "title": "Rules that let admin traffic through",
         "ask": "Find every rule that lets traffic through on an admin port, and capture exactly those rules.",
         "where": "Rules. Use two filters together: one for the kind of traffic, one for what the firewall does with it. Press Capture evidence, then choose the capture here."},
        {"id": "source", "kind": "rows", "title": "Where each rule's traffic comes from",
         "ask": "For each rule you captured, decide where its traffic starts.",
         "where": "Rules gives each rule's Source. Objects says what that name contains: read the address, not just the name.",
         "options": [NET, "PAM gateway", "Other internal"], "from": [{"part": "admin"}]},
        {"id": "exception", "kind": "rows", "title": "Does an exception cover it?",
         "ask": "For each rule that does not start at the PAM gateway, decide whether a valid exception covers it.",
         "where": "Exceptions lists them by rule. Find the rule, then read its dates against the console's date and against BKB-POL-006 Section 8 in The rules you apply.",
         "options": [VALID, NONE], "from": [{"part": "source", "keep": NET}, {"part": "source", "keep": "Other internal"}]},
        {"id": "temp", "kind": "capture", "title": "The one-off that stayed",
         "ask": "One of the rules with no valid exception was added for a one-off job and should be gone by now. Find the change that added it, and capture that one row.",
         "where": "Change log. Detail says why each rule was added. Filter Event, and Search for the rule's number, so that only its row is left."},
        {"id": "rate", "kind": "rows", "title": "Rate each one",
         "ask": "Rate each rule with no valid exception with rule R26, as you rated deviations in CT-SCRIPT Sheet 3.",
         "where": "R26 is in The rules you apply. Objects says what system a rule's Destination is. BKB-ADD-36 Section 8.1 (Policies › Policy Library) says which systems are Mission Critical. Rules' Ticket, Exceptions and Change log show what evidence exists.",
         "options": ["High", "Medium", "Low"], "from": [{"part": "exception", "keep": NONE}]},
    ],
}

P = "PAM-GW-AMS is the PAM session gateway, 10.44.8.10: this rule is the path the policy wants."
INT = "The object Internet is any public address."
LAN = "IT-Ops-LAN is 10.44.20.0/24, private, but it is IT desks, not the PAM gateway: the session goes around the PAM tool."
NOX = "No exception lists this rule."
key = {
    "parts": {
        "admin": {"view": "rules", "ids": sorted(PAMS + NOT + ["FW-1136"]),
                  "why": "Ten rules accept traffic on an admin port. FW-1120 and FW-1121 are Remote access too, but they Deny it, so they protect rather than expose."},
        "source": {"rows": {
            **{r: {"best": "PAM gateway", "why": P} for r in PAMS},
            "FW-1131": {"best": NET, "why": INT},
            "FW-1132": {"best": NET, "why": INT},
            "FW-1134": {"best": NET, "why": INT},
            "FW-1133": {"best": NET, "why": "ext-support-nl sounds like a partner, but 203.0.113.0/24 is a public range, so this path starts on the internet. The name alone would have hidden it."},
            "FW-1135": {"best": "Other internal", "why": LAN},
            "FW-1136": {"best": "Other internal", "why": LAN},
        }},
        "exception": {"rows": {
            "FW-1131": {"best": NONE, "why": NOX},
            "FW-1132": {"best": NONE, "why": "FX-17 expired on 2026-09-30, and the rule is still live on the console's date. An expired exception explains nothing."},
            "FW-1133": {"best": NONE, "why": NOX},
            "FW-1134": {"best": NONE, "why": NOX},
            "FW-1135": {"best": NONE, "why": "FX-19 has not expired, but it runs from 2025-04-14 to 2026-12-31, over 20 months. Section 8's maximum is 12."},
            "FW-1136": {"best": VALID, "why": "FX-21 runs from 2026-03-02 to 2027-02-28: within 12 months, in date, approved, with compensating controls."},
        }},
        "temp": {"view": "changes", "ids": ["FWC-3312"],
                 "why": "FW-1133 is the one with no valid exception that was added as temporary: remove by 2026-08-14, and it is still live. FW-1129's change reads the same, but that rule was removed on time and is gone from the rule base."},
        "rate": {"options": ["High", "Medium", "Low"], "rows": {
            "FW-1131": {"best": "High", "why": "Core network & infrastructure is Mission Critical in BKB-ADD-36 Section 8.1."},
            "FW-1132": {"best": "Medium", "why": "Learning platform & content is not Mission Critical, and an exception and ticket exist: it was approved, and its renewal is late."},
            "FW-1133": {"best": "Medium", "why": "Regional billing & AR records is not Mission Critical, and the ticket exists: the removal is late."},
            "FW-1134": {"best": "High", "why": "Student support / CRM is not Mission Critical, but this rule has no owner, ticket or exception: no evidence exists."},
            "FW-1135": {"best": "Medium", "why": "Customer support / ticketing is not Mission Critical, and an exception and ticket exist: approved only in part, past the policy's maximum."},
        }},
    },
    "findings": [
        "FW-1131 (to Core network & infrastructure, Mission Critical) and FW-1134 (no owner, ticket or exception) accept admin traffic from the internet (R26 High): Head of Infrastructure & Cloud to remove both. Evidence {admin}.",
        "FW-1132 (FX-17 expired 2026-09-30) and FW-1135 (FX-19 runs past the 12-month maximum) stand without a valid exception (R26 Medium): move them to the PAM gateway or renew within policy. Evidence {admin}.",
        "FW-1133 opens the supplier range ext-support-nl to Regional billing & AR records; it was to go by 2026-08-14 and is still live (R26 Medium): remove it. Evidence {temp}.",
        "The test's conclusion stands: it covers whether the review ran. Sessions on these five rules do not pass the PAM tool, so its MFA and session recording cannot be assumed for them.",
    ],
}

(ROOT / f"public/desk/labs/{LAB}.json").write_text(json.dumps(public, ensure_ascii=False, separators=(",", ":")), encoding="utf8")
seed = ROOT.parent / "backend/_seed/grc101_lab_keys.json"
all_keys = json.loads(seed.read_text(encoding="utf8"))
all_keys[LAB] = key
seed.write_text(json.dumps(all_keys, ensure_ascii=False, indent=1), encoding="utf8")
assert "§" not in json.dumps([public, key], ensure_ascii=False)
assert len(rules) == 60 and len({r[0] for r in rules}) == 60
print(LAB, len(rules), "rules")
