import React, { createContext, useContext, useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
  login: (username: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  signup: (userData: any) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<Error | null>(null);

  // Query for the current user
  const {
    data: user,
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  useEffect(() => {
    if (queryError) {
      setError(queryError as Error);
    }
  }, [queryError]);

  const login = async (username: string, password: string) => {
    try {
      setError(null);
      const user = await apiRequest("/api/auth/login", {
        method: "POST",
        body: { username, password },
      });
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      return user;
    } catch (err: any) {
      setError(err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await apiRequest("/api/auth/logout", { method: "POST" });
      queryClient.setQueryData(["/api/auth/me"], null);
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    } catch (err: any) {
      setError(err);
      throw err;
    }
  };

  const signup = async (userData: any) => {
    try {
      setError(null);
      const user = await apiRequest("/api/auth/signup", {
        method: "POST",
        body: userData,
      });
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      return user;
    } catch (err: any) {
      setError(err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        logout,
        signup,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}