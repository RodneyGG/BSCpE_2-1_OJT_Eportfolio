"use client";

import React from "react";
import ProgressBar from "./ProgressBar";
import StatusBadge from "./StatusBadge";

interface HoursProgressProps {
  currentHours: number;
  requiredHours: number;
  lastUpdated: string;
  dtrCount: number;
}

export default function HoursProgressCard({ currentHours, requiredHours, lastUpdated, dtrCount }: HoursProgressProps) {
  const percentage = requiredHours > 0 ? Math.min(100, Math.max(0, (currentHours / requiredHours) * 100)) : 0;
  const remaining = Math.max(0, requiredHours - currentHours);

  return (
    <div style={{
      background: "white", borderRadius: "1rem", padding: "1.5rem",
      border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
      height: "100%", display: "flex", flexDirection: "column"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
        <div>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#0f172a", margin: "0 0 0.25rem 0" }}>Hours Rendered</h2>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>Track your OJT hours progress</p>
        </div>
        <StatusBadge status={percentage >= 100 ? "complete" : percentage > 0 ? "pending" : "not_submitted"} />
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <span style={{ fontSize: "2.5rem", fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>{currentHours}</span>
          <span style={{ fontSize: "1rem", color: "#64748b", fontWeight: 600 }}>/ {requiredHours} Hours</span>
        </div>
        
        <ProgressBar current={currentHours} total={requiredHours} color="#3b82f6" height={12} />
        
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.75rem", fontSize: "0.85rem" }}>
          <span style={{ color: "#3b82f6", fontWeight: 700 }}>{percentage.toFixed(1)}%</span>
          <span style={{ color: "#64748b", fontWeight: 600 }}>{remaining} Hours Remaining</span>
        </div>
      </div>

      <div style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid #f1f5f9", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div>
          <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>DTRs Submitted</div>
          <div style={{ fontSize: "1rem", color: "#0f172a", fontWeight: 700 }}>{dtrCount}</div>
        </div>
        <div>
          <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>Last Updated</div>
          <div style={{ fontSize: "1rem", color: "#0f172a", fontWeight: 700 }}>{lastUpdated}</div>
        </div>
      </div>
    </div>
  );
}
