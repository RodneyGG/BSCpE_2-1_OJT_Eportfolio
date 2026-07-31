"use client";

import AppNavbar from "../components/AppNavbar";

export default function HelpPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", display: "flex", flexDirection: "column" }}>
      <AppNavbar />
      <main style={{ maxWidth: 800, margin: "0 auto", padding: "4rem 2rem", flex: 1, textAlign: "center" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.75rem" }}>Help &amp; Docs</h1>
        <p style={{ color: "#64748b", fontSize: "0.95rem" }}>
          This section is coming soon. In the meantime, use &quot;Report a Bug&quot; in the profile menu if something isn&apos;t working.
        </p>
      </main>
    </div>
  );
}