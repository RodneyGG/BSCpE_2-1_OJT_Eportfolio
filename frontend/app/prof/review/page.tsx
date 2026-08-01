"use client";

import { useState, useEffect } from "react";
import AppNavbar from "../../components/AppNavbar";
import ProtectedRoute from "../../components/ProtectedRoute";
import { fetchApi } from "../../../lib/api";

interface CompanyInfo {
  id: number;
  name: string;
}

interface UserInfo {
  id: number;
  name: string;
  email: string;
  company?: CompanyInfo | null;
  phone?: string | null;
  program?: string | null;
  hours_rendered?: string | null;
  required_hours?: number | null;
}

interface PendingDocument {
  id: number;
  document_type: string;
  file_link: string;
  created_at: string;
  user: UserInfo;
  claimed_hours?: string | null;
  week?: number | null;
  submitted_date?: string | null;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function DocumentReviewPage() {
  const [queue, setQueue] = useState<PendingDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const fetchQueue = async () => {
    try {
      const res = await fetchApi('/documents/pending');
      // Handle both paginated and non-paginated responses gracefully
      const docs = res.documents?.data || res.documents || [];
      setQueue(docs);
      
      // Auto-select first item if nothing is selected
      if (docs.length > 0 && !selectedDocId) {
        setSelectedDocId(docs[0].id);
      }
    } catch (err) {
      console.error("Failed to load queue", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    // Refresh queue every minute
    const interval = setInterval(fetchQueue, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (status: 'approved' | 'rejected') => {
    if (status === 'rejected' && !rejectionReason.trim()) {
      alert("Please provide a reason for rejection.");
      return;
    }

    if (!selectedDocId) return;

    setActionLoading(true);
    try {
      await fetchApi(`/documents/${selectedDocId}/review`, {
        method: "PATCH",
        body: JSON.stringify({
          status,
          reason: status === 'rejected' ? rejectionReason : null
        })
      });

      // Remove from queue locally
      setQueue(prev => prev.filter(d => d.id !== selectedDocId));
      
      // Select the next one in queue if available
      const remaining = queue.filter(d => d.id !== selectedDocId);
      if (remaining.length > 0) {
        setSelectedDocId(remaining[0].id);
      } else {
        setSelectedDocId(null);
      }

      setRejectionReason("");
    } catch (err: any) {
      alert(err.message || "Failed to process document");
    } finally {
      setActionLoading(false);
    }
  };

  const selectedDoc = queue.find(d => d.id === selectedDocId);

  return (
    <ProtectedRoute allowedRoles={['prof']}>
      <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", flexDirection: "column" }}>
        <AppNavbar />

        <main style={{ maxWidth: "1400px", margin: "0 auto", padding: "2.5rem 1.5rem", width: "100%", flex: 1, display: "flex", gap: "2rem" }}>
          
          {/* Main Content Area (Viewer) */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ marginBottom: "1rem" }}>
              <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.03em", margin: 0 }}>
                Document Review
              </h1>
              <p style={{ color: "#64748b", fontSize: "1.1rem", margin: 0, fontWeight: 500 }}>
                Centralized queue for reviewing student submissions.
              </p>
            </div>

            {loading && queue.length === 0 ? (
              <div style={{ padding: "4rem", textAlign: "center", color: "#94a3b8", background: "white", borderRadius: "1rem", border: "1px dashed #cbd5e1" }}>
                Loading queue...
              </div>
            ) : !selectedDoc ? (
              <div style={{ padding: "4rem", textAlign: "center", color: "#94a3b8", background: "white", borderRadius: "1rem", border: "1px dashed #cbd5e1" }}>
                <h3 style={{ fontSize: "1.25rem", color: "#334155", marginBottom: "0.5rem" }}>All caught up!</h3>
                <p>There are no pending documents to review right now.</p>
              </div>
            ) : (
              <div style={{ background: "white", borderRadius: "1rem", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)", border: "1px solid #e2e8f0", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                
                {/* Header Info */}
                <div style={{ padding: "1.5rem", borderBottom: "1px solid #e2e8f0", background: "#f8fafc", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h2 style={{ margin: "0 0 0.25rem 0", fontSize: "1.25rem", color: "#0f172a" }}>
                      {selectedDoc.user.name} 
                      <span style={{ fontSize: "0.85rem", color: "#64748b", marginLeft: "0.75rem", fontWeight: 400 }}>
                        {selectedDoc.user.program || "Student"}
                      </span>
                    </h2>
                    <div style={{ color: "#475569", fontSize: "0.95rem", display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
                      <span><strong>Company:</strong> {selectedDoc.user.company?.name || "Not assigned"}</span>
                      <span>
                        <strong>Document:</strong> <span style={{ textTransform: "uppercase", fontWeight: 600, color: "#2563eb" }}>{selectedDoc.document_type}</span>
                        {selectedDoc.week && <span style={{ marginLeft: "0.4rem", color: "#64748b" }}>(Week {selectedDoc.week})</span>}
                      </span>
                      {selectedDoc.submitted_date && (
                        <span><strong>For Date:</strong> {selectedDoc.submitted_date}</span>
                      )}
                      {selectedDoc.claimed_hours && (
                        <span><strong>Claimed Hours:</strong> {selectedDoc.claimed_hours}</span>
                      )}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", color: "#64748b", fontSize: "0.85rem" }}>
                    Submitted on<br/>
                    <strong>{formatDate(selectedDoc.created_at)}</strong>
                  </div>
                </div>

                {/* PDF Viewer */}
                <div style={{ height: "600px", background: "#f1f5f9", position: "relative" }}>
                  <iframe 
                    src={selectedDoc.file_link.replace('/view?usp=drivesdk', '/preview')} 
                    style={{ width: "100%", height: "100%", border: "none" }}
                    title="Document Preview"
                  />
                </div>

                {/* Action Bar */}
                <div style={{ padding: "1.5rem", borderTop: "1px solid #e2e8f0", background: "#f8fafc" }}>
                  <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#475569", marginBottom: "0.5rem" }}>
                        Rejection Reason (Required if rejecting)
                      </label>
                      <input 
                        type="text" 
                        placeholder="Enter reason for rejection..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1", outline: "none", fontSize: "0.95rem" }}
                      />
                    </div>
                    <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.75rem" }}>
                      <button 
                        onClick={() => handleAction('rejected')}
                        disabled={actionLoading || !rejectionReason.trim()}
                        style={{ 
                          padding: "0.75rem 1.5rem", borderRadius: "0.5rem", fontWeight: 600, cursor: actionLoading || !rejectionReason.trim() ? "not-allowed" : "pointer",
                          background: "white", color: "#ef4444", border: "1px solid #fca5a5", opacity: actionLoading || !rejectionReason.trim() ? 0.6 : 1
                        }}
                      >
                        {actionLoading ? "Processing..." : "Reject"}
                      </button>
                      <button 
                        onClick={() => handleAction('approved')}
                        disabled={actionLoading}
                        style={{ 
                          padding: "0.75rem 2rem", borderRadius: "0.5rem", fontWeight: 600, cursor: actionLoading ? "not-allowed" : "pointer",
                          background: "#16a34a", color: "white", border: "none", opacity: actionLoading ? 0.7 : 1, boxShadow: "0 4px 6px rgba(22, 163, 74, 0.2)"
                        }}
                      >
                        {actionLoading ? "Processing..." : "Approve Document"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar (FIFO Queue) */}
          <div style={{ width: "380px", flexShrink: 0, display: "flex", flexDirection: "column" }}>
            <div style={{ background: "white", borderRadius: "1rem", border: "1px solid #e2e8f0", overflow: "hidden", display: "flex", flexDirection: "column", height: "calc(100vh - 120px)", position: "sticky", top: "100px" }}>
              <div style={{ padding: "1.25rem", borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>
                <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#0f172a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  Review Queue
                  <span style={{ background: "#e0e7ff", color: "#4f46e5", padding: "0.2rem 0.6rem", borderRadius: "999px", fontSize: "0.8rem", fontWeight: 700 }}>
                    {queue.length} Pending
                  </span>
                </h3>
              </div>
              
              <div style={{ flex: 1, overflowY: "auto", padding: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {queue.length === 0 ? (
                  <div style={{ padding: "2rem 1rem", textAlign: "center", color: "#94a3b8", fontSize: "0.9rem" }}>
                    No pending documents.
                  </div>
                ) : (
                  queue.map((doc) => (
                    <div 
                      key={doc.id}
                      onClick={() => { setSelectedDocId(doc.id); setRejectionReason(""); }}
                      style={{ 
                        padding: "1rem", borderRadius: "0.75rem", cursor: "pointer",
                        border: "1px solid",
                        borderColor: selectedDocId === doc.id ? "#818cf8" : "#f1f5f9",
                        background: selectedDocId === doc.id ? "#e0e7ff" : "white",
                        transition: "all 0.2s"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                        <strong style={{ color: "#0f172a", fontSize: "0.95rem" }}>{doc.user.name}</strong>
                        <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{formatDate(doc.created_at)}</span>
                      </div>
                      <div style={{ fontSize: "0.85rem", color: "#475569", marginBottom: "0.25rem" }}>
                        {doc.user.company?.name || "No Company"}
                      </div>
                      <div style={{ display: "inline-block", padding: "0.15rem 0.5rem", background: selectedDocId === doc.id ? "#c7d2fe" : "#f1f5f9", color: "#4f46e5", borderRadius: "0.25rem", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase" }}>
                        {doc.document_type}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </main>
      </div>
    </ProtectedRoute>
  );
}
