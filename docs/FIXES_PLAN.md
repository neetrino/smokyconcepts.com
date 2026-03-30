# Ուղղումների պլան — WhiteShop-Template

Փաստաթուղթը ամրագրում է բոլոր հայտնաբերված անհամապատասխանությունները 00-core և կապված կանոնների նկատմամբ։

- **Նախահերթ.** 🔴 1 = բարձր · 🟡 2 = միջին · 🟢 3 = ցածր
- **Վերջին թարմացում.** 2026-02-17

---

## Ինչպես օգտագործել

1. Ընտրի՛ր **Փուլ** (ներքևում) և կատարի՛ր կետերը հերթով։
2. Յուրաքանչյուր կետի դիմաց checkbox-ը նշի՛ր `[x]` ավարտելուց հետո։
3. **Որտեղ** — ֆայլ/թղթապանակ; **Ինչ անել** — կոնկրետ քայլեր։

---

## Փուլ 1 — Փաստաթղթեր (սկսել այստեղից)

- [x] **1.1** 🟢 **Նախագծի չափը 00-core-ում**
  - **Որտեղ:** `.cursor/rules/00-core.mdc` (բաժին «ՆԱԽԱԳԾԻ ՉԱՓԸ»)
  - **Ինչ անել:** Փոխարինել «ՉԱՓԸ ՉԷ ՈՐՈՇՎԵԼ» →  
    `✅ **ՉԱՓԸ. B** — միջին, կառուցվածք. feature-based (src/features/*, src/shared/*)`

- [x] **1.2** 🟢 **TECH_CARD.md**
  - **Որտեղ:** `docs/TECH_CARD.md`
  - **Ինչ անել:** ✅ Ստեղծված է և լրացված է B չափով, առկա տեխնոլոգիաների հիման վրա
  - **Նշում:** Պարունակում է 1–11 բաժիններ, ադապտիվ արժեքներ քննարկման համար

- [x] **1.3** 🟢 **01-ARCHITECTURE.md**
  - **Որտեղ:** `docs/01-ARCHITECTURE.md`
  - **Ինչ անել:** ✅ Ստեղծված է և լրացված է B չափով
  - **Նշում:** Նկարագրում է monorepo կառուցվածքը, apps/web, packages/db, packages/ui, packages/design-tokens, API routes, i18n

- [x] **1.4** 🟢 **BRIEF.md**
  - **Որտեղ:** `docs/BRIEF.md`
  - **Ինչ անել:** ✅ Լրացված է բոլոր բաժինները — նկարագրություն, թիրախային լսարան, ֆունկցիաներ, stack, դիզայն, ինտեգրացիաներ, սահմանափակումներ
  - **Նշում:** Հիմնված է TECH_CARD.md-ի և 01-ARCHITECTURE.md-ի տվյալների վրա

- [x] **1.5** 🟢 **Այլ docs**
  - **Որտեղ:** `docs/`
  - **Ինչ անել:** ✅ B չափի համար ստեղծված են — PROGRESS.md, 02-TECH_STACK.md, 04-API.md, 05-DATABASE.md
  - **Նշում:** DECISIONS.md-ն կստեղծվի անհրաժեշտության դեպքում

- [x] **1.6** 🟢 **.env.example**
  - **Որտեղ:** արմատ և `apps/web/`
  - **Ինչ անել:** ✅ Ստեղծված են `.env.example` (արմատ) և `apps/web/.env.example`
  - **Նշում:** Պարունակում են բոլոր env փոփոխականները նկարագրություններով և օրինակներով

---

## Փուլ 1.7 — Որակի ստուգումներ (ESLint / Lint)

Նպատակը — ամրապնդել 00-core, 02-coding-standards, 03-typescript կանոնները ավտոմատ ստուգումներով, որպեսզի նոր խախտումներ չթափանցեն։

- [x] **1.7.1** 🟢 **ESLint + TypeScript արմատում**
  - **Որտեղ:** արմատ — `.eslintrc.js`
  - **Ինչ անել:** ✅ Ավելացված են TypeScript parser (`@typescript-eslint/parser`) և plugin (`@typescript-eslint/eslint-plugin`); `extends`-ում ավելացված է `plugin:@typescript-eslint/recommended`; rule `@typescript-eslint/no-explicit-any: error` (00-core, 03-typescript — any արգելված)
  - **Նշում:** Ավելացված են dependencies package.json-ում, config-ը թարմացված է

