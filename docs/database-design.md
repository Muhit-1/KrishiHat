# KrishiHat — Database Design

## Provider
MySQL via Prisma ORM

## Core Models

| Model | Purpose |
|-------|---------|
| User | All accounts (buyer, seller, admin, etc.) |
| UserProfile | Extended user info |
| SellerProfile | Shop info, verification status |
| RefreshToken | JWT refresh token store |
| Category | Product categories (auctionAllowed flag) |
| Subcategory | Sub-classification |
| Product | Marketplace listings |
| ProductImage | Product photos |
| Auction | Auction listings (only for auctionAllowed categories) |
| AuctionBid | Bids per auction |
| Cart / CartItem | Buyer cart |
| Order / OrderItem | Placed orders |
| Payment | Payment records |
| Shipment | Delivery tracking |
| Conversation / Message | Text chat |
| MarketPrice | Daily commodity price records |
| Report | User-to-user reports |
| AuditLog | Admin and system action log |

## Soft Delete Pattern
All user-facing entities have `deletedAt DateTime?`.
Queries always include `WHERE deletedAt IS NULL`.

## Key Business Constraints
- `auctionAllowed` on Category controls which products can be auctioned
- Seller must be `isVerified = true` to publish products
- Cart is unique per buyer
- One Payment and one Shipment per Order