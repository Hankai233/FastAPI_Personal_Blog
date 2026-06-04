"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "@/lib/api-client";
import { hasTokens, clearTokens } from "@/lib/auth";
import type { User } from "@/types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasTokens()) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then(setUser)
      .catch(clearTokens)
      .finally(() => setLoading(false));
  }, []);

  const logout = () => {
    clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
