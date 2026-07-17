"use client";

import Link from "next/link";
import { useRole } from "../../context/RoleContext";
import { MOCK_COMPANIES } from "../../data/companies";
import Image from "next/image";

interface Props {
  params: { id: string };
}

export default function StudentDetailPage({ params }: Props) {
  const { role } = useRole();
  const canAccess = role === "prof" || role === "admin";

  // Find the student from mock data
  const student = MOCK_COMPANIES.flatMap((c) => c.students).find(
    (s) => s.id === params.id
  );

  // ── Access Denied ──
  if (!canAccess) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--color-bg)",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>🔒</div>
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "var(--color-text-primary)",
            marginBottom: "0.5rem",
          }}
        >
          Access Restricted
        </h1>
        <p
          style={{
            color: "var(--color-text-secondary)",
            fontSize: "0.95rem",
            maxWidth: 380,
            lineHeight: 1.7,
            marginBottom: "1.5rem",
          }}
        >
          Only <strong>Professors</strong> and <strong>Admins</strong> can view student
          documents. Please log in with the appropriate role.
        </p>
        <Link href="/companies" className="btn-primary">
          ← Back to Companies
        </Link>
      </div>
    );
  }

  // ── Student Not Found ──
  if (!student) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--color-bg)",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>🔍</div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          Student Not Found
        </h1>
        <Link href="/companies" className="btn-secondary" style={{ marginTop: "1rem" }}>
          ← Back to Companies
        </Link>
      </div>
    );
  }

  // ── Authorized View ──
  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", padding: "0 0 4rem" }}>
      {/* Header */}
      <header
        style={{
          background: "var(--color-surface)",
          borderBottom: "1px solid var(--color-border)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            padding: "0 1.5rem",
            height: 64,
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <Link
            href="/companies"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              fontSize: "0.85rem",
              color: "var(--color-text-secondary)",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Companies
          </Link>
          <span style={{ color: "var(--color-border)" }}>/</span>
          <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text-primary)" }}>
            {student.name}
          </span>
          <span
            style={{
              marginLeft: "auto",
              padding: "0.25rem 0.65rem",
              borderRadius: "var(--radius-full)",
              background: role === "admin" ? "#e0f2fe" : "#ccfbf1",
              color: role === "admin" ? "#0284c7" : "#0f766e",
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            {role}
          </span>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        {/* Student profile card */}
        <div
          className="card"
          style={{
            padding: "2rem",
            display: "flex",
            alignItems: "center",
            gap: "1.5rem",
            flexWrap: "wrap",
            marginBottom: "2rem",
          }}
        >
          <div
            style={{
              position: "relative",
              width: 80,
              height: 80,
              borderRadius: "50%",
              overflow: "hidden",
              border: "3px solid var(--color-primary-light)",
              flexShrink: 0,
            }}
          >
            <Image
              src={student.photo}
              alt={student.name}
              fill
              sizes="80px"
              style={{ objectFit: "cover" }}
            />
          </div>
          <div>
            <h1
              style={{
                fontSize: "1.35rem",
                fontWeight: 700,
                color: "var(--color-text-primary)",
                marginBottom: "0.2rem",
              }}
            >
              {student.name}
            </h1>
            <p style={{ fontSize: "0.88rem", color: "var(--color-text-muted)", margin: 0 }}>
              {student.course}
            </p>
          </div>
        </div>

        {/* Documents placeholder */}
        <div
          style={{
            background: "var(--color-surface)",
            border: "2px dashed var(--color-border)",
            borderRadius: "var(--radius-xl)",
            padding: "3rem 2rem",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📂</div>
          <h2
            style={{
              fontSize: "1.1rem",
              fontWeight: 700,
              color: "var(--color-text-primary)",
              marginBottom: "0.5rem",
            }}
          >
            Documents Coming Soon
          </h2>
          <p
            style={{
              fontSize: "0.88rem",
              color: "var(--color-text-secondary)",
              maxWidth: 400,
              margin: "0 auto",
              lineHeight: 1.7,
            }}
          >
            Student OJT documents (endorsement letter, DTR, evaluation forms, certificates)
            will be viewable here in a future update once document upload is implemented.
          </p>
        </div>
      </main>
    </div>
  );
}
