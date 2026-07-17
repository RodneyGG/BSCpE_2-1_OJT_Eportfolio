"use client";

import { useState } from "react";

interface JournalEntry {
  week: number;
  dates: string;
  title: string;
  summary: string;
  highlights: string[];
  mood: string;
}

const JOURNAL_ENTRIES: JournalEntry[] = [
  {
    week: 1,
    dates: "Jan 6 – Jan 10, 2025",
    title: "First Week Orientation",
    summary:
      "An exciting and nervous first week! I was introduced to the company, its culture, and the team I would be working with. Attended orientation sessions and company tours.",
    highlights: [
      "Company orientation and safety briefings",
      "Meet-and-greet with the IT department team",
      "Setup of workstation and access credentials",
      "Overview of company operations and OJT expectations",
    ],
    mood: "😊",
  },
  {
    week: 2,
    dates: "Jan 13 – Jan 17, 2025",
    title: "Diving into the Work",
    summary:
      "Started assisting the IT team with daily tasks. Learned about the company's internal systems and began hands-on technical work under supervision.",
    highlights: [
      "Assisted in hardware troubleshooting for office units",
      "Shadowed senior engineers during network checks",
      "Documented system maintenance procedures",
      "Attended team meetings and sprint planning",
    ],
    mood: "💪",
  },
  {
    week: 3,
    dates: "Jan 20 – Jan 24, 2025",
    title: "Growing Confidence",
    summary:
      "Took on more independent tasks and began contributing more meaningfully to the team. Improved communication skills through daily stand-ups.",
    highlights: [
      "Independently resolved 3 technical helpdesk tickets",
      "Created network topology documentation",
      "Participated in code review sessions",
      "Learned proper incident reporting procedures",
    ],
    mood: "🚀",
  },
  {
    week: 4,
    dates: "Jan 27 – Jan 31, 2025",
    title: "Project Involvement",
    summary:
      "Was assigned to support a larger infrastructure project. Collaborated with multiple departments and gained exposure to enterprise-level systems.",
    highlights: [
      "Assisted in server room inventory audit",
      "Contributed to internal IT knowledge base articles",
      "Helped configure network switches",
      "Observed enterprise backup procedures",
    ],
    mood: "🧩",
  },
  {
    week: 5,
    dates: "Feb 3 – Feb 7, 2025",
    title: "Mid-OJT Reflection",
    summary:
      "Reached the halfway point of my OJT. Reflected on my growth, identified areas for improvement, and set goals for the remaining weeks.",
    highlights: [
      "Mid-term evaluation meeting with supervisor",
      "Self-assessment of skills and progress",
      "Set learning goals for weeks 6–10",
      "Presented mini-report on tasks completed",
    ],
    mood: "🎯",
  },
];

