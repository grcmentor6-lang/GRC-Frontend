#!/usr/bin/env python3
"""Writes Tech Lab TL-16-BUS-25-BIZ01-C (AppAdmin, "Administrators and shared accounts"): console data
(public/desk/labs/<id>.json) and key (backend/_seed/grc101_lab_keys.json, merged, so take the shared lock).

LI101 rebuild (26 Nov 2026): a required part of T7.1 (control sprint 6, A.5.15-A.5.18), opened after step 4. The CRM of
Manila as SPR-06 and ACC-RULES describe it, at the account extract's date (16 November 2026): accounts come from the Group
IAM through single sign-on, except the shared "support" account (five after-hours agents, a local password, the second
factor on the night team's shared phone); the CRM administrator, who created it, administers the CRM; team leaders hold
Administrator (ACC-02); SITL-POL-006 Section 6 has been in force since 1 October 2026, so only a grant after it can carry an
approval. People and ids are written here and are synthetic. Questions are factual: the step-7 and step-8 decisions are not
answered here. Run from web/."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LAB = "TL-16-BUS-25-BIZ01-C"
AS_OF = "2026-11-16"
CO, SD, QA, IT = "Customer Operations & Support", "Service Delivery Operations", "Quality Assurance", "Corporate IT & Technology"
AG, TL, QAN, ADM, IE = "Customer service agent", "Team leader", "QA analyst", "CRM administrator", "IT support engineer"
SSO, LOC = "SSO (Group IAM)", "Local password"
# User ID, Name, Job, Department, Role, Sign-in, MFA, Last login, Admin approval
U = [
    ["U-0101", "Ricardo Alonzo", ADM, IT, "Administrator", SSO, "Enforced by IdP", "2026-11-16", ""],
    ["U-0102", "Marites Cruz", TL, CO, "Administrator", SSO, "Enforced by IdP", "2026-11-16", ""],
    ["U-0103", "Dennis Bautista", TL, SD, "Administrator", SSO, "Enforced by IdP", "2026-11-13", ""],
    ["U-0104", "Joel Santiago", IE, IT, "Administrator", SSO, "Enforced by IdP", "2026-11-12", "REQ-20114"],
    ["U-0105", "Grace Mercado", TL, CO, "Team lead", SSO, "Enforced by IdP", "2026-11-16", ""],
    ["U-0106", "Paolo Gonzales", TL, SD, "Team lead", SSO, "Enforced by IdP", "2026-11-14", ""],
    ["U-0107", "Hannah Dizon", QAN, QA, "Read-only", SSO, "Enforced by IdP", "2026-11-13", ""],
    ["U-0108", "Rico Estrada", QAN, QA, "Read-only", SSO, "Enforced by IdP", "2026-11-12", ""],
    ["U-0120", "support (shared)", "Shared after-hours account", CO, "Agent", LOC, "Shared phone", "2026-11-15", ""],
]
names = ["Lyka Ramos", "Noel Castillo", "Bea Aquino", "Jericho Flores", "Mika Torres", "Paulo Domingo", "Tin Valdez", "Gio Salazar",
         "Rhea Navarro", "Miguel Soriano", "Cathy Dela Cruz", "Arvin Lopez", "Joyce Medina", "Ken Rivera", "Sarah Bernardo", "Ian Pineda"]
for i, n in enumerate(names):
    U.append([f"U-{130 + i:04d}", n, AG, CO if i % 3 else SD, "Agent", SSO, "Enforced by IdP", f"2026-11-{16 - i % 4:02d}", ""])
U.sort(key=lambda r: r[0])
ADMINS_NO = sorted(r[0] for r in U if r[4] == "Administrator" and not r[8])
LOCAL = sorted(r[0] for r in U if r[5] == LOC)
NEED, MORE = "The job needs it: it administers the CRM", "More than the job needs"
AUDIT = [
    ["2026-11-16 08:02 UTC", "System", "Report exported", f"User and role report, {len(U)} accounts"],
    ["2026-11-04 15:20 UTC", "U-0101", "Setting viewed", "Local-password sign-in"],
    ["2026-10-20 10:44 UTC", "U-0101", "Role changed", "U-0104: Team lead to Administrator (request REQ-20114)"],
    ["2026-03-17 09:12 UTC", "U-0101", "Role changed", "U-0103: Team lead to Administrator"],
    ["2026-01-22 13:05 UTC", "U-0101", "Role changed", "U-0102: Team lead to Administrator"],
    ["2025-03-18 07:30 UTC", "U-0101", "Account reviewed", "Access review of the CRM (kept all accounts)"],
    ["2025-02-11 22:48 UTC", "U-0101", "Account created", "U-0120: support, local password, for the night shift"],
    ["2024-06-03 08:15 UTC", "System", "Setting changed", "Local-password sign-in: Disabled to Allowed (SSO optional)"],
]
SETTINGS = [["Single sign-on", "Configured (Group IAM)"], ["Local-password sign-in", "Allowed (SSO optional)"],
            ["Multi-factor authentication", "Enforced for SSO sign-in; per account for local sign-in"],
            ["Session timeout", "12 h"], ["Audit logging", "On"], ["Audit-log retention", "180 days"]]
public = {
    "id": LAB, "sim": "AppAdmin", "title": "Administrators and shared accounts",
    "org": "GlobalConnect Customer Solutions", "product": "HelpLoop", "capability": "CRM platform",
    "tenant": "globalconnect.example / CRM", "asOf": AS_OF, "related": "T7.1",
    "feed": "T7.1's evidence packs for A.5.16 and A.5.18",
    "context": "At GlobalConnect Manila the CRM runs on HelpLoop, named here only for context. AppAdmin is a brand-neutral simulator that shows the same governance information. All tenant data is synthetic.",
    "atWork": "At work, a junior analyst opens an application's admin console when an access review needs evidence: the extract shows who had access on one day, the console shows who holds it now and how they sign in.",
    "owner": ["Compliance Manager", "Your sprint rates the access controls from the Manila office's own account of them. Before the evidence packs for A.5.16 and A.5.18 are built, look at the CRM itself, as of the account extract of 16 November 2026: who holds Administrator and whether an approval stands behind it, who does not sign in through the Group's single sign-on, and which setting allows it. Capture what you find, so the packs can rely on it without anyone opening the console."],
    "rules": [
        ["SITL-POL-006 Section 3.1", "Access is granted only with the approval of the asset owner. Shared and generic accounts are prohibited, except break-glass accounts that are registered, sealed and monitored. Single sign-on is used wherever an application supports it."],
        ["SITL-POL-006 Section 6", "Access is requested by the line manager and approved by the asset owner, and the approval is kept. In force since 1 October 2026: a grant before that date has no approval to find."],
        ["Access rules matrix (T7.1 step 1)", "Your ACC-RULES matrix sets what each role needs on the CRM. A role that holds more than its line says is more than the job needs."],
    ],
    "views": [
        {"key": "users", "title": "Users & roles", "sub": "CRM accounts, today. Admin approval is the request ticket kept for the Administrator role.",
         "cols": ["User ID", "Name", "Job", "Department", "Role", "Sign-in method", "MFA", "Last login", "Admin approval"],
         "filters": ["Job", "Role", "Sign-in method", "Admin approval"], "rows": U},
        {"key": "settings", "title": "Tenant settings", "sub": "How the tenant is configured, today.", "cols": ["Setting", "Value"], "filters": [], "rows": SETTINGS},
        {"key": "audit", "title": "Audit log", "sub": "Administrative events, newest first.", "cols": ["Time (UTC)", "By", "Event", "Detail"], "filters": ["Event"], "rows": AUDIT},
    ],
    "guide": {"view": "users", "col": "Role", "value": "Read-only"},
    "parts": [
        {"id": "admins", "kind": "capture", "title": "Administrators with no approval",
         "ask": "Find every administrator who has no approval ticket, and capture exactly those accounts.",
         "where": "Users & roles. Use two filters together: one for the role, one for the approval. Press Capture evidence, then choose the capture here."},
        {"id": "need", "kind": "rows", "title": "Does the job need Administrator?",
         "ask": "For each administrator you captured, decide whether the job needs the Administrator role.",
         "where": "Users & roles gives each account's Job. Your ACC-RULES matrix (Access Reviews › Privilege Check) says which role of the CRM each job gets.",
         "options": [NEED, MORE], "from": [{"part": "admins"}]},
        {"id": "signin", "kind": "capture", "title": "Accounts outside single sign-on",
         "ask": "Find every account that does not sign in through single sign-on, and capture exactly those accounts.",
         "where": "Users & roles. Clear your filters first. The column to filter is Sign-in method."},
        {"id": "setting", "kind": "capture", "title": "The setting that allows it",
         "ask": "Which tenant setting lets an account sign in without single sign-on? Search for it and capture that one row.",
         "where": "Tenant settings. Type part of the setting's name in Search so that only its row is left."},
    ],
}
key = {"parts": {
    "admins": {"view": "users", "ids": ADMINS_NO,
               "why": "Four accounts hold Administrator. U-0104 has request REQ-20114, from after SITL-POL-006 Section 6 came into force. U-0101, U-0102 and U-0103 have none: the Audit log shows their roles granted without one."},
    "need": {"rows": {
        "U-0101": {"best": NEED, "why": "The CRM administrator configures the CRM and runs its accounts: ACC-04 gives that role Administrator."},
        "U-0102": {"best": MORE, "why": "A team leader moves tickets and reads the team's reports: ACC-02 sets Administrator as more than that job needs."},
        "U-0103": {"best": MORE, "why": "A team leader moves tickets and reads the team's reports: ACC-02 sets Administrator as more than that job needs."}}},
    "signin": {"view": "users", "ids": LOCAL,
               "why": "One account signs in with a local password: U-0120, support, the account the night shift shares. Every other account comes through the Group IAM."},
    "setting": {"view": "settings", "ids": ["Local-password sign-in"],
                "why": "Allowed (SSO optional) is why the shared account can exist: single sign-on is configured but not enforced. The Audit log shows it allowed on 2024-06-03."}},
    "findings": [
        "A.5.18 (SITL-POL-006 Section 6): three of the CRM's four administrators, U-0101, U-0102 and U-0103, hold the role with no approval ticket; U-0104's is dated 20 October 2026, after Section 6 came into force. Evidence {admins}.",
        "A.5.15 (least privilege, ACC-02): U-0102 and U-0103 are team leaders holding Administrator, more than the job needs; U-0101, the CRM administrator, needs it. Evidence {admins}.",
        "A.5.16 (unique identity): U-0120, support, signs in with a local password and a shared second factor, created on 2025-02-11 by the CRM administrator and used by five after-hours agents: actions under it cannot be traced to a person. Evidence {signin}.",
        "Cause: Local-password sign-in is Allowed (SSO optional). Setting it to Disabled once the night shift has named accounts removes the way round the Group IAM. Evidence {setting}.",
    ]}
assert ADMINS_NO == ["U-0101", "U-0102", "U-0103"] and LOCAL == ["U-0120"] and len({r[0] for r in U}) == len(U)
blob = json.dumps(public, ensure_ascii=False, separators=(",", ":"))
assert "§" not in blob and "LearnTech" not in blob
for w in ('"best"', '"why"', '"findings"', "without one"):
    assert w not in blob, w
(ROOT / f"public/desk/labs/{LAB}.json").write_text(blob, encoding="utf8")
seed = ROOT.parent / "backend/_seed/grc101_lab_keys.json"
all_keys = json.loads(seed.read_text(encoding="utf8"))
all_keys[LAB] = key
seed.write_text(json.dumps(all_keys, ensure_ascii=False, indent=1), encoding="utf8")
print(LAB, len(U), "accounts")
