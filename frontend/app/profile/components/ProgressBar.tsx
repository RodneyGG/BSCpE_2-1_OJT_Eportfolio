"use client";

import React from "react";

export default function ProgressBar({ current, total, color = "#3b82f6", height = 8 }: { current: number, total: number, color?: string, height?: number }) {
  const percentage = total > 0 ? Math.min(100, Math.max(0, (current / total) * 100)) : 0;
  
  return (
    <div style={{ width: "100%", background: "#e2e8f0", borderRadius: "9999px", overflow: "hidden", height }}>
      <div 
        style={{ 
          height: "100%", 
          background: color, 
          width: `${percentage}%`,
          transition: "width 0.5s ease"
        }} 
      />
    </div>
  );
}