export default function JournalSection() {
  const [openWeek, setOpenWeek] = useState<number | null>(1);

  return (
    <section
      id="journal"
      className="section"
      style={{
        background: "linear-gradient(160deg, #f0f9ff 0%, #f8fafc 60%, #f0fdfa 100%)",
      }}
    >
      <div className="section-inner">
        {/* Header */}
        <div style={{ marginBottom: "3rem" }}>
          <span className="section-label">Weekly Journal</span>
          <h2 className="section-title">My OJT Journey, Week by Week</h2>
          <div className="divider" />
          <p className="section-subtitle">
            A chronological log of my on-the-job training experience —
            tasks performed, lessons learned, and personal reflections.
          </p>
        </div>

        {/* Timeline */}
        <div style={{ position: "relative" }}>
          {/* Vertical timeline line */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              left: "1.75rem",
              top: 0,
              bottom: 0,
              width: 2,
              background:
                "linear-gradient(180deg, var(--color-primary) 0%, var(--color-secondary) 100%)",
              borderRadius: 9999,
              opacity: 0.2,
            }}
          />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              paddingLeft: "4rem",
            }}
          >
            {JOURNAL_ENTRIES.map((entry) => {
              const isOpen = openWeek === entry.week;
              return (
                <div key={entry.week} style={{ position: "relative" }}>
                  {/* Timeline dot */}
                  <div
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      left: "-3.15rem",
                      top: "1.25rem",
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: isOpen
                        ? "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)"
                        : "var(--color-surface)",
                      border: "2.5px solid",
                      borderColor: isOpen
                        ? "transparent"
                        : "var(--color-border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1rem",
                      boxShadow: isOpen ? "0 4px 12px rgba(14,165,233,0.3)" : "var(--shadow-sm)",
                      transition: "all var(--transition-slow)",
                      zIndex: 1,
                    }}
                  >
                    {isOpen ? (
                      <span style={{ fontSize: "0.9rem" }}>{entry.mood}</span>
                    ) : (
                      <span
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 800,
                          color: "var(--color-text-muted)",
                        }}
                      >
                        W{entry.week}
                      </span>
                    )}
                  </div>

                  {/* Card */}
                  <div
                    style={{
                      background: "var(--color-surface)",
                      border: "1px solid",
                      borderColor: isOpen ? "var(--color-primary-light)" : "var(--color-border)",
                      borderRadius: "var(--radius-xl)",
                      overflow: "hidden",
                      boxShadow: isOpen ? "var(--shadow-lg)" : "var(--shadow-sm)",
                      transition: "all var(--transition-slow)",
                    }}
                  >
                    {/* Accordion Header */}
                    <button
                      id={`journal-week-${entry.week}`}
                      aria-expanded={isOpen}
                      aria-controls={`journal-content-${entry.week}`}
                      onClick={() => setOpenWeek(isOpen ? null : entry.week)}
                      style={{
                        width: "100%",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "1.25rem 1.5rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        textAlign: "left",
                        gap: "1rem",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <span
                          style={{
                            padding: "0.2rem 0.65rem",
                            borderRadius: "var(--radius-full)",
                            background: isOpen ? "#e0f2fe" : "#f1f5f9",
                            color: isOpen ? "var(--color-primary-dark)" : "var(--color-text-muted)",
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            transition: "all var(--transition-base)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          Week {entry.week}
                        </span>
                        <div>
                          <div
                            style={{
                              fontSize: "0.95rem",
                              fontWeight: 700,
                              color: "var(--color-text-primary)",
                              marginBottom: "0.15rem",
                            }}
                          >
                            {entry.title}
                          </div>
                          <div
                            style={{
                              fontSize: "0.78rem",
                              color: "var(--color-text-muted)",
                              fontWeight: 500,
                            }}
                          >
                            📅 {entry.dates}
                          </div>
                        </div>
                      </div>

                      {/* Chevron */}
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--color-text-muted)"
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                          flexShrink: 0,
                          transition: "transform var(--transition-base)",
                          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                        }}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>

                    {/* Accordion Content */}
                    {isOpen && (
                      <div
                        id={`journal-content-${entry.week}`}
                        style={{
                          padding: "0 1.5rem 1.5rem",
                          borderTop: "1px solid var(--color-border)",
                        }}
                      >
                        <p
                          style={{
                            color: "var(--color-text-secondary)",
                            fontSize: "0.9rem",
                            lineHeight: 1.75,
                            margin: "1rem 0",
                          }}
                        >
                          {entry.summary}
                        </p>

                        <h4
                          style={{
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            color: "var(--color-text-muted)",
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            marginBottom: "0.75rem",
                          }}
                        >
                          Highlights
                        </h4>

                        <ul
                          style={{
                            listStyle: "none",
                            margin: 0,
                            padding: 0,
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.5rem",
                          }}
                        >
                          {entry.highlights.map((h) => (
                            <li
                              key={h}
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
                                  color: "var(--color-primary)",
                                  fontWeight: 700,
                                  flexShrink: 0,
                                  marginTop: "0.05rem",
                                }}
                              >
                                ›
                              </span>
                              {h}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Note */}
        <p
          style={{
            textAlign: "center",
            color: "var(--color-text-muted)",
            fontSize: "0.82rem",
            marginTop: "2rem",
          }}
        >
          Showing 5 of 10+ weekly entries. Full journal available upon request.
        </p>
      </div>
    </section>
  );
}
