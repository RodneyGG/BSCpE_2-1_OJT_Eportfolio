"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

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
function IconBack() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7"/>
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
      stroke="#10b981" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

function IconMail() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 4l10 8 10-8"/>
    </svg>
  );
}

function IconPhone() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
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

function IconPlus() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14"/>
    </svg>
  );
}

function IconX() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18M6 6l12 12"/>
    </svg>
  );
}

/* ═══════════════════════════ Components ════════════════════════ */

function DocumentRow({ doc, onUpload }: { doc: { id: number, name: string, status: string, date: string }, onUpload: (id: number) => void }) {
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
      onUpload(doc.id);
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
      onUpload(doc.id);
    }
  };

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "1.25rem", borderBottom: "1px solid #f1f5f9"
    }}>
      <div>
        <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#0f172a" }}>{doc.name}</div>
        <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.25rem" }}>{doc.date}</div>
      </div>
      
      {doc.status === "submitted" && (
        <span style={{ background: "#dcfce7", color: "#166534", padding: "0.3rem 0.8rem", borderRadius: "9999px", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Submitted</span>
      )}
      
      {doc.status === "uploading" && (
        <span style={{ color: "#3b82f6", fontSize: "0.75rem", fontWeight: 700, animation: "pulse 1s infinite", textTransform: "uppercase", letterSpacing: "0.05em" }}>Uploading...</span>
      )}
      
      {doc.status === "pending" && (
        <div 
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

/* ═══════════════════════════ Page ════════════════════════════ */
export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: "Juan Dela Cruz",
    program: "BS Computer Engineering · 2nd Year",
    email: "student@university.edu.ph",
    phone: "+63 912 345 6789",
    company: "TechCore Solutions Inc.",
    location: "Cebu City, Cebu",
    role: "IT Intern",
    supervisor: "Coco Martin"
  });

  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ ...profile });

  // Mock Data States
  const [documents, setDocuments] = useState([
    { id: 1, name: "Resume / CV", status: "submitted", date: "May 10" },
    { id: 2, name: "Endorsement Letter", status: "submitted", date: "May 12" },
    { id: 3, name: "Memorandum of Agreement", status: "submitted", date: "May 15" },
    { id: 4, name: "Medical Certificate", status: "pending", date: "Required before start" },
    { id: 5, name: "Parents' Consent", status: "pending", date: "Required before start" },
  ]);

  const [dtrEntries, setDtrEntries] = useState([
    { id: 1, date: "May 16, 2026", timeIn: "08:00 AM", timeOut: "05:00 PM", status: "present", task: "Onboarding and Setup", hours: 8, proofFile: "dtr_proof_1.pdf" },
    { id: 2, date: "May 17, 2026", timeIn: "08:30 AM", timeOut: "05:30 PM", status: "present", task: "Database Schema Design", hours: 8, proofFile: "dtr_proof_2.pdf" },
    { id: 3, date: "May 18, 2026", timeIn: "-", timeOut: "-", status: "absent", task: "Sick Leave", hours: 0, proofFile: null as string | null },
  ]);

  const [journals, setJournals] = useState([
    { id: 1, week: "Week 1", summary: "Completed onboarding, met with the supervisor, and familiarized myself with the codebase and tech stack.", dateRange: "May 20 - May 24" }
  ]);

  // Upload Simulation
  const handleUpload = (id: number) => {
    setDocuments(docs => docs.map(d => d.id === id ? { ...d, status: "uploading" } : d));
    setTimeout(() => {
      setDocuments(docs => docs.map(d => 
        d.id === id ? { ...d, status: "submitted", date: "Just now" } : d
      ));
    }, 1500);
  };

  // Profile Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setProfilePic(url);
    }
  };

  const handlePhotoRemove = () => {
    setProfilePic(null);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(editForm);
    setShowEditModal(false);
  };

  // Add DTR Simulation
  const [showDtrForm, setShowDtrForm] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newTimeIn, setNewTimeIn] = useState("");
  const [newTimeOut, setNewTimeOut] = useState("");
  const [isAbsent, setIsAbsent] = useState(false);
  const [newTask, setNewTask] = useState("");
  const [newProofFile, setNewProofFile] = useState<File | null>(null);

  const calculateHours = (inTime: string, outTime: string) => {
    if (!inTime || !outTime) return 0;
    const [inH, inM] = inTime.split(':').map(Number);
    const [outH, outM] = outTime.split(':').map(Number);
    let diff = (outH + outM / 60) - (inH + inM / 60);
    if (diff > 4) diff -= 1; // 1 hour lunch break deduction
    return diff > 0 ? Math.round(diff * 10) / 10 : 0;
  };

  const formatTime = (time24: string) => {
    if (!time24) return "-";
    const [h, m] = time24.split(':');
    let hours = parseInt(h);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${m} ${ampm}`;
  };

  const handleAddDtr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAbsent && (!newTimeIn || !newTimeOut)) return;
    
    const hours = isAbsent ? 0 : calculateHours(newTimeIn, newTimeOut);
    
    const newEntry = {
      id: Date.now(),
      date: newDate || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      timeIn: isAbsent ? "-" : formatTime(newTimeIn),
      timeOut: isAbsent ? "-" : formatTime(newTimeOut),
      status: isAbsent ? "absent" : "present",
      task: newTask || (isAbsent ? "Absent" : "Regular Task"),
      hours: hours,
      proofFile: newProofFile ? newProofFile.name : null
    };
    setDtrEntries([newEntry, ...dtrEntries]);
    setNewTask("");
    setNewTimeIn("");
    setNewTimeOut("");
    setIsAbsent(false);
    setNewProofFile(null);
    setShowDtrForm(false);
  };

  // Add Journal Simulation
  const [showJournalForm, setShowJournalForm] = useState(false);
  const [journalStartDate, setJournalStartDate] = useState("");
  const [journalEndDate, setJournalEndDate] = useState("");
  const [newJournalSummary, setNewJournalSummary] = useState("");

  const handleAddJournal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJournalSummary || !journalStartDate || !journalEndDate) return;
    
    const formatShortDate = (dString: string) => {
      const d = new Date(dString);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };
    const formattedRange = `${formatShortDate(journalStartDate)} - ${formatShortDate(journalEndDate)}`;

    setJournals([{
      id: Date.now(),
      week: `Week ${journals.length + 1}`,
      summary: newJournalSummary,
      dateRange: formattedRange
    }, ...journals]);
    setNewJournalSummary("");
    setJournalStartDate("");
    setJournalEndDate("");
    setShowJournalForm(false);
  };

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
        @keyframes modalEnter {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .ui-card {
          background: white; border-radius: 1.25rem; padding: 1.75rem; 
          box-shadow: 0 10px 30px rgba(0,0,0,0.04); border: 1px solid rgba(255,255,255,0.8);
        }
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.06);
        }
        .back-link:hover { opacity: 0.8; }
        .dtr-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; text-align: left; }
        .dtr-table th { background: #f8fafc; padding: 1rem 1.25rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #e2e8f0; }
        .dtr-table td { padding: 1rem 1.25rem; color: #0f172a; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
        .dtr-table tr:last-child td { border-bottom: none; }
        .dtr-table tr:hover td { background: #f8fafc; }
        
        .photo-btn {
          background: rgba(255,255,255,0.9); border: 1px solid #e2e8f0; border-radius: 999px;
          padding: 0.4rem 0.8rem; font-size: 0.7rem; font-weight: 600; color: #475569;
          cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .photo-btn:hover { background: white; color: #0f172a; transform: translateY(-1px); }
        .photo-upload-wrapper { position: relative; overflow: hidden; display: inline-block; }
        .photo-upload-wrapper input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
      `}</style>

      {/* ══ TOP NAV ══ */}
      <nav style={{
        background: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.5)",
        position: "sticky", top: 0, zIndex: 40,
      }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto", padding: "0 2rem", height: 64,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <Link href="/" className="back-link" style={{
            display: "flex", alignItems: "center", gap: "0.5rem",
            color: "#475569", textDecoration: "none", fontSize: "0.85rem",
            fontWeight: 600, transition: "opacity 0.2s ease"
          }}>
            <IconBack />
            Return to Dashboard
          </Link>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Student Profile
          </div>
        </div>
      </nav>

      {/* ══ MAIN LAYOUT ══ */}
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "3rem 2rem", flex: 1, width: "100%" }}>
        
        {/* Profile Header Card */}
        <RevealBox>
          <div style={{
            background: "white", borderRadius: "1.5rem",
            boxShadow: "0 15px 40px -5px rgba(0,0,0,0.08)", overflow: "hidden",
            marginBottom: "2.5rem", border: "1px solid rgba(255,255,255,0.5)"
          }}>
            {/* Cover Photo Area */}
            <div style={{
              height: 160,
              background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
              position: "relative"
            }}>
              <div style={{ position: "absolute", inset: 0, opacity: 0.2, backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />
            </div>

            {/* User Info Area */}
            <div style={{ padding: "0 2.5rem 2.5rem", position: "relative" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", marginBottom: "2rem" }}>
                
                {/* Avatar with offset */}
                <div style={{ marginTop: "-60px", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{
                    width: 130, height: 130, borderRadius: "50%",
                    background: profilePic ? `url(${profilePic}) center/cover` : "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
                    border: "6px solid white", display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 8px 16px rgba(0,0,0,0.1)", flexShrink: 0,
                    fontSize: "3rem", fontWeight: 800, color: "white"
                  }}>
                    {!profilePic && profile.name.split(" ").map(w => w[0]).slice(0, 2).join("")}
                  </div>
                  
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <div className="photo-upload-wrapper">
                      <button className="photo-btn">Upload</button>
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} />
                    </div>
                    {profilePic && (
                      <button className="photo-btn" onClick={handlePhotoRemove}>Remove</button>
                    )}
                  </div>
                </div>
                
                <div style={{ flex: 1, minWidth: 200, paddingTop: "0.5rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                  <div>
                    <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.25rem 0", letterSpacing: "normal" }}>{profile.name}</h1>
                    <p style={{ fontSize: "1rem", color: "#64748b", margin: 0, fontWeight: 500 }}>{profile.program}</p>
                  </div>
                  
                  {/* Action Button */}
                  <button onClick={() => setShowEditModal(true)} style={{
                    background: "#0f172a", border: "none", borderRadius: "0.75rem",
                    padding: "0.75rem 1.5rem", fontSize: "0.85rem", fontWeight: 600, color: "white",
                    cursor: "pointer", transition: "all 0.2s", boxShadow: "0 4px 12px rgba(15,23,42,0.15)"
                  }} onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"} onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}>
                    Edit Profile Details
                  </button>
                </div>
              </div>

              {/* Contact & Meta Row */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "2.5rem", borderTop: "1px solid #e2e8f0", paddingTop: "1.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", color: "#475569", fontSize: "0.9rem", fontWeight: 500 }}>
                  <IconMail /> {profile.email}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", color: "#475569", fontSize: "0.9rem", fontWeight: 500 }}>
                  <IconPhone /> {profile.phone}
                </div>
              </div>
            </div>
          </div>
        </RevealBox>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2.5rem" }}>
          
          {/* ── Top Row (Status & Tracker) ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2.5rem" }}>
            {/* OJT Status */}
            <RevealBox delay={0.1}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a", marginBottom: "1.25rem" }}>OJT Deployment Details</h2>
              <div className="ui-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
                  <div>
                    <div style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#3b82f6", marginBottom: "0.3rem" }}>Assigned Company</div>
                    <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#0f172a" }}>{profile.company}</div>
                    <div style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.2rem" }}>{profile.location}</div>
                  </div>
                  <span style={{ background: "#dcfce7", color: "#166534", padding: "0.4rem 0.8rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <IconCheck /> Active
                  </span>
                </div>
                
                <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "1.25rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "#94a3b8", textTransform: "uppercase", fontWeight: 600, marginBottom: "0.25rem" }}>Role</div>
                    <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#475569" }}>{profile.role}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "#94a3b8", textTransform: "uppercase", fontWeight: 600, marginBottom: "0.25rem" }}>OJT Supervisor</div>
                    <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#475569" }}>{profile.supervisor}</div>
                  </div>
                </div>
              </div>
            </RevealBox>

            {/* Hours Progress */}
            <RevealBox delay={0.2}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a", marginBottom: "1.25rem" }}>Hours Tracker</h2>
              <div className="ui-card stat-card" style={{ transition: "all 0.3s ease" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1rem" }}>
                  <div>
                    <span style={{ fontSize: "2.5rem", fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>
                      {dtrEntries.reduce((sum, entry) => sum + entry.hours, 118)}
                    </span>
                    <span style={{ fontSize: "0.95rem", color: "#64748b", fontWeight: 600, marginLeft: "0.4rem" }}>/ 300 hrs</span>
                  </div>
                  <span style={{ fontSize: "1rem", fontWeight: 700, color: "#3b82f6" }}>
                    {Math.round((dtrEntries.reduce((sum, entry) => sum + entry.hours, 118) / 300) * 100)}%
                  </span>
                </div>
                {/* Progress Bar */}
                <div style={{ width: "100%", height: 10, background: "#f1f5f9", borderRadius: 9999, overflow: "hidden" }}>
                  <div style={{ width: `${(dtrEntries.reduce((sum, entry) => sum + entry.hours, 118) / 300) * 100}%`, height: "100%", background: "linear-gradient(90deg, #3b82f6, #6366f1)", borderRadius: 9999, transition: "width 0.5s ease" }} />
                </div>
                <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "1.25rem 0 0", textAlign: "center", fontWeight: 500 }}>Keep up the good work! {300 - dtrEntries.reduce((sum, entry) => sum + entry.hours, 118)} hours remaining.</p>
              </div>
            </RevealBox>
          </div>

          {/* ── Documents Section ── */}
          <RevealBox delay={0.1}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a", marginBottom: "1.25rem" }}>Required Documents</h2>
            <div className="ui-card" style={{ padding: 0, overflow: "hidden" }}>
              {documents.map((doc) => (
                <DocumentRow key={doc.id} doc={doc} onUpload={handleUpload} />
              ))}
            </div>
          </RevealBox>

          {/* ── Weekly Journals Section ── */}
          <RevealBox delay={0.2}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>Weekly Journals</h2>
              <button 
                onClick={() => setShowJournalForm(!showJournalForm)}
                style={{ background: "#3b82f6", color: "white", border: "none", borderRadius: "0.75rem", padding: "0.6rem 1.25rem", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem", transition: "background 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#2563eb"}
                onMouseLeave={(e) => e.currentTarget.style.background = "#3b82f6"}
              >
                <IconPlus /> Add Journal
              </button>
            </div>

            <div className="ui-card" style={{ padding: "2rem" }}>
              {showJournalForm && (
                <form onSubmit={handleAddJournal} style={{ background: "#f8fafc", padding: "1.5rem", borderRadius: "1rem", marginBottom: "2rem", border: "1px dashed #cbd5e1" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#475569", marginBottom: "0.5rem", textTransform: "uppercase" }}>Start Date</label>
                      <input type="date" value={journalStartDate} onChange={(e) => setJournalStartDate(e.target.value)} style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1", fontSize: "0.9rem", outline: "none" }} required />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#475569", marginBottom: "0.5rem", textTransform: "uppercase" }}>End Date</label>
                      <input type="date" value={journalEndDate} onChange={(e) => setJournalEndDate(e.target.value)} style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1", fontSize: "0.9rem", outline: "none" }} required />
                    </div>
                  </div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#475569", marginBottom: "0.5rem", textTransform: "uppercase" }}>Summary of the Week</label>
                  <textarea 
                    value={newJournalSummary} 
                    onChange={(e) => setNewJournalSummary(e.target.value)} 
                    placeholder="Write a brief summary of what you learned or accomplished this week..." 
                    style={{ width: "100%", padding: "1rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1", fontSize: "0.9rem", outline: "none", minHeight: "100px", resize: "vertical", fontFamily: "inherit" }} 
                    required 
                  />
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
                    <button type="button" onClick={() => setShowJournalForm(false)} style={{ background: "transparent", color: "#64748b", border: "none", padding: "0.5rem 1rem", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                    <button type="submit" style={{ background: "#0f172a", color: "white", border: "none", borderRadius: "0.5rem", padding: "0.5rem 1.25rem", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer" }}>Save Journal</button>
                  </div>
                </form>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {journals.map((journal) => (
                  <div key={journal.id} style={{ background: "white", padding: "1.5rem", borderRadius: "1rem", border: "1px solid #e2e8f0", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                      <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>{journal.week}</h3>
                      <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>{journal.dateRange}</span>
                    </div>
                    <p style={{ fontSize: "0.95rem", color: "#475569", lineHeight: 1.6, margin: 0 }}>
                      {journal.summary}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </RevealBox>

          {/* ── DTR Section ── */}
          <RevealBox delay={0.3}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>Daily Time Record</h2>
              <button 
                onClick={() => setShowDtrForm(!showDtrForm)}
                style={{ background: "#3b82f6", color: "white", border: "none", borderRadius: "0.75rem", padding: "0.6rem 1.25rem", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem", transition: "background 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#2563eb"}
                onMouseLeave={(e) => e.currentTarget.style.background = "#3b82f6"}
              >
                <IconPlus /> Add Log
              </button>
            </div>

            <div className="ui-card" style={{ padding: "2rem" }}>
              
              {/* DTR Entry Form */}
              {showDtrForm && (
                <form onSubmit={handleAddDtr} style={{ background: "#f8fafc", padding: "1.5rem", borderRadius: "1rem", marginBottom: "2rem", border: "1px dashed #cbd5e1" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem", marginBottom: "1.25rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#475569", marginBottom: "0.4rem", textTransform: "uppercase" }}>Date</label>
                      <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} style={{ width: "100%", padding: "0.6rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1", fontSize: "0.85rem", outline: "none" }} required />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#475569", marginBottom: "0.4rem", textTransform: "uppercase" }}>Time In</label>
                      <input type="time" value={newTimeIn} onChange={(e) => setNewTimeIn(e.target.value)} disabled={isAbsent} style={{ width: "100%", padding: "0.6rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1", fontSize: "0.85rem", outline: "none", background: isAbsent ? "#e2e8f0" : "white" }} required={!isAbsent} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#475569", marginBottom: "0.4rem", textTransform: "uppercase" }}>Time Out</label>
                      <input type="time" value={newTimeOut} onChange={(e) => setNewTimeOut(e.target.value)} disabled={isAbsent} style={{ width: "100%", padding: "0.6rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1", fontSize: "0.85rem", outline: "none", background: isAbsent ? "#e2e8f0" : "white" }} required={!isAbsent} />
                    </div>
                  </div>
                  
                  <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-end", marginBottom: "1rem" }}>
                    <div style={{ flex: 2 }}>
                      <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#475569", marginBottom: "0.4rem", textTransform: "uppercase" }}>Task / Activity</label>
                      <input type="text" value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder={isAbsent ? "Reason for absence..." : "What did you do today?"} style={{ width: "100%", padding: "0.6rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1", fontSize: "0.85rem", outline: "none" }} required />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#475569", marginBottom: "0.4rem", textTransform: "uppercase" }}>Proof (PDF)</label>
                      <input type="file" accept="application/pdf" onChange={(e) => setNewProofFile(e.target.files ? e.target.files[0] : null)} disabled={isAbsent} style={{ width: "100%", padding: "0.45rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1", fontSize: "0.75rem", outline: "none", background: isAbsent ? "#e2e8f0" : "white" }} required={!isAbsent} />
                    </div>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", fontWeight: 600, color: "#475569", paddingBottom: "0.6rem", cursor: "pointer" }}>
                      <input type="checkbox" checked={isAbsent} onChange={(e) => setIsAbsent(e.target.checked)} style={{ transform: "scale(1.2)" }} />
                      Mark as Absent
                    </label>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
                    <button type="button" onClick={() => setShowDtrForm(false)} style={{ background: "transparent", color: "#64748b", border: "none", padding: "0.5rem 1rem", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                    <button type="submit" style={{ background: "#0f172a", color: "white", border: "none", borderRadius: "0.5rem", padding: "0.5rem 1.25rem", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer" }}>Save Entry</button>
                  </div>
                </form>
              )}

              {/* DTR Excel-style Table */}
              <div style={{ overflowX: "auto", border: "1px solid #e2e8f0", borderRadius: "0.75rem" }}>
                <table className="dtr-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Time In</th>
                      <th>Time Out</th>
                      <th>Status</th>
                      <th>Task / Activity</th>
                      <th>Proof</th>
                      <th style={{ textAlign: "right" }}>Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dtrEntries.map((entry) => (
                      <tr key={entry.id}>
                        <td style={{ fontWeight: 600, whiteSpace: "nowrap" }}>{entry.date}</td>
                        <td style={{ whiteSpace: "nowrap" }}>{entry.timeIn}</td>
                        <td style={{ whiteSpace: "nowrap" }}>{entry.timeOut}</td>
                        <td>
                          <span style={{ 
                            fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", padding: "0.3rem 0.8rem", borderRadius: "9999px",
                            color: entry.status === "present" ? "#166534" : "#b45309",
                            background: entry.status === "present" ? "#dcfce7" : "#fef3c7" 
                          }}>
                            {entry.status}
                          </span>
                        </td>
                        <td style={{ color: "#475569", maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {entry.task}
                        </td>
                        <td>
                          {entry.proofFile ? (
                            <span style={{ fontSize: "0.75rem", color: "#3b82f6", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                              <IconCheck /> PDF Attached
                            </span>
                          ) : <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>-</span>}
                        </td>
                        <td style={{ textAlign: "right", fontWeight: 700, color: "#0f172a", fontSize: "0.95rem" }}>{entry.hours}</td>
                      </tr>
                    ))}
                    {dtrEntries.length === 0 && (
                      <tr>
                        <td colSpan={6} style={{ textAlign: "center", padding: "3rem", color: "#94a3b8", fontSize: "0.95rem" }}>No DTR records found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          </RevealBox>

        </div>
      </main>

      {/* ══ EDIT PROFILE MODAL ══ */}
      {showEditModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)" }} onClick={() => setShowEditModal(false)} />
          <div style={{ background: "white", borderRadius: "1.5rem", width: "100%", maxWidth: "600px", position: "relative", zIndex: 101, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)", animation: "modalEnter 0.3s ease", display: "flex", flexDirection: "column", maxHeight: "90vh" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.5rem", borderBottom: "1px solid #e2e8f0" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>Edit Profile Details</h2>
              <button onClick={() => setShowEditModal(false)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", display: "flex" }}><IconX /></button>
            </div>
            <div style={{ padding: "1.5rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#475569", marginBottom: "0.4rem" }}>Full Name</label>
                  <input type="text" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1", fontSize: "0.9rem", outline: "none" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#475569", marginBottom: "0.4rem" }}>Program & Year</label>
                  <input type="text" value={editForm.program} onChange={(e) => setEditForm({...editForm, program: e.target.value})} style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1", fontSize: "0.9rem", outline: "none" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#475569", marginBottom: "0.4rem" }}>Email Address</label>
                  <input type="email" value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1", fontSize: "0.9rem", outline: "none" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#475569", marginBottom: "0.4rem" }}>Phone Number</label>
                  <input type="text" value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1", fontSize: "0.9rem", outline: "none" }} />
                </div>
              </div>
              <div style={{ borderTop: "1px solid #f1f5f9", margin: "0.5rem 0" }} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#475569", marginBottom: "0.4rem" }}>Company</label>
                  <input type="text" value={editForm.company} onChange={(e) => setEditForm({...editForm, company: e.target.value})} style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1", fontSize: "0.9rem", outline: "none" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#475569", marginBottom: "0.4rem" }}>Location</label>
                  <input type="text" value={editForm.location} onChange={(e) => setEditForm({...editForm, location: e.target.value})} style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1", fontSize: "0.9rem", outline: "none" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#475569", marginBottom: "0.4rem" }}>OJT Role</label>
                  <input type="text" value={editForm.role} onChange={(e) => setEditForm({...editForm, role: e.target.value})} style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1", fontSize: "0.9rem", outline: "none" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#475569", marginBottom: "0.4rem" }}>OJT Supervisor</label>
                  <input type="text" value={editForm.supervisor} onChange={(e) => setEditForm({...editForm, supervisor: e.target.value})} style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1", fontSize: "0.9rem", outline: "none" }} />
                </div>
              </div>
            </div>
            <div style={{ padding: "1.5rem", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end", gap: "1rem", background: "#f8fafc", borderRadius: "0 0 1.5rem 1.5rem" }}>
              <button onClick={() => setShowEditModal(false)} style={{ background: "transparent", color: "#64748b", border: "1px solid #cbd5e1", borderRadius: "0.5rem", padding: "0.6rem 1.25rem", fontSize: "0.9rem", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
              <button onClick={handleSaveProfile} style={{ background: "#2563eb", color: "white", border: "none", borderRadius: "0.5rem", padding: "0.6rem 1.5rem", fontSize: "0.9rem", fontWeight: 600, cursor: "pointer" }}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
