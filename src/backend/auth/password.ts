import bcrypt from "bcryptjs";
import { AUTH_CONSTANTS } from "@/lib/auth/auth-constants";

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, AUTH_CONSTANTS.BCRYPT_ROUNDS);
}

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}