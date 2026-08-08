"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useRole, Role } from "../context/RoleContext";
import { fetchApi } from "../../lib/api";
import AppNavbar from "../components/AppNavbar";
import ProtectedRoute from "../components/ProtectedRoute";
import { REQUIRED_DOCUMENTS } from "../data/documentTypes";
import DocumentViewerModal from "../components/DocumentViewerModal";
import ConfirmDialog from "../components/ConfirmDialog";

/* ═══════════════════════════ Scroll reveal hook ════════════════════ */
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

function RevealBox({ children, delay = 0, style = {} }: { children: React.ReactNode, delay?: number, style?: React.CSSProperties }) {
  const { ref, visible } = useReveal();
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(24px)",
      transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
      height: "100%",
      ...style
    }}>
      {children}
    </div>
  );
}

/* ═══════════════════════════ Icons ═══════════════════════════ */
function IconUpload() {
  return (
    <svg className="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
    </svg>
  );
}

/* ═══════════════════════════ Shared field components ═══════════ */
function FieldDisplay({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: "0.85rem", color: "#94a3b8", textTransform: "uppercase", fontWeight: 700, marginBottom: "0.35rem" }}>{label}</div>
      <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "#334155" }}>{value || "—"}</div>
    </div>
  );
}

function FieldInput({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#475569", marginBottom: "0.5rem" }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: "100%", padding: "0.8rem 1rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1", fontSize: "1rem", outline: "none", boxSizing: "border-box" }}
      />
    </div>
  );
}

