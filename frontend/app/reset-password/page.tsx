"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { fetchApi } from "../../lib/api";

function IconLock() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid");
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uid || !token) {
      setErrorMsg("This reset link is invalid or incomplete.");
      return;
    }
    if (password !== passwordConfirmation) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      await fetchApi("/reset-password", {
        method: "POST",
        body: JSON.stringify({
          uid: Number(uid),
          token,
          password,
          password_confirmation: passwordConfirmation,
        }),
      });
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || "This link is invalid or has expired.");
    } finally {
      setIsLoading(false);
    }
  };

  const linkIsMissing = !uid || !token;

  return (
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
      }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{
            width: 64, height: 64, background: "#eff6ff", borderRadius: "1rem",
            display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem",
            color: "#3b82f6", boxShadow: "0 8px 16px rgba(59,130,246,0.15)"
          }}>
            <IconLock />
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.5rem 0", letterSpacing: "-0.02em" }}>Reset Password</h1>
          <p style={{ fontSize: "0.9rem", color: "#64748b", margin: 0 }}>
            {success ? "Redirecting you to log in..." : "Choose a new password below."}
          </p>
        </div>

        {errorMsg && (
          <div style={{ background: "#fef2f2", color: "#ef4444", padding: "0.75rem", borderRadius: "0.5rem", fontSize: "0.85rem", marginBottom: "1.5rem", textAlign: "center", border: "1px solid #fca5a5" }}>
            {errorMsg}
          </div>
        )}

        {success ? (
          <div style={{ background: "#f0fdf4", color: "#166534", padding: "1rem", borderRadius: "0.75rem", fontSize: "0.9rem", textAlign: "center", border: "1px solid #bbf7d0" }}>
            Password reset successfully.
          </div>
        ) : linkIsMissing ? (
          <div style={{ background: "#fef2f2", color: "#ef4444", padding: "1rem", borderRadius: "0.75rem", fontSize: "0.9rem", textAlign: "center", border: "1px solid #fca5a5" }}>
            This reset link is invalid or incomplete. Please request a new one.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "1.25rem" }}>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#475569", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>New Password</label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>
                  <IconLock />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ width: "100%", padding: "0.85rem 3rem", borderRadius: "0.75rem", border: "1px solid #cbd5e1", fontSize: "0.95rem", outline: "none", background: "#f8fafc" }}
                  required
                  minLength={8}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "0.5rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#64748b", cursor: "pointer", padding: "0.5rem", fontSize: "0.85rem", fontWeight: 600 }}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: "2rem" }}>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#475569", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Confirm Password</label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>
                  <IconLock />
                </div>
                <input
                  type={showConfirmation ? "text" : "password"}
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  placeholder="••••••••"
                  style={{ width: "100%", padding: "0.85rem 3rem", borderRadius: "0.75rem", border: "1px solid #cbd5e1", fontSize: "0.95rem", outline: "none", background: "#f8fafc" }}
                  required
                  minLength={8}
                />
                <button 
                  type="button" 
                  onClick={() => setShowConfirmation(!showConfirmation)}
                  style={{ position: "absolute", right: "0.5rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#64748b", cursor: "pointer", padding: "0.5rem", fontSize: "0.85rem", fontWeight: 600 }}
                >
                  {showConfirmation ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: "100%", background: isLoading ? "#94a3b8" : "#2563eb", color: "white", border: "none",
                borderRadius: "0.75rem", padding: "1rem", fontSize: "1rem", fontWeight: 700,
                cursor: isLoading ? "not-allowed" : "pointer",
                boxShadow: isLoading ? "none" : "0 4px 12px rgba(37,99,235,0.2)"
              }}
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <Link href="/login" style={{ fontSize: "0.85rem", fontWeight: 600, color: "#64748b", textDecoration: "none" }}>
            Back to Log In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}