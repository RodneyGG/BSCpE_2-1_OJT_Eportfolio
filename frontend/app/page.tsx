"use client";

import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════ Data ═══════════════════════════ */
interface Student { id: string; name: string; role: string; }
interface Company { id: number; name: string; location: string; studentCount: number; students: Student[]; }

const COMPANIES: Company[] = [
  {
    id: 0, name: "TechCore Solutions Inc.", location: "Cebu City, Cebu", studentCount: 3,
    students: [
      { id: "s1", name: "JUAN D. CRUZ",    role: "IT Intern"  },
      { id: "s2", name: "MARIA SANTOS",    role: "IT Intern"  },
      { id: "s3", name: "CARLOS REYES",    role: "Dev Intern" },
    ],
  },
  {
    id: 1, name: "InnovatePH Engineering", location: "Manila, Metro Manila", studentCount: 2,
    students: [
      { id: "s4", name: "ANA LIM",         role: "Eng. Intern" },
      { id: "s5", name: "RODEL GUTIERREZ", role: "Eng. Intern" },
    ],
  },
  {
    id: 2, name: "NexGen Electronics Corp.", location: "Lapu-Lapu City, Cebu", studentCount: 4,
    students: [
      { id: "s6",  name: "JESSA FERNANDEZ",  role: "Tech Intern" },
      { id: "s7",  name: "MIGUEL TORRES",    role: "Tech Intern" },
      { id: "s8",  name: "LOVELY PASCUAL",   role: "QA Intern"   },
      { id: "s9",  name: "DANTE VILLANUEVA", role: "Tech Intern" },
    ],
  },
  {
    id: 3, name: "CloudBridge Systems", location: "Quezon City, NCR", studentCount: 1,
    students: [{ id: "s10", name: "PATRICIA CRUZ",  role: "Cloud Intern" }],
  },
  {
    id: 4, name: "Digital Minds PH", location: "Davao City, Davao", studentCount: 2,
    students: [
      { id: "s11", name: "GERALD ONG",   role: "UX Intern"  },
      { id: "s12", name: "TRICIA LUNA",  role: "Dev Intern" },
    ],
  },
  {
    id: 5, name: "Sigma Tech Corporation", location: "Pasig City, NCR", studentCount: 3,
    students: [
      { id: "s13", name: "MARK DELA CRUZ", role: "IT Intern"  },
      { id: "s14", name: "NINA BAUTISTA",  role: "Dev Intern" },
      { id: "s15", name: "RYAN SANTOS",    role: "QA Intern"  },
    ],
  },
];

