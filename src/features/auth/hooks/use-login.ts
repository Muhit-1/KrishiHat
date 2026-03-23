"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { LoginInput } from "@/lib/validations/auth.schema";

export function useLogin() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const login = async (data: LoginInput) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.message);
        return false;
      }
      // Redirect based on role
      const role = json.data?.role;
      const dashboardMap: Record<string, string> = {
        buyer: "/buyer/dashboard",
        seller: "/seller/dashboard",
        moderator: "/moderator/dashboard",
        admin: "/admin/dashboard",
        super_admin: "/super-admin/dashboard",
      };
      router.push(dashboardMap[role] || "/");
      return true;
    } catch {
      setError("Network error. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { login, error, loading };
}