import { NextRequest } from "next/server";
import { verifyAccessToken } from "@/backend/auth/jwt";
import { AUTH_CONSTANTS } from "@/lib/auth/auth-constants";
import type { AuthUser } from "@/types";

export function getAuthUser(req: NextRequest): AuthUser | null {
  try {
    const token = req.cookies.get(AUTH_CONSTANTS.ACCESS_TOKEN_COOKIE)?.value;
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

export function requireAuth(req: NextRequest): AuthUser {
  const user = getAuthUser(req);
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
}