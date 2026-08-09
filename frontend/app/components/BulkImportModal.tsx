"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
  const [importSource, setImportSource] = useState<"link" | "file">("link");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isDropzoneHover, setIsDropzoneHover] = useState(false);
  const [step, setStep] = useState<"input" | "preview" | "complete">("input");
  const [activeTab, setActiveTab] = useState<"valid" | "errors">("valid");
  const [loading, setLoading] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [importSummary, setImportSummary] = useState<{ created_count: number; skipped_count: number } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!isOpen || !mounted) return null;

  const handleReset = () => {
    setSheetUrl("");
    setImportSource("link");
    setCsvFile(null);
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
    if (importSource === "link" && !sheetUrl.trim()) {
      setError("Please paste a valid Google Sheet link.");
      return;
    }
    if (importSource === "file" && !csvFile) {
      setError("Please select a CSV file to upload.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let data;
      if (importSource === "link") {
        data = await fetchApi(
          `/admin/students/bulk-import/preview?url=${encodeURIComponent(sheetUrl.trim())}`
        );
      } else {
        const formData = new FormData();
        formData.append("csv", csvFile as File);
        data = await fetchApi("/admin/students/bulk-import/preview-file", {
          method: "POST",
          body: formData,
        });
      }
      setPreviewData(data);
      setStep("preview");
      if ((data.valid?.length ?? 0) === 0 && (data.errors?.length ?? 0) > 0) {
        setActiveTab("errors");
      } else {
        setActiveTab("valid");
      }
    } catch (err) {
      const e = err as { message?: string };
      setError(
        e.message ||
          (importSource === "link"
            ? "Failed to fetch sheet preview. Ensure the sheet is public or link is correct."
            : "Failed to parse CSV file. Ensure it has Name and Email columns.")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCommit = async () => {
    if (!previewData || previewData.valid.length === 0) return;

    setCommitting(true);
    setError(null);

    try {
      let res;
      if (importSource === "link") {
        res = await fetchApi("/admin/students/bulk-import/commit", {
          method: "POST",
          body: JSON.stringify({
            url: sheetUrl.trim(),
            students: previewData.valid,
          }),
        });
      } else {
        const formData = new FormData();
        formData.append("csv", csvFile as File);
        res = await fetchApi("/admin/students/bulk-import/commit-file", {
          method: "POST",
          body: formData,
        });
      }

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

  return createPortal(
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
      <div style={{ background: "#fff", borderRadius: "1rem", padding: "1.5rem", width: "100%", maxWidth: "36rem", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
        {/* Modal Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, color: "#0f172a" }}>
            {step === "input"
              ? importSource === "file"
                ? "Bulk Import Students from CSV File"
                : "Bulk Import Students from Google Sheets"
              : "Bulk Import Students"}
          </h3>
          <button onClick={handleClose} style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "#64748b" }}>
            ✕
          </button>
        </div>

        {/* STEP 1: Choose source, then input Google Sheet URL or upload a CSV */}
        {step === "input" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.5rem" }}>
              <button
                onClick={() => { setImportSource("link"); setError(null); }}
                style={{
                  padding: "0.5rem 1rem",
                  border: "none",
                  background: "none",
                  fontWeight: importSource === "link" ? 700 : 500,
                  color: importSource === "link" ? "#2563eb" : "#64748b",
                  borderBottom: importSource === "link" ? "2px solid #2563eb" : "none",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                }}
              >
                Google Sheet Link
              </button>
              <button
                onClick={() => { setImportSource("file"); setError(null); }}
                style={{
                  padding: "0.5rem 1rem",
                  border: "none",
                  background: "none",
                  fontWeight: importSource === "file" ? 700 : 500,
                  color: importSource === "file" ? "#2563eb" : "#64748b",
                  borderBottom: importSource === "file" ? "2px solid #2563eb" : "none",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                }}
              >
                Upload CSV File
              </button>
            </div>

            {importSource === "link" ? (
                <div key="link-source" style={{ display: "contents" }}>
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
                </div>
              ) : (
                <div key="file-source" style={{ display: "contents" }}>
                  <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0 }}>
                    Upload a CSV file directly. It should have Name and Email columns (flexible header names accepted).
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    <label htmlFor="csv-file-input" style={{ fontSize: "0.8rem", fontWeight: 600, color: "#334155" }}>CSV File</label>
                    <label
                      htmlFor="csv-file-input"
                      onMouseEnter={() => setIsDropzoneHover(true)}
                      onMouseLeave={() => setIsDropzoneHover(false)}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.5rem",
                        padding: "1.5rem 1rem",
                        borderRadius: "0.75rem",
                        border: `1.5px dashed ${isDropzoneHover || csvFile ? "#2563eb" : "#cbd5e1"}`,
                        background: isDropzoneHover ? "#eff6ff" : csvFile ? "#f8fafc" : "#fff",
                        cursor: "pointer",
                        textAlign: "center",
                        transition: "border-color 0.15s ease, background 0.15s ease",
                      }}
                    >
                      <span style={{ fontSize: "1.6rem", lineHeight: 1 }}>📎</span>
                      {csvFile ? (
                        <>
                          <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#0f172a" }}>{csvFile.name}</span>
                          <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Click to choose a different file</span>
                        </>
                      ) : (
                        <>
                          <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#334155" }}>Click to browse for a CSV file</span>
                          <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>.csv files only</span>
                        </>
                      )}
                      <input
                        id="csv-file-input"
                        type="file"
                        accept=".csv,text/csv"
                        onChange={(e) => setCsvFile(e.target.files?.[0] ?? null)}
                        style={{ display: "none" }}
                      />
                    </label>
                  </div>
                </div>
              )}

            {error && <div style={{ color: "#ef4444", fontSize: "0.8rem", background: "#fef2f2", padding: "0.6rem", borderRadius: "0.5rem", border: "1px solid #fecaca" }}>{error}</div>}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "0.5rem" }}>
              <button className="btn-action" onClick={handleClose}>
                Cancel
              </button>
              <button
                className="btn-action btn-approve"
                disabled={loading || (importSource === "link" ? !sheetUrl.trim() : !csvFile)}
                onClick={handleFetchPreview}
              >
                {loading
                  ? importSource === "link" ? "Fetching Sheet..." : "Parsing CSV..."
                  : importSource === "link" ? "Fetch Google Sheet" : "Parse CSV File"}
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
    </div>,
    document.body
  );
}