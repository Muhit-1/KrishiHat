"use client";

import { useState, useEffect } from "react";
import type { AuthUser } from "@/types";

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setUser(json.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/login";
  };

  return { user, loading, logout };
}