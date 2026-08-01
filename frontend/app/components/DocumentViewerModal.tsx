"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

function toEmbeddableUrl(driveLink: string): string {
  const match = driveLink.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match) {
    return `https://drive.google.com/file/d/${match[1]}/preview`;
  }
  return driveLink;
}

function IconClose() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function IconExternal() {
  return (
    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

interface DocumentViewerModalProps {
  title: string;
  fileLink: string;
  onClose: () => void;
}

export default function DocumentViewerModal({ title, fileLink, onClose }: DocumentViewerModalProps) {
  const embedUrl = toEmbeddableUrl(fileLink);
  const [mounted, setMounted] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [closeHover, setCloseHover] = useState(false);
  const [linkHover, setLinkHover] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      style={{
        position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
        background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)",
        zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "3rem",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#ffffff", borderRadius: "0.75rem",
          width: "100%", height: "100%",
          maxWidth: "1280px",
          display: "flex", flexDirection: "column", overflow: "hidden",
          border: "1px solid #e2e8f0",
          boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          padding: "0.9rem 1.25rem", borderBottom: "1px solid #eef1f5",
          display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0,
        }}>
          <h3 style={{
            margin: 0, fontSize: "0.9rem", fontWeight: 600, color: "#0f172a",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {title}
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0, marginLeft: "1rem" }}>
            <a
              href={fileLink}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => setLinkHover(true)}
              onMouseLeave={() => setLinkHover(false)}
              style={{
                display: "flex", alignItems: "center", gap: "0.35rem",
                fontSize: "0.78rem", fontWeight: 500,
                color: linkHover ? "#1d4ed8" : "#3b82f6",
                textDecoration: "none",
                padding: "0.4rem 0.6rem", borderRadius: "0.4rem",
                background: linkHover ? "#eff6ff" : "transparent",
                transition: "background 0.15s, color 0.15s",
              }}
            >
              <IconExternal />
              Open in Drive
            </a>
            <button
              onClick={onClose}
              onMouseEnter={() => setCloseHover(true)}
              onMouseLeave={() => setCloseHover(false)}
              aria-label="Close"
              style={{
                background: closeHover ? "#f1f5f9" : "transparent",
                border: "none", borderRadius: "0.4rem",
                width: 30, height: 30, cursor: "pointer",
                color: "#64748b",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background 0.15s",
              }}
            >
              <IconClose />
            </button>
          </div>
        </div>

        <div style={{ flex: 1, minHeight: 0, position: "relative", background: "#f8fafc" }}>
          {!loaded && (
            <div style={{
              position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#94a3b8", fontSize: "0.85rem", fontWeight: 500,
            }}>
              Loading document...
            </div>
          )}
          <iframe
            src={embedUrl}
            onLoad={() => setLoaded(true)}
            style={{
              width: "100%", height: "100%", border: "none", display: "block",
              opacity: loaded ? 1 : 0, transition: "opacity 0.2s",
            }}
            allow="autoplay"
            title={title}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}