# KrishiHat — Business Rules

## Accounts
- Buyer and seller are separate roles; a user cannot be both simultaneously
- Email must be unique across the platform
- Sellers must submit NID and optionally a trade license for verification
- Admin manually approves seller verification

## Products
- Sellers must be verified to publish products
- Products start in `draft` status; admin/moderator can approve to `active`
- Soft delete hides the product from marketplace but preserves order history

## Auctions
- Only categories with `auctionAllowed = true` can host auction listings
- Example: used farming tools and equipment (auctionAllowed = true)
- Example: vegetables, grains (auctionAllowed = false)
- Auctions have a start time, end time, starting price, and min bid increment
- Only buyers with `active` status can place bids
- Highest bid at end time wins

## Cart & Orders
- Cart is unique per buyer
- Checkout creates one order per seller (so buyer may get multiple orders)
- Orders begin in `pending` status
- Payment method: COD, bKash, Nagad

## Market Prices
- Admin records daily commodity prices per category and market
- Prices are publicly visible — no login required
- Prices are informational only and not directly tied to product listings

## Audit Logs
- All admin actions (user suspension, product approval, price updates) must create an audit log
- Audit logs are immutable and append-only
- Accessible only to admin and super_admin

## Suspension
- Suspended users cannot log in
- Existing sessions for suspended users are blocked at middleware