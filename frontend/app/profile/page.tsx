"use client";

import Link from "next/link";

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

/* ═══════════════════════════ Page ════════════════════════════ */
export default function ProfilePage() {
  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#f1f5f9",
      fontFamily: "var(--font-geist-sans, system-ui, sans-serif)",
      display: "flex", flexDirection: "column",
    }}>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.94); }
          to   { opacity: 1; transform: scale(1); }
        }
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0,0,0,0.08);
        }
        .back-link:hover { opacity: 0.8; }
      `}</style>

      {/* ══ TOP NAV ══ */}
      <nav style={{
        background: "white",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{
          maxWidth: 1000, margin: "0 auto", padding: "0 2rem", height: 60,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <Link href="/" className="back-link" style={{
            display: "flex", alignItems: "center", gap: "0.5rem",
            color: "#475569", textDecoration: "none", fontSize: "0.8rem",
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
      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "3rem 2rem", flex: 1, width: "100%" }}>
        
        {/* Profile Header Card */}
        <div style={{
          background: "white", borderRadius: "1.25rem",
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", overflow: "hidden",
          animation: "fadeSlideUp 0.6s ease both",
          marginBottom: "2rem",
        }}>
          {/* Cover Photo Area */}
          <div style={{
            height: 140,
            background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",
            position: "relative"
          }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: 0.1, backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />
          </div>

          {/* User Info Area */}
          <div style={{ padding: "0 2rem 2rem", position: "relative" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", alignItems: "flex-end", marginTop: "-48px", marginBottom: "1.5rem" }}>
              {/* Avatar */}
              <div style={{
                width: 110, height: 110, borderRadius: "50%",
                background: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
                border: "4px solid white", display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)", flexShrink: 0,
                fontSize: "2.5rem", fontWeight: 800, color: "white"
              }}>
                JD
              </div>
              
              <div style={{ flex: 1, minWidth: 200, paddingBottom: "0.5rem" }}>
                <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.25rem 0", letterSpacing: "-0.02em" }}>Juan Dela Cruz</h1>
                <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0, fontWeight: 500 }}>BS Computer Engineering · 2nd Year</p>
              </div>

              {/* Action Button */}
              <button style={{
                background: "#f1f5f9", border: "none", borderRadius: "0.5rem",
                padding: "0.6rem 1.25rem", fontSize: "0.8rem", fontWeight: 600, color: "#475569",
                cursor: "pointer", transition: "background 0.2s", marginBottom: "0.5rem"
              }}>
                Edit Profile
              </button>
            </div>

            {/* Contact & Meta Row */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", borderTop: "1px solid #e2e8f0", paddingTop: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#475569", fontSize: "0.8rem" }}>
                <IconMail /> juan.delacruz@university.edu.ph
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#475569", fontSize: "0.8rem" }}>
                <IconPhone /> +63 912 345 6789
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
          
          {/* ── Left Column ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {/* OJT Status */}
            <div style={{ animation: "fadeSlideUp 0.6s ease 0.1s both" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", marginBottom: "1rem" }}>OJT Deployment Details</h2>
              <div style={{ background: "white", borderRadius: "1rem", padding: "1.5rem", boxShadow: "0 2px 4px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
                  <div>
                    <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#3b82f6", marginBottom: "0.25rem" }}>Assigned Company</div>
                    <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a" }}>TechCore Solutions Inc.</div>
                    <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.1rem" }}>Cebu City, Cebu</div>
                  </div>
                  <span style={{ background: "#dcfce7", color: "#166534", padding: "0.3rem 0.75rem", borderRadius: "9999px", fontSize: "0.7rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <IconCheck /> Active
                  </span>
                </div>
                
                <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "1rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <div style={{ fontSize: "0.7rem", color: "#94a3b8", textTransform: "uppercase", fontWeight: 600, marginBottom: "0.2rem" }}>Role</div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#475569" }}>IT Intern</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.7rem", color: "#94a3b8", textTransform: "uppercase", fontWeight: 600, marginBottom: "0.2rem" }}>Adviser</div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#475569" }}>Engr. Jake Binuya</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Hours Progress */}
            <div style={{ animation: "fadeSlideUp 0.6s ease 0.2s both" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", marginBottom: "1rem" }}>Hours Tracker</h2>
              <div className="stat-card" style={{ background: "white", borderRadius: "1rem", padding: "1.5rem", boxShadow: "0 2px 4px rgba(0,0,0,0.04)", transition: "transform 0.2s, box-shadow 0.2s" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "0.75rem" }}>
                  <div>
                    <span style={{ fontSize: "2rem", fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>142</span>
                    <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 600, marginLeft: "0.3rem" }}>/ 600 hrs</span>
                  </div>
                  <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#3b82f6" }}>23%</span>
                </div>
                {/* Progress Bar */}
                <div style={{ width: "100%", height: 8, background: "#e2e8f0", borderRadius: 9999, overflow: "hidden" }}>
                  <div style={{ width: "23%", height: "100%", background: "linear-gradient(90deg, #3b82f6, #6366f1)", borderRadius: 9999 }} />
                </div>
                <p style={{ fontSize: "0.75rem", color: "#94a3b8", margin: "1rem 0 0", textAlign: "center" }}>Keep up the good work! 458 hours remaining.</p>
              </div>
            </div>
          </div>

          {/* ── Right Column ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {/* Documents */}
            <div style={{ animation: "fadeSlideUp 0.6s ease 0.3s both" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", marginBottom: "1rem" }}>Required Documents</h2>
              <div style={{ background: "white", borderRadius: "1rem", padding: "0.5rem", boxShadow: "0 2px 4px rgba(0,0,0,0.04)" }}>
                {[
                  { name: "Resume / CV", status: "submitted", date: "May 10" },
                  { name: "Endorsement Letter", status: "submitted", date: "May 12" },
                  { name: "Memorandum of Agreement", status: "submitted", date: "May 15" },
                  { name: "Medical Certificate", status: "pending", date: "Required before start" },
                  { name: "Parents' Consent", status: "pending", date: "Required before start" },
                ].map((doc, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "1rem", borderBottom: i === 4 ? "none" : "1px solid #f1f5f9"
                  }}>
                    <div>
                      <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#0f172a" }}>{doc.name}</div>
                      <div style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: "0.2rem" }}>{doc.date}</div>
                    </div>
                    {doc.status === "submitted" ? (
                      <span style={{ background: "#dcfce7", color: "#166534", padding: "0.2rem 0.6rem", borderRadius: "0.35rem", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase" }}>Submitted</span>
                    ) : (
                      <span style={{ background: "#fef3c7", color: "#b45309", padding: "0.2rem 0.6rem", borderRadius: "0.35rem", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase" }}>Pending</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
