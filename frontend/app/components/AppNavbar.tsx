"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRole } from "../context/RoleContext";
import { BUG_REPORT_EMAIL, GITHUB_REPO_URL } from "../lib/config";

function IconChevronDown() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
function IconHelp() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" />
    </svg>
  );
}
function IconBook() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}
function IconBug() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="6" width="8" height="14" rx="4" /><path d="M19 7l-3 2M5 7l3 2M19 19l-3-2M5 19l3-2M12 6V3M9 3h6M3 13h5M16 13h5" />
    </svg>
  );
}
function IconGithub() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.4 7.86 10.93.57.1.79-.25.79-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.87-1.36-3.87-1.36-.53-1.33-1.29-1.69-1.29-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.64 1.59.24 2.76.12 3.05.74.8 1.19 1.83 1.19 3.09 0 4.43-2.7 5.4-5.27 5.69.42.36.78 1.08.78 2.18 0 1.57-.01 2.84-.01 3.23 0 .3.21.66.8.55A10.52 10.52 0 0 0 23.5 12c0-6.35-5.15-11.5-11.5-11.5z" />
    </svg>
  );
}
function IconLogout() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" />
    </svg>
  );
}
function IconLogoMark() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
    </svg>
  );
}

function roleBadge(role: string) {
  if (role === "admin") {
    return { label: "ADMIN", bg: "#fef3c7", color: "#92400e", border: "#fde68a" };
  }
  if (role === "prof") {
    return { label: "PROF", bg: "#ede9fe", color: "#5b21b6", border: "#ddd6fe" };
  }
  return { label: "STUDENT", bg: "#f1f5f9", color: "#475569", border: "#e2e8f0" };
}

export default function AppNavbar() {
  const { role, user, logout } = useRole();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const badge = roleBadge(role);
  const isActive = (path: string) => pathname === path;

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      style={{
        fontSize: "0.8rem",
        fontWeight: 600,
        color: isActive(href) ? "white" : "#93c5fd",
        textDecoration: "none",
        padding: "0.4rem 0.1rem",
        borderBottom: isActive(href) ? "2px solid #60a5fa" : "2px solid transparent",
        transition: "color 0.2s ease",
      }}
    >
      {label}
    </Link>
  );

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    router.push("/login");
  };

  return (
    <nav style={{
      background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",
      boxShadow: "0 2px 12px rgba(15,23,42,0.4)",
      position: "sticky", top: 0, zIndex: 50,
    }}>
      <div style={{
        maxWidth: 1400, margin: "0 auto", padding: "0 2rem", height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1.5rem",
      }}>
        {/* Brand — doubles as Home link */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.6rem", textDecoration: "none", flexShrink: 0 }}>
          <div style={{
            width: 32, height: 32, borderRadius: "0.5rem",
            background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 0 2px rgba(99,102,241,0.35)",
          }}>
            <IconLogoMark />
          </div>
          <div style={{ fontSize: "0.8rem", fontWeight: 800, color: "white", letterSpacing: "0.05em" }}>
            BSCPE 2-1
          </div>
        </Link>

        {/* Role-based links */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flex: 1 }}>
          {navLink("/profile", "My Profile")}
          {(role === "admin" || role === "prof") && navLink("/admin", "Dashboard")}
        </div>

        {/* Profile dropdown */}
        <div ref={menuRef} style={{ position: "relative", flexShrink: 0 }}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            style={{
              display: "flex", alignItems: "center", gap: "0.6rem",
              background: menuOpen ? "rgba(255,255,255,0.1)" : "transparent",
              border: "1px solid rgba(255,255,255,0.15)", borderRadius: "9999px",
              padding: "0.35rem 0.5rem 0.35rem 0.9rem", cursor: "pointer", transition: "background 0.2s ease",
            }}
          >
            <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "white" }}>
              {user?.name || "Account"}
            </span>
            <span style={{
              fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.05em",
              padding: "0.15rem 0.5rem", borderRadius: "9999px",
              background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`,
            }}>
              {badge.label}
            </span>
            <span style={{ color: "#93c5fd", display: "flex", transform: menuOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s ease" }}>
              <IconChevronDown />
            </span>
          </button>

          {menuOpen && (
            <div style={{
              position: "absolute", top: "calc(100% + 0.5rem)", right: 0,
              width: 220, background: "white", borderRadius: "0.75rem",
              boxShadow: "0 10px 30px rgba(0,0,0,0.15)", border: "1px solid #e2e8f0",
              overflow: "hidden", zIndex: 60,
            }}>
              {[
                { href: "/help", label: "Help / Docs", icon: <IconHelp />, external: false },
                { href: "/user-manual", label: "User Manual", icon: <IconBook />, external: false },
                { href: `mailto:${BUG_REPORT_EMAIL}?subject=OJT%20E-Portfolio%20Bug%20Report`, label: "Report a Bug", icon: <IconBug />, external: true },
                { href: GITHUB_REPO_URL, label: "Visit GitHub", icon: <IconGithub />, external: true },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.6rem",
                    padding: "0.65rem 0.9rem", fontSize: "0.82rem", fontWeight: 500,
                    color: "#334155", textDecoration: "none", transition: "background 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <span style={{ color: "#64748b", display: "flex" }}>{item.icon}</span>
                  {item.label}
                </a>
              ))}
              <div style={{ borderTop: "1px solid #e2e8f0" }} />
              <button
                onClick={handleLogout}
                style={{
                  display: "flex", alignItems: "center", gap: "0.6rem", width: "100%",
                  padding: "0.65rem 0.9rem", fontSize: "0.82rem", fontWeight: 600,
                  color: "#dc2626", background: "transparent", border: "none", cursor: "pointer",
                  textAlign: "left", transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#fef2f2")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <IconLogout />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}