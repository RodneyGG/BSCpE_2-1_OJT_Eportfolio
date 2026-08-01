"use client";

import React from "react";
import StatusBadge from "./StatusBadge";

interface OjtDeploymentProps {
  companyName: string | null;
  companyAddress: string | null;
  ojtRole: string | null;
  ojtSupervisor: string | null;
  startDate: string | null;
  endDate: string | null;
  onEditToggle: () => void;
}

export default function OjtDeploymentCard({ companyName, companyAddress, ojtRole, ojtSupervisor, startDate, endDate, onEditToggle }: OjtDeploymentProps) {
  return (
    <div style={{
      background: "white", borderRadius: "1rem", padding: "1.5rem",
      border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
      height: "100%", display: "flex", flexDirection: "column"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#0f172a", margin: "0 0 0.25rem 0" }}>OJT Deployment</h2>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>Your current internship details</p>
        </div>
        <button 
          onClick={onEditToggle}
          style={{ background: "transparent", border: "none", color: "#3b82f6", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#2563eb"; e.currentTarget.style.textDecoration = "underline"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#3b82f6"; e.currentTarget.style.textDecoration = "none"; }}
        >
          Edit Details
        </button>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <InfoRow label="Assigned Company" value={companyName || "No company assigned yet."} />
        <InfoRow label="Company Address" value={companyAddress || "Not yet provided"} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <InfoRow label="OJT Supervisor" value={ojtSupervisor || "Not yet provided"} />
          <InfoRow label="Student Role" value={ojtRole || "Not yet provided"} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <InfoRow label="Start Date" value={startDate || "Not yet provided"} />
          <InfoRow label="End Date (Est.)" value={endDate || "Not yet provided"} />
        </div>
        
        <div style={{ marginTop: "auto", paddingTop: "1rem", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#475569" }}>Status</span>
          <StatusBadge status={companyName ? "approved" : "not_submitted"} />
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string, value: string }) {
  const isMissing = value === "Not yet provided" || value === "No company assigned yet.";
  return (
    <div>
      <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600, marginBottom: "0.2rem" }}>
        {label}
      </div>
      <div style={{ fontSize: "0.95rem", color: isMissing ? "#94a3b8" : "#0f172a", fontStyle: isMissing ? "italic" : "normal" }}>
        {value}
      </div>
    </div>
  );
}
