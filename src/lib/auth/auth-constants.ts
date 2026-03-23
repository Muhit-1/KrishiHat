export const AUTH_CONSTANTS = {
  ACCESS_TOKEN_COOKIE: "kh_access",
  REFRESH_TOKEN_COOKIE: "kh_refresh",
  ACCESS_EXPIRES_IN: "15m",
  REFRESH_EXPIRES_IN: "7d",
  REFRESH_EXPIRES_MS: 7 * 24 * 60 * 60 * 1000,
  ACCESS_EXPIRES_MS: 15 * 60 * 1000,
  BCRYPT_ROUNDS: 12,
} as const;

export const PROTECTED_ROLES = {
  buyer: ["/buyer"],
  seller: ["/seller"],
  moderator: ["/moderator"],
  admin: ["/admin"],
  super_admin: ["/super-admin", "/admin"],
} as const;