"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "../../lib/api";
import { useRole } from "../context/RoleContext";
import ProtectedRoute from "../components/ProtectedRoute";

function IconKey() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  );
}

export default function ChangePasswordPage() {
  const router = useRouter();
  const { user, login } = useRole();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) return;

    if (newPassword !== confirmPassword) {
      setErrorMsg("New passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMsg("New password must be at least 8 characters long.");
      return;
    }
    
    setIsLoading(true);
    setErrorMsg("");

    try {
      await fetchApi('/change-password', {
        method: 'POST',
        body: JSON.stringify({ 
          current_password: currentPassword, 
          new_password: newPassword,
          new_password_confirmation: confirmPassword 
        }),
      });

      // Update role context to remove must_change_password flag
      if (user) {
        login({
          ...user,
          must_change_password: false
        });
      }

      // Redirect to correct dashboard
      if (user?.role === 'admin' || user?.role === 'prof') {
        router.push("/admin");
      } else {
        router.push("/profile");
      }
    } catch (err: unknown) {
      const error = err as Error & { errors?: Record<string, string[]> };
      if (error.errors) {
        // Validation errors
        const firstError = Object.values(error.errors)[0] as string[];
        setErrorMsg(firstError[0]);
      } else {
        setErrorMsg(error.message || 'Failed to change password');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",
      fontFamily: "var(--font-geist-sans, system-ui, sans-serif)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "2rem", position: "relative"
    }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.05, backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px", pointerEvents: "none" }} />
      
      <div style={{
        background: "white", width: "100%", maxWidth: "420px",
        borderRadius: "1.5rem", padding: "2.5rem",
        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
        position: "relative", zIndex: 10,
        animation: "fadeSlideUp 0.6s ease forwards"
      }}>
        <style>{`
          @keyframes fadeSlideUp {
            from { opacity: 0; transform: translateY(24px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .input-group:focus-within svg { color: #3b82f6 !important; }
        `}</style>
        
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{
            width: 64, height: 64, background: "#eff6ff", borderRadius: "1rem",
            display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem",
            color: "#3b82f6", boxShadow: "0 8px 16px rgba(59,130,246,0.15)"
          }}>
            <IconKey />
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.5rem 0", letterSpacing: "-0.02em" }}>Change Password</h1>
          <p style={{ fontSize: "0.9rem", color: "#64748b", margin: 0 }}>
            {user?.must_change_password
              ? "Please update your default password."
              : "Update your account password."}
          </p>
        </div>

        {errorMsg && (
          <div style={{ background: "#fef2f2", color: "#ef4444", padding: "0.75rem", borderRadius: "0.5rem", fontSize: "0.85rem", marginBottom: "1.5rem", textAlign: "center", border: "1px solid #fca5a5" }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleChangePassword}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginBottom: "2rem" }}>
            
            <div className="input-group">
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#475569", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Current Password</label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", transition: "color 0.2s" }}>
                  <IconKey />
                </div>
                <input 
                  type="password" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ width: "100%", padding: "0.85rem 1rem 0.85rem 3rem", borderRadius: "0.75rem", border: "1px solid #cbd5e1", fontSize: "0.95rem", outline: "none", transition: "border-color 0.2s, box-shadow 0.2s", background: "#f8fafc" }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.boxShadow = "none"; }}
                  required 
                />
              </div>
            </div>

            <div className="input-group">
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#475569", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>New Password</label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", transition: "color 0.2s" }}>
                  <IconKey />
                </div>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ width: "100%", padding: "0.85rem 1rem 0.85rem 3rem", borderRadius: "0.75rem", border: "1px solid #cbd5e1", fontSize: "0.95rem", outline: "none", transition: "border-color 0.2s, box-shadow 0.2s", background: "#f8fafc" }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.boxShadow = "none"; }}
                  required 
                />
              </div>
            </div>

            <div className="input-group">
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#475569", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Confirm New Password</label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", transition: "color 0.2s" }}>
                  <IconKey />
                </div>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ width: "100%", padding: "0.85rem 1rem 0.85rem 3rem", borderRadius: "0.75rem", border: "1px solid #cbd5e1", fontSize: "0.95rem", outline: "none", transition: "border-color 0.2s, box-shadow 0.2s", background: "#f8fafc" }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.boxShadow = "none"; }}
                  required 
                />
              </div>
            </div>

          </div>

<button
            type="submit"
            disabled={isLoading}
            style={{ 
              width: "100%", background: isLoading ? "#94a3b8" : "#2563eb", color: "white", border: "none", 
              borderRadius: "0.75rem", padding: "1rem", fontSize: "1rem", fontWeight: 700, 
              cursor: isLoading ? "not-allowed" : "pointer", transition: "background 0.2s",
              boxShadow: isLoading ? "none" : "0 4px 12px rgba(37,99,235,0.2)"
            }}
          >
            {isLoading ? "Saving..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
    </ProtectedRoute>
  );
}