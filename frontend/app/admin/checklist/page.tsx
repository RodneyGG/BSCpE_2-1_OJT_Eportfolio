"use client";
import { useState, useEffect, useMemo, Fragment } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "../../context/RoleContext";
import { fetchApi } from "../../../lib/api";
import AppNavbar from "../../components/AppNavbar";
import ProtectedRoute from "../../components/ProtectedRoute";
import {
  REQUIRED_DOCUMENTS,
  PHASE_ORDER,
  PHASE_LABELS,
  normalize,
  getDocumentsByPhase,
  type DocumentPhase,
  type RequiredDocument,
} from "../../data/documentTypes";
/* ═══════════════════════════ Types ═══════════════════════════ */
interface StudentDoc {
  id: number;
  document_type: string;
  status: "pending" | "approved" | "rejected";
  week?: number | null;
}
interface ChecklistStudent {
  id: number;
  name: string;
  email: string;
  company: { id: number; name: string } | null;
  documents: StudentDoc[];
}
type DocStatus = "approved" | "pending" | "rejected" | "none";
type FilterStatus = "all" | "complete" | "incomplete" | "none";
/* ═══════════════════════════ Config ═══════════════════════════ */
/* Weekly docs (weekly-report, weekly-photo-documentation) live in their
   own dedicated view (/admin/checklist/weekly) — excluded here so this
   checklist only tracks one-time-per-internship documents. */
const WEEKLY_IDS = ["weekly-photo-documentation", "weekly-report"];
const CHECKLIST_DOCS: RequiredDocument[] = REQUIRED_DOCUMENTS.filter(
  (d) => d.required !== false && !WEEKLY_IDS.includes(d.id)
);
const TOTAL_REQUIRED = CHECKLIST_DOCS.length;
function getDocsByPhaseChecklist(phase: DocumentPhase): RequiredDocument[] {
  return getDocumentsByPhase(phase).filter(
    (d) => d.required !== false && !WEEKLY_IDS.includes(d.id)
  );
}

/* Phase colors sampled directly from globals.css tokens / existing badge
   classes (.badge-primary, .badge-teal, .badge-slate) instead of invented
   hues — so this reads as part of the app's own palette, not a new one. */
const CHECKLIST_PHASE_COLORS: Record<DocumentPhase, { bg: string; color: string; border: string }> = {
  before: { bg: "#e0f2fe", color: "#0284c7", border: "#bae6fd" },   // .badge-primary tone (--color-primary-dark)
  during: { bg: "#e0e7ff", color: "#4338ca", border: "#c7d2fe" },   // indigo — clearly distinct from Before's sky
  after: { bg: "#ccfbf1", color: "#0f766e", border: "#5eead4" },    // .badge-teal tone
  other: { bg: "#f1f5f9", color: "#475569", border: "#e2e8f0" },    // .badge-slate tone
};

/* Matches the StatusBadge palette used on /profile, so a document's color
   means the same thing everywhere in the app. */
const STATUS_CFG: Record<DocStatus, { bg: string; color: string; label: string }> = {
  approved: { bg: "#dcfce7", color: "#166534", label: "Approved" },
  pending: { bg: "#fef9c3", color: "#a16207", label: "Under Review" },
  rejected: { bg: "#fee2e2", color: "#b91c1c", label: "Rejected" },
  none: { bg: "#f1f5f9", color: "#94a3b8", label: "Not Submitted" },
};
/* ═══════════════════════════ Helpers ═══════════════════════════ */
function getDocStatus(docs: StudentDoc[], reqDoc: RequiredDocument): DocStatus {
  const targets = [normalize(reqDoc.id), normalize(reqDoc.title), ...(reqDoc.aliases ?? []).map(normalize)];
  const match = docs.find((d) => targets.includes(normalize(d.document_type)));
  return match ? match.status : "none";
}
function countSubmittedIn(docs: StudentDoc[], reqDocs: RequiredDocument[]): number {
  return reqDocs.filter((rd) => {
    const s = getDocStatus(docs, rd);
    return s === "approved" || s === "pending";
  }).length;
}
function countSubmitted(docs: StudentDoc[]): number {
  return countSubmittedIn(docs, CHECKLIST_DOCS);
}
const VISIBLE_PHASES = PHASE_ORDER.filter((p) => getDocsByPhaseChecklist(p).length > 0);

