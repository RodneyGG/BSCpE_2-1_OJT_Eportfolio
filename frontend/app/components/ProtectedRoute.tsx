"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRole, Role } from "../context/RoleContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isInitialized, isLoggedIn, role } = useRole();
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (!isInitialized) return;

    if (!isLoggedIn) {
      router.replace("/login");
      return;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
      router.replace(role === "admin" ? "/admin" : (role === "prof" ? "/prof/review" : "/profile"));
      return;
    }

    setAuthChecked(true);
  }, [isInitialized, isLoggedIn, role, router, allowedRoles]);

  if (!isInitialized || !authChecked) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", color: "#64748b", fontSize: "0.9rem" }}>
        Checking access...
      </div>
    );
  }

  return <>{children}</>;
}
