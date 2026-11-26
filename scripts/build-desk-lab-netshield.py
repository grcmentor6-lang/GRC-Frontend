#!/usr/bin/env python3
"""Writes Tech Lab TL-36-INF-07-NET02-C (NetShield, "Remote-admin exposure"): console data (public/desk/labs/<id>.json) and key
(backend/_seed/grc101_lab_keys.json, merged, so take the shared lock).

LI101 rebuild (26 Nov 2026): a required part of T10.1 (control sprint 12, A.8.20-A.8.22), opened after step 5. The rule base of
Manila's core firewall FW-MNL-01 on 30 November 2026, beside T10.1's NET dataset (six zones, VLANs 10/20/30/40/50/99) and its
observation that network devices are managed only from the management zone: so no rule here reaches a network device. The
admin rules reach the servers' management interfaces (IAM, directory, SIEM, call recording, FS-MNL-01). The two network
administrators approve their own changes (T3.2, SPR-01). Rules, owners and tickets are written here and are synthetic.
Questions are factual: steps 8 to 10 are not answered here. Run from web/."""
import json
import random
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LAB = "TL-36-INF-07-NET02-C"
AS_OF = "2026-11-30"
rng = random.Random(36)

PAM, NET, EXT, ITL = "PAM-GW-MNL", "Internet", "ext-support-ph", "IT-Ops-LAN"
MDIR, MIAM, MSIEM, MREC, MFS = "Mgmt-Directory", "Mgmt-IAM", "Mgmt-SIEM", "Mgmt-Recording", "Mgmt-FileSrv"
objects = [
    [NET, "Zone", "Any public address"],
    [PAM, "Host", "10.16.30.12: the PAM session gateway, in the security zone"],
    [EXT, "Range", "203.0.113.0/24: a telephony supplier's support office"],
    [ITL, "Subnet", "10.16.60.0/24: Manila IT desks"],
    ["Agent-floor", "Subnet", "10.16.10.0/24: call-centre workstations and CRM access terminals (VLAN 10)"],
    ["Guest-WiFi", "Subnet", "10.16.50.0/24: visitors' laptops and staff personal phones (VLAN 50)"],
    ["Server-zone", "Subnet", "10.16.20.0/24: file server FS-MNL-01, call recording servers, directory and e-mail servers (VLAN 20)"],
    ["Security-zone", "Subnet", "10.16.30.0/24: PKI and the HSM, the IAM servers, the SIEM collectors (VLAN 30)"],
    [MDIR, "Group", "Management interfaces of Enterprise directory & email"],
    [MIAM, "Group", "Management interfaces of Identity & access management (IAM)"],
    [MSIEM, "Group", "Management interfaces of the SIEM & log analytics platform"],
    [MREC, "Group", "Management interfaces of the call recording servers"],
    [MFS, "Group", "Management interface of file server FS-MNL-01"],
]
ADMIN = "Remote access"
SSH, RDP, ADM = "SSH 22", "RDP 3389", "HTTPS admin 8443"
NO, IO, SO = "Network Operations", "IT Operations", "Security Operations"
# Rule, Name, Source, Destination, Service, Category, Action, Owner, Ticket, Last hit (the console drops Name and Last hit: no question reads them, and a name would give a rule away)
planted = [
    ["FW-1104", "pam-directory-ssh", PAM, MDIR, SSH, ADMIN, "Accept", IO, "CHG-51204", "2026-11-28"],
    ["FW-1105", "pam-iam-admin", PAM, MIAM, ADM, ADMIN, "Accept", SO, "CHG-51205", "2026-11-27"],
    ["FW-1106", "pam-recording-rdp", PAM, MREC, RDP, ADMIN, "Accept", IO, "CHG-51206", "2026-11-28"],
    ["FW-1108", "pam-siem-admin", PAM, MSIEM, ADM, ADMIN, "Accept", SO, "CHG-51208", "2026-11-26"],
    ["FW-1120", "block-guest-admin", "Guest-WiFi", MFS, SSH, ADMIN, "Deny", NO, "CHG-51120", "2026-11-25"],
    ["FW-1121", "block-agents-admin", "Agent-floor", MIAM, ADM, ADMIN, "Deny", NO, "CHG-51121", "2026-11-28"],
    ["FW-1131", "iam-remote-admin", NET, MIAM, ADM, ADMIN, "Accept", NO, "CHG-51412", "2026-11-24"],
    ["FW-1132", "fileserver-remote-ssh", NET, MFS, SSH, ADMIN, "Accept", IO, "CHG-50876", "2026-11-26"],
    ["FW-1133", "recording-support-rdp", EXT, MREC, RDP, ADMIN, "Accept", IO, "CHG-53077", "2026-11-05"],
    ["FW-1134", "directory-remote-ssh", NET, MDIR, SSH, ADMIN, "Accept", "", "", "2026-11-12"],
    ["FW-1135", "fileserver-ops-ssh", ITL, MFS, SSH, ADMIN, "Accept", IO, "CHG-49930", "2026-11-28"],
    ["FW-1136", "recording-ops-ssh", ITL, MREC, SSH, ADMIN, "Accept", IO, "CHG-52211", "2026-11-27"],
]
fill = [("Agent-floor", NET, "HTTPS 443", "Web"), ("Server-zone", NET, "DNS 53", "Network service"), ("Agent-floor", "Server-zone", "HTTPS 443", "Web"),
        ("Server-zone", NET, "NTP 123", "Network service"), ("Agent-floor", "Server-zone", "DNS 53", "Network service"), ("Server-zone", NET, "SMTP 25", "Email"),
        ("Security-zone", "Server-zone", "Syslog 514", "Logging"), ("Server-zone", "Security-zone", "Syslog 514", "Logging"), ("Guest-WiFi", NET, "HTTPS 443", "Web"),
        ("Agent-floor", "Server-zone", "SMB 445", "File sharing"), ("Agent-floor", "Server-zone", "LDAPS 636", "Directory")]
