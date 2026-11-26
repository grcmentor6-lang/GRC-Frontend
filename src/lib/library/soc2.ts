// SOC 2 — the 2017 AICPA Trust Services Criteria, 61 criteria. The AICPA text is copyright and the
// criteria have no short published titles, so every title here is OUR label (publishedTitles:
// false keeps them off the plaque) and every summary is ours.

import { item, type LibStandard } from "./types";

const COMMON = "Common Criteria · security";
const EXTRA = "Additional criteria";

export const SOC2: LibStandard = {
  id: "soc2",
  source: "2017 Trust Services Criteria © AICPA",
  publishedTitles: false,
  groups: [
    {
      name: "CC1 Control Environment", part: COMMON, unit: "criteria", items: [
        item("CC1.1", "Integrity and ethical values", "Show commitment to integrity and ethics, from the top down."),
        item("CC1.2", "Board oversight", "The board is independent of management and oversees internal control."),
        item("CC1.3", "Structure and authority", "Management sets up structures, reporting lines and authorities."),
        item("CC1.4", "Competence", "Attract, develop and keep competent people."),
        item("CC1.5", "Accountability", "Hold people accountable for their part in internal control."),
      ],
    },
    {
      name: "CC2 Communication and Information", part: COMMON, unit: "criteria", items: [
        item("CC2.1", "Quality information", "Obtain or produce relevant, good-quality information to run internal control."),
        item("CC2.2", "Internal communication", "Tell people inside the organisation about control objectives and their responsibilities."),
        item("CC2.3", "External communication", "Communicate with outside parties about what affects internal control."),
      ],
    },
    {
      name: "CC3 Risk Assessment", part: COMMON, unit: "criteria", items: [
        item("CC3.1", "Clear objectives", "Set objectives clearly enough that the risks to them can be found."),
        item("CC3.2", "Identifying and analysing risk", "Identify and analyse the risks to meeting objectives."),
        item("CC3.3", "Fraud risk", "Consider the potential for fraud when assessing risk."),
        item("CC3.4", "Significant change", "Spot and assess changes that could seriously affect internal control."),
      ],
    },
    {
      name: "CC4 Monitoring Activities", part: COMMON, unit: "criteria", items: [
        item("CC4.1", "Evaluating controls", "Check, through ongoing or separate evaluations, that controls exist and work."),
        item("CC4.2", "Reporting deficiencies", "Report control weaknesses promptly to the people who must fix them."),
      ],
    },
    {
      name: "CC5 Control Activities", part: COMMON, unit: "criteria", items: [
        item("CC5.1", "Choosing controls", "Choose and build controls that bring risk down to acceptable levels."),
        item("CC5.2", "Technology controls", "Choose and build general controls over technology."),
        item("CC5.3", "Policies and procedures", "Put controls in place through policies and the procedures that carry them out."),
      ],
    },
    {
      name: "CC6 Logical and Physical Access Controls", part: COMMON, unit: "criteria", items: [
        item("CC6.1", "Logical access security", "Control logical access to information assets: identify and authenticate users, and restrict what they can reach."),
        item("CC6.2", "Registering users", "Register and authorise users before giving them credentials."),
        item("CC6.3", "Role-based access", "Grant, change and remove access by role, least privilege and separation of duties."),
        item("CC6.4", "Physical access", "Let only authorised people into the buildings, rooms and other places where protected assets are kept."),
        item("CC6.5", "Asset disposal", "Remove data from assets before their protections are withdrawn."),
        item("CC6.6", "Boundary protection", "Defend against threats from outside the system's boundary."),
        item("CC6.7", "Data movement", "Restrict how information moves, and protect it on the way."),
        item("CC6.8", "Malicious software", "Prevent or detect unauthorised and malicious software."),
      ],
    },
    {
      name: "CC7 System Operations", part: COMMON, unit: "criteria", items: [
        item("CC7.1", "Detecting weaknesses", "Use detection and monitoring to catch configuration changes and new vulnerabilities."),
        item("CC7.2", "Monitoring for anomalies", "Watch system components for signs of attack, error or disaster."),
        item("CC7.3", "Evaluating events", "Assess security events and decide whether they are incidents."),
        item("CC7.4", "Responding to incidents", "Respond to incidents through a defined programme."),
        item("CC7.5", "Recovering from incidents", "Plan and carry out recovery from incidents."),
      ],
    },
    {
      name: "CC8 Change Management", part: COMMON, unit: "criteria", items: [
        item("CC8.1", "Controlled change", "Let no change into systems or software, bought or built in-house, until it has been approved, built and tested."),
      ],
    },
    {
      name: "CC9 Risk Mitigation", part: COMMON, unit: "criteria", items: [
        item("CC9.1", "Business disruption", "Plan how to reduce the risk of business disruption."),
        item("CC9.2", "Vendors and partners", "Check the suppliers and partners you depend on, and keep the risks they bring under control."),
      ],
    },
    {
      name: "A1 Availability", part: EXTRA, unit: "criteria", items: [
        item("A1.1", "Capacity", "Maintain and monitor capacity so demand and commitments can be met."),
        item("A1.2", "Backup and environmental protection", "Put environmental protections, backups and recovery infrastructure in place."),
        item("A1.3", "Recovery testing", "Test the recovery plan."),
      ],
    },
    {
      name: "C1 Confidentiality", part: EXTRA, unit: "criteria", items: [
        item("C1.1", "Identifying confidential information", "Identify confidential information and look after it."),
        item("C1.2", "Disposing of confidential information", "Dispose of confidential information when it is due."),
      ],
    },
    {
      name: "PI1 Processing Integrity", part: EXTRA, unit: "criteria", items: [
        item("PI1.1", "Processing specifications", "Define and share what is needed to process data correctly."),
        item("PI1.2", "Inputs", "Make sure system inputs are complete and accurate."),
        item("PI1.3", "Processing", "Process data completely, accurately and on time."),
        item("PI1.4", "Outputs", "Deliver complete, accurate output only to the people meant to get it."),
        item("PI1.5", "Stored data", "Store inputs, work in progress and outputs completely and accurately."),
      ],
    },
    {
      name: "P1–P8 Privacy", part: EXTRA, unit: "criteria", items: [
        item("P1.1", "Notice", "Tell people about the organisation's privacy practices."),
        item("P2.1", "Choice and consent", "Explain people's choices and get consent to collect, use and share their data."),
        item("P3.1", "Collection limited to purpose", "Collect only the personal information the stated purpose needs."),
        item("P3.2", "Explicit consent", "Get explicit consent where it is required."),
        item("P4.1", "Use limited to purpose", "Use personal information only for the purposes stated."),
        item("P4.2", "Retention", "Keep personal information only as long as it is needed."),
        item("P4.3", "Disposal", "Dispose of personal information securely."),
        item("P5.1", "Access", "Let people see the personal information held about them."),
        item("P5.2", "Correction", "Correct or annotate personal information when asked."),
        item("P6.1", "Disclosure to third parties", "Share with third parties only with consent or for a stated purpose."),
        item("P6.2", "Record of authorised disclosures", "Keep an accurate record of authorised disclosures."),
        item("P6.3", "Record of unauthorised disclosures", "Record unauthorised disclosures, breaches included."),
        item("P6.4", "Third-party commitments", "Get privacy commitments from vendors who handle personal information."),
        item("P6.5", "Third-party breach reporting", "Require third parties to report unauthorised disclosures to you."),
        item("P6.6", "Breach notification", "Notify affected people, regulators and others of breaches."),
        item("P6.7", "Accounting of disclosures", "Tell people, when they ask, what has been disclosed about them."),
        item("P7.1", "Quality", "Keep personal information accurate, complete and relevant."),
        item("P8.1", "Complaints and monitoring", "Handle privacy questions, complaints and disputes, and monitor compliance."),
      ],
    },
  ],
};
