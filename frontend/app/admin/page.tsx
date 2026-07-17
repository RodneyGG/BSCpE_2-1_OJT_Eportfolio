"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { BuildingOfficeIcon, UserGroupIcon, ClockIcon } from "@heroicons/react/24/outline";

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
function IconX() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18M6 6l12 12"/>
    </svg>
  );
}
const IconChevron = ({ open }: { open: boolean }) => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
    style={{ transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1)",
             transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const IconPin = () => (
  <svg width={11} height={11} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const IconUsersSmall = () => (
  <svg width={11} height={11} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);


/* ═══════════════════════════ Data ════════════════════════════ */
interface Student {
  id: string;
  name: string;
  program: string;
  role: string;
  email: string;
  hours: number;
  totalHours: number;
  status: string;
  dtrProofs: string[];
}

interface Company {
  id: number;
  name: string;
  location: string;
  studentCount: number;
  students: Student[];
}

const COMPANIES: Company[] = [
  {
    id: 0, name: "TechCore Solutions Inc.", location: "Cebu City, Cebu", studentCount: 3,
    students: [
      { id: "s1", name: "Juan Dela Cruz", program: "BSCpE 2-1", role: "IT Intern", email: "jdelacruz@student.edu.ph", hours: 118, totalHours: 300, status: "Active", dtrProofs: ["week1_dtr.pdf", "week2_dtr.pdf"] },
      { id: "s2", name: "Maria Santos", program: "BSCpE 2-1", role: "IT Intern", email: "msantos@student.edu.ph", hours: 250, totalHours: 300, status: "Active", dtrProofs: ["may_dtr_proof.pdf"] },
      { id: "s3", name: "Carlos Reyes", program: "BSCpE 2-1", role: "Dev Intern", email: "creyes@student.edu.ph", hours: 300, totalHours: 300, status: "Completed", dtrProofs: ["final_dtr.pdf"] },
    ],
  },
  {
    id: 1, name: "InnovatePH Engineering", location: "Manila, Metro Manila", studentCount: 2,
    students: [
      { id: "s4", name: "Ana Lim", program: "BSCpE 2-1", role: "Eng. Intern", email: "alim@student.edu.ph", hours: 45, totalHours: 300, status: "Warning", dtrProofs: [] },
      { id: "s5", name: "Rodel Gutierrez", program: "BSCpE 2-1", role: "Eng. Intern", email: "rgutierrez@student.edu.ph", hours: 0, totalHours: 300, status: "Pending Placement", dtrProofs: [] },
    ],
  },
];


/* ═══════════════════════════ Components ════════════════════════════ */
function StudentProfile({ student, index, onClick }: { student: Student; index: number, onClick: (s: Student) => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={() => onClick(student)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: "0.6rem",
        cursor: "pointer", minWidth: 80,
        opacity: 0,
        animation: `fadeSlideUp 0.4s ease forwards`,
        animationDelay: `${index * 80}ms`,
      }}
    >
      <div style={{
        width: 82, height: 82, borderRadius: "50%",
        backgroundColor: "#e6e6fa",
        border: hovered ? "3px solid #1d4ed8" : "3px solid white",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: hovered ? "0 8px 24px rgba(29,78,216,0.2)" : "0 4px 12px rgba(0,0,0,0.08)",
        position: "relative", flexShrink: 0,
        transition: "all 0.25s ease",
        transform: hovered ? "scale(1.07) translateY(-3px)" : "scale(1) translateY(0)",
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&size=80&background=random&color=fff&bold=true`} 
          alt={student.name} 
          style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} 
        />
        
        {/* Status indicator dot */}
        <div style={{
          position: "absolute", bottom: -2, right: -2,
          width: 22, height: 22, borderRadius: "50%",
          backgroundColor: student.status === "Active" ? "#3b82f6" : student.status === "Completed" ? "#10b981" : student.status === "Warning" ? "#f59e0b" : "#94a3b8", 
          border: "2px solid white",
        }} />
      </div>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.08em",
          color: hovered ? "#1d4ed8" : "#0f172a", textTransform: "uppercase",
          lineHeight: 1.3, transition: "color 0.2s", margin: 0 }}>{student.name}</p>
        <p style={{ fontSize: "0.6rem", color: "#64748b", marginTop: "0.2rem",
          letterSpacing: "0.04em", margin: "0.15rem 0 0" }}>{student.role}</p>
      </div>
    </div>
  );
}

function CompanyRow({ company, isOpen, onToggle, index, onStudentClick }: {
  company: Company; isOpen: boolean; onToggle: () => void; index: number; onStudentClick: (s: Student) => void
}) {
  const { ref, visible } = useReveal();
  const [hovered, setHovered] = useState(false);

  return (
    <div
      ref={ref}
      style={{
        borderRadius: "0.875rem", overflow: "hidden",
        border: "1px solid", borderColor: isOpen ? "#bfdbfe" : "#e2e8f0",
        boxShadow: isOpen ? "0 6px 24px rgba(29,78,216,0.12)"
          : hovered ? "0 4px 16px rgba(0,0,0,0.08)" : "0 1px 4px rgba(0,0,0,0.04)",
        transition: "box-shadow 0.25s ease, border-color 0.25s ease, transform 0.25s ease",
        transform: visible ? (hovered && !isOpen ? "translateY(-2px)" : "translateY(0)") : "translateY(20px)",
        opacity: visible ? 1 : 0,
        background: "white",
        marginBottom: "1rem",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        onClick={onToggle}
        style={{
          width: "100%", display: "flex", alignItems: "center",
          justifyContent: "space-between", padding: "1rem 1.25rem",
          background: isOpen ? "linear-gradient(90deg, #eff6ff 0%, #f0f9ff 100%)" : "white",
          border: "none", cursor: "pointer", gap: "1rem", textAlign: "left",
          transition: "background 0.3s ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", flex: 1, minWidth: 0 }}>
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
            {String(index + 1).padStart(2, "0")}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{
              fontSize: "0.9rem", fontWeight: 700, color: "#0f172a",
              letterSpacing: "-0.01em", whiteSpace: "nowrap",
              overflow: "hidden", textOverflow: "ellipsis",
            }}>{company.name}</div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.2rem", flexWrap: "wrap" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.7rem", color: "#64748b" }}>
                <IconPin /> {company.location}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.7rem", fontWeight: isOpen ? 600 : 400, color: isOpen ? "#1d4ed8" : "#64748b" }}>
                <IconUsersSmall /> {company.studentCount} student{company.studentCount !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", flexShrink: 0 }}>
          <span style={{ color: isOpen ? "#1d4ed8" : "#94a3b8", transition: "color 0.2s" }}>
            <IconChevron open={isOpen} />
          </span>
        </div>
      </button>

      <div style={{ display: "grid", gridTemplateRows: isOpen ? "1fr" : "0fr", transition: "grid-template-rows 0.35s cubic-bezier(0.4,0,0.2,1)" }}>
        <div style={{ overflow: "hidden" }}>
          <div style={{ borderTop: "1px solid #bfdbfe", background: "linear-gradient(180deg, #f0f9ff 0%, #ffffff 60%)", padding: "1.5rem 1.25rem" }}>
            <p style={{
              fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#94a3b8", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem"
            }}>
              <span style={{ display: "inline-block", width: 14, height: 2, background: "#bfdbfe", borderRadius: 9999 }} />
              Assigned Students
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem" }}>
              {company.students.map((s, i) => (
                <StudentProfile key={s.id} student={s} index={i} onClick={onStudentClick} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════ Page ════════════════════════════ */
export default function AdminDashboard() {
  const [openId, setOpenId] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const [recentDocs, setRecentDocs] = useState([
    { id: 101, student: "Juan Dela Cruz", docType: "Memorandum of Agreement", date: "Just now", status: "Needs Review" },
    { id: 102, student: "Maria Santos", docType: "Weekly Journal (Week 4)", date: "2 hours ago", status: "Needs Review" },
    { id: 103, student: "Carlos Reyes", docType: "Endorsement Letter", date: "1 day ago", status: "Approved" },
  ]);

  const toggle = (id: number) => setOpenId(prev => prev === id ? null : id);
  const approveDoc = (id: number) => setRecentDocs(docs => docs.map(d => d.id === id ? { ...d, status: "Approved" } : d));

  const getStatusColor = (status: string) => {
    if (status === "Active") return { color: "#1d4ed8", bg: "#dbeafe" };
    if (status === "Completed") return { color: "#166534", bg: "#dcfce7" };
    if (status === "Warning") return { color: "#b45309", bg: "#fef3c7" };
    return { color: "#475569", bg: "#f1f5f9" };
  };

  const filteredCompanies = COMPANIES.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.students.some(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2.5rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h1 style={{ fontSize: "2.25rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.25rem 0", letterSpacing: "-0.02em" }}>Overview</h1>
              <p style={{ fontSize: "1rem", color: "#64748b", margin: 0, fontWeight: 500 }}>Manage companies, students, and review documents.</p>
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
          
          {/* Total Hours stat block removed per user request */}
          
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
          
          {/* ── COMPANIES DIRECTORY ── */}
          <RevealBox delay={0.4}>
            <div className="admin-card" style={{ padding: "0", overflow: "hidden", border: "none", background: "transparent", boxShadow: "none" }}>
              <div style={{ padding: "0 0 1.5rem 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>Partner Companies</h2>
                <div style={{ position: "relative", width: "300px" }}>
                  <div style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>
                    <IconSearch />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Search company or student..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ width: "100%", padding: "0.65rem 1rem 0.65rem 2.5rem", borderRadius: "999px", border: "1px solid #cbd5e1", fontSize: "0.85rem", outline: "none", background: "white" }} 
                  />
                </div>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column" }}>
                {filteredCompanies.map((company, index) => (
                  <CompanyRow
                    key={company.id}
                    company={company}
                    index={index}
                    isOpen={openId === company.id}
                    onToggle={() => toggle(company.id)}
                    onStudentClick={setSelectedStudent}
                  />
                ))}
                {filteredCompanies.length === 0 && (
                  <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8", background: "white", borderRadius: "1rem" }}>
                    No companies or students found matching your search.
                  </div>
                )}
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
                <p style={{ margin: "0.2rem 0 0", color: "#64748b", fontSize: "0.9rem", fontWeight: 500 }}>{selectedStudent.program} • {selectedStudent.email}</p>
                <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem" }}>
                  <span style={{ 
                    padding: "0.2rem 0.75rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase",
                    color: getStatusColor(selectedStudent.status).color, background: getStatusColor(selectedStudent.status).bg
                  }}>
                    {selectedStudent.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "2rem", maxHeight: "60vh", overflowY: "auto" }}>
              
              <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1rem" }}>Deployment Details</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#475569", fontWeight: 600, fontSize: "0.95rem" }}>Role</span>
                  <span style={{ color: "#0f172a", fontWeight: 700 }}>{selectedStudent.role}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#475569", fontWeight: 600, fontSize: "0.95rem" }}>Supervisor</span>
                  <span style={{ color: "#0f172a", fontWeight: 700 }}>Pending Review</span>
                </div>
              </div>

              <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1rem" }}>OJT Progress</h3>
              <div style={{ background: "#f8fafc", padding: "1.25rem", borderRadius: "1rem", border: "1px solid #e2e8f0", marginBottom: "2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "2rem", fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>{selectedStudent.hours} <span style={{ fontSize: "1rem", color: "#64748b", fontWeight: 600 }}>/ {selectedStudent.totalHours} hrs</span></span>
                  <span style={{ fontSize: "1rem", fontWeight: 800, color: selectedStudent.hours >= 300 ? "#10b981" : "#3b82f6" }}>
                    {Math.round((selectedStudent.hours / selectedStudent.totalHours) * 100)}%
                  </span>
                </div>
                <div style={{ width: "100%", height: "8px", background: "#e2e8f0", borderRadius: "999px", overflow: "hidden", marginTop: "1rem" }}>
                  <div style={{ width: `${(selectedStudent.hours / selectedStudent.totalHours) * 100}%`, height: "100%", background: selectedStudent.hours >= 300 ? "#10b981" : "#3b82f6", borderRadius: "999px" }} />
                </div>
              </div>

              <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1rem" }}>Uploaded DTR Proofs</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {selectedStudent.dtrProofs && selectedStudent.dtrProofs.length > 0 ? (
                  selectedStudent.dtrProofs.map((proof, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1rem", border: "1px solid #e2e8f0", borderRadius: "0.5rem", background: "white" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <IconFileText />
                        <span style={{ fontSize: "0.9rem", color: "#0f172a", fontWeight: 600 }}>{proof}</span>
                      </div>
                      <a href="#" style={{ fontSize: "0.8rem", color: "#3b82f6", fontWeight: 600, textDecoration: "none" }}>View PDF</a>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: "1rem", textAlign: "center", color: "#94a3b8", fontSize: "0.9rem", border: "1px dashed #cbd5e1", borderRadius: "0.5rem" }}>
                    No DTR proofs uploaded yet.
                  </div>
                )}
              </div>

            </div>
            
            {/* Modal Footer */}
            <div style={{ padding: "1.5rem 2rem", background: "#f8fafc", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
              <button onClick={() => setSelectedStudent(null)} style={{ padding: "0.6rem 1.25rem", borderRadius: "0.5rem", background: "white", border: "1px solid #cbd5e1", color: "#475569", fontWeight: 600, cursor: "pointer" }}>Close</button>
              <button style={{ padding: "0.6rem 1.25rem", borderRadius: "0.5rem", background: "#0f172a", border: "none", color: "white", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <IconFileText /> Download All DTR
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