rules = list(planted)
for i in range(1000, 1048):
    s, d, svc, cat = fill[i % len(fill)]
    name = f"{s}-{d}-{svc.split()[0]}".lower().replace("-lan", "").replace("-vlan", "")[:24]
    rules.append([f"FW-{i}", name, s, d, svc, cat, "Accept", rng.choice([NO, IO, SO]), f"CHG-{rng.randint(47000, 53999)}", f"2026-11-{rng.randint(10, 22)}"])
rules.sort(key=lambda r: r[0])

exceptions = [
    ["FX-12", "FW-1017", "Web front end kept on an older cipher set until the Q1 release", "Head of Infrastructure + CISO", "Web application firewall in front", "2026-05-04", "2027-04-30"],
    ["FX-17", "FW-1132", "File server vendor's on-call engineers, until the gateway contract is signed", "Head of Infrastructure + CISO", "Source narrowed by time of day", "2025-10-01", "2026-09-30"],
    ["FX-19", "FW-1135", "File server agent cannot be proxied by the PAM gateway", "Head of Infrastructure + CISO", "Named users, keys only", "2025-04-14", "2026-12-31"],
    ["FX-21", "FW-1136", "Call recording servers' agent cannot be proxied by the PAM gateway", "Head of Infrastructure + CISO", "Named users, keys only, weekly log review", "2026-03-02", "2027-02-28"],
]
# Change, Date, Rule, Event, By, Approved by, Ticket, Detail. The two network administrators approve their own changes (SPR-01, A.5.3).
changes = [
    ["FWC-3388", "2026-11-03", "FW-1136", "Rule changed", "adm-reyes", "adm-reyes", "CHG-52211", "Comment updated"],
    ["FWC-3341", "2026-09-08", "FW-1133", "Rule changed", "adm-santos", "adm-santos", "CHG-53077", "Source moved to object ext-support-ph"],
    ["FWC-3312", "2026-07-21", "FW-1133", "Rule added", "adm-santos", "adm-santos", "CHG-53077", "Temporary, for vendor troubleshooting, remove by 2026-08-14"],
    ["FWC-3290", "2026-06-26", "FW-1129", "Rule removed", "adm-reyes", "adm-reyes", "CHG-52640", "Vendor troubleshooting finished"],
    ["FWC-3244", "2026-05-11", "FW-1129", "Rule added", "adm-reyes", "adm-reyes", "CHG-52640", "Temporary, for vendor troubleshooting, remove by 2026-06-30"],
    ["FWC-3198", "2026-03-30", "FW-1134", "Rule added", "adm-santos", "adm-santos", "", "No reason recorded"],
    ["FWC-3171", "2026-03-02", "FW-1136", "Rule added", "adm-reyes", "adm-reyes", "CHG-52211", "Call recording support"],
    ["FWC-3122", "2026-01-19", "FW-1131", "Rule added", "adm-reyes", "adm-reyes", "CHG-51412", "Remote support of the IAM servers"],
    ["FWC-3010", "2025-10-01", "FW-1132", "Rule added", "adm-santos", "Head of Infrastructure", "CHG-50876", "Vendor on-call access"],
    ["FWC-2894", "2025-04-14", "FW-1135", "Rule added", "adm-santos", "adm-santos", "CHG-49930", "File server support"],
]