- [x] **1.7.2** 🟢 **Չափերի rule-ներ (02-coding-standards)**
  - **Որտեղ:** արմատ ESLint config
  - **Ինչ անել:** ✅ Ավելացված են `max-lines: ['warn', { max: 300 }]`, `max-depth: ['warn', { max: 3 }]`, `max-lines-per-function: ['warn', { max: 50 }]` (02-coding-standards — ֆայլեր ≤300 տող, ֆունկցիաներ ≤50 տող, բնիկություն ≤3 մակարդակ)

- [ ] **1.7.3** 🟡 **Named export (00-core)**
  - **Որտեղ:** արմատ ESLint config
  - **Ինչ անել:** Ավելացնել `import/no-default-export` (eslint-plugin-import) — error; Next.js `app/` page/layout route ֆայլերի համար կարգավորել ignore/exception (օր. ignore pattern `**/app/**/page.tsx`, `**/layout.tsx`)

- [x] **1.7.4** 🟢 **Արմատում lint script**
  - **Որտեղ:** արմատ `package.json`
  - **Ինչ անել:** ✅ Ավելացված է `"lint": "turbo run lint"` script; `apps/web`-ում `npm run lint` արդեն կա և աշխատում է (next lint)

- [ ] **1.7.5** 🟡 **apps/web — next lint և խիստ TypeScript**
  - **Որտեղ:** `apps/web/` — `.eslintrc.cjs` կամ արմատ config-ի override
  - **Ինչ անել:** Համոզվել, որ `next lint` օգտագործում է `eslint-config-next` և (անհրաժեշտության դեպքում) արմատի TypeScript strict rule-ները; եթե արմատ config-ը extend է արվում — override-ում միացնել `@typescript-eslint/no-explicit-any: error`

- [ ] **1.7.6** 🟡 **CI-ում lint**
  - **Որտեղ:** CI config (GitHub Actions / այլ) — `.github/workflows/` կամ նման
  - **Ինչ անել:** Ավելացնել job/step — `pnpm run lint` (կամ `npm run lint`) build-ից առաջ; lint ձախողում = pipeline ձախողում

---

## Փուլ 2 — Կրիտիկական կոդ

