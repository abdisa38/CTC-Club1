import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";

export type Role = "student" | "instructor" | "admin";

// Notice: Removed `token` because JWT is now securely stored in httpOnly cookie
export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

interface AuthContextType {
  role: Role | null;
  user: User | null;
  login: (userData: User) => void;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  // Optional: keep `isLoading` to true during token-validation if you add a /me endpoint later
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
    // Store non-sensitive metadata in localStorage. 
    // Actual Auth JWT is inside an HttpOnly cookie thanks to the backend.
    localStorage.setItem("userInfo", JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      // Hit backend logout point to clear the httpOnly cookie
      await api.post("/auth/logout");
    } catch(err) {
      console.error(err);
    }
    setUser(null);
    setRole(null);
    localStorage.removeItem("userInfo");
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, role, login, logout, isLoading }}>
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
