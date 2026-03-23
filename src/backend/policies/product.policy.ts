import type { AuthUser } from "@/types";

export function canCreateProduct(user: AuthUser): boolean {
  return user.role === "seller" && user.status === "active";
}

export function canEditProduct(user: AuthUser, sellerId: string): boolean {
  if (user.role === "admin" || user.role === "super_admin") return true;
  return user.role === "seller" && user.id === sellerId;
}

export function canDeleteProduct(user: AuthUser, sellerId: string): boolean {
  return canEditProduct(user, sellerId);
}

export function canApproveProduct(user: AuthUser): boolean {
  return user.role === "admin" || user.role === "super_admin" || user.role === "moderator";
}