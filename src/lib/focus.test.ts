// Run: npx tsx src/lib/focus.test.ts
import assert from "node:assert/strict";
import { FOCUS_IDS, isFocus, isLater } from "./focus";
import { LIBRARY } from "./library";

// SOC 2 left GRC 101 with the LI101 rebuild (docs/li101): greyed like the other 301/501 standards. A line naming ISO
// 27001 beside it is still in focus.
const focus = ["iso27001", "ISO27001", "ISO/IEC 27001:2022", "ISO/IEC 27001:2022 + Amd 1:2024", "ISO/IEC 27002", "ISO/IEC 27002:2022",
  "ISO 27001", "ISO/IEC 27001 documented information", "ISO/IEC 27001 A.5.15 / SOC 2 CC6.3",
  // The ISO 27001 family: what defines, supports, audits and certifies an ISO 27001 ISMS (T3.1 steps 9-14, T5.1 step 11, T12.2 steps 9 and 11).
  "ISO/IEC 27000", "ISO/IEC 27003", "ISO/IEC 27004", "ISO/IEC 27005:2022", "ISO/IEC 27006", "ISO/IEC 27006-1", "ISO/IEC 27007", "ISO/IEC 27008",
  "ISO 19011", "ISO/IEC 17021-1", "Edition: ISO/IEC 27001:2013"];
const later = ["soc2", "SOC2", "SOC 2", "SOC 2 Type II", "AICPA SOC 2 (TSC 2017)", "nistcsf", "cisv8", "gdpr", "NIST_CSF", "CIS_V8", "GDPR", "NIST CSF 2.0", "CIS Controls v8", "NIST CSF 2.0 / CIS Controls v8", "GDPR (EU) 2016/679",
  "GDPR / DPA 2012 / KVKK", "KVKK (Turkey)", "Data Privacy Act 2012 (Philippines)", "PCI DSS v4.0.1", "HIPAA (Business Associate)", "COPPA Rule (16 CFR 312)",
  "FERPA (34 CFR 99)", "ISO/IEC 29151", "ISO/IEC 27701", "ISO 9001", "COPC CX Standard", "ISO/IEC 27009", "ISO/IEC 27017", "ISO/IEC 27018",
  "ISO 18295", "ISO 22301", "DORA", "NIS2", "SDPC National Data Privacy Agreement", "iNACOL / NSQOL standards", "NIST Privacy Framework 1.0"];
for (const s of focus) { assert.ok(isFocus(s), `${s} should be in focus`); assert.ok(!isLater(s), `${s} should not be greyed`); }
for (const s of later) { assert.ok(!isFocus(s), `${s} should not be in focus`); assert.ok(isLater(s), `${s} should be greyed`); }
// Text that names no standard is neither: it is never greyed.
for (const s of ["PDCA: Plan", "SITL-POL-006", "Both orgs", "Group", ""]) { assert.ok(!isFocus(s) && !isLater(s), `${s} names no standard`); }

// Every library standard is one or the other, and the focus ids are real library ids.
for (const s of LIBRARY) assert.notEqual(isFocus(s.id), isLater(s.id), s.id);
assert.deepEqual(LIBRARY.filter((s) => isFocus(s.id)).map((s) => s.id).sort(), [...FOCUS_IDS].sort());
console.log("focus: ok");
