"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "../../lib/api";
import DocumentReviewList, { ReviewableDocument } from "./DocumentReviewList";
import DocumentViewerModal from "./DocumentViewerModal";
import { REQUIRED_DOCUMENTS, PHASE_ORDER, PHASE_LABELS, normalize, DocumentPhase } from "../data/documentTypes";

interface StudentCompany {
  id: number;
  name: string;
}

interface AdminStudentListItem {
  id: number;
  name: string;
  email?: string;
  company?: StudentCompany | null;
  profile_picture?: string | null;
  hours_rendered?: string | null;
  required_hours?: number | null;
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
interface DeploymentDetail {
  id: number;
  role: string | null;
  supervisor_name: string | null;
  supervisor_contact: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string;
}

interface AdminStudentFullDetail {
  phone: string | null;
  program: string | null;
  deployment: DeploymentDetail | null;
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
  onStudentUpdated,
}: {
  student: AdminStudentListItem;
  onClose: () => void;
  onStudentUpdated?: (updatedStudent: Partial<AdminStudentListItem>) => void;
}) {
  const [detail, setDetail] = useState<AdminStudentFullDetail | null>(null);
  const [detailError, setDetailError] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<{title: string, link: string} | null>(null);

  // Optimistic local override for the summary "Hours Rendered" block.
  // `student.hours_rendered` comes from the parent roster list (stale once
  // a DTR is approved from inside this panel — the parent doesn't refetch
  // until the list itself reloads). DocumentReviewList's approve dialog
  // already treats `claimed_hours` on a DTR as the new absolute total
  // (see its confirm-approve preview: current -> claimed_hours), so we
  // reuse that same assumption here rather than re-deriving it.
  const [renderedHoursOverride, setRenderedHoursOverride] = useState<string | null>(null);
  const [editingDeployment, setEditingDeployment] = useState(false);
  const [deploymentForm, setDeploymentForm] = useState({ role: "", supervisor_name: "", supervisor_contact: "", start_date: "", end_date: "" });
  const [savingDeployment, setSavingDeployment] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);

  useEffect(() => {
    fetchApi(`/admin/users/${student.id}`)
      .then((data: AdminStudentFullDetail) => {
        setDetail(data);
        if (data.deployment) {
          setDeploymentForm({
            role: data.deployment.role || "",
            supervisor_name: data.deployment.supervisor_name || "",
            supervisor_contact: data.deployment.supervisor_contact || "",
            start_date: data.deployment.start_date ? data.deployment.start_date.slice(0, 10) : "",
            end_date: data.deployment.end_date ? data.deployment.end_date.slice(0, 10) : "",
          });
        }
      })
      .catch(() => setDetailError(true));
  }, [student.id]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !viewingDoc) onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, viewingDoc]);

  const rendered = parseFloat(renderedHoursOverride ?? student.hours_rendered ?? "0");
  const required = typeof student.required_hours === "number" ? student.required_hours : 0;
  const isComplete = required > 0 && rendered >= required;

  const pendingDocs = detail?.documents.filter((d) => d.status === "pending") ?? [];

  const handleDocumentsChange = (
    updater: (docs: ReviewableDocument[]) => ReviewableDocument[]
  ) => {
    setDetail((prev) => {
      if (!prev) return prev;
      const beforePending = prev.documents.filter((d) => d.status === "pending") as unknown as ReviewableDocument[];
      const afterPending = updater(beforePending);
      const afterIds = new Set(afterPending.map((d) => d.id));
      
      const nextDocuments = prev.documents.map((d) =>
        d.status === "pending" && !afterIds.has(d.id) ? { ...d, status: "reviewed" } : d
      );
      return { ...prev, documents: nextDocuments };
    });
  };

  const handleSaveDeployment = async () => {
    if (!detail?.deployment) return;
    setSavingDeployment(true);
    try {
      const res = await fetchApi(`/admin/deployments/${detail.deployment.id}/override`, {
        method: "PATCH",
        body: JSON.stringify({
          role: deploymentForm.role || null,
          supervisor_name: deploymentForm.supervisor_name || null,
          supervisor_contact: deploymentForm.supervisor_contact || null,
          start_date: deploymentForm.start_date || null,
          end_date: deploymentForm.end_date || null,
        }),
      });
      setDetail((prev) => prev ? { ...prev, deployment: res.deployment } : prev);
      setEditingDeployment(false);
    } catch (err: any) {
      alert(err.message || "Failed to update deployment.");
    } finally {
      setSavingDeployment(false);
    }
  };

  const handleAfterAction = (doc: ReviewableDocument, action: "approved" | "rejected") => {
    if (action === "approved" && doc.document_type === "dtr" && doc.claimed_hours) {
      setRenderedHoursOverride(doc.claimed_hours);
      if (onStudentUpdated) {
        onStudentUpdated({ hours_rendered: doc.claimed_hours, pending_documents_count: Math.max(0, (student.pending_documents_count || 1) - 1) });
      }
    } else {
      if (onStudentUpdated) {
        onStudentUpdated({
          pending_documents_count: Math.max(0, (student.pending_documents_count || 1) - 1),
          ...(action === "rejected" ? { rejected_documents_count: (student.rejected_documents_count || 0) + 1 } : {})
        });
      }
    }
  };

  const getPhaseForDoc = (docType: string): DocumentPhase => {
    const norm = normalize(docType);
    const reqDef = REQUIRED_DOCUMENTS.find(r => 
      normalize(r.id) === norm || 
      normalize(r.title) === norm || 
      (r.aliases || []).some(a => normalize(a) === norm)
    );
    return reqDef ? reqDef.phase : "other";
  };

  return (
    <div
      style={{
        position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
        background: "rgba(15, 23, 42, 0.5)", zIndex: 100, display: "flex", justifyContent: "center", alignItems: "center",
        padding: "1rem", boxSizing: "border-box"
      }}
      onClick={onClose}
    >
      <div
        className="hide-scroll"
        style={{
          background: "white", width: "100%", maxWidth: "640px", maxHeight: "95vh",
          overflowY: "auto", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
          borderRadius: "1rem",
          display: "flex", flexDirection: "column", animation: "modalFadeScale 0.25s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          .hide-scroll::-webkit-scrollbar { display: none; }
          .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
          @keyframes modalFadeScale {
            from { opacity: 0; transform: scale(0.95) translateY(10px); }
            to   { opacity: 1; transform: scale(1) translateY(0); }
          }
          .accordion-header { width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 0.8rem 1rem; background: white; border: none; border-bottom: 1px solid #e2e8f0; cursor: pointer; transition: background 0.3s ease; font-family: inherit; font-size: inherit; }
          .accordion-header:hover { background: #f8fafc; }
          .accordion-header.open { background: linear-gradient(90deg, #eff6ff 0%, #f0f9ff 100%); }
          .accordion-chevron { width: 18px; height: 18px; color: #64748b; transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1); flex-shrink: 0; }
          .accordion-chevron.open { transform: rotate(180deg); color: #1d4ed8; }
        `}</style>

        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #e2e8f0", background: "#f8fafc", display: "flex", gap: "1rem", alignItems: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={student.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&size=100&background=0f172a&color=fff&bold=true`}
            alt={student.name}
            style={{ width: 64, height: 64, borderRadius: "50%", border: "3px solid white", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", flexShrink: 0, objectFit: "cover", objectPosition: "center" }}
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

        <div style={{ padding: "1.5rem", flex: 1, paddingBottom: "2rem" }}>
          <h3 style={{ fontSize: "0.75rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
            General Info
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "1.25rem", fontSize: "0.85rem" }}>
            <div>
              <span style={{ color: "#94a3b8" }}>Phone</span>
              <div style={{ color: "#0f172a", fontWeight: 600 }}>{detail?.phone || (detailError ? "—" : "…")}</div>
            </div>
            <div>
              <span style={{ color: "#94a3b8" }}>Program</span>
              <div style={{ color: "#0f172a", fontWeight: 600 }}>{detail?.program || (detailError ? "—" : "…")}</div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <h3 style={{ fontSize: "0.75rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
              Deployment Details
            </h3>
            {detail?.deployment && !editingDeployment && (
              <button
                onClick={() => setEditingDeployment(true)}
                style={{ background: "none", border: "1px solid #cbd5e1", color: "#475569", borderRadius: "0.4rem", padding: "0.3rem 0.75rem", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}
              >
                Edit
              </button>
            )}
          </div>

          {!detail?.deployment ? (
            <div style={{ border: "1px dashed #cbd5e1", borderRadius: "1rem", padding: "1.25rem", textAlign: "center", color: "#94a3b8", fontSize: "0.85rem", marginBottom: "1.75rem" }}>
              {detailError ? "Couldn't load deployment." : !detail ? "Loading..." : "No deployment on record."}
            </div>
          ) : editingDeployment ? (
            <div style={{ marginBottom: "1.75rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "#94a3b8", marginBottom: "0.25rem" }}>Role</label>
                  <input value={deploymentForm.role} onChange={(e) => setDeploymentForm({ ...deploymentForm, role: e.target.value })}
                    style={{ width: "100%", padding: "0.5rem 0.65rem", borderRadius: "0.4rem", border: "1px solid #cbd5e1", fontSize: "0.85rem", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "#94a3b8", marginBottom: "0.25rem" }}>Supervisor Contact</label>
                  <input value={deploymentForm.supervisor_contact} onChange={(e) => setDeploymentForm({ ...deploymentForm, supervisor_contact: e.target.value })}
                    style={{ width: "100%", padding: "0.5rem 0.65rem", borderRadius: "0.4rem", border: "1px solid #cbd5e1", fontSize: "0.85rem", boxSizing: "border-box" }} />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "#94a3b8", marginBottom: "0.25rem" }}>Supervisor</label>
                  <input value={deploymentForm.supervisor_name} onChange={(e) => setDeploymentForm({ ...deploymentForm, supervisor_name: e.target.value })}
                    style={{ width: "100%", padding: "0.5rem 0.65rem", borderRadius: "0.4rem", border: "1px solid #cbd5e1", fontSize: "0.85rem", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "#94a3b8", marginBottom: "0.25rem" }}>Start Date</label>
                  <input type="date" value={deploymentForm.start_date} onChange={(e) => setDeploymentForm({ ...deploymentForm, start_date: e.target.value })}
                    style={{ width: "100%", padding: "0.5rem 0.65rem", borderRadius: "0.4rem", border: "1px solid #cbd5e1", fontSize: "0.85rem", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "#94a3b8", marginBottom: "0.25rem" }}>End Date</label>
                  <input type="date" value={deploymentForm.end_date} onChange={(e) => setDeploymentForm({ ...deploymentForm, end_date: e.target.value })}
                    style={{ width: "100%", padding: "0.5rem 0.65rem", borderRadius: "0.4rem", border: "1px solid #cbd5e1", fontSize: "0.85rem", boxSizing: "border-box" }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                <button onClick={() => setEditingDeployment(false)} disabled={savingDeployment}
                  style={{ background: "transparent", border: "1px solid #cbd5e1", color: "#64748b", borderRadius: "0.4rem", padding: "0.4rem 1rem", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer" }}>
                  Cancel
                </button>
                <button onClick={handleSaveDeployment} disabled={savingDeployment}
                  style={{ background: "#2563eb", border: "none", color: "white", borderRadius: "0.4rem", padding: "0.4rem 1rem", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer" }}>
                  {savingDeployment ? "Saving..." : "Save Override"}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.75rem", fontSize: "0.85rem" }}>
              <div>
                <span style={{ color: "#94a3b8" }}>Company</span>
                <div style={{ color: "#0f172a", fontWeight: 600 }}>{student.company?.name || "—"}</div>
              </div>
              <div>
                <span style={{ color: "#94a3b8" }}>Role</span>
                <div style={{ color: "#0f172a", fontWeight: 600 }}>{detail.deployment.role || "—"}</div>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <span style={{ color: "#94a3b8" }}>Supervisor</span>
                <div style={{ color: "#0f172a", fontWeight: 600 }}>{detail.deployment.supervisor_name || "—"}</div>
              </div>
              <div>
                <span style={{ color: "#94a3b8" }}>Start Date</span>
                <div style={{ color: "#0f172a", fontWeight: 600 }}>{detail.deployment.start_date ? detail.deployment.start_date.slice(0, 10) : "—"}</div>
              </div>
              <div>
                <span style={{ color: "#94a3b8" }}>End Date</span>
                <div style={{ color: "#0f172a", fontWeight: 600 }}>{detail.deployment.end_date ? detail.deployment.end_date.slice(0, 10) : "—"}</div>
              </div>
            </div>
          )}

          <h3 style={{ fontSize: "0.75rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
            Hours Rendered
          </h3>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", borderRadius: "1rem", padding: "1rem", marginBottom: "1.75rem" }}>
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

          <h3 style={{ fontSize: "0.75rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
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
              onAfterAction={handleAfterAction}
              fallbackUser={{ name: student.name, hours_rendered: renderedHoursOverride ?? student.hours_rendered ?? null }}
              showUserName={false}
              emptyMessage="Nothing pending for this student right now."
            />
          )}

          <h3 style={{ fontSize: "0.75rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem", marginTop: "1.25rem" }}>
            Submitted Documents
          </h3>
          {detailError ? (
            <div style={{ border: "1px dashed #cbd5e1", borderRadius: "1rem", padding: "1.25rem", textAlign: "center", color: "#94a3b8", fontSize: "0.85rem" }}>
              Couldn&apos;t load documents.
            </div>
          ) : !detail ? (
            <div style={{ border: "1px dashed #cbd5e1", borderRadius: "1rem", padding: "1.25rem", textAlign: "center", color: "#94a3b8", fontSize: "0.85rem" }}>
              Loading...
            </div>
          ) : detail.documents.length === 0 ? (
            <div style={{ border: "1px dashed #cbd5e1", borderRadius: "1rem", padding: "1.25rem", textAlign: "center", color: "#94a3b8", fontSize: "0.85rem" }}>
              No documents submitted yet.
            </div>
          ) : (
            <div style={{ borderRadius: "1rem", border: "1px solid #e2e8f0", overflow: "hidden", background: "white", flexShrink: 0 }}>
              {PHASE_ORDER.map((phase, phaseIdx) => {
                const phaseDocs = detail.documents.filter(d => getPhaseForDoc(d.document_type) === phase);
                if (phaseDocs.length === 0) return null;
                const isOpen = openSection === phase;
                return (
                  <div key={phase}>
                    <button className={`accordion-header${isOpen ? " open" : ""}`} onClick={() => setOpenSection(prev => prev === phase ? null : phase)}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", flex: 1 }}>
                        <div style={{
                          width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                          backgroundColor: isOpen ? "#1d4ed8" : "#f1f5f9",
                          color: isOpen ? "white" : "#64748b",
                          fontSize: "0.7rem", fontWeight: 800,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
                          boxShadow: isOpen ? "0 4px 12px rgba(29,78,216,0.35)" : "none",
                        }}>
                          {String(phaseIdx + 1).padStart(2, "0")}
                        </div>
                        <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "#0f172a", textTransform: "capitalize", letterSpacing: "-0.01em" }}>
                          {phase === "other" ? "Other Documents" : `${phase} OJT`}
                        </span>
                      </div>
                      
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <div style={{ fontSize: "0.7rem", fontWeight: 600, color: "#64748b", background: "#f8fafc", padding: "0.2rem 0.6rem", borderRadius: "999px", border: "1px solid #e2e8f0" }}>
                          {phaseDocs.length} {phaseDocs.length === 1 ? "Doc" : "Docs"}
                        </div>
                        <svg className={`accordion-chevron${isOpen ? " open" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6 9l6 6 6-6"/>
                        </svg>
                      </div>
                    </button>
                    <div style={{
                      display: "grid", gridTemplateRows: isOpen ? "1fr" : "0fr",
                      transition: "grid-template-rows 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      background: "#f8fafc",
                    }}>
                      <div style={{ overflow: "hidden" }}>
                        <div style={{ padding: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                          {phaseDocs.map((doc) => (
                            <div key={doc.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 1rem", border: "1px solid #e2e8f0", borderRadius: "0.75rem", background: "white" }}>
                              <div>
                                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a" }}>{doc.document_type}</div>
                                <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.2rem" }}>
                                  Submitted on {doc.created_at.slice(0, 10)}
                                </div>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                <span style={{
                                  fontSize: "0.7rem", fontWeight: 700, padding: "0.2rem 0.6rem", borderRadius: "999px", textTransform: "uppercase",
                                  background: doc.status === "approved" ? "#dcfce7" : doc.status === "rejected" ? "#fee2e2" : "#fef3c7",
                                  color: doc.status === "approved" ? "#166534" : doc.status === "rejected" ? "#991b1b" : "#92400e"
                                }}>
                                  {doc.status}
                                </span>
                                <button
                                  onClick={() => setViewingDoc({ title: doc.document_type, link: doc.file_link })}
                                  style={{
                                    background: "none", border: "1px solid #cbd5e1", borderRadius: "0.4rem",
                                    padding: "0.3rem 0.75rem", fontSize: "0.75rem", fontWeight: 600, color: "#3b82f6",
                                    cursor: "pointer", transition: "all 0.2s"
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.background = "#eff6ff")}
                                  onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                                >
                                  Preview File
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      {viewingDoc && (
        <DocumentViewerModal
          title={viewingDoc.title}
          fileLink={viewingDoc.link}
          onClose={() => setViewingDoc(null)}
        />
      )}
    </div>
  );
}
