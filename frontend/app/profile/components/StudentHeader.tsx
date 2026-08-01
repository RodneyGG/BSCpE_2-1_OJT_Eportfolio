"use client";

import React, { useState } from "react";

interface StudentHeaderProps {
  displayName: string;
  displayProgram: string;
  email: string;
  phone: string | null;
  studentNumber: string; // Wait, maybe it's not stored yet, but requested in design
  profilePic: string | null;
  onPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPhotoRemove: () => void;
  onEditToggle: () => void;
}

export default function StudentHeader({ displayName, displayProgram, email, phone, profilePic, onPhotoUpload, onPhotoRemove, onEditToggle }: StudentHeaderProps) {
  return (
    <div style={{
      background: "white", borderRadius: "1rem", padding: "2rem",
      border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
      display: "flex", gap: "2rem", alignItems: "center", position: "relative", overflow: "hidden"
    }}>
      {/* Background decoration */}
      <div style={{ position: "absolute", top: 0, right: 0, width: "300px", height: "100%", background: "linear-gradient(135deg, #3b82f610 0%, #6366f110 100%)", clipPath: "polygon(20% 0%, 100% 0%, 100% 100%, 0% 100%)" }} />
      
      <div style={{
        width: 100, height: 100, borderRadius: "50%", background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
        border: "4px solid white", display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 8px 16px rgba(0,0,0,0.1)", flexShrink: 0, fontSize: "2.5rem", fontWeight: 800, color: "white",
        position: "relative"
      }}>
        {!profilePic ? (
          displayName.split(" ").map(w => w[0]).slice(0, 2).join("")
        ) : (
          <img src={profilePic} alt="Profile" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
        )}
      </div>

      <div style={{ flex: 1, zIndex: 1 }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.25rem 0" }}>
          {displayName}
        </h1>
        <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
          <InfoItem label="Program" value={displayProgram} />
          <InfoItem label="Email" value={email} />
          <InfoItem label="Phone Number" value={phone || "Not yet provided"} />
        </div>
      </div>

      <div style={{ zIndex: 1 }}>
        <button 
          onClick={onEditToggle}
          style={{ background: "white", border: "1px solid #cbd5e1", padding: "0.5rem 1rem", borderRadius: "0.5rem", fontSize: "0.85rem", fontWeight: 600, color: "#334155", cursor: "pointer", transition: "all 0.2s" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.borderColor = "#94a3b8"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = "#cbd5e1"; }}
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string, value: string }) {
  return (
    <div>
      <div style={{ fontSize: "0.7rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700, marginBottom: "0.2rem" }}>
        {label}
      </div>
      <div style={{ fontSize: "0.9rem", color: "#1e293b", fontWeight: 500 }}>
        {value}
      </div>
    </div>
  );
}