/* ═══════════════════════════ Status Badge ══════════════════════ */
function StatusBadge({ status }: { status: "not_submitted" | "submitted" | "pending" | "approved" | "rejected" | "uploading" }) {
  const map = {
    not_submitted: { bg: "#f1f5f9", color: "#64748b", label: "Not Submitted" },
    submitted: { bg: "#dbeafe", color: "#1e40af", label: "Submitted" },
    pending: { bg: "#fef9c3", color: "#a16207", label: "Under Review" },
    approved: { bg: "#dcfce7", color: "#166534", label: "Approved" },
    rejected: { bg: "#fee2e2", color: "#b91c1c", label: "Rejected" },
    uploading: { bg: "#eff6ff", color: "#3b82f6", label: "Uploading..." },
  };
  const s = map[status] || map.not_submitted;
  return (
    <span style={{ background: s.bg, color: s.color, padding: "0.4rem 1rem", borderRadius: "9999px", fontSize: "clamp(0.65rem, 2.5vw, 0.85rem)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
      {s.label}
    </span>
  );
}

/* ═══════════════════════════ Document Card ══════════════════════ */
function DocumentCardItem({ doc, onUpload, onRemove, onView }: { doc: { id: string, name: string, status: "not_submitted" | "submitted" | "uploading", date: string, fileLink?: string, reviewStatus?: "pending" | "approved" | "rejected", rejectionReason?: string | null, week?: number }, onUpload: (id: string, file: File, week?: number) => void, onRemove: (id: string) => void, onView: (title: string, fileLink: string) => void }) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      if (e.dataTransfer.files[0].type !== "application/pdf") { alert("Only PDF files are allowed."); return; }
      onUpload(doc.id, e.dataTransfer.files[0], doc.week);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      if (e.target.files[0].type !== "application/pdf") { alert("Only PDF files are allowed."); return; }
      onUpload(doc.id, e.target.files[0], doc.week);
    }
  };

  const badgeStatus = doc.status === "submitted" ? (doc.reviewStatus || "pending") : doc.status;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "white", border: "1px solid #e2e8f0", borderRadius: "1rem", padding: "16px", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
      
      {/* Header Area */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem", gap: "1rem" }}>
        <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#0f172a", margin: 0, lineHeight: 1.3 }}>{doc.name}</h3>
        <StatusBadge status={badgeStatus} />
      </div>

      {/* Upload/Action Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", marginTop: "auto" }}>
        {doc.status === "submitted" ? (
          <div style={{ background: doc.reviewStatus === "rejected" ? "#fef2f2" : "#f8fafc", border: `1px solid ${doc.reviewStatus === "rejected" ? "#fecaca" : "#f1f5f9"}`, borderRadius: "0.75rem", padding: "16px", display: "flex", flexDirection: "column" }}>
            {doc.reviewStatus === "rejected" && doc.rejectionReason ? (
              <div style={{ flex: 1, overflowY: "auto", marginBottom: "0.5rem" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#b91c1c", textTransform: "uppercase", letterSpacing: "0.05em" }}>Reason for Rejection</div>
                <div style={{ fontSize: "0.9rem", color: "#991b1b", lineHeight: 1.3, marginTop: "0.25rem" }}>"{doc.rejectionReason}"</div>
              </div>
            ) : (
              <div style={{ fontSize: "0.9rem", color: "#475569" }}>
                Uploaded on <strong>{doc.date}</strong>
              </div>
            )}
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "auto" }}>
              {doc.fileLink && (
                <button onClick={() => onView(doc.name, doc.fileLink!)} className="rejected-preview-btn" style={{ flex: 1 }}>Preview File</button>
              )}
              <button onClick={() => onRemove(doc.id)} className="rejected-delete-btn" style={{ flex: 1, ...(doc.reviewStatus !== "rejected" && { background: "#f8fafc", borderColor: "#e2e8f0", color: "#64748b" }) }}>
                {doc.reviewStatus === "rejected" ? "Delete & Re-upload" : "Delete File"}
              </button>
            </div>
          </div>
        ) : doc.status === "uploading" ? (
          <div style={{ background: "#eff6ff", borderRadius: "0.75rem", padding: "16px 0", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <span style={{ color: "#3b82f6", fontSize: "1rem", fontWeight: 700 }}>Uploading...</span>
          </div>
        ) : (
          <div className="pdf-upload-box" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} style={{ position: "relative", background: dragActive ? "#eff6ff" : "#f8fafc", border: `2px dashed ${dragActive ? "#3b82f6" : "#cbd5e1"}`, borderRadius: "0.75rem", padding: "16px 0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s" }}>
            <input type="file" accept="application/pdf" onChange={handleChange} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%" }} />
            <IconUpload />
            <span style={{ fontSize: "0.95rem", fontWeight: 600, color: dragActive ? "#3b82f6" : "#64748b", marginTop: "0.5rem" }}>{dragActive ? "Drop PDF here" : "Drag PDF or Click to browse"}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, login } = useRole();
  
  const [profileData, setProfileData] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [profileLoading, setProfileLoading] = useState(true);
  const [documentsLoading, setDocumentsLoading] = useState(true);

  const [editingGeneral, setEditingGeneral] = useState(false);
  const [generalForm, setGeneralForm] = useState({ name: "", email: "", phone: "", program: "" });
  const [savingGeneral, setSavingGeneral] = useState(false);

  const [editingOjt, setEditingOjt] = useState(false);
  const [deployment, setDeployment] = useState<any>(null);
  const [deploymentLoading, setDeploymentLoading] = useState(true);
  const [ojtForm, setOjtForm] = useState({ role: "", supervisor_name: "", supervisor_contact: "", start_date: "", end_date: "", company_id: null as number | null, company_name: "" });
  const [ojtFormOriginal, setOjtFormOriginal] = useState(ojtForm);
  const [savingOjt, setSavingOjt] = useState(false);
  const [companies, setCompanies] = useState<{ id: number; name: string }[]>([]);
  const [useCustomCompany, setUseCustomCompany] = useState(false);

  const [openSection, setOpenSection] = useState<string | null>("before");
  const [activeWeek, setActiveWeek] = useState<number>(1);
  const [weeksArray, setWeeksArray] = useState<number[]>([1]);
  const [viewingDoc, setViewingDoc] = useState<{title: string, link: string} | null>(null);
  const [deletingDoc, setDeletingDoc] = useState<string | null>(null);

  useEffect(() => {
    fetchApi('/me')
      .then((data) => {
        setProfileData(data);
        setGeneralForm({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          program: data.program || "",
        });
      })
      .catch((err: any) => { if (err.status !== 401) console.error("Failed to load profile:", err); })
      .finally(() => setProfileLoading(false));
    fetchApi('/companies')
      .then((data) => setCompanies(data.companies || []))
      .catch((err: any) => { if (err.status !== 401) console.error("Failed to load companies:", err); });
    fetchApi('/deployments/mine')
      .then((data) => {
        if (!data) {
          console.warn("fetchApi returned null/empty data for /deployments/mine");
          return;
        }
        setDeployment(data.deployment);
        if (data.deployment) {
          const initialOjtForm = {
            role: data.deployment.role || "",
            supervisor_name: data.deployment.supervisor_name || "",
            supervisor_contact: data.deployment.supervisor_contact || "",
            start_date: data.deployment.start_date ? data.deployment.start_date.slice(0, 10) : "",
            end_date: data.deployment.end_date ? data.deployment.end_date.slice(0, 10) : "",
            company_id: data.deployment.company?.id ?? null,
            company_name: data.deployment.company?.name || "",
          };
          setOjtForm(initialOjtForm);
          setOjtFormOriginal(initialOjtForm);
        }
      })
      .catch((err: any) => { 
        if (err?.status !== 401) {
          console.error("Failed to load deployment:", err?.message || "Unknown error", `(Status: ${err?.status})`, "Raw:", err);
        }
      })
      .finally(() => setDeploymentLoading(false));

    fetchApi('/documents/mine')
      .then((data) => {
        const docs = data.documents || [];
        const existingDocs = docs.map((d: any) => {
          const reqDef = REQUIRED_DOCUMENTS.find(r => r.id === d.document_type || r.aliases?.includes(d.document_type));
          return {
            id: d.id.toString(),
            name: reqDef ? reqDef.title : d.document_type,
            phase: reqDef ? reqDef.phase : "other",
            status: "submitted",
            date: new Date(d.created_at).toLocaleDateString(),
            fileLink: d.file_link,
            reviewStatus: d.status,
            rejectionReason: d.rejection_reason,
            week: d.week
          };
        });
        
        const baseDocs = REQUIRED_DOCUMENTS.map(req => {
          const found = existingDocs.find((ed: any) => ed.name === req.title && ed.week == null);
          return found || { id: req.id, name: req.title, phase: req.phase, status: "not_submitted", date: "" };
        });

        const weeklyDocs = existingDocs.filter((ed: any) => ed.week != null);
        const maxWeek = weeklyDocs.length > 0 ? Math.max(...weeklyDocs.map((d: any) => d.week)) : 1;
        setWeeksArray(Array.from({length: maxWeek}, (_, i) => i + 1));

        setDocuments([...baseDocs.filter(d => d.phase !== "during"), ...weeklyDocs]);
      })
      .catch((err: any) => { if (err.status !== 401) console.error("Failed to load documents:", err); })
      .finally(() => setDocumentsLoading(false));
  }, []);

  const handleUpload = async (id: string, file: File, week?: number) => {
    const docToUpload = documents.find(d => d.id === id) || { name: id.split('-week')[0] };
    const reqDef = REQUIRED_DOCUMENTS.find(r => r.title === docToUpload.name);
    let documentType = reqDef ? reqDef.id : docToUpload.name;
    let claimedHours: string | undefined = undefined;

    if (documentType === "daily-attendance-report" || documentType === "dtr" || reqDef?.aliases?.includes("dtr")) {
      documentType = "dtr";
      const promptMsg = week ? `How many hours did you render for Week ${week}?` : "How many hours are you claiming for this DTR?";
      const hoursStr = window.prompt(promptMsg);
      if (hoursStr === null) return; // User cancelled
      const hoursNum = parseFloat(hoursStr);
      if (isNaN(hoursNum) || hoursNum <= 0) {
        alert("Please enter a valid number of hours.");
        return;
      }
      claimedHours = hoursNum.toString();
    }

    setDocuments(docs => {
      if (!docs.find(d => d.id === id)) {
        if (reqDef) docs.push({ id, name: reqDef.title, phase: reqDef.phase, status: "uploading", date: "", week });
      }
      return docs.map(d => d.id === id ? { ...d, status: "uploading" } : d);
    });

    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('document_type', documentType);
      if (week !== undefined) formData.append('week', week.toString());
      if (claimedHours !== undefined) formData.append('claimed_hours', claimedHours);

      const res = await fetchApi('/documents/upload', { method: 'POST', body: formData });

      setDocuments(docs => docs.map(d =>
        d.id === id ? { ...d, status: "submitted", date: "Just now", fileLink: res.document?.file_link, reviewStatus: "pending", rejectionReason: null, week } : d
      ));
    } catch (err: any) {
      alert(err.message || 'Failed to upload document.');
      setDocuments(docs => docs.map(d => d.id === id ? { ...d, status: "not_submitted" } : d));
    }
  };

  const handleRemoveDocument = (id: string) => {
    setDeletingDoc(id);
  };

  const confirmDeleteDocument = async () => {
    if (!deletingDoc) return;
    
    // Check if it is just a local state replace (if not a DB ID)
    const docToDelete = documents.find(d => d.id === deletingDoc);
    if (!docToDelete) {
      setDeletingDoc(null);
      return;
    }
    
    try {
      if (!isNaN(Number(docToDelete.id))) {
        await fetchApi(`/documents/${docToDelete.id}`, { method: 'DELETE' });
      }
      
      setDocuments(docs => docs.map(d => {
        if (d.id === deletingDoc) {
          const reqDef = REQUIRED_DOCUMENTS.find(r => r.title === d.name);
          return {
            id: reqDef ? reqDef.id : d.name,
            name: d.name,
            phase: d.phase,
            status: "not_submitted",
            date: "",
            fileLink: undefined,
            reviewStatus: undefined,
            rejectionReason: undefined,
            week: d.week
          };
        }
        return d;
      }));
    } catch (err: any) {
      alert(err.message || 'Failed to delete document.');
    } finally {
      setDeletingDoc(null);
    }
  };

  const handleViewPdf = async (title: string, link: string) => {
    setViewingDoc({ title, link });
  };

  const handleSaveGeneral = async () => {
    setSavingGeneral(true);
    try {
      const res = await fetchApi('/profile', { method: 'PATCH', body: JSON.stringify(generalForm) });
      setProfileData((prev: any) => prev ? { ...prev, ...res.user } : prev);
      if (user) login({ ...user, name: res.user.name, email: res.user.email });
      setEditingGeneral(false);
    } catch (err: any) { alert(err.message || "Failed to update profile."); } finally { setSavingGeneral(false); }
  };

  const handleSaveOjt = async () => {
    if (!deployment) return;
    setSavingOjt(true);
    try {
      const changed = JSON.stringify(ojtForm) !== JSON.stringify(ojtFormOriginal);
      // Already-confirmed deployments can never use /confirm — the backend
      // rejects re-confirming a confirmed record — so once confirmed, every
      // save (changed or not) must go through /override.
      const useOverride = changed || deployment.status === "confirmed";
      const endpoint = useOverride
        ? `/deployments/${deployment.id}/override`
        : `/deployments/${deployment.id}/confirm`;
      const payload: Record<string, string | number | null> = {
        role: ojtForm.role || null,
        supervisor_name: ojtForm.supervisor_name || null,
        supervisor_contact: ojtForm.supervisor_contact || null,
        start_date: ojtForm.start_date || null,
        end_date: ojtForm.end_date || null,
      };
      if (useOverride) {
        if (useCustomCompany) {
          payload.company_name = ojtForm.company_name || null;
        } else {
          payload.company_id = ojtForm.company_id ?? null;
        }
      }
      const res = await fetchApi(endpoint, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      setDeployment(res.deployment);
      setOjtFormOriginal(ojtForm);
      setEditingOjt(false);
    } catch (err: any) {
      if (err.status !== 401) console.error("Failed to save deployment:", err);
    } finally {
      setSavingOjt(false);
    }
  };

  const hoursRendered = profileData ? (parseFloat(profileData.hours_rendered) || 0) : 0;
  const displayName = profileData?.name || "—";
  const displayProgram = profileData?.program || "Bachelor of Science in Computer Engineering | 2-1";
  const deploymentIncomplete = !!deployment && (
    !deployment.company?.name ||
    !deployment.role ||
    !deployment.supervisor_name ||
    !deployment.supervisor_contact ||
    !deployment.start_date ||
    !deployment.end_date
  );

  return (
    <ProtectedRoute>
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)", fontFamily: "var(--font-geist-sans, system-ui, sans-serif)", display: "flex", flexDirection: "column" }}>      <style>{`
        .main-container { width: 100%; max-width: 1280px; margin: 0 auto; padding: 2rem 2rem 3rem; flex: 1; box-sizing: border-box; }
        .ui-card { background: white; border-radius: 1.25rem; padding: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.04); border: 1px solid rgba(255,255,255,0.8); display: flex; flex-direction: column; height: auto; min-height: fit-content; }
        .responsive-grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 350px), 1fr)); gap: 24px; margin-bottom: 24px; align-items: stretch; }
        .profile-avatar { width: 56px; height: 56px; font-size: 1.5rem; border-radius: 50%; background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; flex-shrink: 0; }
        .upload-icon { width: 18px; height: 18px; }
        .card-edit-btn { background: none; border: 1px solid #cbd5e1; color: #475569; border-radius: 0.5rem; padding: 0.6rem 1.2rem; font-size: 0.9rem; font-weight: 700; cursor: pointer; transition: all 0.15s; width: auto; }
        .card-edit-btn:hover { background: #f1f5f9; color: #0f172a; }
        .card-save-btn { background: #2563eb; color: white; border: none; border-radius: 0.5rem; padding: 0.6rem 1.25rem; font-size: 0.9rem; font-weight: 700; cursor: pointer; transition: background 0.15s; width: auto; }
        .card-save-btn:hover { background: #1d4ed8; }
        .card-cancel-btn { background: transparent; color: #64748b; border: 1px solid #cbd5e1; border-radius: 0.5rem; padding: 0.6rem 1.25rem; font-size: 0.9rem; font-weight: 700; cursor: pointer; width: auto; }
        .field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        .profile-bar-content { display: flex; align-items: stretch; }
        .profile-bar-left { flex: 65; display: flex; gap: 16px; align-items: center; min-width: 0; }
        .profile-bar-divider { width: 1px; background: #e2e8f0; margin: 0 clamp(24px, 4vw, 40px); align-self: stretch; flex-shrink: 0; }
        .profile-bar-hours { flex: 35; display: flex; flex-direction: column; justify-content: center; min-width: 0; }
        .accordion-header { width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.25rem; background: white; border: none; border-bottom: 1px solid #e2e8f0; cursor: pointer; transition: background 0.3s ease; font-family: inherit; font-size: inherit; }
        .accordion-header:hover { background: #f8fafc; }
        .accordion-header.open { background: linear-gradient(90deg, #eff6ff 0%, #f0f9ff 100%); }
        .accordion-chevron { width: 18px; height: 18px; color: #64748b; transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1); flex-shrink: 0; }
        .accordion-chevron.open { transform: rotate(180deg); color: #1d4ed8; }
        .upload-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        @media (max-width: 1024px) { .upload-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 768px) { .upload-grid { grid-template-columns: 1fr; } }
        .pdf-upload-box { transition: all 0.2s ease-in-out; }
        .pdf-upload-box:hover { background: #f1f5f9 !important; border-color: #94a3b8 !important; }
        .rejected-preview-btn { background: white; border: 1px solid #cbd5e1; color: #475569; border-radius: 0.5rem; padding: 0.6rem 1.2rem; font-size: 0.9rem; font-weight: 700; cursor: pointer; transition: all 0.15s; }
        .rejected-preview-btn:hover { background: #f8fafc; color: #0f172a; }
        .rejected-delete-btn { background: #fee2e2; border: 1px solid #fca5a5; color: #b91c1c; border-radius: 0.5rem; padding: 0.6rem 1.2rem; font-size: 0.9rem; font-weight: 700; cursor: pointer; transition: all 0.15s; }
        .rejected-delete-btn:hover { background: #fecaca; color: #991b1b; }
        
        @media (max-width: 1024px) {
          .ui-card { padding: 20px; }
          .responsive-grid-2 { gap: 20px; margin-bottom: 20px; }
          .card-edit-btn, .card-save-btn, .card-cancel-btn { padding: 0.5rem 1rem; font-size: 0.85rem; }
        }
        
        @media (max-width: 768px) {
          .ui-card { padding: 16px; }
          .responsive-grid-2 { gap: 16px; margin-bottom: 16px; }
          .profile-avatar { width: 44px; height: 44px; font-size: 1.2rem; }
          .upload-icon { width: 16px; height: 16px; }
          .field-grid { grid-template-columns: 1fr; gap: 1rem; }
          .card-edit-btn, .card-save-btn, .card-cancel-btn { min-width: fit-content; }
          .profile-bar-content { flex-direction: column; }
          .profile-bar-divider { width: 100%; height: 1px; margin: 16px 0; }
        }

        @media (max-width: 640px) {
          .main-container { padding: 1rem; }
        }
      `}</style>
      <AppNavbar />

      <main className="main-container">
        
        {/* Combined Profile & Hours Bar */}
        <RevealBox delay={0}>
          <div className="ui-card" style={{ marginBottom: "32px", padding: "16px" }}>
            {editingGeneral ? (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
                  <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                    <div className="profile-avatar">
                      {displayName.split(" ").map((w: string) => w[0]).slice(0, 2).join("")}
                    </div>
                    <h2 style={{ fontSize: "20px", fontWeight: 700, color: displayName === "—" ? "#cbd5e1" : "#0f172a", margin: 0 }}>{displayName}</h2>
                  </div>
                </div>
                <div className="field-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
                  <FieldInput label="Full Name" value={generalForm.name} onChange={(v) => setGeneralForm({ ...generalForm, name: v })} />
                  <FieldInput label="Program & Year" value={generalForm.program} onChange={(v) => setGeneralForm({ ...generalForm, program: v })} />
                  <FieldInput label="Email Address" type="email" value={generalForm.email} onChange={(v) => setGeneralForm({ ...generalForm, email: v })} />
                  <FieldInput label="Phone Number" value={generalForm.phone} onChange={(v) => setGeneralForm({ ...generalForm, phone: v })} />
                </div>
                <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "1.5rem" }}>
                  <button className="card-cancel-btn" onClick={() => setEditingGeneral(false)}>Cancel</button>
                  <button className="card-save-btn" onClick={handleSaveGeneral}>Save Profile</button>
                </div>
              </>
            ) : (
              <div className="profile-bar-content">
                <div className="profile-bar-left">
                  <div className="profile-avatar">
                    {displayName.split(" ").map((w: string) => w[0]).slice(0, 2).join("")}
                  </div>
                  <div style={{ flex: 1, minWidth: 0, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap" }}>
                    <div>
                      <h2 style={{ fontSize: "20px", fontWeight: 700, color: displayName === "—" ? "#cbd5e1" : "#0f172a", margin: "0 0 0.15rem 0" }}>{displayName}</h2>
                      <div style={{ fontSize: "clamp(0.85rem, 2vw, 0.95rem)", color: displayProgram === "—" ? "#cbd5e1" : "#64748b", fontWeight: 600 }}>{displayProgram}</div>
                      <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.35rem", fontSize: "0.8rem", color: "#94a3b8", fontWeight: 500, flexWrap: "wrap", alignItems: "center" }}>
                        <span>{profileData?.email || "—"}</span>
                        {profileData?.phone && (
                          <>
                            <span style={{ color: "#cbd5e1" }}>&middot;</span>
                            <span>{profileData.phone}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <button className="card-edit-btn" onClick={() => setEditingGeneral(true)} style={{ flexShrink: 0 }}>Edit Profile</button>
                  </div>
                </div>
                <div className="profile-bar-divider" />
                <div className="profile-bar-hours" style={{ justifyContent: "space-between", paddingTop: "4px", paddingBottom: "2px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px", flexWrap: "wrap", gap: "12px" }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>{hoursRendered.toFixed(2)}</span>
                      <span style={{ fontSize: "clamp(0.8rem, 1.5vw, 0.9rem)", color: "#64748b", fontWeight: 700 }}>/ 300 hrs</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
                      <StatusBadge status={hoursRendered >= 300 ? "approved" : hoursRendered > 0 ? "pending" : "not_submitted"} />
                    </div>
                  </div>
                  <div style={{ width: "100%", height: 10, background: "#f1f5f9", borderRadius: 9999, overflow: "hidden", marginBottom: "10px" }}>
                    <div style={{ width: `${Math.min((hoursRendered / 300) * 100, 100)}%`, height: "100%", background: "linear-gradient(90deg, #3b82f6, #6366f1)", transition: "width 0.5s ease" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "clamp(0.8rem, 2vw, 0.9rem)", gap: "12px" }}>
                    <span style={{ color: "#3b82f6", fontWeight: 800, whiteSpace: "nowrap" }}>{Math.round((hoursRendered / 300) * 100)}% Complete</span>
                    <span style={{ color: "#64748b", fontWeight: 700, whiteSpace: "nowrap" }}>{Math.max(0, 300 - hoursRendered).toFixed(2)} Hours Remaining</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </RevealBox>


        <div style={{ marginBottom: "32px" }}>
          {/* OJT Deployment */}
          <RevealBox delay={0.2}>
            <div className="ui-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>OJT Deployment</h2>
                  {deploymentIncomplete && (
                    <span title="Some deployment details are still blank" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: "50%", background: "#fef3c7", color: "#b45309", fontSize: "0.85rem", fontWeight: 800 }}>!</span>
                  )}
                </div>
                {!deploymentLoading && (deployment?.status === "pending_confirmation" || deployment?.status === "confirmed") && !editingOjt && (
                  <button className="card-edit-btn" onClick={() => { setOjtFormOriginal(ojtForm); setUseCustomCompany(false); setEditingOjt(true); }}>Edit Details</button>
                )}
              </div>

              {deploymentLoading ? (
                <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center", alignItems: "center", padding: "2rem 0", color: "#94a3b8", fontSize: "1rem", fontWeight: 600 }}>
                  Loading deployment...
                </div>
              ) : !deployment ? (
                <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center", alignItems: "center", padding: "2rem 0", textAlign: "center" }}>
                  <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#334155", marginBottom: "0.5rem" }}>No OJT Deployment on Record</div>
                  <div style={{ fontSize: "0.95rem", color: "#64748b" }}>Contact your coordinator once your company assignment has been synced.</div>
                </div>
              ) : editingOjt ? (
                <div style={{ marginTop: "0.5rem" }}>
                  <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#475569", marginBottom: "0.5rem" }}>Company Assignment</label>
                    <select
                      value={useCustomCompany ? "other" : (ojtForm.company_id ?? "")}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v === "other") {
                          setUseCustomCompany(true);
                          setOjtForm({ ...ojtForm, company_id: null });
                        } else {
                          setUseCustomCompany(false);
                          setOjtForm({ ...ojtForm, company_id: v ? parseInt(v, 10) : null, company_name: "" });
                        }
                      }}
                      style={{ width: "100%", padding: "0.8rem 1rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1", fontSize: "1rem", outline: "none", boxSizing: "border-box", background: "white" }}
                    >
                      <option value="">-- Select Company --</option>
                      {companies.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                      <option value="other">Other — not listed</option>
                    </select>
                    {useCustomCompany && (
                      <div style={{ marginTop: "1rem" }}>
                        <FieldInput label="Company Name" value={ojtForm.company_name} onChange={(v) => setOjtForm({ ...ojtForm, company_name: v })} />
                      </div>
                    )}
                  </div>
                  <div className="field-grid">
                    <FieldInput label="OJT Role" value={ojtForm.role} onChange={(v) => setOjtForm({ ...ojtForm, role: v })} />
                    <FieldInput label="Supervisor" value={ojtForm.supervisor_name} onChange={(v) => setOjtForm({ ...ojtForm, supervisor_name: v })} />
                    <FieldInput label="Supervisor Contact" value={ojtForm.supervisor_contact} onChange={(v) => setOjtForm({ ...ojtForm, supervisor_contact: v })} />
                    <FieldInput type="date" label="Start Date" value={ojtForm.start_date} onChange={(v) => setOjtForm({ ...ojtForm, start_date: v })} />
                    <FieldInput type="date" label="End Date" value={ojtForm.end_date} onChange={(v) => setOjtForm({ ...ojtForm, end_date: v })} />
                  </div>
                  <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "1.5rem" }}>
                    <button className="card-cancel-btn" onClick={() => setEditingOjt(false)} disabled={savingOjt}>Cancel</button>
                    <button className="card-save-btn" onClick={handleSaveOjt} disabled={savingOjt}>
                      {savingOjt ? "Saving..." : "Confirm Details"}
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                  {deployment.source === "roster_sync_detected" && deployment.status === "pending_confirmation" && (
                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", background: "#fefce8", border: "1px solid #fde68a", borderRadius: "0.75rem", padding: "1rem 1.25rem", marginBottom: "1.5rem" }}>
                      <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>⚠️</span>
                      <div style={{ fontSize: "0.9rem", color: "#854d0e", fontWeight: 600, lineHeight: 1.5 }}>
                        This information was auto-detected from our records — please review it for accuracy.
                      </div>
                    </div>
                  )}
                  <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.35rem" }}>
                    {deployment.company?.name || "No Company Assigned"}
                  </div>
                  <div style={{ fontSize: "1rem", color: "#64748b", marginBottom: "2rem" }}>
                    {deployment.company?.address || "Location pending..."}
                  </div>
                  <div className="field-grid" style={{ marginBottom: "1.5rem" }}>
                    <FieldDisplay label="Supervisor" value={deployment.supervisor_name || ""} />
                    <FieldDisplay label="Role" value={deployment.role || ""} />
                    <FieldDisplay label="Start Date" value={deployment.start_date ? deployment.start_date.slice(0, 10) : ""} />
                    <FieldDisplay label="End Date" value={deployment.end_date ? deployment.end_date.slice(0, 10) : ""} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: "1.25rem", borderTop: "2px solid #f1f5f9" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase" }}>Deployment Status</span>
                    <StatusBadge status={deployment.status === "confirmed" ? "approved" : "pending"} />
                  </div>
                </div>
              )}
            </div>
          </RevealBox>

        </div>

        {/* Required Documents Section */}
        <RevealBox delay={0.3}>
          <div id="req-docs" className="ui-card" style={{ padding: 0, overflow: "hidden", marginBottom: "32px" }}>
            <div style={{ padding: "16px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: 0 }}>Required Documents</h2>
            </div>
            
            {documentsLoading ? (
              <div style={{ textAlign: "center", color: "#94a3b8", padding: "4rem", fontSize: "1.25rem", fontWeight: 600 }}>Loading documents...</div>
            ) : (
              ["before", "during", "after", "other"].map((phase, phaseIdx) => {
                const isOpen = openSection === phase;
                const count = documents.filter(d => d.phase === phase).length;
                return (
                  <div key={phase}>
                    <button className={`accordion-header${isOpen ? " open" : ""}`} onClick={() => setOpenSection(prev => prev === phase ? null : phase)}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", flex: 1 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                          backgroundColor: isOpen ? "#1d4ed8" : "#f1f5f9",
                          color: isOpen ? "white" : "#64748b",
                          fontSize: "0.72rem", fontWeight: 800,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
                          boxShadow: isOpen ? "0 4px 12px rgba(29,78,216,0.35)" : "none",
                          transform: isOpen ? "scale(1.1)" : "scale(1)",
                        }}>
                          {String(phaseIdx + 1).padStart(2, "0")}
                        </div>
                        <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#0f172a", textTransform: "capitalize", letterSpacing: "-0.01em" }}>
                          {phase === "other" ? "Other Documents" : `${phase} OJT`}
                        </span>
                      </div>
                      
                      <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", flexShrink: 0 }}>
                        <span style={{ color: isOpen ? "#1d4ed8" : "#94a3b8", transition: "color 0.2s" }}>
                          <svg className={`accordion-chevron${isOpen ? " open" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </span>
                      </div>
                    </button>

                  {openSection === phase && (
                    <div style={{ padding: "16px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                      {phase === "during" ? (
                        <div>
                          {/* Week Navigation */}
                          <div style={{ display: "flex", gap: "0.75rem", overflowX: "auto", paddingBottom: "1.5rem", borderBottom: "2px solid #e2e8f0", marginBottom: "2rem" }}>
                            {weeksArray.map(w => (
                              <button key={w} onClick={() => setActiveWeek(w)} style={{ padding: "0.75rem 1.75rem", borderRadius: "9999px", border: "none", background: activeWeek === w ? "#0f172a" : "white", color: activeWeek === w ? "white" : "#475569", borderStyle: "solid", borderWidth: 1, borderColor: activeWeek === w ? "#0f172a" : "#cbd5e1", fontSize: "1rem", fontWeight: 800, cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap", boxShadow: activeWeek === w ? "0 4px 10px rgba(15,23,42,0.2)" : "none" }}>
                                Week {w}
                              </button>
                            ))}
                            <button onClick={() => setWeeksArray([...weeksArray, Math.max(...weeksArray) + 1])} style={{ padding: "0.75rem 1.75rem", borderRadius: "9999px", border: "2px dashed #cbd5e1", background: "transparent", color: "#64748b", fontSize: "1rem", fontWeight: 800, cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap" }} onMouseEnter={(e) => {e.currentTarget.style.borderColor = "#94a3b8"; e.currentTarget.style.color = "#334155"}} onMouseLeave={(e) => {e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.color = "#64748b"}}>
                              + Add Week
                            </button>
                          </div>

                          {/* Week Info Card */}
                          <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "1rem", padding: "2rem", marginBottom: "2.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
                            <div>
                              <h3 style={{ margin: "0 0 0.35rem 0", fontSize: "1.4rem", fontWeight: 800, color: "#0f172a" }}>Week Schedule</h3>
                              <div style={{ fontSize: "1rem", color: "#64748b" }}>Edit dates for this specific week</div>
                            </div>
                            <div style={{ display: "flex", gap: "1.25rem", alignItems: "center" }}>
                              <input type="date" style={{ padding: "0.75rem 1rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1", fontSize: "1rem", outline: "none", color: "#475569", fontWeight: 600 }} />
                              <span style={{ color: "#94a3b8", fontWeight: 800, fontSize: "1.1rem" }}>—</span>
                              <input type="date" style={{ padding: "0.75rem 1rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1", fontSize: "1rem", outline: "none", color: "#475569", fontWeight: 600 }} />
                            </div>
                          </div>

                          {/* Week Uploads Grid */}
                          <div className="upload-grid">
                            {REQUIRED_DOCUMENTS.filter(r => r.phase === "during").map(req => {
                              let existingDoc = documents.find(d => d.week === activeWeek && d.name === req.title);
                              if (!existingDoc) {
                                existingDoc = { id: `${req.id}-week-${activeWeek}`, name: req.title, phase: "during", status: "not_submitted", date: "", week: activeWeek };
                              }
                              return (
                                <DocumentCardItem key={`${req.id}-w${activeWeek}`} doc={existingDoc} onUpload={handleUpload} onRemove={handleRemoveDocument} onView={handleViewPdf} />
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="upload-grid">
                          {documents.filter(d => d.phase === phase).map(doc => (
                            <DocumentCardItem key={doc.id} doc={doc} onUpload={handleUpload} onRemove={handleRemoveDocument} onView={handleViewPdf} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
            )}
          </div>
        </RevealBox>

        {/* Submission History Table */}
        <RevealBox delay={0.4}>
          <div className="ui-card" style={{ padding: "16px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: "0 0 20px 0" }}>Submission History</h2>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "1rem", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #e2e8f0", color: "#64748b" }}>
                    <th style={{ padding: "1.25rem 1rem", fontWeight: 800, textTransform: "uppercase", fontSize: "0.85rem", letterSpacing: "0.05em" }}>Date Submitted</th>
                    <th style={{ padding: "1.25rem 1rem", fontWeight: 800, textTransform: "uppercase", fontSize: "0.85rem", letterSpacing: "0.05em" }}>Document Name</th>
                    <th style={{ padding: "1.25rem 1rem", fontWeight: 800, textTransform: "uppercase", fontSize: "0.85rem", letterSpacing: "0.05em" }}>Category</th>
                    <th style={{ padding: "1.25rem 1rem", fontWeight: 800, textTransform: "uppercase", fontSize: "0.85rem", letterSpacing: "0.05em" }}>Week</th>
                    <th style={{ padding: "1.25rem 1rem", fontWeight: 800, textTransform: "uppercase", fontSize: "0.85rem", letterSpacing: "0.05em" }}>Status</th>
                    <th style={{ padding: "1.25rem 1rem", fontWeight: 800, textTransform: "uppercase", fontSize: "0.85rem", letterSpacing: "0.05em" }}>Professor Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.filter(d => d.status === "submitted").length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: "3rem", textAlign: "center", color: "#94a3b8", fontSize: "1.1rem", fontWeight: 600 }}>No submissions yet.</td>
                    </tr>
                  ) : (
                    documents.filter(d => d.status === "submitted").map((doc, idx) => (
                      <tr key={`${doc.id}-${idx}`} style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                        <td style={{ padding: "1.25rem 1rem", color: "#475569", fontWeight: 500 }}>{doc.date}</td>
                        <td style={{ padding: "1.25rem 1rem", fontWeight: 700, color: "#0f172a" }}>{doc.name}</td>
                        <td style={{ padding: "1.25rem 1rem", color: "#475569", textTransform: "capitalize" }}>{doc.phase === "other" ? "Other" : `${doc.phase} OJT`}</td>
                        <td style={{ padding: "1.25rem 1rem", color: !doc.week ? "#cbd5e1" : "#475569", fontWeight: 600 }}>{doc.week || "—"}</td>
                        <td style={{ padding: "1.25rem 1rem" }}>
                          <StatusBadge status={doc.reviewStatus || "pending"} />
                        </td>
                        <td style={{ padding: "1.25rem 1rem", color: !doc.rejectionReason ? "#cbd5e1" : (doc.reviewStatus === "rejected" ? "#b91c1c" : "#475569"), fontStyle: doc.reviewStatus === "rejected" ? "normal" : "italic", fontWeight: doc.reviewStatus === "rejected" ? 600 : 400 }}>
                          {doc.rejectionReason || "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </RevealBox>

      </main>

      {viewingDoc && (
        <DocumentViewerModal
          title={viewingDoc.title}
          fileLink={viewingDoc.link}
          onClose={() => setViewingDoc(null)}
        />
      )}

      <ConfirmDialog
        open={!!deletingDoc}
        variant="confirm"
        title="Delete Uploaded File"
        message="Are you sure you want to delete this uploaded file? This action cannot be undone."
        confirmLabel="Delete"
        danger={true}
        onConfirm={confirmDeleteDocument}
        onCancel={() => setDeletingDoc(null)}
      />
    </div>
    </ProtectedRoute>
  );
}