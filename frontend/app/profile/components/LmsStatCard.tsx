"use client";

import React from "react";

export default function LmsStatCard({ title, value, subtitle, icon, color }: { title: string, value: string | number, subtitle?: string, icon?: React.ReactNode, color: string }) {
  return (
    <div style={{
      background: "white",
      borderRadius: "1rem",
      padding: "1.25rem",
      border: "1px solid #e2e8f0",
      display: "flex",
      alignItems: "center",
      gap: "1rem",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
    }}>
      {icon && (
        <div style={{
          width: "3rem", height: "3rem", borderRadius: "0.75rem",
          background: `${color}15`, color: color,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0
        }}>
          {icon}
        </div>
      )}
      <div>
        <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {title}
        </div>
        <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", marginTop: "0.25rem" }}>
          {value}
        </div>
        {subtitle && (
          <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.1rem" }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}
