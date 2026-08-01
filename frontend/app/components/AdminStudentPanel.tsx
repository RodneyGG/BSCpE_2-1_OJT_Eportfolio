"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "../../lib/api";
import DocumentReviewList, { ReviewableDocument } from "./DocumentReviewList";

interface StudentCompany {
  id: number;
  name: string;
}

interface AdminStudentListItem {
  id: number;
  name: string;
  email?: string;
  company: StudentCompany | null;
  hours_rendered: string | null;
  required_hours: number | null;
  is_active?: boolean;
  approved_documents_count?: number;
  pending_documents_count?: number;
  rejected_documents_count?: number;
}

interface DetailDocument {
  id: number;
  document_type: string;
  claimed_hours: string | null;
  file_link: string;
  status: "pending" | "approved" | "rejected" | string;
  rejection_reason: string | null;
  created_at: string;
}

// Confirmed via curl against GET /admin/users/{id} — bare object, no wrapper.
interface AdminStudentFullDetail {
  phone: string | null;
  program: string | null;
  ojt_role: string | null;
  ojt_supervisor: string | null;
  documents: DetailDocument[];
}

function formatHours(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "0.00";
  const num = typeof value === "number" ? value : parseFloat(value);
  return Number.isNaN(num) ? "0.00" : num.toFixed(2);
}

function IconX() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

