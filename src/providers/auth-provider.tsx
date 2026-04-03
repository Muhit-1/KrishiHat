"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import type { Role } from "@/types";

interface AuthUser {
  id: string;
  email: string;
  role: Role;
  status: string;
  emailVerified: boolean;
}

interface AuthProfile {
  fullName: string;
  avatarUrl?: string | null;
}

interface AuthState {
  user: AuthUser | null;
  profile: AuthProfile | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  logout: () => Promise<void>;
  refetch: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
  logout: async () => {},
  refetch: () => {},
});


const POLL_INTERVAL_MS = 5 * 60 * 1000;

// Role → default dashboard path map used for redirects after logout / expiry
const DASHBOARD_MAP: Record<string, string> = {
  buyer: "/buyer/dashboard",
  seller: "/seller/dashboard",
  moderator: "/moderator/dashboard",
  admin: "/admin/dashboard",
  super_admin: "/super-admin/dashboard",
};


const PROTECTED_PREFIXES = ["/buyer", "/seller", "/moderator", "/admin", "/super-admin"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
  });

  const router = useRouter();
  const pathname = usePathname();
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  // Track whether the component is still mounted to avoid state updates after unmount
  const mountedRef = useRef(true);

  const fetchUser = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/me");

      if (!mountedRef.current) return false;

      if (res.status === 401 || res.status === 403) {
        // Session expired or invalid
        setState({ user: null, profile: null, loading: false });
        return false;
      }

      const json = await res.json();

      if (!mountedRef.current) return false;

      if (json.success && json.data) {
        setState({
          user: {
            id: json.data.id,
            email: json.data.email,
            role: json.data.role as Role,
            status: json.data.status,
            emailVerified: json.data.emailVerified,
          },
          profile: json.data.profile
            ? {
                fullName: json.data.profile.fullName,
                avatarUrl: json.data.profile.avatarUrl,
              }
            : null,
          loading: false,
        });
        return true;
      } else {
        setState({ user: null, profile: null, loading: false });
        return false;
      }
    } catch {
      if (mountedRef.current) {
        setState((prev) => ({ ...prev, loading: false }));
      }
      return false;
    }
  }, []);

  
  const pollSession = useCallback(async () => {
    const isLoggedIn = await fetchUser();

    if (!mountedRef.current) return;

    if (!isLoggedIn) {
      const isOnProtectedRoute = PROTECTED_PREFIXES.some((prefix) =>
        pathname.startsWith(prefix)
      );
      if (isOnProtectedRoute) {
        router.push(`/login?reason=session_expired&returnTo=${encodeURIComponent(pathname)}`);
      }
    }
  }, [fetchUser, pathname, router]);

  // Initial load
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  
  useEffect(() => {
    pollRef.current = setInterval(pollSession, POLL_INTERVAL_MS);
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [pollSession]);

  
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        pollSession();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [pollSession]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setState({ user: null, profile: null, loading: false });
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    window.location.href = "/login";
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, logout, refetch: fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}   