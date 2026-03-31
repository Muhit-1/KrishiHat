I'll analyze your entire project thoroughly. Let me start by examining key files to understand the structure and requirements.    

Read [](file:///d%3A/Projects_file/Capstone/krishihat/package.json)

Read [](file:///d%3A/Projects_file/Capstone/krishihat/docs/database-design.md)

Read [](file:///d%3A/Projects_file/Capstone/krishihat/docs/architecture.md)

Read [](file:///d%3A/Projects_file/Capstone/krishihat/README.md#1-1), lines 1 to 50

Read [](file:///d%3A/Projects_file/Capstone/krishihat/docs/roles-permissions.md)

Read [](file:///d%3A/Projects_file/Capstone/krishihat/docs/api-spec.md)

Read [](file:///d%3A/Projects_file/Capstone/krishihat/prisma/schema.prisma#1-1), lines 1 to 60

Read [](file:///d%3A/Projects_file/Capstone/krishihat/src/app/api)

Read [](file:///d%3A/Projects_file/Capstone/krishihat/src/backend/services)

Read [](file:///d%3A/Projects_file/Capstone/krishihat/src/types/index.ts)

Read [](file:///d%3A/Projects_file/Capstone/krishihat/middleware.ts#1-1), lines 1 to 60

Now I'll provide you with a comprehensive project analysis:

---

# **KrishiHat Project — Complete Analysis & Breakdown**

## **1. PROJECT REQUIREMENTS**

### **Software Dependencies**
- **Node.js**: v18+ (required for Next.js 14)
- **npm**: v9+ (package manager)
- **MySQL**: v8.0+ (database engine)

### **Core Frameworks & Libraries**

| Category | Libraries | Version |
|----------|-----------|---------|
| **Framework** | Next.js, React | 14.2.3, 18.x |
| **Database ORM** | Prisma Client, Prisma Adapter (MariaDB) | 5.11.0 |
| **Authentication** | jsonwebtoken, bcryptjs, cookie | 9.0.2, 2.4.3, 0.6.0 |
| **Forms & Validation** | React Hook Form, Zod, @hookform/resolvers | 7.51.4, 3.23.4, 3.3.4 |
| **Styling** | Tailwind CSS, Tailwind Merge, TailwindCSS Animate | 3.4.1, 2.3.0, 1.0.7 |
| **File Uploads** | Formidable | 3.5.1 |
| **Date/Time** | date-fns | 3.6.0 |
| **Email** | Nodemailer | 8.0.3 |
| **Icons** | lucide-react | 0.378.0 |
| **Utilities** | clsx | 2.1.0 |
| **i18n** | Custom dictionary system (no external library) | — |

### **Development Tools**
- **TypeScript**: 5.x
- **ESLint**: 8.x
- **PostCSS**: 8.x
- **Autoprefixer**: 10.x
- **ts-node**: 10.9.2 (for database seeding)
- **dotenv**: 16.6.1 (environment configuration)

### **Database & External Services**
- **Primary DB**: MySQL (via Prisma ORM + MariaDB Adapter)
- **Email Service**: SMTP (via Nodemailer) — requires configuration
- **File Storage**: Local filesystem (uploads)

---

## **2. ROOT FOLDER EXPLANATION**

### **Configuration Files**

| File | Purpose |
|------|---------|
| **package.json** | Node dependencies, scripts (dev, build, lint, db management) |
| **tsconfig.json** | TypeScript configuration |
| **next.config.mjs** | Next.js configuration (image optimization, redirects, etc.) |
| **tailwind.config.ts** | Tailwind CSS theme customization |
| **postcss.config.js** | PostCSS plugins (Tailwind, Autoprefixer) |
| **eslint.config.mjs** | ESLint rules for code quality |
| **components.json** | Component library configuration (shadcn/ui style) |
| **prisma.config.ts** | Prisma configuration file (schema location) |
| **middleware.ts** | Next.js middleware for auth & role-based route protection |
| **.env** | Environment variables (database URL, JWT secrets, etc.) |

### **Project Documentation**

| Folder/File | Contents |
|-------------|----------|
| **docs/** | Architecture guidelines, DB design, API specs, roles/permissions, business rules |
| **README.md** | Quick start guide, demo accounts, tech stack overview |
| **notes.txt** | Development notes |

### **Data & Configuration**

| Folder | Purpose |
|--------|---------|
| **prisma/** | Prisma schema definition & database seeding scripts |
| **public/uploads/** | User-uploaded files (products, profiles) — organized by category |

### **Next.js Auto-Generated** (Ignored in manual analysis)
- **.next/** — Build output
- **node_modules/** — Dependencies
- **next-env.d.ts** — TypeScript definitions for Next.js

---

## **3. SRC FOLDER

### **Directory Structure Overview**
```
src/
├── app/              ← Next.js 14 App Router (Routes + UI)
├── backend/          ← Server-only business logic
├── components/       ← Reusable UI components
├── features/         ← Feature-specific components/hooks (future expansion)
├── hooks/            ← Custom React hooks
├── lib/              ← Shared utilities & helpers
├── providers/        ← React context providers
├── types/            ← TypeScript type definitions
└── locales/          ← Translation JSON files (EN/BN)
```



**Role**: Translation dictionaries for multilingual UI

| File | Language |
|------|----------|
| **en.json** | English translations |
| **bn.json** | Bengali translations |

Usage: `i18n().get('navbar.logout')`

---

## **4. REQUEST FLOW & DATA ARCHITECTURE**

### **Typical Request Lifecycle**

```
1. User Action (Click)
   ↓
2. API Call from Component
   ↓
3. middleware.ts (NextRequest)
   ├─ Extract JWT from cookie
   ├─ Verify token signature
   ├─ Check role permissions
   └─ Check account status (suspended?)
   ↓
4. app/api/[route]/route.ts (API Handler)
   ├─ Parse request body
   ├─ Validate with Zod schema
   ├─ Call backend service
   ↓
5. backend/services/*.ts (Business Logic)
   ├─ Apply business rules (policies)
   ├─ Call repository or Prisma directly
   ↓
6. lib/db/prisma.ts (Database Query)
   ├─ Build & execute SQL
   └─ Apply soft-delete filters (WHERE deletedAt IS NULL)
   ↓
7. MySQL Database
   ↓
8. Response → Component → UI Update
```

---

### **Authentication Flow (JWT with Refresh Tokens)**

```
Login Request
├─ Validate credentials
├─ Hash password match → generate tokens:
│  ├─ Access Token (15 min expiry) → stored in HTTP-only cookie
│  └─ Refresh Token (7 days) → stored in DB for rotation
└─ Return response + set cookies

Protected Route Access
├─ Extract access token from cookie
├─ Verify signature & expiry
├─ Check role & status
└─ Allow/deny

Token Expiry
├─ Client calls POST /api/auth/refresh
├─ Verify refresh token from cookie
├─ Invalidate old token in DB
├─ Issue new access + refresh tokens
└─ Continue session

Logout
├─ Delete refresh token from DB
├─ Clear cookies
└─ Redirect to login
```

---

### **Role Hierarchy & Permissions**

```
super_admin
    ↓
  admin
    ↓
 moderator
    ↓
 seller/buyer
    ↓
  guest
```

- **super_admin**: Create admins, system settings, all platform access
- **admin**: Manage content, users, market prices, orders
- **moderator**: Review disputes, user reports
- **seller**: List products, manage orders, create auctions (if verified)
- **buyer**: Browse, cart, checkout, chat
- **guest**: View public content only

---

## **5. KEY ARCHITECTURAL PATTERNS**

### **Soft Delete Pattern**
All user-facing entities have `deletedAt DateTime?` field. Every query includes:
```prisma
WHERE deletedAt IS NULL
```
This preserves data history while hiding "deleted" records.

### **Policy-Based Authorization**
Business rules enforced in `backend/policies/`:
- Only verified sellers can publish products
- Only categories with `auctionAllowed=true` support auctions

### **Service Layer Pattern**
- API routes delegate to services (`backend/services/`)
- Services contain business logic, validation, transactions
- Repositories (when used) abstract database queries

### **HTTP-Only Cookie Auth**
- JWT stored in HTTP-only, secure cookies (XSS & CSRF protection)
- No token exposed to JavaScript
- Refresh tokens rotated on each use

### **Zod + React Hook Form**
- Form validation on client (UX) & server (security)
- Type-safe validation schemas
- Auto-generated TypeScript types from schemas

---

## **6. DEPLOYMENT & DATABASE SETUP**

### **Database Management Commands**

```bash
npm run db:generate    # Generate Prisma client
npm run db:push       # Sync schema to database (dev)
npm run db:migrate    # Create migration (production-ready)
npm run db:seed       # Populate demo data
npm run db:studio     # Open Prisma Studio GUI
```

### **Environment Variables Required**
```
DATABASE_URL=mysql://user:pass@localhost:3306/krishihat
NEXTAUTH_SECRET=your-jwt-secret
NEXTAUTH_URL=http://localhost:3000
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-password
```

---

## **7. QUICK REFERENCE: DEMO ACCOUNTS**

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@krishihat.com | SuperAdmin@123 |
| Admin | admin@krishihat.com | Admin@123 |
| Moderator | moderator@krishihat.com | Moderator@123 |
| Seller | seller@krishihat.com | Seller@123 |
| Buyer | buyer@krishihat.com | Buyer@123 |

---

## **8. SUMMARY**

**KrishiHat** is a full-stack agricultural marketplace connecting farmers & buyers in Bangladesh.

**Key Characteristics:**
- ✅ **Multi-role system** with role-based dashboards
- ✅ **Dual marketplace models**: Fixed-price products + auctions
- ✅ **Seller verification** for product publishing
- ✅ **Real-time market prices** commodity tracking
- ✅ **Buyer-seller messaging** & dispute resolution
- ✅ **Bilingual support** (English/Bengali)
- ✅ **JWT-based auth** with token refresh mechanism
- ✅ **Comprehensive audit logging** for admin oversight
- ✅ **Account suspension** & moderation tools

**Tech Stack Philosophy:**
- Next.js 14 for modern full-stack development
- Prisma for type-safe database access
- Tailwind CSS for rapid styling
- Custom i18n for localization
- Local file uploads (expandable to cloud storage)

This structure is scalable, maintainable, and ready for production deployment with minimal changes.