"use client";

import { useRole, type Role } from "../context/RoleContext";

const ROLES: { value: Role; label: string; color: string; bg: string }[] = [
  { value: "normal", label: "Normal User", color: "#475569", bg: "#f1f5f9" },
  { value: "prof",   label: "Professor",   color: "#0f766e", bg: "#ccfbf1" },
  { value: "admin",  label: "Admin",       color: "#0284c7", bg: "#e0f2fe" },
];

export default function RoleToggle() {
  const { role, setRole } = useRole();

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5rem",
        background: "white",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-full)",
        padding: "0.3rem 0.4rem 0.3rem 0.85rem",
        boxShadow: "var(--shadow-sm)",
        fontSize: "0.8rem",
      }}
    >
      <span
        style={{
          fontWeight: 600,
          color: "var(--color-text-muted)",
          letterSpacing: "0.04em",
          fontSize: "0.72rem",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        }}
      >
        View as:
      </span>
      <div style={{ display: "flex", gap: "0.25rem" }}>
        {ROLES.map((r) => {
          const isActive = role === r.value;
          return (
            <button
              key={r.value}
              id={`role-toggle-${r.value}`}
              onClick={() => setRole(r.value)}
              title={`Switch to ${r.label} view`}
              style={{
                padding: "0.3rem 0.7rem",
                borderRadius: "var(--radius-full)",
                border: "none",
                cursor: "pointer",
                fontSize: "0.78rem",
                fontWeight: isActive ? 700 : 500,
                background: isActive ? r.bg : "transparent",
                color: isActive ? r.color : "var(--color-text-muted)",
                transition: "all var(--transition-base)",
              }}
            >
              {r.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
