"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useRole, Role } from "../context/RoleContext";
import { fetchApi } from "../../lib/api";
import CompanySelect from "./CompanySelect";
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
function DocumentCardItem({ doc, onUpload, onRemove, onView }: { doc: { id: string, name: string, status: string, date: string, fileLink?: string, reviewStatus?: "pending" | "approved" | "rejected", rejectionReason?: string | null, week?: number }, onUpload: (id: string, file: File, week?: number) => void, onRemove: (id: string) => void, onView: (title: string, fileLink: string) => void }) {
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
        {/* @ts-expect-error status prop type mismatch with StatusBadge */}
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
          <div style={{ background: "#eff6ff", borderRadius: "0.75rem", padding: "20px 0", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <span style={{ color: "#3b82f6", fontSize: "1rem", fontWeight: 700 }}>Uploading...</span>
          </div>
        ) : (
          <div className="pdf-upload-box" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} style={{ position: "relative", background: dragActive ? "#eff6ff" : "#f8fafc", border: `2px dashed ${dragActive ? "#3b82f6" : "#cbd5e1"}`, borderRadius: "0.75rem", padding: "20px 0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s" }}>
            <input type="file" accept="application/pdf" onChange={handleChange} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%" }} />
            <IconUpload />
            <span style={{ fontSize: "0.95rem", fontWeight: 600, color: dragActive ? "#3b82f6" : "#64748b", marginTop: "0.75rem" }}>{dragActive ? "Drop PDF here" : "Drag PDF or Click to browse"}</span>
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
  const [ojtForm, setOjtForm] = useState({ company_id: "", ojt_role: "", ojt_supervisor: "", ojt_start_date: "", ojt_end_date: "" });
  const [savingOjt, setSavingOjt] = useState(false);

  const [openSection, setOpenSection] = useState<string | null>("before");
  const [openHistorySection, setOpenHistorySection] = useState<string | null>(null);
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
        setOjtForm({
          company_id: data.company_id ? String(data.company_id) : "",
          ojt_role: data.ojt_role || "",
          ojt_supervisor: data.ojt_supervisor || "",
          ojt_start_date: data.ojt_start_date || "",
          ojt_end_date: data.ojt_end_date || ""
        });
      })
      .catch((err: any) => { if (err.status !== 401) console.error("Failed to load profile:", err); })
      .finally(() => setProfileLoading(false));

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
    setSavingOjt(true);
    try {
      const res = await fetchApi('/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          company_id: ojtForm.company_id ? parseInt(ojtForm.company_id) : null,
          ojt_role: ojtForm.ojt_role,
          ojt_supervisor: ojtForm.ojt_supervisor,
          ojt_start_date: ojtForm.ojt_start_date || null,
          ojt_end_date: ojtForm.ojt_end_date || null
        })
      });
      setProfileData((prev: any) => prev ? { ...prev, ...res.user, company: res.user.company, company_id: res.user.company_id } : prev);
      if (user) login({ ...user, company_id: res.user.company_id, company: res.user.company });
      setEditingOjt(false);
    } catch (err: any) { alert(err.message || "Failed to update OJT details."); } finally { setSavingOjt(false); }
  };

  const hoursRendered = profileData ? (parseFloat(profileData.hours_rendered) || 0) : 0;
  const displayName = profileData?.name || "—";
  const displayProgram = profileData?.program || "BSCpE 2-1";

  return (
    <ProtectedRoute>
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)", fontFamily: "var(--font-geist-sans, system-ui, sans-serif)", display: "flex", flexDirection: "column" }}>      <style>{`
        .main-container { width: 95%; max-width: 1600px; margin: 0 auto; padding: 3rem 0; flex: 1; }
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
        .accordion-header { width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 1rem 16px; background: white; border: none; border-bottom: 1px solid #e2e8f0; border-left: 4px solid transparent; cursor: pointer; transition: all 0.2s ease; font-family: inherit; font-size: inherit; }
        .accordion-header:hover { background: #f8fafc; border-left-color: #cbd5e1; }
        .accordion-header.open { background: #f0f9ff; border-left-color: #3b82f6; }
        .accordion-chevron { width: 16px; height: 16px; color: #64748b; transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1); flex-shrink: 0; }
        .accordion-chevron.open { transform: rotate(90deg); color: #3b82f6; }
        .pdf-upload-box { transition: all 0.2s ease-in-out; }
        .pdf-upload-box:hover { background: #f1f5f9 !important; border-color: #94a3b8 !important; }
        .rejected-preview-btn { background: white; border: 1px solid #cbd5e1; color: #475569; border-radius: 0.5rem; padding: 0.6rem 1.2rem; font-size: 0.9rem; font-weight: 700; cursor: pointer; transition: all 0.15s; }
        .rejected-preview-btn:hover { background: #f8fafc; color: #0f172a; }
        .rejected-delete-btn { background: #fee2e2; border: 1px solid #fca5a5; color: #b91c1c; border-radius: 0.5rem; padding: 0.6rem 1.2rem; font-size: 0.9rem; font-weight: 700; cursor: pointer; transition: all 0.15s; }
        .rejected-delete-btn:hover { background: #fecaca; color: #991b1b; }
        
        @media (max-width: 1024px) {
          .main-container { padding: 2rem 0; width: 92%; }
          .ui-card { padding: 20px; }
          .responsive-grid-2 { gap: 20px; margin-bottom: 20px; }
          .card-edit-btn, .card-save-btn, .card-cancel-btn { padding: 0.5rem 1rem; font-size: 0.85rem; }
        }
        
        @media (max-width: 768px) {
          .main-container { padding: 1.5rem 1rem; width: 100%; }
          .ui-card { padding: 16px; }
          .responsive-grid-2 { gap: 16px; margin-bottom: 16px; }
          .profile-avatar { width: 44px; height: 44px; font-size: 1.2rem; }
          .upload-icon { width: 16px; height: 16px; }
          .field-grid { grid-template-columns: 1fr; gap: 1rem; }
          .card-edit-btn, .card-save-btn, .card-cancel-btn { min-width: fit-content; }
          .profile-bar-content { flex-direction: column; }
          .profile-bar-divider { width: 100%; height: 1px; margin: 16px 0; }
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
                <h2 style={{ fontSize: "clamp(1.2rem, 3vw, 1.4rem)", fontWeight: 800, color: "#0f172a", margin: 0 }}>OJT Deployment</h2>
                {!editingOjt && <button className="card-edit-btn" onClick={() => setEditingOjt(true)}>Edit Details</button>}
              </div>

              {editingOjt ? (
                <div style={{ marginTop: "0.5rem" }}>
                  <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#475569", marginBottom: "0.5rem" }}>Company Assignment</label>
                    <CompanySelect value={ojtForm.company_id} onChange={(val) => setOjtForm({ ...ojtForm, company_id: val })} />
                  </div>
                  <div className="field-grid">
                    <FieldInput label="OJT Role" value={ojtForm.ojt_role} onChange={(v) => setOjtForm({ ...ojtForm, ojt_role: v })} />
                    <FieldInput label="Supervisor" value={ojtForm.ojt_supervisor} onChange={(v) => setOjtForm({ ...ojtForm, ojt_supervisor: v })} />
                    <FieldInput type="date" label="Start Date" value={ojtForm.ojt_start_date} onChange={(v) => setOjtForm({ ...ojtForm, ojt_start_date: v })} />
                    <FieldInput type="date" label="End Date" value={ojtForm.ojt_end_date} onChange={(v) => setOjtForm({ ...ojtForm, ojt_end_date: v })} />
                  </div>
                  <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "1.5rem" }}>
                    <button className="card-cancel-btn" onClick={() => setEditingOjt(false)}>Cancel</button>
                    <button className="card-save-btn" onClick={handleSaveOjt}>Save Details</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                  <div style={{ fontSize: "clamp(1.1rem, 3vw, 1.3rem)", fontWeight: 800, color: "#0f172a", marginBottom: "4px" }}>
                    {profileData?.company?.name || "No Company Assigned"}
                  </div>
                  <div style={{ fontSize: "clamp(0.9rem, 2vw, 1rem)", color: "#64748b", marginBottom: "24px" }}>
                    {profileData?.company?.address || "Location pending..."}
                  </div>
                  <div className="field-grid" style={{ marginBottom: "24px" }}>
                    <FieldDisplay label="Supervisor" value={profileData?.ojt_supervisor || ""} />
                    <FieldDisplay label="Role" value={profileData?.ojt_role || ""} />
                    <FieldDisplay label="Start Date" value={profileData?.ojt_start_date || ""} />
                    <FieldDisplay label="End Date" value={profileData?.ojt_end_date || ""} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: "16px", borderTop: "2px solid #f1f5f9", flexWrap: "wrap", gap: "16px" }}>
                    <span style={{ fontSize: "clamp(0.75rem, 2vw, 0.85rem)", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase" }}>Deployment Status</span>
                    <StatusBadge status={profileData?.company ? "approved" : "not_submitted"} />
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
              ["before", "during", "after", "other"].map(phase => (
                <div key={phase}>
                  <button className={`accordion-header${openSection === phase ? " open" : ""}`} onClick={() => setOpenSection(prev => prev === phase ? null : phase)}>
                    <span style={{ fontWeight: 800, fontSize: "clamp(0.9rem, 2.5vw, 1.1rem)", color: "#0f172a", textTransform: "capitalize" }}>
                      {phase === "other" ? "Other Documents" : `${phase} OJT`}
                    </span>
                    <svg className={`accordion-chevron${openSection === phase ? " open" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
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
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "24px" }}>
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
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "24px" }}>
                          {documents.filter(d => d.phase === phase).map(doc => (
                            <DocumentCardItem key={doc.id} doc={doc} onUpload={handleUpload} onRemove={handleRemoveDocument} onView={handleViewPdf} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </RevealBox>

        {/* Submission History Table */}
        <RevealBox delay={0.4}>
          <div className="ui-card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "16px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: 0 }}>Submission History</h2>
            </div>
            
            {documentsLoading ? (
              <div style={{ textAlign: "center", color: "#94a3b8", padding: "4rem", fontSize: "1.25rem", fontWeight: 600 }}>Loading history...</div>
            ) : (
              ["before", "during", "after", "other"].map(phase => {
                const phaseDocs = documents.filter(d => d.status === "submitted" && d.phase === phase);
                
                return (
                  <div key={`history-${phase}`}>
                    <button className={`accordion-header${openHistorySection === phase ? " open" : ""}`} onClick={() => setOpenHistorySection(prev => prev === phase ? null : phase)}>
                      <span style={{ fontWeight: 800, fontSize: "clamp(0.9rem, 2.5vw, 1.1rem)", color: "#0f172a", textTransform: "capitalize" }}>
                        {phase === "other" ? "Other Documents" : `${phase} OJT`} <span style={{ color: "#64748b", fontWeight: 600, fontSize: "0.9rem", marginLeft: "8px" }}>({phaseDocs.length})</span>
                      </span>
                      <svg className={`accordion-chevron${openHistorySection === phase ? " open" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </button>

                    {openHistorySection === phase && (
                      <div style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                        {phaseDocs.length === 0 ? (
                           <div style={{ padding: "3rem", textAlign: "center", color: "#94a3b8", fontSize: "1.1rem", fontWeight: 600 }}>No submissions in this category yet.</div>
                        ) : (
                          <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "1rem", textAlign: "left" }}>
                              <thead>
                                <tr style={{ borderBottom: "2px solid #e2e8f0", color: "#64748b" }}>
                                  <th style={{ padding: "1.25rem 1rem", fontWeight: 800, textTransform: "uppercase", fontSize: "0.85rem", letterSpacing: "0.05em" }}>Date Submitted</th>
                                  <th style={{ padding: "1.25rem 1rem", fontWeight: 800, textTransform: "uppercase", fontSize: "0.85rem", letterSpacing: "0.05em" }}>Document Name</th>
                                  <th style={{ padding: "1.25rem 1rem", fontWeight: 800, textTransform: "uppercase", fontSize: "0.85rem", letterSpacing: "0.05em" }}>Week</th>
                                  <th style={{ padding: "1.25rem 1rem", fontWeight: 800, textTransform: "uppercase", fontSize: "0.85rem", letterSpacing: "0.05em" }}>Status</th>
                                  <th style={{ padding: "1.25rem 1rem", fontWeight: 800, textTransform: "uppercase", fontSize: "0.85rem", letterSpacing: "0.05em" }}>Professor Remarks</th>
                                </tr>
                              </thead>
                              <tbody>
                                {phaseDocs.map((doc, idx) => (
                                  <tr key={`${doc.id}-${idx}`} style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = "#f1f5f9"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                                    <td style={{ padding: "1.25rem 1rem", color: "#475569", fontWeight: 500 }}>{doc.date}</td>
                                    <td style={{ padding: "1.25rem 1rem", fontWeight: 700, color: "#0f172a" }}>{doc.name}</td>
                                    <td style={{ padding: "1.25rem 1rem", color: !doc.week ? "#cbd5e1" : "#475569", fontWeight: 600 }}>{doc.week || "—"}</td>
                                    <td style={{ padding: "1.25rem 1rem" }}>
                                      <StatusBadge status={doc.reviewStatus || "pending"} />
                                    </td>
                                    <td style={{ padding: "1.25rem 1rem", color: !doc.rejectionReason ? "#cbd5e1" : (doc.reviewStatus === "rejected" ? "#b91c1c" : "#475569"), fontStyle: doc.reviewStatus === "rejected" ? "normal" : "italic", fontWeight: doc.reviewStatus === "rejected" ? 600 : 400 }}>
                                      {doc.rejectionReason || "—"}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
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