"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

interface ConfirmDialogProps {
  open: boolean;
  variant: "confirm" | "alert";
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  variant,
  title,
  message,
  confirmLabel,
  cancelLabel = "Cancel",
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!open || !mounted) return null;

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
        <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 0.6rem", color: "#0f172a" }}>
          {title || (variant === "alert" ? "Notice" : "Please Confirm")}
        </h3>
        <p style={{ fontSize: "0.85rem", color: "#475569", margin: "0 0 1.25rem", lineHeight: 1.5 }}>
          {message}
        </p>
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