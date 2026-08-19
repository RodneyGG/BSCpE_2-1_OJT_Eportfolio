"use client";

import { useState, useEffect } from "react";
import { fetchApi } from "../../lib/api";

/* ═══════════════════════════ Types ═══════════════════════════ */
interface CatalogEntry {
  id: string;
  title: string;
  type: string;
  icon: string;
  color: string;
  bgColor: string;
  description: string;
  matchAlias?: string;
}

interface RealDocument {
  id: number;
  document_type: string;
  file_id: string;
  file_link: string;
  status: "pending" | "approved" | "rejected";
  reviewed_by: number | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  reviewer?: { id: number; name: string } | null;
}

/* ═══════════════════════════ Catalog (icons/descriptions only — not upload data) ═══ */
const CATALOG: CatalogEntry[] = [
  {
    id: "endorsement-letter",
    title: "Endorsement Letter",
    type: "PDF",
    icon: "📄",
    color: "#0284c7",
    bgColor: "#e0f2fe",
    description: "Official endorsement letter from the school registrar",
  },
  {
    id: "moa",
    title: "Memorandum of Agreement",
    type: "PDF",
    icon: "📋",
    color: "#0f766e",
    bgColor: "#ccfbf1",
    description: "Signed MOA between school and OJT company",
  },
  {
    id: "waiver",
    title: "Parental Consent / Waiver",
    type: "PDF",
    icon: "✍️",
    color: "#0284c7",
    bgColor: "#e0f2fe",
    description: "Signed parental consent and liability waiver form",
  },
  {
    id: "daily-time-record",
    title: "Daily Time Record",
    type: "PDF",
    icon: "📅",
    color: "#0f766e",
    bgColor: "#ccfbf1",
    description: "Compiled daily time records for all OJT hours",
  },
  {
    id: "completion-cert",
    title: "Certificate of Completion",
    type: "PDF",
    icon: "🏆",
    color: "#b45309",
    bgColor: "#fef3c7",
    description: "Certificate issued by the company upon OJT completion",
  },
  {
    id: "evaluation-form",
    title: "Performance Evaluation",
    type: "PDF",
    icon: "⭐",
    color: "#0284c7",
    bgColor: "#e0f2fe",
    description: "Final performance evaluation form from supervisor",
  },
  {
    id: "narrative-report",
    title: "Portfolio",
    matchAlias: "Narrative Report",
    type: "DOCX",
    icon: "📝",
    color: "#0f766e",
    bgColor: "#ccfbf1",
    description: "Comprehensive portfolio of OJT experience",
  },
  {
    id: "photo-documentation",
    title: "Photo Documentation",
    type: "ZIP",
    icon: "📸",
    color: "#7c3aed",
    bgColor: "#ede9fe",
    description: "Photo documentation of tasks and activities",
  },
];

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  approved: { bg: "#dcfce7", color: "#15803d", label: "Approved" },
  pending: { bg: "#fef9c3", color: "#a16207", label: "Pending Review" },
  rejected: { bg: "#fee2e2", color: "#b91c1c", label: "Rejected" },
  none: { bg: "#f1f5f9", color: "#64748b", label: "Not Uploaded" },
};

