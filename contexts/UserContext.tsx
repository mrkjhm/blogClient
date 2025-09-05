"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { User } from "@/types/user";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
const TOKEN_KEY = "accessToken";
const REFRESH_KEY = "refreshToken"

// Types


interface UserContextType {
  user: User | null;
  isLoadingUser: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, avatar: File) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

// Create context
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider
export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    setUser(null);
    console.log("🔓 Logged out, tokens cleared");
  };

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/api/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      let message = res.statusText || "Login failed";
      try {
        const err = await res.json();
        if (err && typeof err === "object" && "message" in err) {
          message = (err as { message?: string }).message || message;
        }
      } catch { void 0 }
      throw new Error(message);
    }

    const data = await res.json();

    if (data.accessToken) localStorage.setItem(TOKEN_KEY, data.accessToken);
    if (data.refreshToken) localStorage.setItem(REFRESH_KEY, data.refreshToken);
    if (data.user) setUser(data.user);
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    avatarUrl: File
  ) => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("avatarUrl", avatarUrl);

    const res = await fetch(`${API_URL}/api/users/register`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Registration failed")
    }

    await login(email, password);


    const data = await res.json();
    if (data.accessToken) localStorage.setItem(TOKEN_KEY, data.accessToken);
    if (data.refreshToken) localStorage.setItem(REFRESH_KEY, data.refreshToken);
    if (data) setUser(data); // depends if your response includes user
  }


  const refreshAccessToken = async (): Promise<string | null> => {
    const refreshToken = localStorage.getItem(REFRESH_KEY);
    if (!refreshToken) return null;

    try {
      const res = await fetch(`${API_URL}/api/users/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) throw new Error("Refresh token invalid");

      const data = await res.json();
      localStorage.setItem(TOKEN_KEY, data.accessToken);
      localStorage.setItem(REFRESH_KEY, data.refreshToken); // Optional, in case it rotated
      return data.accessToken;
    } catch (err) {
      console.error("⚠️ Failed to refresh token:", err);
      logout();
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const loadUser = async () => {
      let token = localStorage.getItem(TOKEN_KEY);

      const fetchMe = async (tokenToUse: string) => {
        const res = await fetch(`${API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${tokenToUse}` },
          signal: controller.signal,
        });

        if (!res.ok) throw new Error("Access token invalid");

        const data = await res.json();
        if (isMounted) setUser(data.user);
      };

      try {
        if (!token) throw new Error("Missing token");
        await fetchMe(token);
      } catch {
        const newToken = await refreshAccessToken();
        if (newToken) {
          try {
            await fetchMe(newToken);
          } catch {
            logout();
          }
        } else {
          logout();
        }
      } finally {
        if (isMounted) setIsLoadingUser(false);
      }
    };

    loadUser();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  const value = useMemo(
    () => ({ user, isLoadingUser, login, register, logout, setUser }),
    [user, isLoadingUser]
  );

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

// Hook
export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
}
