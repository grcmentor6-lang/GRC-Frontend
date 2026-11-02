#!/usr/bin/env python3
"""Writes one Tech Lab: its console data for the browser (public/desk/labs/<id>.json) and its key for the
server (backend/_seed/grc101_lab_keys.json). The key is the only place that says which rows are defects.

Lab TL-16-BUS-25-BIZ01-C (pack: techlab_catalogue.json, engine sims_c.biz, simulator AppAdmin, related T6.1) is the
tenant behind T6.1: Mitratech TeamConnect, Org A. It starts from T6.1's own extract (src/lib/desk/uar-t61.json) and
moves it on from the review date to the lab's as-of date, so the two screens agree. Run from web/.
A next lab is another JSON + key entry + a line in src/lib/desk/labs.ts: this script is a convenience, not a dependency.
"""
import datetime as dt
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LAB = "TL-16-BUS-25-BIZ01-C"
AS_OF = "2026-11-09"
uar = json.load(open(ROOT / "src/lib/desk/uar-t61.json", encoding="utf8"))
keys61 = json.load(open(ROOT.parent / "backend/_seed/grc101_row_keys.json", encoding="utf8"))
H = uar["extract"]["h"]
ext = [dict(zip(H, r)) for r in uar["extract"]["r"]]
hr = {r[0]: r for r in uar["hr"]["r"]}

# Accounts T6.1 tests or lists keep their August facts; the planted accounts must be none of them.
listed = set(keys61["T6.1-4"]["rows"]) | set(keys61["T6.1-3"]["rows"])


def clean(u):
    i = u["User ID"]
    return i not in listed and i.startswith("U-") and i in hr and hr[i][3:] == ["", ""] and not u["Revocation executed"]


def pool(role, *depts):
    return [u for u in ext if clean(u) and u["Role / entitlement"] == role and u["Department"] in depts]


adm_bad1 = pool("Power user", "Corporate IT & Technology")[0]
adm_ok = pool("Power user", "Legal & Corporate Affairs", "Governance, Risk & Compliance")[0]
adm_bad2 = pool("Power user", "Service Delivery Operations", "Customer Operations & Support")[0]
named = [u for u in ext if clean(u) and u["Department"] in ("Legal & Corporate Affairs", "Governance, Risk & Compliance") and u["Role / entitlement"] in ("Standard user", "Read-only") and u is not adm_ok][:4]
assert len(named) == 4, len(named)
sso_ok, sso_expired, sso_none, sso_noise = named
GENERIC = ["temp-user-99", "admin01-141"]


def digits(s, n=6):
    return str(int(hashlib.sha256(s.encode()).hexdigest(), 16))[:n]


def n(u):
    return u["User ID"]


rows = []
for u in ext:
    i = n(u)
    if u["Revocation executed"]:  # U-0167: revoked 2026-08-31, gone from the tenant
        continue
    role, approval = u["Role / entitlement"], ""
    if role == "Administrator":
        approval = u["Approval ticket"]
    if i in (n(adm_bad1), n(adm_bad2)):
        role = "Administrator"
    if i == n(adm_ok):
        role, approval = "Administrator", "REQ-" + digits(i + "adm")
    local = i in GENERIC or i in (n(sso_ok), n(sso_expired), n(sso_none))
    last = u["Last login"]
    if i not in listed:  # an active tenant: logins moved on from the August extract
        d = dt.date.fromisoformat(last) + dt.timedelta(days=60 + int(digits(i, 2)) % 28)
        last = min(d, dt.date.fromisoformat(AS_OF) - dt.timedelta(days=1)).isoformat()
    rows.append([i, u["Name"], u["Department"], role, "Local password" if local else "SSO", "None" if local else "Enforced by IdP", last, approval])

audit = [
    ["2026-11-06 09:12 UTC", "U-0190", "Report exported", "User and role report"],
    ["2026-10-27 16:40 UTC", "U-0135", "Setting viewed", "Session timeout"],
    ["2026-10-14 11:26 UTC", "U-0135", "Role changed", f"{n(adm_bad2)}: Power user to Administrator"],
    ["2026-10-06 08:51 UTC", "U-0190", "Role changed", f"{n(adm_ok)}: Power user to Administrator"],
    ["2026-09-30 00:00 UTC", "System", "Exception expired", "SSO-EX-07"],
    ["2026-09-22 14:07 UTC", "U-0190", "Role changed", f"{n(adm_bad1)}: Power user to Administrator"],
    ["2026-09-15 10:03 UTC", "U-0190", "Setting viewed", "Audit-log retention"],
    ["2026-08-31 07:30 UTC", "U-0190", "Account removed", "U-0167 (review decision: Revoke)"],
    ["2026-08-28 08:00 UTC", "U-0135", "Report exported", "Access review extract, 216 accounts"],
    ["2026-07-02 13:18 UTC", "U-0190", "Setting changed", "Local-password sign-in: Disabled to Allowed (SSO optional)"],
]
excs = [
    ["SSO-EX-04", n(sso_noise), "Closed early: moved to SSO in batch 1", "System owner + CISO", "None needed", "2026-12-31"],
    ["SSO-EX-07", n(sso_expired), "Held on local sign-in until identity-provider migration batch 2 (CHG-48177)", "System owner + CISO", "Named user, 12-hour session", "2026-09-30"],
    ["SSO-EX-09", n(sso_ok), "Held on local sign-in until identity-provider migration batch 3 (CHG-48213)", "System owner + CISO", "Named user, 12-hour session", "2027-01-31"],
]
TYPES = ["U1", "U2", "U3", "U4", "U5", "U6", "U7", "U8", "U9", "U10", "No U code"]

