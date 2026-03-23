# KrishiHat — API Specification

Base URL: `http://localhost:3000/api`

All endpoints return:
```json
{ "success": true/false, "data": {}, "message": "..." }
```

## Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /auth/login | No | Login |
| POST | /auth/signup | No | Register |
| POST | /auth/logout | Cookie | Logout |
| POST | /auth/refresh | Cookie | Refresh tokens |
| GET | /auth/me | Cookie | Get current user |
| POST | /auth/forgot-password | No | Send reset email |
| POST | /auth/reset-password | No | Reset password |

## Products
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /products | No | List active products |
| GET | /products/[slug] | No | Product detail |
| POST | /products | seller | Create product |
| PATCH | /products/[id] | seller/admin | Update product |
| DELETE | /products/[id] | seller/admin | Soft-delete product |

## Categories
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /categories | No | List categories |
| POST | /categories | admin | Create category |

## Market Prices
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /market-prices | No | List prices |
| POST | /market-prices | admin | Add price record |
| DELETE | /market-prices/[id] | admin | Delete record |

## Cart
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /cart | buyer | Get cart |
| POST | /cart | buyer | Add to cart |
| PATCH | /cart/[itemId] | buyer | Update quantity |
| DELETE | /cart/[itemId] | buyer | Remove item |

## Orders
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /orders/checkout | buyer | Place order |
| GET | /orders | buyer/seller | List orders |
| GET | /orders/[id] | buyer/seller | Order detail |
| PATCH | /orders/[id]/status | seller/admin | Update status |