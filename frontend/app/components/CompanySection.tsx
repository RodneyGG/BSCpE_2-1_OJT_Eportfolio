const HIGHLIGHTS = [
  { icon: "📅", label: "Start Date",   value: "January 2025"            },
  { icon: "🏁", label: "End Date",     value: "June 2025"               },
  { icon: "⏱️", label: "Duration",    value: "600 Hours"               },
  { icon: "💼", label: "Role",         value: "IT / Engineering Intern" },
  { icon: "📍", label: "Location",     value: "Philippines"             },
  { icon: "👥", label: "Department",   value: "Information Technology"  },
];

const TASKS = [
  "Hardware and software troubleshooting",
  "Network configuration and monitoring",
  "Technical documentation and reporting",
  "Assisting engineers in project deployment",
  "System maintenance and quality checks",
  "Team collaboration in Agile environment",
];

export default function CompanySection() {
  return (
    <section
      id="company"
      className="section"
      style={{ backgroundColor: "var(--color-surface)" }}
    >
      <div className="section-inner">
        {/* Header */}
        <div style={{ marginBottom: "3rem" }}>
          <span className="section-label">OJT Company</span>
          <h2 className="section-title">Where I Trained</h2>
          <div className="divider" />
          <p className="section-subtitle">
            My on-the-job training experience at a professional organization,
            where I applied my academic knowledge in a real-world setting.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "2rem",
          }}
        >
          {/* Company Card */}
          <div
            className="card"
            style={{
              padding: "2.5rem",
              background:
                "linear-gradient(160deg, #f0f9ff 0%, white 100%)",
              borderTop: "4px solid var(--color-primary)",
            }}
          >
            {/* Logo placeholder */}
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "var(--radius-lg)",
                background:
                  "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.8rem",
                marginBottom: "1.5rem",
                boxShadow: "0 8px 24px rgba(14,165,233,0.25)",
              }}
            >
              🏢
            </div>

            <h3
              style={{
                fontSize: "1.35rem",
                fontWeight: 700,
                color: "var(--color-text-primary)",
                marginBottom: "0.4rem",
                letterSpacing: "-0.01em",
              }}
            >
              Company Name Here
            </h3>
            <p
              style={{
                fontSize: "0.88rem",
                color: "var(--color-text-muted)",
                marginBottom: "1.25rem",
                fontWeight: 500,
              }}
            >
              Technology / Engineering Sector
            </p>

            <p
              style={{
                fontSize: "0.92rem",
                color: "var(--color-text-secondary)",
                lineHeight: 1.75,
                marginBottom: "1.5rem",
              }}
            >
              A brief description of the company — what they do, their industry,
              their mission, and why it was a great OJT experience. You can update
              this with your actual company&apos;s description.
            </p>

            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                flexWrap: "wrap",
              }}
            >
              <span className="badge badge-primary">IT Industry</span>
              <span className="badge badge-teal">Engineering</span>
              <span className="badge badge-slate">Philippines</span>
            </div>
          </div>

          {/* Details Grid */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Highlights */}
            <div className="card" style={{ padding: "2rem" }}>
              <h3
                style={{
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  marginBottom: "1.25rem",
                }}
              >
                Training Details
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.75rem",
                }}
              >
                {HIGHLIGHTS.map((item) => (
                  <div
                    key={item.label}
                    style={{
                      padding: "0.7rem",
                      background: "#f8fafc",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.68rem",
                        fontWeight: 600,
                        color: "var(--color-text-muted)",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        marginBottom: "0.2rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.3rem",
                      }}
                    >
                      <span>{item.icon}</span>
                      {item.label}
                    </div>
                    <div
                      style={{
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tasks Performed */}
            <div className="card" style={{ padding: "2rem" }}>
              <h3
                style={{
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  marginBottom: "1rem",
                }}
              >
                Key Tasks Performed
              </h3>
              <ul
                style={{
                  listStyle: "none",
                  margin: 0,
                  padding: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.6rem",
                }}
              >
                {TASKS.map((task) => (
                  <li
                    key={task}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "0.6rem",
                      fontSize: "0.88rem",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    <span
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        background: "#e0f2fe",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        marginTop: 1,
                      }}
                    >
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--color-primary)"
                        strokeWidth={3}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                    {task}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