public = {
    "id": LAB,
    "sim": "AppAdmin",
    "title": "Admin and SSO review",
    "org": "GlobalConnect Customer Solutions",
    "product": "Mitratech TeamConnect",
    "capability": "Matter & litigation management",
    "tenant": "globalconnect.example / TeamConnect",
    "asOf": AS_OF,
    "related": "T6.1",
    "feed": "UAR-MEMO, row Tenant check",
    "context": "At GlobalConnect, matter and litigation management runs on Mitratech TeamConnect, named here only for context. AppAdmin is a brand-neutral simulator that shows the same governance information. All tenant data is synthetic.",
    "atWork": "At work, a junior analyst opens an application's admin console when an access review needs confirming: the extract shows who had access on one day, the console shows who holds it now and how they sign in.",
    "owner": ["Compliance Manager", "Your UAR tested the extract of 2026-08-28. Before the memo goes, check the tenant itself: is TeamConnect's administrator set approved, and does everyone sign in through SSO? Capture what you find, so I can rely on it without opening the console."],
    "rules": [
        ["BKB-POL-006 Section 3.1", "Access is granted … only with the approval of the asset owner. Shared and generic accounts are prohibited, except break-glass accounts that are registered, sealed and monitored. … single sign-on is used wherever an application supports it."],
        ["BKB-POL-006 Section 8", "Exceptions require a documented risk assessment, compensating controls, a named owner, an expiry date (maximum 12 months) and approval per the delegated authority."],
        ["Access Reviews › Start Review", "Registered break-glass accounts: None registered for this system."],
    ],
    "views": [
        {"key": "users", "title": "Users & roles", "sub": "Application users, today. Admin approval is the ticket for the admin role.", "cols": ["User ID", "Name", "Department", "Role", "Sign-in method", "MFA", "Last login", "Admin approval"], "filters": ["Department", "Role", "Sign-in method", "Admin approval"], "rows": rows},
        {"key": "settings", "title": "Tenant settings", "sub": "How the tenant is configured, today.", "cols": ["Setting", "Value"], "filters": [], "rows": [["Single sign-on", "Configured (corporate identity provider)"], ["Local-password sign-in", "Allowed (SSO optional)"], ["Session timeout", "12 h"], ["Audit logging", "On"], ["Audit-log retention", "180 days"], ["Export to security monitoring (SIEM)", "On"]]},
        {"key": "exceptions", "title": "SSO exceptions", "sub": "Documented exceptions to single sign-on. An exception counts only until its expiry date.", "cols": ["Exception", "Account", "Reason", "Approved by", "Compensating control", "Expiry"], "filters": [], "rows": excs},
        {"key": "audit", "title": "Audit log", "sub": "Administrative events, newest first.", "cols": ["Time (UTC)", "By", "Event", "Detail"], "filters": ["Event"], "rows": audit},
    ],
    "guide": {"view": "users", "col": "Department", "value": "Legal & Corporate Affairs"},
    "parts": [
        {"id": "admins", "kind": "capture", "title": "Administrators with no approval",
         "ask": "An administrator needs an approval ticket. Find every administrator who has none, and capture exactly those accounts.",
         "where": "Users & roles. Use two filters together: one for the role, one for the approval. Press Capture evidence, then choose the capture here."},
        {"id": "signin", "kind": "capture", "title": "Accounts outside single sign-on",
         "ask": "Find every account that does not sign in through SSO, and capture exactly those accounts.",
         "where": "Users & roles. Clear your filters first. The column to filter is Sign-in method."},
        {"id": "verdict", "kind": "rows", "title": "Is each one really an issue?",
         "ask": "For each account you captured, decide whether a documented exception explains it.",
         "where": "SSO exceptions lists the exceptions. Find the account there, then read its expiry against the console's date.",
         "options": ["Issue", "Not an issue: documented exception"], "from": [{"part": "signin"}]},
        {"id": "setting", "kind": "capture", "title": "The setting that allows it",
         "ask": "Which tenant setting lets these accounts sign in without SSO? Search for it and capture that one row.",
         "where": "Tenant settings. Type part of the setting's name in Search so that only its row is left."},
        {"id": "types", "kind": "rows", "title": "The exception type of each",
         "ask": "Give each account its type, as you did in UAR-TEST.",
         "where": "Learn & Grow › Reference pages › Ref-UAR codes. A policy deviation that no code describes takes No U code.",
         "options": TYPES, "from": [{"part": "admins"}, {"part": "verdict", "keep": "Issue"}]},
    ],
}

