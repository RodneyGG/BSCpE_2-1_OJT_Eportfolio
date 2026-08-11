"use client";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

interface HoursInputModalProps {
  open: boolean;
  isProcessing?: boolean;
  onCancel: () => void;
  onConfirm: (requiredHours: number, hoursRendered: number) => void;
}

export default function HoursInputModal({ open, isProcessing = false, onCancel, onConfirm }: HoursInputModalProps) {
  const [mounted, setMounted] = useState(false);
  const [requiredHoursStr, setRequiredHoursStr] = useState("");
  const [renderedHoursStr, setRenderedHoursStr] = useState("");

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (open) {
      setRequiredHoursStr("");
      setRenderedHoursStr("");
    }
  }, [open]);

  if (!open || !mounted) return null;

  const requiredHours = parseFloat(requiredHoursStr);
  const renderedHours = parseFloat(renderedHoursStr);
  const bothValid = !isNaN(requiredHours) && requiredHours > 0 && !isNaN(renderedHours) && renderedHours >= 0;
  const isShort = bothValid && renderedHours < requiredHours;

  return createPortal(
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}
      onClick={!isProcessing ? onCancel : undefined}
    >
      <div
        style={{ background: "#fff", borderRadius: "1.25rem", padding: "2.5rem 2rem", width: "100%", maxWidth: "28rem", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", display: "flex", flexDirection: "column" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ fontSize: "1.4rem", fontWeight: 800, margin: "0 0 0.5rem", color: "#0f172a" }}>Daily Attendance Report Hours</h3>
        <p style={{ fontSize: "0.95rem", color: "#64748b", margin: "0 0 1.5rem", lineHeight: 1.5 }}>
          Enter your company's required hours and your total hours rendered so far for your OJT.
        </p>

        <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "#334155", marginBottom: "0.4rem" }}>Company Required Hours</label>
        <input
          type="number" step="0.01" min="0"
          value={requiredHoursStr}
          onChange={(e) => setRequiredHoursStr(e.target.value)}
          placeholder="e.g. 240"
          style={{ padding: "0.75rem 1rem", borderRadius: "0.6rem", border: "1px solid #cbd5e1", fontSize: "1rem", marginBottom: "1.25rem", outline: "none", color: "#0f172a", fontWeight: 600 }}
        />

        <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "#334155", marginBottom: "0.4rem" }}>Total Hours Rendered</label>
        <input
          type="number" step="0.01" min="0"
          value={renderedHoursStr}
          onChange={(e) => setRenderedHoursStr(e.target.value)}
          placeholder="e.g. 180"
          style={{ padding: "0.75rem 1rem", borderRadius: "0.6rem", border: "1px solid #cbd5e1", fontSize: "1rem", marginBottom: "1rem", outline: "none", color: "#0f172a", fontWeight: 600 }}
        />

        {isShort && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "0.75rem", padding: "1rem", marginBottom: "1.5rem" }}>
            <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#991b1b", lineHeight: 1.5 }}>
              If this document is final and your hours completed hasn't reached your required hours, please contact your OJT Adviser.
            </span>
          </div>
        )}

        <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
          <button onClick={onCancel} disabled={isProcessing} style={{ padding: "0.875rem 1.5rem", borderRadius: "0.75rem", background: "#f1f5f9", color: "#475569", fontWeight: 700, fontSize: "1rem", border: "none", cursor: isProcessing ? "not-allowed" : "pointer" }}>
            Cancel
          </button>
          <button
            onClick={() => bothValid && onConfirm(requiredHours, renderedHours)}
            disabled={!bothValid || isProcessing}
            style={{ padding: "0.875rem 1.5rem", borderRadius: "0.75rem", background: bothValid ? "#3b82f6" : "#cbd5e1", color: "white", fontWeight: 700, fontSize: "1rem", border: "none", cursor: (!bothValid || isProcessing) ? "not-allowed" : "pointer" }}
          >
            {isProcessing ? "Submitting..." : "Proceed"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}