import Link from "next/link";
import CompanyCard from "../components/CompanyCard";
import RoleToggle from "../components/RoleToggle";
import { MOCK_COMPANIES } from "../data/companies";

export const metadata = {
  title: "Companies | OJT Tracker BSCpE 2-1",
  description: "List of all OJT companies and the students assigned to them.",
};

export default function CompaniesPage() {
  const totalStudents = MOCK_COMPANIES.reduce(
    (sum, c) => sum + c.students.length,
    0
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)" }}>
      {/* ── Top Bar ── */}
      <header
        style={{
          background: "var(--color-surface)",
          borderBottom: "1px solid var(--color-border)",
          position: "sticky",
          top: 0,
          zIndex: 40,
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "0 1.5rem",
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          {/* Logo / back link */}
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              textDecoration: "none",
              color: "var(--color-text-primary)",
            }}
          >
            <span
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: "0.7rem",
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              OJT
            </span>
            <span style={{ fontWeight: 700, fontSize: "0.95rem", letterSpacing: "-0.01em" }}>
              Companies
            </span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-text-muted)"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ transform: "rotate(180deg)" }}
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span style={{ fontSize: "0.82rem", color: "var(--color-text-muted)" }}>
              Back to Home
            </span>
          </Link>

          {/* Role Toggle */}
          <RoleToggle />
        </div>
      </header>

      {/* ── Page Body ── */}
      <main
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "2.5rem 1.5rem 4rem",
        }}
      >
        {/* Page heading */}
        <div style={{ marginBottom: "2rem" }}>
          <span className="section-label">OJT Tracker</span>
          <h1 className="section-title" style={{ marginTop: "0.25rem" }}>
            Partner Companies
          </h1>
          <div className="divider" />
          <p className="section-subtitle">
            All companies currently hosting BSCpE 2-1 students for on-the-job training.
            Click a company to see the students assigned there.
          </p>
        </div>

        {/* Summary stats */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
            marginBottom: "2rem",
          }}
        >
          {[
            { icon: "🏢", value: MOCK_COMPANIES.length, label: "Companies" },
            { icon: "👥", value: totalStudents,          label: "Students"  },
            {
              icon: "📋",
              value: MOCK_COMPANIES.filter((c) => c.hasMOA).length,
              label: "MOAs Signed",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-xl)",
                padding: "1rem 1.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                boxShadow: "var(--shadow-sm)",
                minWidth: 140,
              }}
            >
              <span style={{ fontSize: "1.4rem" }}>{stat.icon}</span>
              <div>
                <div
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                    lineHeight: 1,
                    background:
                      "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 500,
                    color: "var(--color-text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginTop: "0.15rem",
                  }}
                >
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Role notice */}
        <div
          id="role-access-notice"
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "0.6rem",
            background: "#f0f9ff",
            border: "1px solid #bae6fd",
            borderRadius: "var(--radius-lg)",
            padding: "0.85rem 1rem",
            marginBottom: "1.75rem",
            fontSize: "0.83rem",
            color: "var(--color-text-secondary)",
            lineHeight: 1.5,
          }}
        >
          <span style={{ fontSize: "1rem", flexShrink: 0 }}>ℹ️</span>
          <span>
            <strong style={{ color: "var(--color-text-primary)" }}>Access notice:</strong>{" "}
            Normal users can view company info and student names/photos.{" "}
            <strong>Professors and Admins</strong> can click on a student to view their
            OJT documents. Use the <em>&quot;View as&quot;</em> toggle to switch roles.
          </span>
        </div>

        {/* Companies list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {MOCK_COMPANIES.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>
      </main>
    </div>
  );
}
