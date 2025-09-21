"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { User } from "@/types/user";
import { toast } from "sonner";

type UserContextType = {
  isLoggedIn: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  getProfile: () => Promise<void>;
  register: (name: string, email: string, password: string, confirmPassowrd: string, avatarUrl: File,) => Promise<void>;
  fetchWithRefresh: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
};

const UserContext = createContext<UserContextType>({
  isLoggedIn: false,
  user: null,
  isLoading: false,
  error: null,
  login: async () => { },
  logout: async () => { },
  getProfile: async () => { },
  register: async () => { },
  fetchWithRefresh: async () => new Response(),
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    // Basic validation
    setIsLoading(true);  // Show loading spinner
    setError(null);
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    try {
      const res = await fetch(`${API_URL}/api/users/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      setUser(data.user);
      setIsLoggedIn(true);
      router.push("/");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
        throw err;
      } else {
        setError("Login failed");
        throw new Error("Login failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);

    try {
      await fetch(`${API_URL}/api/users/logout`, {
        method: "POST",
        credentials: "include",
      });

      setUser(null);
      setIsLoggedIn(false);
      router.push("/login");
    } catch {
      setError("Logout failed");
      setUser(null);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    confirmPassword: string,
    avatarUrl: File
  ) => {
    setIsLoading(true);
    setError(null);

    try {

      const formData = new FormData();

      formData.append("name", name)
      formData.append("email", email)
      formData.append("password", password)
      formData.append("confirmPassword", confirmPassword)
      formData.append("avatarUrl", avatarUrl)

      const res = await fetch(`${API_URL}/api/users/register`, {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // setUser(data);
      // setIsLoggedIn(true);

      toast.success("Registration successful! 🎉");
      router.push("/login"); // or "/login" kung gusto mo muna dumaan sa login page

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Registration error");
        toast.error(err.message);
      } else {
        setError("Register failed")
        // throw new Error("Register failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let res = await fetch(`${API_URL}/api/users/me`, { credentials: "include" });

      if (res.status === 401) {
        // 🔑 try refresh
        const refreshRes = await fetch(`${API_URL}/api/users/refresh-token`, {
          method: "POST",
          credentials: "include",
        });

        if (refreshRes.ok) {
          // retry profile after refresh
          res = await fetch(`${API_URL}/api/users/me`, { credentials: "include" });
        }
      }

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setIsLoggedIn(true);
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
    } catch {
      setError("Failed to fetch profile");
      setUser(null);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  }, [API_URL]);


  const fetchWithRefresh = async (
    input: RequestInfo,
    init?: RequestInit
  ): Promise<Response> => {
    let res = await fetch(input, { ...init, credentials: "include" });

    if (res.status === 401) {
      // try refresh
      const refreshRes = await fetch(`${API_URL}/api/users/refresh-token`, {
        method: "POST",
        credentials: "include",
      });

      if (refreshRes.ok) {
        // retry original request
        res = await fetch(input, { ...init, credentials: "include" });
      } else {
        await logout(); // force logout if refresh also fails
      }
    }

    return res;
  };


  useEffect(() => {
    getProfile();
  }, [getProfile]);

  return (
    <UserContext.Provider
      value={{
        isLoggedIn,
        user,
        isLoading,
        error,
        login,
        logout,
        getProfile,
        register,
        fetchWithRefresh,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
