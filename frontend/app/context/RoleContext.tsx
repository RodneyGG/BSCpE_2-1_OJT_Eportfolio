"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export type Role = "normal" | "prof" | "admin";

interface User {
  id?: number;
  name: string;
  email: string;
  role: Role;
  company_id?: number | null;
  company?: any | null;
  must_change_password?: boolean;
}

interface AuthContextValue {
  role: Role;
  setRole: (role: Role) => void;
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  role: "normal",
  setRole: () => {},
  user: null,
  login: () => {},
  logout: () => {},
  isLoggedIn: false,
});

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("normal");
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("ojt_user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setRole(parsedUser.role);
      }
    } catch (e) {
      console.error("Failed to restore session from localStorage", e);
    }
    setIsInitialized(true);
  }, []);

  const login = (u: User) => {
    setUser(u);
    setRole(u.role);
    try {
      localStorage.setItem("ojt_user", JSON.stringify(u));
    } catch (e) {
      console.error("Failed to save session to localStorage", e);
    }
  };

  const logout = () => {
    setUser(null);
    setRole("normal");
    try {
      localStorage.removeItem("ojt_user");
    } catch (e) {
      console.error("Failed to remove session from localStorage", e);
    }
  };

  if (!isInitialized) return null; // Prevent hydration mismatch by waiting for mount

  return (
    <AuthContext.Provider value={{ role, setRole, user, login, logout, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useRole() {
  return useContext(AuthContext);
}
