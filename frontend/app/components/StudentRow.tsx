"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRole } from "../context/RoleContext";
import type { Student } from "../data/companies";

interface StudentRowProps {
  student: Student;
}

export default function StudentRow({ student }: StudentRowProps) {
  const { role } = useRole();
  const router = useRouter();
  const canAccess = role === "prof" || role === "admin";

  const handleClick = () => {
    if (canAccess) {
      router.push(`/students/${student.id}`);
    }
  };

  return (
    <div
      id={`student-row-${student.id}`}
      onClick={handleClick}
      title={
        canAccess
          ? `View ${student.name}'s documents`
          : "Only professors and admins can view student documents"
      }
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.85rem",
        padding: "0.65rem 0.85rem",
        borderRadius: "var(--radius-lg)",
        cursor: canAccess ? "pointer" : "default",
        transition: "background var(--transition-base)",
        userSelect: "none",
      }}
      onMouseEnter={(e) => {
        if (canAccess) {
          (e.currentTarget as HTMLElement).style.background = "#f0f9ff";
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = "transparent";
      }}
    >
      {/* Avatar */}
      <div
        style={{
          position: "relative",
          width: 38,
          height: 38,
          borderRadius: "50%",
          overflow: "hidden",
          flexShrink: 0,
          border: "2px solid",
          borderColor: canAccess ? "var(--color-primary-light)" : "var(--color-border)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <Image
          src={student.photo}
          alt={student.name}
          fill
          sizes="38px"
          style={{ objectFit: "cover" }}
        />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: "0.88rem",
            fontWeight: 600,
            color: canAccess ? "var(--color-primary-dark)" : "var(--color-text-primary)",
            textDecoration: canAccess ? "underline" : "none",
            textDecorationStyle: "dotted",
            textUnderlineOffset: "3px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {student.name}
        </div>
        <div
          style={{
            fontSize: "0.73rem",
            color: "var(--color-text-muted)",
            marginTop: "0.1rem",
          }}
        >
          {student.course}
        </div>
      </div>

      {/* Access indicator */}
      {canAccess && (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ flexShrink: 0 }}
        >
          <path d="M7 17 17 7M7 7h10v10" />
        </svg>
      )}
    </div>
  );
}
