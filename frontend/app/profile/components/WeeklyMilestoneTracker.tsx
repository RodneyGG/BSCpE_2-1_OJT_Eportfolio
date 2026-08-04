"use client";

import React, { useState, useMemo } from "react";
import DocumentCard, { DocItem } from "./DocumentCard";
import StatusBadge from "./StatusBadge";

interface WeeklyTrackerProps {
  documents: DocItem[]; // All "during" phase documents in the system
  requiredTypes: { id: string, title: string }[]; 
  onUpload: (id: string, file: File, week?: number) => void;
  onRemove: (id: string) => void;
  onView: (title: string, fileLink: string) => void;
}

export default function WeeklyMilestoneTracker({ documents, requiredTypes, onUpload, onRemove, onView }: WeeklyTrackerProps) {
  // Extract unique weeks that already exist in submissions
  const existingWeeks = useMemo(() => {
    const weeks = new Set<number>([1]); // Always show at least Week 1
    documents.forEach(d => {
      // @ts-expect-error week field not in typed Document interface
      if (d.week) weeks.add(d.week);
    });
    return Array.from(weeks).sort((a, b) => a - b);
  }, [documents]);

  const [activeWeek, setActiveWeek] = useState<number>(1);
  const [weeksArray, setWeeksArray] = useState<number[]>(existingWeeks);

  const handleAddWeek = () => {
    const nextWeek = Math.max(...weeksArray) + 1;
    setWeeksArray([...weeksArray, nextWeek]);
    setActiveWeek(nextWeek);
  };

  // Helper to get status of a specific week
  const getWeekStatus = (weekNum: number) => {
    // @ts-expect-error week field not in typed Document interface
    const weekDocs = documents.filter(d => d.week === weekNum);
    
    if (weekDocs.some(d => d.reviewStatus === "rejected")) return "rejected";
    if (weekDocs.some(d => d.reviewStatus === "pending")) return "pending";
    if (weekDocs.length >= requiredTypes.length && weekDocs.every(d => d.reviewStatus === "approved")) return "complete";
    if (weekDocs.length === 0) return "not_submitted";
    return "pending"; // Partially submitted
  };

  return (
    <div style={{ marginTop: "1rem" }}>
      {/* Week Navigation */}
      <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto", paddingBottom: "1rem", borderBottom: "1px solid #e2e8f0", marginBottom: "2rem" }}>
        {weeksArray.map(w => {
          const status = getWeekStatus(w);
          const isActive = activeWeek === w;
          return (
            <button
              key={w}
              onClick={() => setActiveWeek(w)}
              style={{
                padding: "0.6rem 1.25rem",
                borderRadius: "9999px",
                border: "none",
                background: isActive ? "#0f172a" : "#f1f5f9",
                color: isActive ? "white" : "#475569",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                transition: "all 0.2s",
                whiteSpace: "nowrap"
              }}
            >
              Week {w}
              {status === "complete" && <span style={{ color: isActive ? "#4ade80" : "#16a34a" }}>✓</span>}
              {status === "rejected" && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444" }} />}
              {status === "pending" && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#eab308" }} />}
            </button>
          );
        })}
        <button
          onClick={handleAddWeek}
          style={{
            padding: "0.6rem 1.25rem",
            borderRadius: "9999px",
            border: "1px dashed #cbd5e1",
            background: "transparent",
            color: "#64748b",
            fontSize: "0.85rem",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s",
            whiteSpace: "nowrap"
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#94a3b8"; e.currentTarget.style.color = "#334155"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.color = "#64748b"; }}
        >
          + Add Week
        </button>
      </div>

      {/* Week Content */}
      <div style={{ background: "#f8fafc", padding: "1.5rem", borderRadius: "1rem", border: "1px solid #e2e8f0" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "1.25rem", color: "#0f172a" }}>Week {activeWeek} Submissions</h3>
          <p style={{ margin: 0, color: "#64748b", fontSize: "0.9rem" }}>Upload your weekly requirements below.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
          {requiredTypes.map(req => {
            // @ts-expect-error week field not in typed Document interface
            let existingDoc = documents.find(d => d.week === activeWeek && d.name === req.title);
            
            if (!existingDoc) {
              existingDoc = {
                id: `${req.id}-week-${activeWeek}`,
                name: req.title,
                phase: "during",
                status: "pending",
                date: "",
                // @ts-expect-error week field not in typed Document interface
                week: activeWeek
              };
            }

            return (
              <DocumentCard 
                key={`${req.id}-w${activeWeek}`}
                doc={existingDoc as DocItem}
                onUpload={(id, file) => onUpload(existingDoc!.id, file, activeWeek)}
                onRemove={onRemove}
                onView={onView}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
