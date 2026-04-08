import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";

export type Role = "student" | "instructor" | "admin";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  token: string;
  avatar?: string;
}

interface AuthContextType {
  role: Role;
  setRole: (role: Role) => void;
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>("student");
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from LocalStorage
  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      try {
        const parsedUser = JSON.parse(userInfo);
        setUser(parsedUser);
        setRole(parsedUser.role || "student");
      } catch (error) {
        console.error("Failed to parse userInfo", error);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    setRole(userData.role);
    localStorage.setItem("userInfo", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setRole("student"); // Reset to default
    localStorage.removeItem("userInfo");
  };

  const overrideRole = (newRole: Role) => {
    setRole(newRole); // Retain this for UI debugging component dropdowns without breaking
  };

  return (
    <AuthContext.Provider value={{ user, role, setRole: overrideRole, login, logout, isLoading }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
