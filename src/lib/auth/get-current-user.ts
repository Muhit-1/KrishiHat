import { cookies } from "next/headers";
import { verifyAccessToken } from "@/backend/auth/jwt";
import { AUTH_CONSTANTS } from "./auth-constants";
import type { AuthUser } from "@/types";

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(AUTH_CONSTANTS.ACCESS_TOKEN_COOKIE)?.value;
    if (!token) return null;

    const payload = verifyAccessToken(token);
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      status: payload.status,
    };
  } catch {
    return null;
  }
}