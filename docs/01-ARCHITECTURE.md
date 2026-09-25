# Նախագծի ճարտարապետություն. WhiteShop Template

> E-commerce platform monorepo կառուցվածքով, Next.js frontend-ով և PostgreSQL տվյալների բազայով։

**Նախագծի չափ.** B (միջին)
**Վերջին թարմացում.** 2026-02-12

---

## 📋 ԱՄԲՈՂՋԱԿ

### Նշանակություն
WhiteShop Template-ը պրոֆեսիոնալ e-commerce հարթակ է, որը ապահովում է ապրանքների կատալոգ, զամբյուղ, պատվերների կառավարում, admin panel և բազմալեզու աջակցություն։

### Հիմնական առանձնահատկություններ
- E-commerce ֆունկցիոնալ (ապրանքներ, կատեգորիաներ, զամբյուղ, checkout)
- Admin panel (ապրանքների, պատվերների, օգտատերերի կառավարում)
- Բազմալեզու աջակցություն (hy, en, ru)
- Որոնում (Meilisearch)
- Cache (Redis)
- Custom authentication (JWT)

### Օգտատերեր
- **Հաճախորդ.** Դիտում է ապրանքները, ավելացնում է զամբյուղ, կատարում է պատվերներ
- **Ադմին.** Կառավարում է ապրանքները, պատվերները, օգտատերերին, վիճակագրությունը

---

## 🏗️ ՃԱՐՏԱՐԱՊԵՏՈՒԹՅՈՒՆ

### Բարձր մակարդակի դիագրամ

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Frontend      │────▶│   API Routes    │────▶│   PostgreSQL    │
│   (Next.js 16)   │     │  (Next.js API)  │     │   (Neon)        │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
            ┌───────▼──────┐ ┌───▼──────┐ ┌────▼──────┐
            │  Meilisearch │ │  Redis   │ │  R2 (?)   │
            │  (Search)    │ │  (Cache) │ │  (Files)  │
            └──────────────┘ └──────────┘ └───────────┘
```

### Ճարտարապետական ոճ
**Monorepo (Turborepo)** — Modular Monolith

**Հիմնավորում.** 
- Monorepo-ն թույլ է տալիս կիսել կոդը apps-ի և packages-ի միջև
- Turborepo-ն ապահովում է արագ build և cache
- Next.js API Routes-ը բավարար է B չափի նախագծի համար (առանց առանձին backend-ի)

---

## 🧩 ՀԱՄԱԿԱՐԳԻ ԿՈՄՊՈՆԵՆՏՆԵՐ

### Frontend
- **Տեխնոլոգիա.** Next.js 16.x (App Router), React 18
- **Նշանակություն.** Հաճախորդների և ադմինների ինտերֆեյս
- **Գտնվելու վայր.** `apps/web/`
- **Առանձնահատկություններ.** 
  - Server Components (default)
  - Client Components (interactivity)
  - i18n (hy, en, ru)
  - SEO (Metadata API)

### Backend
- **Տեխնոլոգիա.** Next.js API Routes
- **Նշանակություն.** REST API endpoints բիզնես-լոգիկայի համար
- **Գտնվելու վայր.** `apps/web/app/api/v1/`
- **API ոճ.** REST
- **Կառուցվածք:**
  - `/api/v1/auth/` — ինքնություն հաստատում
  - `/api/v1/products/` — ապրանքներ
  - `/api/v1/cart/` — զամբյուղ
  - `/api/v1/orders/` — պատվերներ
  - `/api/v1/admin/` — ադմին ֆունկցիաներ

### Բազային տվյալներ
- **Տեխնոլոգիա.** PostgreSQL 17 (Neon)
- **ORM.** Prisma 5.x
- **Սխեմա.** `packages/db/prisma/schema.prisma`
- **Հիմնական մոդելներ:**
  - User, Address
  - Product, ProductVariant, ProductTranslation
  - Category, CategoryTranslation
  - Brand, BrandTranslation
  - Attribute, AttributeValue
  - Cart, CartItem
  - Order, OrderItem, Payment, OrderEvent
  - ProductReview
  - Settings, ContactMessage

### Cache
- **Տեխնոլոգիա.** Upstash Redis REST (`@upstash/redis`), ioredis TCP fallback
- **Նշանակություն.** Rate limiting, հարցումների cache

### Որոնում
- **Տեխնոլոգիա.** Meilisearch
- **Նշանակություն.** Ապրանքների արագ որոնում

### Ֆայլերի պահոց
- **Տեխնոլոգիա.** Cloudflare R2 (քննարկման)
- **Նշանակություն.** Պատկերների և ֆայլերի պահոց

---

## 📁 ՆԱԽԱԳԾԻ ԿԱՐԳՈՒՑՎԱԿՔԸ

```
WhiteShop-Template/
├── apps/
│   └── web/                    # Next.js frontend + API
│       ├── app/                 # Next.js App Router
│       │   ├── (auth)/          # Auth routes (login, register)
│       │   ├── (main)/          # Public routes
│       │   │   ├── page.tsx     # Homepage
│       │   │   ├── products/    # Products listing & detail
│       │   │   ├── cart/        # Shopping cart
│       │   │   ├── checkout/    # Checkout process
│       │   │   ├── profile/      # User profile
│       │   │   └── ...
│       │   ├── admin/           # Admin panel
│       │   │   ├── products/    # Product management
│       │   │   ├── orders/      # Order management
│       │   │   ├── users/       # User management
│       │   │   └── ...
│       │   └── api/             # API Routes
│       │       └── v1/          # API v1 endpoints
│       │           ├── auth/    # Authentication
│       │           ├── products/
│       │           ├── cart/
│       │           ├── orders/
│       │           └── admin/
│       ├── components/           # React components
│       │   ├── ui/               # UI components (shared)
│       │   └── [feature]/       # Feature-specific components
│       ├── lib/                  # Utilities & services
│       │   ├── auth/            # Auth logic
│       │   ├── services/        # Business logic services
│       │   ├── i18n.ts          # i18n helpers
│       │   └── utils/           # Utility functions
│       └── locales/              # i18n translations
│           ├── hy/              # Armenian
│           ├── en/               # English
│           └── ru/               # Russian
│
├── packages/
│   ├── db/                      # Database package
│   │   ├── prisma/
│   │   │   ├── schema.prisma    # Prisma schema
│   │   │   └── migrations/     # Database migrations
│   │   └── client.ts            # Prisma client export
│   ├── ui/                      # Shared UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── index.ts
│   └── design-tokens/           # Design tokens
│       └── index.ts
│
├── docs/                        # Documentation
│   ├── BRIEF.md
│   ├── TECH_CARD.md
│   ├── 01-ARCHITECTURE.md       # This file
│   └── ...
│
└── reference/                   # Reference materials
    ├── templates/
    ├── platforms/
    └── workflows/
