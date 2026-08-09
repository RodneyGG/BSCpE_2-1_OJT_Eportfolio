"use client";
import { useState, useEffect, useMemo, Fragment } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "../../../../lib/api";
import AppNavbar from "../../../components/AppNavbar";
import ProtectedRoute from "../../../components/ProtectedRoute";
import DocumentViewerModal from "../../../components/DocumentViewerModal";
import StatusIcon, { STATUS_CFG, type DocStatus } from "../../../components/StatusIcon";
import { normalize } from "../../../data/documentTypes";

/* Weekly-tracked document type ids (must match documentTypes.ts) */
const WEEKLY_TYPES = [
  { id: "weekly-photo-documentation", aliases: ["Photo Documentation", "photo-documentation"], label: "Weekly Photo Documentation" },
  { id: "weekly-report", aliases: [] as string[], label: "Weekly Report" },
];
const WEEKLY_TARGETS = WEEKLY_TYPES.map((w) => new Set([normalize(w.id), ...w.aliases.map(normalize)]));

interface WeeklyActivityDay {
  date: string;
  activities: string;
}

interface StudentDoc {
  id: number;
  document_type: string;
  status: "pending" | "approved" | "rejected";
  week?: number | null;
  file_link?: string | null;
  original_filename?: string | null;
  rejection_reason?: string | null;
  weekly_activities?: WeeklyActivityDay[] | null;
  extraction_status?: string | null;
}
interface WeeklyStudent {
  id: number;
  name: string;
  email: string;
  company: { id: number; name: string } | null;
  documents: StudentDoc[];
}

/* Matches STATUS_CFG on the main checklist page, so "2/2" and "1/2" mean
   the same color everywhere in the app. */
const WEEK_CELL_CFG = {
  complete: { bg: "#dcfce7", color: "#166534" },
  partial: { bg: "#fef9c3", color: "#a16207" },
  none: { bg: "#f1f5f9", color: "#94a3b8" },
};

/** Find the document matching a given week + weekly-type index (0 = photo doc, 1 = report). */
function getWeekDoc(docs: StudentDoc[], week: number, typeIdx: number): StudentDoc | undefined {
  return docs.find((d) => d.week === week && WEEKLY_TARGETS[typeIdx].has(normalize(d.document_type)));
}

/** Count how many of the 2 weekly doc types this student submitted for a given week. */
function weekCount(docs: StudentDoc[], week: number): number {
  let n = 0;
  for (let i = 0; i < WEEKLY_TYPES.length; i++) {
    if (getWeekDoc(docs, week, i)) n++;
  }
  return n;
}