/* ═══════════════════════════ Icons ═══════════════════════════ */
function IconChevron({ open }: { open: boolean }) {
  return (
    <svg
      width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
      strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.15s" }}
    >
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
/* Master fold/unfold control, sits where the select-all checkbox used to be. */
function IconFoldToggle({ allOpen }: { allOpen: boolean }) {
  return (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
      {allOpen ? <polyline points="18 15 12 9 6 15" /> : <polyline points="6 9 12 15 18 9" />}
    </svg>
  );
}
/* Per-document status glyph shown inside each phase sub-grid. */
function StatusIcon({ status }: { status: DocStatus }) {
  const cfg = STATUS_CFG[status];
  if (status === "none") {
    return <span className="ck-icon-blank" title={cfg.label}>—</span>;
  }
  return (
    <span className="ck-icon" style={{ background: cfg.bg, color: cfg.color }} title={cfg.label}>
      {status === "approved" && (
        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 13l4 4L19 7" />
        </svg>
      )}
      {status === "pending" && (
        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3.2 2" />
        </svg>
      )}
      {status === "rejected" && (
        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      )}
    </span>
  );
}

/* ═══════════════════════════ Page ═══════════════════════════ */
export default function ChecklistPage() {
  const { user } = useRole();
  const router = useRouter();
  const [students, setStudents] = useState<ChecklistStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [hasInitializedExpand, setHasInitializedExpand] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");

  useEffect(() => {
    setLoading(true);
    fetchApi("/admin/checklist")
      .then((data: { students: ChecklistStudent[] }) => {
        const list = data.students ?? [];
        setStudents(list);
        // Default: every student's checklist starts collapsed.
        if (!hasInitializedExpand) {
          setHasInitializedExpand(true);
        }
      })
      .catch(() => setError("Could not load checklist data."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const companies = useMemo(() => {
    const map = new Map<number, string>();
    students.forEach((s) => { if (s.company) map.set(s.company.id, s.company.name); });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [students]);

  const filtered = useMemo(() => {
    return students.filter((s) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!s.name.toLowerCase().includes(q) && !s.email.toLowerCase().includes(q)) return false;
      }
      if (companyFilter !== "all" && (!s.company || String(s.company.id) !== companyFilter)) return false;
      if (statusFilter !== "all") {
        const submitted = countSubmitted(s.documents);
        if (statusFilter === "complete" && submitted < TOTAL_REQUIRED) return false;
        if (statusFilter === "incomplete" && submitted >= TOTAL_REQUIRED) return false;
        if (statusFilter === "none" && s.documents.length > 0) return false;
      }
      return true;
    });
  }, [students, searchQuery, companyFilter, statusFilter]);

  const stats = useMemo(() => {
    const total = students.length;
    const complete = students.filter((s) => countSubmitted(s.documents) >= TOTAL_REQUIRED).length;
    return { total, complete, incomplete: total - complete };
  }, [students]);

  const allVisibleOpen = filtered.length > 0 && filtered.every((s) => expandedIds.has(s.id));

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
        filtered.forEach((s) => next.delete(s.id));
      } else {
        filtered.forEach((s) => next.add(s.id));
      }
      return next;
    });
  };

  const handlePrint = () => window.print();
  const handleExportCsv = () => {
    const header = ["Name", "Email", "Company", ...VISIBLE_PHASES.map((p) => PHASE_LABELS[p]), "Total Submitted"];
    const body = filtered.map((s) => [
      s.name,
      s.email,
      s.company?.name ?? "Unassigned",
      ...VISIBLE_PHASES.map((p) => {
        const docs = getDocsByPhaseChecklist(p);
        return `${countSubmittedIn(s.documents, docs)}/${docs.length}`;
      }),
      `${countSubmitted(s.documents)}/${TOTAL_REQUIRED}`,
    ]);
    const csv = [header, ...body]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ojt_checklist_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <ProtectedRoute allowedRoles={["admin", "prof"]}>
      <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "var(--font-geist-sans, system-ui, sans-serif)", display: "flex", flexDirection: "column" }}>
        <style>{`
          /* ── Toolbar / cards — matched to admin-card scale ── */
          .dt-toolbar-card {
            background: white; border-radius: 1.25rem; padding: 1.25rem;
            box-shadow: 0 4px 15px rgba(0,0,0,0.03); border: 1px solid #e2e8f0;
          }
          .ck-input, .ck-select {
            font-size: 0.85rem; padding: 0.55rem 0.75rem; border: 1px solid #cbd5e1;
            border-radius: 0.5rem; outline: none; background: white; color: #0f172a;
            font-family: inherit;
          }
          .ck-input:focus, .ck-select:focus { border-color: #0ea5e9; }

          /* ── Neutral toolbar buttons, matched to /profile's .card-edit-btn ── */
          .ck-toolbar-btn {
            background: white; border: 1px solid #cbd5e1; color: #475569;
            border-radius: 0.5rem; padding: 0.6rem 1.1rem; font-size: 0.85rem; font-weight: 700;
            cursor: pointer; transition: all 0.15s; display: inline-flex; align-items: center; gap: 0.45rem;
            font-family: inherit;
          }
          .ck-toolbar-btn:hover { background: #f1f5f9; color: #0f172a; border-color: #94a3b8; }

          /* ── DataTable ── */
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
          .dt-phase-pill {
            display: inline-flex; align-items: center; justify-content: center;
            min-width: 44px; padding: 0.22rem 0.55rem; border-radius: 999px;
            font-size: 0.74rem; font-weight: 700; border: 1px solid transparent;
          }
          .dt-foot {
            display: flex; align-items: center; justify-content: space-between; gap: 0.75rem;
            padding: 0.85rem 1.1rem; border-top: 1px solid #e2e8f0; background: #fafcfe;
            font-size: 0.8rem; color: #64748b; font-weight: 500; flex-wrap: wrap;
          }
          .ck-progress-bar { height: 5px; border-radius: 99px; background: #e2e8f0; overflow: hidden; margin-top: 0.3rem; width: 90px; }
          .ck-progress-fill { height: 100%; border-radius: 99px; }

          /* ── Expanded-row phase detail grids ── */
          .ck-phase-block { display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 0.6rem; }
          .ck-phase-block:last-child { margin-bottom: 0.2rem; }
          .ck-phase-heading { display: flex; align-items: center; gap: 0.5rem; flex: 0 0 150px; padding-top: 0.6rem; margin: 0; }
          .ck-phase-num {
            width: 22px; height: 22px; border-radius: 50%; flex-shrink: 0;
            display: flex; align-items: center; justify-content: center;
            font-size: 0.66rem; font-weight: 800;
          }
          .ck-phase-heading-label {
            font-size: 0.78rem; font-weight: 800; letter-spacing: 0.02em; text-transform: uppercase; color: #64748b;
          }
          .ck-subgrid-wrap { overflow-x: auto; border-radius: 0.75rem; border: 1px solid; flex: 1; min-width: 0; }
          .ck-subgrid { border-collapse: separate; border-spacing: 0; width: 100%; min-width: max-content; }
          .ck-subgrid th {
            font-size: 0.7rem; font-weight: 600; letter-spacing: 0.01em; text-transform: none;
            padding: 0.5rem 0.7rem; text-align: center; white-space: normal; line-height: 1.25;
            min-width: 118px; max-width: 160px; border-bottom: 1px solid;
          }
          .ck-subgrid td {
            padding: 0.55rem 0.7rem; text-align: center; border-bottom: none;
          }
          .ck-icon {
            display: inline-flex; align-items: center; justify-content: center;
            width: 24px; height: 24px; border-radius: 50%;
          }
          .ck-icon-blank { color: #cbd5e1; font-weight: 700; font-size: 0.85rem; }

          /* ── Inline header stats, mirrors admin dashboard's title-left/meta-right row ── */
          .ck-stat-row { display: flex; align-items: center; gap: 1.5rem; }
          .ck-stat { display: flex; flex-direction: column; align-items: flex-end; min-width: 64px; }
          .ck-stat-value { font-size: 1.5rem; font-weight: 800; letter-spacing: -0.02em; line-height: 1; }
          .ck-stat-label { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; color: #94a3b8; margin-top: 0.3rem; }
          .ck-stat-divider { width: 1px; align-self: stretch; background: #e2e8f0; }

          /* ── Legend ── */
          .ck-legend-row { display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap; }
          .ck-legend-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.83rem; font-weight: 600; color: #475569; }

          .cl-print-header, .cl-print-table, .cl-print-footer { display: none; }
          @media print {
            @page { size: portrait; margin: 0.6in; }
            .no-print, .cl-no-print { display: none !important; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .cl-print-header, .cl-print-table, .cl-print-footer { display: block !important; }
            .cl-print-table { width: 100%; border-collapse: collapse; font-size: 10pt; table-layout: fixed; }
            .cl-print-table th, .cl-print-table td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
            .cl-print-table th { background: #f1f5f9 !important; color: #0f172a; font-weight: 700; text-transform: uppercase; font-size: 8.5pt; letter-spacing: 0.03em; }
            .cl-print-table tbody tr:nth-child(even) { background: #f8fafc !important; }
            .cl-print-table tbody tr { break-inside: avoid; }
          }
        `}</style>
        <AppNavbar />
        {/* Print-only formal document — independent of on-screen expand state */}
        <div className="cl-print-header">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: "2px solid #0f172a", paddingBottom: "0.5rem", marginBottom: "0.5rem" }}>
            <div>
              <div style={{ fontSize: "8pt", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.15rem" }}>
                BSCpE 2-1 OJT E-Portfolio
              </div>
              <h1 style={{ fontSize: "16pt", fontWeight: 800, margin: 0, color: "#0f172a" }}>OJT Submission Checklist</h1>
            </div>
            <div style={{ textAlign: "right", fontSize: "9pt", color: "#334155" }}>
              <div><strong>Professor:</strong> {user?.name ?? "—"}</div>
              <div><strong>Date Printed:</strong> {new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "2rem", fontSize: "9pt", color: "#475569", marginBottom: "0.75rem" }}>
            <span><strong style={{ color: "#0f172a" }}>{filtered.length}</strong> Total Students</span>
            <span><strong style={{ color: "#166534" }}>{stats.complete}</strong> Complete</span>
            <span><strong style={{ color: "#92400e" }}>{stats.incomplete}</strong> Incomplete</span>
            <span><strong style={{ color: "#0f172a" }}>{TOTAL_REQUIRED}</strong> Required Documents</span>
          </div>
        </div>
        <table className="cl-print-table">
          <colgroup>
            <col style={{ width: "26%" }} />
            <col style={{ width: "30%" }} />
            <col style={{ width: "26%" }} />
            <col style={{ width: "18%" }} />
          </colgroup>
          <thead><tr><th>Name</th><th>Email</th><th>Company</th><th>Submitted</th></tr></thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.email}</td>
                <td>{s.company?.name ?? "Unassigned"}</td>
                <td>{countSubmitted(s.documents)}/{TOTAL_REQUIRED}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="cl-print-footer" style={{ marginTop: "0.75rem", fontSize: "7.5pt", color: "#94a3b8", fontStyle: "italic" }}>
          Generated from the OJT E-Portfolio admin system.
        </div>

        <main className="cl-no-print" style={{ maxWidth: 1800, margin: "0 auto", padding: "2.5rem 2.5rem", flex: 1, width: "100%" }}>
          {/* Header — title left, stats right, mirrors the admin dashboard's header row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1.75rem", flexWrap: "wrap", gap: "1.25rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#0ea5e9" }} />
                <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  <span style={{ cursor: "pointer", textDecoration: "underline", textUnderlineOffset: "3px" }} onClick={() => router.push("/admin")}>
                    Dashboard
                  </span>
                  <span style={{ margin: "0 0.4rem", color: "#cbd5e1" }}>›</span>
                  Submission Checklist
                </span>
              </div>
              <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>
                OJT Submission Checklist
              </h1>
            </div>
            {!loading && (
              <div className="ck-stat-row">
                <div className="ck-stat">
                  <span className="ck-stat-value" style={{ color: "#166534" }}>{stats.complete}</span>
                  <span className="ck-stat-label">Complete</span>
                </div>
                <div className="ck-stat-divider" />
                <div className="ck-stat">
                  <span className="ck-stat-value" style={{ color: "#a16207" }}>{stats.incomplete}</span>
                  <span className="ck-stat-label">Incomplete</span>
                </div>
                <div className="ck-stat-divider" />
                <div className="ck-stat">
                  <span className="ck-stat-value" style={{ color: "#0f172a" }}>{TOTAL_REQUIRED}</span>
                  <span className="ck-stat-label">Required Docs</span>
                </div>
              </div>
            )}
          </div>

          {/* Toolbar */}
          <div className="dt-toolbar-card" style={{ marginBottom: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
              <input
                type="text" placeholder="Search name or email…" className="ck-input"
                style={{ flex: "1 1 220px" }} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select className="ck-select" value={companyFilter} onChange={(e) => setCompanyFilter(e.target.value)}>
                <option value="all">All Companies</option>
                {companies.map((c) => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
              </select>
              <select className="ck-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}>
                <option value="all">All Status</option>
                <option value="complete">Complete</option>
                <option value="incomplete">Incomplete</option>
                <option value="none">No Submissions</option>
              </select>
              <div style={{ flex: 1 }} />
              <button className="ck-toolbar-btn" onClick={() => router.push("/admin/checklist/weekly")}>
                Weekly Tracker →
              </button>
              <button className="ck-toolbar-btn" onClick={handleExportCsv}>
                <IconDownload /> Export CSV
              </button>
              <button className="ck-toolbar-btn" onClick={handlePrint}>
                <IconPrinter /> Print
              </button>
            </div>
          </div>

          {/* DataTable */}
          {loading ? (
            <div className="dt-toolbar-card" style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>Loading…</div>
          ) : error ? (
            <div className="dt-toolbar-card" style={{ textAlign: "center", padding: "2rem", color: "#dc2626" }}>{error}</div>
          ) : filtered.length === 0 ? (
            <div className="dt-toolbar-card" style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>No students match the current filters.</div>
          ) : (
            <div className="dt-wrap">
              <div className="dt-scroll">
                <table className="dt-table">
                  <thead>
                    <tr>
                      <th style={{ width: 46 }}>
                        <button
                          className="dt-fold-btn"
                          onClick={toggleAllExpand}
                          title={allVisibleOpen ? "Collapse all" : "Expand all"}
                          aria-label={allVisibleOpen ? "Collapse all students" : "Expand all students"}
                        >
                          <IconFoldToggle allOpen={allVisibleOpen} />
                        </button>
                      </th>
                      <th>Student</th>
                      <th>Company</th>
                      {VISIBLE_PHASES.map((phase) => (
                        <th key={phase} className="dt-center">{PHASE_LABELS[phase]}</th>
                      ))}
                      <th className="dt-center">Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((student, rowIdx) => {
                      const submitted = countSubmitted(student.documents);
                      const pct = Math.round((submitted / TOTAL_REQUIRED) * 100);
                      const isComplete = submitted >= TOTAL_REQUIRED;
                      const isOpen = expandedIds.has(student.id);
                      const zebraClass = rowIdx % 2 === 0 ? "dt-row-even" : "dt-row-odd";
                      return (
                        <Fragment key={student.id}>
                          <tr
                            className={`dt-row ${zebraClass} ${isOpen ? "dt-row-open" : ""}`}
                            onClick={() => toggleExpand(student.id)}
                          >
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
                            {VISIBLE_PHASES.map((phase) => {
                              const docs = getDocsByPhaseChecklist(phase);
                              const n = countSubmittedIn(student.documents, docs);
                              const colors = CHECKLIST_PHASE_COLORS[phase];
                              const complete = n >= docs.length;
                              return (
                                <td key={phase} className="dt-center">
                                  <span
                                    className="dt-phase-pill"
                                    style={{
                                      background: n === 0 ? "#f1f5f9" : colors.bg,
                                      color: n === 0 ? "#94a3b8" : colors.color,
                                      borderColor: n === 0 ? "#e2e8f0" : colors.border,
                                      fontWeight: complete ? 800 : 700,
                                    }}
                                  >
                                    {n}/{docs.length}
                                  </span>
                                </td>
                              );
                            })}
                            <td className="dt-center">
                              <div style={{ fontSize: "0.78rem", fontWeight: 700, color: isComplete ? "#166534" : "#0f172a" }}>
                                {submitted}/{TOTAL_REQUIRED}
                              </div>
                              <div className="ck-progress-bar" style={{ margin: "0.3rem auto 0" }}>
                                <div className="ck-progress-fill" style={{ width: `${pct}%`, background: isComplete ? "#16a34a" : pct > 0 ? "#0ea5e9" : "#e2e8f0" }} />
                              </div>
                            </td>
                          </tr>
                          {isOpen && (
                            <tr className={`dt-expand-row ${zebraClass}`}>
                              <td colSpan={4 + VISIBLE_PHASES.length} style={{ padding: "0.2rem 1.25rem 1.1rem 3rem" }}>
                                {VISIBLE_PHASES.map((phase, idx) => {
                                  const docs = getDocsByPhaseChecklist(phase);
                                  const colors = CHECKLIST_PHASE_COLORS[phase];
                                  return (
                                    <div className="ck-phase-block" key={phase}>
                                      <div className="ck-phase-heading">
                                        <span className="ck-phase-num" style={{ background: colors.bg, color: colors.color }}>
                                          {String(idx + 1).padStart(2, "0")}
                                        </span>
                                        <span className="ck-phase-heading-label">
                                          {PHASE_LABELS[phase]}
                                        </span>
                                      </div>
                                      <div className="ck-subgrid-wrap" style={{ borderColor: colors.border }}>
                                        <table className="ck-subgrid">
                                          <thead>
                                            <tr>
                                              {docs.map((doc) => (
                                                <th key={doc.id} style={{ background: colors.bg, color: colors.color, borderColor: colors.border }}>
                                                  {doc.title}
                                                </th>
                                              ))}
                                            </tr>
                                          </thead>
                                          <tbody>
                                            <tr>
                                              {docs.map((doc) => (
                                                <td key={doc.id}>
                                                  <StatusIcon status={getDocStatus(student.documents, doc)} />
                                                </td>
                                              ))}
                                            </tr>
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                  );
                                })}
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
                <div>{filtered.length} student{filtered.length === 1 ? "" : "s"} shown</div>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="dt-toolbar-card" style={{ marginTop: "1.5rem" }}>
            <div className="ck-legend-row">
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Status
              </span>
              <div className="ck-legend-item"><StatusIcon status="approved" /> Approved</div>
              <div className="ck-legend-item"><StatusIcon status="pending" /> Pending</div>
              <div className="ck-legend-item"><StatusIcon status="rejected" /> Rejected</div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}