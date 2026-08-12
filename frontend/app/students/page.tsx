"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "../context/RoleContext";
import { fetchApi } from "../../lib/api";
import dynamic from 'next/dynamic';
import AppNavbar from "../components/AppNavbar";
import ProtectedRoute from "../components/ProtectedRoute";

const StudentPreviewModal = dynamic(() => import("../components/StudentPreviewModal"), {
  ssr: false,
  loading: () => <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(15, 23, 42, 0.6)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", color: "white", backdropFilter: "blur(4px)" }}>Loading preview...</div>
});
const AdminStudentPanel = dynamic(() => import("../components/AdminStudentPanel"), {
  ssr: false,
  loading: () => <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(15, 23, 42, 0.6)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", color: "white", backdropFilter: "blur(4px)" }}>Loading panel...</div>
});

interface StudentCompany {
  id: number;
  name: string;
}

interface StudentListItem {
  id: number;
  name: string;
  company: StudentCompany | null;
  profile_picture?: string | null;
  hours_rendered: string | null;
  required_hours: number | null;
  // Staff-only fields (absent in the student-facing stripped response)
  email?: string;
  role?: string;
  is_active?: boolean;
  can_review?: boolean;
  approved_documents_count?: number;
  pending_documents_count?: number;
  rejected_documents_count?: number;
}

function getStatusBadge(student: StudentListItem) {
  const pending = student.pending_documents_count ?? 0;
  const rejected = student.rejected_documents_count ?? 0;
  if (pending > 0) return { label: "Pending review", color: "#ef4444" };
  if (rejected > 0) return { label: "Needs resubmission", color: "#f59e0b" };
  return { label: "All clear", color: "#22c55e" };
}

export default function StudentsPage() {
  const { role } = useRole();
  const isStaff = role === "admin" || role === "prof";

  const [students, setStudents] = useState<StudentListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentListItem | null>(null);

  useEffect(() => {
    // Backend returns a bare array. ?role=normal filters out staff accounts
    // so the roster only shows actual students (confirmed via curl — the
    // unfiltered endpoint returns admin/prof rows too).
    fetchApi("/students?role=normal")
      .then((data: StudentListItem[]) => setStudents(data))
      .catch(() => setError("Failed to load students."));
  }, []);

  return (
    <ProtectedRoute>
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "var(--font-geist-sans, system-ui, sans-serif)" }}>
      <style>{`
        .student-card {
          background: white; border-radius: 1.25rem; padding: 1.25rem; text-align: center;
          box-shadow: 0 4px 15px rgba(0,0,0,0.03); border: 1px solid #e2e8f0; cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease; position: relative;
        }
        .student-card:hover { transform: translateY(-3px); box-shadow: 0 10px 25px rgba(0,0,0,0.08); }
        @media (max-width: 640px) {
          .students-main { padding: 1.5rem 1rem !important; }
        }
      `}</style>

      <AppNavbar />

      <main className="students-main" style={{ maxWidth: 1400, margin: "0 auto", padding: "2.5rem 2rem" }}>
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.25rem 0", letterSpacing: "-0.02em" }}>
            Students
          </h1>
          <p style={{ color: "#64748b", margin: 0, fontWeight: 500 }}>
            {isStaff ? "Click a student to review their OJT progress and documents." : "Browse your batchmates."}
          </p>
        </div>

        {error ? (
          <div style={{ color: "#ef4444", padding: "2rem", textAlign: "center" }}>{error}</div>
        ) : students === null ? (
          <div style={{ color: "#94a3b8", padding: "2rem", textAlign: "center" }}>Loading...</div>
        ) : students.length === 0 ? (
          <div style={{ color: "#94a3b8", padding: "2rem", textAlign: "center" }}>No students found.</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "1.25rem" }}>
            {students.map((student) => {
              const badge = isStaff ? getStatusBadge(student) : null;
              return (
                <div key={student.id} className="student-card" onClick={() => setSelectedStudent(student)}>
                  {badge && (
                    <span
                      title={badge.label}
                      style={{
                        position: "absolute", top: "0.6rem", right: "0.6rem",
                        width: 10, height: 10, borderRadius: "50%", background: badge.color,
                        boxShadow: "0 0 0 2px white",
                      }}
                    />
                  )}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={student.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&size=100&background=0f172a&color=fff&bold=true`}
                    alt={student.name}
                    style={{ width: 72, height: 72, borderRadius: "50%", margin: "0 auto 0.75rem", display: "block", objectFit: "cover", objectPosition: "center" }}
                  />
                  <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.9rem" }}>{student.name}</div>
                  <div style={{ color: "#64748b", fontSize: "0.78rem", marginTop: "0.15rem" }}>
                    {student.company?.name ?? "No company yet"}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {selectedStudent && !isStaff && (
        <StudentPreviewModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />
      )}
      {selectedStudent && isStaff && (
        <AdminStudentPanel 
          student={selectedStudent} 
          onClose={() => setSelectedStudent(null)} 
          onStudentUpdated={(updates) => {
            setStudents(prev => prev ? prev.map(s => s.id === selectedStudent.id ? { ...s, ...updates } : s) : null);
            setSelectedStudent(prev => prev ? { ...prev, ...updates } : null);
          }}
        />
      )}
    </div>
    </ProtectedRoute>
  );
}