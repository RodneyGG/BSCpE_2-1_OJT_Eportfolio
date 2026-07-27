"use client";
import { useState, useEffect } from "react";
import { fetchApi } from "../../lib/api";

export default function CompanySelect({ value, onChange }: { value: string, onChange: (val: string) => void }) {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi('/companies')
      .then(data => {
        setCompanies(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch companies", err);
        setLoading(false);
      });
  }, []);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={loading}
      style={{
        width: "100%", padding: "0.75rem", borderRadius: "0.5rem",
        border: "1px solid #cbd5e1", fontSize: "0.9rem", outline: "none",
        background: "white"
      }}
    >
      <option value="">Select a company</option>
      {companies.map(c => (
        <option key={c.id} value={c.id}>{c.name}</option>
      ))}
    </select>
  );
}
