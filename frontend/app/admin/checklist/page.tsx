"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "../../context/RoleContext";
import { fetchApi } from "../../../lib/api";
import AppNavbar from "../../components/AppNavbar";
import ProtectedRoute from "../../components/ProtectedRoute";
import PendingApprovalSection from "../../components/PendingApprovalSection";
import {
  REQUIRED_DOCUMENTS,
  PHASE_ORDER,
  PHASE_LABELS,
  PHASE_COLORS,
  normalize,
  getDocumentsByPhase,
  TOTAL_REQUIRED_DOCS,
  type DocumentPhase,
  type RequiredDocument,
} from "../../data/documentTypes";

/* ═══════════════════════════ Types ═══════════════════════════ */

interface StudentDoc {
  id: number;
  document_type: string;
  status: "pending" | "approved" | "rejected";
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

/* ═══════════════════════════ Helpers ═══════════════════════════ */

function getDocStatus(docs: StudentDoc[], reqDoc: RequiredDocument): DocStatus {
  const targets = [
    normalize(reqDoc.id),
    normalize(reqDoc.title),
    ...(reqDoc.aliases ?? []).map(normalize),
  ];
  const match = docs.find((d) => targets.includes(normalize(d.document_type)));
  return match ? match.status : "none";
}

function countSubmitted(docs: StudentDoc[]): number {
  return REQUIRED_DOCUMENTS.filter((rd) => {
    if (rd.required === false) return false;
    const s = getDocStatus(docs, rd);
    return s === "approved" || s === "pending";
  }).length;
}

const STATUS_CFG: Record<DocStatus, { bg: string; color: string; label: string; iconKey: "check" | "clock" | "x" | "dash" }> = {
  approved: { bg: "#dcfce7", color: "#16a34a", label: "Approved", iconKey: "check" },
  pending:  { bg: "#fef9c3", color: "#ca8a04", label: "Pending",  iconKey: "clock" },
  rejected: { bg: "#fee2e2", color: "#dc2626", label: "Rejected", iconKey: "x" },
  none:     { bg: "#f1f5f9", color: "#94a3b8", label: "Not Submitted", iconKey: "dash" },
};

/* ═══════════════════════════ Scroll reveal ═══════════════════ */

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function RevealBox({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, visible } = useReveal();
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(24px)",
      transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
    }}>
      {children}
    </div>
  );
}

/* ═══════════════════════════ Icons ═══════════════════════════ */

