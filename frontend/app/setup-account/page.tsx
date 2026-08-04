"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

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

function IconCheck() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function SetupAccountForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid");
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  const missingParams = !uid || !token;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) return;

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      await fetchApi("/setup-account", {
        method: "POST",
        body: JSON.stringify({
          uid: Number(uid),
          token,
          password,
          password_confirmation: confirmPassword,
        }),
      });

      setSuccess(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setErrorMsg(error.message || "This setup link is invalid or has expired.");
    } finally {
      setIsLoading(false);
    }
  };

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
        animation: "fadeSlideUp 0.6s ease forwards"
      }}>
        <style>{`
          @keyframes fadeSlideUp {
            from { opacity: 0; transform: translateY(24px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .input-group:focus-within svg { color: #3b82f6 !important; }
        `}</style>

        {missingParams ? (
          <div style={{ textAlign: "center" }}>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.75rem" }}>Invalid Setup Link</h1>
            <p style={{ fontSize: "0.9rem", color: "#64748b" }}>This link is missing required information. Please use the link from your setup email, or contact your administrator for a new one.</p>
          </div>
        ) : success ? (
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: 64, height: 64, background: "#f0fdf4", borderRadius: "1rem",
              display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem",
              color: "#16a34a", boxShadow: "0 8px 16px rgba(22,163,74,0.15)"
            }}>
              <IconCheck />
            </div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.5rem 0" }}>Account Activated</h1>
            <p style={{ fontSize: "0.9rem", color: "#64748b", margin: 0 }}>Redirecting you to login...</p>
          </div>
        ) : (
          <>
            <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
              <div style={{
                width: 64, height: 64, background: "#eff6ff", borderRadius: "1rem",
                display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem",
                color: "#3b82f6", boxShadow: "0 8px 16px rgba(59,130,246,0.15)"
              }}>
                <IconLock />
              </div>
              <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.5rem 0", letterSpacing: "-0.02em" }}>Set Up Your Account</h1>
              <p style={{ fontSize: "0.9rem", color: "#64748b", margin: 0 }}>Choose a password to activate your OJT E-Portfolio account</p>
            </div>

            {errorMsg && (
              <div style={{ background: "#fef2f2", color: "#ef4444", padding: "0.75rem", borderRadius: "0.5rem", fontSize: "0.85rem", marginBottom: "1.5rem", textAlign: "center", border: "1px solid #fca5a5" }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginBottom: "2rem" }}>

                <div className="input-group">
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#475569", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>New Password</label>
                  <div style={{ position: "relative" }}>
                    <div style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", transition: "color 0.2s" }}>
                      <IconLock />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      style={{ width: "100%", padding: "0.85rem 3rem", borderRadius: "0.75rem", border: "1px solid #cbd5e1", fontSize: "0.95rem", outline: "none", transition: "border-color 0.2s, box-shadow 0.2s", background: "#f8fafc" }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)"; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.boxShadow = "none"; }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: "absolute", right: "0.5rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#64748b", cursor: "pointer", padding: "0.5rem" }}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div className="input-group">
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#475569", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Confirm Password</label>
                  <div style={{ position: "relative" }}>
                    <div style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", transition: "color 0.2s" }}>
                      <IconLock />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
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
                {isLoading ? "Activating..." : "Activate Account"}
              </button>

              <div style={{ textAlign: "center", marginTop: "2rem" }}>
                <Link href="/login" style={{ fontSize: "0.85rem", fontWeight: 600, color: "#64748b", textDecoration: "none" }}>
                  Already activated? Log in
                </Link>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function SetupAccountPage() {
  return (
    <Suspense fallback={null}>
      <SetupAccountForm />
    </Suspense>
  );
}