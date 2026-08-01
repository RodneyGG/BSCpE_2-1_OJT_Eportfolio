"use client";

import React, { useState } from "react";
import StatusBadge from "./StatusBadge";

export interface DocItem {
  id: string;
  name: string;
  phase: string;
  status: string; // 'pending' | 'uploading' | 'submitted'
  date: string;
  fileLink?: string;
  reviewStatus?: "pending" | "approved" | "rejected";
  rejectionReason?: string | null;
}

interface DocumentCardProps {
  doc: DocItem;
  onUpload: (id: string, file: File) => void;
  onRemove: (id: string) => void;
  onView: (title: string, fileLink: string) => void;
}

export default function DocumentCard({ doc, onUpload, onRemove, onView }: DocumentCardProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type !== "application/pdf") {
        alert("Only PDF files are allowed.");
        return;
      }
      onUpload(doc.id, file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== "application/pdf") {
        alert("Only PDF files are allowed.");
        return;
      }
      onUpload(doc.id, file);
    }
  };

  return (
    <div style={{
      background: "white",
      borderRadius: "1rem",
      border: `1px solid ${doc.reviewStatus === "rejected" ? "#fca5a5" : "#e2e8f0"}`,
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column"
    }}>
      {/* Header Info */}
      <div style={{ padding: "1.25rem", borderBottom: "1px solid #f1f5f9", flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
          <div>
            <h3 style={{ margin: "0 0 0.4rem 0", fontSize: "1.05rem", color: "#0f172a" }}>{doc.name}</h3>
            {doc.status === "submitted" ? (
              <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                Uploaded: <strong>{doc.date}</strong>
              </div>
            ) : (
              <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Required Document</div>
            )}
          </div>
          <div>
            {doc.status === "submitted" ? (
              <StatusBadge status={doc.reviewStatus || "pending"} />
            ) : doc.status === "uploading" ? (
              <StatusBadge status="uploading" />
            ) : (
              <StatusBadge status="not_submitted" />
            )}
          </div>
        </div>

        {/* Rejection Feedback */}
        {doc.reviewStatus === "rejected" && doc.rejectionReason && (
          <div style={{ marginTop: "1rem", padding: "0.75rem", background: "#fef2f2", borderRadius: "0.5rem", borderLeft: "4px solid #ef4444" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#b91c1c", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>
              Professor Feedback
            </div>
            <div style={{ fontSize: "0.85rem", color: "#991b1b" }}>
              {doc.rejectionReason}
            </div>
          </div>
        )}
      </div>

      {/* Action Area */}
      <div style={{ padding: "1rem 1.25rem", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {doc.status === "submitted" ? (
          <div style={{ display: "flex", gap: "1rem", width: "100%" }}>
            {doc.fileLink && (
              <button 
                onClick={() => onView(doc.name, doc.fileLink!)} 
                style={{ flex: 1, background: "white", border: "1px solid #cbd5e1", color: "#334155", padding: "0.6rem", borderRadius: "0.5rem", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.borderColor = "#94a3b8"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = "#cbd5e1"; }}
              >
                View File
              </button>
            )}
            <button 
              onClick={() => onRemove(doc.id)} 
              style={{ flex: 1, background: "white", border: "1px solid #fca5a5", color: "#ef4444", padding: "0.6rem", borderRadius: "0.5rem", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#fef2f2"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "white"; }}
            >
              Replace
            </button>
          </div>
        ) : doc.status === "uploading" ? (
          <div style={{ padding: "0.6rem", color: "#64748b", fontSize: "0.85rem", fontWeight: 500, textAlign: "center", width: "100%" }}>
            Please wait...
          </div>
        ) : (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            style={{
              position: "relative",
              width: "100%",
              background: dragActive ? "#eff6ff" : "white",
              border: `2px dashed ${dragActive ? "#3b82f6" : "#cbd5e1"}`,
              borderRadius: "0.5rem", 
              padding: "1rem",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              cursor: "pointer", transition: "all 0.2s"
            }}
          >
            <input
              type="file"
              accept="application/pdf"
              onChange={handleChange}
              style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%" }}
            />
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={dragActive ? "#3b82f6" : "#94a3b8"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "0.5rem" }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: dragActive ? "#3b82f6" : "#64748b" }}>
              {dragActive ? "Drop PDF here" : "Drag & Drop or Browse"}
            </span>
            <span style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: "0.2rem" }}>
              PDF max 10MB
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
