# KrishiHat — Architecture Overview

## Tech Stack
- **Framework**: Next.js 14 (App Router) + TypeScript
- **Database**: MySQL via Prisma ORM
- **Auth**: JWT (access + refresh) with HTTP-only cookies
- **Styling**: Tailwind CSS + shadcn/ui-compatible components
- **Forms**: React Hook Form + Zod
- **Uploads**: Formidable (local dev), `public/uploads/`
- **i18n**: Custom dictionary system (en/bn)

## Directory Structure
```
src/
├── app/           — Next.js pages and API routes
├── backend/       — Server-only: services, repositories, policies, middleware
├── components/    — Reusable UI components
├── features/      — Feature-level components/hooks (future)
├── hooks/         — Client-side React hooks
├── lib/           — Shared utilities: db, auth, i18n, validations, constants
├── providers/     — React context providers
├── types/         — TypeScript types
└── locales/       — Translation JSON files
```

## Request Flow
```
Browser → middleware.ts (auth + role check)
       → app/api/[route]/route.ts (API handler)
       → backend/middleware/ (auth/role/suspension helpers)
       → backend/services/ (business logic)
       → backend/repositories/ or prisma directly
       → lib/db/prisma.ts (Prisma client)
       → MySQL
```

## Auth Flow

1. `POST /api/auth/login` → validates → creates JWT access + refresh → sets HTTP-only cookies
2. Every protected API call reads access token from cookie
3. Access token expires in 15m → client calls `POST /api/auth/refresh`
4. Refresh token rotates on each use (stored in DB)
5. Logout deletes refresh token from DB and clears cookies

## Role Hierarchy
```
super_admin > admin > moderator > seller / buyer > guest
```