/**
 * Canonical list of required OJT documents.
 *
 * Each entry carries an `id` (kebab-case), a full `title`, a compact
 * `shortTitle` for table headers, a `phase` tag, and optional `aliases`
 * that map previously-stored `document_type` strings to this entry.
 *
 * The `normalize()` helper strips a string to lowercase alpha-numeric so
 * the matching logic mirrors what DocumentsSection already does.
 */

export type DocumentPhase = "before" | "during" | "after" | "other";

export interface RequiredDocument {
  id: string;
  title: string;
  shortTitle: string;
  phase: DocumentPhase;
  aliases?: string[];
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  Canonical required-document catalog — 18 items                    */
/* ═══════════════════════════════════════════════════════════════════ */

export const REQUIRED_DOCUMENTS: RequiredDocument[] = [
  /* ── BEFORE OJT (8) ──────────────────────────────────────────── */
  {
    id: "resume",
    title: "Resume",
    shortTitle: "Resume",
    phase: "before",
  },
  {
    id: "internship-agreement",
    title: "Internship Agreement",
    shortTitle: "Intern Agree.",
    phase: "before",
  },
  {
    id: "endorsement-letter",
    title: "Letter of Endorsement",
    shortTitle: "Endorsement",
    phase: "before",
    aliases: ["Endorsement Letter"],
  },
  {
    id: "letter-of-intent",
    title: "Letter of Intent",
    shortTitle: "Letter of Intent",
    phase: "before",
  },
  {
    id: "moa",
    title: "Memorandum of Agreement (MOA)",
    shortTitle: "MOA",
    phase: "before",
    aliases: ["Memorandum of Agreement", "MOA ver OCT 2024", "Memorandum of Agreement (MOA) ver. OCT 2024"],
  },
  {
    id: "overtime-agreement",
    title: "Overtime Agreement",
    shortTitle: "OT Agreement",
    phase: "before",
  },
  {
    id: "pup-consent-form",
    title: "PUP Consent Form",
    shortTitle: "PUP Consent",
    phase: "before",
  },
  {
    id: "student-waiver",
    title: "Student Waiver",
    shortTitle: "Waiver",
    phase: "before",
    aliases: ["waiver", "Parental Consent / Waiver", "Parental Consent Waiver"],
  },

  /* ── DURING OJT (3) ──────────────────────────────────────────── */
  {
    id: "daily-attendance-report",
    title: "Daily Attendance Report",
    shortTitle: "DAR",
    phase: "during",
    aliases: ["Daily Time Record", "daily-time-record", "dtr", "DTR"],
  },
  {
    id: "weekly-photo-documentation",
    title: "Weekly Photo Documentation Report",
    shortTitle: "Photo Doc.",
    phase: "during",
    aliases: ["Photo Documentation", "photo-documentation"],
  },
  {
    id: "weekly-report",
    title: "Weekly Report",
    shortTitle: "Weekly Rpt.",
    phase: "during",
  },

  /* ── AFTER OJT (5) ───────────────────────────────────────────── */
  {
    id: "evaluation-hte",
    title: "Evaluation Instrument for HTE",
    shortTitle: "Eval. HTE",
    phase: "after",
  },
  {
    id: "evaluation-student-intern",
    title: "Evaluation Instrument for Student Intern",
    shortTitle: "Eval. Student",
    phase: "after",
  },
  {
    id: "evaluation-training-supervisor",
    title: "Evaluation Instrument for Training Supervisor",
    shortTitle: "Eval. Supervisor",
    phase: "after",
  },
  {
    id: "ojt-adviser-evaluation",
    title: "OJT Adviser Performance Evaluation",
    shortTitle: "Adviser Eval.",
    phase: "after",
    aliases: ["Performance Evaluation", "evaluation-form"],
  },
  {
    id: "trainee-performance-evaluation",
    title: "Trainee Performance Evaluation",
    shortTitle: "Trainee Eval.",
    phase: "after",
  },

  /* ── OTHER (existing docs not in the above lists) ─────────────── */
  {
    id: "completion-cert",
    title: "Certificate of Completion",
    shortTitle: "Cert. Compl.",
    phase: "other",
  },
  {
    id: "narrative-report",
    title: "Narrative Report",
    shortTitle: "Narrative",
    phase: "other",
  },
];

/* ═══════════════════════════════════════════════════════════════════ */
/*  Helpers                                                           */
/* ═══════════════════════════════════════════════════════════════════ */

export const PHASE_ORDER: DocumentPhase[] = ["before", "during", "after", "other"];

export const PHASE_LABELS: Record<DocumentPhase, string> = {
  before: "Before OJT",
  during: "During OJT",
  after: "After OJT",
  other: "Other",
};

export const PHASE_COLORS: Record<DocumentPhase, { bg: string; color: string; border: string }> = {
  before: { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  during: { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
  after: { bg: "#fefce8", color: "#a16207", border: "#fef08a" },
  other: { bg: "#f1f5f9", color: "#475569", border: "#e2e8f0" },
};

/** Strip to lowercase alpha-numeric (matches DocumentsSection logic). */
export function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Get documents belonging to a specific phase. */
export function getDocumentsByPhase(phase: DocumentPhase): RequiredDocument[] {
  return REQUIRED_DOCUMENTS.filter((d) => d.phase === phase);
}
