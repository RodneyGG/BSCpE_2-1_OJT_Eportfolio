"use client";

import { useState, useEffect, useRef } from "react";
import { useRole } from "./context/RoleContext";
import AppNavbar from "./components/AppNavbar";
import { fetchApi } from "../lib/api";
import { useRouter } from "next/navigation";
import HeroCompanyRow from "./components/HeroCompanyRow";
import ToastStack, { useToasts } from "./components/Toast";
/* ═══════════════════════════ Data ═══════════════════════════ */
interface Student { id: string; name: string; role: string; }
interface Company { id: number; name: string; location: string; studentCount: number; students: Student[]; }

/* ═══════════════════════════ Page ════════════════════════════ */
export default function Home() {
  const router = useRouter();
  const { role } = useRole();
  const { toasts, pushToast } = useToasts();
  const [openId, setOpenId] = useState<number | null>(0);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const toggle = (id: number) => setOpenId(prev => prev === id ? null : id);
  const totalStudents = companies.reduce((s, c) => s + c.studentCount, 0);

const handleSyncCompanies = async () => {
    setSyncing(true);
    try {
      const result = await fetchApi('/admin/companies/sync', { method: 'POST' });
      pushToast(
        `Sync complete — ${result.matched} matched, ${result.needs_review} needs review, ${result.unmatched} unmatched`,
        'success'
      );
      const fresh = await fetchApi('/companies');
      setCompanies(fresh);
    } catch (err: any) {
      pushToast(err.message || 'Sync failed', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const handleDeleteCompany = async (id: number) => {
    try {
      await fetchApi(`/admin/companies/${id}`, { method: 'DELETE' });
      setCompanies(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      console.error("Failed to delete company:", err);
      alert(err.message || "Failed to delete company");
    }
  };

  useEffect(() => {
    fetchApi('/companies')
      .then(data => {
        setCompanies(data);
        setLoadingCompanies(false);
      })
      .catch(err => {
        console.error("Failed to fetch companies:", err);
        setLoadingCompanies(false);
      });
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
        @media (max-width: 768px) {
          .hero-inner { flex-direction: column !important; align-items: stretch !important; }
          .hero-stats { justify-content: center !important; }
          .footer-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .page-inner { padding: 1rem !important; }
          .hero-stats { gap: 0.5rem !important; }
          .stat-tile { min-width: 75px !important; padding: 0.75rem 0.85rem !important; }
        }
      `}</style>

      <div style={{
        minHeight: "100vh",
        backgroundColor: "#f1f5f9",
        fontFamily: "var(--font-geist-sans, system-ui, sans-serif)",
        display: "flex", flexDirection: "column",
      }}>

        {/* ══ NAVBAR ══ */}
        <AppNavbar />

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
                  fontWeight: 600 }}>OJT ADVISER</p>
              </div>

              {/* Stats */}
              <div className="hero-stats" style={{
                display: "flex", gap: "0.85rem", flexWrap: "wrap",
                animation: "fadeSlideUp 0.6s ease 0.25s both",
              }}>
                {[
                  { value: companies.length, label: "Companies", href: null as string | null, icon: <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#93c5fd" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M3 7v14M21 7v14M6 11h3M6 15h3M15 11h3M15 15h3M9 21V7l3-4 3 4v14" /></svg> },
                  { value: totalStudents,    label: "Students",  href: "/students" as string | null, icon: <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#93c5fd" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
                  { value: "300",            label: "OJT Hrs",   href: null as string | null, icon: <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#93c5fd" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
                ].map((s, i) => (
                  <div
                    key={s.label}
                    className="stat-tile"
                    role={s.href ? "button" : undefined}
                    tabIndex={s.href ? 0 : undefined}
                    onClick={() => { if (s.href) router.push(s.href); }}
                    onKeyDown={(e) => { if (s.href && (e.key === "Enter" || e.key === " ")) router.push(s.href); }}
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: "0.875rem", padding: "1rem 1.25rem",
                      textAlign: "center", minWidth: 90,
                      transition: "all 0.25s ease", cursor: s.href ? "pointer" : "default",
                      animation: `fadeSlideUp 0.5s ease ${0.3 + i * 0.1}s both`,
                    }}
                  >
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
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: 500 }}>
                {loadingCompanies ? 'Loading...' : `${companies.length} companies · ${totalStudents} students`}
              </span>
              {role === 'admin' && (
                <button
                  onClick={handleSyncCompanies}
                  disabled={syncing}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.4rem",
                    background: syncing ? "#e2e8f0" : "#eff6ff",
                    color: syncing ? "#94a3b8" : "#1d4ed8",
                    border: "1px solid",
                    borderColor: syncing ? "#e2e8f0" : "#bfdbfe",
                    borderRadius: "9999px",
                    padding: "0.3rem 0.85rem",
                    fontSize: "0.7rem", fontWeight: 700,
                    letterSpacing: "0.04em", textTransform: "uppercase",
                    cursor: syncing ? "not-allowed" : "pointer",
                    transition: "background 0.2s",
                  }}
                >
                  {syncing ? "Syncing..." : "Sync Companies"}
                </button>
              )}
            </div>
          </div>

          {/* Accordion list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
            {companies.map((company, index) => (
              <HeroCompanyRow
                key={company.id}
                company={company}
                index={index}
                isOpen={openId === company.id}
                onToggle={() => toggle(company.id)}
                onDelete={handleDeleteCompany}
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
                  OJT ADVISER
                </p>
                <p style={{ fontSize: "0.88rem", fontWeight: 700, color: "white",
                  marginBottom: "0.2rem" }}>ENGR. JAKE A. BINUYA</p>
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
      <ToastStack toasts={toasts} />
    </>
  );
}