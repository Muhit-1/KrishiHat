export const ROLES = {
  GUEST: "guest",
  BUYER: "buyer",
  SELLER: "seller",
  MODERATOR: "moderator",
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
} as const;

export const ADMIN_ROLES = [ROLES.ADMIN, ROLES.SUPER_ADMIN] as const;
export const STAFF_ROLES = [ROLES.MODERATOR, ROLES.ADMIN, ROLES.SUPER_ADMIN] as const;