```

### Թղթապանակների նկարագրություն

| Թղթապանակ | Նշանակություն |
|------------|----------------|
| `apps/web/app/` | Next.js էջեր և API routes |
| `apps/web/components/` | React կոմպոնենտներ |
| `apps/web/lib/` | Utilities, services, helpers |
| `apps/web/locales/` | i18n թարգմանություններ |
| `packages/db/` | Prisma schema և migrations |
| `packages/ui/` | Shared UI components |
| `packages/design-tokens/` | Design tokens (colors, spacing) |
| `docs/` | Փաստաթղթավորում |

---

## 🔄 ՏՎՅԱԼՆԵՐԻ ՀՈՐԻԶՈՒՆՔՆԵՐ

### Օգտատիրոջ հարցում

```
1. Օգտատեր → Frontend (Next.js)
2. Frontend → API Route (app/api/v1/*)
3. API Route → Service (lib/services/*)
4. Service → Prisma Client (packages/db)
5. Prisma → PostgreSQL (Neon)
6. Պատասխան ← շղթայով
```

### Ինքնություն հաստատում

```
1. Օգտատեր → /login (form)
2. Frontend → POST /api/v1/auth/login
3. API → auth.service.ts (bcryptjs password check)
4. API → JWT token generation (jsonwebtoken)
5. Token → httpOnly cookie (setCookie)
6. Client → AuthContext (token storage)
7. Protected routes → middleware/auth.ts (token verification)
```

---

## 📊 ԲԱԶԱՅԻՆ ՏՎՅԱԼՆԵՐ

### Հիմնական էնտիտիներ

| Էնտիտի | Նկարագրություն |
|--------|-----------------|
| User | Համակարգի օգտատերեր (հաճախորդներ, ադմիններ) |
| Product | Ապրանքներ (բազմալեզու) |
| ProductVariant | Ապրանքի տարբերակներ (գույն, չափ, գին, stock) |
| Category | Կատեգորիաներ (հիերարխիկ, բազմալեզու) |
| Brand | Բրենդեր (բազմալեզու) |
| Attribute | Ատրիբուտներ (գույն, չափ, և այլն) |
| Cart | Զամբյուղ (user կամ guest) |
| CartItem | Զամբյուղի ապրանքներ |
| Order | Պատվերներ |
| OrderItem | Պատվերի ապրանքներ |
| Payment | Վճարումներ |
| ProductReview | Ապրանքի ակնարկներ |

### ER դիագրամ

```
[User] 1──────* [Order]
   │                │
   │                * 
   *          [OrderItem]
[Address]          │
                   *
              [Product]
                   │
                   * 
              [ProductVariant]
                   │
                   * 
              [CartItem] *──1 [Cart]
                   │
                   * 
              [ProductReview]
```

### Մանրամասն սխեմա
Տե՛ս `packages/db/prisma/schema.prisma` կամ `docs/05-DATABASE.md` (ստեղծվելու է)

---

## 🔌 ԻՆՏԵԳՐԱՑԻԱՆԵՐ

| Սերվիս | Նշանակություն | Փաստաթղթավորում |
|--------|----------------|-------------------|
| Neon | PostgreSQL database | [Neon Docs](https://neon.tech/docs) |
| Meilisearch | Որոնում | [Meilisearch Docs](https://www.meilisearch.com/docs) |
| Upstash Redis | Cache, rate limiting | [Upstash Redis Docs](https://upstash.com/docs/redis) |
| Cloudflare R2 | Ֆայլերի պահոց (քննարկման) | [R2 Docs](https://developers.cloudflare.com/r2/) |
| Vercel | Frontend hosting | [Vercel Docs](https://vercel.com/docs) |

---

## 🔐 ԱՆՎՏԱՆԳՈՒԹՅՈՒՆ

### Ինքնություն հաստատում
- **Մեթոդ.** JWT (jsonwebtoken)
- **Պահպանում.** httpOnly cookies
- **Կյանքի տևողություն.** [քննարկել]

### Ինքնորոշում
- **Մոդել.** RBAC (Role-Based Access Control)
- **Դերեր.** `customer`, `admin` (User.roles[])

### Պաշտպանություն
- HTTPS ամենուր (production)
- CORS (քննարկել — կարգավորել)
- Rate limiting (քննարկել — ավելացնել)
- Մուտքային տվյալների վալիդացիա (Zod)
- Գաղտնաբառի հեշավորում (bcryptjs → քննարկել argon2)

---

## 🚀 ԴԵՊԼՈՅ

### Շրջակա միջավայրեր

| Շրջակա միջավայր | URL | Նշանակություն |
|------------------|-----|----------------|
| Development | localhost:3000 | Տեղական զարգացում |
| Production | [Vercel URL] | Production |

### Ինֆրակառուցվածք

```
┌─────────────────────────────────────────┐
│           Vercel (Frontend)              │
│  - Next.js build & deploy                │
│  - Edge Network (CDN)                    │
│  - Environment variables                 │
└──────────────┬──────────────────────────┘
               │
               │ API calls
               │
┌──────────────▼──────────────────────────┐
│         Neon (PostgreSQL)                │
│  - Managed PostgreSQL                    │
│  - Connection pooling                    │
│  - Branching (dev/prod)                  │
└─────────────────────────────────────────┘

External Services:
- Meilisearch (search)
- Redis (cache)
- Cloudflare R2 (files - քննարկման)
```

---

## 📈 ՄԱՍՇՏԱԲԱՎՈՐՈՒՄ

### Ընթացիկ վիճակ
- **Օգտատերեր.** [քննարկել]
- **Հարցումներ/վրկ.** [քննարկել]
- **ԲԴ չափ.** [քննարկել]

### Մասշտաբավորման պլան
1. **Connection pooling** — Neon-ի pooler (արդեն)
2. **Cache** — Redis (արդեն)
3. **CDN** — Vercel Edge Network (արդեն)
4. **Rate limiting** — ավելացնել (քննարկել)
5. **Database indexes** — Prisma schema-ում (արդեն)

---

## 📋 ՀԻՄՆԱԿԱՆ ՈՐՈՇՈՒՄՆԵՐ

| Որոշում | Ընտրություն | Պատճառ |
|---------|---------------|--------|
| Monorepo | Turborepo | Կոդի կիսում, արագ build |
| Frontend | Next.js 16 (App Router) | SSR, SEO, API Routes |
| ORM | Prisma 5.x | Type-safe, միգրացիաներ |
| Database | PostgreSQL (Neon) | Managed, serverless-ready |
| State | useState / Context API | Պարզ, Next.js-ի հետ |
| Ոճեր | Tailwind CSS 3.x | Utility-first, արագ |
| Auth | Custom JWT | Պարզ, ամբողջական վերահսկում |
| i18n | Custom (locales/) | Բազմալեզու աջակցություն |
| Որոնում | Meilisearch | Արագ, typo-tolerant |
| Cache | Upstash Redis REST | Rate limit, query cache |

---

## 🔗 ԿԱՊՎԱԾ ՓԱՍՏԱԹՂԹԵՐ

- [TECH_CARD.md](./TECH_CARD.md) — Տեխնոլոգիական քարտ
- [02-TECH_STACK.md](./02-TECH_STACK.md) — Տեխնոլոգիաների stack (ստեղծվելու է)
- [04-API.md](./04-API.md) — API փաստաթղթավորում (ստեղծվելու է)
- [05-DATABASE.md](./05-DATABASE.md) — ԲԴ սխեմա (ստեղծվելու է)
- [FIXES_PLAN.md](./FIXES_PLAN.md) — Ուղղումների պլան

---

**Փաստաթղթի տարբերակ.** 1.0
**Ամսաթիվ.** 2026-02-12




