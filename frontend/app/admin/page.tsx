"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "../context/RoleContext";
import { fetchApi } from "../../lib/api";
import AppNavbar from "../components/AppNavbar";
import PendingApprovalSection from "../components/PendingApprovalSection";
import ManageUsersSection, { ManagedUser } from "../components/ManageUsersSection";

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
function IconUsers() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}
function IconFileText() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/>
    </svg>
  );
}
function IconX() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18M6 6l12 12"/>
    </svg>
  );
}

/* ═══════════════════════════ Page ════════════════════════════ */
export default function AdminDashboard() {
  const { role, isLoggedIn } = useRole();
  const router = useRouter();
  const [selectedStudent, setSelectedStudent] = useState<ManagedUser | null>(null);
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [studentCount, setStudentCount] = useState<number | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/login");
      return;
    }
    if (role !== "admin" && role !== "prof") {
      router.replace("/profile");
      return;
    }
    setAuthChecked(true);
  }, [isLoggedIn, role, router]);

  if (!authChecked) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f1f5f9", color: "#64748b", fontSize: "0.9rem" }}>
        Checking access...
      </div>
    );
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? { color: "#1d4ed8", bg: "#dbeafe" }
      : { color: "#991b1b", bg: "#fee2e2" };
  };

  const handleConnectDrive = async () => {
    try {
      const data = await fetchApi('/google/auth');
      if (data.auth_url) {
        window.location.href = data.auth_url;
      }
    } catch (err: unknown) {
      const error = err as Error;
      alert("Failed to initiate Google OAuth: " + error.message);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f1f5f9",
      fontFamily: "var(--font-geist-sans, system-ui, sans-serif)",
      display: "flex", flexDirection: "column",
    }}>
      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .admin-card {
          background: white; border-radius: 1.25rem; padding: 1.5rem; 
          box-shadow: 0 4px 15px rgba(0,0,0,0.03); border: 1px solid #e2e8f0;
        }
        .stat-icon {
          width: 48px; height: 48px; border-radius: 1rem;
          display: flex; alignItems: center; justify-content: center;
        }
        .btn-action {
          background: white; border: 1px solid #cbd5e1; border-radius: 0.5rem;
          padding: 0.4rem 0.8rem; font-size: 0.75rem; font-weight: 600; color: #475569;
          cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; gap: 0.3rem;
        }
        .btn-action:hover { background: #f8fafc; border-color: #94a3b8; color: #0f172a; }
        .btn-approve {
          background: #dcfce7; border: 1px solid #bbf7d0; color: #166534;
        }
        .btn-approve:hover { background: #bbf7d0; border-color: #86efac; }
        @media (max-width: 768px) {
          .admin-grid-main { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .admin-card { padding: 1rem !important; }
          .admin-main { padding: 1.5rem 1rem !important; }
        }
      `}</style>

      {/* ══ TOP NAV ══ */}
      <AppNavbar />

      {/* ══ MAIN DASHBOARD ══ */}
      <main className="admin-main" style={{ maxWidth: 1400, margin: "0 auto", padding: "2.5rem 2rem", flex: 1, width: "100%" }}>
        

        {/* Header */}
        <RevealBox>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2.5rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444" }} />
                <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  {role === 'prof' ? 'OJT Professor Dashboard' : 'OJT Admin Dashboard'}
                </span>
              </div>
              <h1 style={{ fontSize: "2.25rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.25rem 0", letterSpacing: "-0.02em" }}>Overview</h1>
              <p style={{ fontSize: "1rem", color: "#64748b", margin: 0, fontWeight: 500 }}>Manage students, accounts, and review documents.</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", alignItems: "flex-end" }}>
              <div style={{ color: "#64748b", fontSize: "0.85rem", fontWeight: 600 }}>
                Academic Year: <span style={{ color: "#0f172a" }}>2025-2026 (Summer)</span>
              </div>
              {role === 'admin' && (
                <button 
                  onClick={handleConnectDrive}
                  style={{
                    background: "white", color: "#3c4043", border: "1px solid #dadce0", borderRadius: "0.5rem",
                    padding: "0.5rem 1rem", fontSize: "0.85rem", fontWeight: 600,
                    display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer",
                    boxShadow: "0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)", transition: "all 0.2s ease-in-out"
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#f8f9fa"; e.currentTarget.style.boxShadow = "0 1px 3px 0 rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "white"; e.currentTarget.style.boxShadow = "0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)"; }}
                >
                  <svg width={18} height={18} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    <path d="M1 1h22v22H1z" fill="none"/>
                  </svg>
                  Sign in with Google Drive
                </button>
              )}
            </div>
          </div>
        </RevealBox>

        {/* ── STATS ROW ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem", marginBottom: "2.5rem" }}>
          <RevealBox delay={0.1}>
            <div
              className="admin-card"
              onClick={() => router.push("/students")}
              style={{ cursor: "pointer" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                <div className="stat-icon" style={{ background: "#eff6ff", color: "#3b82f6" }}><IconUsers /></div>
              </div>
              <h3 style={{ fontSize: "2rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.25rem 0" }}>
                {studentCount === null ? "..." : studentCount}
              </h3>
              <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0, fontWeight: 600 }}>Total Students</p>
            </div>
          </RevealBox>

          <RevealBox delay={0.3}>
            <div className="admin-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                <div className="stat-icon" style={{ background: "#fee2e2", color: "#ef4444" }}><IconFileText /></div>
                {pendingCount !== null && pendingCount > 0 && (
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#ef4444", background: "#fee2e2", padding: "0.2rem 0.6rem", borderRadius: "999px" }}>
                    Action Needed
                  </span>
                )}
              </div>
              <h3 style={{ fontSize: "2rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.25rem 0" }}>
                {pendingCount === null ? "..." : pendingCount}
              </h3>
              <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0, fontWeight: 600 }}>Pending Approvals</p>
            </div>
          </RevealBox>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>

          {/* ── PENDING APPROVALS ── */}
          <RevealBox delay={0.4}>
            <PendingApprovalSection onCountChange={setPendingCount} />
          </RevealBox>

          {/* ── MANAGE USERS ── */}
          <RevealBox delay={0.5}>
            <ManageUsersSection onViewStudent={setSelectedStudent} onCountChange={setStudentCount} />
          </RevealBox>

        </div>

      {/* ══ STUDENT DETAILS MODAL ══ */}
      {selectedStudent && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)",
          zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem"
        }} onClick={() => setSelectedStudent(null)}>
          <div style={{
            background: "white", borderRadius: "1.5rem", width: "100%", maxWidth: "600px",
            overflow: "hidden", animation: "fadeInScale 0.2s ease-out", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
            position: "relative"
          }} onClick={e => e.stopPropagation()}>
            
            {/* Close Button */}
            <button onClick={() => setSelectedStudent(null)} style={{
              position: "absolute", top: "1rem", right: "1rem", background: "none", border: "none",
              color: "#94a3b8", cursor: "pointer", padding: "0.5rem", borderRadius: "50%", transition: "background 0.2s"
            }} onMouseEnter={(e) => e.currentTarget.style.background = "#f1f5f9"} onMouseLeave={(e) => e.currentTarget.style.background = "none"}>
              <IconX />
            </button>

            {/* Modal Header */}
            <div style={{ padding: "2rem", display: "flex", gap: "1.5rem", alignItems: "center", borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedStudent.name)}&size=100&background=random&color=fff&bold=true`} 
                alt={selectedStudent.name} 
                style={{ width: 80, height: 80, borderRadius: "50%", border: "4px solid white", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }} 
              />
              <div>
                <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>{selectedStudent.name}</h2>
                <p style={{ margin: "0.2rem 0 0", color: "#64748b", fontSize: "0.9rem", fontWeight: 500 }}>{selectedStudent.email}</p>
                <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem" }}>
                  <span style={{ 
                    padding: "0.2rem 0.75rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase",
                    color: getStatusColor(selectedStudent.is_active).color, background: getStatusColor(selectedStudent.is_active).bg
                  }}>
                    {selectedStudent.is_active ? "Active" : "Deactivated"}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "2rem", maxHeight: "60vh", overflowY: "auto" }}>

              <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1rem" }}>OJT Progress</h3>
              <div style={{ background: "#f8fafc", padding: "1.25rem", borderRadius: "1rem", border: "1px dashed #cbd5e1", marginBottom: "2rem", textAlign: "center", color: "#94a3b8", fontSize: "0.9rem" }}>
                Not yet tracked — hours tracking is being redesigned.
              </div>

              <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1rem" }}>Uploaded DTR Proofs</h3>
              <div style={{ padding: "1rem", textAlign: "center", color: "#94a3b8", fontSize: "0.9rem", border: "1px dashed #cbd5e1", borderRadius: "0.5rem" }}>
                Not yet tracked — DTR proof tracking is being redesigned.
              </div>

            </div>
            
            {/* Modal Footer */}
            <div style={{ padding: "1.5rem 2rem", background: "#f8fafc", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
              <button onClick={() => setSelectedStudent(null)} style={{ padding: "0.6rem 1.25rem", borderRadius: "0.5rem", background: "white", border: "1px solid #cbd5e1", color: "#475569", fontWeight: 600, cursor: "pointer" }}>Close</button>
            </div>
          </div>
        </div>
      )}
      </main>{/* closes admin-main */}

    </div>
  );
}