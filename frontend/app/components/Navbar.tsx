"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { label: "About",     href: "#about"     },
  { label: "Company",   href: "#company"   },
  { label: "Journal",   href: "#journal"   },
  { label: "Documents", href: "#documents" },
  { label: "Contact",   href: "#contact"   },
];

const ROUTE_LINKS = [
  { label: "Companies", href: "/companies" },
];

export default function Navbar() {
  const [scrolled,     setScrolled]     = useState(false);
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [activeSection, setActiveSection] = useState("");

  /* ── Scroll detection ── */
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);

      const sections = NAV_LINKS.map((l) => l.href.slice(1));
      let current = "";
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 90) current = id;
      }
      setActiveSection(current);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNav = (href: string) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      id="navbar"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        transition: "all 0.3s ease",
        backgroundColor: scrolled ? "rgba(248,250,252,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid var(--color-border)" : "1px solid transparent",
        boxShadow: scrolled ? "var(--shadow-sm)" : "none",
      }}
    >
      <nav
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 1.5rem",
          height: 68,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <a
          href="#hero"
          onClick={(e) => { e.preventDefault(); handleNav("#hero"); }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            textDecoration: "none",
          }}
        >
          <span
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: "0.8rem",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              flexShrink: 0,
            }}
          >
            OJT
          </span>
          <span
            style={{
              fontWeight: 700,
              fontSize: "0.95rem",
              color: "var(--color-text-primary)",
              letterSpacing: "-0.01em",
            }}
          >
            E-Portfolio{" "}
            <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>
              BSCpE 2-1
            </span>
          </span>
        </a>

        {/* Desktop Nav */}
        <ul
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
            listStyle: "none",
            margin: 0,
            padding: 0,
          }}
          className="hidden md:flex"
        >
          {NAV_LINKS.map((link) => {
            const isActive = activeSection === link.href.slice(1);
            return (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={(e) => { e.preventDefault(); handleNav(link.href); }}
                  style={{
                    padding: "0.4rem 0.85rem",
                    borderRadius: "var(--radius-full)",
                    fontSize: "0.88rem",
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? "var(--color-primary-dark)" : "var(--color-text-secondary)",
                    backgroundColor: isActive ? "#e0f2fe" : "transparent",
                    textDecoration: "none",
                    transition: "all var(--transition-base)",
                    display: "block",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.backgroundColor = "#f1f5f9";
                      (e.currentTarget as HTMLElement).style.color = "var(--color-text-primary)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                      (e.currentTarget as HTMLElement).style.color = "var(--color-text-secondary)";
                    }
                  }}
                >
                  {link.label}
                </a>
              </li>
            );
          })}

          {/* Route links */}
          {ROUTE_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                style={{
                  padding: "0.4rem 0.85rem",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  color: "var(--color-primary-dark)",
                  backgroundColor: "#e0f2fe",
                  textDecoration: "none",
                  display: "block",
                  transition: "all var(--transition-base)",
                }}
              >
                🏢 {link.label}
              </Link>
            </li>
          ))}

          <li>
            <a
              href="#contact"
              onClick={(e) => { e.preventDefault(); handleNav("#contact"); }}
              className="btn-primary"
              style={{ padding: "0.45rem 1.1rem", fontSize: "0.88rem", marginLeft: "0.5rem" }}
            >
              Contact Me
            </a>
          </li>
        </ul>

        {/* Mobile Hamburger */}
        <button
          id="mobile-menu-toggle"
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
          style={{
            display: "none",
            flexDirection: "column",
            gap: 5,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "0.5rem",
          }}
          className="flex md:hidden"
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                display: "block",
                width: 22,
                height: 2,
                backgroundColor: "var(--color-text-primary)",
                borderRadius: 2,
                transition: "transform 0.25s ease, opacity 0.25s ease",
                transform:
                  menuOpen
                    ? i === 0
                      ? "translateY(7px) rotate(45deg)"
                      : i === 2
                      ? "translateY(-7px) rotate(-45deg)"
                      : "none"
                    : "none",
                opacity: menuOpen && i === 1 ? 0 : 1,
              }}
            />
          ))}
        </button>
      </nav>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div
          style={{
            backgroundColor: "rgba(248,250,252,0.97)",
            backdropFilter: "blur(12px)",
            borderTop: "1px solid var(--color-border)",
            padding: "1rem 1.5rem 1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.25rem",
          }}
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => { e.preventDefault(); handleNav(link.href); }}
              style={{
                padding: "0.7rem 1rem",
                borderRadius: "var(--radius-md)",
                fontSize: "0.95rem",
                fontWeight: 500,
                color: "var(--color-text-secondary)",
                textDecoration: "none",
                transition: "background var(--transition-base)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = "#f1f5f9";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
              }}
            >
              {link.label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={(e) => { e.preventDefault(); handleNav("#contact"); }}
            className="btn-primary"
            style={{ marginTop: "0.75rem", justifyContent: "center" }}
          >
            Contact Me
          </a>
        </div>
      )}
    </header>
  );
}
