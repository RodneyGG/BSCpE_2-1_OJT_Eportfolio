export type DocStatus = "approved" | "pending" | "rejected" | "none";

export const STATUS_CFG: Record<DocStatus, { bg: string; color: string; label: string }> = {
  approved: { bg: "#dcfce7", color: "#166534", label: "Approved" },
  pending: { bg: "#fef9c3", color: "#a16207", label: "Under Review" },
  rejected: { bg: "#fee2e2", color: "#b91c1c", label: "Rejected" },
  none: { bg: "#f1f5f9", color: "#94a3b8", label: "Not Submitted" },
};

export default function StatusIcon({ status }: { status: DocStatus }) {
  const cfg = STATUS_CFG[status];
  if (status === "none") {
    return <span className="ck-icon-blank" title={cfg.label}>—</span>;
  }
  return (
    <span className="ck-icon" style={{ background: cfg.bg, color: cfg.color }} title={cfg.label}>
      {status === "approved" && (
        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 13l4 4L19 7" />
        </svg>
      )}
      {status === "pending" && (
        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3.2 2" />
        </svg>
      )}
      {status === "rejected" && (
        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      )}
    </span>
  );
}