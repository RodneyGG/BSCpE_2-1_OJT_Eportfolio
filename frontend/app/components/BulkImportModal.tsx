"use client";

import { useState } from "react";
import { fetchApi } from "../../lib/api";

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface PreviewRow {
  row_num: number;
  name?: string;
  email?: string;
  company_name?: string;
  reason?: string;
}

interface PreviewData {
  valid: PreviewRow[];
  errors: PreviewRow[];
  summary: {
    total_rows: number;
    valid_count: number;
    error_count: number;
  };
}

export default function BulkImportModal({ isOpen, onClose, onSuccess }: BulkImportModalProps) {
  const [sheetUrl, setSheetUrl] = useState("");
  const [step, setStep] = useState<"input" | "preview" | "complete">("input");
  const [activeTab, setActiveTab] = useState<"valid" | "errors">("valid");
  const [loading, setLoading] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [importSummary, setImportSummary] = useState<{ created_count: number; skipped_count: number } | null>(null);

  if (!isOpen) return null;

  const handleReset = () => {
    setSheetUrl("");
    setStep("input");
    setActiveTab("valid");
    setLoading(false);
    setCommitting(false);
    setError(null);
    setPreviewData(null);
    setImportSummary(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleFetchPreview = async () => {
    if (!sheetUrl.trim()) {
      setError("Please paste a valid Google Sheet link.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchApi(
        `/admin/students/bulk-import/preview?url=${encodeURIComponent(sheetUrl.trim())}`
      );
      setPreviewData(data);
      setStep("preview");
      if ((data.valid?.length ?? 0) === 0 && (data.errors?.length ?? 0) > 0) {
        setActiveTab("errors");
      } else {
        setActiveTab("valid");
      }
    } catch (err) {
      const e = err as { message?: string };
      setError(e.message || "Failed to fetch sheet preview. Ensure the sheet is public or link is correct.");
    } finally {
      setLoading(false);
    }
  };

  const handleCommit = async () => {
    if (!previewData || previewData.valid.length === 0) return;

    setCommitting(true);
    setError(null);

    try {
      const res = await fetchApi("/admin/students/bulk-import/commit", {
        method: "POST",
        body: JSON.stringify({
          url: sheetUrl.trim(),
          students: previewData.valid,
        }),
      });

      setImportSummary({
        created_count: res.summary?.created_count ?? previewData.valid.length,
        skipped_count: res.summary?.skipped_count ?? previewData.errors.length,
      });
      setStep("complete");
      onSuccess();
    } catch (err) {
      const e = err as { message?: string };
      setError(e.message || "Failed to commit import.");
    } finally {
      setCommitting(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
      <div style={{ background: "#fff", borderRadius: "1rem", padding: "1.5rem", width: "100%", maxWidth: "36rem", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
        {/* Modal Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, color: "#0f172a" }}>
            Bulk Import Students from Google Sheets
          </h3>
          <button onClick={handleClose} style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "#64748b" }}>
            ✕
          </button>
        </div>

        {/* STEP 1: Input Google Sheet URL */}
        {step === "input" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0 }}>
              Paste the full Google Sheet link below to fetch student records for verification before importing.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#334155" }}>Google Sheet URL</label>
              <input
                type="url"
                placeholder="https://docs.google.com/spreadsheets/d/your-sheet-id/edit"
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                style={{ padding: "0.6rem 0.8rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1", fontSize: "0.85rem", width: "100%" }}
              />
            </div>

            {error && <div style={{ color: "#ef4444", fontSize: "0.8rem", background: "#fef2f2", padding: "0.6rem", borderRadius: "0.5rem", border: "1px solid #fecaca" }}>{error}</div>}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "0.5rem" }}>
              <button className="btn-action" onClick={handleClose}>
                Cancel
              </button>
              <button className="btn-action btn-approve" disabled={loading || !sheetUrl.trim()} onClick={handleFetchPreview}>
                {loading ? "Fetching Sheet..." : "Fetch Google Sheet"}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Preview Data & Tabs */}
        {step === "preview" && previewData && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", flex: 1, overflow: "hidden" }}>
            {/* Tabs Header */}
            <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.5rem" }}>
              <button
                onClick={() => setActiveTab("valid")}
                style={{
                  padding: "0.5rem 1rem",
                  border: "none",
                  background: "none",
                  fontWeight: activeTab === "valid" ? 700 : 500,
                  color: activeTab === "valid" ? "#2563eb" : "#64748b",
                  borderBottom: activeTab === "valid" ? "2px solid #2563eb" : "none",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                }}
              >
                Valid Records ({previewData.valid.length})
              </button>
              <button
                onClick={() => setActiveTab("errors")}
                style={{
                  padding: "0.5rem 1rem",
                  border: "none",
                  background: "none",
                  fontWeight: activeTab === "errors" ? 700 : 500,
                  color: activeTab === "errors" ? "#dc2626" : "#64748b",
                  borderBottom: activeTab === "errors" ? "2px solid #dc2626" : "none",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                }}
              >
                Skipped / Errors ({previewData.errors.length})
              </button>
            </div>

            {/* Tab Contents */}
            <div style={{ overflowY: "auto", flex: 1, border: "1px solid #f1f5f9", borderRadius: "0.5rem", maxHeight: "300px" }}>
              {activeTab === "valid" ? (
                previewData.valid.length === 0 ? (
                  <div style={{ padding: "1.5rem", textAlign: "center", color: "#64748b", fontSize: "0.85rem" }}>No valid rows found to import.</div>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem", textAlign: "left" }}>
                    <thead>
                      <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                        <th style={{ padding: "0.5rem" }}>Row</th>
                        <th style={{ padding: "0.5rem" }}>Name</th>
                        <th style={{ padding: "0.5rem" }}>Email</th>
                        <th style={{ padding: "0.5rem" }}>Company</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.valid.map((row) => (
                        <tr key={row.row_num} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "0.5rem", color: "#94a3b8" }}>#{row.row_num}</td>
                          <td style={{ padding: "0.5rem", fontWeight: 600 }}>{row.name}</td>
                          <td style={{ padding: "0.5rem", color: "#475569" }}>{row.email}</td>
                          <td style={{ padding: "0.5rem", color: "#475569" }}>{row.company_name || "Unassigned"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              ) : previewData.errors.length === 0 ? (
                <div style={{ padding: "1.5rem", textAlign: "center", color: "#64748b", fontSize: "0.85rem" }}>No errors found! All rows passed validation.</div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem", textAlign: "left" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                      <th style={{ padding: "0.5rem" }}>Row</th>
                      <th style={{ padding: "0.5rem" }}>Data</th>
                      <th style={{ padding: "0.5rem" }}>Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.errors.map((row) => (
                      <tr key={row.row_num} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "0.5rem", color: "#94a3b8" }}>#{row.row_num}</td>
                        <td style={{ padding: "0.5rem" }}>{row.email || row.name || "Invalid row"}</td>
                        <td style={{ padding: "0.5rem", color: "#dc2626", fontWeight: 500 }}>{row.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {error && <div style={{ color: "#ef4444", fontSize: "0.8rem" }}>{error}</div>}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.5rem" }}>
              <button className="btn-action" onClick={() => setStep("input")}>
                ← Change Link
              </button>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button className="btn-action" onClick={handleClose}>
                  Cancel
                </button>
                <button
                  className="btn-action btn-approve"
                  disabled={committing || previewData.valid.length === 0}
                  onClick={handleCommit}
                >
                  {committing ? "Importing..." : `Confirm Import (${previewData.valid.length} Students)`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Completion Screen */}
        {step === "complete" && importSummary && (
          <div style={{ textAlign: "center", padding: "1rem 0" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🎉</div>
            <h4 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a", margin: "0 0 0.5rem" }}>
              Import Completed
            </h4>
            <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "1.5rem" }}>
              Successfully created <strong>{importSummary.created_count}</strong> student account(s). Setup emails have been queued.
            </p>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <button className="btn-action btn-approve" onClick={handleClose}>
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}