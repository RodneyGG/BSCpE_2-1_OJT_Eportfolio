"use client";

import AppNavbar from "../components/AppNavbar";
import ProtectedRoute from "../components/ProtectedRoute";

export default function UserManualPage() {
  return (
    <ProtectedRoute>
      <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "var(--font-geist-sans, system-ui, sans-serif)" }}>
        <AppNavbar />
        <main style={{ maxWidth: 1400, margin: "0 auto", padding: "2.5rem 2rem", textAlign: "center" }}>
          <div style={{ marginTop: "4rem", color: "#64748b" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.5rem" }}>
              User Manual
            </h1>
            <p style={{ fontWeight: 500 }}>Coming soon.</p>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}