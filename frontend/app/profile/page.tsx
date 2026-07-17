"use client";

import { useState } from "react";
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

function IconUpload() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
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

/* ═══════════════════════════ Page ════════════════════════════ */
export default function ProfilePage() {
  // Mock Data States
  const [documents, setDocuments] = useState([
    { id: 1, name: "Resume / CV", status: "submitted", date: "May 10" },
    { id: 2, name: "Endorsement Letter", status: "submitted", date: "May 12" },
    { id: 3, name: "Memorandum of Agreement", status: "submitted", date: "May 15" },
    { id: 4, name: "Medical Certificate", status: "pending", date: "Required before start" },
    { id: 5, name: "Parents' Consent", status: "pending", date: "Required before start" },
  ]);

  const [dtrEntries, setDtrEntries] = useState([
    { id: 1, date: "May 16, 2026", timeIn: "08:00 AM", timeOut: "05:00 PM", status: "present", task: "Onboarding and Setup", hours: 8 },
    { id: 2, date: "May 17, 2026", timeIn: "08:30 AM", timeOut: "05:30 PM", status: "present", task: "Database Schema Design", hours: 8 },
    { id: 3, date: "May 18, 2026", timeIn: "-", timeOut: "-", status: "absent", task: "Sick Leave", hours: 0 },
  ]);

  // Upload Simulation
  const handleUpload = (id: number) => {
    // Simulate an upload delay
    setDocuments(docs => docs.map(d => d.id === id ? { ...d, status: "uploading" } : d));
    setTimeout(() => {
      setDocuments(docs => docs.map(d => 
        d.id === id ? { ...d, status: "submitted", date: "Just now" } : d
      ));
    }, 1500);
  };

  // Add DTR Simulation
  const [showDtrForm, setShowDtrForm] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newTimeIn, setNewTimeIn] = useState("");
  const [newTimeOut, setNewTimeOut] = useState("");
  const [isAbsent, setIsAbsent] = useState(false);
  const [newTask, setNewTask] = useState("");

  const calculateHours = (inTime: string, outTime: string) => {
    if (!inTime || !outTime) return 0;
    // Basic hours calculation (assuming HH:MM format 24h)
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
      hours: hours
    };
    setDtrEntries([newEntry, ...dtrEntries]);
    setNewTask("");
    setNewTimeIn("");
    setNewTimeOut("");
    setIsAbsent(false);
    setShowDtrForm(false);
  };

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
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0,0,0,0.08);
        }
        .back-link:hover { opacity: 0.8; }
        .upload-btn {
          background: #f1f5f9; color: #475569; padding: 0.35rem 0.75rem;
          border-radius: 0.5rem; font-size: 0.7rem; font-weight: 600;
          display: flex; gap: 0.35rem; align-items: center; border: 1px dashed #cbd5e1;
          cursor: pointer; transition: all 0.2s; position: relative; overflow: hidden;
        }
        .upload-btn:hover { border-color: #3b82f6; color: #3b82f6; background: #eff6ff; }
        .upload-btn input[type="file"] {
          position: absolute; top: 0; left: 0; width: "100%"; height: "100%";
          opacity: 0; cursor: pointer;
        }
        .dtr-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; text-align: left; }
        .dtr-table th { background: #f8fafc; padding: 0.75rem 1rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #e2e8f0; }
        .dtr-table td { padding: 0.85rem 1rem; color: #0f172a; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
        .dtr-table tr:hover td { background: #f8fafc; }
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

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem" }}>
          
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
                    <span style={{ fontSize: "2rem", fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>
                      {dtrEntries.reduce((sum, entry) => sum + entry.hours, 118)}
                    </span>
                    <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 600, marginLeft: "0.3rem" }}>/ 300 hrs</span>
                  </div>
                  <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#3b82f6" }}>
                    {Math.round((dtrEntries.reduce((sum, entry) => sum + entry.hours, 118) / 300) * 100)}%
                  </span>
                </div>
                {/* Progress Bar */}
                <div style={{ width: "100%", height: 8, background: "#e2e8f0", borderRadius: 9999, overflow: "hidden" }}>
                  <div style={{ width: `${(dtrEntries.reduce((sum, entry) => sum + entry.hours, 118) / 300) * 100}%`, height: "100%", background: "linear-gradient(90deg, #3b82f6, #6366f1)", borderRadius: 9999, transition: "width 0.5s ease" }} />
                </div>
                <p style={{ fontSize: "0.75rem", color: "#94a3b8", margin: "1rem 0 0", textAlign: "center" }}>Keep up the good work! {300 - dtrEntries.reduce((sum, entry) => sum + entry.hours, 118)} hours remaining.</p>
              </div>
            </div>
          </div>

          {/* ── Right Column ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            
            {/* Documents */}
            <div style={{ animation: "fadeSlideUp 0.6s ease 0.3s both" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", marginBottom: "1rem" }}>Required Documents</h2>
              <div style={{ background: "white", borderRadius: "1rem", padding: "0.5rem", boxShadow: "0 2px 4px rgba(0,0,0,0.04)" }}>
                {documents.map((doc, i) => (
                  <div key={doc.id} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "1rem", borderBottom: i === documents.length - 1 ? "none" : "1px solid #f1f5f9"
                  }}>
                    <div>
                      <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#0f172a" }}>{doc.name}</div>
                      <div style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: "0.2rem" }}>{doc.date}</div>
                    </div>
                    {doc.status === "submitted" && (
                      <span style={{ background: "#dcfce7", color: "#166534", padding: "0.2rem 0.6rem", borderRadius: "0.35rem", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase" }}>Submitted</span>
                    )}
                    {doc.status === "uploading" && (
                      <span style={{ color: "#3b82f6", fontSize: "0.7rem", fontWeight: 600, animation: "pulse 1s infinite" }}>Uploading...</span>
                    )}
                    {doc.status === "pending" && (
                      <label className="upload-btn">
                        <IconUpload /> Upload
                        <input type="file" onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleUpload(doc.id);
                          }
                        }} />
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* DTR (Daily Time Record) */}
            <div style={{ animation: "fadeSlideUp 0.6s ease 0.4s both" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>Daily Time Record</h2>
                <button 
                  onClick={() => setShowDtrForm(!showDtrForm)}
                  style={{ background: "#3b82f6", color: "white", border: "none", borderRadius: "0.5rem", padding: "0.4rem 0.8rem", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem", transition: "background 0.2s" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#2563eb"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "#3b82f6"}
                >
                  <IconPlus /> Add Log
                </button>
              </div>

              <div style={{ background: "white", borderRadius: "1rem", padding: "1.5rem", boxShadow: "0 2px 4px rgba(0,0,0,0.04)" }}>
                
                {/* DTR Entry Form */}
                {showDtrForm && (
                  <form onSubmit={handleAddDtr} style={{ background: "#f8fafc", padding: "1.25rem", borderRadius: "0.75rem", marginBottom: "1.5rem", border: "1px dashed #cbd5e1", animation: "fadeSlideUp 0.3s ease" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 700, color: "#475569", marginBottom: "0.25rem", textTransform: "uppercase" }}>Date</label>
                        <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} style={{ width: "100%", padding: "0.5rem", borderRadius: "0.35rem", border: "1px solid #cbd5e1", fontSize: "0.8rem", outline: "none" }} required />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 700, color: "#475569", marginBottom: "0.25rem", textTransform: "uppercase" }}>Time In</label>
                        <input type="time" value={newTimeIn} onChange={(e) => setNewTimeIn(e.target.value)} disabled={isAbsent} style={{ width: "100%", padding: "0.5rem", borderRadius: "0.35rem", border: "1px solid #cbd5e1", fontSize: "0.8rem", outline: "none", background: isAbsent ? "#e2e8f0" : "white" }} required={!isAbsent} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 700, color: "#475569", marginBottom: "0.25rem", textTransform: "uppercase" }}>Time Out</label>
                        <input type="time" value={newTimeOut} onChange={(e) => setNewTimeOut(e.target.value)} disabled={isAbsent} style={{ width: "100%", padding: "0.5rem", borderRadius: "0.35rem", border: "1px solid #cbd5e1", fontSize: "0.8rem", outline: "none", background: isAbsent ? "#e2e8f0" : "white" }} required={!isAbsent} />
                      </div>
                    </div>
                    
                    <div style={{ display: "flex", gap: "1rem", alignItems: "flex-end", marginBottom: "0.75rem" }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 700, color: "#475569", marginBottom: "0.25rem", textTransform: "uppercase" }}>Task / Activity</label>
                        <input type="text" value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder={isAbsent ? "Reason for absence..." : "What did you do today?"} style={{ width: "100%", padding: "0.5rem", borderRadius: "0.35rem", border: "1px solid #cbd5e1", fontSize: "0.8rem", outline: "none" }} required />
                      </div>
                      <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", fontWeight: 600, color: "#475569", paddingBottom: "0.5rem", cursor: "pointer" }}>
                        <input type="checkbox" checked={isAbsent} onChange={(e) => setIsAbsent(e.target.checked)} style={{ transform: "scale(1.2)" }} />
                        Mark as Absent
                      </label>
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1rem" }}>
                      <button type="button" onClick={() => setShowDtrForm(false)} style={{ background: "transparent", color: "#64748b", border: "none", padding: "0.4rem 0.8rem", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                      <button type="submit" style={{ background: "#0f172a", color: "white", border: "none", borderRadius: "0.35rem", padding: "0.4rem 1rem", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>Save Entry</button>
                    </div>
                  </form>
                )}

                {/* DTR Excel-style Table */}
                <div style={{ overflowX: "auto", border: "1px solid #e2e8f0", borderRadius: "0.5rem" }}>
                  <table className="dtr-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Time In</th>
                        <th>Time Out</th>
                        <th>Status</th>
                        <th>Task / Activity</th>
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
                              fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", padding: "0.2rem 0.6rem", borderRadius: "9999px",
                              color: entry.status === "present" ? "#166534" : "#b45309",
                              background: entry.status === "present" ? "#dcfce7" : "#fef3c7" 
                            }}>
                              {entry.status}
                            </span>
                          </td>
                          <td style={{ color: "#475569", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {entry.task}
                          </td>
                          <td style={{ textAlign: "right", fontWeight: 700, color: "#0f172a" }}>{entry.hours}</td>
                        </tr>
                      ))}
                      {dtrEntries.length === 0 && (
                        <tr>
                          <td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>No DTR records found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
            </div>

          </div>
          
        </div>
      </main>
    </div>
  );
}
