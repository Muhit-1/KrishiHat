export type { User, UserProfile, SellerProfile, Product, Order, AuditLog } from "@prisma/client";

export type Role = "guest" | "buyer" | "seller" | "moderator" | "admin" | "super_admin";

export interface JwtPayload {
  sub: string;       // user id
  email: string;
  role: Role;
  status: string;
  iat?: number;
  exp?: number;
}

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  status: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LocaleDict {
  [key: string]: string | LocaleDict;
}