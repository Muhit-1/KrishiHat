# KrishiHat — Roles & Permissions

## Roles

| Role | Description |
|------|-------------|
| guest | Unauthenticated visitor |
| buyer | Can browse, cart, checkout, order |
| seller | Can list products, manage orders, create auctions (if eligible) |
| moderator | Reviews reports and disputes |
| admin | Full platform management, market prices |
| super_admin | Admin management, system settings |

## Protected Routes

| Path | Required Role |
|------|--------------|
| /buyer/* | buyer, admin, super_admin |
| /seller/* | seller, admin, super_admin |
| /moderator/* | moderator, admin, super_admin |
| /admin/* | admin, super_admin |
| /super-admin/* | super_admin only |

## Key Business Rules

- Buyers and sellers are **separate accounts** (different role values)
- Sellers must complete verification before publishing products
- Auctions are only allowed for categories with `auctionAllowed = true`
  (e.g., used farming tools and equipment)
- Market prices are **publicly visible**, managed only by admin/super_admin
- Account suspension blocks login and access to all protected routes
- Soft-deleted users cannot log in