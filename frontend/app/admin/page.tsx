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
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7"/>
    </svg>
  );
}
function IconSearch() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
    </svg>
  );
}
function IconUsers() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}
function IconClock() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
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
function IconCheck() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}
function IconEye() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

/* ═══════════════════════════ Page ════════════════════════════ */
export default function AdminDashboard() {
  // Mock Data
  const [students] = useState([
    { id: 1, name: "Juan Dela Cruz", program: "BSCpE 2-1", company: "TechCore Solutions Inc.", hours: 118, totalHours: 300, status: "Active" },
    { id: 2, name: "Maria Clara", program: "BSCpE 2-1", company: "Innovatech Labs", hours: 250, totalHours: 300, status: "Active" },
    { id: 3, name: "Crisostomo Ibarra", program: "BSCpE 2-1", company: "DataSync Systems", hours: 300, totalHours: 300, status: "Completed" },
    { id: 4, name: "Sisa Reyes", program: "BSCpE 2-1", company: "Unassigned", hours: 0, totalHours: 300, status: "Pending Placement" },
    { id: 5, name: "Elias Torres", program: "BSCpE 2-1", company: "NextGen Tech", hours: 45, totalHours: 300, status: "Warning" },
  ]);

  const [recentDocs, setRecentDocs] = useState([
    { id: 101, student: "Juan Dela Cruz", docType: "Memorandum of Agreement", date: "Just now", status: "Needs Review" },
    { id: 102, student: "Maria Clara", docType: "Weekly Journal (Week 4)", date: "2 hours ago", status: "Needs Review" },
    { id: 103, student: "Elias Torres", docType: "Endorsement Letter", date: "1 day ago", status: "Approved" },
  ]);

  const [searchQuery, setSearchQuery] = useState("");

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const approveDoc = (id: number) => {
    setRecentDocs(docs => docs.map(d => d.id === id ? { ...d, status: "Approved" } : d));
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f1f5f9", // Slight gray/blue background for admin
      fontFamily: "var(--font-geist-sans, system-ui, sans-serif)",
      display: "flex", flexDirection: "column",
    }}>
      <style>{`
        .admin-card {
          background: white; border-radius: 1.25rem; padding: 1.5rem; 
          box-shadow: 0 4px 15px rgba(0,0,0,0.03); border: 1px solid #e2e8f0;
        }
        .stat-icon {
          width: 48px; height: 48px; border-radius: 1rem;
          display: flex; alignItems: center; justify-content: center;
        }
        .student-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; text-align: left; }
        .student-table th { padding: 1.25rem 1rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #e2e8f0; }
        .student-table td { padding: 1.25rem 1rem; color: #0f172a; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
        .student-table tr:hover td { background: #f8fafc; }
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
      `}</style>

      {/* ══ TOP NAV ══ */}
      <nav style={{
        background: "white",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{
          maxWidth: 1400, margin: "0 auto", padding: "0 2rem", height: 64,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <Link href="/" className="back-link" style={{
            display: "flex", alignItems: "center", gap: "0.5rem",
            color: "#475569", textDecoration: "none", fontSize: "0.85rem",
            fontWeight: 600, transition: "opacity 0.2s ease"
          }}>
            <IconBack />
            Return to Homepage
          </Link>
          <div style={{ fontSize: "0.8rem", fontWeight: 800, color: "#1e293b", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444" }}></div>
            OJT ADMIN DASHBOARD
          </div>
        </div>
      </nav>

      {/* ══ MAIN DASHBOARD ══ */}
      <main style={{ maxWidth: 1400, margin: "0 auto", padding: "2.5rem 2rem", flex: 1, width: "100%" }}>
        
        {/* Header */}
        <RevealBox>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2.5rem" }}>
            <div>
              <h1 style={{ fontSize: "2.25rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.25rem 0", letterSpacing: "-0.02em" }}>Overview</h1>
              <p style={{ fontSize: "1rem", color: "#64748b", margin: 0, fontWeight: 500 }}>Manage students, track hours, and review documents.</p>
            </div>
            <div style={{ color: "#64748b", fontSize: "0.85rem", fontWeight: 600 }}>
              Academic Year: <span style={{ color: "#0f172a" }}>2025-2026 (Summer)</span>
            </div>
          </div>
        </RevealBox>

        {/* ── STATS ROW ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem", marginBottom: "2.5rem" }}>
          
          <RevealBox delay={0.1}>
            <div className="admin-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                <div className="stat-icon" style={{ background: "#eff6ff", color: "#3b82f6" }}><IconUsers /></div>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#10b981", background: "#dcfce7", padding: "0.2rem 0.6rem", borderRadius: "999px" }}>100% Enrolled</span>
              </div>
              <h3 style={{ fontSize: "2rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.25rem 0" }}>42</h3>
              <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0, fontWeight: 600 }}>Total Students</p>
            </div>
          </RevealBox>

          <RevealBox delay={0.2}>
            <div className="admin-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                <div className="stat-icon" style={{ background: "#fef3c7", color: "#d97706" }}><IconClock /></div>
              </div>
              <h3 style={{ fontSize: "2rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.25rem 0" }}>8,450</h3>
              <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0, fontWeight: 600 }}>Total Hours Logged</p>
            </div>
          </RevealBox>

          <RevealBox delay={0.3}>
            <div className="admin-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                <div className="stat-icon" style={{ background: "#fee2e2", color: "#ef4444" }}><IconFileText /></div>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#ef4444", background: "#fee2e2", padding: "0.2rem 0.6rem", borderRadius: "999px" }}>12 Action Needed</span>
              </div>
              <h3 style={{ fontSize: "2rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.25rem 0" }}>24</h3>
              <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0, fontWeight: 600 }}>Pending Approvals</p>
            </div>
          </RevealBox>

        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2.5rem" }}>
          
          {/* ── STUDENTS DIRECTORY ── */}
          <RevealBox delay={0.4}>
            <div className="admin-card" style={{ padding: "0", overflow: "hidden" }}>
              <div style={{ padding: "1.5rem", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>Student Directory</h2>
                <div style={{ position: "relative", width: "300px" }}>
                  <div style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>
                    <IconSearch />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Search by name or company..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ width: "100%", padding: "0.65rem 1rem 0.65rem 2.5rem", borderRadius: "999px", border: "1px solid #cbd5e1", fontSize: "0.85rem", outline: "none", background: "#f8fafc" }} 
                  />
                </div>
              </div>
              
              <div style={{ overflowX: "auto" }}>
                <table className="student-table">
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Company</th>
                      <th style={{ width: "160px" }}>Progress</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((s) => (
                      <tr key={s.id}>
                        <td>
                          <div style={{ fontWeight: 700 }}>{s.name}</div>
                          <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.1rem" }}>{s.program}</div>
                        </td>
                        <td style={{ color: "#475569", fontWeight: 500 }}>{s.company}</td>
                        <td>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", fontWeight: 700, marginBottom: "0.3rem", color: "#475569" }}>
                            <span>{s.hours} / {s.totalHours}</span>
                            <span>{Math.round((s.hours / s.totalHours) * 100)}%</span>
                          </div>
                          <div style={{ width: "100%", height: "6px", background: "#e2e8f0", borderRadius: "999px", overflow: "hidden" }}>
                            <div style={{ width: `${(s.hours / s.totalHours) * 100}%`, height: "100%", background: s.hours >= 300 ? "#10b981" : "#3b82f6", borderRadius: "999px" }} />
                          </div>
                        </td>
                        <td>
                          <span style={{ 
                            fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", padding: "0.3rem 0.75rem", borderRadius: "999px",
                            color: s.status === "Active" ? "#1d4ed8" : s.status === "Completed" ? "#166534" : s.status === "Warning" ? "#b45309" : "#475569",
                            background: s.status === "Active" ? "#dbeafe" : s.status === "Completed" ? "#dcfce7" : s.status === "Warning" ? "#fef3c7" : "#f1f5f9"
                          }}>
                            {s.status}
                          </span>
                        </td>
                        <td>
                          <Link href="/profile" style={{ textDecoration: "none" }}>
                            <button className="btn-action">
                              <IconEye /> View
                            </button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {filteredStudents.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>No students found matching your search.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </RevealBox>

          {/* ── RECENT APPROVALS ── */}
          <RevealBox delay={0.5}>
            <div className="admin-card">
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a", margin: "0 0 1.5rem 0" }}>Recent Submissions</h2>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {recentDocs.map((doc) => (
                  <div key={doc.id} style={{ border: "1px solid #e2e8f0", borderRadius: "1rem", padding: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a" }}>{doc.docType}</div>
                      <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.2rem" }}>
                        <span style={{ fontWeight: 600, color: "#475569" }}>{doc.student}</span> • {doc.date}
                      </div>
                    </div>
                    {doc.status === "Needs Review" ? (
                      <button className="btn-action btn-approve" onClick={() => approveDoc(doc.id)}>
                        <IconCheck /> Approve
                      </button>
                    ) : (
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#10b981", display: "flex", alignItems: "center", gap: "0.2rem" }}>
                        <IconCheck /> Approved
                      </span>
                    )}
                  </div>
                ))}
              </div>
              
              <button style={{ width: "100%", background: "#f8fafc", border: "1px dashed #cbd5e1", borderRadius: "0.75rem", padding: "0.75rem", fontSize: "0.85rem", fontWeight: 600, color: "#475569", marginTop: "1rem", cursor: "pointer", transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = "#f1f5f9"} onMouseLeave={(e) => e.currentTarget.style.background = "#f8fafc"}>
                View All Submissions
              </button>
            </div>
          </RevealBox>

        </div>
      </main>
    </div>
  );
}