- [x] **2.1** 🟢 **TypeScript `any`-ների ուղղում (API routes + Services + Hooks + Components)**
  - **Որտեղ:** `apps/web/app/api/`, `apps/web/lib/services/`, `apps/web/app/products/[slug]/`
  - **Ինչ անել:** ✅ 
    - API routes: Ստեղծված է `lib/types/errors.ts` (ApiError, AppError, toApiError helper); փոխարինված են `error: any` → `error: unknown` (admin/messages, users/*, auth/login, orders/checkout)
    - Services: 
      - `products-slug.service.ts`: catch blocks (`error: any` → `error: unknown`), variant types (`any[]` → `string[]`, `ProductVariantWithOptions`), productAttributes access (`as any` → type guards)
      - `products-find-transform.service.ts`: return type (`any[]` → explicit type), variant processing (`any` → removed)
      - `orders.service.ts`: 
        - parameter type (`data: any` → `data: CheckoutData`), ստեղծված է `lib/types/checkout.ts`
        - cart items types (`item: any` → `CartItemWithRelations`, `ProductVariantWithProduct`)
        - transaction (`tx: any` → inferred type)
        - catch blocks (`error: any` → `error: unknown`)
        - order items (`item: any` → `OrderItemWithVariant`)
        - media processing (`as any` → type guards)
        - options mapping (`opt: any` → removed)
    - Hooks: `useProductPage.ts` - variantImages (`any[]` → `string[]`), position access (`as any` → type guards), catch blocks (`error: any` → `error: unknown`), variants forEach (`v: any` → removed), attribute values find (`v: any` → removed)
    - Components: `page.tsx` - cart find (`i: any` → type guard)
  - **Նշում:** Հիմնական `any`-ները ուղղված են: Մնացած components-ում և այլ hooks-ում `any`-ները կարող են լինել, բայց դրանք ավելի քիչ կարևոր են

- [x] **2.2** 🟢 **next.config — ignoreBuildErrors**
  - **Որտեղ:** `apps/web/next.config.js`
  - **Ինչ անել:** ✅ Հեռացված է `ignoreBuildErrors: true` (typescript բլոկից); build-ը այժմ կձախողվի TypeScript սխալների դեպքում, ինչը ապահովում է type safety production builds-ում

- [x] **3.1** 🟢 **Logger (console → logger)**
  - **Որտեղ:** API routes, lib/services, components
  - **Ինչ անել:** ✅ Ներմուծված է կենտրոնացված logger (`apps/web/lib/utils/logger.ts`); հիմնական API routes-ում և services-ում (orders, products-slug, contact, admin/messages, auth, users) `console.log`/`console.error`/`console.warn` փոխարինված են logger-ով: Մնացած API routes-ում և services-ում console-ները կարող են փոխարինվել ավելի ուշ (scripts/ — մնացել են console, ինչպես պահանջվում է)

- [x] **5.1** 🔴 **Մեծ ֆայլեր (>300 տող)**
  - **Որտեղ:** `apps/web/components/ProductCard.tsx` (~730), `apps/web/components/RelatedProducts.tsx` (~598), `apps/web/components/CategoryNavigation.tsx` (~492), `apps/web/components/ProductReviews.tsx` (~504), `apps/web/app/admin/orders/OrdersPageContent.tsx` (~700), `apps/web/app/admin/products/add/hooks/useProductEditMode.tsx` (~523)
  - **Ինչ անել:** ✅ Բաժանված են ենթակոմպոնենտների, hooks, utils
  - **Արդյունք:**
    - `ProductCard.tsx`: 730 → 121 տող
      - Hooks: `useWishlist`, `useCompare`, `useAddToCart`, `useCurrency`
      - Components: `ProductCardImage`, `ProductCardInfo`, `ProductCardActions`, `ProductColors`, `ProductCardList`, `ProductCardGrid`
    - `RelatedProducts.tsx`: 598 → 225 տող
      - Hooks: `useRelatedProducts`, `useCarousel`, `useVisibleCards`
      - Components: `RelatedProductCard`, `CarouselNavigation`, `CarouselDots`
    - `CategoryNavigation.tsx`: 492 → 119 տող
      - Utils: `flattenCategories`, `getCategoryIcon`
      - Hooks: `useCategories`, `useCategoryProducts`, `useCategoryScroll`
      - Components: `CategoryIcon`, `CategoryItem`, `CategoryScrollButtons`, `CategoryNavigationLoading`
    - `ProductReviews.tsx`: 504 → 121 տող
      - Utils: `formatDate`, `calculateAverageRating`, `calculateRatingDistribution`
      - Hooks: `useReviews`, `useReviewForm`
      - Components: `ReviewItem`, `ReviewRating`, `ReviewSummary`, `ReviewForm`, `ReviewList`, `ProductReviewsLoading`
    - `OrdersPageContent.tsx`: 700 → 115 տող
      - Utils: `orderUtils.ts` (getStatusColor, getPaymentStatusColor, getColorValue)
      - Components: `OrdersFilters`, `BulkSelectionControls`, `OrdersTable`, `OrderRow`, `OrdersPagination`, `OrderDetailsModal`, `OrderDetailsSummary`, `OrderDetailsAddresses`, `OrderDetailsTotals`, `OrderDetailsItems`
    - `useProductEditMode.tsx`: 523 → 280 տող
      - Utils: `variantAttributeExtraction.ts` (extractColor, extractSize, extractColorFromOptions, extractSizeFromOptions, extractColorFromSku, extractSizeFromSku), `colorDataBuilder.ts` (createDefaultColorData, updateDefaultColorData, createColorData, updateColorData), `variantImageCollector.ts` (collectVariantImagesFromColors, collectVariantImagesFromProductVariants), `productTypeDetector.ts` (hasVariantsWithAttributes), `productFormDataBuilder.ts` (buildFormData)
    - `add/page.tsx`: 489 → 280 տող
      - Hooks: `useProductFormState` (արդեն գոյություն ուներ, օգտագործվում է), `useProductFormCallbacks` (handleTitleChange, isClothingCategory, handleAttributeToggle, handleAttributeRemove, handleVariantDelete, handleVariantAdd), `useProductAttributeHelpers` (colorAttribute, sizeAttribute, getColorAttribute, getSizeAttribute)
      - Components: `AddProductFormContent` (form JSX content)
    - `quick-settings/QuickSettingsContent.tsx`: 584 → 150 տող
      - Components: `AdminSidebar`, `GlobalDiscountCard`, `QuickInfoCard`, `CategoryDiscountsCard`, `BrandDiscountsCard`, `ProductDiscountsCard`
    - `admin/page.tsx`: 700 → 120 տող
      - Hooks: `useAdminDashboard` (բոլոր data fetching functions)
      - Utils: `dashboardUtils` (formatCurrency, formatDate)
      - Components: `AdminSidebar`, `StatsGrid`, `RecentOrdersCard`, `TopProductsCard`, `UserActivityCard`, `QuickActionsCard`

- [ ] **6.1** 🔴 **Դատարկ catch**
  - **Որտեղ:** `apps/web/app/products/[slug]/useProductPage.ts` — `catch (err) { }`
  - **Ինչ անել:** Ավելացնել լոգ (logger) և/կամ օգտատիրոջ համար sansitive error; չթողնել դատարկ catch

- [ ] **6.3** 🔴 **error: any API catch-ում**
  - **Որտեղ:** auth/login, auth/register և այլ `route.ts`
  - **Ինչ անել:** Օգտագործել `unknown` + type guard կամ custom AppError; catch-ում any չթողնել

---

## Փուլ 3 — Մնացած

- [ ] **2.3** 🟡 **@ts-expect-error / @ts-ignore**
  - **Որտեղ:** `admin-products-update.service.ts`, `admin-products-create.service.ts` (revalidateTag)
  - **Ինչ անել:** Լուծել revalidateTag տիպի խնդիրը (declaration merging կամ Next types), հեռացնել @ts-expect-error

- [ ] **3.2** 🟡 **Debug console.log**
  - **Որտեղ:** `lib/services/products-find-transform.service.ts` (🎨 Processing variants…)
  - **Ինչ անել:** Հեռացնել կամ փոխարինել logger.debug (միայն dev)

- [ ] **4.1** 🟡 **Inline styles**
  - **Որտեղ:** TeamCarousel, RelatedProducts, ProductReviews, ProductLabels, ProductCard, PriceFilter, HomeCategoriesSidebar, Header, ColorPaletteSelector, ColorFilter, CategoryNavigation, ProductAttributesSelector, OrderDetailsModal, contact/page, orders/[number]/page
  - **Ինչ անել:** Դինամիկ արժեքներ → Tailwind arbitrary values կամ CSS variables; static → Tailwind դասեր

- [ ] **5.2** 🟡 **Այլ 300+ տող ֆայլեր**
  - **Որտեղ:** components, app/admin, hooks
  - **Ինչ անել:** Ստուգել line count, անհրաժեշտության դեպքում բաժանել մոդուլների

- [ ] **6.2** 🟡 **API վալիդացիա Zod-ով**
  - **Որտեղ:** auth/register, auth/login և մյուս API routes
  - **Ինչ անել:** Բոլոր API boundaries-ում body/params վալիդացնել Zod schema-ով (Zod արդեն dependency-ում է)

- [ ] **7.1** 🟡 **Package manager → pnpm**
  - **Որտեղ:** արմատ (package-lock.json)
  - **Ինչ անել:** corepack enable; pnpm-workspace.yaml; pnpm install; ջնջել package-lock.json; README/scripts-ում npm → pnpm

- [ ] **8.1** 🟢 **JSDoc**
  - **Որտեղ:** lib/services, public API
  - **Ինչ անել:** Ավելացնել JSDoc (նկարագրություն, @param, @returns) հրապարակային ֆունկցիաների համար

- [ ] **9.1** 🟡 **TODO բիզնես-լոգիկայում**
  - **Որտեղ:** orders.service.ts (discount, tax, customerLocale, paymentUrl), admin.service.new.ts
  - **Ինչ անել:** Կամ իրականացնել TODO-ները, կամ գրանցել DECISIONS.md/issue և հեռացնել/փոխարինել մեկնաբանությունները

- [ ] **9.2** 🟡 **eslint-disable**
  - **Որտեղ:** admin/users, admin/products, admin/page, useOrders, useVariantGeneration, admin/messages
  - **Ինչ անել:** react-hooks/exhaustive-deps — ավելացնել dependency կամ կարճ մեկնաբանություն; no-unused-vars — ուղղել

- [ ] **9.3** 🟢 **Magic արժեքներ**
  - **Որտեղ:** products-filters.service.ts (SIZE_ORDER)
  - **Ինչ անել:** Տեղափոխել constants ֆայլ, անվանված export

- [ ] **9.4** 🟡 **localhost / env**
  - **Որտեղ:** search.service, cache.service, api-client, products/page
  - **Ինչ անել:** URL-ները env-ից (MEILI_HOST, REDIS_URL, NEXT_PUBLIC_APP_URL); localhost fallback միայն NODE_ENV=development

---

## Ամփոփ

| Փուլ    | Կետեր      | Նախահերթ |
|---------|-------------|-----------|
| Փուլ 1  | 1.1–1.6     | Փաստաթղթեր |
| Փուլ 1.7| 1.7.1–1.7.6 | Որակի ստուգումներ (ESLint / Lint) |
| Փուլ 2  | 2.1, 2.2, 3.1, 5.1, 6.1, 6.3 | Կրիտիկական կոդ |
| Փուլ 3  | 2.3, 3.2, 4.1, 5.2, 6.2, 7.1, 8.1, 9.1–9.4 | Մնացած |

Յուրաքանչյուր կետ ավարտելուց հետո նշի՛ր checkbox-ը `[x]`։
