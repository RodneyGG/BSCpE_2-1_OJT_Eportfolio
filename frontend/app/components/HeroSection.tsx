"use client";

export default function HeroSection() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        background:
          "linear-gradient(160deg, #f0f9ff 0%, #f8fafc 45%, #f0fdfa 100%)",
        padding: "7rem 1.5rem 4rem",
      }}
    >
      {/* Background decorative blobs */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "-10%",
          right: "-8%",
          width: "clamp(300px, 45vw, 600px)",
          height: "clamp(300px, 45vw, 600px)",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: "-5%",
          left: "-5%",
          width: "clamp(200px, 35vw, 480px)",
          height: "clamp(200px, 35vw, 480px)",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(13,148,136,0.1) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "30%",
          left: "20%",
          width: "clamp(150px, 20vw, 300px)",
          height: "clamp(150px, 20vw, 300px)",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(6,182,212,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Content */}
      <div
        style={{
          maxWidth: 820,
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Badge */}
        <div
          className="animate-fade-up"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "#e0f2fe",
            color: "var(--color-primary-dark)",
            borderRadius: "var(--radius-full)",
            padding: "0.4rem 1rem",
            fontSize: "0.8rem",
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            marginBottom: "1.5rem",
            opacity: 0,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "var(--color-primary)",
              display: "inline-block",
              animation: "float 2s ease-in-out infinite",
            }}
          />
          BSCpE 2-1 · On-the-Job Training
        </div>

        {/* Headline */}
        <h1
          className="heading-xl animate-fade-up delay-100"
          style={{
            marginBottom: "0.5rem",
            color: "var(--color-text-primary)",
            opacity: 0,
          }}
        >
          Welcome to My{" "}
          <span
            style={{
              display: "block",
              background:
                "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            OJT E-Portfolio
          </span>
        </h1>

        {/* Sub-headline */}
        <p
          className="animate-fade-up delay-200"
          style={{
            fontSize: "clamp(1rem, 2vw, 1.2rem)",
            color: "var(--color-text-secondary)",
            lineHeight: 1.7,
            maxWidth: 560,
            margin: "1.25rem auto 2.5rem",
            opacity: 0,
          }}
        >
          A comprehensive digital portfolio documenting my on-the-job training
          journey — skills acquired, weekly reflections, and professional growth.
        </p>

        {/* CTA Buttons */}
        <div
          className="animate-fade-up delay-300"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.75rem",
            justifyContent: "center",
            opacity: 0,
          }}
        >
          <button
            id="hero-view-journey"
            className="btn-primary"
            onClick={() => scrollTo("about")}
            style={{ fontSize: "0.95rem", padding: "0.8rem 2rem" }}
          >
            View My Journey
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 17 17 7M7 7h10v10" />
            </svg>
          </button>
          <button
            id="hero-view-documents"
            className="btn-secondary"
            onClick={() => scrollTo("documents")}
            style={{ fontSize: "0.95rem", padding: "0.8rem 2rem" }}
          >
            View Documents
          </button>
        </div>

        {/* Stats Row */}
        <div
          className="animate-fade-up delay-400"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
            justifyContent: "center",
            marginTop: "4rem",
            opacity: 0,
          }}
        >
          {[
            { value: "600",  unit: "hrs", label: "OJT Hours"      },
            { value: "10+",  unit: "",    label: "Weekly Logs"     },
            { value: "100%", unit: "",    label: "Completion Rate" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "rgba(255,255,255,0.8)",
                backdropFilter: "blur(8px)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-xl)",
                padding: "1.25rem 2rem",
                textAlign: "center",
                minWidth: 130,
                boxShadow: "var(--shadow-md)",
              }}
            >
              <div
                style={{
                  fontSize: "1.75rem",
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  background:
                    "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  lineHeight: 1,
                }}
              >
                {stat.value}
                {stat.unit && (
                  <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                    {" "}{stat.unit}
                  </span>
                )}
              </div>
              <div
                style={{
                  fontSize: "0.78rem",
                  fontWeight: 500,
                  color: "var(--color-text-muted)",
                  marginTop: "0.3rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div
          className="animate-fade-up delay-500"
          style={{
            marginTop: "3rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.5rem",
            opacity: 0,
          }}
        >
          <span
            style={{
              fontSize: "0.72rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--color-text-muted)",
              fontWeight: 500,
            }}
          >
            Scroll to explore
          </span>
          <div
            style={{
              width: 24,
              height: 38,
              border: "2px solid var(--color-border)",
              borderRadius: 12,
              display: "flex",
              justifyContent: "center",
              paddingTop: 6,
            }}
          >
            <div
              style={{
                width: 4,
                height: 8,
                background: "var(--color-primary)",
                borderRadius: 2,
                animation: "float 1.6s ease-in-out infinite",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
