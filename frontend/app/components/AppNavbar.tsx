"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRole } from "../context/RoleContext";
import { BUG_REPORT_EMAIL, GITHUB_REPO_URL } from "../lib/config";
import { fetchApi } from "../../lib/api";

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
function IconActivity() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
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
function IconLogin() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
    </svg>
  );
}
function IconLock() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
function IconUser() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
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
function IconBell() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
    </svg>
  );
}

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function IconMenu() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function IconX() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
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

function dashboardLabel(role: string) {
  if (role === "admin") return "User Management";
  if (role === "prof") return "Document Review";
  return "My Profile";
}

function dashboardHref(role: string) {
  if (role === "admin") return "/admin";
  if (role === "prof") return "/prof/review";
  return "/profile";
}

export default function AppNavbar() {
  const { role, user, isLoggedIn, logout } = useRole();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const toggleMenu = () => {
    setMenuOpen((v) => !v);
    if (!menuOpen) setNotifOpen(false);
  };
  const toggleNotif = () => {
    setNotifOpen((v) => !v);
    if (!notifOpen) setMenuOpen(false);
  };

  const loadNotifications = async () => {
    if (!isLoggedIn) return;
    try {
      const res = await fetchApi("/notifications");
      if (res) {
        setNotifications(res.notifications || []);
        setUnreadCount(res.unread_count || 0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  const markAllRead = async () => {
    try {
      await fetchApi("/notifications/read-all", { method: "PATCH" });
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const markRead = async (id: number) => {
    try {
      await fetchApi(`/notifications/${id}/read`, { method: "PATCH" });
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const badge = isLoggedIn ? roleBadge(role) : null;

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    router.push("/login");
  };

  const handleCompaniesClick = (e: React.MouseEvent) => {
    if (pathname === "/") {
      e.preventDefault();
      document.getElementById("companies")?.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
    // Otherwise let the Link navigate to "/#companies" normally
  };

  const initials = isLoggedIn && user ? user.name.split(" ").map((w) => w[0]).slice(0, 2).join("") : "";

  return (
    <>
      <style>{`
        .nav-container { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; padding: 0.5rem 2rem; min-height: 64px; gap: 1rem; }
        .nav-center-links { display: flex; align-items: center; gap: 2.5rem; justify-content: flex-end; flex: 1; }
        .mobile-menu-btn { display: none; background: transparent; border: none; color: white; cursor: pointer; padding: 0.5rem; margin-left: 0.5rem; }
        
        @media (max-width: 1024px) {
          .nav-center-links { gap: 1.5rem; }
        }
        
        @media (max-width: 768px) {
          .nav-container { padding: 0.75rem 1rem; }
          .mobile-menu-btn { display: flex; align-items: center; justify-content: center; }
          .nav-user { margin-left: auto; }
          .nav-center-links {
            display: none; 
            flex-direction: column;
            position: absolute; top: 100%; left: 0; right: 0;
            background: #0f172a; border-bottom: 1px solid rgba(255,255,255,0.1);
            padding: 1.5rem; gap: 1.5rem;
            box-shadow: 0 10px 25px rgba(0,0,0,0.5);
            align-items: flex-start;
          }
          .nav-center-links.open { display: flex; }
          .user-name-text, .user-role-badge, .nav-user-dropdown-icon, .brand-text { display: none !important; }
          .nav-user-btn { padding: 0.3rem !important; gap: 0 !important; }
        }
      `}</style>
      <nav style={{
        backgroundColor: navScrolled ? "rgba(15,23,42,0.97)" : "transparent",
        backgroundImage: navScrolled ? "none" : "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",
        backdropFilter: navScrolled ? "blur(12px)" : "none",
        boxShadow: navScrolled ? "0 4px 24px rgba(0,0,0,0.4)" : "0 2px 12px rgba(15,23,42,0.4)",
        position: "sticky", top: 0, zIndex: 50,
        transition: "all 0.3s ease",
        minHeight: 64,
      }}>
      <div className="nav-container">
        {/* Brand */}
        <Link href="/" className="nav-brand" style={{ display: "flex", alignItems: "center", gap: "0.75rem", textDecoration: "none", flexShrink: 0 }}>
          <div style={{
            background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
            width: 36, height: 36, borderRadius: "0.75rem",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 10px rgba(59, 130, 246, 0.3)",
          }}>
            <IconLogoMark />
          </div>
          <span className="brand-text" style={{ fontSize: "1.1rem", fontWeight: 800, color: "white", letterSpacing: "0.02em" }}>
            OJT E-Portfolio
          </span>
        </Link>

        {/* Middle links */}
        <div className={`nav-center-links ${mobileMenuOpen ? "open" : ""}`}>
          {(() => {
            const isCompaniesActive = pathname === "/";
            return (
              <Link
                href="/#companies"
                onClick={handleCompaniesClick}
                style={{
                  fontSize: "0.75rem", fontWeight: 600,
                  color: isCompaniesActive ? "white" : "#93c5fd",
                  textDecoration: "none",
                  letterSpacing: "0.06em", textTransform: "uppercase", transition: "color 0.2s",
                  borderBottom: isCompaniesActive ? "2px solid #3b82f6" : "2px solid transparent",
                  paddingBottom: "0.2rem",
                }}
              >
                Companies
              </Link>
            );
          })()}
          {isLoggedIn && (() => {
            const href = dashboardHref(role);
            const isDashboardActive = pathname === href;
            return (
              <Link
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  fontSize: "0.75rem", fontWeight: 600,
                  color: isDashboardActive ? "white" : "#93c5fd",
                  textDecoration: "none",
                  letterSpacing: "0.06em", textTransform: "uppercase", transition: "color 0.2s",
                  borderBottom: isDashboardActive ? "2px solid #3b82f6" : "2px solid transparent",
                  paddingBottom: "0.2rem",
                }}
              >
                {dashboardLabel(role)}
              </Link>
            );
          })()}
          {isLoggedIn && (role === "prof" || role === "admin") && (() => {
            const isChecklistActive = pathname === "/admin/checklist";
            return (
              <Link
                href="/admin/checklist"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  fontSize: "0.75rem", fontWeight: 600,
                  color: isChecklistActive ? "white" : "#93c5fd",
                  textDecoration: "none",
                  letterSpacing: "0.06em", textTransform: "uppercase", transition: "color 0.2s",
                  borderBottom: isChecklistActive ? "2px solid #3b82f6" : "2px solid transparent",
                  paddingBottom: "0.2rem",
                }}
              >
                Checklist
              </Link>
            );
          })()}
        </div>

        {/* Auth-aware right side */}
        {!isLoggedIn ? (
          <Link href="/login" className="nav-user" style={{
            display: "flex", alignItems: "center", gap: "0.5rem",
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "9999px",
            padding: "0.4rem 1rem",
            textDecoration: "none",
            transition: "background 0.2s ease, transform 0.2s ease",
            fontSize: "0.75rem", fontWeight: 700, color: "white",
            letterSpacing: "0.06em", textTransform: "uppercase",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.18)";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.1)";
            e.currentTarget.style.transform = "translateY(0)";
          }}>
            <IconLogin />
            Log In
          </Link>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {/* Notification Bell */}
            <div ref={notifRef} style={{ position: "relative", flexShrink: 0 }}>
              <button
                onClick={toggleNotif}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: 36, height: 36, borderRadius: "50%",
                  background: notifOpen ? "rgba(255,255,255,0.15)" : "transparent",
                  border: "none", cursor: "pointer", transition: "background 0.2s ease",
                  color: "white"
                }}
                onMouseEnter={(e) => {
                  if (!notifOpen) e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                }}
                onMouseLeave={(e) => {
                  if (!notifOpen) e.currentTarget.style.background = "transparent";
                }}
              >
                <IconBell />
                {unreadCount > 0 && (
                  <span style={{
                    position: "absolute", top: 2, right: 2,
                    background: "#ef4444", color: "white",
                    fontSize: "0.6rem", fontWeight: 800,
                    width: 16, height: 16, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: "2px solid #0f172a"
                  }}>
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              
              {notifOpen && (
                <div style={{
                  position: "absolute", top: "calc(100% + 0.5rem)", right: 0,
                  width: 320, background: "white", borderRadius: "0.75rem",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.15)", border: "1px solid #e2e8f0",
                  overflow: "hidden", zIndex: 60, display: "flex", flexDirection: "column"
                }}>
                  <div style={{
                    padding: "0.75rem 1rem", borderBottom: "1px solid #e2e8f0",
                    display: "flex", alignItems: "center", justifyContent: "space-between"
                  }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#334155" }}>Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        style={{
                          fontSize: "0.7rem", color: "#3b82f6", background: "none", border: "none",
                          cursor: "pointer", fontWeight: 600
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"}
                        onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div style={{ maxHeight: 400, overflowY: "auto" }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: "2rem 1rem", textAlign: "center", fontSize: "0.8rem", color: "#64748b" }}>
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div
                          key={notif.id}
                          onClick={() => { if (!notif.is_read) markRead(notif.id); }}
                          style={{
                            padding: "0.75rem 1rem", borderBottom: "1px solid #e2e8f0",
                            borderLeft: `3px solid ${notif.is_read ? "transparent" : "#3b82f6"}`,
                            background: notif.is_read ? "transparent" : "#f8fafc",
                            cursor: notif.is_read ? "default" : "pointer",
                            transition: "background 0.2s"
                          }}
                          onMouseEnter={(e) => {
                            if (!notif.is_read) e.currentTarget.style.background = "#eff6ff";
                          }}
                          onMouseLeave={(e) => {
                            if (!notif.is_read) e.currentTarget.style.background = "#f8fafc";
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                            <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#334155" }}>{notif.title}</span>
                            <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>{timeAgo(notif.created_at)}</span>
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "#64748b", lineHeight: 1.4 }}>
                            {notif.message}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div ref={menuRef} className="nav-user" style={{ position: "relative", flexShrink: 0 }}>
              <button
                className="nav-user-btn"
                onClick={toggleMenu}
              style={{
                display: "flex", alignItems: "center", gap: "0.6rem",
                background: menuOpen ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.15)", borderRadius: "9999px",
                padding: "0.3rem 0.7rem 0.3rem 0.35rem", cursor: "pointer", transition: "background 0.2s ease",
              }}
            >
              <div style={{
                width: 26, height: 26, borderRadius: "50%",
                background: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.6rem", fontWeight: 800, color: "white", flexShrink: 0,
              }}>{initials}</div>
              <span className="user-name-text" style={{ fontSize: "0.75rem", fontWeight: 700, color: "white",
                letterSpacing: "0.05em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                {user?.name}
              </span>
              {badge && (
                <span className="user-role-badge" style={{
                  fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.05em",
                  padding: "0.15rem 0.45rem", borderRadius: "9999px",
                  background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`,
                }}>
                  {badge.label}
                </span>
              )}
              <span className="nav-user-dropdown-icon" style={{ color: "#93c5fd", display: "flex", transform: menuOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s ease" }}>
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
                  { href: "/profile", label: "My Profile", icon: <IconUser />, external: false },
                  { href: "/change-password", label: "Change Password", icon: <IconLock />, external: false },
                  { href: "/help", label: "Help / Docs", icon: <IconHelp />, external: false },
                  { href: "/user-manual", label: "User Manual", icon: <IconBook />, external: false },
                  ...(role === "admin" ? [{ href: "/admin/activity-log", label: "Activity Log", icon: <IconActivity />, external: false }] : []),
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
        )}
        
        {/* Hamburger Menu Toggle (Mobile Only) */}
        <button 
          className="mobile-menu-btn" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? <IconX /> : <IconMenu />}
        </button>
      </div>
    </nav>
    </>
  );
}