/* Normalize for loose matching between catalog titles and free-typed document_type values */
function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export default function DocumentsSection() {
  const [myDocs, setMyDocs] = useState<RealDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchApi("/documents/mine")
      .then((data: { documents: RealDocument[] }) => {
        setMyDocs(data.documents || []);
      })
      .catch((err: unknown) => {
        console.error("Failed to load documents:", err);
        setError("Could not load your documents right now.");
      })
      .finally(() => setLoading(false));
  }, []);

  // Match each catalog entry to the most recent upload of that type, if any
  const catalogWithStatus = CATALOG.map((entry) => {
    const matches = myDocs.filter(
      (d) => normalize(d.document_type) === normalize(entry.title) || (entry.matchAlias && normalize(d.document_type) === normalize(entry.matchAlias)) || normalize(d.document_type) === normalize(entry.id)
    );
    const latest = matches.length > 0 ? matches[0] : null; // myDocs is already newest-first
    return { entry, latest };
  });

  // Any uploaded documents that didn't match a catalog title at all —
  // surfaced separately so nothing the student uploaded is ever hidden
  const matchedIds = new Set(
    catalogWithStatus.filter((c) => c.latest).map((c) => c.latest!.id)
  );
  const unmatchedDocs = myDocs.filter((d) => !matchedIds.has(d.id));

  return (
    <section
      id="documents"
      className="section"
      style={{ backgroundColor: "var(--color-surface)" }}
    >
      <div className="section-inner">
        {/* Header */}
        <div style={{ marginBottom: "3rem" }}>
          <span className="section-label">Documents</span>
          <h2 className="section-title">OJT Requirements & Files</h2>
          <div className="divider" />
          <p className="section-subtitle">
            All official OJT documents, certificates, and records compiled and
            organized for easy reference and submission.
          </p>
        </div>

        {error && (
          <div
            style={{
              marginBottom: "1.5rem",
              padding: "1rem 1.25rem",
              background: "#fee2e2",
              border: "1px solid #fecaca",
              borderRadius: "var(--radius-lg)",
              color: "#b91c1c",
              fontSize: "0.85rem",
            }}
          >
            {error}
          </div>
        )}

        {/* Documents Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {catalogWithStatus.map(({ entry, latest }) => {
            const status = loading ? null : latest ? latest.status : "none";
            const statusStyle = status ? STATUS_STYLES[status] : null;

            return (
              <div
                key={entry.id}
                id={`doc-${entry.id}`}
                className="card"
                style={{
                  padding: "1.5rem",
                  cursor: latest ? "pointer" : "default",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
                onClick={() => {
                  if (latest?.file_link) {
                    window.open(latest.file_link, "_blank", "noopener,noreferrer");
                  }
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "var(--radius-lg)",
                    background: entry.bgColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.4rem",
                  }}
                >
                  {entry.icon}
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: 700,
                      color: "var(--color-text-primary)",
                      marginBottom: "0.25rem",
                      lineHeight: 1.3,
                    }}
                  >
                    {entry.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "0.78rem",
                      color: "var(--color-text-muted)",
                      lineHeight: 1.5,
                    }}
                  >
                    {entry.description}
                  </p>
                  {latest?.status === "rejected" && latest.rejection_reason && (
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "#b91c1c",
                        lineHeight: 1.5,
                        marginTop: "0.4rem",
                        fontStyle: "italic",
                      }}
                    >
                      Reason: {latest.rejection_reason}
                    </p>
                  )}
                </div>

                {/* Footer */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: "0.5rem",
                    borderTop: "1px solid var(--color-border)",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      padding: "0.2rem 0.55rem",
                      borderRadius: "var(--radius-full)",
                      background: loading ? "#f1f5f9" : statusStyle!.bg,
                      color: loading ? "#94a3b8" : statusStyle!.color,
                      letterSpacing: "0.04em",
                    }}
                  >
                    {loading ? "Loading..." : statusStyle!.label}
                  </span>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      padding: "0.2rem 0.55rem",
                      borderRadius: "var(--radius-full)",
                      background: "#f1f5f9",
                      color: "var(--color-text-muted)",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {entry.type}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Uploaded documents that didn't match any catalog entry —
              e.g. document_type values typed freely on the upload form
              that drifted from this catalog's titles (like "Resume / CV") */}
          {unmatchedDocs.map((doc) => {
            const statusStyle = STATUS_STYLES[doc.status];
            return (
              <div
                key={doc.id}
                className="card"
                style={{
                  padding: "1.5rem",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                  border: "1px dashed #cbd5e1",
                }}
                onClick={() => window.open(doc.file_link, "_blank", "noopener,noreferrer")}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "var(--radius-lg)",
                    background: "#f1f5f9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.4rem",
                  }}
                >
                  📎
                </div>
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: 700,
                      color: "var(--color-text-primary)",
                      marginBottom: "0.25rem",
                      lineHeight: 1.3,
                    }}
                  >
                    {doc.document_type}
                  </h3>
                  <p
                    style={{
                      fontSize: "0.78rem",
                      color: "var(--color-text-muted)",
                      lineHeight: 1.5,
                    }}
                  >
                    Uploaded document not in the standard requirements list.
                  </p>
                  {doc.status === "rejected" && doc.rejection_reason && (
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "#b91c1c",
                        lineHeight: 1.5,
                        marginTop: "0.4rem",
                        fontStyle: "italic",
                      }}
                    >
                      Reason: {doc.rejection_reason}
                    </p>
                  )}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: "0.5rem",
                    borderTop: "1px solid var(--color-border)",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      padding: "0.2rem 0.55rem",
                      borderRadius: "var(--radius-full)",
                      background: statusStyle.bg,
                      color: statusStyle.color,
                      letterSpacing: "0.04em",
                    }}
                  >
                    {statusStyle.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Note */}
        <div
          style={{
            marginTop: "2.5rem",
            padding: "1.25rem 1.5rem",
            background: "#f0f9ff",
            border: "1px solid #bae6fd",
            borderRadius: "var(--radius-xl)",
            display: "flex",
            alignItems: "flex-start",
            gap: "0.75rem",
          }}
        >
          <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>ℹ️</span>
          <p
            style={{
              fontSize: "0.85rem",
              color: "var(--color-text-secondary)",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Click a document card to view or download the uploaded file. Cards
            without an upload yet will show &ldquo;Not Uploaded&rdquo;.
          </p>
        </div>
      </div>
    </section>
  );
}