"use client";

import { useState, useEffect, useCallback } from "react";
import type { AuthUser } from "@/types";

interface AuthState {
  user: AuthUser | null;
  profile: { fullName: string; avatarUrl?: string | null } | null;
  loading: boolean;
}

export function useAuth(): AuthState & { logout: () => Promise<void>; refetch: () => void } {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
  });

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const json = await res.json();
      if (json.success && json.data) {
        setState({
          user: {
            id: json.data.id,
            email: json.data.email,
            role: json.data.role,
            status: json.data.status,
          },
          profile: json.data.profile
            ? {
                fullName: json.data.profile.fullName,
                avatarUrl: json.data.profile.avatarUrl,
              }
            : null,
          loading: false,
        });
      } else {
        setState({ user: null, profile: null, loading: false });
      }
    } catch {
      setState({ user: null, profile: null, loading: false });
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setState({ user: null, profile: null, loading: false });
    window.location.href = "/login";
  };

  return { ...state, logout, refetch: fetchUser };
}