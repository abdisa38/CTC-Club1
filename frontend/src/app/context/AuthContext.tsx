import React, { createContext, useContext, useState, useEffect } from "react";
import apiService from "../services/api";

export type Role = "student" | "instructor" | "admin";

// Notice: Removed `token` because JWT is now securely stored in httpOnly cookie
export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  isPremium?: boolean;
  premiumActivatedAt?: string;
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        const currentUser = await apiService.getCurrentUser();
        setUser(currentUser);
        setRole(currentUser.role);
        localStorage.setItem("userInfo", JSON.stringify(currentUser));
      } catch (error: any) {
        const statusCode = Number(error?.response?.status || 0);
        const shouldUseLocalFallback = statusCode === 0;

        if (shouldUseLocalFallback) {
          const userInfo = localStorage.getItem("userInfo");
          if (userInfo) {
            try {
              const parsedUser = JSON.parse(userInfo);
              setUser(parsedUser);
              setRole(parsedUser.role || "student");
            } catch (parseError) {
              console.error("Failed to parse userInfo", parseError);
              localStorage.removeItem("userInfo");
            }
          }
        } else {
          setUser(null);
          setRole(null);
          localStorage.removeItem("userInfo");
        }
      } finally {
        setIsLoading(false);
      }
    };

    void bootstrapAuth();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    setRole(userData.role);
    localStorage.setItem("userInfo", JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      await apiService.logoutUser();
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
