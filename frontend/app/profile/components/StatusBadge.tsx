"use client";

import React from "react";

type Status = "approved" | "pending" | "rejected" | "not_submitted" | "complete" | "uploading" | "ongoing";

export default function StatusBadge({ status, label, small }: { status: Status, label?: string, small?: boolean }) {
  const map = {
    not_submitted: { bg: "#f1f5f9", color: "#64748b", label: "Not Submitted" },
    pending: { bg: "#fef9c3", color: "#a16207", label: "Pending Review" },
    approved: { bg: "#dcfce7", color: "#166534", label: "Approved" },
    rejected: { bg: "#fee2e2", color: "#b91c1c", label: "Rejected" },
    complete: { bg: "#dbeafe", color: "#1e40af", label: "Complete" },
    uploading: { bg: "#eff6ff", color: "#3b82f6", label: "Uploading..." },
    ongoing: { bg: "#e0f2fe", color: "#0369a1", label: "Ongoing" },
  };

  const s = map[status];
  if (!s) return null;

  return (
    <span style={{
      background: s.bg, 
      color: s.color, 
      padding: small ? "0.1rem 0.45rem" : "0.2rem 0.6rem", 
      borderRadius: "9999px", 
      fontSize: small ? "0.55rem" : "0.65rem", 
      fontWeight: 700, 
      textTransform: "uppercase", 
      letterSpacing: "0.05em",
      whiteSpace: "nowrap"
    }}>
      {label || s.label}
    </span>
  );
}
