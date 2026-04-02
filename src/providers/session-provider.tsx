"use client";

import { useEffect, useRef, useCallback } from "react";


const REFRESH_INTERVAL_MS = 13 * 60 * 1000;


const VISIBILITY_REFRESH_THRESHOLD_MS = 10 * 60 * 1000;

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastRefreshRef = useRef<number>(Date.now());

  const refreshToken = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/refresh", { method: "POST" });
      if (res.ok) {
        lastRefreshRef.current = Date.now();
      } else {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        window.location.href = "/login?reason=session_expired";
      }
    } catch {
    
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        
        const res = await fetch("/api/auth/me");
        if (cancelled) return;
        if (!res.ok) return; 

      
        lastRefreshRef.current = Date.now();
        intervalRef.current = setInterval(refreshToken, REFRESH_INTERVAL_MS);
      } catch {
        
      }
    };

    init();

    
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const elapsed = Date.now() - lastRefreshRef.current;
        if (elapsed >= VISIBILITY_REFRESH_THRESHOLD_MS && intervalRef.current !== null) {
          refreshToken();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelled = true;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refreshToken]);

  return <>{children}</>;
}