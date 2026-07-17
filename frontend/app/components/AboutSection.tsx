import Image from "next/image";

const INFO_ITEMS = [
  { icon: "🎓", label: "Course",    value: "BS Computer Engineering"          },
  { icon: "📅", label: "Year",      value: "2nd Year — 1st Semester"          },
  { icon: "🏫", label: "School",    value: "Your University / College Name"   },
  { icon: "📍", label: "Location",  value: "Philippines"                      },
];

export default function AboutSection() {
  return (
    <section
      id="about"
      className="section"
      style={{ backgroundColor: "var(--color-surface)" }}
    >
      <div className="section-inner">
        {/* Two-column layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "3.5rem",
            alignItems: "center",
          }}
        >
          {/* Left — photo */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                position: "relative",
                width: "clamp(220px, 35vw, 300px)",
                height: "clamp(220px, 35vw, 300px)",
                flexShrink: 0,
              }}
            >
              {/* Decorative ring */}
              <div
                style={{
                  position: "absolute",
                  inset: -12,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)",
                  opacity: 0.15,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: -6,
                  borderRadius: "50%",
                  border: "2.5px dashed var(--color-primary)",
                  opacity: 0.3,
                  animation: "spin 18s linear infinite",
                }}
              />
              {/* Photo */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: "4px solid white",
                  boxShadow: "var(--shadow-xl)",
                }}
              >
                <Image
                  src="/profile-placeholder.jpg"
                  alt="Student profile photo"
                  fill
                  sizes="(max-width: 768px) 220px, 300px"
                  style={{ objectFit: "cover" }}
                  priority
                />
              </div>

              {/* Floating badge */}
              <div
                style={{
                  position: "absolute",
                  bottom: 8,
                  right: -16,
                  background: "white",
                  borderRadius: "var(--radius-lg)",
                  padding: "0.5rem 0.85rem",
                  boxShadow: "var(--shadow-lg)",
                  border: "1px solid var(--color-border)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                  whiteSpace: "nowrap",
                }}
              >
                <span style={{ fontSize: "1rem" }}>💼</span>
                OJT Trainee
              </div>
            </div>
          </div>

          {/* Right — bio */}
          <div>
            <span className="section-label">About Me</span>
            <h2 className="section-title">
              Get to Know{" "}
              <span
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Who I Am
              </span>
            </h2>
            <div className="divider" />

            <p
              style={{
                color: "var(--color-text-secondary)",
                lineHeight: 1.8,
                marginBottom: "1.25rem",
                fontSize: "0.97rem",
              }}
            >
              I am a passionate 2nd-year Bachelor of Science in Computer Engineering student
              currently undergoing on-the-job training. This portfolio documents my growth,
              experiences, and accomplishments throughout my OJT journey.
            </p>
            <p
              style={{
                color: "var(--color-text-secondary)",
                lineHeight: 1.8,
                marginBottom: "2rem",
                fontSize: "0.97rem",
              }}
            >
              I am eager to learn, adapt, and contribute meaningful work in a real-world
              professional environment while applying knowledge gained from my academic studies.
            </p>

            {/* Info chips */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.75rem",
              }}
            >
              {INFO_ITEMS.map((item) => (
                <div
                  key={item.label}
                  style={{
                    background: "#f8fafc",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-lg)",
                    padding: "0.75rem 1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                  }}
                >
                  <span style={{ fontSize: "1.1rem" }}>{item.icon}</span>
                  <div>
                    <div
                      style={{
                        fontSize: "0.68rem",
                        fontWeight: 600,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "var(--color-text-muted)",
                        lineHeight: 1,
                      }}
                    >
                      {item.label}
                    </div>
                    <div
                      style={{
                        fontSize: "0.83rem",
                        fontWeight: 600,
                        color: "var(--color-text-primary)",
                        marginTop: "0.15rem",
                      }}
                    >
                      {item.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
}
