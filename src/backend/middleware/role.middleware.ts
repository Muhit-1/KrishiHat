import type { AuthUser, Role } from "@/types";

export function requireRole(user: AuthUser, ...roles: Role[]): void {
  if (!roles.includes(user.role as Role)) {
    throw new Error("FORBIDDEN");
  }
}

export function isAdmin(user: AuthUser): boolean {
  return user.role === "admin" || user.role === "super_admin";
}

export function isSeller(user: AuthUser): boolean {
  return user.role === "seller";
}

export function isBuyer(user: AuthUser): boolean {
  return user.role === "buyer";
}