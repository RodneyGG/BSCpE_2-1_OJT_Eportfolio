"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "../../lib/api";
import DocumentViewerModal from "./DocumentViewerModal";

interface PendingDocument {
  id: number;
  document_type: string;
  file_link: string;
  status: string;
  created_at: string;
  claimed_hours: string | null;
  user: {
    id: number;
    name: string;
    email: string;
    hours_rendered: string | null;
  };
}

interface PendingApprovalsSectionProps {
  onCountChange?: (count: number) => void;
}

function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatHours(value: string | null): string {
  if (value === null || value === undefined) return "0.00";
  const num = parseFloat(value);
  return Number.isNaN(num) ? "0.00" : num.toFixed(2);
}

function IconCheck() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function IconX() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

export default function PendingApprovalSection({ onCountChange }: PendingApprovalsSectionProps) {
  const [documents, setDocuments] = useState<PendingDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [confirmingApproveId, setConfirmingApproveId] = useState<number | null>(null);
  const [viewingDoc, setViewingDoc] = useState<PendingDocument | null>(null);

  const loadPending = () => {
    setLoading(true);
    setError(null);
    fetchApi("/documents/pending")
      .then((data: any) => setDocuments(data.documents?.data || data.documents || []))
      .catch((err: { status?: number }) => {
        if (err.status === 403) {
          setForbidden(true);
        } else {
          setError("Failed to load pending documents.");
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPending();
  }, []);

  useEffect(() => {
    onCountChange?.(documents.length);
  }, [documents, onCountChange]);

  useEffect(() => {
    if (forbidden) {
      onCountChange?.(0);
    }
  }, [forbidden, onCountChange]);

  const doApprove = async (id: number) => {
    setProcessingId(id);
    try {
      await fetchApi(`/documents/${id}/review`, {
        method: "PATCH",
        body: JSON.stringify({ status: "approved" }),
      });
      setDocuments((docs) => docs.filter((d) => d.id !== id));
      setConfirmingApproveId(null);
    } catch {
      alert("Failed to approve document. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleApproveClick = (doc: PendingDocument) => {
    if (doc.document_type === "dtr") {
      setRejectingId(null);
      setConfirmingApproveId(doc.id);
    } else {
      doApprove(doc.id);
    }
  };

  const openReject = (id: number) => {
    setConfirmingApproveId(null);
    setRejectingId(id);
    setRejectReason("");
  };

  const submitReject = async () => {
    if (!rejectingId) return;
    if (!rejectReason.trim()) {
      alert("Please provide a reason for rejection.");
      return;
    }
    setProcessingId(rejectingId);
    try {
      await fetchApi(`/documents/${rejectingId}/review`, {
        method: "PATCH",
        body: JSON.stringify({ status: "rejected", reason: rejectReason.trim() }),
      });
      setDocuments((docs) => docs.filter((d) => d.id !== rejectingId));
      setRejectingId(null);
    } catch {
      alert("Failed to reject document. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  if (forbidden) return null;

  return (
    <>
      <div className="admin-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>Pending Approvals</h2>
          {!loading && documents.length > 0 && (
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#ef4444", background: "#fee2e2", padding: "0.2rem 0.6rem", borderRadius: "999px" }}>
              {documents.length} awaiting review
            </span>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>Loading...</div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "#ef4444" }}>{error}</div>
        ) : documents.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "#94a3b8", fontSize: "0.9rem" }}>
            Nothing pending right now.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {documents.map((doc) => {
              const isDtr = doc.document_type === "dtr";
              return (
                <div key={doc.id} style={{ border: "1px solid #e2e8f0", borderRadius: "1rem", padding: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a" }}>{doc.document_type}</div>
                      <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.2rem" }}>
                        <span style={{ fontWeight: 600, color: "#475569" }}>{doc.user.name}</span> • {timeAgo(doc.created_at)}
                      </div>
                      {isDtr && (
                        <div style={{ fontSize: "0.78rem", color: "#0f172a", marginTop: "0.35rem", fontWeight: 600 }}>
                          Claiming {formatHours(doc.claimed_hours)} hrs
                          <span style={{ fontWeight: 500, color: "#64748b" }}>
                            {" "}(current total: {formatHours(doc.user.hours_rendered)} hrs)
                          </span>
                        </div>
                      )}
                      <button
                        onClick={() => setViewingDoc(doc)}
                        style={{
                          fontSize: "0.78rem", color: "#3b82f6", fontWeight: 600,
                          background: "none", border: "none", padding: 0, cursor: "pointer",
                          display: "inline-block", marginTop: "0.4rem", textDecoration: "none",
                        }}
                      >
                        View document →
                      </button>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                      <button
                        className="btn-action btn-approve"
                        disabled={processingId === doc.id}
                        onClick={() => handleApproveClick(doc)}
                        style={{ opacity: processingId === doc.id ? 0.6 : 1 }}
                      >
                        <IconCheck /> Approve
                      </button>
                      <button
                        className="btn-action"
                        disabled={processingId === doc.id}
                        onClick={() => openReject(doc.id)}
                        style={{ background: "#fee2e2", borderColor: "#fecaca", color: "#991b1b", opacity: processingId === doc.id ? 0.6 : 1 }}
                      >
                        <IconX /> Reject
                      </button>
                    </div>
                  </div>

                  {confirmingApproveId === doc.id && (
                    <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #e2e8f0" }}>
                      <div style={{ fontSize: "0.85rem", color: "#0f172a", marginBottom: "0.75rem" }}>
                        Approving will set <span style={{ fontWeight: 600 }}>{doc.user.name}</span>&apos;s total hours:
                        <div style={{ marginTop: "0.4rem", display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 700 }}>
                          <span style={{ color: "#64748b" }}>{formatHours(doc.user.hours_rendered)} hrs</span>
                          <span style={{ color: "#94a3b8" }}>→</span>
                          <span style={{ color: "#16a34a" }}>{formatHours(doc.claimed_hours)} hrs</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                        <button className="btn-action" onClick={() => setConfirmingApproveId(null)}>
                          Cancel
                        </button>
                        <button
                          className="btn-action btn-approve"
                          disabled={processingId === doc.id}
                          onClick={() => doApprove(doc.id)}
                        >
                          Confirm Approve
                        </button>
                      </div>
                    </div>
                  )}

                  {rejectingId === doc.id && (
                    <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #e2e8f0" }}>
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Reason for rejection (required)..."
                        rows={2}
                        style={{ width: "100%", padding: "0.6rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1", fontSize: "0.85rem", fontFamily: "inherit", resize: "vertical", boxSizing: "border-box" }}
                      />
                      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem", justifyContent: "flex-end" }}>
                        <button className="btn-action" onClick={() => setRejectingId(null)}>
                          Cancel
                        </button>
                        <button
                          className="btn-action"
                          style={{ background: "#fee2e2", borderColor: "#fecaca", color: "#991b1b" }}
                          disabled={processingId === doc.id}
                          onClick={submitReject}
                        >
                          Confirm Reject
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {viewingDoc && (
        <DocumentViewerModal
          title={`${viewingDoc.document_type} — ${viewingDoc.user.name}`}
          fileLink={viewingDoc.file_link}
          onClose={() => setViewingDoc(null)}
        />
      )}
    </>
  );
}