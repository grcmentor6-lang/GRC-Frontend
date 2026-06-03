/**
 * Verifiable certificate (authed) + public verification. Mirrors FastAPI CertificateOut / CertVerifyOut.
 * GRC 101 data comes live from the backend; 301/501 are locked reference tabs until those tracks launch.
 */
import { api } from "./api";

export interface CertSignatory { name: string; title: string }

export interface Certificate {
  programId: string;
  code: string;
  eyebrow: string;
  programTitle: string;
  blurb: string;
  status: "issued" | "preview";
  statusNote: string;
  recipient: string;
  recipientInitials: string;
  tasksDone: number;
  tasksTotal: number;
  verbsPracticed: number;
  verbsTotal: number;
  avgScore: number;
  completionPct: number;
  completedTaskCodes: string[];
  standards: string[];
  credentialId?: string | null;
  verifyUrl?: string | null;
  issueDate?: string | null;
  issueYear?: string | null;
  issueMonth?: string | null;
  mentor: CertSignatory;
  issuer: CertSignatory;
}

export interface CertVerifyStat { label: string; value: string }
export interface CertVerify {
  valid: boolean;
  credentialId: string;
  recipient: string;
  programTitle: string;
  code: string;
  issueDate: string;
  issuedAt: string;
  stats: CertVerifyStat[];
  standards: string[];
}

/** Locked future tracks — reference copy only (not yet graded). */
export interface CertLockedRef {
  id: string;
  code: string;
  eyebrow: string;
  programTitle: string;
  blurb: string;
  standards: string[];
  statusNote: string;
}

export const CERT_LOCKED: CertLockedRef[] = [
  {
    id: "grc301",
    code: "GRC 301",
    eyebrow: "Advanced Programme",
    programTitle: "GRC 301 — Advanced Risk Management & Assurance",
    blurb: "having satisfied all assessment criteria across advanced mentor-graded engagements, demonstrating the ability to own enterprise risk programmes, third-party assurance and control testing.",
    standards: ["ISO 31000:2018", "NIST RMF", "SOC 2 Type II", "HIPAA", "COBIT 2019"],
    statusNote: "Locked · unlocks after GRC 101",
  },
  {
    id: "grc501",
    code: "GRC 501",
    eyebrow: "Leadership Programme",
    programTitle: "GRC 501 — Enterprise GRC Strategy & Leadership",
    blurb: "having satisfied all assessment criteria across executive-level engagements, demonstrating the ability to set GRC strategy, design the operating model and report risk to the board.",
    standards: ["COSO ERM", "ISO 37301", "ISO 27701", "NIST RMF", "ESG (GRI)"],
    statusNote: "Locked · unlocks after GRC 301",
  },
];

export const certificateApi = {
  mine: (program = "grc101") => api.get<Certificate>("/me/certificate", { query: { program } }),
  verify: (credentialId: string) => api.get<CertVerify>(`/verify/${credentialId}`, { noAuth: true }),
};
