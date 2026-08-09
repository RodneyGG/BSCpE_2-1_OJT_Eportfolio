"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "../../../../lib/api";
import AppNavbar from "../../../components/AppNavbar";
import ProtectedRoute from "../../../components/ProtectedRoute";
import { normalize } from "../../../data/documentTypes";

/* Weekly-tracked document type ids (must match documentTypes.ts) */
const WEEKLY_TYPES = [
  { id: "weekly-report", aliases: [] as string[] },
  { id: "weekly-photo-documentation", aliases: ["Photo Documentation", "photo-documentation"] },
];
const WEEKLY_TARGETS = WEEKLY_TYPES.map((w) => new Set([normalize(w.id), ...w.aliases.map(normalize)]));

interface StudentDoc {
  id: number;
  document_type: string;
  status: "pending" | "approved" | "rejected";
  week?: number | null;
}
interface WeeklyStudent {
  id: number;
  name: string;
  email: string;
  company: { id: number; name: string } | null;
  documents: StudentDoc[];
}

/* Matches STATUS_CFG on the main checklist page / StatusBadge on /profile,
   so "2/2" and "1/2" mean the same color everywhere in the app. */
const WEEK_CELL_CFG = {
  complete: { bg: "#dcfce7", color: "#166534" },
  partial: { bg: "#fef9c3", color: "#a16207" },
  none: { bg: "#f1f5f9", color: "#94a3b8" },
};

/** Count how many of the 2 weekly doc types this student submitted for a given week. */
function weekCount(docs: StudentDoc[], week: number): number {
  const matchedTypes = new Set<number>();
  docs.forEach((d) => {
    if (d.week !== week) return;
    const norm = normalize(d.document_type);
    WEEKLY_TARGETS.forEach((targets, i) => {
      if (targets.has(norm)) matchedTypes.add(i);
    });
  });
  return matchedTypes.size;
}

function IconChevronLeft() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
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

export default function WeeklyTrackerPage() {
  const router = useRouter();
  const [students, setStudents] = useState<WeeklyStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchApi("/admin/checklist")
      .then((data: { students: WeeklyStudent[] }) => setStudents(data.students ?? []))
      .catch(() => setError("Could not load weekly data."))
      .finally(() => setLoading(false));
  }, []);

  /* Only weeks that have at least one submission, anywhere. */
  const weeks = useMemo(() => {
    const set = new Set<number>();
    students.forEach((s) => s.documents.forEach((d) => { if (d.week) set.add(d.week); }));
    return Array.from(set).sort((a, b) => a - b);
  }, [students]);

  const handlePrint = () => window.print();
  const handleExportCsv = () => {
    const header = ["Name", "Company", ...weeks.map((w) => `Week ${w}`)];
    const rows = students.map((s) => [
      s.name,
      s.company?.name ?? "Unassigned",
      ...weeks.map((w) => `${weekCount(s.documents, w)}/2`),
    ]);
    const csv = [header, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
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
          .wk-table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 0.82rem; }
          .wk-table th {
            background: #f8fafc; font-weight: 700; color: #64748b; font-size: 0.72rem;
            text-transform: uppercase; letter-spacing: 0.06em; padding: 0.7rem 0.6rem;
            border-bottom: 1px solid #e2e8f0; text-align: center; white-space: nowrap;
          }
          .wk-table th:first-child, .wk-table td:first-child { text-align: left; padding-left: 1.1rem; }
          .wk-table th:nth-child(2), .wk-table td:nth-child(2) { text-align: left; }
          .wk-table td { padding: 0.65rem 0.6rem; border-bottom: 1px solid #f1f5f9; text-align: center; }
          .wk-cell { display: inline-flex; padding: 0.2rem 0.6rem; border-radius: 999px; font-size: 0.75rem; font-weight: 700; }
          .cl-print-header, .cl-print-table, .cl-print-footer { display: none; }
          @media print {
            @page { size: landscape; margin: 0.5in; }
            .no-print, .cl-no-print { display: none !important; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .cl-print-header, .cl-print-table, .cl-print-footer { display: block !important; }
            .cl-print-table { width: 100%; border-collapse: collapse; font-size: 9pt; table-layout: fixed; }
            .cl-print-table th, .cl-print-table td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: center; }
            .cl-print-table th { background: #f1f5f9 !important; color: #0f172a; font-weight: 700; text-transform: uppercase; font-size: 7.5pt; letter-spacing: 0.03em; }
            .cl-print-table th:first-child, .cl-print-table td:first-child,
            .cl-print-table th:nth-child(2), .cl-print-table td:nth-child(2) { text-align: left; }
            .cl-print-table tbody tr:nth-child(even) { background: #f8fafc !important; }
            .cl-print-table tbody tr { break-inside: avoid; }
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

        <main className="cl-no-print" style={{ maxWidth: 1800, margin: "0 auto", padding: "2.5rem 2.5rem", flex: 1, width: "100%" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <button
                onClick={() => router.push("/admin/checklist")}
                style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", background: "none", border: "none", color: "#64748b", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", padding: 0, marginBottom: "0.6rem" }}
              >
                <IconChevronLeft /> Back to Checklist
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
            <div className="wk-card" style={{ padding: 0, overflowX: "auto" }}>
              <table className="wk-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Company</th>
                    {weeks.map((w) => <th key={w}>Week {w}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 700, color: "#0f172a" }}>{s.name}</td>
                      <td style={{ color: "#475569" }}>{s.company?.name ?? <span style={{ color: "#cbd5e1", fontStyle: "italic" }}>Not assigned</span>}</td>
                      {weeks.map((w) => {
                        const count = weekCount(s.documents, w);
                        const cfg = count === 2 ? WEEK_CELL_CFG.complete : count === 1 ? WEEK_CELL_CFG.partial : WEEK_CELL_CFG.none;
                        return (
                          <td key={w}>
                            <span className="wk-cell" style={{ background: cfg.bg, color: cfg.color }}>{count}/2</span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}