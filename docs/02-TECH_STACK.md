# Տեխնոլոգիաների Stack

> WhiteShop Template նախագծի տեխնոլոգիական stack-ի ամբողջական նկարագրություն։

**Նախագծի չափ.** B (միջին)
**Վերջին թարմացում.** 2026-02-12

---

## 📋 ԱՄԲՈՂՋԱԿ

### Հիմնական տեխնոլոգիաներ

| Կատեգորիա | Տեխնոլոգիա | Տարբերակ | Նշանակություն |
|-----------|------------|--------|------------|
| **Frontend** | Next.js | 16.x | Framework (App Router) |
| **Frontend** | React | 18.3 | UI Library |
| **Frontend** | TypeScript | 5.x | Type safety |
| **Frontend** | Tailwind CSS | 3.x | Styling |
| **Backend** | Next.js API Routes | 16.x | REST API |
| **Database** | PostgreSQL | 17 | Database (Neon) |
| **ORM** | Prisma | 5.x | Database ORM |
| **Cache** | Redis | - | Cache (ioredis) |
| **Search** | Meilisearch | 0.38 | Որոնում |
| **Monorepo** | Turborepo | 2.0 | Build system |

---

## 🎨 Frontend

### Framework
- **Next.js 16.x** (App Router)
  - Server Components (default)
  - Client Components (interactivity)
  - API Routes (`app/api/v1/`)
  - Metadata API (SEO)

### UI Library
- **React 18.3**
  - Hooks (useState, useEffect, useContext)
  - Server Components
  - Client Components

### Styling
- **Tailwind CSS 3.x**
  - Utility-first CSS
  - Custom theme (colors, fonts)
  - Responsive design

### UI Components
- **Custom UI Kit** (`packages/ui`)
  - Button, Input, Card components
  - Shared across monorepo

### State Management
- **useState / Context API**
  - AuthContext (authentication)
  - ClientProviders (global providers)

### Forms
- **React Hook Form 7.x**
  - Form handling
  - **Zod 4.x** — validation

### i18n
- **Custom i18n** (locales/ folders)
  - Լեզուներ: Հայերեն (hy), Անգլերեն (en), Ռուսերեն (ru)
  - Server-side և client-side helpers

### Data Fetching
- **Next.js Server Components**
- **API Routes** (`app/api/v1/`)

---

## 🔧 Backend

### Framework
- **Next.js API Routes** (16.x)
  - REST API
  - Route handlers (`route.ts`)

### Validation
- **Zod 4.x**
  - Schema validation
  - Type inference

### API Format
- **REST**
  - Base path: `/api/v1/`
  - JSON responses

---

## 💾 Database

### Database
- **PostgreSQL 17** (Neon)
  - Managed PostgreSQL
  - Connection pooling
  - Branching (dev/prod)

### ORM
- **Prisma 5.x**
  - Type-safe queries
  - Migrations
  - Schema: `packages/db/prisma/schema.prisma`

### Cache
- **Redis** (ioredis 5.x)
  - Query cache
  - Session storage

---

## 🔍 Search

### Search Engine
- **Meilisearch 0.38**
  - Typo-tolerant search
  - Fast indexing
  - Self-hosted / cloud

---

## 📦 Monorepo

### Build System
- **Turborepo 2.0**
  - Parallel builds
  - Caching
  - Workspace management

### Package Manager
- **pnpm**
  - Fast installs
  - Workspace support

### Workspaces
- `apps/web` — Next.js frontend + API
- `packages/db` — Prisma schema
- `packages/ui` — Shared UI components
- `packages/design-tokens` — Design tokens

---

## 🔐 Authentication

### Solution
- **Custom JWT** (jsonwebtoken 9.x)
  - Token-based authentication
  - httpOnly cookies

### Password Hashing
- **bcryptjs 2.4**
  - Password hashing
  - [Քննարկել argon2-ի անցում]

### RBAC
- **Role-Based Access Control**
  - Roles: `customer`, `admin`
  - User.roles[] array

---

## 🌐 Hosting & Infrastructure

### Frontend Hosting
- **Vercel**
  - Next.js deployment
  - Edge Network (CDN)
  - Environment variables

### Database Hosting
- **Neon**
  - Managed PostgreSQL
  - Serverless-ready
  - Branching

### File Storage
- **Cloudflare R2** (քննարկել)
  - Object storage
  - CDN integration

---

## 🛠️ Development Tools

### Language
- **TypeScript 5.x**
  - Strict mode
  - Type safety

### Linting
- **ESLint 9.x**
  - Next.js config
  - TypeScript rules

### Formatting
- **Prettier 3.x**
  - Code formatting

### Package Manager
- **pnpm**
  - Workspace support
  - Fast installs

---

## 📚 Dependencies

### Core Dependencies
- `next` — Next.js framework
- `react` — React library
- `react-dom` — React DOM
- `typescript` — TypeScript
- `tailwindcss` — Tailwind CSS
- `prisma` — Prisma ORM
- `@prisma/client` — Prisma client
- `zod` — Validation
- `react-hook-form` — Forms
- `@hookform/resolvers` — Form resolvers
- `jsonwebtoken` — JWT
- `bcryptjs` — Password hashing
- `ioredis` — Redis client
- `meilisearch` — Search engine

### Dev Dependencies
- `@types/node` — Node.js types
- `@types/react` — React types
- `@types/react-dom` — React DOM types
- `eslint` — ESLint
- `eslint-config-next` — Next.js ESLint config
- `prettier` — Prettier
- `turbo` — Turborepo

---

## 🔗 Կապված փաստաթղթեր

- [TECH_CARD.md](./TECH_CARD.md) — Տեխնոլոգիական քարտ
- [01-ARCHITECTURE.md](./01-ARCHITECTURE.md) — Ճարտարապետություն
- [04-API.md](./04-API.md) — API փաստաթղթավորում
- [05-DATABASE.md](./05-DATABASE.md) — ԲԴ սխեմա

---

**Փաստաթղթի տարբերակ.** 1.0
**Ամսաթիվ.** 2026-02-12




