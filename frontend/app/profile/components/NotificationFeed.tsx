"use client";

import React, { useEffect, useState } from "react";
import { fetchApi } from "../../../lib/api";

interface Notification {
  id: number;
  title: string;
  message: string;
  created_at: string;
}

export default function NotificationFeed() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi('/notifications')
      .then(res => setNotifications(res.notifications || []))
      .catch(err => console.error("Failed to load notifications", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || notifications.length === 0) return null;

  return (
    <div style={{
      background: "white", borderRadius: "1rem", padding: "1.25rem",
      border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
      marginBottom: "2rem"
    }}>
      <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.05rem", color: "#0f172a", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        Recent Notifications
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {notifications.slice(0, 3).map(notif => (
          <div key={notif.id} style={{ padding: "0.75rem", background: "#f8fafc", borderRadius: "0.5rem", borderLeft: "4px solid #3b82f6" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.2rem" }}>
              <strong style={{ fontSize: "0.85rem", color: "#0f172a" }}>{notif.title}</strong>
              <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{new Date(notif.created_at).toLocaleDateString()}</span>
            </div>
            <div style={{ fontSize: "0.85rem", color: "#475569" }}>
              {notif.message}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
