import { signAccessToken, signRefreshToken, verifyRefreshToken } from "./jwt";
import { prisma } from "@/lib/db/prisma";
import type { JwtPayload, Role } from "@/types";
import { AUTH_CONSTANTS } from "@/lib/auth/auth-constants";

export async function createSession(user: {
  id: string;
  email: string;
  role: string;
  status: string;
}) {
  const payload: Omit<JwtPayload, "iat" | "exp"> = {
    sub: user.id,
    email: user.email,
    role: user.role as Role,
    status: user.status,
  };

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  // Persist refresh token in DB
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + AUTH_CONSTANTS.REFRESH_EXPIRES_MS),
    },
  });

  return { accessToken, refreshToken };
}

export async function rotateSession(oldRefreshToken: string) {
  // Verify old token
  const payload = verifyRefreshToken(oldRefreshToken);

  // Check DB
  const stored = await prisma.refreshToken.findUnique({
    where: { token: oldRefreshToken },
    include: { user: true },
  });

  if (!stored || stored.expiresAt < new Date()) {
    throw new Error("Invalid or expired refresh token");
  }

  if (stored.user.status === "suspended" || stored.user.status === "banned") {
    throw new Error("Account suspended");
  }

  // Delete old token (rotation)
  await prisma.refreshToken.delete({ where: { token: oldRefreshToken } });

  return createSession(stored.user);
}

export async function destroySession(refreshToken: string) {
  await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
}