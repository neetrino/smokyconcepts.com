# Ինչպես աշխատացնել նախագիծը տեղում

Նախագիծը ամբողջությամբ աշխատելու համար կատարի՛ր այս քայլերը։

---

## 1. Կախվածություններ

Նախագիծը աջակցում է **pnpm** և **npm** (root-ում կա և՛ `package-lock.json`, և՛ `pnpm-lock.yaml`)։

```bash
# pnpm (խորհուրդ է տրվում)
pnpm install

# կամ npm
npm install
```

---

## 2. Շրջակա միջավայր (env)

Next.js-ը env-ը կարդում է **apps/web** թղթապանակից։ Պարտադիր է ունենալ **apps/web/.env** (կամ root **.env.local**, եթե script-երը env-ը root-ից բեռնում են)։

### Պարտադիր փոփոխականներ

| Փոփոխական | Նկարագրություն |
|------------|-----------------|
| `DATABASE_URL` | PostgreSQL connection string (Neon կամ local) |
| `JWT_SECRET`   | JWT-ի գաղտնի բանալի (առնվազն 32 նիշ), օր. `openssl rand -base64 32` |

### Ոչ պարտադիր (ֆիչերի համար)

| Փոփոխական | Նկարագրություն |
|------------|-----------------|
| `REDIS_URL` | Redis (cache), օր. `redis://localhost:6379` |
| `MEILI_HOST` / `MEILISEARCH_HOST` | Meilisearch, օր. `http://localhost:7700` |
| `MEILI_MASTER_KEY` / `MEILISEARCH_API_KEY` | Meilisearch API key |
| `NEXT_PUBLIC_APP_URL` | Frontend URL, օր. `http://localhost:3000` |
| `R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL` | Cloudflare R2 (admin product images). R2 bucket-ում միացրու՛ Public access և տեղադրի՛ր `R2_PUBLIC_URL`։ |

**Կաղապար.** Պատճենի՛ր root-ի **env.example** ֆայլը → **apps/web/.env** և լրացրու՛ իրական արժեքներով։

```bash
cp env.example apps/web/.env
# Կամ Windows-ում:
# copy env.example apps\web\.env
```

---

## 3. Տվյալների բազա

1. **PostgreSQL** — աշխատացրու՛ տեղում (Docker, local install) կամ ստեղծի՛ր նախագիծ Neon-ում և ավելացրու՛ `DATABASE_URL`։
2. **Միգրացիաներ.** Prisma schema-ն արդեն կա `packages/db/prisma/`-ում։

```bash
# packages/db-ից (DATABASE_URL պետք է սահմանված լինի)
cd packages/db
npm run db:generate
npm run db:push
# կամ միգրացիաներով:
# npm run db:migrate:deploy
```

Կամ root-ից (env-ը root/.env.local կամ apps/web/.env-ից կկարդացվի, եթե Next-ը արդեն բեռնել է).

```bash
cd packages/db
npm run db:generate
npm run db:push
```

3. **Seed (ընտրովի).** Նախնական տվյալներ.

```bash
cd packages/db
npm run db:seed
```

---

## 4. Աշխատացնել dev server

**Root-ից (Turborepo).**

```bash
npm run dev
```

Սա աշխատացնում է `apps/web`-ի `next dev`-ը։ Բացի՛ր [http://localhost:3000](http://localhost:3000)։

**Միայն web app (apps/web).**

```bash
cd apps/web
npm run dev
```

---

## 5. Ստուգում

- **Գլխավոր / ապրանքներ.** `/` կամ `/products`
- **Admin.** `/admin` (պետք է մուտք admin օգտատիրոջով)
- **API.** օր. `GET /api/v1/...` (ըստ `docs/04-API.md`)

---

## Խնդիրներ

| Ախտանիշ | Լուծում |
|----------|--------|
| `DATABASE_URL is not set` | Ավելացրու՛ `DATABASE_URL` **apps/web/.env**-ում |
| `JWT_SECRET is not set` | Ավելացրու՛ `JWT_SECRET` **apps/web/.env**-ում |
| `turbo run dev` չի գտնում config | Root-ում պետք է լինի **turbo.json** (արդեն ավելացված) |
| Prisma Client not generated | `cd packages/db && npm run db:generate` |
| Build fails on migrations | Ստուգի՛ր `DATABASE_URL`; migrations-ը run է լինում `prebuild:migrate`-ով |

---

**Փաստաթղթեր.** `env.example` (root), `docs/TECH_CARD.md`, `docs/01-ARCHITECTURE.md`։
