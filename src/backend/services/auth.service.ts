// Auth service — business logic layer
// Controllers call services; services call repositories or Prisma directly

import { prisma } from "@/lib/db/prisma";
import { hashPassword, comparePassword } from "@/backend/auth/password";
import { createSession, destroySession } from "@/backend/auth/session";
import type { SignupInput, LoginInput } from "@/lib/validations/auth.schema";

export async function registerUser(data: SignupInput) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new Error("EMAIL_TAKEN");

  const passwordHash = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      role: data.role,
      profile: {
        create: { fullName: data.fullName, phone: data.phone },
      },
      ...(data.role === "seller" && {
        sellerProfile: { create: { shopName: `${data.fullName}'s Shop` } },
      }),
    },
  });

  return createSession(user);
}

export async function loginUser(data: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: data.email, deletedAt: null } });
  if (!user) throw new Error("INVALID_CREDENTIALS");

  const valid = await comparePassword(data.password, user.passwordHash);
  if (!valid) throw new Error("INVALID_CREDENTIALS");

  if (user.status === "suspended") throw new Error("ACCOUNT_SUSPENDED");
  if (user.status === "banned") throw new Error("ACCOUNT_BANNED");

  return createSession(user);
}

export async function logoutUser(refreshToken: string) {
  return destroySession(refreshToken);
}