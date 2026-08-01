"use client";

import { useState } from "react";
import { useRole } from "../context/RoleContext";
import { useReveal } from "../hooks/useReveal";

interface Student { id: string; name: string; role: string; }
interface Company { id: number; name: string; location: string; studentCount: number; students: Student[]; }

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

function MoaPill() {
  const { isLoggedIn } = useRole();
  if (!isLoggedIn) return null;
  return (
    <span style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.06em",
      textTransform: "uppercase", padding: "0.22rem 0.6rem",
      borderRadius: "9999px", background: "#fef3c7", color: "#92400e",
      border: "1px solid #fde68a" }}>MOA</span>
  );
}

function StudentProfile({ student, index, onClick }: { student: Student; index: number; onClick?: (s: Student) => void }) {
  const initials = student.name.split(" ").map(w => w[0]).slice(0, 2).join("");
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={() => onClick && onClick(student)}
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
        width: 60, height: 60, borderRadius: "50%",
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

export default function HeroCompanyRow({
  company,
  isOpen,
  onToggle,
  index,
  onDelete,
  onStudentClick
}: {
  company: Company;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
  onDelete: (id: number) => void;
  onStudentClick?: (student: Student) => void;
}) {
  const { role } = useRole();
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
        background: "white",
        transitionProperty: "box-shadow, border-color, transform, opacity",
        transitionDuration: "0.25s, 0.25s, 0.25s, 0.5s",
        transitionTimingFunction: "ease",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Header */}
      <div
        role="button"
        tabIndex={0}
        id={`company-accordion-${company.id}`}
        aria-expanded={isOpen}
        onClick={onToggle}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggle(); } }}
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
          {role === 'admin' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm('Are you sure you want to delete this company?')) {
                  onDelete(company.id);
                }
              }}
              style={{
                background: "#fee2e2",
                color: "#ef4444",
                border: "none",
                padding: "0.3rem 0.6rem",
                borderRadius: "999px",
                fontSize: "0.65rem",
                fontWeight: 700,
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#fecaca"}
              onMouseLeave={(e) => e.currentTarget.style.background = "#fee2e2"}
            >
              DELETE
            </button>
          )}
          <MoaPill />
          <span style={{ color: isOpen ? "#1d4ed8" : "#94a3b8", transition: "color 0.2s" }}>
            <IconChevron open={isOpen} />
          </span>
        </div>
      </div>

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
                <StudentProfile key={s.id} student={s} index={i} onClick={onStudentClick} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