t, g = GENERIC
GEN_V = "No exception lists it, and a generic account has no one to answer for it."
U4 = "A privileged role with no approval ticket: U4 (High)."
U3 = "A generic account, and no break-glass account is registered for this system: U3 (Medium)."
NOU = "A named, approved user. The deviation is the sign-in method, against BKB-POL-006 Section 3.1, and no U code describes it."
key = {
    "parts": {
        "admins": {"view": "users", "ids": [n(adm_bad1), n(adm_bad2)],
                   "why": f"Five accounts hold Administrator today. U-0135 and U-0190 carry the tickets the review saw, and {n(adm_ok)} has one. {n(adm_bad1)} and {n(adm_bad2)} have none. The Audit log shows both roles granted after the review of 2026-08-28: the extract does not list them, and your conclusion on it stands."},
        "signin": {"view": "users", "ids": sorted([t, g, n(sso_ok), n(sso_expired), n(sso_none)]),
                   "why": "Five accounts sign in with a local password. Everyone else is Enforced by IdP. A filter on the column finds them all; reading 215 rows would not."},
        "verdict": {"rows": {
            t: {"best": "Issue", "why": GEN_V},
            g: {"best": "Issue", "why": GEN_V},
            n(sso_ok): {"best": "Not an issue: documented exception", "why": "SSO-EX-09 is approved by the System owner and CISO and runs to 2027-01-31, after the console's date."},
            n(sso_expired): {"best": "Issue", "why": "SSO-EX-07 expired on 2026-09-30 and the account still signs in with a password. An expired exception explains nothing."},
            n(sso_none): {"best": "Issue", "why": "No exception lists this account. SSO-EX-04 is another account's."},
        }},
        "setting": {"view": "settings", "ids": ["Local-password sign-in"],
                    "why": "Allowed (SSO optional) is why these accounts exist: SSO is configured but not enforced. The Audit log shows the change on 2026-07-02. Until it is Disabled, a new local account can appear at any time."},
        "types": {"options": TYPES, "rows": {
            n(adm_bad1): {"best": "U4", "why": U4},
            n(adm_bad2): {"best": "U4", "why": U4},
            t: {"best": "U3", "why": U3},
            g: {"best": "U3", "why": U3},
            n(sso_expired): {"best": "No U code", "why": NOU},
            n(sso_none): {"best": "No U code", "why": NOU},
        }},
    },
    "findings": [
        f"{n(adm_bad1)} and {n(adm_bad2)} hold Administrator with no approval ticket (U4, High): remove the role until a ticket exists; IAM team, 1 working day. Evidence {{admins}}.",
        f"{t} and {g} are generic accounts signing in with local passwords, with no break-glass account registered (U3, Medium): register as break-glass or disable; System owner, 5 working days. Evidence {{signin}}.",
        f"{n(sso_expired)} (SSO-EX-07 expired 2026-09-30) and {n(sso_none)} (no exception) sign in with local passwords against BKB-POL-006 Section 3.1: move them to SSO or renew the exception; System owner, 5 working days. Evidence {{signin}}.",
        "Local-password sign-in is Allowed (SSO optional): set it to Disabled once migration batch 3 completes. Evidence {setting}.",
    ],
}

(ROOT / "public/desk/labs").mkdir(exist_ok=True)
blob = json.dumps(public, ensure_ascii=False, separators=(",", ":"))
assert "§" not in blob and "§" not in json.dumps(key, ensure_ascii=False)
(ROOT / f"public/desk/labs/{LAB}.json").write_text(blob, encoding="utf8")
seed = ROOT.parent / "backend/_seed/grc101_lab_keys.json"
all_keys = json.loads(seed.read_text(encoding="utf8")) if seed.exists() else {}
all_keys[LAB] = key
seed.write_text(json.dumps(all_keys, ensure_ascii=False, indent=1), encoding="utf8")
print(LAB, len(rows), "rows;", "admins", key["parts"]["admins"]["ids"], "ok", n(adm_ok), "local", key["parts"]["signin"]["ids"], "valid", n(sso_ok), "expired", n(sso_expired), "none", n(sso_none))
