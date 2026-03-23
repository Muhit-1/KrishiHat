import type { AuthUser } from "@/types";

export function canCreateAuction(user: AuthUser): boolean {
  return user.role === "seller" && user.status === "active";
}

export function canBid(user: AuthUser): boolean {
  return user.role === "buyer" && user.status === "active";
}

export function canManageAuction(user: AuthUser): boolean {
  return user.role === "admin" || user.role === "super_admin";
}