"use client";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
interface ConfirmDialogProps {
  open: boolean;
  variant: "confirm" | "alert";
  title?: string;
  message: string;
  highlight?: string;
  icon?: "warning" | "success";
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  isProcessing?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}
function IconWarningLarge() {
  return (
    <svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
function IconSuccessLarge() {
  return (
    <svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12.5l2.5 2.5L16 9.5" />
    </svg>
  );
}
const TONE_STYLES = {
  warning: { iconColor: "#dc2626", bg: "#fef2f2", border: "#fecaca", borderLeft: "#dc2626", text: "#991b1b" },
  success: { iconColor: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", borderLeft: "#16a34a", text: "#166534" },
} as const;
export default function ConfirmDialog({
  open,
  variant,
  title,
  message,
  highlight,
  icon,
  confirmLabel,
  cancelLabel = "Cancel",
  danger = false,
  isProcessing = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!open || !mounted) return null;
  const resolvedIcon = icon ?? (danger ? "warning" : undefined);
  const tone = resolvedIcon ? TONE_STYLES[resolvedIcon] : null;
  
  return createPortal(
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999,
      }}
      onClick={!isProcessing ? onCancel : undefined}
    >
      <div
        style={{ 
          background: "#fff", 
          borderRadius: "1.25rem", 
          padding: "2.5rem 2rem", 
          width: "100%", 
          maxWidth: "32rem", 
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {tone && (
          <div style={{ 
            color: tone.iconColor, 
            background: tone.bg, 
            padding: "1.25rem", 
            borderRadius: "9999px",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            {resolvedIcon === "warning" ? <IconWarningLarge /> : <IconSuccessLarge />}
          </div>
        )}
        
        <h3 style={{ fontSize: "1.5rem", fontWeight: 800, margin: "0 0 1rem", color: "#0f172a" }}>
          {title || (variant === "alert" ? "Notice" : "Please Confirm")}
        </h3>
        
        <p style={{ fontSize: "1.05rem", color: "#475569", margin: highlight ? "0 0 1rem" : "0 0 2rem", lineHeight: 1.6 }}>
          {message}
        </p>
        
        {highlight && tone && (
          <div
            style={{
              width: "100%",
              background: tone.bg,
              border: `1px solid ${tone.border}`,
              borderRadius: "0.75rem",
              padding: "1rem",
              marginBottom: "2rem",
              textAlign: "left"
            }}
          >
            <span style={{ fontSize: "0.95rem", fontWeight: 600, color: tone.text, lineHeight: 1.5 }}>
              {highlight}
            </span>
          </div>
        )}
        
        <div style={{ display: "flex", gap: "1rem", width: "100%", justifyContent: "center" }}>
          {variant === "confirm" && (
            <button 
              onClick={onCancel}
              disabled={isProcessing}
              style={{
                flex: 1,
                padding: "0.875rem 1.5rem",
                borderRadius: "0.75rem",
                background: "#f1f5f9",
                color: "#475569",
                fontWeight: 700,
                fontSize: "1rem",
                border: "none",
                cursor: isProcessing ? "not-allowed" : "pointer",
                opacity: isProcessing ? 0.6 : 1,
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => { if (!isProcessing) { e.currentTarget.style.background = "#e2e8f0"; e.currentTarget.style.color = "#0f172a"; } }}
              onMouseLeave={(e) => { if (!isProcessing) { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#475569"; } }}
            >
              {cancelLabel}
            </button>
          )}
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            style={{
              flex: 1,
              padding: "0.875rem 1.5rem",
              borderRadius: "0.75rem",
              background: danger ? "#ef4444" : "#3b82f6",
              color: "white",
              fontWeight: 700,
              fontSize: "1rem",
              border: "none",
              cursor: isProcessing ? "not-allowed" : "pointer",
              opacity: isProcessing ? 0.6 : 1,
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem"
            }}
            onMouseEnter={(e) => { if (!isProcessing) e.currentTarget.style.background = danger ? "#dc2626" : "#2563eb"; }}
            onMouseLeave={(e) => { if (!isProcessing) e.currentTarget.style.background = danger ? "#ef4444" : "#3b82f6"; }}
          >
            {isProcessing ? "Processing..." : (confirmLabel || (variant === "alert" ? "OK" : "Confirm"))}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}