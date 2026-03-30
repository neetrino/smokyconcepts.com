# Նախագծի տեխզադրանք

> Լրացրու՛ այս ֆայլը զարգացումը սկսելուց առաջ։
> Լրացնելուց հետո — ուղարկի՛ր AI-ասիստենտին անալիզի և մեկնարկի համար `21-project-onboarding.mdc`-ի համաձայն։

---

## Նկարագրություն

WhiteShop Template-ը պրոֆեսիոնալ e-commerce հարթակ է, որը ապահովում է ապրանքների կատալոգ, զամբյուղ, պատվերների կառավարում, admin panel և բազմալեզու աջակցություն։ Նախագիծը կառուցված է monorepo կառուցվածքով (Turborepo), Next.js 16.x frontend-ով և PostgreSQL տվյալների բազայով։

## Թիրախային լսարան

- **Հաճախորդներ.** Դիտում են ապրանքները, ավելացնում են զամբյուղ, կատարում են պատվերներ, կառավարում են իրենց պրոֆիլը
- **Ադմիններ.** Կառավարում են ապրանքները, կատեգորիաները, պատվերները, օգտատերերին, վիճակագրությունը

## Հիմնական ֆունկցիաներ (առաջնայնացված)

1. **E-commerce ֆունկցիոնալ** — առաջնայնություն. բարձր
   - Ապրանքների կատալոգ (բազմալեզու)
   - Կատեգորիաներ (հիերարխիկ)
   - Զամբյուղ և checkout
   - Պատվերների կառավարում

2. **Admin panel** — առաջնայնություն. բարձր
   - Ապրանքների, կատեգորիաների, բրենդերի կառավարում
   - Պատվերների և օգտատերերի կառավարում
   - Վիճակագրություն և անալիտիկա

3. **Ինքնություն հաստատում** — առաջնայնություն. բարձր
   - Custom JWT authentication
   - RBAC (customer, admin)

4. **Որոնում** — առաջնայնություն. միջին
   - Meilisearch ինտեգրացիա

5. **i18n** — առաջնայնություն. միջին
   - Բազմալեզու աջակցություն (hy, en, ru)

6. **Cache** — առաջնայնություն. ցածր
   - Redis cache

## Stack (եթե որոշված է)

- **Տարբերակ A** — fullstack Next.js Vercel-ում ✅ (ընտրված)
  - Frontend: Next.js 16.x (App Router)
  - Backend: Next.js API Routes
  - Database: PostgreSQL (Neon)
  - Hosting: Vercel

## Դիզայն

- Figma. [հղում — քննարկել]
- UI Kit / դիզայն-համակարգ. Custom (@shop/ui package)

## Ինտեգրացիաներ

- [x] Աուտենտիֆիկացիա (Custom JWT)
- [x] Որոնում (Meilisearch)
- [x] Cache (Redis / ioredis)
- [ ] Ֆայլերի պահոց (Cloudflare R2 — քննարկել)
- [ ] Վճարային համակարգ (Stripe / YooKassa / այլ — քննարկել)
- [ ] Email mailing (Resend / SendGrid / այլ — քննարկել)
- [ ] Error tracking (Sentry — քննարկել)

## Կոնտենտի լեզու

- Ինտերֆեյսի հիմնական լեզու. բազմալեզու (hy, en, ru)
- Պե՞տք է ինտերնացիոնալացում (i18n). այո ✅
  - Custom i18n լուծում (locales/ folders)
  - Լեզուներ: Հայերեն (hy), Անգլերեն (en), Ռուսերեն (ru)

## Սահմանափակումներ

- Ժամկետներ. առանց դեդլայնի
- Բյուջե. 
  - Neon PostgreSQL (free tier / paid)
  - Vercel (free tier / paid)
  - Meilisearch (self-hosted / cloud)
  - Redis (self-hosted / Upstash)
  - Cloudflare R2 (քննարկել)
- Տեխնիկական. 
  - Monorepo կառուցվածք (Turborepo)
  - TypeScript strict mode
  - Next.js 16.x App Router

## Լրացուցիչ

- **Ճարտարապետություն.** Monorepo (Turborepo) — apps/web, packages/db, packages/ui, packages/design-tokens
- **Package manager.** pnpm
- **Տվյալների բազա.** PostgreSQL (Neon) + Prisma 5.x ORM
- **State management.** useState / Context API (AuthContext)
- **Ձևեր.** React Hook Form + Zod validation
- **Ոճեր.** Tailwind CSS 3.x
- **Փաստաթղթավորում.** docs/01-ARCHITECTURE.md, docs/TECH_CARD.md
