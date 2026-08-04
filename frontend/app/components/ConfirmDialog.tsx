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
  onConfirm: () => void;
  onCancel: () => void;
}
function IconWarning() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
function IconSuccess() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
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
        position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200,
      }}
      onClick={onCancel}
    >
      <div
        style={{ background: "#fff", borderRadius: "1rem", padding: "1.5rem", width: "100%", maxWidth: "24rem", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 0.6rem", color: "#0f172a", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {tone && (
            <span style={{ color: tone.iconColor }}>
              {resolvedIcon === "warning" ? <IconWarning /> : <IconSuccess />}
            </span>
          )}
          {title || (variant === "alert" ? "Notice" : "Please Confirm")}
        </h3>
        <p style={{ fontSize: "0.85rem", color: "#475569", margin: highlight ? "0 0 0.9rem" : "0 0 1.25rem", lineHeight: 1.5 }}>
          {message}
        </p>
        {highlight && tone && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "0.6rem",
              background: tone.bg,
              border: `1px solid ${tone.border}`,
              borderLeft: `4px solid ${tone.borderLeft}`,
              borderRadius: "0.5rem",
              padding: "0.7rem 0.85rem",
              marginBottom: "1.25rem",
            }}
          >
            <span style={{ color: tone.borderLeft, marginTop: "0.1rem" }}>
              {resolvedIcon === "warning" ? <IconWarning /> : <IconSuccess />}
            </span>
            <span style={{ fontSize: "0.8rem", fontWeight: 600, color: tone.text, lineHeight: 1.4 }}>
              {highlight}
            </span>
          </div>
        )}
        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
          {variant === "confirm" && (
            <button className="btn-action" onClick={onCancel}>
              {cancelLabel}
            </button>
          )}
          <button
            className="btn-action"
            onClick={onConfirm}
            style={
              danger
                ? { background: "#fee2e2", borderColor: "#fecaca", color: "#991b1b" }
                : { background: "#dcfce7", borderColor: "#bbf7d0", color: "#166534" }
            }
          >
            {confirmLabel || (variant === "alert" ? "OK" : "Confirm")}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}