"use client";

import { useState } from "react";
import { fetchApi } from "../../lib/api";
import DocumentViewerModal from "./DocumentViewerModal";

export interface ReviewableDocument {
  id: number;
  document_type: string;
  file_link: string;
  status: string;
  created_at: string;
  claimed_hours: string | null;
  user?: {
    id: number;
    name: string;
    email?: string;
    hours_rendered: string | null;
  };
}

interface DocumentReviewListProps {
  documents: ReviewableDocument[];
  onDocumentsChange: (updater: (docs: ReviewableDocument[]) => ReviewableDocument[]) => void;
  fallbackUser?: { name: string; hours_rendered: string | null };
  emptyMessage?: string;
  showUserName?: boolean;
  onAfterAction?: (doc: ReviewableDocument, action: "approved" | "rejected") => void;
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

function formatHours(value: string | null | undefined): string {
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

const baseBtn: React.CSSProperties = {
  border: "1px solid #cbd5e1", borderRadius: "0.5rem",
  padding: "0.4rem 0.8rem", fontSize: "0.75rem", fontWeight: 600, color: "#475569",
  cursor: "pointer", transition: "all 0.2s", display: "inline-flex", alignItems: "center", gap: "0.3rem",
  background: "white",
};
const approveBtn: React.CSSProperties = { ...baseBtn, background: "#dcfce7", borderColor: "#bbf7d0", color: "#166534" };
const rejectBtn: React.CSSProperties = { ...baseBtn, background: "#fee2e2", borderColor: "#fecaca", color: "#991b1b" };

export default function DocumentReviewList({
  documents,
  onDocumentsChange,
  fallbackUser,
  emptyMessage = "Nothing pending right now.",
  showUserName = true,
  onAfterAction,
}: DocumentReviewListProps) {
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [confirmingApproveId, setConfirmingApproveId] = useState<number | null>(null);
  const [viewingDoc, setViewingDoc] = useState<ReviewableDocument | null>(null);

  const doApprove = async (id: number) => {
    setProcessingId(id);
    try {
      await fetchApi(`/documents/${id}/review`, {
        method: "PATCH",
        body: JSON.stringify({ status: "approved" }),
      });
      const targetDoc = documents.find(d => d.id === id);
      onDocumentsChange((docs) => docs.filter((d) => d.id !== id));
      if (onAfterAction && targetDoc) onAfterAction(targetDoc, "approved");
      setConfirmingApproveId(null);
    } catch {
      alert("Failed to approve document. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleApproveClick = (doc: ReviewableDocument) => {
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
      const targetDoc = documents.find(d => d.id === rejectingId);
      onDocumentsChange((docs) => docs.filter((d) => d.id !== rejectingId));
      if (onAfterAction && targetDoc) onAfterAction(targetDoc, "rejected");
      setRejectingId(null);
    } catch {
      alert("Failed to reject document. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  if (documents.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "2rem", color: "#94a3b8", fontSize: "0.9rem" }}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {documents.map((doc) => {
          const isDtr = doc.document_type === "dtr";
          const userName = doc.user?.name ?? fallbackUser?.name ?? "";
          const userHours = doc.user?.hours_rendered ?? fallbackUser?.hours_rendered ?? null;
          const isProcessing = processingId === doc.id;
          return (
            <div key={doc.id} style={{ border: "1px solid #e2e8f0", borderRadius: "1rem", padding: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a" }}>{doc.document_type}</div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.2rem" }}>
                    {showUserName && userName && (
                      <>
                        <span style={{ fontWeight: 600, color: "#475569" }}>{userName}</span> •{" "}
                      </>
                    )}
                    {timeAgo(doc.created_at)}
                  </div>
                  {isDtr && (
                    <div style={{ fontSize: "0.78rem", color: "#0f172a", marginTop: "0.35rem", fontWeight: 600 }}>
                      Claiming {formatHours(doc.claimed_hours)} hrs
                      <span style={{ fontWeight: 500, color: "#64748b" }}>
                        {" "}(current total: {formatHours(userHours)} hrs)
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
                    disabled={isProcessing}
                    onClick={() => handleApproveClick(doc)}
                    style={{ ...approveBtn, opacity: isProcessing ? 0.6 : 1 }}
                  >
                    <IconCheck /> Approve
                  </button>
                  <button
                    disabled={isProcessing}
                    onClick={() => openReject(doc.id)}
                    style={{ ...rejectBtn, opacity: isProcessing ? 0.6 : 1 }}
                  >
                    <IconX /> Reject
                  </button>
                </div>
              </div>

              {confirmingApproveId === doc.id && (
                <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: "0.85rem", color: "#0f172a", marginBottom: "0.75rem" }}>
                    Approving will set {userName && <span style={{ fontWeight: 600 }}>{userName}&apos;s </span>}total hours:
                    <div style={{ marginTop: "0.4rem", display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 700 }}>
                      <span style={{ color: "#64748b" }}>{formatHours(userHours)} hrs</span>
                      <span style={{ color: "#94a3b8" }}>→</span>
                      <span style={{ color: "#16a34a" }}>{formatHours(doc.claimed_hours)} hrs</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                    <button style={baseBtn} onClick={() => setConfirmingApproveId(null)}>
                      Cancel
                    </button>
                    <button
                      style={{ ...approveBtn, opacity: isProcessing ? 0.6 : 1 }}
                      disabled={isProcessing}
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
                    <button style={baseBtn} onClick={() => setRejectingId(null)}>
                      Cancel
                    </button>
                    <button
                      style={{ ...rejectBtn, opacity: isProcessing ? 0.6 : 1 }}
                      disabled={isProcessing}
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

      {viewingDoc && (
        <DocumentViewerModal
          title={
            showUserName && viewingDoc.user?.name
              ? `${viewingDoc.document_type} — ${viewingDoc.user.name}`
              : viewingDoc.document_type
          }
          fileLink={viewingDoc.file_link}
          onClose={() => setViewingDoc(null)}
        />
      )}
    </>
  );
}