PAMS, NOT = ["FW-1104", "FW-1105", "FW-1106", "FW-1108"], ["FW-1131", "FW-1132", "FW-1133", "FW-1134", "FW-1135"]
VALID = "Covered by a valid exception"
NONE = "Not covered"
public = {
    "id": LAB,
    "sim": "NetShield",
    "title": "Remote-admin exposure",
    "org": "GlobalConnect Customer Solutions",
    "product": "Core firewall",
    "capability": "Network security (core firewall FW-MNL-01)",
    "tenant": "globalconnect.example / FW-MNL-01",
    "asOf": AS_OF,
    "related": "T10.1",
    "feed": "T10.1's evidence for A.8.20 to A.8.22",
    "context": "At GlobalConnect Manila every flow between the six zones passes the core firewall FW-MNL-01. NetShield is a brand-neutral simulator that shows the same governance information. All rule-base data is synthetic.",
    "atWork": "At work, a junior analyst reads the firewall rule base when a network control is rated: the zones show what should be kept apart, the rule base shows what is actually allowed through.",
    "owner": ["Information Security Auditor", "Your sprint rates the network controls from the Manila office's own account of them, and your CFG-BASE comparison looked at settings. It does not show how people can reach the servers' admin interfaces. Before the evidence for A.8.20 to A.8.22 is built, check the rule base of FW-MNL-01 as of 30 November 2026: where can admin traffic come from, and does any of it go around the PAM tool? Capture what you find, so I can rely on it without opening the console."],
    "rules": [
        ["SITL-POL-006 Section 3.1", "Multi-factor authentication is required for remote, privileged and Tier 3/4 access. Privileged access is held in a privileged-access management (PAM) tool, granted just in time, and recorded where Section 4 requires."],
        ["What that means on a firewall", "Admin traffic should start at the PAM gateway. A path from anywhere else goes around the PAM tool, and a path from the internet leaves an admin interface reachable from outside."],
        ["SITL-POL-006 Section 8", "Exceptions require a documented risk assessment, compensating controls, a named owner, an expiry date (maximum 12 months) and approval per the delegated authority in the GRC Charter Section 6.1."],
        ["Deviation rating (R26)", "High = affects a Mission Critical system or no evidence exists. Medium = done late or partly. Low = record-keeping only. SITL-ADD-16 Section 8.1 lists Manila's Mission Critical assets: the enterprise directory and e-mail, the IAM and the SIEM are among them; the file server and the call recording servers are not."],
    ],
    "views": [
        {"key": "rules", "title": "Rules", "sub": "Remote-access and server-zone rules of FW-MNL-01, today. Category Remote access covers the admin ports: SSH 22, RDP 3389 and HTTPS admin 8443.", "cols": ["Rule", "Source", "Destination", "Service", "Category", "Action", "Owner", "Ticket"], "filters": ["Category", "Action", "Source", "Owner"], "rows": [[r[0], *r[2:9]] for r in rules]},
        {"key": "objects", "title": "Objects", "sub": "What each name in the rule base stands for. A 10.x.x.x address is private, inside Manila's network. Any other address is public: it is on the internet.", "cols": ["Object", "Type", "Contains"], "filters": [], "rows": objects},
        {"key": "exceptions", "title": "Exceptions", "sub": "Documented exceptions to the network rules, by rule. An exception counts only within its dates and the policy's limits.", "cols": ["Exception", "Rule", "Reason", "Approved by", "Compensating control", "Approved on", "Expiry"], "filters": [], "rows": exceptions},
        {"key": "changes", "title": "Change log", "sub": "Rule changes, newest first. Detail is what the engineer wrote.", "cols": ["Change", "Date", "Rule", "Event", "By", "Approved by", "Ticket", "Detail"], "filters": ["Event"], "rows": changes},
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
         "where": "Exceptions lists them by rule. Find the rule, then read its dates against the console's date and against SITL-POL-006 Section 8 in The rules you apply.",
         "options": [VALID, NONE], "from": [{"part": "source", "keep": NET}, {"part": "source", "keep": "Other internal"}]},
        {"id": "temp", "kind": "capture", "title": "The one-off that stayed",
         "ask": "One of the rules with no valid exception was added for a one-off job and should be gone by now. Find the change that added it, and capture that one row.",
         "where": "Change log. Detail says why each rule was added. Filter Event, and Search for the rule's number, so that only its row is left."},
        {"id": "rate", "kind": "rows", "title": "Rate each one",
         "ask": "Rate each rule with no valid exception with the deviation rating (R26).",
         "where": "The rating is in The rules you apply. Objects says what system a rule's Destination is. Rules' Ticket, Exceptions and Change log show what evidence exists.",
         "options": ["High", "Medium", "Low"], "from": [{"part": "exception", "keep": NONE}]},
    ],
}

