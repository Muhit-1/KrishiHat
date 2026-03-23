# KrishiHat 🌾

Bangladesh's Agricultural Marketplace — connecting farmers and buyers.

## Quick Start
```bash
# 1. Clone and install
git clone <repo>
cd krishihat
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your MySQL credentials and JWT secrets

# 3. Setup database
npm run db:generate
npm run db:push
npm run db:seed

# 4. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@krishihat.com | SuperAdmin@123 |
| Admin | admin@krishihat.com | Admin@123 |
| Moderator | moderator@krishihat.com | Moderator@123 |
| Seller | seller@krishihat.com | Seller@123 |
| Buyer | buyer@krishihat.com | Buyer@123 |

## Tech Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Prisma ORM + MySQL
- JWT Auth (HTTP-only cookies)
- Zod + React Hook Form
- Formidable (file uploads)
- Custom i18n (EN/BN)

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run db:push` | Push schema to DB |
| `npm run db:seed` | Seed demo data |
| `npm run db:studio` | Open Prisma Studio |

## Docs

See `/docs` folder for architecture, database design, API spec, roles/permissions, and business rules.