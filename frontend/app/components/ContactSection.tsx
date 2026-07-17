"use client";

import { useState } from "react";

interface ContactLink {
  id: string;
  label: string;
  value: string;
  href: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const CONTACT_LINKS: ContactLink[] = [
  {
    id: "contact-email",
    label: "Email",
    value: "youremail@example.com",
    href: "mailto:youremail@example.com",
    color: "#0284c7",
    bgColor: "#e0f2fe",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    ),
  },
  {
    id: "contact-linkedin",
    label: "LinkedIn",
    value: "linkedin.com/in/yourprofile",
    href: "https://linkedin.com/in/yourprofile",
    color: "#0a66c2",
    bgColor: "#dbeafe",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
  },
  {
    id: "contact-github",
    label: "GitHub",
    value: "github.com/yourusername",
    href: "https://github.com/yourusername",
    color: "#171515",
    bgColor: "#f1f5f9",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
      </svg>
    ),
  },
  {
    id: "contact-facebook",
    label: "Facebook",
    value: "facebook.com/yourprofile",
    href: "https://facebook.com/yourprofile",
    color: "#1877f2",
    bgColor: "#dbeafe",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
];

export default function ContactSection() {
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    await navigator.clipboard.writeText("youremail@example.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      id="contact"
      className="section"
      style={{
        background: "linear-gradient(160deg, #f0f9ff 0%, #f8fafc 50%, #f0fdfa 100%)",
      }}
    >
      <div className="section-inner">
        {/* Header */}
        <div style={{ marginBottom: "3rem", textAlign: "center" }}>
          <span className="section-label" style={{ justifyContent: "center" }}>
            Contact
          </span>
          <h2 className="section-title">Get in Touch</h2>
          <div className="divider" style={{ margin: "1.25rem auto 1.5rem" }} />
          <p className="section-subtitle" style={{ margin: "0 auto" }}>
            Feel free to reach out for inquiries, collaborations, or just to connect.
            I&apos;d love to hear from you!
          </p>
        </div>

        <div
          style={{
            maxWidth: 700,
            margin: "0 auto",
            display: "grid",
            gap: "1rem",
          }}
        >
          {CONTACT_LINKS.map((link) => (
            <a
              key={link.id}
              id={link.id}
              href={link.href}
              target={link.href.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1.25rem",
                padding: "1.25rem 1.5rem",
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-xl)",
                boxShadow: "var(--shadow-md)",
                textDecoration: "none",
                transition: "all var(--transition-base)",
                color: "inherit",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = "translateY(-2px)";
                el.style.boxShadow = "var(--shadow-xl)";
                el.style.borderColor = link.color + "44";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = "none";
                el.style.boxShadow = "var(--shadow-md)";
                el.style.borderColor = "var(--color-border)";
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "var(--radius-md)",
                  background: link.bgColor,
                  color: link.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {link.icon}
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--color-text-muted)",
                    marginBottom: "0.2rem",
                  }}
                >
                  {link.label}
                </div>
                <div
                  style={{
                    fontSize: "0.92rem",
                    fontWeight: 600,
                    color: "var(--color-text-primary)",
                  }}
                >
                  {link.value}
                </div>
              </div>

              {/* Arrow */}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-text-muted)"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ flexShrink: 0 }}
              >
                <path d="M7 17 17 7M7 7h10v10" />
              </svg>
            </a>
          ))}

          {/* Copy Email shortcut */}
          <button
            id="contact-copy-email"
            onClick={copyEmail}
            style={{
              marginTop: "0.5rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.6rem 1.25rem",
              background: copied ? "#dcfce7" : "#f1f5f9",
              color: copied ? "#15803d" : "var(--color-text-secondary)",
              border: `1px solid ${copied ? "#86efac" : "var(--color-border)"}`,
              borderRadius: "var(--radius-full)",
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all var(--transition-base)",
              margin: "0.5rem auto 0",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              {copied
                ? <polyline points="20 6 9 17 4 12" />
                : <><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>}
            </svg>
            {copied ? "Email copied!" : "Copy email address"}
          </button>
        </div>
      </div>
    </section>
  );
}
