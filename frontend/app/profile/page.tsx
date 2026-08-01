"use client";

import { useState, useRef, useEffect } from "react";
import { useRole, Role } from "../context/RoleContext";
import { fetchApi } from "../../lib/api";
import CompanySelect from "./CompanySelect";
import DocumentViewerModal from "../components/DocumentViewerModal";
import AppNavbar from "../components/AppNavbar";

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
      ...style
    }}>
      {children}
    </div>
  );
}

/* ═══════════════════════════ Icons ═══════════════════════════ */
function IconCheck() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
      stroke="#10b981" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

function IconUpload() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
    </svg>
  );
}

/* ═══════════════════════════ Shared field components ═══════════ */
function FieldDisplay({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: "0.75rem", color: "#94a3b8", textTransform: "uppercase", fontWeight: 600, marginBottom: "0.25rem" }}>{label}</div>
      <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#475569" }}>{value || "—"}</div>
    </div>
  );
}

function FieldInput({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#475569", marginBottom: "0.4rem" }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: "100%", padding: "0.6rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1", fontSize: "0.85rem", outline: "none", boxSizing: "border-box" }}
      />
    </div>
  );
}

/* ═══════════════════════════ Document row ══════════════════════ */
function DocumentRow({ doc, onUpload, onRemove, onView }: { doc: { id: number, name: string, status: string, date: string, fileLink?: string, reviewStatus?: "pending" | "approved" | "rejected", rejectionReason?: string | null }, onUpload: (id: number, file: File) => void, onRemove: (id: number) => void, onView: (title: string, fileLink: string) => void }) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type !== "application/pdf") {
        alert("Only PDF files are allowed.");
        return;
      }
      onUpload(doc.id, file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== "application/pdf") {
        alert("Only PDF files are allowed.");
        return;
      }
      onUpload(doc.id, file);
    }
  };

  const reviewBadge = (() => {
    if (!doc.reviewStatus) return null;
    const map = {
      pending: { bg: "#fef9c3", color: "#a16207", label: "Pending Review" },
      approved: { bg: "#dcfce7", color: "#166534", label: "Approved" },
      rejected: { bg: "#fee2e2", color: "#b91c1c", label: "Rejected" },
    } as const;
    const s = map[doc.reviewStatus];
    return (
      <span style={{ background: s.bg, color: s.color, padding: "0.3rem 0.8rem", borderRadius: "9999px", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {s.label}
      </span>
    );
  })();

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "1.25rem", borderBottom: "1px solid #f1f5f9"
    }}>
      <div>
        <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#0f172a" }}>{doc.name}</div>
        <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.25rem" }}>{doc.date}</div>
        {doc.reviewStatus === "rejected" && doc.rejectionReason && (
          <div style={{ fontSize: "0.75rem", color: "#b91c1c", marginTop: "0.35rem", fontStyle: "italic" }}>
            Reason: {doc.rejectionReason}
          </div>
        )}
      </div>

      {doc.status === "submitted" && (
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {doc.fileLink && (
            <button onClick={() => onView(doc.name, doc.fileLink!)} style={{ background: "#e0f2fe", color: "#0369a1", border: "none", padding: "0.3rem 0.8rem", borderRadius: "9999px", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", cursor: "pointer", transition: "opacity 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.opacity = "0.8"} onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}>View PDF</button>
          )}
          <button onClick={() => onRemove(doc.id)} style={{ background: "#fee2e2", color: "#b91c1c", border: "none", padding: "0.3rem 0.8rem", borderRadius: "9999px", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", cursor: "pointer", transition: "opacity 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.opacity = "0.8"} onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}>Remove</button>
          {reviewBadge}
        </div>
      )}

      {doc.status === "uploading" && (
        <span style={{ color: "#3b82f6", fontSize: "0.75rem", fontWeight: 700, animation: "pulse 1s infinite", textTransform: "uppercase", letterSpacing: "0.05em" }}>Uploading...</span>
      )}

      {doc.status === "pending" && (
        <div
          className="pdf-upload-box"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          style={{
            position: "relative",
            background: dragActive ? "#eff6ff" : "#f8fafc",
            border: `2px dashed ${dragActive ? "#3b82f6" : "#cbd5e1"}`,
            borderRadius: "0.75rem", padding: "0.75rem 1.25rem",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            cursor: "pointer", transition: "all 0.2s", minWidth: 160
          }}
        >
          <input
            type="file"
            accept="application/pdf"
            onChange={handleChange}
            style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%" }}
          />
          <IconUpload />
          <span style={{ fontSize: "0.7rem", fontWeight: 600, color: dragActive ? "#3b82f6" : "#64748b", marginTop: "0.25rem" }}>
            {dragActive ? "Drop PDF here" : "Drag PDF or Click"}
          </span>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════ Data shapes ═══════════════════════ */
interface Company {
  id: number;
  name: string;
  address: string | null;
}

interface MeResponse {
  id: number;
  name: string;
  email: string;
  role: Role;
  company_id: number | null;
  company: Company | null;
  must_change_password: boolean;
  ojt_role: string | null;
  ojt_supervisor: string | null;
  emergency_contact_name: string | null;
  emergency_contact_number: string | null;
  phone: string | null;
  program: string | null;
  hours_rendered: string;
}

function toNum(v: string | null | undefined): number {
  if (v === null || v === undefined) return 0;
  const n = parseFloat(v);
  return Number.isNaN(n) ? 0 : n;
}

/* ═══════════════════════════ Page ════════════════════════════ */
export default function ProfilePage() {
  const { logout, login } = useRole();

  const [profileData, setProfileData] = useState<MeResponse | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [profilePic, setProfilePic] = useState<string | null>(null);

  // General Info card (name, email, phone, program, emergency contact)
  const [editingGeneral, setEditingGeneral] = useState(false);
  const [savingGeneral, setSavingGeneral] = useState(false);
  const [generalForm, setGeneralForm] = useState({
    name: "", email: "", phone: "", program: "",
    emergency_contact_name: "", emergency_contact_number: "",
  });

  // OJT Deployment card (company, ojt_role, ojt_supervisor)
  const [editingOjt, setEditingOjt] = useState(false);
  const [savingOjt, setSavingOjt] = useState(false);
  const [ojtForm, setOjtForm] = useState({ company_id: "", ojt_role: "", ojt_supervisor: "" });

  useEffect(() => {
    return () => {
      if (profilePic) {
        URL.revokeObjectURL(profilePic);
      }
    };
  }, [profilePic]);

  // Load real profile data from /me on mount.
  useEffect(() => {
    fetchApi('/me')
      .then((data: MeResponse) => {
        setProfileData(data);
        setGeneralForm({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          program: data.program || "",
          emergency_contact_name: data.emergency_contact_name || "",
          emergency_contact_number: data.emergency_contact_number || "",
        });
        setOjtForm({
          company_id: data.company_id ? String(data.company_id) : "",
          ojt_role: data.ojt_role || "",
          ojt_supervisor: data.ojt_supervisor || "",
        });
      })
      .catch((err: unknown) => {
        console.error("Failed to load profile:", err);
      })
      .finally(() => setProfileLoading(false));
  }, []);

  // Document catalog — the fixed set of requirement slots shown on this page.
  interface DocSlot {
    id: number;
    name: string;
    status: string;
    date: string;
    fileLink?: string;
    reviewStatus?: "pending" | "approved" | "rejected";
    rejectionReason?: string | null;
  }

  const [documents, setDocuments] = useState<DocSlot[]>([
    { id: 1, name: "Resume / CV", status: "pending", date: "Required before start" },
    { id: 2, name: "Endorsement Letter", status: "pending", date: "Required before start" },
    { id: 3, name: "Memorandum of Agreement", status: "pending", date: "Required before start" },
    { id: 4, name: "Medical Certificate", status: "pending", date: "Required before start" },
    { id: 5, name: "Parents' Consent", status: "pending", date: "Required before start" },
  ]);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<{ title: string; fileLink: string } | null>(null);

  // The student's current DTR submission (separate from the fixed Required
  // Documents catalog above — DTR is cumulative/superseding, so there is at
  // most one at a time, tracked by document_type === "dtr").
  const [dtrDoc, setDtrDoc] = useState<RealDocument | null>(null);
  const [dtrClaimedHours, setDtrClaimedHours] = useState("");
  const [dtrUploading, setDtrUploading] = useState(false);
  const [dtrDragActive, setDtrDragActive] = useState(false);

  interface RealDocument {
    id: number;
    document_type: string;
    file_link: string;
    status: "pending" | "approved" | "rejected";
    rejection_reason: string | null;
    created_at: string;
    claimed_hours: string | null;
  }

  useEffect(() => {
    fetchApi('/documents/mine')
      .then((data: { documents: RealDocument[] }) => {
        const real = data.documents || [];

        setDocuments(prev => prev.map(slot => {
          const match = real.find(d => d.document_type === slot.name);
          if (!match) return slot;

          return {
            ...slot,
            status: "submitted",
            date: new Date(match.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            fileLink: match.file_link,
            reviewStatus: match.status,
            rejectionReason: match.rejection_reason,
          };
        }));

        // documents/mine is already ordered newest-first, and DTRs supersede
        // each other on upload, so at most one dtr entry should ever exist.
        const dtr = real.find(d => d.document_type === "dtr") || null;
        setDtrDoc(dtr);
      })
      .catch((err: unknown) => {
        console.error("Failed to load existing documents:", err);
      })
      .finally(() => setDocumentsLoading(false));
  }, []);

  const handleUpload = async (id: number, file: File) => {
    setDocuments(docs => docs.map(d => d.id === id ? { ...d, status: "uploading" } : d));

    const docToUpload = documents.find(d => d.id === id);
    if (!docToUpload) return;

    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('document_type', docToUpload.name);

      const res = await fetchApi('/documents/upload', {
        method: 'POST',
        body: formData,
      });

      setDocuments(docs => docs.map(d =>
        d.id === id ? { ...d, status: "submitted", date: "Just now", fileLink: res.document?.file_link, reviewStatus: "pending", rejectionReason: null } : d
      ));
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message || 'Failed to upload document.');
      setDocuments(docs => docs.map(d =>
        d.id === id ? { ...d, status: "pending" } : d
      ));
    }
  };

  const submitDtr = async (file: File) => {
    const hoursNum = parseFloat(dtrClaimedHours);
    if (!dtrClaimedHours.trim() || Number.isNaN(hoursNum) || hoursNum <= 0) {
      alert("Enter the total hours you're claiming (a number greater than 0) before uploading.");
      return;
    }
    if (file.type !== "application/pdf") {
      alert("Only PDF files are allowed.");
      return;
    }

    setDtrUploading(true);
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('document_type', 'dtr');
      formData.append('claimed_hours', String(hoursNum));

      const res = await fetchApi('/documents/upload', {
        method: 'POST',
        body: formData,
      });

      setDtrDoc({
        id: res.document?.id,
        document_type: 'dtr',
        file_link: res.document?.file_link,
        status: 'pending',
        rejection_reason: null,
        created_at: res.document?.created_at || new Date().toISOString(),
        claimed_hours: String(hoursNum),
      });
      setDtrClaimedHours("");
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message || 'Failed to submit DTR.');
    } finally {
      setDtrUploading(false);
    }
  };

  const handleDtrDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDtrDragActive(true);
    } else if (e.type === "dragleave") {
      setDtrDragActive(false);
    }
  };

  const handleDtrDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDtrDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      submitDtr(e.dataTransfer.files[0]);
    }
  };

  const handleDtrFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      submitDtr(e.target.files[0]);
    }
  };

  // NOTE: no DELETE /documents/{id} endpoint yet — this only clears local UI
  // state, the document reappears on refresh since nothing is deleted server-side.
  const handleRemoveDocument = (id: number) => {
    setDocuments(docs => docs.map(d =>
      d.id === id ? { ...d, status: "pending", date: "Required before start", fileLink: undefined, reviewStatus: undefined, rejectionReason: undefined } : d
    ));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      if (profilePic) {
        URL.revokeObjectURL(profilePic);
      }
      const url = URL.createObjectURL(e.target.files[0]);
      setProfilePic(url);
    }
  };

  const handlePhotoRemove = () => {
    if (profilePic) {
      URL.revokeObjectURL(profilePic);
    }
    setProfilePic(null);
  };

  const handleSaveGeneral = async () => {
    setSavingGeneral(true);
    try {
      const res = await fetchApi('/profile', {
        method: 'PATCH',
        body: JSON.stringify(generalForm),
      });
      setProfileData(prev => prev ? { ...prev, ...res.user } : prev);
      setEditingGeneral(false);
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message || "Failed to update profile.");
    } finally {
      setSavingGeneral(false);
    }
  };

  const cancelGeneralEdit = () => {
    if (profileData) {
      setGeneralForm({
        name: profileData.name || "",
        email: profileData.email || "",
        phone: profileData.phone || "",
        program: profileData.program || "",
        emergency_contact_name: profileData.emergency_contact_name || "",
        emergency_contact_number: profileData.emergency_contact_number || "",
      });
    }
    setEditingGeneral(false);
  };

  const handleSaveOjt = async () => {
    setSavingOjt(true);
    try {
      let updatedCompany: Company | null = profileData?.company ?? null;
      let updatedCompanyId: number | null = profileData?.company_id ?? null;

      const companyChanged = ojtForm.company_id && ojtForm.company_id !== String(profileData?.company_id ?? "");
      if (companyChanged) {
        const companyRes = await fetchApi('/select-company', {
          method: 'POST',
          body: JSON.stringify({ company_id: ojtForm.company_id }),
        });
        updatedCompany = companyRes.company;
        updatedCompanyId = companyRes.company?.id ?? null;
        login({
          id: profileData!.id,
          name: profileData!.name,
          email: profileData!.email,
          role: profileData!.role,
          company_id: updatedCompanyId,
          company: updatedCompany
            ? { id: updatedCompany.id, name: updatedCompany.name, address: updatedCompany.address ?? undefined }
            : null,
        });
      }

      const profileRes = await fetchApi('/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          ojt_role: ojtForm.ojt_role,
          ojt_supervisor: ojtForm.ojt_supervisor,
        }),
      });

      setProfileData(prev => prev ? {
        ...prev,
        ...profileRes.user,
        company: updatedCompany,
        company_id: updatedCompanyId,
      } : prev);
      setEditingOjt(false);
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message || "Failed to update OJT deployment details.");
    } finally {
      setSavingOjt(false);
    }
  };

  const cancelOjtEdit = () => {
    if (profileData) {
      setOjtForm({
        company_id: profileData.company_id ? String(profileData.company_id) : "",
        ojt_role: profileData.ojt_role || "",
        ojt_supervisor: profileData.ojt_supervisor || "",
      });
    }
    setEditingOjt(false);
  };

  const hoursRendered = profileData ? toNum(profileData.hours_rendered) : null;
  const displayName = profileData?.name || "—";
  const displayProgram = profileData?.program || "Program not set";

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
      fontFamily: "var(--font-geist-sans, system-ui, sans-serif)",
      display: "flex", flexDirection: "column",
      position: "relative"
    }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .ui-card {
          background: white; border-radius: 1.25rem; padding: 1.75rem;
          box-shadow: 0 10px 30px rgba(0,0,0,0.04); border: 1px solid rgba(255,255,255,0.8);
        }
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.06);
        }
        .photo-upload-wrapper { position: relative; overflow: hidden; display: inline-block; }
        .photo-btn {
          background: rgba(255,255,255,0.9); border: 1px solid #e2e8f0; border-radius: 999px; padding: 0.4rem 0.8rem; font-size: 0.7rem; font-weight: 600; color: #475569; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .photo-upload-wrapper input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
        .pdf-upload-box:hover { background: #e2e8f0 !important; border-color: #94a3b8 !important; transform: translateY(-1px); box-shadow: 0 4px 10px rgba(0,0,0,0.08); }
        .hover-lift:hover, .hover-lift:has(input:hover) { background: #e2e8f0; color: #0f172a; transform: translateY(-1px); box-shadow: 0 4px 10px rgba(0,0,0,0.08); }
        .photo-upload-wrapper:hover .photo-btn,
        .photo-upload-wrapper:has(input:hover) .photo-btn { background: #e2e8f0; color: #0f172a; transform: translateY(-1px); box-shadow: 0 4px 10px rgba(0,0,0,0.08); }
        .card-edit-btn {
          background: none; border: 1px solid #cbd5e1; color: #475569; border-radius: 0.5rem;
          padding: 0.4rem 0.9rem; font-size: 0.78rem; font-weight: 600; cursor: pointer; transition: all 0.15s;
        }
        .card-edit-btn:hover { background: #f1f5f9; }
        .card-save-btn {
          background: #2563eb; color: white; border: none; border-radius: 0.5rem;
          padding: 0.45rem 1.1rem; font-size: 0.8rem; font-weight: 600; cursor: pointer;
        }
        .card-save-btn:disabled { background: #94a3b8; cursor: not-allowed; }
        .card-cancel-btn {
          background: transparent; color: #64748b; border: 1px solid #cbd5e1; border-radius: 0.5rem;
          padding: 0.45rem 1.1rem; font-size: 0.8rem; font-weight: 600; cursor: pointer;
        }
        .field-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 1.1rem;
        }
        @media (max-width: 768px) {
          .profile-header-inner { padding: 0 1.5rem 1.5rem !important; }
          .profile-avatar-wrap { margin-top: -45px !important; }
          .profile-avatar-wrap > div:first-child { width: 100px !important; height: 100px !important; font-size: 2.2rem !important; }
          .profile-top-grid { grid-template-columns: 1fr !important; }
          .field-grid { grid-template-columns: 1fr !important; }
          .profile-main { padding: 2rem 1rem !important; }
        }
        @media (max-width: 480px) {
          .ui-card { padding: 1rem !important; }
          .profile-cover { height: 120px !important; }
          .profile-avatar-wrap { margin-top: -35px !important; }
          .profile-avatar-wrap > div:first-child { width: 80px !important; height: 80px !important; font-size: 1.8rem !important; border-width: 4px !important; }
          .profile-name { font-size: 1.4rem !important; }
        }
      `}</style>

      <AppNavbar />

      <main className="profile-main" style={{ maxWidth: 1100, margin: "0 auto", padding: "3rem 2rem", flex: 1, width: "100%" }}>

        {/* Profile Header — avatar + name only, editing now lives in the cards below */}
        <RevealBox>
          <div style={{
            background: "white", borderRadius: "1.5rem",
            boxShadow: "0 15px 40px -5px rgba(0,0,0,0.08)", overflow: "hidden",
            marginBottom: "2.5rem", border: "1px solid rgba(255,255,255,0.5)"
          }}>
            <div className="profile-cover" style={{
              height: 160,
              background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
              position: "relative"
            }}>
              <div style={{ position: "absolute", inset: 0, opacity: 0.2, backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />
            </div>

            <div className="profile-header-inner" style={{ padding: "0 2.5rem 2.5rem", position: "relative" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", alignItems: "flex-end" }}>
                <div className="profile-avatar-wrap" style={{ marginTop: "-60px", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{
                    width: 130, height: 130, borderRadius: "50%",
                    background: profilePic ? `url(${profilePic}) center/cover` : "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
                    border: "6px solid white", display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 8px 16px rgba(0,0,0,0.1)", flexShrink: 0,
                    fontSize: "3rem", fontWeight: 800, color: "white"
                  }}>
                    {!profilePic && displayName.split(" ").map(w => w[0]).slice(0, 2).join("")}
                  </div>

                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <div className="photo-upload-wrapper">
                      <button className="photo-btn hover-lift">Upload</button>
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} />
                    </div>
                    {profilePic && (
                      <button className="photo-btn hover-lift" onClick={handlePhotoRemove}>Remove</button>
                    )}
                  </div>
                </div>

                <div style={{ flex: 1, minWidth: 200, paddingBottom: "0.5rem" }}>
                  <h1 className="profile-name" style={{ fontSize: "2rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.25rem 0" }}>
                    {profileLoading ? "Loading..." : displayName}
                  </h1>
                  <p style={{ fontSize: "1rem", color: "#64748b", margin: 0, fontWeight: 500 }}>{displayProgram}</p>
                </div>
              </div>
            </div>
          </div>
        </RevealBox>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2.5rem" }}>

          <div className="profile-top-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2.5rem" }}>

            {/* ── General Info ── */}
            <RevealBox delay={0.05}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>General Info</h2>
                {!editingGeneral && !profileLoading && (
                  <button className="card-edit-btn" onClick={() => setEditingGeneral(true)}>Edit</button>
                )}
              </div>
              <div className="ui-card">
                {profileLoading ? (
                  <div style={{ color: "#94a3b8", fontSize: "0.9rem", textAlign: "center", padding: "1rem 0" }}>Loading...</div>
                ) : editingGeneral ? (
                  <>
                    <div className="field-grid">
                      <FieldInput label="Full Name" value={generalForm.name} onChange={(v) => setGeneralForm({ ...generalForm, name: v })} />
                      <FieldInput label="Email Address" type="email" value={generalForm.email} onChange={(v) => setGeneralForm({ ...generalForm, email: v })} />
                      <FieldInput label="Phone Number" value={generalForm.phone} onChange={(v) => setGeneralForm({ ...generalForm, phone: v })} />
                      <FieldInput label="Program & Year" value={generalForm.program} onChange={(v) => setGeneralForm({ ...generalForm, program: v })} />
                      <FieldInput label="Emergency Contact Name" value={generalForm.emergency_contact_name} onChange={(v) => setGeneralForm({ ...generalForm, emergency_contact_name: v })} />
                      <FieldInput label="Emergency Contact Number" value={generalForm.emergency_contact_number} onChange={(v) => setGeneralForm({ ...generalForm, emergency_contact_number: v })} />
                    </div>
                    <div style={{ display: "flex", gap: "0.6rem", justifyContent: "flex-end", marginTop: "1.25rem" }}>
                      <button className="card-cancel-btn" onClick={cancelGeneralEdit} disabled={savingGeneral}>Cancel</button>
                      <button className="card-save-btn" onClick={handleSaveGeneral} disabled={savingGeneral}>
                        {savingGeneral ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="field-grid">
                    <FieldDisplay label="Full Name" value={profileData?.name || ""} />
                    <FieldDisplay label="Email Address" value={profileData?.email || ""} />
                    <FieldDisplay label="Phone Number" value={profileData?.phone || ""} />
                    <FieldDisplay label="Program & Year" value={profileData?.program || ""} />
                    <FieldDisplay label="Emergency Contact Name" value={profileData?.emergency_contact_name || ""} />
                    <FieldDisplay label="Emergency Contact Number" value={profileData?.emergency_contact_number || ""} />
                  </div>
                )}
              </div>
            </RevealBox>

            {/* ── OJT Deployment ── */}
            <RevealBox delay={0.1}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>OJT Deployment Details</h2>
                {!editingOjt && !profileLoading && (
                  <button className="card-edit-btn" onClick={() => setEditingOjt(true)}>Edit</button>
                )}
              </div>
              <div className="ui-card">
                {profileLoading ? (
                  <div style={{ color: "#94a3b8", fontSize: "0.9rem", textAlign: "center", padding: "1rem 0" }}>Loading...</div>
                ) : editingOjt ? (
                  <>
                    <div style={{ marginBottom: "1.1rem" }}>
                      <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#475569", marginBottom: "0.4rem" }}>Company</label>
                      <CompanySelect value={ojtForm.company_id} onChange={(val) => setOjtForm({ ...ojtForm, company_id: val })} />
                    </div>
                    <div className="field-grid">
                      <FieldInput label="OJT Role" value={ojtForm.ojt_role} onChange={(v) => setOjtForm({ ...ojtForm, ojt_role: v })} />
                      <FieldInput label="OJT Supervisor" value={ojtForm.ojt_supervisor} onChange={(v) => setOjtForm({ ...ojtForm, ojt_supervisor: v })} />
                    </div>
                    <div style={{ display: "flex", gap: "0.6rem", justifyContent: "flex-end", marginTop: "1.25rem" }}>
                      <button className="card-cancel-btn" onClick={cancelOjtEdit} disabled={savingOjt}>Cancel</button>
                      <button className="card-save-btn" onClick={handleSaveOjt} disabled={savingOjt}>
                        {savingOjt ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
                      <div>
                        <div style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#3b82f6", marginBottom: "0.3rem" }}>Assigned Company</div>
                        <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          {profileData?.company ? profileData.company.name : (
                            <button
                              onClick={() => setEditingOjt(true)}
                              style={{ background: "#f59e0b", color: "white", padding: "0.3rem 1rem", borderRadius: "9999px", fontSize: "0.8rem", border: "none", cursor: "pointer", fontWeight: 700, boxShadow: "0 2px 8px rgba(245,158,11,0.3)" }}
                            >
                              Pick Company
                            </button>
                          )}
                        </div>
                        <div style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.4rem" }}>
                          {profileData?.company ? (profileData.company.address || "Location pending...") : "Action Required"}
                        </div>
                      </div>
                      {profileData?.company && (
                        <span style={{ background: "#dcfce7", color: "#166534", padding: "0.4rem 0.8rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <IconCheck /> Active
                        </span>
                      )}
                    </div>
                    <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "1.25rem" }} className="field-grid">
                      <FieldDisplay label="OJT Role" value={profileData?.ojt_role || ""} />
                      <FieldDisplay label="OJT Supervisor" value={profileData?.ojt_supervisor || ""} />
                    </div>
                  </>
                )}
              </div>
            </RevealBox>

            {/* ── Hours Rendered ── */}
            <RevealBox delay={0.15}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a", marginBottom: "1.25rem" }}>Hours Rendered</h2>
              <div className="ui-card stat-card" style={{ transition: "all 0.3s ease" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1rem" }}>
                  <div>
                    <span style={{ fontSize: "2.5rem", fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>
                      {hoursRendered === null ? "..." : hoursRendered.toFixed(2)}
                    </span>
                    <span style={{ fontSize: "0.95rem", color: "#64748b", fontWeight: 600, marginLeft: "0.4rem" }}>/ 300 hrs</span>
                  </div>
                  <span style={{ fontSize: "1rem", fontWeight: 700, color: "#3b82f6" }}>
                    {Math.round(((hoursRendered ?? 0) / 300) * 100)}%
                  </span>
                </div>
                <div style={{ width: "100%", height: 10, background: "#f1f5f9", borderRadius: 9999, overflow: "hidden" }}>
                  <div style={{ width: `${Math.min(((hoursRendered ?? 0) / 300) * 100, 100)}%`, height: "100%", background: "linear-gradient(90deg, #3b82f6, #6366f1)", borderRadius: 9999, transition: "width 0.5s ease" }} />
                </div>
                <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "1.25rem 0 0", textAlign: "center", fontWeight: 500 }}>
                  {hoursRendered !== null && hoursRendered >= 300
                    ? "Requirement complete!"
                    : `Keep up the good work! ${(300 - (hoursRendered ?? 0)).toFixed(2)} hours remaining.`}
                </p>

                <div style={{ borderTop: "1px solid #f1f5f9", marginTop: "1.5rem", paddingTop: "1.25rem" }}>
                  <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.75rem" }}>Submit DTR</div>

                  {dtrDoc && (
                    <div style={{
                      marginBottom: "1rem", padding: "0.75rem 1rem", borderRadius: "0.75rem",
                      background: dtrDoc.status === "approved" ? "#dcfce7" : dtrDoc.status === "rejected" ? "#fee2e2" : "#fef9c3",
                    }}>
                      <div style={{
                        fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em",
                        color: dtrDoc.status === "approved" ? "#166534" : dtrDoc.status === "rejected" ? "#b91c1c" : "#a16207",
                      }}>
                        {dtrDoc.status === "approved" ? "Last Approved" : dtrDoc.status === "rejected" ? "Rejected" : "Pending Review"}
                      </div>
                      <div style={{ fontSize: "0.85rem", color: "#334155", marginTop: "0.25rem" }}>
                        Claiming {toNum(dtrDoc.claimed_hours).toFixed(2)} hrs — submitted {new Date(dtrDoc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      {dtrDoc.status === "rejected" && dtrDoc.rejection_reason && (
                        <div style={{ fontSize: "0.8rem", color: "#b91c1c", marginTop: "0.35rem", fontStyle: "italic" }}>
                          Reason: {dtrDoc.rejection_reason}
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{ marginBottom: "0.75rem" }}>
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#475569", marginBottom: "0.4rem" }}>
                      Total Hours Claimed
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={dtrClaimedHours}
                      onChange={(e) => setDtrClaimedHours(e.target.value)}
                      placeholder="e.g. 120"
                      disabled={dtrUploading}
                      style={{ width: "100%", padding: "0.6rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1", fontSize: "0.85rem", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>

                  {dtrUploading ? (
                    <div style={{ textAlign: "center", padding: "0.75rem", color: "#3b82f6", fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Uploading...
                    </div>
                  ) : (
                    <div
                      className="pdf-upload-box"
                      onDragEnter={handleDtrDrag}
                      onDragLeave={handleDtrDrag}
                      onDragOver={handleDtrDrag}
                      onDrop={handleDtrDrop}
                      style={{
                        position: "relative",
                        background: dtrDragActive ? "#eff6ff" : "#f8fafc",
                        border: `2px dashed ${dtrDragActive ? "#3b82f6" : "#cbd5e1"}`,
                        borderRadius: "0.75rem", padding: "1rem",
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", transition: "all 0.2s",
                      }}
                    >
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleDtrFileChange}
                        style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%" }}
                      />
                      <IconUpload />
                      <span style={{ fontSize: "0.75rem", fontWeight: 600, color: dtrDragActive ? "#3b82f6" : "#64748b", marginTop: "0.35rem" }}>
                        {dtrDragActive ? "Drop PDF here" : (dtrDoc ? "Drag new DTR PDF or Click to replace" : "Drag DTR PDF or Click")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </RevealBox>

            {/* ── Required Documents ── */}
            <RevealBox delay={0.2}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a", marginBottom: "1.25rem" }}>Required Documents</h2>
              <div className="ui-card" style={{ padding: 0, overflow: "hidden" }}>
                {documentsLoading ? (
                  <div style={{ padding: "2.5rem", textAlign: "center", color: "#94a3b8", fontSize: "0.9rem" }}>
                    Loading your documents...
                  </div>
                ) : (
                  documents.map((doc) => (
                    <DocumentRow
                      key={doc.id}
                      doc={doc}
                      onUpload={handleUpload}
                      onRemove={handleRemoveDocument}
                      onView={(title, fileLink) => setSelectedDoc({ title, fileLink })}
                    />
                  ))
                )}
              </div>
            </RevealBox>

          </div>
        </div>
      </main>

      {selectedDoc && (
        <DocumentViewerModal
          title={selectedDoc.title}
          fileLink={selectedDoc.fileLink}
          onClose={() => setSelectedDoc(null)}
        />
      )}
    </div>
  );
}