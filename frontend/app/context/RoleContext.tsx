"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type Role = "normal" | "prof" | "admin";

interface User {
  name: string;
  email: string;
  role: Role;
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

  const login = (u: User) => {
    setUser(u);
    setRole(u.role);
  };

  const logout = () => {
    setUser(null);
    setRole("normal");
  };

  return (
    <AuthContext.Provider value={{ role, setRole, user, login, logout, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useRole() {
  return useContext(AuthContext);
}
