"use client";
import { useEffect, useState } from "react";
import { fetchApi } from "../../lib/api";
import { useRole } from "../context/RoleContext";
import ConfirmDialog from "./ConfirmDialog";
export interface ManagedUser {
  id: number;
  name: string;
  email: string;
  role: "normal" | "prof" | "admin";
  company_id: number | null;
  must_change_password: boolean;
  can_review: boolean;
  is_active: boolean;
  created_at: string;
}
function IconPlus() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
interface ManageUsersSectionProps {
  onViewStudent?: (user: ManagedUser) => void;
  onCountChange?: (count: number) => void;
}
interface DialogState {
  variant: "confirm" | "alert";
  message: string;
  danger?: boolean;
  resolve: (value: boolean) => void;
}
export default function ManageUsersSection({ onViewStudent, onCountChange }: ManageUsersSectionProps) {
  const { role } = useRole();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createRole, setCreateRole] = useState<"normal" | "admin">("normal");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [revealPassword, setRevealPassword] = useState<{ email: string; password: string } | null>(null);
  const showConfirm = (message: string, danger = false): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialog({ variant: "confirm", message, danger, resolve });
    });
  };
  const showAlert = (message: string): Promise<void> => {
    return new Promise((resolve) => {
      setDialog({ variant: "alert", message, resolve: () => resolve() });
    });
  };
  const handleDialogConfirm = () => {
    dialog?.resolve(true);
    setDialog(null);
  };
  const handleDialogCancel = () => {
    dialog?.resolve(false);
    setDialog(null);
  };
  const loadUsers = () => {
    setLoading(true);
    setError(null);
    fetchApi("/admin/users")
      .then((data: ManagedUser[]) => setUsers(data))
      .catch(() => setError("Failed to load users."))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    loadUsers();
  }, []);
  useEffect(() => {
    onCountChange?.(users.filter((u) => u.role === "normal").length);
  }, [users, onCountChange]);
  const openCreate = () => {
    setCreateName("");
    setCreateEmail("");
    setCreateRole("normal");
    setCreateError(null);
    setShowCreate(true);
  };
  const submitCreate = async () => {
    if (!createName.trim() || !createEmail.trim()) {
      setCreateError("Name and email are required.");
      return;
    }
    setCreating(true);
    setCreateError(null);
    try {
      const data = await fetchApi("/admin/users", {
        method: "POST",
        body: JSON.stringify({
          name: createName.trim(),
          email: createEmail.trim(),
          role: createRole,
        }),
      });
      setShowCreate(false);
      setRevealPassword({ email: data.user.email, password: data.temp_password });
      loadUsers();
    } catch (err) {
      const e = err as { message?: string };
      setCreateError(e.message || "Failed to create account.");
    } finally {
      setCreating(false);
    }
  };
  const handleResetPassword = async (user: ManagedUser) => {
    const ok = await showConfirm(`Reset password for ${user.name}? This will invalidate their current password.`);
    if (!ok) return;
    setBusyId(user.id);
    try {
      const data = await fetchApi(`/admin/users/${user.id}/reset-password`, { method: "PATCH" });
      setRevealPassword({ email: user.email, password: data.temp_password });
    } catch {
      await showAlert("Failed to reset password.");
    } finally {
      setBusyId(null);
    }
  };
  const handleToggleActive = async (user: ManagedUser) => {
    const ok = await showConfirm(
      `${user.is_active ? "Deactivate" : "Reactivate"} ${user.name}?`,
      user.is_active
    );
    if (!ok) return;
    const action = user.is_active ? "deactivate" : "reactivate";
    setBusyId(user.id);
    try {
      await fetchApi(`/admin/users/${user.id}/${action}`, { method: "PATCH" });
      loadUsers();
    } catch {
      await showAlert(`Failed to ${action} account.`);
    } finally {
      setBusyId(null);
    }
  };
  const handleToggleReview = async (user: ManagedUser) => {
    setBusyId(user.id);
    try {
      await fetchApi(`/admin/users/${user.id}/toggle-review`, { method: "PATCH" });
      loadUsers();
    } catch {
      await showAlert("Failed to update review permission.");
    } finally {
      setBusyId(null);
    }
  };
  const handleResendSetup = async (user: ManagedUser) => {
    const ok = await showConfirm(`Resend the account setup email to ${user.name} (${user.email})?`);
    if (!ok) return;
    setBusyId(user.id);
    try {
      await fetchApi(`/admin/users/${user.id}/resend-setup`, { method: "POST" });
      await showAlert(`Setup email resent to ${user.email}.`);
    } catch (err) {
      const e = err as { message?: string };
      await showAlert(e.message || "Failed to resend setup email.");
    } finally {
      setBusyId(null);
    }
  };
  return (
    <div className="admin-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>Manage Users</h2>
        <button className="btn-action btn-approve" onClick={openCreate} style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
          <IconPlus /> Create Account
        </button>
      </div>
      {loading ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>Loading...</div>
      ) : error ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "#ef4444" }}>{error}</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {users.map((user) => (
            <div
              key={user.id}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "1rem",
                padding: "1rem",
                opacity: user.is_active ? 1 : 0.55,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a" }}>
                    {user.name}{" "}
                    <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>
                      {user.role}
                    </span>
                    {!user.is_active && (
                      <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#991b1b", background: "#fee2e2", padding: "0.1rem 0.5rem", borderRadius: "999px", marginLeft: "0.4rem" }}>
                        Deactivated
                      </span>
                    )}
                    {user.role === "admin" && user.can_review && (
                      <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#065f46", background: "#d1fae5", padding: "0.1rem 0.5rem", borderRadius: "999px", marginLeft: "0.4rem" }}>
                        Can Review
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.2rem" }}>{user.email}</div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0, flexWrap: "wrap" }}>
                  {user.role === "normal" && onViewStudent && (
                    <button className="btn-action" disabled={busyId === user.id} onClick={() => onViewStudent(user)}>
                      View Details
                    </button>
                  )}
                  <button className="btn-action" disabled={busyId === user.id} onClick={() => handleResetPassword(user)}>
                    Reset Password
                  </button>
                  {role === "prof" && user.role === "admin" && (
                    <button className="btn-action" disabled={busyId === user.id} onClick={() => handleToggleReview(user)}>
                      {user.can_review ? "Revoke Review" : "Grant Review"}
                    </button>
                  )}
                  {!user.is_active && user.role === "normal" ? (
                    <button
                      className="btn-action"
                      disabled={busyId === user.id}
                      onClick={() => handleResendSetup(user)}
                      style={{ background: "#dbeafe", borderColor: "#bfdbfe", color: "#1e40af" }}
                    >
                      Resend Setup Email
                    </button>
                  ) : (
                    <button
                      className="btn-action"
                      disabled={busyId === user.id}
                      onClick={() => handleToggleActive(user)}
                      style={
                        user.is_active
                          ? { background: "#fee2e2", borderColor: "#fecaca", color: "#991b1b" }
                          : { background: "#d1fae5", borderColor: "#a7f3d0", color: "#065f46" }
                      }
                    >
                      {user.is_active ? "Deactivate" : "Reactivate"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {showCreate && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{ background: "#fff", borderRadius: "1rem", padding: "1.5rem", width: "100%", maxWidth: "26rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 1rem" }}>Create Account</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <input
                type="text"
                placeholder="Full name"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                style={{ padding: "0.6rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
              />
              <input
                type="email"
                placeholder="Email"
                value={createEmail}
                onChange={(e) => setCreateEmail(e.target.value)}
                style={{ padding: "0.6rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
              />
              <select
                value={createRole}
                onChange={(e) => setCreateRole(e.target.value as "normal" | "admin")}
                style={{ padding: "0.6rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
              >
                <option value="normal">Student</option>
                <option value="admin">Admin</option>
              </select>
              {createError && <div style={{ color: "#ef4444", fontSize: "0.8rem" }}>{createError}</div>}
              <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", marginTop: "0.5rem" }}>
                <button className="btn-action" onClick={() => setShowCreate(false)}>
                  Cancel
                </button>
                <button className="btn-action btn-approve" disabled={creating} onClick={submitCreate}>
                  {creating ? "Creating..." : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {revealPassword && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{ background: "#fff", borderRadius: "1rem", padding: "1.5rem", width: "100%", maxWidth: "26rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 0.5rem" }}>Temporary Password</h3>
            <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "0 0 1rem" }}>
              Copy this now — it won&apos;t be shown again. Share it securely with <strong>{revealPassword.email}</strong>.
            </p>
            <div style={{ background: "#f1f5f9", borderRadius: "0.5rem", padding: "0.8rem", fontFamily: "monospace", fontSize: "1rem", textAlign: "center", letterSpacing: "0.05em" }}>
              {revealPassword.password}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
              <button className="btn-action btn-approve" onClick={() => setRevealPassword(null)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog
        open={dialog !== null}
        variant={dialog?.variant ?? "confirm"}
        message={dialog?.message ?? ""}
        danger={dialog?.danger}
        onConfirm={handleDialogConfirm}
        onCancel={handleDialogCancel}
      />
    </div>
  );
}