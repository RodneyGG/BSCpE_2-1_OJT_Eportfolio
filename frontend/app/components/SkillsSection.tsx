"use client";

const TECHNICAL_SKILLS = [
  { name: "C / C++",          level: 75, color: "#0ea5e9" },
  { name: "Python",           level: 70, color: "#0d9488" },
  { name: "JavaScript",       level: 65, color: "#06b6d4" },
  { name: "HTML & CSS",       level: 80, color: "#0ea5e9" },
  { name: "Arduino / IoT",    level: 72, color: "#0d9488" },
  { name: "PCB Design",       level: 60, color: "#06b6d4" },
  { name: "Circuit Analysis", level: 78, color: "#0ea5e9" },
  { name: "MS Office Suite",  level: 85, color: "#0d9488" },
];

const SOFT_SKILLS = [
  { name: "Communication",    emoji: "💬" },
  { name: "Teamwork",         emoji: "🤝" },
  { name: "Problem Solving",  emoji: "🧩" },
  { name: "Time Management",  emoji: "⏱️" },
  { name: "Adaptability",     emoji: "🔄" },
  { name: "Critical Thinking",emoji: "🧠" },
  { name: "Attention to Detail",emoji: "🔍" },
  { name: "Initiative",       emoji: "🚀" },
];

const TOOLS = [
  "VS Code", "Git & GitHub", "Docker",
  "Linux Terminal", "Figma", "Canva",
  "Microsoft Visio", "Cisco Packet Tracer",
];

export default function SkillsSection() {
  return (
    <section
      id="skills"
      className="section"
      style={{
        background: "linear-gradient(160deg, #f0f9ff 0%, #f8fafc 60%, #f0fdfa 100%)",
      }}
    >
      <div className="section-inner">
        {/* Header */}
        <div style={{ marginBottom: "3rem" }}>
          <span className="section-label">Skills</span>
          <h2 className="section-title">My Technical Toolkit</h2>
          <div className="divider" />
          <p className="section-subtitle">
            A blend of technical know-how and professional soft skills built through
            academic training and real-world OJT experience.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "2rem",
          }}
        >
          {/* Technical Skills — Progress Bars */}
          <div className="card" style={{ padding: "2rem" }}>
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                color: "var(--color-text-primary)",
                marginBottom: "1.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <span
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background: "#e0f2fe",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.85rem",
                }}
              >
                ⚡
              </span>
              Technical Skills
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
              {TECHNICAL_SKILLS.map((skill) => (
                <div key={skill.name}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "0.35rem",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {skill.name}
                    </span>
                    <span
                      style={{
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        color: "var(--color-text-muted)",
                      }}
                    >
                      {skill.level}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: 7,
                      background: "#e2e8f0",
                      borderRadius: 9999,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${skill.level}%`,
                        borderRadius: 9999,
                        background: `linear-gradient(90deg, ${skill.color} 0%, ${skill.color}cc 100%)`,
                        transition: "width 1s cubic-bezier(0.4,0,0.2,1)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column — Soft Skills + Tools */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {/* Soft Skills */}
            <div className="card" style={{ padding: "2rem" }}>
              <h3
                style={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  marginBottom: "1.25rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    background: "#ccfbf1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.85rem",
                  }}
                >
                  🌟
                </span>
                Soft Skills
              </h3>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.6rem",
                }}
              >
                {SOFT_SKILLS.map((skill) => (
                  <span
                    key={skill.name}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      padding: "0.4rem 0.85rem",
                      borderRadius: "var(--radius-full)",
                      background: "#f1f5f9",
                      border: "1px solid var(--color-border)",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      color: "var(--color-text-secondary)",
                      transition: "all var(--transition-base)",
                      cursor: "default",
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.background = "#e0f2fe";
                      el.style.color = "var(--color-primary-dark)";
                      el.style.borderColor = "var(--color-primary-light)";
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.background = "#f1f5f9";
                      el.style.color = "var(--color-text-secondary)";
                      el.style.borderColor = "var(--color-border)";
                    }}
                  >
                    <span>{skill.emoji}</span>
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Tools */}
            <div className="card" style={{ padding: "2rem" }}>
              <h3
                style={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  marginBottom: "1.25rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    background: "#e0f2fe",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.85rem",
                  }}
                >
                  🔧
                </span>
                Tools & Software
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
                {TOOLS.map((tool) => (
                  <span
                    key={tool}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "0.35rem 0.8rem",
                      borderRadius: "var(--radius-full)",
                      background: "linear-gradient(135deg, #e0f2fe 0%, #ccfbf1 100%)",
                      border: "1px solid #bae6fd",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      color: "var(--color-primary-dark)",
                    }}
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
