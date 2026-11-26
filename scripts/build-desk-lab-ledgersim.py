#!/usr/bin/env python3
"""Writes Tech Lab TL-36-BUS-03-FIN01-C (LedgerSim, "Segregation of duties in finance"): its console data
(public/desk/labs/<id>.json) and its key (backend/_seed/grc101_lab_keys.json, merged, so take the shared lock).

LI101 rebuild (26 Nov 2026): a required part of T3.2 (control sprint 1, A.5.3), opened after step 5. It shows the Manila
finance system as SPR-01 describes it: "in the finance team of three, one person both creates suppliers in the supplier
master and approves their payments, and nobody reviews changes to the supplier master". Nothing here contradicts SPR-01:
no list of conflicting duties, no segregation matrix, no exception and no reviewer exists at Manila, so the console has none.
Users, suppliers, changes and payments are written here and are synthetic; amounts in PHP. The lab's questions are factual
(read the console, capture, classify); the step-8 decision (what to record for A.5.3) is not answered here. Run from web/."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LAB = "TL-36-BUS-03-FIN01-C"
AS_OF = "2026-10-21"  # in the week of T3.2's walk-through (October 2026)

SM, PA, PP, SA, VW = "Supplier maintainer", "Payment approver", "Payment preparer", "System administrator", "Viewer"
BOTH = f"{SM}; {PA}"
ROLES = [[SM, "Create suppliers and change their details, bank account included"], [PA, "Approve supplier payments up to the account's approval limit"],
         [PP, "Enter supplier invoices and prepare the payment run"], [SA, "Settings and user accounts of the finance system"], [VW, "Read-only"]]

# Users & roles: User ID, Name, Job, Role(s), Status, Last login, Approval limit (PHP)
U = [
    ["U-F01", "Elena Reyes", "Finance Manager", PA, "Active", "2026-10-21", "500,000"],
    ["U-F02", "Jomar Villanueva", "Accounts payable officer", BOTH, "Active", "2026-10-21", "150,000"],
    ["U-F03", "Katrina Lim", "Accounts payable clerk", PP, "Active", "2026-10-20", "—"],
    ["U-F04", "Carlo Mendoza", "Accounts payable officer (left 14 August 2026)", BOTH, "Disabled", "2026-08-14", "150,000"],
    ["U-F05", "Rafael Ocampo", "Group finance, approves the largest payments", PA, "Active", "2026-10-16", "5,000,000"],
    ["U-F06", "Leila Navarro", "Manila IT, runs the finance system", SA, "Active", "2026-10-19", "—"],
    ["U-F07", "Benedict Tan", "Group treasury, reads payment reports", VW, "Active", "2026-10-14", "—"],
]
LIMIT = {u[1]: int(u[6].replace(",", "")) for u in U if u[6] != "—"}
J, C = "Jomar Villanueva", "Carlo Mendoza"

# Supplier master change log: Change, Supplier, Field changed, Date, Changed by, Reviewed by (nobody reviews: SPR-01)
VC = [
    ["SM-2297", "S-1102", "Bank account", "2026-07-02", C, ""],
    ["SM-2301", "S-1140", "Created", "2026-07-09", C, ""],
    ["SM-2309", "S-1140", "Bank account", "2026-07-30", C, ""],
    ["SM-2314", "S-1155", "Created", "2026-08-12", J, ""],
    ["SM-2322", "S-1155", "Address", "2026-08-20", J, ""],
    ["SM-2328", "S-1161", "Created", "2026-09-03", J, ""],
    ["SM-2331", "S-1161", "Bank account", "2026-09-10", J, ""],
    ["SM-2337", "S-1102", "Contact e-mail", "2026-09-15", J, ""],
    ["SM-2344", "S-1170", "Created", "2026-09-24", J, ""],
    ["SM-2349", "S-1155", "Bank account", "2026-10-01", J, ""],
    ["SM-2355", "S-1170", "Bank account", "2026-10-08", J, ""],
    ["SM-2360", "S-1177", "Created", "2026-10-14", J, ""],
    ["SM-2362", "S-1161", "Address", "2026-10-16", J, ""],
]
# Payments: Payment, Supplier, Amount (PHP), Approved by, Date
PAYS = [
    ["PAY-5101", "S-1102", "84,000", "Elena Reyes", "2026-09-02"],
    ["PAY-5188", "S-1155", "62,400", J, "2026-09-04"],
    ["PAY-5192", "S-1161", "118,000", J, "2026-09-22"],
    ["PAY-5199", "S-1170", "45,500", "Elena Reyes", "2026-10-12"],
    ["PAY-5203", "S-1102", "91,000", "Elena Reyes", "2026-10-09"],
    ["PAY-5206", "S-1140", "73,200", "Elena Reyes", "2026-09-17"],
    ["PAY-5210", "S-1155", "58,900", J, "2026-10-15"],
    ["PAY-5214", "S-1102", "33,800", "Rafael Ocampo", "2026-10-02"],
    ["PAY-5217", "S-1161", "27,150", "Elena Reyes", "2026-10-19"],
]
assert all(int(p[2].replace(",", "")) <= LIMIT[p[3]] for p in PAYS), "every payment is within its approver's limit: this lab is not about limits"

SOD_ROWS = sorted(u[0] for u in U if u[3] == BOTH and u[4] == "Active")
NEW = sorted(c[0] for c in VC if c[2] == "Created" and c[4] == J)
BANK = sorted(c[0] for c in VC if c[2] == "Bank account" and c[4] == J)
SAME, OTHER, NONE = "Paid, approved by the same account", "Paid, approved by someone else", "Not paid yet"


def paid(change):
    sup, d = next((c[1], c[3]) for c in VC if c[0] == change)
    after = [p for p in PAYS if p[1] == sup and p[4] >= d]
    return after


public = {
    "id": LAB,
    "sim": "LedgerSim",
    "title": "Segregation of duties in finance",
    "org": "GlobalConnect Customer Solutions",
    "product": "Manila finance system",
    "capability": "Supplier master and payments",
    "tenant": "globalconnect.example / Finance",
    "asOf": AS_OF,
    "related": "T3.2",
    "feed": "T3.2's control sprint 1",
    "context": "At GlobalConnect Manila the finance team of three keeps the supplier master and approves supplier payments in the finance system. LedgerSim is a brand-neutral simulator that shows the same governance information: users and roles, the supplier master change log and payments. All amounts are in PHP. All finance data is synthetic.",
    "atWork": "At work, a junior analyst reads the finance system itself when a segregation-of-duties finding needs evidence: who holds which roles, what the account did, and whether anyone looked.",
    "owner": ["Compliance Manager", "Your walk-through found that one of the finance team both creates suppliers and approves their payments. Before the control sprint closes, look at the finance system as it is today and capture what it shows, so the finding rests on the system and not on a conversation: which account holds both roles, which suppliers it created and whether it approved payments to them, and the bank-detail changes it made. Nobody at Manila reviews the supplier master, so there is no review to read."],
    "rules": [
        ["SITL-POL-006 Section 7.1, Designing roles", "Document toxic combinations (segregation-of-duties conflicts) and block them in the role design."],
        ["ISO/IEC 27001 Annex A.5.3", "Conflicting duties and conflicting areas of responsibility are segregated. Where they cannot be, a compensating control is recorded: the usual one is an independent review."],
        ["What a conflict looks like here", "Supplier maintainer lets an account create a supplier and change where it is paid; Payment approver lets it release the payment. One account holding both can set up a supplier and pay it alone."],
    ],
    "views": [
        {"key": "users", "title": "Users & roles", "sub": "Finance-system accounts and their roles. Approval limit is the largest payment the account may approve, in PHP. No segregation matrix is configured: the system does not stop two roles being held together.",
         "cols": ["User ID", "Name", "Job", "Role(s)", "Status", "Last login", "Approval limit (PHP)"], "filters": ["Role(s)", "Status"], "rows": U},
        {"key": "roles", "title": "Roles", "sub": "What each role can do.", "cols": ["Role", "Permissions"], "filters": [], "rows": ROLES},
        {"key": "vm", "title": "Supplier master", "sub": "Supplier master change log, since 1 July 2026. Reviewed by is blank where nobody reviewed the change.",
         "cols": ["Change", "Supplier", "Field changed", "Date", "Changed by", "Reviewed by"], "filters": ["Field changed", "Changed by", "Reviewed by"], "rows": VC},
        {"key": "pay", "title": "Payments", "sub": "Supplier payments, since 1 September 2026, in PHP. Each was within its approver's limit.",
         "cols": ["Payment", "Supplier", "Amount (PHP)", "Approved by", "Date"], "filters": ["Supplier", "Approved by"], "rows": PAYS},
    ],
    "guide": {"view": "users", "col": "Status", "value": "Disabled"},
    "parts": [
        {"id": "sod", "kind": "capture", "title": "Who can set up a supplier and pay it",
         "ask": "Find every active account that holds both Supplier maintainer and Payment approver, and capture exactly that.",
         "where": "Users & roles. Roles says what each role does. Use two filters together: one for the roles, one for the status. Press Capture evidence, then choose the capture here."},
        {"id": "new", "kind": "capture", "title": "Suppliers that account created",
         "ask": "Find every supplier the account you found created, and capture exactly those changes.",
         "where": "Supplier master. A new supplier appears as the change Created. Use two filters together: one for the field, one for who changed it."},
        {"id": "paid", "kind": "rows", "title": "Was each one paid, and who approved it?",
         "ask": "For each supplier creation you captured, decide whether its supplier has been paid since, and by whom.",
         "where": "Supplier master gives each change's supplier and date. Payments lists each payment's supplier, approver and date.",
         "options": [SAME, OTHER, NONE], "from": [{"part": "new"}]},
        {"id": "bank", "kind": "capture", "title": "Bank-detail changes by that account",
         "ask": "Find every bank-detail change the account made, and capture exactly those.",
         "where": "Supplier master. Use two filters together: one for the field, one for who changed it. Reviewed by shows whether anyone looked."},
    ],
}

PAID_KEY = {}
for c in NEW:
    p = paid(c)
    PAID_KEY[c] = (NONE if not p else SAME if any(x[3] == J for x in p) else OTHER)
WHY = {
    NONE: "No payment to this supplier is on the list yet: it was created on {d}, and nothing has been paid. The conflict has not been used here, but the account could.",
    SAME: "The same account created {s} and approved a payment to it ({p}). Nobody else was in the path, and nobody reviewed either action.",
    OTHER: "{s} was created by the account, but its payment ({p}) was approved by the Finance Manager: someone else was in the path this time.",
}
rows_paid = {}
for c in NEW:
    sup, d = next((x[1], x[3]) for x in VC if x[0] == c)
    ps = ", ".join(f"{x[0]} by {x[3]}" for x in paid(c))
    rows_paid[c] = {"best": PAID_KEY[c], "why": WHY[PAID_KEY[c]].format(s=sup, d=d, p=ps)}

key = {
    "parts": {
        "sod": {"view": "users", "ids": SOD_ROWS,
                "why": "One active account, U-F02 (Accounts payable officer), holds Supplier maintainer with Payment approver: it can create a supplier and approve its payments. U-F04 held both too, but was disabled when the officer left on 14 August 2026."},
        "new": {"view": "vm", "ids": NEW,
                "why": "Four suppliers were created by the account since 12 August 2026. S-1140, created by the leaver Carlo Mendoza in July, is not this account's."},
        "paid": {"rows": rows_paid},
        "bank": {"view": "vm", "ids": BANK,
                 "why": "Three bank-detail changes were made by the account, and every one has no reviewer. Carlo Mendoza's two bank changes in July were made by an account that has since been disabled."},
    },
    "findings": [
        "A.5.3 (SITL-POL-006 Section 7.1): the finance system has no segregation rule, and one active account, U-F02 (Accounts payable officer), holds Supplier maintainer with Payment approver, so it can create a supplier and approve its payments. The leaver's account, U-F04, had the same pair and is disabled. Evidence {sod}.",
        "The account created four suppliers since 12 August 2026 (S-1155, S-1161, S-1170, S-1177). For S-1155 and S-1161 it also approved the payments (PAY-5188, PAY-5192, PAY-5210); S-1170's payment was approved by the Finance Manager; S-1177 has not been paid. Evidence {new}.",
        "The account made three bank-detail changes (SM-2331, SM-2349, SM-2355) and nobody reviewed any change to the supplier master. The independent review the A.5.3 record names as the compensating control would start here: Finance Manager as its owner, the bank-detail changes first. Evidence {bank}.",
    ],
}

# The data agrees with its key.
p = key["parts"]
assert SOD_ROWS == ["U-F02"] and len(NEW) == 4 and len(BANK) == 3
assert set(p["paid"]["rows"]) == set(NEW) and sorted(set(v["best"] for v in p["paid"]["rows"].values())) == sorted([SAME, OTHER, NONE])
assert all(v[5] == "" for v in VC), "nobody reviews the supplier master (SPR-01)"
for part in public["parts"]:
    if part["kind"] == "rows":
        assert all(x["best"] in part["options"] for x in p[part["id"]]["rows"].values())
assert len({u[0] for u in U}) == len(U) and len({c[0] for c in VC}) == len(VC) and len({x[0] for x in PAYS}) == len(PAYS)

(ROOT / f"public/desk/labs/{LAB}.json").write_text(json.dumps(public, ensure_ascii=False, separators=(",", ":")), encoding="utf8")
seed = ROOT.parent / "backend/_seed/grc101_lab_keys.json"
all_keys = json.loads(seed.read_text(encoding="utf8"))
all_keys[LAB] = key
seed.write_text(json.dumps(all_keys, ensure_ascii=False, indent=1), encoding="utf8")
blob = json.dumps([public, key], ensure_ascii=False)
assert "§" not in blob and "Lumen" not in blob and "LearnTech" not in blob
pub = json.dumps(public, ensure_ascii=False)
for w in ('"best"', '"why"', '"findings"', "created by the account since 12 August"):
    assert w not in pub, w
print(LAB, len(U), "users", len(VC), "changes", len(PAYS), "payments")
