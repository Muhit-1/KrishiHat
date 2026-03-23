import type { AuthUser } from "@/types";

export function requireActiveAccount(user: AuthUser): void {
  if (user.status === "suspended") {
    throw new Error("ACCOUNT_SUSPENDED");
  }
  if (user.status === "banned") {
    throw new Error("ACCOUNT_BANNED");
  }
}