/* ═══════════════════════════ Icons ═══════════════════════════ */
const IconChevron = ({ open }: { open: boolean }) => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
    style={{ transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1)",
             transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const IconUser = () => (
  <svg width={38} height={38} viewBox="0 0 24 24" fill="none"
    stroke="#4c3d8f" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconPin = () => (
  <svg width={11} height={11} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);

const IconUsers = () => (
  <svg width={11} height={11} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

/* ═══════════════════════ Scroll reveal hook ════════════════════ */
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

/* ══════════════════════ Student profile card ════════════════════ */
function StudentProfile({ student, index }: { student: Student; index: number }) {
  const initials = student.name.split(" ").map(w => w[0]).slice(0, 2).join("");
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: "0.6rem",
        cursor: "default", minWidth: 80,
        opacity: 0,
        animation: `fadeSlideUp 0.4s ease forwards`,
        animationDelay: `${index * 80}ms`,
      }}
    >
      <div style={{
        width: 82, height: 82, borderRadius: "50%",
        backgroundColor: "#e6e6fa",
        border: hovered ? "3px solid #7c3aed" : "3px solid #c4b5fd",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: hovered
          ? "0 8px 24px rgba(124,58,237,0.3)"
          : "0 4px 12px rgba(124,58,237,0.12)",
        position: "relative", flexShrink: 0,
        transition: "all 0.25s ease",
        transform: hovered ? "scale(1.07) translateY(-3px)" : "scale(1) translateY(0)",
      }}>
        <IconUser />
        <div style={{
          position: "absolute", bottom: -2, right: -2,
          width: 22, height: 22, borderRadius: "50%",
          backgroundColor: "#1d4ed8", border: "2px solid white",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "0.52rem", fontWeight: 800, color: "white",
        }}>{initials}</div>
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

/* ══════════════════════ Company accordion row ════════════════════ */
function CompanyRow({ company, isOpen, onToggle, index }: {
  company: Company; isOpen: boolean; onToggle: () => void; index: number;
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
        transform: visible
          ? hovered && !isOpen ? "translateY(-2px)" : "translateY(0)"
          : "translateY(20px)",
        opacity: visible ? 1 : 0,
        animationDelay: `${index * 60}ms`,
        background: "white",
        transitionProperty: "box-shadow, border-color, transform, opacity",
        transitionDuration: "0.25s, 0.25s, 0.25s, 0.5s",
        transitionTimingFunction: "ease",
        transitionDelay: `0s, 0s, 0s, ${index * 60}ms`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Header */}
      <button
        id={`company-accordion-${company.id}`}
        aria-expanded={isOpen}
        onClick={onToggle}
        style={{
          width: "100%", display: "flex", alignItems: "center",
          justifyContent: "space-between",
          padding: "1rem 1.25rem",
          background: isOpen
            ? "linear-gradient(90deg, #eff6ff 0%, #f0f9ff 100%)" : "white",
          border: "none", cursor: "pointer", gap: "1rem", textAlign: "left",
          transition: "background 0.3s ease",
        }}
      >
        {/* Left */}
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
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem",
              marginTop: "0.2rem", flexWrap: "wrap" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "0.3rem",
                fontSize: "0.7rem", color: "#64748b" }}>
                <IconPin /> {company.location}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "0.3rem",
                fontSize: "0.7rem", fontWeight: isOpen ? 600 : 400,
                color: isOpen ? "#1d4ed8" : "#64748b",
                transition: "color 0.2s" }}>
                <IconUsers /> {company.studentCount} student{company.studentCount !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Right */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", flexShrink: 0 }}>
          <span style={{
            fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.06em",
            textTransform: "uppercase", padding: "0.22rem 0.6rem",
            borderRadius: "9999px", background: "#fef3c7", color: "#92400e",
            border: "1px solid #fde68a",
            display: "none",
          }}
            className="moa-pill"
          >View MOA</span>
          <span style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.06em",
            textTransform: "uppercase", padding: "0.22rem 0.6rem",
            borderRadius: "9999px", background: "#fef3c7", color: "#92400e",
            border: "1px solid #fde68a" }}>MOA</span>
          <span style={{ color: isOpen ? "#1d4ed8" : "#94a3b8", transition: "color 0.2s" }}>
            <IconChevron open={isOpen} />
          </span>
        </div>
      </button>

      {/* Expandable body */}
      <div style={{
        display: "grid",
        gridTemplateRows: isOpen ? "1fr" : "0fr",
        transition: "grid-template-rows 0.35s cubic-bezier(0.4,0,0.2,1)",
      }}>
        <div style={{ overflow: "hidden" }}>
          <div style={{
            borderTop: "1px solid #bfdbfe",
            background: "linear-gradient(180deg, #f0f9ff 0%, #ffffff 60%)",
            padding: "1.5rem 1.25rem",
          }}>
            <p style={{
              fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.15em",
              textTransform: "uppercase", color: "#94a3b8", marginBottom: "1.25rem",
              display: "flex", alignItems: "center", gap: "0.5rem",
            }}>
              <span style={{ display: "inline-block", width: 14, height: 2,
                background: "#bfdbfe", borderRadius: 9999 }} />
              Assigned Students
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem" }}>
              {company.students.map((s, i) => (
                <StudentProfile key={s.id} student={s} index={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════ Page ════════════════════════════ */
export default function Home() {
  const [openId, setOpenId] = useState<number | null>(0);
  const [navScrolled, setNavScrolled] = useState(false);

  const toggle = (id: number) => setOpenId(prev => prev === id ? null : id);
  const totalStudents = COMPANIES.reduce((s, c) => s + c.studentCount, 0);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* ── Keyframe injection ── */}
      <style>{`
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.94); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes pulse-dot {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.5); }
          50%       { box-shadow: 0 0 0 5px rgba(34,197,94,0); }
        }
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .stat-tile:hover {
          background: rgba(255,255,255,0.18) !important;
          transform: translateY(-3px);
        }
        .moa-pill-full { display: inline-flex !important; }
        @media (max-width: 640px) {
          .hero-stats { justify-content: center !important; }
          .hero-inner { flex-direction: column !important; align-items: flex-start !important; }
          .footer-grid { grid-template-columns: 1fr !important; }
          .nav-inner { padding: 0 1rem !important; }
          .page-inner { padding: 1rem !important; }
        }
      `}</style>

      <div style={{
        minHeight: "100vh",
        backgroundColor: "#f1f5f9",
        fontFamily: "var(--font-geist-sans, system-ui, sans-serif)",
        display: "flex", flexDirection: "column",
      }}>

        {/* ══ NAVBAR ══ */}
        <nav style={{
          background: navScrolled
            ? "rgba(15,23,42,0.97)"
            : "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",
          backdropFilter: navScrolled ? "blur(12px)" : "none",
          boxShadow: navScrolled ? "0 4px 24px rgba(0,0,0,0.4)" : "0 2px 12px rgba(15,23,42,0.4)",
          position: "sticky", top: 0, zIndex: 50,
          transition: "all 0.3s ease",
          animation: "fadeSlideDown 0.5s ease forwards",
        }}>
          <div className="nav-inner" style={{
            maxWidth: 1280, margin: "0 auto",
            padding: "0 2rem", height: 60,
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem",
          }}>
            {/* Brand */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
              <div style={{
                width: 34, height: 34, borderRadius: "0.5rem",
                background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 0 0 2px rgba(99,102,241,0.35)",
                flexShrink: 0,
              }}>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
                  stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: "0.88rem", fontWeight: 800, color: "white",
                  letterSpacing: "0.05em", lineHeight: 1 }}>BSCPE 2-1</div>
                <div style={{ fontSize: "0.55rem", color: "#93c5fd", letterSpacing: "0.14em",
                  textTransform: "uppercase", lineHeight: 1, marginTop: 2 }}>OJT Tracker</div>
              </div>
            </div>

            {/* Right */}
            <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
              <a href="#companies" style={{ fontSize: "0.75rem", fontWeight: 600,
                color: "#93c5fd", textDecoration: "none", letterSpacing: "0.06em",
                textTransform: "uppercase", transition: "color 0.2s" }}>
                Companies
              </a>
              <div style={{ width: 1, height: 20, backgroundColor: "rgba(255,255,255,0.12)" }} />
              {/* User pill */}
              <div style={{
                display: "flex", alignItems: "center", gap: "0.5rem",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "9999px",
                padding: "0.28rem 0.85rem 0.28rem 0.35rem",
              }}>
                <div style={{
                  width: 26, height: 26, borderRadius: "50%",
                  background: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.6rem", fontWeight: 800, color: "white", flexShrink: 0,
                }}>JD</div>
                <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "white",
                  letterSpacing: "0.05em", textTransform: "uppercase",
                  whiteSpace: "nowrap" }}>JUAN DELA CRUZ</span>
              </div>
            </div>
          </div>
        </nav>

        {/* ══ HERO ══ */}
        <div style={{
          background: "linear-gradient(160deg, #0f172a 0%, #1e3a8a 55%, #1e40af 100%)",
          padding: "0",
        }}>
          <div style={{
            maxWidth: 1280, margin: "0 auto", padding: "2.5rem 2rem 3rem",
            position: "relative", overflow: "hidden",
          }}>
            {/* Deco blobs */}
            {[
              { top: -80, right: -80, size: 280, color: "rgba(99,102,241,0.18)" },
              { top: "40%", left: -60, size: 200, color: "rgba(59,130,246,0.12)" },
              { bottom: -60, right: "20%", size: 180, color: "rgba(139,92,246,0.1)" },
            ].map((b, i) => (
              <div key={i} aria-hidden="true" style={{
                position: "absolute", borderRadius: "50%",
                width: b.size, height: b.size, backgroundColor: b.color,
                top: b.top, bottom: b.bottom, left: b.left, right: b.right,
                pointerEvents: "none",
                animation: `fadeIn 1s ease ${i * 0.2}s both`,
              }} />
            ))}

            <div className="hero-inner" style={{
              display: "flex", alignItems: "center",
              justifyContent: "space-between", flexWrap: "wrap",
              gap: "2rem", position: "relative", zIndex: 1,
            }}>
              {/* Text */}
              <div style={{ animation: "fadeSlideUp 0.6s ease 0.1s both" }}>
                <p style={{ fontSize: "0.6rem", letterSpacing: "0.28em",
                  textTransform: "uppercase", color: "#93c5fd", fontWeight: 600,
                  marginBottom: "0.5rem" }}>
                  On-the-Job Training · Summer Term
                </p>
                <h1 style={{ fontSize: "clamp(2.2rem, 5vw, 3.5rem)", fontWeight: 900,
                  color: "white", letterSpacing: "-0.03em", lineHeight: 1, margin: 0 }}>
                  BSCPE 2-1
                </h1>
                {/* Accent bar */}
                <div style={{
                  width: 48, height: 4, borderRadius: 9999,
                  background: "linear-gradient(90deg, #f59e0b, #ef4444)",
                  margin: "0.85rem 0",
                  animation: "scaleIn 0.5s ease 0.4s both",
                }} />
                <p style={{ fontSize: "1rem", fontWeight: 700, color: "#e2e8f0", margin: 0 }}>
                  ENGR. JAKE A. BINUYA
                </p>
                <p style={{ fontSize: "0.6rem", letterSpacing: "0.2em",
                  textTransform: "uppercase", color: "#64748b", marginTop: "0.25rem",
                  fontWeight: 600 }}>OJT Adviser</p>
              </div>

              {/* Stats */}
              <div className="hero-stats" style={{
                display: "flex", gap: "0.85rem", flexWrap: "wrap",
                animation: "fadeSlideUp 0.6s ease 0.25s both",
              }}>
                {[
                  { value: COMPANIES.length, label: "Companies", icon: "🏢" },
                  { value: totalStudents,    label: "Students",  icon: "👥" },
                  { value: "600",            label: "OJT Hrs",   icon: "⏱️" },
                ].map((s, i) => (
                  <div key={s.label} className="stat-tile" style={{
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "0.875rem", padding: "1rem 1.25rem",
                    textAlign: "center", minWidth: 90,
                    transition: "all 0.25s ease", cursor: "default",
                    animation: `fadeSlideUp 0.5s ease ${0.3 + i * 0.1}s both`,
                  }}>
                    <div style={{ fontSize: "1.1rem", marginBottom: "0.3rem" }}>{s.icon}</div>
                    <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "white",
                      letterSpacing: "-0.03em", lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontSize: "0.58rem", letterSpacing: "0.1em",
                      textTransform: "uppercase", color: "#93c5fd", marginTop: "0.3rem",
                      fontWeight: 600 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ══ MAIN CONTENT ══ */}
        <main className="page-inner" style={{
          maxWidth: 1280, margin: "0 auto",
          padding: "2rem 2rem 3rem", flex: 1, width: "100%",
        }}>
          {/* Section header */}
          <div id="companies" style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.5rem",
            animation: "fadeIn 0.6s ease 0.4s both",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <div style={{ width: 4, height: 20, borderRadius: 9999,
                background: "linear-gradient(180deg, #3b82f6, #6366f1)" }} />
              <span style={{ fontSize: "0.7rem", fontWeight: 700,
                letterSpacing: "0.15em", textTransform: "uppercase", color: "#475569" }}>
                Partner Companies
              </span>
            </div>
            <span style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: 500 }}>
              {COMPANIES.length} companies · {totalStudents} students
            </span>
          </div>

          {/* Accordion list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
            {COMPANIES.map((company, index) => (
              <CompanyRow
                key={company.id}
                company={company}
                index={index}
                isOpen={openId === company.id}
                onToggle={() => toggle(company.id)}
              />
            ))}
          </div>
        </main>

        {/* ══ FOOTER ══ */}
        <footer style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",
          boxShadow: "0 -2px 20px rgba(15,23,42,0.35)",
          marginTop: "auto",
        }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "2.5rem 2rem" }}>
            <div className="footer-grid" style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "2rem",
            }}>
              {/* Brand */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem",
                  marginBottom: "0.85rem" }}>
                  <div style={{ width: 30, height: 30, borderRadius: "0.45rem",
                    background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
                    display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
                      stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
                    </svg>
                  </div>
                  <span style={{ fontWeight: 800, fontSize: "0.85rem", color: "white",
                    letterSpacing: "0.04em" }}>BSCPE 2-1</span>
                </div>
                <p style={{ fontSize: "0.73rem", color: "#64748b", lineHeight: 1.65, margin: 0 }}>
                  On-the-Job Training Portal for 2nd Year Computer Engineering students.
                </p>
              </div>

              {/* Programme */}
              <div>
                <p style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.15em",
                  textTransform: "uppercase", color: "#3b82f6", marginBottom: "0.75rem" }}>
                  Programme
                </p>
                {[
                  ["Course",   "BS Computer Engineering"],
                  ["Year",     "Second Year — Summer Term"],
                  ["Subject",  "On-the-Job Training 1"],
                ].map(([k, v]) => (
                  <div key={k} style={{ marginBottom: "0.4rem" }}>
                    <span style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 500 }}>{k}: </span>
                    <span style={{ fontSize: "0.68rem", color: "#cbd5e1", fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
              </div>

              {/* Adviser */}
              <div>
                <p style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.15em",
                  textTransform: "uppercase", color: "#3b82f6", marginBottom: "0.75rem" }}>
                  OJT Adviser
                </p>
                <p style={{ fontSize: "0.88rem", fontWeight: 700, color: "white",
                  marginBottom: "0.2rem" }}>Engr. Jake A. Binuya</p>
                <p style={{ fontSize: "0.68rem", color: "#64748b", margin: 0 }}>
                  College of Engineering
                </p>
              </div>
            </div>
          </div>

          {/* Bottom strip */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", padding: "0.85rem 2rem" }}>
            <div style={{ maxWidth: 1280, margin: "0 auto",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              flexWrap: "wrap", gap: "0.5rem" }}>
              <p style={{ fontSize: "0.63rem", color: "#475569", margin: 0, letterSpacing: "0.04em" }}>
                © {new Date().getFullYear()} BSCPE 2-1 · OJT Tracker · All rights reserved.
              </p>
              <div style={{ display: "flex", gap: "0.45rem", alignItems: "center" }}>
                <div style={{
                  width: 7, height: 7, borderRadius: "50%", backgroundColor: "#22c55e",
                  animation: "pulse-dot 2s ease-in-out infinite",
                }} />
                <span style={{ fontSize: "0.62rem", color: "#475569", letterSpacing: "0.06em" }}>
                  System Online
                </span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