function IconPrinter() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9V2h12v7" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" />
    </svg>
  );
}
function IconSearch() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
    </svg>
  );
}
function IconFilter() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}
function IconClipboardCheck() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="M9 14l2 2 4-4" />
    </svg>
  );
}
function IconUsers() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function IconCheckCircle() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4 12 14.01l-3-3" />
    </svg>
  );
}
function IconAlertTriangle() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
function IconChevron() {
  return (
    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

function StatusIconSVG({ iconKey }: { iconKey: "check" | "clock" | "x" | "dash" }) {
  if (iconKey === "check") return <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>;
  if (iconKey === "clock") return <svg width="65%" height="65%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
  if (iconKey === "x") return <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>;
  return <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /></svg>;
}

/* ═══════════════════════════ Page ═══════════════════════════ */

export default function ChecklistPage() {
  const { role, user } = useRole();
  const router = useRouter();

  const [students, setStudents] = useState<ChecklistStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [legendOpen, setLegendOpen] = useState(false);

  /* Filters */
  const [searchQuery, setSearchQuery] = useState("");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");


  /* Fetch data */
  const loadChecklist = () => {
    setLoading(true);
    fetchApi("/admin/checklist")
      .then((data: { students: ChecklistStudent[] }) => {
        setStudents(data.students ?? []);
      })
      .catch((err: unknown) => {
        console.error("Failed to load checklist:", err);
        setError("Could not load checklist data.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadChecklist();
  }, []);

  /* Unique companies for the filter dropdown */
  const companies = useMemo(() => {
    const map = new Map<number, string>();
    students.forEach((s) => {
      if (s.company) map.set(s.company.id, s.company.name);
    });
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [students]);

  /* Filtered students */
  const filtered = useMemo(() => {
    return students.filter((s) => {
      /* Name / email search */
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!s.name.toLowerCase().includes(q) && !s.email.toLowerCase().includes(q)) return false;
      }
      /* Company filter */
      if (companyFilter !== "all") {
        if (!s.company || String(s.company.id) !== companyFilter) return false;
      }
      /* Status filter */
      if (statusFilter !== "all") {
        const submitted = countSubmitted(s.documents);
        if (statusFilter === "complete" && submitted < TOTAL_REQUIRED_DOCS) return false;
        if (statusFilter === "incomplete" && submitted >= TOTAL_REQUIRED_DOCS) return false;
        if (statusFilter === "none" && s.documents.length > 0) return false;
      }
      return true;
    });
  }, [students, searchQuery, companyFilter, statusFilter]);

  /* Stats */
  const stats = useMemo(() => {
    const total = students.length;
    const complete = students.filter((s) => countSubmitted(s.documents) >= TOTAL_REQUIRED_DOCS).length;
    return { total, complete, incomplete: total - complete };
  }, [students]);

  /* Print handler */
  const handlePrint = () => window.print();



  return (
    <ProtectedRoute allowedRoles={['admin', 'prof']}>
      <div style={{
        minHeight: "100vh",
        background: "#f1f5f9",
        fontFamily: "var(--font-geist-sans, system-ui, sans-serif)",
        display: "flex", flexDirection: "column",
      }}>

      {/* ══ SCOPED STYLES ══ */}
      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .cl-card {
          background: white; border-radius: 1.25rem; padding: 1.5rem;
          box-shadow: 0 4px 15px rgba(0,0,0,0.03); border: 1px solid #e2e8f0;
        }
        .cl-stat-icon {
          width: 48px; height: 48px; border-radius: 1rem;
          display: flex; align-items: center; justify-content: center;
        }
        .cl-filter-input {
          font-size: 0.85rem; padding: 0.55rem 0.85rem 0.55rem 2.2rem;
          border: 1px solid #e2e8f0; border-radius: 0.75rem; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s; width: 100%; min-width: 180px;
          background: white; color: #0f172a;
        }
        .cl-filter-input:focus {
          border-color: #0ea5e9; box-shadow: 0 0 0 3px rgba(14,165,233,0.12);
        }
        .cl-select {
          font-size: 0.85rem; padding: 0.55rem 2rem 0.55rem 0.85rem;
          border: 1px solid #e2e8f0; border-radius: 0.75rem; outline: none;
          background: white url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E") no-repeat right 0.75rem center;
          appearance: none; color: #0f172a; cursor: pointer;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .cl-select:focus {
          border-color: #0ea5e9; box-shadow: 0 0 0 3px rgba(14,165,233,0.12);
        }
        .cl-print-btn {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.55rem 1.25rem; font-size: 0.85rem; font-weight: 700;
          border: none; border-radius: 0.75rem; cursor: pointer;
          background: linear-gradient(135deg, #0ea5e9 0%, #0d9488 100%);
          color: white; transition: opacity 0.2s, transform 0.2s;
          box-shadow: 0 4px 14px rgba(14,165,233,0.3);
        }
        .cl-print-btn:hover { opacity: 0.9; transform: translateY(-1px); }

        /* ── Table styles ── */
        .cl-table-wrap {
          overflow-x: auto; border-radius: 1rem; border: 1px solid #e2e8f0;
          background: white; box-shadow: 0 4px 15px rgba(0,0,0,0.03);
          max-width: 100%;
        }
        .cl-table {
          width: 100%; border-collapse: separate; border-spacing: 0; font-size: 0.85rem;
        }
        .cl-table th {
          background: #f8fafc; font-weight: 700; color: #475569;
          text-transform: uppercase; letter-spacing: 0.05em; font-size: 0.72rem;
          padding: 0.75rem 0.5rem; border-bottom: 2px solid #e2e8f0;
          white-space: nowrap; text-align: center; position: relative;
        }
        .cl-table td {
          padding: 0.6rem 0.5rem; border-bottom: 1px solid #f1f5f9;
          text-align: center; vertical-align: middle;
        }
        .cl-table tbody tr { background: white; transition: background 0.15s; }
        .cl-table tbody tr:hover { background: #f0f9ff; }

        /* Sticky Columns */
        .cl-table th.cl-sticky, .cl-table td.cl-sticky { position: sticky; z-index: 2; }
        .cl-table th.cl-sticky { z-index: 10; background: #f8fafc; }
        .cl-table td.cl-sticky { background: inherit; }

        .cl-table th.cl-th-name, .cl-table td.cl-td-name { left: 0; width: 220px; min-width: 220px; text-align: left; padding-left: 1rem; border-right: 1px solid #f1f5f9; }
        .cl-table th.cl-th-company, .cl-table td.cl-td-company { left: 220px; width: 140px; min-width: 140px; text-align: left; border-right: 1px solid #f1f5f9; }
        .cl-table th.cl-th-progress, .cl-table td.cl-td-progress { 
          left: 360px; width: 110px; min-width: 110px; 
          border-right: 2px solid #94a3b8; 
          box-shadow: 4px 0 8px -2px rgba(0,0,0,0.05);
        }
        /* Override border for headers */
        .cl-table th.cl-th-name, .cl-table th.cl-th-company { border-right: 1px solid #e2e8f0; }
        .cl-table th.cl-th-progress { border-right: 2px solid #94a3b8; box-shadow: 4px 0 8px -2px rgba(0,0,0,0.05); }

        /* Phase group header */
        .cl-phase-header {
          font-size: 0.65rem; font-weight: 800; text-transform: uppercase;
          letter-spacing: 0.1em; padding: 0.4rem 0.35rem;
          border-bottom: 2px solid; white-space: nowrap;
          border-right: 2px solid #94a3b8 !important;
        }

        /* Status dot */
        .cl-dot {
          display: inline-flex; align-items: center; justify-content: center;
          width: 28px; height: 28px; border-radius: 50%;
          font-size: 0.85rem; font-weight: 800; cursor: default;
          transition: transform 0.15s;
        }
        .cl-dot:hover { transform: scale(1.15); }

        /* Progress bar */
        .cl-progress-bar {
          height: 6px; border-radius: 99px; background: #e2e8f0; overflow: hidden;
          margin-top: 0.35rem;
        }
        .cl-progress-fill {
          height: 100%; border-radius: 99px; transition: width 0.4s ease;
        }

        /* Print header */
        .cl-print-header { display: none; }
        .cl-print-legend { display: none; }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .cl-filter-row { flex-direction: column !important; }
          .cl-card { padding: 1rem !important; }
          .cl-main { padding: 1.5rem 1rem !important; }
        }

        /* ── PRINT ── */
        @media print {
          @page { size: landscape; margin: 10mm; }
          body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          nav, .cl-no-print { display: none !important; }
          .cl-print-header { display: block !important; margin-bottom: 1rem; }
          .cl-main { padding: 0 !important; max-width: 100% !important; margin: 0 !important; }
          .cl-card { box-shadow: none !important; border: none !important; padding: 0 !important; }
          .cl-table-wrap { 
            overflow: visible !important; 
            box-shadow: none !important; 
            border-radius: 0 !important; 
            border: none !important; 
            transform: scale(0.78) !important; 
            transform-origin: top left !important;
            width: 128% !important; /* 1 / 0.78 to counteract the scale visually keeping right edge */
          }
          .cl-table { font-size: 8pt !important; width: 100%; table-layout: fixed; border-collapse: collapse; }
          .cl-table th { padding: 4px 1px !important; font-size: 6pt !important; white-space: nowrap !important; line-height: 1.1; }
          .cl-table td { padding: 4px 1px !important; }
          .cl-table th.cl-th-name { width: 15%; min-width: auto; position: static !important; box-shadow: none !important; border-right: 1px solid #e2e8f0 !important; }
          .cl-table td.cl-td-name { position: static !important; box-shadow: none !important; border-right: 1px solid #e2e8f0 !important; }
          .cl-table th.cl-th-company { width: 9%; min-width: auto; position: static !important; box-shadow: none !important; border-right: 1px solid #e2e8f0 !important; }
          .cl-table td.cl-td-company { position: static !important; box-shadow: none !important; border-right: 1px solid #e2e8f0 !important; }
          .cl-table th.cl-th-progress { width: 6.5%; min-width: auto; position: static !important; border-right: 2px solid #94a3b8 !important; box-shadow: none !important; }
          .cl-table td.cl-td-progress { position: static !important; border-right: 2px solid #94a3b8 !important; box-shadow: none !important; }
          .cl-dot { width: 13px; height: 13px; font-size: 5pt; border-radius: 50%; border: 1px solid #cbd5e1; margin: 0 auto; }
          .cl-progress-bar { height: 4px; }
          .cl-stat-row { gap: 0.5rem !important; }
        }
      `}</style>

      {/* ══ NAV (hidden in print via global CSS) ══ */}
      <AppNavbar />

      {/* ══ PRINT-ONLY HEADER ══ */}
      <div className="cl-print-header" style={{ padding: "0 1rem" }}>
        <h1 style={{ fontSize: "14pt", fontWeight: 800, margin: "0 0 0.25rem 0", color: "#0f172a" }}>
          OJT Submission Checklist
        </h1>
        <div style={{ fontSize: "9pt", color: "#475569", display: "flex", gap: "2rem" }}>
          <span><strong>Professor:</strong> {user?.name ?? "—"}</span>
          <span><strong>Date Printed:</strong> {new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })}</span>
          <span><strong>Total Students:</strong> {filtered.length}</span>
        </div>
        <hr style={{ margin: "0.5rem 0", border: "none", borderTop: "1px solid #cbd5e1" }} />
      </div>

      {/* ══ MAIN ══ */}
      <main className="cl-main" style={{ maxWidth: 1600, margin: "0 auto", padding: "2.5rem 2rem", flex: 1, width: "100%" }}>

        {/* ── Header ── */}
        <RevealBox>
          <div className="cl-no-print" style={{ marginBottom: "2rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#0ea5e9" }} />
              <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                <span style={{ cursor: "pointer", textDecoration: "underline", textUnderlineOffset: "3px" }} onClick={() => router.push("/admin")}>Dashboard</span>
                <span style={{ margin: "0 0.4rem", color: "#cbd5e1" }}><IconChevron /></span>
                Submission Checklist
              </span>
            </div>
            <h1 style={{ fontSize: "2.25rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.25rem 0", letterSpacing: "-0.02em" }}>
              OJT Submission Checklist
            </h1>
            <p style={{ fontSize: "1rem", color: "#64748b", margin: 0, fontWeight: 500 }}>
              Track document submissions for all students. {TOTAL_REQUIRED_DOCS} required documents across {PHASE_ORDER.length} phases.
            </p>
          </div>
        </RevealBox>


        {/* ── Stats Row ── */}
        <div className="cl-stat-row cl-no-print" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
          <RevealBox delay={0.1}>
            <div className="cl-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                <div className="cl-stat-icon" style={{ background: "#eff6ff", color: "#3b82f6" }}><IconUsers /></div>
              </div>
              <h3 style={{ fontSize: "2rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.15rem 0" }}>
                {loading ? "…" : stats.total}
              </h3>
              <p style={{ fontSize: "0.82rem", color: "#64748b", margin: 0, fontWeight: 600 }}>Total Students</p>
            </div>
          </RevealBox>
          <RevealBox delay={0.2}>
            <div className="cl-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                <div className="cl-stat-icon" style={{ background: "#f0fdf4", color: "#16a34a" }}><IconCheckCircle /></div>
              </div>
              <h3 style={{ fontSize: "2rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.15rem 0" }}>
                {loading ? "…" : stats.complete}
              </h3>
              <p style={{ fontSize: "0.82rem", color: "#64748b", margin: 0, fontWeight: 600 }}>Complete</p>
            </div>
          </RevealBox>
          <RevealBox delay={0.3}>
            <div className="cl-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                <div className="cl-stat-icon" style={{ background: "#fef3c7", color: "#d97706" }}><IconAlertTriangle /></div>
              </div>
              <h3 style={{ fontSize: "2rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.15rem 0" }}>
                {loading ? "…" : stats.incomplete}
              </h3>
              <p style={{ fontSize: "0.82rem", color: "#64748b", margin: 0, fontWeight: 600 }}>Incomplete</p>
            </div>
          </RevealBox>
        </div>

        {/* ── Filter Bar ── */}
        <RevealBox delay={0.35}>
          <div className="cl-card cl-no-print" style={{ marginBottom: "2rem", padding: "1rem 1.25rem" }}>
            <div className="cl-filter-row" style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
              {/* Search */}
              <div style={{ position: "relative", flex: "1 1 220px" }}>
                <div style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }}>
                  <IconSearch />
                </div>
                <input
                  type="text"
                  placeholder="Search student name or email…"
                  className="cl-filter-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Company filter */}
              <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <div style={{ color: "#94a3b8" }}><IconFilter /></div>
                <select className="cl-select" value={companyFilter} onChange={(e) => setCompanyFilter(e.target.value)}>
                  <option value="all">All Companies</option>
                  {companies.map((c) => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
                </select>
              </div>

              {/* Status filter */}
              <select className="cl-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}>
                <option value="all">All Status</option>
                <option value="complete">✓ Complete</option>
                <option value="incomplete">⚠ Incomplete</option>
                <option value="none">○ No Submissions</option>
              </select>

              {/* Spacer */}
              <div style={{ flex: "1 0 0" }} />

              {/* Print */}
              <button className="cl-print-btn" onClick={handlePrint}>
                <IconPrinter /> Print Checklist
              </button>
            </div>

            {/* Active filter indicator */}
            {(searchQuery || companyFilter !== "all" || statusFilter !== "all") && (
              <div style={{ marginTop: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.78rem", color: "#64748b" }}>
                <span>Showing <strong style={{ color: "#0f172a" }}>{filtered.length}</strong> of {students.length} students</span>
                <button
                  onClick={() => { setSearchQuery(""); setCompanyFilter("all"); setStatusFilter("all"); }}
                  style={{
                    background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: "999px",
                    padding: "0.15rem 0.6rem", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer",
                  }}
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </RevealBox>

        {/* ── Legend ── */}
        <RevealBox delay={0.4}>
          <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap", marginBottom: "1rem", fontSize: "0.75rem", color: "#64748b" }}>
            {(["approved", "pending", "rejected", "none"] as DocStatus[]).map((s) => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <div className="cl-dot" style={{ width: 18, height: 18, background: STATUS_CFG[s].bg, color: STATUS_CFG[s].color }}>
                  <StatusIconSVG iconKey={STATUS_CFG[s].iconKey} />
                </div>
                <span style={{ fontWeight: 600 }}>{STATUS_CFG[s].label}</span>
              </div>
            ))}
          </div>
        </RevealBox>

        {/* ── Table ── */}
        <RevealBox delay={0.45}>
          {loading ? (
            <div className="cl-card" style={{ padding: "3rem", textAlign: "center", color: "#94a3b8" }}>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>⏳</div>
              Loading checklist data…
            </div>
          ) : error ? (
            <div className="cl-card" style={{ padding: "3rem", textAlign: "center", color: "#dc2626" }}>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>⚠</div>
              {error}
            </div>
          ) : filtered.length === 0 ? (
            <div className="cl-card" style={{ padding: "3rem", textAlign: "center", color: "#94a3b8" }}>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>🔍</div>
              {students.length === 0 ? "No students found." : "No students match the current filters."}
            </div>
          ) : (
            <div className="cl-table-wrap">
              <table className="cl-table">
                <thead>
                  {/* Phase group row */}
                  <tr>
                    <th className="cl-th-name cl-sticky" rowSpan={2}>Student</th>
                    <th className="cl-th-company cl-sticky" rowSpan={2}>Company</th>
                    <th className="cl-th-progress cl-sticky" rowSpan={2}>Progress</th>
                    {PHASE_ORDER.map((phase) => {
                      const docs = getDocumentsByPhase(phase);
                      if (docs.length === 0) return null;
                      const pc = PHASE_COLORS[phase];
                      return (
                        <th
                          key={phase}
                          colSpan={docs.length}
                          className="cl-phase-header"
                          style={{ background: pc.bg, color: pc.color, borderBottomColor: pc.border }}
                        >
                          {PHASE_LABELS[phase]} ({docs.length})
                        </th>
                      );
                    })}
                  </tr>
                  {/* Document name row */}
                  <tr>
                    {PHASE_ORDER.map((phase) =>
                      getDocumentsByPhase(phase).map((doc, i, arr) => (
                        <th
                          key={doc.id}
                          title={doc.title + (doc.required === false ? " (Optional)" : "")}
                          style={{
                            borderRight: i === arr.length - 1 ? "2px solid #94a3b8" : "1px solid #e2e8f0",
                            fontSize: "0.72rem",
                            padding: "0.5rem 0.4rem",
                            fontStyle: doc.required === false ? "italic" : "normal",
                            color: doc.required === false ? "#94a3b8" : "inherit"
                          }}
                        >
                          {doc.shortTitle}
                        </th>
                      ))
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((student, idx) => {
                    const submitted = countSubmitted(student.documents);
                    const pct = Math.round((submitted / TOTAL_REQUIRED_DOCS) * 100);
                    const isComplete = submitted >= TOTAL_REQUIRED_DOCS;
                    return (
                      <tr key={student.id}>
                        <td className="cl-td-name cl-sticky">
                          <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.9rem", lineHeight: 1.3 }}>{student.name}</div>
                          <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.1rem" }}>{student.email}</div>
                        </td>
                        <td className="cl-td-company cl-sticky" style={{ fontSize: "0.82rem", color: "#475569", fontWeight: 500 }}>
                          {student.company?.name ?? <span style={{ color: "#cbd5e1", fontStyle: "italic" }}>Not assigned</span>}
                        </td>
                        <td className="cl-td-progress cl-sticky">
                          <div style={{ fontSize: "0.8rem", fontWeight: 700, color: isComplete ? "#16a34a" : "#0f172a" }}>
                            {submitted}/{TOTAL_REQUIRED_DOCS}
                          </div>
                          <div className="cl-progress-bar">
                            <div
                              className="cl-progress-fill"
                              style={{
                                width: `${pct}%`,
                                background: isComplete
                                  ? "linear-gradient(90deg, #22c55e, #16a34a)"
                                  : pct > 50
                                  ? "linear-gradient(90deg, #0ea5e9, #0d9488)"
                                  : pct > 0
                                  ? "linear-gradient(90deg, #f59e0b, #d97706)"
                                  : "#e2e8f0",
                              }}
                            />
                          </div>
                        </td>
                        {PHASE_ORDER.map((phase) =>
                          getDocumentsByPhase(phase).map((doc, i, arr) => {
                            const status = getDocStatus(student.documents, doc);
                            const cfg = STATUS_CFG[status];
                            return (
                              <td
                                key={doc.id}
                                title={`${doc.title}: ${cfg.label}`}
                                style={{ borderRight: i === arr.length - 1 ? "2px solid #94a3b8" : "1px solid #f1f5f9" }}
                              >
                                {doc.required === false && status === "none" ? (
                                  <div style={{ color: "#94a3b8", fontSize: "0.65rem", fontWeight: 700, fontStyle: "italic" }}>OPTIONAL</div>
                                ) : (
                                  <div className="cl-dot" style={{ background: cfg.bg, color: cfg.color, margin: "0 auto" }}>
                                    <StatusIconSVG iconKey={cfg.iconKey} />
                                  </div>
                                )}
                              </td>
                            );
                          })
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </RevealBox>

        {/* ── Summary Footer ── */}
        {!loading && !error && filtered.length > 0 && (
          <RevealBox delay={0.5}>
            <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem", fontSize: "0.82rem", color: "#64748b" }}>
              <span>
                Showing <strong style={{ color: "#0f172a" }}>{filtered.length}</strong> student{filtered.length !== 1 ? "s" : ""} •{" "}
                <strong style={{ color: "#16a34a" }}>{stats.complete}</strong> complete •{" "}
                <strong style={{ color: "#d97706" }}>{stats.incomplete}</strong> incomplete
              </span>
              <span style={{ fontSize: "0.75rem", color: "#cbd5e1" }}>
                {TOTAL_REQUIRED_DOCS} required documents
              </span>
            </div>
          </RevealBox>
        )}

        {/* ── Abbreviations Key ── */}
        <RevealBox delay={0.48}>
          <div className="cl-card cl-no-print" style={{ marginTop: "2.5rem", overflow: "hidden" }}>
            <button 
              onClick={() => setLegendOpen(!legendOpen)}
              style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", background: "none", border: "none", padding: 0, cursor: "pointer" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: 32, height: 32, borderRadius: "0.75rem", background: "#f1f5f9", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <IconCheckCircle />
                </div>
                <h4 style={{ margin: 0, color: "#0f172a", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 800 }}>
                  Abbreviations Legend
                </h4>
              </div>
              <div style={{ color: "#64748b", transform: legendOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s" }}>
                <IconChevron />
              </div>
            </button>
            <div style={{ 
              display: "grid", gridTemplateRows: legendOpen ? "1fr" : "0fr",
              transition: "grid-template-rows 0.3s ease-out" 
            }}>
              <div style={{ overflow: "hidden" }}>
                <div style={{ paddingTop: "1.25rem", marginTop: "1.25rem", borderTop: "1px solid #e2e8f0", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "0.75rem", fontSize: "0.8rem", color: "#64748b" }}>
                  {REQUIRED_DOCUMENTS.map(d => (
                    <div key={d.id}><strong style={{ color: "#475569" }}>{d.shortTitle}</strong> = {d.title}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Print-only legend */}
          <div className="cl-print-legend" style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid #e2e8f0", fontSize: "0.7rem", color: "#64748b" }}>
            <h4 style={{ margin: "0 0 0.5rem 0", color: "#0f172a", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Abbreviations Legend</h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.5rem" }}>
              {REQUIRED_DOCUMENTS.map(d => (
                <div key={d.id}><strong style={{ color: "#475569" }}>{d.shortTitle}</strong> = {d.title}</div>
              ))}
            </div>
          </div>
        </RevealBox>

      </main>
    </div>
    </ProtectedRoute>
  );
}
