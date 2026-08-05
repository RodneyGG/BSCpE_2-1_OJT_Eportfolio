"use client";

import { useEffect, useState } from "react";

export interface ToastMessage {
  id: number;
  text: string;
  tone: "success" | "error";
}

export function useToasts() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const pushToast = (text: string, tone: "success" | "error" = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, text, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  return { toasts, pushToast };
}

export default function ToastStack({ toasts }: { toasts: ToastMessage[] }) {
  return (
    <div style={{
      position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 100,
      display: "flex", flexDirection: "column", gap: "0.6rem",
      pointerEvents: "none",
    }}>
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}

function ToastItem({ toast }: { toast: ToastMessage }) {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div style={{
      pointerEvents: "auto",
      minWidth: 260, maxWidth: 360,
      background: toast.tone === "success" ? "#0f172a" : "#7f1d1d",
      color: "white",
      borderRadius: "0.75rem",
      padding: "0.85rem 1.1rem",
      fontSize: "0.85rem", fontWeight: 500,
      boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
      border: "1px solid rgba(255,255,255,0.1)",
      transform: entered ? "translateY(0)" : "translateY(16px)",
      opacity: entered ? 1 : 0,
      transition: "transform 0.25s ease, opacity 0.25s ease",
    }}>
      {toast.text}
    </div>
  );
}