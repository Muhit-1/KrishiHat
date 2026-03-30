"use client";

import { useState } from "react";
import { Mail, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/toast";

export function EmailVerificationBanner() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [dismissed, setDismissed] = useState(false);
  const [sending, setSending] = useState(false);

  // Only show if logged in and email not verified
  if (!user || user.status === undefined) return null;
  if (dismissed) return null;

  // We check emailVerified from the /api/auth/me response
  // The user object from useAuth now includes emailVerified
  if ((user as any).emailVerified === true) return null;

  const handleResend = async () => {
    setSending(true);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
      });
      const json = await res.json();
      if (json.success) {
        success("Verification email sent!", "Check your inbox.");
      } else {
        error("Failed to send", json.message);
      }
    } catch {
      error("Network error", "Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-yellow-50 border-b border-yellow-200">
      <div className="page-container py-2.5 flex items-center gap-3">
        <Mail className="h-4 w-4 text-yellow-700 flex-shrink-0" />
        <p className="text-sm text-yellow-800 flex-1">
          Your email is not verified.{" "}
          <button
            onClick={handleResend}
            disabled={sending}
            className="font-semibold underline hover:no-underline disabled:opacity-50"
          >
            {sending ? "Sending..." : "Resend verification email"}
          </button>
        </p>
        <button
          onClick={() => setDismissed(true)}
          className="text-yellow-600 hover:text-yellow-800 transition-colors flex-shrink-0"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}