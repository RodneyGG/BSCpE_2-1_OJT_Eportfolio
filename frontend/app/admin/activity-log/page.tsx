"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "../../../lib/api";
import AppNavbar from "../../components/AppNavbar";
import ProtectedRoute from "../../components/ProtectedRoute";

interface LogUser {
  id: number;
  name: string;
  email: string;
}

interface ActivityLogEntry {
  id: number;
  actor_id: number;
  action: string;
  target_id: number | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  actor: LogUser | null;
  target: LogUser | null;
}

const ACTION_COLORS: Record<string, string> = {
  account_created: "#4ade80",
  account_deleted: "#f87171",
  account_deactivated: "#fbbf24",
  account_reactivated: "#4ade80",
  password_reset: "#60a5fa",
  review_permission_toggled: "#c084fc",
  account_setup_resent: "#94a3b8",
};

function formatTime(value: string): string {
  return new Date(value).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatDayHeading(value: string): string {
  const date = new Date(value);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  if (isSameDay(date, today)) return "TODAY";
  if (isSameDay(date, yesterday)) return "YESTERDAY";

  return date
    .toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
    .toUpperCase();
}

function dayKey(value: string): string {
  const date = new Date(value);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

// Renders a single log entry's action clause. `target` is null for
// account_deleted (cascadeOnDelete on the FK), so that branch reads
// from metadata instead.
function describeAction(entry: ActivityLogEntry): string {
  const targetName = entry.target?.name ?? "an account";
  const meta = entry.metadata ?? {};

  switch (entry.action) {
    case "account_created": {
      const role = (meta.created_role as string) ?? "account";
      const method = meta.setup_method === "email_link" ? "via email link" : "via temp password";
      return `created ${role} account for ${targetName} (${method})`;
    }
    case "account_deleted": {
      const role = (meta.deleted_role as string) ?? "account";
      const name = (meta.deleted_name as string) ?? "an account";
      const email = (meta.deleted_email as string) ?? "";
      const docsDeleted = typeof meta.documents_deleted === "number" ? meta.documents_deleted : 0;
      return `deleted ${role} account for ${name}${email ? ` (${email})` : ""} — ${docsDeleted} doc(s) removed`;
    }
    case "password_reset":
      return `reset password for ${targetName}`;
    case "review_permission_toggled": {
      const on = Boolean(meta.can_review);
      return `set review permission ${on ? "ON" : "OFF"} for ${targetName}`;
    }
    case "account_deactivated":
      return `deactivated ${targetName}'s account`;
    case "account_reactivated":
      return `reactivated ${targetName}'s account`;
    case "account_setup_resent":
      return `resent setup email to ${targetName}`;
    default:
      return `performed "${entry.action}" on ${targetName}`;
  }
}

export default function ActivityLogPage() {
  const [logs, setLogs] = useState<ActivityLogEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchApi("/admin/activity-logs")
      .then((data: ActivityLogEntry[]) => setLogs(data))
      .catch(() => setError("Failed to load activity log."));
  }, []);

  // Group already-sorted (newest-first) entries into day buckets, preserving order.
  const groups: { key: string; heading: string; entries: ActivityLogEntry[] }[] = [];
  if (logs) {
    for (const entry of logs) {
      const key = dayKey(entry.created_at);
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.key === key) {
        lastGroup.entries.push(entry);
      } else {
        groups.push({ key, heading: formatDayHeading(entry.created_at), entries: [entry] });
      }
    }
  }

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "var(--font-geist-sans, system-ui, sans-serif)" }}>
        <AppNavbar />
        <main style={{ maxWidth: 900, margin: "0 auto", padding: "2.5rem 2rem" }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.25rem 0", letterSpacing: "-0.02em" }}>
              Activity Log
            </h1>
            <p style={{ color: "#64748b", margin: 0, fontWeight: 500 }}>
              Recent admin actions across the system, most recent first.
            </p>
          </div>

          <div
            style={{
              background: "#0b1120",
              borderRadius: "1rem",
              padding: "1.5rem",
              boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
              fontFamily: 'ui-monospace, "SF Mono", "Cascadia Code", Menlo, Consolas, monospace',
              fontSize: "0.82rem",
              lineHeight: 1.7,
              overflowX: "auto",
            }}
          >
            <div style={{ color: "#4ade80", marginBottom: "1rem", opacity: 0.8 }}>
              $ tail -f activity.log
            </div>

            {error ? (
              <div style={{ color: "#f87171" }}>{error}</div>
            ) : logs === null ? (
              <div style={{ color: "#64748b" }}>loading...</div>
            ) : logs.length === 0 ? (
              <div style={{ color: "#64748b" }}>no activity recorded yet.</div>
            ) : (
              groups.map((group) => (
                <div key={group.key} style={{ marginBottom: "1.25rem" }}>
                  <div
                    style={{
                      color: "#475569",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      fontSize: "0.72rem",
                      marginBottom: "0.4rem",
                      borderBottom: "1px solid #1e293b",
                      paddingBottom: "0.3rem",
                    }}
                  >
                    ── {group.heading} ──
                  </div>
                  {group.entries.map((entry) => {
                    const color = ACTION_COLORS[entry.action] ?? "#e2e8f0";
                    return (
                      <div key={entry.id} style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                        <span style={{ color: "#64748b" }}>[{formatTime(entry.created_at)}]</span>{" "}
                        <span style={{ color: "#38bdf8", fontWeight: 600 }}>
                          {entry.actor?.name ?? "unknown"}
                        </span>{" "}
                        <span style={{ color: "#475569" }}>→</span>{" "}
                        <span style={{ color }}>{describeAction(entry)}</span>
                      </div>
                    );
                  })}
                </div>
              ))
            )}

            {logs && logs.length > 0 && (
              <div style={{ color: "#475569", marginTop: "0.5rem" }}>
                <span style={{ animation: "blink 1s step-start infinite" }}>_</span>
              </div>
            )}
          </div>

          <style>{`
            @keyframes blink {
              50% { opacity: 0; }
            }
          `}</style>
        </main>
      </div>
    </ProtectedRoute>
  );
}