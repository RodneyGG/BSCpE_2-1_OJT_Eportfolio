"use client";

import React, { useState } from "react";
import StatusBadge from "./StatusBadge";
import { DocItem } from "./DocumentCard";

interface SubmissionHistoryProps {
  documents: DocItem[];
  onView: (title: string, fileLink: string) => void;
}

export default function SubmissionHistoryTable({ documents, onView }: SubmissionHistoryProps) {
  const [filterPhase, setFilterPhase] = useState("all");
  
  // Sort documents by date, newest first. 
  // Assuming 'date' is a string we can parse, or we just sort as is if it's ISO.
  // We'll rely on the backend returning them sorted or we sort them here.
  const submittedDocs = documents.filter(d => d.status === "submitted");

  const filteredDocs = submittedDocs.filter(d => {
    if (filterPhase !== "all" && d.phase !== filterPhase) return false;
    return true;
  });

  return (
    <div style={{
      background: "white", borderRadius: "1rem", padding: "1.5rem",
      border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#0f172a", margin: "0 0 0.25rem 0" }}>Submission History</h2>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>Track all your uploaded documents and their statuses</p>
        </div>
        <div>
          <select 
            value={filterPhase} 
            onChange={(e) => setFilterPhase(e.target.value)}
            style={{ padding: "0.5rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1", fontSize: "0.85rem", outline: "none" }}
          >
            <option value="all">All Phases</option>
            <option value="before">Before OJT</option>
            <option value="during">During OJT</option>
            <option value="after">After OJT</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e2e8f0", color: "#64748b" }}>
              <th style={{ padding: "1rem 0.5rem", fontWeight: 600 }}>Document</th>
              <th style={{ padding: "1rem 0.5rem", fontWeight: 600 }}>Phase</th>
              <th style={{ padding: "1rem 0.5rem", fontWeight: 600 }}>Status</th>
              <th style={{ padding: "1rem 0.5rem", fontWeight: 600 }}>Submitted On</th>
              <th style={{ padding: "1rem 0.5rem", fontWeight: 600 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocs.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "#94a3b8" }}>
                  No submissions found.
                </td>
              </tr>
            ) : (
              filteredDocs.map((doc, idx) => (
                <tr key={`${doc.id}-${idx}`} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "1rem 0.5rem", fontWeight: 600, color: "#0f172a" }}>
                    {doc.name}
                    {/* @ts-ignore */}
                    {doc.week && <span style={{ marginLeft: "0.5rem", color: "#64748b", fontWeight: 500 }}>(Week {doc.week})</span>}
                  </td>
                  <td style={{ padding: "1rem 0.5rem", textTransform: "capitalize", color: "#475569" }}>
                    {doc.phase}
                  </td>
                  <td style={{ padding: "1rem 0.5rem" }}>
                    <StatusBadge status={doc.reviewStatus || "pending"} />
                  </td>
                  <td style={{ padding: "1rem 0.5rem", color: "#475569" }}>
                    {doc.date}
                  </td>
                  <td style={{ padding: "1rem 0.5rem" }}>
                    {doc.fileLink && (
                      <button 
                        onClick={() => onView(doc.name, doc.fileLink!)}
                        style={{ background: "transparent", border: "none", color: "#3b82f6", fontWeight: 600, cursor: "pointer" }}
                      >
                        View File
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
