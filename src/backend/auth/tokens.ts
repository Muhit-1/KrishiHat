import crypto from "crypto";
import { prisma } from "@/lib/db/prisma";

const RESET_EXPIRES_MS = 60 * 60 * 1000;       // 1 hour
const VERIFY_EXPIRES_MS = 24 * 60 * 60 * 1000; // 24 hours

export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// ── Password Reset ───────────────────────────────────────

export async function createPasswordResetToken(userId: string): Promise<string> {
  // Invalidate old tokens
  await prisma.passwordResetToken.deleteMany({ where: { userId } });

  const token = generateSecureToken();
  await prisma.passwordResetToken.create({
    data: {
      userId,
      token,
      expiresAt: new Date(Date.now() + RESET_EXPIRES_MS),
    },
  });

  return token;
}

export async function consumePasswordResetToken(token: string) {
  const record = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!record) throw new Error("TOKEN_INVALID");
  if (record.usedAt) throw new Error("TOKEN_USED");
  if (record.expiresAt < new Date()) throw new Error("TOKEN_EXPIRED");

  // Mark as used
  await prisma.passwordResetToken.update({
    where: { token },
    data: { usedAt: new Date() },
  });

  return record.user;
}

// ── Email Verification ────────────────────────────────────

export async function createEmailVerificationToken(userId: string): Promise<string> {
  await prisma.emailVerificationToken.deleteMany({ where: { userId } });

  const token = generateSecureToken();
  await prisma.emailVerificationToken.create({
    data: {
      userId,
      token,
      expiresAt: new Date(Date.now() + VERIFY_EXPIRES_MS),
    },
  });

  return token;
}

export async function consumeEmailVerificationToken(token: string) {
  const record = await prisma.emailVerificationToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!record) throw new Error("TOKEN_INVALID");
  if (record.usedAt) throw new Error("TOKEN_USED");
  if (record.expiresAt < new Date()) throw new Error("TOKEN_EXPIRED");

  await prisma.emailVerificationToken.update({
    where: { token },
    data: { usedAt: new Date() },
  });

  // Mark user as verified
  await prisma.user.update({
    where: { id: record.userId },
    data: { emailVerified: true },
  });

  return record.user;
}