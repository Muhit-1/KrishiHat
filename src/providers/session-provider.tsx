"use client";

import { useEffect, useRef } from "react";

// Silently refreshes the access token 2 minutes before expiry.
// Access token = 15 minutes → refresh every 13 minutes.
const REFRESH_INTERVAL_MS = 13 * 60 * 1000;

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const refreshToken = async () => {
    try {
      const res = await fetch("/api/auth/refresh", { method: "POST" });
      if (!res.ok) {
        // Refresh failed (token expired/revoked) — clear interval
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    } catch {
      // Network error — don't clear interval, try again next cycle
    }
  };

  useEffect(() => {
    // Only refresh if user appears to be logged in
    const hasAccessCookie = document.cookie
      .split(";")
      .some((c) => c.trim().startsWith("kh_access="));

    if (!hasAccessCookie) return;

    // Schedule periodic refresh
    intervalRef.current = setInterval(refreshToken, REFRESH_INTERVAL_MS);

    // Also refresh once shortly after mount (covers returning users)
    const initialTimer = setTimeout(refreshToken, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      clearTimeout(initialTimer);
    };
  }, []);

  return <>{children}</>;
}