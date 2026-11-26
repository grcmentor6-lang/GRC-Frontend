#!/usr/bin/env python3
"""Writes Tech Lab TL-36-SOC-08-DLP02-C (DataSentry, "Data leakage coverage"): console data (public/desk/labs/<id>.json) and
key (backend/_seed/grc101_lab_keys.json, merged, so take the shared lock).

LI101 rebuild (26 Nov 2026): a required part of T10.1 (control sprint 12, A.8.11 and A.8.12), opened after step 5. It shows
Manila as SPR-12 describes it: Manila's own e-mail rules block Client-Restricted labels and card numbers to outside
addresses, USB storage is blocked on every workstation, uploads to websites and exports from the CRM are not monitored, nobody
looks at the blocks; the CRM test tenant is refreshed with masked copies, but in September 2026 a production extract of client
transaction data was copied to the test system unmasked and no register lists copies. Systems and labels follow T10.1's
TSA-16 Asset_System_Map (Client-Restricted: call recording servers, client transaction data; Client-Confidential: FS-MNL-01).
Repositories and scans are written here and are synthetic. The old RoPA / data-flow-map questions are gone: no RoPA is built
in T10.1. Questions are factual: step 10's decision is not answered here. Run from web/."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LAB = "TL-36-SOC-08-DLP02-C"
AS_OF = "2026-11-30"

RES, CONF, INT, NOLAB = "Client-Restricted", "Client-Confidential", "Internal", "(no label)"
TXN, REC, FS, CRM, DIR = "Client transaction data", "Call recording servers", "File server FS-MNL-01", "CRM platform", "Enterprise directory & email"
PROD, TEST, BAK = "Production", "Test", "Backup"
register = [[TXN, RES, "Tier 4 — Restricted"], [REC, RES, "Tier 4 — Restricted"], [FS, CONF, "Tier 3 — Confidential"], [CRM, CONF, "Tier 3 — Confidential"], [DIR, CONF, "Tier 3 — Confidential"]]
label_of = {s: l for s, l, _ in register}
# Repository, System, Environment, Personal data, Types found, Label applied, Last scan
D = [
    ["txn-store-prod", TXN, PROD, "Yes", "Name; Account number; Transaction amounts", RES, "2026-11-28"],
    ["txn-store-backup", TXN, BAK, "Yes", "Name; Account number; Transaction amounts", RES, "2026-11-28"],
    ["rec-store-prod", REC, PROD, "Yes", "Voice recordings; Name; Account number", RES, "2026-11-27"],
    ["fs-clientdocs-prod", FS, PROD, "Yes", "Name; Address; Account number", CONF, "2026-11-29"],
    ["crm-prod", CRM, PROD, "Yes", "Name; Phone; E-mail; Interaction history", CONF, "2026-11-29"],
    ["dir-mail-prod", DIR, PROD, "Yes", "Employee name; Work e-mail", CONF, "2026-11-26"],
    # The copies outside production (planted: an unlabelled one, one labelled too low, one labelled right) and a masked one
    ["txn-extract-test", TXN, TEST, "Yes", "Name; Account number; Transaction amounts", NOLAB, "2026-11-26"],
    ["rec-clips-test", REC, TEST, "Yes", "Voice recordings; Name", CONF, "2026-11-26"],
    ["qa-exports-test", FS, TEST, "Yes", "Name; Phone; Account number", CONF, "2026-11-27"],
    ["crm-test-tenant", CRM, TEST, "No", "", CONF, "2026-11-28"],
    ["fs-courseware-test", FS, TEST, "No", "", INT, "2026-11-25"],
]
FOUND = sorted(r[0] for r in D if r[3] == "Yes" and r[2] == TEST)
OK_L, NO_L, LOW_L = "Labelled as its system is", "No label applied", "Lower than its system's label"
# Channel, Policy, Mode, Applies to label, Blocks reviewed
CH = [
    ["E-mail to outside addresses", "DLP-01", "Block", RES, "Nobody"],
    ["E-mail carrying a card number", "DLP-02", "Block", "Any", "Nobody"],
    ["USB storage on workstations", "DLP-03", "Block", "Any", "Nobody"],
    ["Uploads to websites", "None", "No policy", "—", "—"],
    ["Exports from the CRM", "None", "No policy", "—", "—"],
]
NOPOL = sorted(r[0] for r in CH if r[2] == "No policy")
public = {
    "id": LAB, "sim": "DataSentry", "title": "Data leakage coverage",
    "org": "GlobalConnect Customer Solutions", "product": "Data discovery and DLP", "capability": "Data discovery, labelling and leakage prevention",
    "tenant": "globalconnect.example / Data Map", "asOf": AS_OF, "related": "T10.1",
    "feed": "T10.1's evidence for A.8.11 and A.8.12",
    "context": "At GlobalConnect Manila data discovery and leakage prevention are Manila's own: the discovery scan finds where personal data sits and which label it carries, and Manila's own rules watch some channels. DataSentry is a brand-neutral simulator that shows the same governance information. All repository data is synthetic.",
    "atWork": "At work, a junior analyst checks the discovery scan and the leakage rules before a data-protection control is rated: where the scan finds client data outside production, whether it is labelled, and which channels no rule watches.",
    "owner": ["Head of Security & Privacy", "Your sprint rates A.8.11 and A.8.12 from what the Manila office says about masking and leakage prevention. Before the evidence is built, check Manila's data map on 30 November 2026: where has the latest scan found personal data outside production, is each copy labelled as its system's data should be, and which channels leave the office with no rule watching them? Capture what you find, so I can rely on it without opening the console."],
    "rules": [
        ["SITL-STD-001 Sections 2 and 8", "The asset owner is accountable for classification. Copies, extracts, screenshots and reports inherit the classification of the source. A repository therefore carries the label the Classification register gives its system."],
        ["SITL-STD-001 Section 6, Labelling", "Tier 3 Client-Confidential: visible label (header, footer and metadata); label mandatory. Tier 4 Client-Restricted: visible label on every page or screen; watermark with user ID; DLP block rules."],
        ["Group data-masking procedure (issued under SITL-POL-017)", "Says which fields are masked and how. Manila refreshes its CRM test tenant with masked copies; a production extract copied to test without masking skips it."],
        ["What that means for a channel", "A channel is watched when a DLP policy covers it. A policy in Block mode stops the transfer and logs it; a channel with no policy is not watched at all."],
    ],
    "views": [
        {"key": "disc", "title": "Discovery scans", "sub": "The latest scan of each repository Manila has connected. Environment says whether it is production, backup or test. Personal data is Yes where the scan found any; Types found says what.",
         "cols": ["Repository", "System", "Environment", "Personal data", "Label applied", "Types found", "Last scan"], "filters": ["System", "Environment", "Personal data", "Label applied"],
         "rows": [[r[0], r[1], r[2], r[3], r[5], r[4], r[6]] for r in D]},
        {"key": "reg", "title": "Classification register", "sub": "Manila's classification register extract: the label each system's owner gave it. Tier 3 is Client-Confidential; Tier 4 is Client-Restricted.", "cols": ["System", "Label", "Group tier"], "filters": [], "rows": register},
        {"key": "chan", "title": "Channels", "sub": "The channels data can leave by, and the DLP policy that covers each. Block stops the transfer and logs it.", "cols": ["Channel", "Policy", "Mode", "Applies to label", "Blocks reviewed by"], "filters": ["Mode"], "rows": CH},
    ],
    "guide": {"view": "disc", "col": "Environment", "value": BAK},
    "parts": [
        {"id": "found", "kind": "capture", "title": "Personal data in test",
         "ask": "Find every repository in the test environment where the scan found personal data, and capture exactly those.",
         "where": "Discovery scans. Use two filters together: one for the environment, one for what the scan found. Press Capture evidence, then choose the capture here."},
        {"id": "label", "kind": "rows", "title": "Is each one labelled as it should be?",
         "ask": "For each repository you captured, compare the label applied with the label its system should carry.",
         "where": "Discovery scans shows each repository's System and Label applied. Classification register gives each system's label. SITL-STD-001 is in The rules you apply.",
         "options": [OK_L, NO_L, LOW_L], "from": [{"part": "found"}]},
        {"id": "chan", "kind": "capture", "title": "Channels no rule watches",
         "ask": "Find every channel that has no DLP policy, and capture exactly those.",
         "where": "Channels. The column to filter is Mode."},
    ],
}
LBL = {"txn-extract-test": (NO_L, "The scan applied no label, and the system's register label is Client-Restricted: a copy inherits it, so the extract carries no label and none of the Tier 4 protections."),
       "rec-clips-test": (LOW_L, "Call recording servers are Client-Restricted, and the clips carry Client-Confidential: one tier too low, so a Tier 4 block rule would not apply to them."),
       "qa-exports-test": (OK_L, "File server FS-MNL-01 is Client-Confidential in the register and the export carries it: labelled as its system is, though it is still personal data outside production.")}
key = {"parts": {
    "found": {"view": "disc", "ids": FOUND,
              "why": "Three test repositories hold personal data. The CRM test tenant shows none: its copies are masked. The other personal data is in production and backup, where it belongs."},
    "label": {"rows": {k: {"best": b, "why": w} for k, (b, w) in LBL.items()}},
    "chan": {"view": "chan", "ids": NOPOL,
             "why": "Uploads to websites and exports from the CRM have no DLP policy: nothing watches them. The three other channels have a Block policy, though nobody reviews what it blocks."}},
    "findings": [
        "A.8.11: the scan finds personal data in three test repositories, among them txn-extract-test, the client transaction extract copied from production in September 2026: it carries no label, and rec-clips-test is labelled one tier below its system. The Group data-masking procedure (SITL-POL-017) is what a copy to test should have gone through. Evidence {found}.",
        "Labels (SITL-STD-001 Section 8): copies inherit their source's label; txn-extract-test has none and rec-clips-test has Client-Confidential for Client-Restricted data. The owner of each system to correct them. Evidence {found}.",
        "A.8.12: uploads to websites and exports from the CRM have no DLP policy; the e-mail, card-number and USB policies block, but nobody reviews the blocks. Evidence {chan}.",
    ]}
p = key["parts"]
assert FOUND == sorted(LBL) and NOPOL == ["Exports from the CRM", "Uploads to websites"]
for k, (b, _) in LBL.items():
    r = next(x for x in D if x[0] == k)
    want = NO_L if r[5] == NOLAB else OK_L if r[5] == label_of[r[1]] else LOW_L
    assert b == want, k
for part in public["parts"]:
    if part["kind"] == "rows":
        assert all(x["best"] in part["options"] for x in p[part["id"]]["rows"].values())
blob = json.dumps(public, ensure_ascii=False, separators=(",", ":"))
assert "§" not in blob and "LearnTech" not in blob and "RoPA" not in blob
for w in ('"best"', '"why"', '"findings"', "copies are masked"):
    assert w not in blob, w
(ROOT / f"public/desk/labs/{LAB}.json").write_text(blob, encoding="utf8")
seed = ROOT.parent / "backend/_seed/grc101_lab_keys.json"
all_keys = json.loads(seed.read_text(encoding="utf8"))
all_keys[LAB] = key
seed.write_text(json.dumps(all_keys, ensure_ascii=False, indent=1), encoding="utf8")
print(LAB, len(D), "repositories")