function IconChevron({ open }: { open: boolean }) {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.15s" }}>
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}
function IconPrinter() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9V2h12v7" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" />
    </svg>
  );
}
function IconDownload() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}
function IconFoldToggle({ allOpen }: { allOpen: boolean }) {
  return (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
      {allOpen ? <polyline points="18 15 12 9 6 15" /> : <polyline points="6 9 12 15 18 9" />}
    </svg>
  );
}
function IconEye() {
  return (
    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" /><circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}
function IconX() {
  return (
    <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

export default function WeeklyTrackerPage() {
  const router = useRouter();
  const [students, setStudents] = useState<WeeklyStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [viewingDoc, setViewingDoc] = useState<{ title: string; fileLink: string } | null>(null);
  const [processingDocId, setProcessingDocId] = useState<number | null>(null);
  const [rejectingDocId, setRejectingDocId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    setLoading(true);
    fetchApi("/admin/checklist")
      .then((data: { students: WeeklyStudent[] }) => setStudents(data.students ?? []))
      .catch(() => setError("Could not load weekly data."))
      .finally(() => setLoading(false));
  }, []);

  const weeks = useMemo(() => {
    const set = new Set<number>();
    students.forEach((s) => s.documents.forEach((d) => { if (d.week) set.add(d.week); }));
    return Array.from(set).sort((a, b) => a - b);
  }, [students]);

  const allVisibleOpen = students.length > 0 && students.every((s) => expandedIds.has(s.id));
  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const toggleAllExpand = () => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (allVisibleOpen) {
        students.forEach((s) => next.delete(s.id));
      } else {
        students.forEach((s) => next.add(s.id));
      }
      return next;
    });
  };

  /** Patch a single document's status/reason in local state without a full refetch. */
  const patchDocInState = (docId: number, updates: Partial<StudentDoc>) => {
    setStudents((prev) =>
      prev.map((s) => ({
        ...s,
        documents: s.documents.map((d) => (d.id === docId ? { ...d, ...updates } : d)),
      }))
    );
  };

  const doApprove = async (docId: number) => {
    setProcessingDocId(docId);
    try {
      await fetchApi(`/documents/${docId}/review`, {
        method: "PATCH",
        body: JSON.stringify({ status: "approved" }),
      });
      patchDocInState(docId, { status: "approved", rejection_reason: null });
    } catch {
      alert("Failed to approve document. Please try again.");
    } finally {
      setProcessingDocId(null);
    }
  };
  const openReject = (docId: number) => {
    setRejectingDocId(docId);
    setRejectReason("");
  };
  const submitReject = async () => {
    if (!rejectingDocId) return;
    if (!rejectReason.trim()) {
      alert("Please provide a reason for rejection.");
      return;
    }
    setProcessingDocId(rejectingDocId);
    try {
      await fetchApi(`/documents/${rejectingDocId}/review`, {
        method: "PATCH",
        body: JSON.stringify({ status: "rejected", reason: rejectReason.trim() }),
      });
      patchDocInState(rejectingDocId, { status: "rejected", rejection_reason: rejectReason.trim() });
      setRejectingDocId(null);
    } catch {
      alert("Failed to reject document. Please try again.");
    } finally {
      setProcessingDocId(null);
    }
  };

  const handlePrint = () => window.print();
  const handleExportCsv = () => {
    const escapeRow = (r: (string | number)[]) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",");

    // Section 1: summary matrix (same as before).
    const summaryHeader = ["Name", "Company", ...weeks.map((w) => `Week ${w}`)];
    const summaryRows = students.map((s) => [
      s.name,
      s.company?.name ?? "Unassigned",
      ...weeks.map((w) => `${weekCount(s.documents, w)}/2`),
    ]);

    // Section 2: written weekly report contents, day by day — same data as the print export.
    const reportHeader = ["Student", "Week", "Date", "Activities"];
    const reportRows: (string | number)[][] = [];
    reportsForExport.forEach((r) => {
      if (r.extractionStatus === "failed" || r.days.length === 0) {
        reportRows.push([r.studentName, r.week, "", "Extraction failed for this document — see attached PDF."]);
      } else {
        r.days.forEach((d) => {
          reportRows.push([r.studentName, r.week, d.date, d.activities]);
        });
      }
    });

    const lines = [
      escapeRow(summaryHeader),
      ...summaryRows.map(escapeRow),
      "",
      escapeRow(["Weekly Report Contents"]),
      escapeRow(reportHeader),
      ...reportRows.map(escapeRow),
    ];
    const csv = lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `weekly_tracker_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  /** Print/export-only: students who have at least one weekly-report with extracted day-by-day activities. */
  const reportsForExport = useMemo(() => {
    const out: { studentName: string; week: number; days: WeeklyActivityDay[]; extractionStatus: string | null | undefined }[] = [];
    students.forEach((s) => {
      s.documents.forEach((d) => {
        if (normalize(d.document_type) === normalize("weekly-report") && d.week) {
          if (d.weekly_activities && d.weekly_activities.length > 0) {
            out.push({ studentName: s.name, week: d.week, days: d.weekly_activities, extractionStatus: d.extraction_status });
          } else if (d.extraction_status === "failed") {
            out.push({ studentName: s.name, week: d.week, days: [], extractionStatus: "failed" });
          }
        }
      });
    });
    return out.sort((a, b) => a.studentName.localeCompare(b.studentName) || a.week - b.week);
  }, [students]);

  return (
    <ProtectedRoute allowedRoles={["admin", "prof"]}>
      <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "var(--font-geist-sans, system-ui, sans-serif)", display: "flex", flexDirection: "column" }}>
        <style>{`
          .wk-card {
            background: white; border-radius: 1.25rem; padding: 1.25rem;
            box-shadow: 0 4px 15px rgba(0,0,0,0.03); border: 1px solid #e2e8f0;
          }
          .wk-toolbar-btn {
            background: white; border: 1px solid #cbd5e1; color: #475569;
            border-radius: 0.5rem; padding: 0.6rem 1.1rem; font-size: 0.85rem; font-weight: 700;
            cursor: pointer; transition: all 0.15s; display: inline-flex; align-items: center; gap: 0.45rem;
            font-family: inherit;
          }
          .wk-toolbar-btn:hover { background: #f1f5f9; color: #0f172a; border-color: #94a3b8; }
          .dt-wrap {
            overflow: hidden; border-radius: 1.25rem; border: 1px solid #e2e8f0;
            background: white; box-shadow: 0 4px 15px rgba(0,0,0,0.03);
          }
          .dt-scroll { overflow-x: auto; }
          .dt-table { width: 100%; border-collapse: separate; border-spacing: 0; min-width: 820px; }
          .dt-table th {
            height: 46px; background: #f8fafc; text-align: left; padding: 0 1rem;
            font-size: 0.72rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
            color: #64748b; border-bottom: 1px solid #e2e8f0; white-space: nowrap;
          }
          .dt-table th.dt-center, .dt-table td.dt-center { text-align: center; }
          .dt-table td { padding: 0.75rem 1rem; border-bottom: 1px solid #eef2f7; vertical-align: middle; }
          .dt-row { cursor: pointer; transition: background 0.12s; }
          .dt-row:hover { background: #f1f5f9 !important; }
          .dt-row-even { background: #ffffff; }
          .dt-row-odd { background: #f8fafc; }
          .dt-row-open td { border-bottom: none; }
          .dt-expand-row td { border-bottom: 2px solid #e2e8f0; }
          .dt-fold-btn {
            display: inline-flex; align-items: center; justify-content: center;
            width: 28px; height: 28px; border-radius: 0.5rem; border: 1px solid #7dd3fc;
            background: #e0f2fe; color: #0284c7; cursor: pointer; transition: all 0.15s;
            box-shadow: 0 1px 2px rgba(2,132,199,0.15);
          }
          .dt-fold-btn:hover { background: #bae6fd; color: #0369a1; border-color: #38bdf8; }
          .wk-cell { display: inline-flex; padding: 0.2rem 0.6rem; border-radius: 999px; font-size: 0.75rem; font-weight: 700; }
          .dt-foot {
            display: flex; align-items: center; justify-content: space-between; gap: 0.75rem;
            padding: 0.85rem 1.1rem; border-top: 1px solid #e2e8f0; background: #fafcfe;
            font-size: 0.8rem; color: #64748b; font-weight: 500; flex-wrap: wrap;
          }
          /* ── Expanded-row per-week subgrids ── */
          .ck-phase-block { display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 0.6rem; }
          .ck-phase-block:last-child { margin-bottom: 0.2rem; }
          .ck-phase-heading { display: flex; align-items: center; gap: 0.5rem; flex: 0 0 110px; padding-top: 0.6rem; margin: 0; }
          .ck-phase-num {
            width: 22px; height: 22px; border-radius: 50%; flex-shrink: 0;
            display: flex; align-items: center; justify-content: center;
            font-size: 0.66rem; font-weight: 800; background: #e0f2fe; color: #0284c7;
          }
          .ck-phase-heading-label {
            font-size: 0.78rem; font-weight: 800; letter-spacing: 0.02em; text-transform: uppercase; color: #64748b;
          }
          .ck-subgrid-wrap { overflow-x: auto; border-radius: 0.75rem; border: 1px solid #bae6fd; flex: 1; min-width: 0; }
          .ck-subgrid { border-collapse: separate; border-spacing: 0; width: 100%; min-width: max-content; }
          .ck-subgrid th {
            font-size: 0.7rem; font-weight: 600; letter-spacing: 0.01em; text-transform: none;
            padding: 0.5rem 0.7rem; text-align: center; white-space: normal; line-height: 1.25;
            min-width: 150px; max-width: 200px; border-bottom: 1px solid #bae6fd;
            background: #e0f2fe; color: #0284c7;
          }
          .ck-subgrid td {
            padding: 0.55rem 0.7rem; text-align: center; border-bottom: none; vertical-align: top;
          }
          .ck-icon {
            display: inline-flex; align-items: center; justify-content: center;
            width: 24px; height: 24px; border-radius: 50%;
          }
          .ck-icon-blank { color: #cbd5e1; font-weight: 700; font-size: 0.85rem; }
          .wk-preview-btn {
            display: inline-flex; align-items: center; gap: 0.3rem; font-size: 0.72rem; font-weight: 700;
            background: white; border: 1px solid #cbd5e1; color: #475569; border-radius: 0.4rem;
            padding: 0.3rem 0.6rem; cursor: pointer; transition: all 0.12s; font-family: inherit;
          }
          .wk-preview-btn:hover { background: #f1f5f9; border-color: #94a3b8; }
          .wk-preview-btn:disabled { opacity: 0.4; cursor: not-allowed; }
          /* Subtle approve/reject — tiny icon buttons that only appear next to a pending status */
          .wk-action-row { display: inline-flex; align-items: center; gap: 0.25rem; margin-top: 0.35rem; }
          .wk-action-btn {
            display: inline-flex; align-items: center; justify-content: center;
            width: 18px; height: 18px; border-radius: 50%; border: none; cursor: pointer;
            opacity: 0.55; transition: opacity 0.15s, background 0.15s;
          }
          .wk-action-btn:hover { opacity: 1; }
          .wk-action-approve { background: #dcfce7; color: #166534; }
          .wk-action-reject { background: #fee2e2; color: #b91c1c; }
          .wk-action-btn:disabled { opacity: 0.25; cursor: not-allowed; }
          .wk-reject-box { margin-top: 0.4rem; text-align: left; }
          .wk-reject-box textarea {
            width: 100%; min-width: 150px; font-size: 0.72rem; padding: 0.35rem 0.5rem;
            border: 1px solid #fca5a5; border-radius: 0.4rem; font-family: inherit; resize: vertical;
          }
          .wk-reject-box-btns { display: flex; gap: 0.35rem; margin-top: 0.3rem; }
          .wk-reject-submit, .wk-reject-cancel {
            font-size: 0.68rem; font-weight: 700; padding: 0.25rem 0.55rem; border-radius: 0.35rem;
            cursor: pointer; border: none; font-family: inherit;
          }
          .wk-reject-submit { background: #b91c1c; color: white; }
          .wk-reject-cancel { background: #e2e8f0; color: #475569; }
          .wk-rejection-note { font-size: 0.68rem; color: #b91c1c; margin-top: 0.3rem; font-style: italic; max-width: 180px; }
          .cl-print-header, .cl-print-table, .cl-print-footer, .cl-print-reports { display: none; }
          @media print {
            @page { size: landscape; margin: 0.5in; }
            .no-print, .cl-no-print { display: none !important; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .cl-print-header, .cl-print-table, .cl-print-footer, .cl-print-reports { display: block !important; }
            .cl-print-table { width: 100%; border-collapse: collapse; font-size: 9pt; table-layout: fixed; }
            .cl-print-table th, .cl-print-table td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: center; }
            .cl-print-table th { background: #f1f5f9 !important; color: #0f172a; font-weight: 700; text-transform: uppercase; font-size: 7.5pt; letter-spacing: 0.03em; }
            .cl-print-table th:first-child, .cl-print-table td:first-child,
            .cl-print-table th:nth-child(2), .cl-print-table td:nth-child(2) { text-align: left; }
            .cl-print-table tbody tr:nth-child(even) { background: #f8fafc !important; }
            .cl-print-table tbody tr { break-inside: avoid; }
            .cl-print-reports { margin-top: 1.5rem; page-break-before: always; }
            .cl-print-reports h2 { font-size: 13pt; font-weight: 800; color: #0f172a; border-bottom: 2px solid #0f172a; padding-bottom: 0.3rem; margin-bottom: 0.6rem; }
            .cl-report-block { margin-bottom: 1rem; break-inside: avoid; }
            .cl-report-block h3 { font-size: 10pt; font-weight: 700; color: #0f172a; margin: 0 0 0.3rem 0; }
            .cl-report-day { font-size: 8.5pt; color: #334155; margin-bottom: 0.2rem; }
            .cl-report-day strong { color: #0f172a; }
            .cl-report-failed { font-size: 8.5pt; color: #b91c1c; font-style: italic; }
          }
        `}</style>
        <AppNavbar />

        {/* Print-only formal document */}
        <div className="cl-print-header">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: "2px solid #0f172a", paddingBottom: "0.5rem", marginBottom: "0.5rem" }}>
            <div>
              <div style={{ fontSize: "8pt", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.15rem" }}>
                BSCpE 2-1 OJT E-Portfolio
              </div>
              <h1 style={{ fontSize: "16pt", fontWeight: 800, margin: 0, color: "#0f172a" }}>Weekly Submission Tracker</h1>
            </div>
            <div style={{ textAlign: "right", fontSize: "9pt", color: "#334155" }}>
              <div><strong>Date Printed:</strong> {new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })}</div>
              <div><strong>Students:</strong> {students.length}</div>
            </div>
          </div>
          <div style={{ fontSize: "9pt", color: "#475569", marginBottom: "0.75rem" }}>
            Each week requires a Weekly Report and Weekly Photo Documentation (shown as x/2).
          </div>
        </div>
        <table className="cl-print-table">
          <colgroup>
            <col style={{ width: "18%" }} />
            <col style={{ width: "18%" }} />
            {weeks.map((w) => <col key={w} style={{ width: `${64 / weeks.length}%` }} />)}
          </colgroup>
          <thead><tr><th>Name</th><th>Company</th>{weeks.map((w) => <th key={w}>Week {w}</th>)}</tr></thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.company?.name ?? "Unassigned"}</td>
                {weeks.map((w) => <td key={w}>{weekCount(s.documents, w)}/2</td>)}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="cl-print-footer" style={{ marginTop: "0.75rem", fontSize: "7.5pt", color: "#94a3b8", fontStyle: "italic" }}>
          Generated from the OJT E-Portfolio admin system.
        </div>

        {/* Print-only: written weekly reports, day by day, per student per week */}
        <div className="cl-print-reports">
          <h2>Weekly Report Contents</h2>
          {reportsForExport.length === 0 ? (
            <p style={{ fontSize: "9pt", color: "#94a3b8", fontStyle: "italic" }}>No weekly report text available.</p>
          ) : (
            reportsForExport.map((r, i) => (
              <div className="cl-report-block" key={i}>
                <h3>{r.studentName} — Week {r.week}</h3>
                {r.extractionStatus === "failed" || r.days.length === 0 ? (
                  <div className="cl-report-failed">Extraction failed for this document — see attached PDF.</div>
                ) : (
                  r.days.map((d, di) => (
                    <div className="cl-report-day" key={di}><strong>{d.date}:</strong> {d.activities}</div>
                  ))
                )}
              </div>
            ))
          )}
        </div>

        <main className="cl-no-print" style={{ maxWidth: 1800, margin: "0 auto", padding: "2.5rem 2.5rem", flex: 1, width: "100%" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <button
                onClick={() => router.push("/admin/checklist")}
                style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", background: "none", border: "none", color: "#64748b", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", padding: 0, marginBottom: "0.6rem" }}
              >
                ← Back to Checklist
              </button>
              <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.25rem 0", letterSpacing: "-0.02em" }}>
                Weekly Submission Tracker
              </h1>
              <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0, fontWeight: 500 }}>
                {loading ? "Loading…" : `${students.length} students · ${weeks.length} week${weeks.length === 1 ? "" : "s"} with submissions · each week requires a report + photo documentation (x/2)`}
              </p>
            </div>
            <div style={{ display: "flex", gap: "0.6rem" }}>
              <button className="wk-toolbar-btn" onClick={handleExportCsv}><IconDownload /> Export CSV</button>
              <button className="wk-toolbar-btn" onClick={handlePrint}><IconPrinter /> Print</button>
            </div>
          </div>

          {loading ? (
            <div className="wk-card" style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>Loading…</div>
          ) : error ? (
            <div className="wk-card" style={{ textAlign: "center", padding: "2rem", color: "#dc2626" }}>{error}</div>
          ) : weeks.length === 0 ? (
            <div className="wk-card" style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>
              No weekly submissions yet. Weeks will appear here as students upload weekly reports and photo documentation.
            </div>
          ) : (
            <div className="dt-wrap">
              <div className="dt-scroll">
                <table className="dt-table">
                  <thead>
                    <tr>
                      <th style={{ width: 46 }}>
                        <button className="dt-fold-btn" onClick={toggleAllExpand} title={allVisibleOpen ? "Collapse all" : "Expand all"} aria-label={allVisibleOpen ? "Collapse all" : "Expand all"}>
                          <IconFoldToggle allOpen={allVisibleOpen} />
                        </button>
                      </th>
                      <th>Student</th>
                      <th>Company</th>
                      {weeks.map((w) => <th key={w} className="dt-center">Week {w}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, rowIdx) => {
                      const isOpen = expandedIds.has(student.id);
                      const zebraClass = rowIdx % 2 === 0 ? "dt-row-even" : "dt-row-odd";
                      const studentWeeks = weeks.filter((w) => weekCount(student.documents, w) > 0);
                      return (
                        <Fragment key={student.id}>
                          <tr className={`dt-row ${zebraClass} ${isOpen ? "dt-row-open" : ""}`} onClick={() => toggleExpand(student.id)}>
                            <td onClick={(e) => e.stopPropagation()} style={{ textAlign: "center" }}>
                              <IconChevron open={isOpen} />
                            </td>
                            <td>
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a" }}>{student.name}</div>
                                <div style={{ fontSize: "0.74rem", color: "#94a3b8" }}>{student.email}</div>
                              </div>
                            </td>
                            <td>
                              <span style={{ fontSize: "0.8rem", color: "#475569", fontWeight: 500 }}>
                                {student.company?.name ?? <span style={{ color: "#cbd5e1", fontStyle: "italic" }}>Not assigned</span>}
                              </span>
                            </td>
                            {weeks.map((w) => {
                              const count = weekCount(student.documents, w);
                              const cfg = count === 2 ? WEEK_CELL_CFG.complete : count === 1 ? WEEK_CELL_CFG.partial : WEEK_CELL_CFG.none;
                              return (
                                <td key={w} className="dt-center">
                                  <span className="wk-cell" style={{ background: cfg.bg, color: cfg.color }}>{count}/2</span>
                                </td>
                              );
                            })}
                          </tr>
                          {isOpen && (
                            <tr className={`dt-expand-row ${zebraClass}`}>
                              <td colSpan={3 + weeks.length} style={{ padding: "0.2rem 1.25rem 1.1rem 3rem" }}>
                                {studentWeeks.length === 0 ? (
                                  <div style={{ fontSize: "0.8rem", color: "#94a3b8", padding: "0.5rem 0" }}>No submissions yet.</div>
                                ) : (
                                  studentWeeks.map((w) => (
                                    <div className="ck-phase-block" key={w}>
                                      <div className="ck-phase-heading">
                                        <span className="ck-phase-num">{String(w).padStart(2, "0")}</span>
                                        <span className="ck-phase-heading-label">Week {w}</span>
                                      </div>
                                      <div className="ck-subgrid-wrap">
                                        <table className="ck-subgrid">
                                          <thead>
                                            <tr>
                                              {WEEKLY_TYPES.map((t) => <th key={t.id}>{t.label}</th>)}
                                            </tr>
                                          </thead>
                                          <tbody>
                                            <tr>
                                              {WEEKLY_TYPES.map((t, typeIdx) => {
                                                const doc = getWeekDoc(student.documents, w, typeIdx);
                                                return (
                                                  <td key={t.id}>
                                                    <button
                                                      className="wk-preview-btn"
                                                      disabled={!doc?.file_link}
                                                      onClick={() =>
                                                        doc?.file_link &&
                                                        setViewingDoc({ title: `${student.name} — Week ${w} — ${t.label}`, fileLink: doc.file_link })
                                                      }
                                                    >
                                                      <IconEye /> Preview
                                                    </button>
                                                  </td>
                                                );
                                              })}
                                            </tr>
                                            <tr>
                                              {WEEKLY_TYPES.map((t, typeIdx) => {
                                                const doc = getWeekDoc(student.documents, w, typeIdx);
                                                const status: DocStatus = doc ? doc.status : "none";
                                                return (
                                                  <td key={t.id}>
                                                    <StatusIcon status={status} />
                                                    {doc && status === "pending" && rejectingDocId !== doc.id && (
                                                      <div className="wk-action-row">
                                                        <button
                                                          className="wk-action-btn wk-action-approve"
                                                          title="Approve"
                                                          disabled={processingDocId === doc.id}
                                                          onClick={() => doApprove(doc.id)}
                                                        >
                                                          <IconCheck />
                                                        </button>
                                                        <button
                                                          className="wk-action-btn wk-action-reject"
                                                          title="Reject"
                                                          disabled={processingDocId === doc.id}
                                                          onClick={() => openReject(doc.id)}
                                                        >
                                                          <IconX />
                                                        </button>
                                                      </div>
                                                    )}
                                                    {doc && rejectingDocId === doc.id && (
                                                      <div className="wk-reject-box">
                                                        <textarea
                                                          rows={2}
                                                          placeholder="Reason for rejection…"
                                                          value={rejectReason}
                                                          onChange={(e) => setRejectReason(e.target.value)}
                                                        />
                                                        <div className="wk-reject-box-btns">
                                                          <button className="wk-reject-submit" onClick={submitReject} disabled={processingDocId === doc.id}>
                                                            Submit
                                                          </button>
                                                          <button className="wk-reject-cancel" onClick={() => setRejectingDocId(null)}>
                                                            Cancel
                                                          </button>
                                                        </div>
                                                      </div>
                                                    )}
                                                    {doc && status === "rejected" && doc.rejection_reason && (
                                                      <div className="wk-rejection-note">{doc.rejection_reason}</div>
                                                    )}
                                                  </td>
                                                );
                                              })}
                                            </tr>
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="dt-foot">
                <div>{students.length} student{students.length === 1 ? "" : "s"} shown</div>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="wk-card" style={{ marginTop: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Status
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.83rem", fontWeight: 600, color: "#475569" }}>
                <StatusIcon status="approved" /> Approved
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.83rem", fontWeight: 600, color: "#475569" }}>
                <StatusIcon status="pending" /> Pending
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.83rem", fontWeight: 600, color: "#475569" }}>
                <StatusIcon status="rejected" /> Rejected
              </div>
            </div>
          </div>
        </main>

        {viewingDoc && (
          <DocumentViewerModal title={viewingDoc.title} fileLink={viewingDoc.fileLink} onClose={() => setViewingDoc(null)} />
        )}
      </div>
    </ProtectedRoute>
  );
}