"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "../../lib/api";

interface StudentCompany {
  id: number;
  name: string;
}

interface PreviewStudent {
  id: number;
  name: string;
  company: StudentCompany | null;
  profile_picture?: string | null;
  hours_rendered: string | null;
  required_hours: number | null;
}

interface BlockInfo {
  id: number;
  block_code: string;
  block_name: string;
  adviser_name: string | null;
}

function formatHours(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "0.00";
  const num = typeof value === "number" ? value : parseFloat(value);
  return Number.isNaN(num) ? "0.00" : num.toFixed(2);
}

export default function StudentPreviewModal({
  student,
  onClose,
}: {
  student: PreviewStudent;
  onClose: () => void;
}) {
  const [block, setBlock] = useState<BlockInfo | null>(null);
  const [blockError, setBlockError] = useState(false);

  useEffect(() => {
    // Confirmed via curl: GET /api/block returns { "block": {...} }
    fetchApi("/block")
      .then((data: { block: BlockInfo }) => setBlock(data.block))
      .catch(() => setBlockError(true));
  }, []);

  const rendered = parseFloat(student.hours_rendered ?? "0");
  const required = typeof student.required_hours === "number" ? student.required_hours : 0;
  const isComplete = required > 0 && rendered >= required;

  return (
    <div
      style={{
        position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
        background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)",
        zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white", borderRadius: "1.5rem", width: "100%", maxWidth: "420px",
          overflow: "hidden", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: "2rem", textAlign: "center", borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={student.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&size=100&background=random&color=fff&bold=true`}
            alt={student.name}
            style={{ width: 80, height: 80, borderRadius: "50%", margin: "0 auto 1rem", border: "4px solid white", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", objectFit: "cover", objectPosition: "center" }}
          />
          <h2 style={{ margin: 0, fontSize: "1.35rem", fontWeight: 800, color: "#0f172a" }}>{student.name}</h2>
          <p style={{ margin: "0.25rem 0 0", color: "#64748b", fontSize: "0.85rem", fontWeight: 500 }}>
            {student.company?.name ?? "No company assigned yet"}
          </p>
        </div>

        <div style={{ padding: "1.5rem 2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 600 }}>OJT Status</span>
            <span
              style={{
                padding: "0.2rem 0.75rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700,
                color: isComplete ? "#166534" : "#92400e", background: isComplete ? "#dcfce7" : "#fef3c7",
              }}
            >
              {isComplete ? "Complete" : "In Progress"}
            </span>
          </div>
          <div style={{ fontSize: "0.85rem", color: "#0f172a", marginBottom: "1.25rem" }}>
            <span style={{ fontWeight: 700 }}>{formatHours(student.hours_rendered)}</span>
            <span style={{ color: "#64748b" }}> / {formatHours(student.required_hours)} hrs rendered</span>
          </div>

          <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "1rem" }}>
            <h3 style={{ fontSize: "0.75rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
              Adviser / Block
            </h3>
            {block ? (
              <div style={{ fontSize: "0.85rem", color: "#334155" }}>
                {block.block_name} ({block.block_code})
                {block.adviser_name ? ` · ${block.adviser_name}` : ""}
              </div>
            ) : (
              <div style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
                {blockError ? "Adviser info unavailable." : "Loading..."}
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: "1.25rem 2rem", background: "#f8fafc", borderTop: "1px solid #e2e8f0", textAlign: "right" }}>
          <button
            onClick={onClose}
            style={{ padding: "0.6rem 1.25rem", borderRadius: "0.5rem", background: "white", border: "1px solid #cbd5e1", color: "#475569", fontWeight: 600, cursor: "pointer" }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}