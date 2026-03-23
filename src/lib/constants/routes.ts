export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  MARKETPLACE: "/marketplace",
  AUCTIONS: "/auctions",
  MARKET_PRICES: "/market-prices",

  BUYER: {
    DASHBOARD: "/buyer/dashboard",
    CART: "/buyer/cart",
    CHECKOUT: "/buyer/checkout",
    ORDERS: "/buyer/orders",
    PROFILE: "/buyer/profile",
    CHAT: "/buyer/chat",
  },

  SELLER: {
    DASHBOARD: "/seller/dashboard",
    PRODUCTS: "/seller/products",
    ORDERS: "/seller/orders",
    AUCTIONS: "/seller/auctions",
  },

  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    USERS: "/admin/users",
    MARKET_PRICES: "/admin/market-prices",
    AUDIT_LOGS: "/admin/audit-logs",
  },

  SUPER_ADMIN: {
    DASHBOARD: "/super-admin/dashboard",
  },
} as const;