P = "PAM-GW-MNL is the PAM session gateway, 10.16.30.12: this rule is the path the policy wants."
INT = "The object Internet is any public address."
LAN = "IT-Ops-LAN is 10.16.60.0/24, private, but it is IT desks, not the PAM gateway: the session goes around the PAM tool."
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
            "FW-1133": {"best": NET, "why": "ext-support-ph sounds like a partner, but 203.0.113.0/24 is a public range, so this path starts on the internet. The name alone would have hidden it."},
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
            "FW-1131": {"best": "High", "why": "The IAM is a Mission Critical asset in SITL-ADD-16 Section 8.1, and this rule has no exception."},
            "FW-1132": {"best": "Medium", "why": "The file server is not Mission Critical, and an exception and ticket exist: it was approved, and its renewal is late."},
            "FW-1133": {"best": "Medium", "why": "The call recording servers are not Mission Critical, and the ticket exists: the removal is late."},
            "FW-1134": {"best": "High", "why": "The enterprise directory and e-mail is a Mission Critical asset, and this rule has no owner, ticket or exception: no evidence exists."},
            "FW-1135": {"best": "Medium", "why": "The file server is not Mission Critical, and an exception and ticket exist: approved only in part, past the policy's maximum."},
        }},
    },
    "findings": [
        "FW-1131 (to the IAM's management interface, Mission Critical) and FW-1134 (to the directory's, with no owner, ticket or exception) accept admin traffic from the internet (R26 High): Head of Infrastructure to remove both. Evidence {admin}.",
        "FW-1132 (FX-17 expired 2026-09-30) and FW-1135 (FX-19 runs past the 12-month maximum) stand without a valid exception (R26 Medium): move them to the PAM gateway or renew within policy. Evidence {admin}.",
        "FW-1133 opens the supplier range ext-support-ph to the call recording servers' management interface; it was to go by 2026-08-14 and is still live (R26 Medium): remove it. Evidence {temp}. Its change, and every other rule change in the log but one, was approved by the administrator who made it.",
        "Sessions on these five rules do not pass the PAM tool, so its MFA and session recording cannot be assumed for them: A.8.20 and A.8.22 are not met for these paths.",
    ],
}

pub = json.dumps(public, ensure_ascii=False, separators=(",", ":"))
assert "§" not in pub and "LearnTech" not in pub
for w in ('"best"', '"why"', '"findings"', "FX-17 expired"):
    assert w not in pub, w
(ROOT / f"public/desk/labs/{LAB}.json").write_text(pub, encoding="utf8")
seed = ROOT.parent / "backend/_seed/grc101_lab_keys.json"
all_keys = json.loads(seed.read_text(encoding="utf8"))
all_keys[LAB] = key
seed.write_text(json.dumps(all_keys, ensure_ascii=False, indent=1), encoding="utf8")
assert len(rules) == 60 and len({r[0] for r in rules}) == 60
print(LAB, len(rules), "rules")
