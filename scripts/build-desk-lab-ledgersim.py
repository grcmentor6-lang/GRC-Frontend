#!/usr/bin/env python3
"""Writes Tech Lab TL-36-BUS-03-FIN01-C: its console data (public/desk/labs/<id>.json) and its key
(backend/_seed/grc101_lab_keys.json, merged, so take the shared lock). Pack: techlab_catalogue.json, simulator LedgerSim,
"Segregation of duties in finance", LearnTech, Workday Adaptive Planning, week 8; this is the mentee's own LedgerSim draw
(the pack's Systems row). Screens and defects from p_techsim.py (FIN) and sims_c.fin: Users & roles, Roles, Approval
workflows, Vendor master, Payments, SoD matrix; "User can create vendor and approve payment", "Bank-detail change without
call-back", "Approval limit bypassed", "Generic finance account". The workflow rules and the SoD matrix are the pack's
words. Related task moved from T6.1 (the pack's, which the AppAdmin lab already feeds, and whose system is a legal
matter-management tool, not a ledger) to T9.2 (week 9, LearnTech): the supplier decision SOC-DEC records is enforced in
the finance system. Lumen is not in the data: nothing here bears on T9.2's steps 1 to 5. Users, vendors, changes,
payments and the SoD exceptions are written here and are synthetic; amounts in EUR only. Run from web/."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LAB = "TL-36-BUS-03-FIN01-C"
AS_OF = "2026-12-04"  # T9.2's review date (soc-t92.json)
assert json.loads((ROOT / "src/lib/desk/soc-t92.json").read_text(encoding="utf8"))["review"] == "Friday 4 December 2026"

VM, AP, APC, TR, GL, VW = "Vendor maintainer", "AP approver", "AP clerk", "Treasury", "GL accountant", "Viewer"
BOTH = f"{VM}; {AP}"
ROLES = [[APC, "Enter invoices"], [AP, "Approve payments"], [VM, "Create/modify vendors"], [GL, "Post journals"], [TR, "Release payment files"], [VW, "Read-only"]]
SOD = [[VM, AP, "No"], [APC, AP, "No"], [TR, AP, "No"], [GL, VW, "Yes"]]  # sims_c.fin's matrix, as the pack has it
NOT_ALLOWED = {frozenset(x[:2]) for x in SOD if x[2] == "No"}

# Users & roles: User ID, Name, Role(s), Status, Last login, Approval limit (EUR)
U = [
    ["U-2101", "Elif Yildiz", APC, "Active", "2026-12-04", "—"],
    ["U-2102", "Murat Kaya", f"{APC}; {VM}", "Active", "2026-12-03", "—"],
    ["U-2103", "Selin Aydin", BOTH, "Active", "2026-12-04", "25,000"],
    ["U-2104", "Burak Demir", TR, "Active", "2026-12-04", "—"],
    ["U-2105", "Zeynep Arslan", AP, "Active", "2026-12-03", "100,000"],
    ["U-2106", "Can Ozturk", VM, "Active", "2026-12-02", "—"],
    ["U-2107", "Deniz Sahin", BOTH, "Active", "2026-12-01", "5,000"],
    ["U-2108", "Pieter de Vries", BOTH, "Active", "2026-12-04", "5,000"],
    ["U-2109", "Sanne Bakker", AP, "Active", "2026-12-02", "25,000"],
    ["U-2110", "Emre Koc", BOTH, "Disabled", "2026-07-31", "25,000"],
    ["U-FIN01", "ap.shared", BOTH, "Active", "2026-12-03", "25,000"],  # the pack plants a generic account; its roles here are the conflict's
    ["U-2112", "Ayse Celik", GL, "Active", "2026-12-04", "—"],
    ["U-2113", "Rohan Mehta", APC, "Active", "2026-11-30", "—"],
    ["U-2114", "Laura Chen", AP, "Active", "2026-12-03", "25,000"],
    ["U-2115", "Hakan Yilmaz", VW, "Active", "2026-11-27", "—"],
    ["U-2116", "Mert Aksoy", f"{GL}; {VW}", "Active", "2026-12-01", "—"],
]
NAME = {u[1]: u for u in U}
LIMIT = {u[1]: int(u[5].replace(",", "")) for u in U if u[5] != "—"}

# SoD exceptions (BKB-POL-006 Section 8): Exception, User ID, Compensating control, Approved on, Expires
EXC = [
    ["EX-12", "U-2110", "Finance Controller reviews the vendor master change log each month", "2025-07-01", "2026-06-30"],
    ["EX-17", "U-2107", "Finance Controller reviews the vendor master change log each month", "2025-10-01", "2026-09-30"],
    ["EX-21", "U-2103", "Finance Controller reviews every vendor master change each week and signs the log", "2026-04-15", "2027-03-31"],
    ["EX-24", "U-FIN01", "AP team lead reviews the account's payments each month", "2026-06-01", "2027-05-31"],
]

WF = [  # sims_c.fin's three rules, the pack's words
    ["Supplier payment", "Approver's limit must be ≥ payment amount"],
    ["Vendor bank-detail change", "Independent call-back to a known number + second approver"],
    ["Manual journal", "Second-person review > 10,000"],
]

# Vendor master change log: Change, Vendor, Field changed, Date, Changed by, Call-back verified, Verified by, Approved by
VC = [
    ["VC-30411", "V48213", "Address", "2026-09-15", "Murat Kaya", "No", "", "Selin Aydin"],
    ["VC-30418", "V51907", "Bank account", "2026-09-22", "Can Ozturk", "Yes", "Burak Demir", "Zeynep Arslan"],
    ["VC-30425", "V60254", "Contact email", "2026-10-02", "Selin Aydin", "No", "", "Zeynep Arslan"],
    ["VC-30431", "V72118", "Bank account", "2026-10-09", "Murat Kaya", "Yes", "Sanne Bakker", "Selin Aydin"],
    ["VC-30437", "V48213", "Bank account", "2026-10-20", "Deniz Sahin", "Yes", "Burak Demir", "Zeynep Arslan"],
    ["VC-30442", "V83561", "Address", "2026-10-28", "Can Ozturk", "No", "", "Selin Aydin"],
    ["VC-30446", "V39074", "Bank account", "2026-11-03", "ap.shared", "No", "", "ap.shared"],
    ["VC-30450", "V91632", "Contact email", "2026-11-06", "Pieter de Vries", "No", "", "Pieter de Vries"],
    ["VC-30453", "V25780", "Bank account", "2026-11-12", "Pieter de Vries", "No", "", "Pieter de Vries"],
    ["VC-30459", "V60254", "Bank account", "2026-11-19", "Selin Aydin", "Yes", "Burak Demir", "Zeynep Arslan"],
    ["VC-30464", "V72118", "Address", "2026-11-24", "Murat Kaya", "No", "", "Selin Aydin"],
    ["VC-30468", "V83561", "Bank account", "2026-11-30", "Can Ozturk", "No", "", "Selin Aydin"],
    ["VC-30472", "V51907", "Contact email", "2026-12-02", "Elif Yildiz", "No", "", "Selin Aydin"],
]

# Payments (last 60 days, EUR): Payment, Vendor, Amount (EUR), Approved by, Approver limit (EUR), Date
def pay(i, v, amt, by, d):
    return [f"PAY-{i}", v, f"{amt:,}", by, f"{LIMIT[by]:,}", d]
PAYS = [
    pay(71802, "V60254", 3_480, "Laura Chen", "2026-10-06"),
    pay(71809, "V51907", 18_250, "Zeynep Arslan", "2026-10-08"),
    pay(71815, "V72118", 6_900, "Sanne Bakker", "2026-10-12"),
    pay(71821, "V39074", 2_640, "ap.shared", "2026-10-14"),
    pay(71826, "V48213", 7_400, "Deniz Sahin", "2026-10-21"),  # over a 5,000 limit
    pay(71830, "V83561", 1_150, "Selin Aydin", "2026-10-23"),
    pay(71836, "V25780", 3_120, "Laura Chen", "2026-10-30"),
    pay(71841, "V60254", 41_600, "Zeynep Arslan", "2026-11-02"),
    pay(71847, "V91632", 1_980, "Pieter de Vries", "2026-11-09"),
    pay(71852, "V72118", 25_000, "Sanne Bakker", "2026-11-10"),  # at the limit: allowed (≥)
    pay(71858, "V48213", 4_210, "Selin Aydin", "2026-11-13"),
    pay(71863, "V25780", 4_850, "Pieter de Vries", "2026-11-16"),  # after VC-30453, no call-back
    pay(71869, "V51907", 9_700, "Laura Chen", "2026-11-18"),
    pay(71874, "V83561", 2_380, "ap.shared", "2026-11-20"),  # before VC-30468
    pay(71880, "V60254", 12_300, "Selin Aydin", "2026-11-23"),
    pay(71885, "V91632", 12_900, "Deniz Sahin", "2026-11-26"),  # over a 5,000 limit
    pay(71891, "V72118", 4_990, "Pieter de Vries", "2026-11-27"),
    pay(71896, "V48213", 16_480, "Zeynep Arslan", "2026-12-01"),
    pay(71902, "V51907", 3_060, "Sanne Bakker", "2026-12-03"),
]

SOD_ROWS = sorted(u[0] for u in U if u[3] == "Active" and set(u[2].split("; ")) >= {VM, AP})
BANK = sorted(c[0] for c in VC if c[2] == "Bank account" and c[5] == "No")
OVER = sorted(p[0] for p in PAYS if int(p[2].replace(",", "")) > int(p[4].replace(",", "")))
COVER, U5, U3 = "Covered: a valid exception", "U5: remove one of the two roles", "U3: register as break-glass or disable"
PAID, HOLD = "Paid since: report a suspected incident now", "Nothing paid since: block payments until verified"

public = {
    "id": LAB,
    "sim": "LedgerSim",
    "title": "Segregation of duties in finance",
    "org": "LearnTech Educational Solutions",
    "product": "Workday Adaptive Planning",
    "capability": "Financial planning & analysis (EPM)",
    "tenant": "learntech.example / Finance",
    "asOf": AS_OF,
    "related": "T9.2",
    "feed": "SOC-DEC, row Vendor set-up check",
    "context": "At LearnTech, Finance sets suppliers up and pays them in its finance systems, and plans the spend in Workday Adaptive Planning, this lab's product, which is named here only for context. LedgerSim is a brand-neutral simulator that shows the same governance information: users and roles, approval workflows, the vendor master and payments. All amounts are in EUR. All finance data is synthetic.",
    "atWork": "At work, a junior analyst checks the finance system behind a supplier decision: who can set up a vendor and pay it alone, whether bank-detail changes were verified, and whether payments kept to their approvers' limits.",
    "owner": ["Compliance Manager", "SOC-DEC records the Group's onboarding decision on a supplier. Once a supplier is decided, Procurement sets it up in the finance system and Accounts payable pay it, so the decision only holds if nobody can set up a supplier and pay it alone. Before SOC-DEC is filed, check LearnTech's finance system in LedgerSim, as of today: who can both create vendors and approve payments, and what stands behind each of them; vendor bank-detail changes made without the call-back the workflow asks for, and whether anything was paid after them; and payments approved above the approver's limit. Capture what you find, so the file can rely on it without anyone opening the console."],
    "rules": [
        ["BKB-POL-006 Section 7.1, Designing roles", "Document toxic combinations (segregation-of-duties conflicts) and block them in the role design. LedgerSim's SoD matrix is Finance's list of them: two roles marked No may not be held by one account."],
        ["BKB-POL-006 Section 8, exceptions", "Exceptions require a documented risk assessment, compensating controls, a named owner, an expiry date (maximum 12 months) and approval per the delegated authority in the GRC Charter Section 6.1. An SoD exception allows the one conflict, for the one account it names, until it expires; it allows nothing else."],
        ["BKB-POL-006 Section 3.1", "Shared and generic accounts are prohibited, except break-glass accounts that are registered, sealed and monitored."],
        ["Ref-Actions U3 and U5 (Access Reviews › Track Remediation)", "U3, shared/generic account not registered: register as break-glass or disable. U5, segregation-of-duties conflict: remove one of the two roles. Both: the system owner, within 5 working days."],
        ["BKB-POL-014 Section 3.1", "All staff must report suspected incidents immediately via the service desk or security hotline. A payment made to bank details changed without the call-back may have gone to someone posing as the supplier: that is a suspected incident."],
    ],
    "views": [
        {"key": "users", "title": "Users & roles", "sub": "Finance-system accounts and their roles. A person's account carries their name; a shared account carries a team's. Approval limit is the largest payment the account may approve.",
         "cols": ["User ID", "Name", "Role(s)", "Status", "Last login", "Approval limit (EUR)"], "filters": ["Role(s)", "Status"], "rows": U},
        {"key": "roles", "title": "Roles", "sub": "What each role can do.", "cols": ["Role", "Permissions"], "filters": [], "rows": ROLES},
        {"key": "sod", "title": "SoD matrix", "sub": "Segregation-of-duties matrix used by Finance: may one account hold both roles?", "cols": ["Role A", "Role B", "Allowed together?"], "filters": [], "rows": SOD},
        {"key": "exc", "title": "SoD exceptions", "sub": "Each lets one account hold Vendor maintainer and AP approver together, with a compensating control, until it expires.",
         "cols": ["Exception", "User ID", "Compensating control", "Approved on", "Expires"], "filters": [], "rows": EXC},
        {"key": "wf", "title": "Approval workflows", "sub": "The approval rules Finance has set in the system.", "cols": ["Document", "Rule"], "filters": [], "rows": WF},
        {"key": "vm", "title": "Vendor master", "sub": "Vendor master change log, last 90 days. Call-back verified: whether someone called the vendor back on a number already on file before the change was approved.",
         "cols": ["Change", "Vendor", "Field changed", "Date", "Changed by", "Call-back verified", "Verified by", "Approved by"], "filters": ["Field changed", "Call-back verified"], "rows": VC},
        {"key": "pay", "title": "Payments", "sub": "Supplier payments, last 60 days, in EUR. Approver limit is the approving account's limit.",
         "cols": ["Payment", "Vendor", "Amount (EUR)", "Approved by", "Approver limit (EUR)", "Date"], "filters": ["Vendor", "Approved by"], "rows": PAYS},
    ],
    "guide": {"view": "users", "col": "Role(s)", "value": GL},
    "parts": [
        {"id": "sod", "kind": "capture", "title": "Who can set up a vendor and pay it",
         "ask": "Find every active account that can both create or change vendors and approve payments, and capture exactly those.",
         "where": "Users & roles. Roles says what each role does, and the SoD matrix which pairs Finance does not allow. Use two filters together. Press Capture evidence, then choose the capture here."},
        {"id": "act", "kind": "rows", "title": "What is done about each one?",
         "ask": "For each account you captured, choose what is done about it.",
         "where": "SoD exceptions lists the exceptions on record and when each expires; the console's date is in the dark bar above the table. Users & roles gives each account's name. BKB-POL-006 Sections 3.1 and 8 and Ref-Actions are in The rules you apply.",
         "options": [COVER, U5, U3], "from": [{"part": "sod"}]},
        {"id": "bank", "kind": "capture", "title": "Bank-detail changes without a call-back",
         "ask": "Find every bank-detail change made without the call-back the workflow asks for, and capture exactly those.",
         "where": "Vendor master. Approval workflows says what a bank-detail change needs. Use two filters together."},
        {"id": "paid", "kind": "rows", "title": "Was anything paid after the change?",
         "ask": "For each change you captured, decide what is done now.",
         "where": "Vendor master gives each change's vendor and date. Payments lists each payment's vendor and date. BKB-POL-014 Section 3.1 is in The rules you apply.",
         "options": [PAID, HOLD], "from": [{"part": "bank"}]},
        {"id": "limit", "kind": "capture", "title": "Payments above the approver's limit",
         "ask": "Find every payment approved above its approver's limit, and capture exactly those.",
         "where": "Payments gives each payment's amount and its approver's limit. Approval workflows says what a supplier payment needs."},
    ],
}

ACT = {
    "U-2103": (COVER, "EX-21 allows this conflict until 2027-03-31, with the Finance Controller's weekly signed review of every vendor master change as its compensating control. It stays, and the review is what to test next."),
    "U-2107": (U5, "EX-17 expired on 2026-09-30, before the console's date of 2026-12-04. An expired exception allows nothing, so the conflict stands: one of the two roles goes (U5)."),
    "U-2108": (U5, "No exception on record names U-2108, so nothing allows the conflict: one of the two roles goes (U5)."),
    "U-FIN01": (U3, "ap.shared carries a team's name, not a person's: a generic account, which BKB-POL-006 Section 3.1 prohibits unless it is a registered break-glass account. EX-24 allows its role conflict, not the account itself, and nobody can be held to its approvals: register it as break-glass or disable it (U3)."),
}
PAID_WHY = {
    "VC-30446": (HOLD, "V39074's bank account was changed on 2026-11-03. Its only payment, PAY-71821, was on 2026-10-14, before the change, so nothing has gone to the new account yet: block its payments until an independent call-back is verified."),
    "VC-30453": (PAID, "V25780's bank account was changed on 2026-11-12, and PAY-71863 paid it EUR 4,850 on 2026-11-16, four days later, approved by Pieter de Vries, who made the change. That money may have gone to someone posing as the supplier: report it now."),
    "VC-30468": (HOLD, "V83561's bank account was changed on 2026-11-30. Its last payment, PAY-71874, was on 2026-11-20, before the change, so nothing has gone to the new account yet: block its payments until an independent call-back is verified."),
}

key = {
    "parts": {
        "sod": {"view": "users", "ids": SOD_ROWS,
                "why": "Four active accounts hold Vendor maintainer with AP approver, a pair the SoD matrix marks No: each can create or change a vendor and approve its payment. U-2110 holds both too, but is disabled."},
        "act": {"rows": {u: {"best": b, "why": w} for u, (b, w) in ACT.items()}},
        "bank": {"view": "vm", "ids": BANK,
                 "why": "Three bank-detail changes have no call-back verified, against the workflow's independent call-back and second approver. Two of them were also approved by the person who made them."},
        "paid": {"rows": {c: {"best": b, "why": w} for c, (b, w) in PAID_WHY.items()}},
        "limit": {"view": "pay", "ids": OVER,
                  "why": "Two payments were approved above the approver's limit, both by Deniz Sahin, whose limit is 5,000: EUR 7,400 on 2026-10-21 and EUR 12,900 on 2026-11-26. The workflow asks for an approver whose limit is at least the amount. Sanne Bakker's 25,000 is at her limit, which the rule allows."},
    },
    "findings": [
        "Segregation of duties (BKB-POL-006 Section 7.1, Finance's SoD matrix): four active LedgerSim accounts hold Vendor maintainer with AP approver, so each can set up or change a vendor and approve its payment. U-2103 is covered by EX-21 until 2027-03-31, with the Finance Controller's weekly review of vendor changes. U-2107's exception, EX-17, expired on 2026-09-30, and U-2108 has none: the system owner to remove one of the two roles from each within 5 working days (U5). U-FIN01, ap.shared, is a generic account, which Section 3.1 prohibits; EX-24 allows its conflict, not the account: the system owner to register it as break-glass or disable it (U3). Evidence {sod}.",
        "Bank-detail changes (Approval workflows: an independent call-back and a second approver): VC-30446, VC-30453 and VC-30468 have no call-back verified, and the first two were approved by the person who made them. V25780 was paid EUR 4,850 on 2026-11-16 (PAY-71863), four days after its change, approved by the same user, U-2108: to be reported now to the service desk as a suspected incident (BKB-POL-014 Section 3.1). V39074 and V83561 have had nothing paid since: Accounts payable to block both until a call-back is verified. Evidence {bank}.",
        "Approval limits: U-2107, Deniz Sahin, limit EUR 5,000, approved PAY-71826 (EUR 7,400) and PAY-71885 (EUR 12,900), against the workflow's rule that the approver's limit covers the amount. The Finance Controller to review both payments, and the system owner to find why the limit did not stop them. Evidence {limit}.",
        "For this decision: until these are fixed, one person in LedgerSim can set up a supplier, change where it is paid and pay it, whatever SOC-DEC records. The Compliance Manager follows the U3 and U5 actions to closure.",
    ],
}

# The data agrees with its key.
p = key["parts"]
assert SOD_ROWS == sorted(ACT) and set(p["paid"]["rows"]) == set(BANK), (SOD_ROWS, BANK)
assert all(frozenset(BOTH.split("; ")) in NOT_ALLOWED for _ in [0])
exc = {e[1]: e for e in EXC}
for u in SOD_ROWS:  # the rows part, worked from the rows
    row = next(x for x in U if x[0] == u)
    e = exc.get(u)
    want = U3 if row[1].count(".") or not row[1][0].isupper() else (COVER if e and e[4] >= AS_OF else U5)
    assert ACT[u][0] == want, (u, want)
    if e:
        a, x = e[3], e[4]
        assert int(x[:4]) * 12 + int(x[5:7]) - (int(a[:4]) * 12 + int(a[5:7])) <= 12, e  # Section 8's 12 months
chg = {c[0]: c for c in VC}
for c in BANK:
    v, d, new = chg[c][1], chg[c][3], None
    after = [x for x in PAYS if x[1] == v and x[5] > d]
    assert PAID_WHY[c][0] == (PAID if after else HOLD), c
assert OVER == ["PAY-71826", "PAY-71885"] and len({next(x for x in PAYS if x[0] == o)[3] for o in OVER}) == 1
assert sum(1 for x in PAYS if x[3] == "Deniz Sahin") == len(OVER), "the limit capture is exact with the approver filter"
for part in public["parts"]:
    if part["kind"] == "rows":
        assert all(x["best"] in part["options"] for x in p[part["id"]]["rows"].values())
assert len({u[0] for u in U}) == len(U) and len({c[0] for c in VC}) == len(VC) and len({x[0] for x in PAYS}) == len(PAYS)
assert "Lumen" not in json.dumps(public)

(ROOT / f"public/desk/labs/{LAB}.json").write_text(json.dumps(public, ensure_ascii=False, separators=(",", ":")), encoding="utf8")
seed = ROOT.parent / "backend/_seed/grc101_lab_keys.json"
all_keys = json.loads(seed.read_text(encoding="utf8"))
all_keys[LAB] = key
seed.write_text(json.dumps(all_keys, ensure_ascii=False, indent=1), encoding="utf8")
blob = json.dumps([public, key], ensure_ascii=False)
assert "§" not in blob
pub = json.dumps(public, ensure_ascii=False)
for w in ('"best"', '"why"', '"findings"', "expired on", "posing as the supplier: report"):
    assert w not in pub, w
print(LAB, len(U), "users", len(VC), "changes", len(PAYS), "payments")
