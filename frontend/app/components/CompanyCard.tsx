"use client";

import { useState } from "react";
import StudentRow from "./StudentRow";
import type { Company } from "../data/companies";

interface CompanyCardProps {
  company: Company;
}

export default function CompanyCard({ company }: CompanyCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      id={`company-card-${company.id}`}
      style={{
        background: "var(--color-surface)",
        border: "1px solid",
        borderColor: open ? "var(--color-primary-light)" : "var(--color-border)",
        borderRadius: "var(--radius-xl)",
        overflow: "hidden",
        boxShadow: open ? "var(--shadow-lg)" : "var(--shadow-md)",
        transition: "all var(--transition-slow)",
      }}
    >
      {/* ── Card Header ── */}
      <div style={{ padding: "1.5rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          {/* Company icon */}
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "var(--radius-lg)",
              background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.4rem",
              flexShrink: 0,
              boxShadow: "0 4px 12px rgba(14,165,233,0.2)",
            }}
          >
            🏢
          </div>

          {/* Name + sector + badges */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                flexWrap: "wrap",
                marginBottom: "0.3rem",
              }}
            >
              <h2
                style={{
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  margin: 0,
                  letterSpacing: "-0.01em",
                }}
              >
                {company.name}
              </h2>
              <span className="badge badge-primary" style={{ fontSize: "0.7rem" }}>
                {company.sector}
              </span>
            </div>

            {/* Address */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.35rem",
                fontSize: "0.82rem",
                color: "var(--color-text-secondary)",
                marginBottom: "0.4rem",
              }}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ flexShrink: 0, marginTop: 2 }}
              >
                <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>{company.address}</span>
            </div>

            {/* Phone */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
                fontSize: "0.82rem",
                color: "var(--color-text-secondary)",
              }}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ flexShrink: 0 }}
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.11 13 19.79 19.79 0 0 1 1.1 4.42 2 2 0 0 1 3.08 2.24h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 16.92z" />
              </svg>
              <span>{company.phone}</span>
            </div>
          </div>

          {/* Right side: student count + MOA */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "0.6rem",
              flexShrink: 0,
            }}
          >
            {/* Student count */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                background: "#f0f9ff",
                border: "1px solid #bae6fd",
                borderRadius: "var(--radius-full)",
                padding: "0.3rem 0.75rem",
                fontSize: "0.8rem",
                fontWeight: 700,
                color: "var(--color-primary-dark)",
              }}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              {company.students.length} student{company.students.length !== 1 ? "s" : ""}
            </div>

            {/* MOA Button */}
            <button
              id={`moa-btn-${company.id}`}
              disabled
              title="MOA document upload coming in a future update"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.35rem 0.85rem",
                borderRadius: "var(--radius-full)",
                border: "1.5px solid var(--color-border)",
                background: "transparent",
                color: "var(--color-text-muted)",
                fontSize: "0.78rem",
                fontWeight: 600,
                cursor: "not-allowed",
                opacity: 0.7,
              }}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              {company.hasMOA ? "View MOA" : "No MOA yet"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Divider ── */}
      <div style={{ borderTop: "1px solid var(--color-border)", margin: "0 1.5rem" }} />

      {/* ── Accordion Toggle ── */}
      <button
        id={`company-dropdown-toggle-${company.id}`}
        aria-expanded={open}
        aria-controls={`company-students-${company.id}`}
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "0.85rem 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "0.83rem",
          fontWeight: 600,
          color: open ? "var(--color-primary-dark)" : "var(--color-text-secondary)",
          transition: "color var(--transition-base)",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
          </svg>
          View Students ({company.students.length})
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform var(--transition-base)",
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* ── Student Dropdown ── */}
      {open && (
        <div
          id={`company-students-${company.id}`}
          style={{
            padding: "0 1rem 1rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.15rem",
            borderTop: "1px solid var(--color-border)",
            marginTop: 0,
          }}
        >
          {company.students.length === 0 ? (
            <p
              style={{
                textAlign: "center",
                color: "var(--color-text-muted)",
                fontSize: "0.85rem",
                padding: "1.5rem 0",
              }}
            >
              No students assigned yet.
            </p>
          ) : (
            company.students.map((student) => (
              <StudentRow key={student.id} student={student} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
