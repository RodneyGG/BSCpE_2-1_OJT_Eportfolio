"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function IconLock() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" ry="2" />
      <path d="M2 4l10 8 10-8" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    if (email === "student@university.edu.ph" && password === "password123") {
      setIsLoading(true);
      setTimeout(() => {
        router.push("/profile");
      }, 1000);
    } else if (email === "admin@university.edu.ph" && password === "admin123") {
      setIsLoading(true);
      setTimeout(() => {
        router.push("/admin");
      }, 1000);
    } else {
      alert("Invalid credentials. Please use the dummy account.");
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
      {/* Background pattern */}
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
            <IconLock />
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.5rem 0", letterSpacing: "-0.02em" }}>Welcome Back</h1>
          <p style={{ fontSize: "0.9rem", color: "#64748b", margin: 0 }}>Log in to your OJT E-Portfolio</p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginBottom: "2rem" }}>
            
            <div className="input-group">
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#475569", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Email Address</label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", transition: "color 0.2s" }}>
                  <IconMail />
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu.ph"
                  style={{ width: "100%", padding: "0.85rem 1rem 0.85rem 3rem", borderRadius: "0.75rem", border: "1px solid #cbd5e1", fontSize: "0.95rem", outline: "none", transition: "border-color 0.2s, box-shadow 0.2s", background: "#f8fafc" }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.boxShadow = "none"; }}
                  required 
                />
              </div>
            </div>

            <div className="input-group">
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#475569", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Password</label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", transition: "color 0.2s" }}>
                  <IconLock />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.5rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", fontWeight: 500, color: "#64748b", cursor: "pointer" }}>
                <input type="checkbox" style={{ transform: "scale(1.1)", cursor: "pointer" }} />
                Remember me
              </label>
              <Link href="#" style={{ fontSize: "0.85rem", fontWeight: 600, color: "#3b82f6", textDecoration: "none" }}>Forgot password?</Link>
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
            {isLoading ? "Logging In..." : "Log In"}
          </button>
          
          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <Link href="/" style={{ fontSize: "0.85rem", fontWeight: 600, color: "#64748b", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.4rem", transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = "#0f172a"} onMouseLeave={(e) => e.currentTarget.style.color = "#64748b"}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Back to Home
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