export default function AdminStudentPanel({
  student,
  onClose,
}: {
  student: AdminStudentListItem;
  onClose: () => void;
}) {
  const [detail, setDetail] = useState<AdminStudentFullDetail | null>(null);
  const [detailError, setDetailError] = useState(false);

  // Optimistic local override for the summary "Hours Rendered" block.
  // `student.hours_rendered` comes from the parent roster list (stale once
  // a DTR is approved from inside this panel — the parent doesn't refetch
  // until the list itself reloads). DocumentReviewList's approve dialog
  // already treats `claimed_hours` on a DTR as the new absolute total
  // (see its confirm-approve preview: current -> claimed_hours), so we
  // reuse that same assumption here rather than re-deriving it.
  const [renderedHoursOverride, setRenderedHoursOverride] = useState<string | null>(null);

  useEffect(() => {
    fetchApi(`/admin/users/${student.id}`)
      .then((data: AdminStudentFullDetail) => setDetail(data))
      .catch(() => setDetailError(true));
  }, [student.id]);

  const rendered = parseFloat(renderedHoursOverride ?? student.hours_rendered ?? "0");
  const required = typeof student.required_hours === "number" ? student.required_hours : 0;
  const isComplete = required > 0 && rendered >= required;

  const pendingDocs = detail?.documents.filter((d) => d.status === "pending") ?? [];

  // DocumentReviewList only knows "remove this id from the list" — it can't
  // tell us whether that removal was an approve or a reject. To keep the
  // hours summary in sync we diff before/after ourselves: if the doc that
  // disappeared was a DTR, we treat its claimed_hours as the new total.
  // NOTE: this is still ambiguous for a rejected DTR — see caveat below.
  const handleDocumentsChange = (
    updater: (docs: ReviewableDocument[]) => ReviewableDocument[]
  ) => {
    setDetail((prev) => {
      if (!prev) return prev;
      const beforeIds = new Set(prev.documents.filter((d) => d.status === "pending").map((d) => d.id));

      const beforePending = prev.documents.filter((d) => d.status === "pending") as unknown as ReviewableDocument[];
      const afterPending = updater(beforePending);
      const afterIds = new Set(afterPending.map((d) => d.id));
      const removedId = [...beforeIds].find((id) => !afterIds.has(id));

      let nextDocuments = prev.documents;
      if (removedId !== undefined) {
        const removedDoc = prev.documents.find((d) => d.id === removedId);
        nextDocuments = prev.documents.map((d) =>
          d.id === removedId ? { ...d, status: "reviewed" } : d
        );
        if (removedDoc && removedDoc.document_type === "dtr") {
          setRenderedHoursOverride(removedDoc.claimed_hours);
        }
      }
      return { ...prev, documents: nextDocuments };
    });
  };

  return (
    <div
      style={{
        position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
        background: "rgba(15, 23, 42, 0.5)", zIndex: 100, display: "flex", justifyContent: "flex-end",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white", width: "100%", maxWidth: "480px", height: "100%",
          overflowY: "auto", boxShadow: "-10px 0 30px rgba(0,0,0,0.15)",
          display: "flex", flexDirection: "column", animation: "slideIn 0.2s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @keyframes slideIn {
            from { transform: translateX(100%); }
            to   { transform: translateX(0); }
          }
        `}</style>

        <div style={{ padding: "1.75rem 2rem", borderBottom: "1px solid #e2e8f0", background: "#f8fafc", display: "flex", gap: "1rem", alignItems: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&size=100&background=random&color=fff&bold=true`}
            alt={student.name}
            style={{ width: 64, height: 64, borderRadius: "50%", border: "3px solid white", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", flexShrink: 0 }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800, color: "#0f172a" }}>{student.name}</h2>
            <p style={{ margin: "0.15rem 0 0", color: "#64748b", fontSize: "0.82rem", fontWeight: 500 }}>{student.email ?? ""}</p>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: "0.4rem", borderRadius: "50%", flexShrink: 0 }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
          >
            <IconX />
          </button>
        </div>

        <div style={{ padding: "2rem", flex: 1 }}>
          <h3 style={{ fontSize: "0.75rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
            General Info
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.75rem", fontSize: "0.85rem" }}>
            <div>
              <span style={{ color: "#94a3b8" }}>Phone</span>
              <div style={{ color: "#0f172a", fontWeight: 600 }}>{detail?.phone || (detailError ? "—" : "…")}</div>
            </div>
            <div>
              <span style={{ color: "#94a3b8" }}>Program</span>
              <div style={{ color: "#0f172a", fontWeight: 600 }}>{detail?.program || (detailError ? "—" : "…")}</div>
            </div>
          </div>

          <h3 style={{ fontSize: "0.75rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
            Deployment Details
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.75rem", fontSize: "0.85rem" }}>
            <div>
              <span style={{ color: "#94a3b8" }}>Company</span>
              <div style={{ color: "#0f172a", fontWeight: 600 }}>{student.company?.name || "—"}</div>
            </div>
            <div>
              <span style={{ color: "#94a3b8" }}>Role</span>
              <div style={{ color: "#0f172a", fontWeight: 600 }}>{detail?.ojt_role || (detailError ? "—" : "…")}</div>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <span style={{ color: "#94a3b8" }}>Supervisor</span>
              <div style={{ color: "#0f172a", fontWeight: 600 }}>{detail?.ojt_supervisor || (detailError ? "—" : "…")}</div>
            </div>
          </div>

          <h3 style={{ fontSize: "0.75rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
            Hours Rendered
          </h3>
          <div style={{ background: "#f8fafc", borderRadius: "1rem", padding: "1rem", marginBottom: "1.75rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#0f172a" }}>
              {formatHours(renderedHoursOverride ?? student.hours_rendered)}{" "}
              <span style={{ color: "#64748b", fontWeight: 500 }}>/ {formatHours(student.required_hours)} hrs</span>
            </div>
            <span
              style={{
                padding: "0.2rem 0.75rem", borderRadius: "999px", fontSize: "0.72rem", fontWeight: 700,
                color: isComplete ? "#166534" : "#92400e", background: isComplete ? "#dcfce7" : "#fef3c7",
              }}
            >
              {isComplete ? "Complete" : "In Progress"}
            </span>
          </div>

          <h3 style={{ fontSize: "0.75rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
            Pending Documents
          </h3>
          {detailError ? (
            <div style={{ border: "1px dashed #cbd5e1", borderRadius: "1rem", padding: "1.25rem", textAlign: "center", color: "#94a3b8", fontSize: "0.85rem" }}>
              Couldn&apos;t load documents.
            </div>
          ) : !detail ? (
            <div style={{ border: "1px dashed #cbd5e1", borderRadius: "1rem", padding: "1.25rem", textAlign: "center", color: "#94a3b8", fontSize: "0.85rem" }}>
              Loading...
            </div>
          ) : (
            <DocumentReviewList
              documents={pendingDocs as unknown as ReviewableDocument[]}
              onDocumentsChange={handleDocumentsChange}
              fallbackUser={{ name: student.name, hours_rendered: renderedHoursOverride ?? student.hours_rendered }}
              showUserName={false}
              emptyMessage="Nothing pending for this student right now."
            />
          )}
        </div>
      </div>
    </div>
  );
}
