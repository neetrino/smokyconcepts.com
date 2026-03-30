# Տվյալների բազայի սխեմա

> WhiteShop Template PostgreSQL տվյալների բազայի ամբողջական նկարագրություն։

**Database.** PostgreSQL 17 (Neon)
**ORM.** Prisma 5.x
**Schema Location.** `packages/db/prisma/schema.prisma`
**Վերջին թարմացում.** 2026-02-12

---

## 📊 ԱՄԲՈՂՋԱԿ

### Հիմնական էնտիտիներ

| Էնտիտի | Նկարագրություն | Աղյուսակ |
|--------|-----------------|----------|
| User | Օգտատերեր (հաճախորդներ, ադմիններ) | `users` |
| Address | Օգտատիրոջ հասցեներ | `addresses` |
| Product | Ապրանքներ | `products` |
| ProductVariant | Ապրանքի տարբերակներ | `product_variants` |
| ProductTranslation | Ապրանքի թարգմանություններ | `product_translations` |
| Category | Կատեգորիաներ | `categories` |
| CategoryTranslation | Կատեգորիայի թարգմանություններ | `category_translations` |
| Brand | Բրենդեր | `brands` |
| BrandTranslation | Բրենդի թարգմանություններ | `brand_translations` |
| Attribute | Ատրիբուտներ (գույն, չափ) | `attributes` |
| AttributeValue | Ատրիբուտի արժեքներ | `attribute_values` |
| Cart | Զամբյուղներ | `carts` |
| CartItem | Զամբյուղի ապրանքներ | `cart_items` |
| Order | Պատվերներ | `orders` |
| OrderItem | Պատվերի ապրանքներ | `order_items` |
| Payment | Վճարումներ | `payments` |
| OrderEvent | Պատվերի իրադարձություններ | `order_events` |
| ProductReview | Ապրանքի ակնարկներ | `product_reviews` |
| Settings | Կարգավորումներ | `settings` |
| ContactMessage | Կոնտակտային հաղորդագրություններ | `contact_messages` |

---

## 👤 User & Address

### User
Օգտատերեր (հաճախորդներ, ադմիններ):

**Հիմնական դաշտեր:**
- `id` — Unique identifier (cuid)
- `email` — Email (unique, optional)
- `phone` — Հեռախոս (unique, optional)
- `passwordHash` — Գաղտնաբառի hash
- `firstName`, `lastName` — Անուն, ազգանուն
- `roles` — Դերեր (array: `["customer"]`, `["admin"]`)
- `locale` — Լեզու (default: "en")
- `blocked` — Արգելված
- `deletedAt` — Soft delete

**Relations:**
- `addresses` — Հասցեներ (1:N)
- `carts` — Զամբյուղներ (1:N)
- `orders` — Պատվերներ (1:N)
- `reviews` — Ակնարկներ (1:N)

### Address
Օգտատիրոջ հասցեներ:

**Հիմնական դաշտեր:**
- `id` — Unique identifier
- `userId` — User ID (foreign key)
- `addressLine1`, `addressLine2` — Հասցե
- `city`, `state`, `postalCode` — Քաղաք, մարզ, փոստային կոդ
- `countryCode` — Երկրի կոդ (default: "AM")
- `isDefault` — Լռելյայն հասցե

---

## 📦 Product & Variants

### Product
Ապրանքներ (բազմալեզու):

**Հիմնական դաշտեր:**
- `id` — Unique identifier
- `brandId` — Բրենդ ID (optional)
- `skuPrefix` — SKU prefix
- `media` — Պատկերներ (JSON array)
- `published` — Հրապարակված
- `featured` — Առաջարկվող
- `publishedAt` — Հրապարակման ամսաթիվ
- `categoryIds` — Կատեգորիաների ID-ներ (array)
- `primaryCategoryId` — Հիմնական կատեգորիա
- `attributeIds` — Ատրիբուտների ID-ներ (array)
- `discountPercent` — Զեղչի տոկոս
- `deletedAt` — Soft delete

**Relations:**
- `brand` — Բրենդ (N:1)
- `categories` — Կատեգորիաներ (N:M)
- `variants` — Տարբերակներ (1:N)
- `translations` — Թարգմանություններ (1:N)
- `labels` — Պիտակներ (1:N)
- `cartItems` — Զամբյուղի ապրանքներ (1:N)
- `reviews` — Ակնարկներ (1:N)

### ProductTranslation
Ապրանքի թարգմանություններ:

**Հիմնական դաշտեր:**
- `id` — Unique identifier
- `productId` — Product ID
- `locale` — Լեզու (hy, en, ru)
- `title` — Վերնագիր
- `slug` — URL slug
- `subtitle` — Ենթավերնագիր
- `descriptionHtml` — Նկարագրություն (HTML)
- `seoTitle`, `seoDescription` — SEO

**Unique:** `[productId, locale]`

### ProductVariant
Ապրանքի տարբերակներ (գույն, չափ, գին):

**Հիմնական դաշտեր:**
- `id` — Unique identifier
- `productId` — Product ID
- `sku` — SKU (unique)
- `barcode` — Barcode
- `price` — Գին
- `compareAtPrice` — Համեմատական գին
- `cost` — Ինքնարժեք
- `stock` — Պաշար
- `stockReserved` — Պաշար (պահուստ)
- `weightGrams` — Քաշ (գրամ)
- `imageUrl` — Պատկեր URL
- `published` — Հրապարակված
- `attributes` — Ատրիբուտներ (JSONB)

**Relations:**
- `product` — Ապրանք (N:1)
- `options` — Տարբերակի ընտրանքներ (1:N)
- `cartItems` — Զամբյուղի ապրանքներ (1:N)
- `orderItems` — Պատվերի ապրանքներ (1:N)

### ProductVariantOption
Տարբերակի ընտրանքներ (կապ AttributeValue-ի հետ):

**Հիմնական դաշտեր:**
- `id` — Unique identifier
- `variantId` — Variant ID
- `attributeId` — Attribute ID (optional)
- `attributeKey` — Attribute key
- `valueId` — AttributeValue ID (optional)
- `value` — Արժեք (optional)

---

## 📂 Category & Brand

### Category
Կատեգորիաներ (հիերարխիկ, բազմալեզու):

**Հիմնական դաշտեր:**
- `id` — Unique identifier
- `parentId` — Ծնող կատեգորիա ID (optional)
- `position` — Դիրք
- `published` — Հրապարակված
- `requiresSizes` — Պահանջում է չափեր
- `media` — Պատկերներ (JSON array)
- `deletedAt` — Soft delete

**Relations:**
- `parent` — Ծնող կատեգորիա (N:1)
- `children` — Ենթակատեգորիաներ (1:N)
- `products` — Ապրանքներ (N:M)
- `translations` — Թարգմանություններ (1:N)

### CategoryTranslation
Կատեգորիայի թարգմանություններ:

**Հիմնական դաշտեր:**
- `id` — Unique identifier
- `categoryId` — Category ID
- `locale` — Լեզու
- `title` — Վերնագիր
- `slug` — URL slug
- `fullPath` — Ամբողջական ուղի
- `description` — Նկարագրություն
- `seoTitle`, `seoDescription` — SEO

**Unique:** `[categoryId, locale]`

### Brand
Բրենդեր (բազմալեզու):

**Հիմնական դաշտեր:**
- `id` — Unique identifier
- `slug` — URL slug (unique)
- `logoUrl` — Լոգո URL
- `published` — Հրապարակված
- `deletedAt` — Soft delete

**Relations:**
- `products` — Ապրանքներ (1:N)
- `translations` — Թարգմանություններ (1:N)

### BrandTranslation
Բրենդի թարգմանություններ:

**Հիմնական դաշտեր:**
- `id` — Unique identifier
- `brandId` — Brand ID
- `locale` — Լեզու
- `name` — Անվանում
- `description` — Նկարագրություն

**Unique:** `[brandId, locale]`

---

## 🏷️ Attributes

### Attribute
Ատրիբուտներ (գույն, չափ, և այլն):

**Հիմնական դաշտեր:**
- `id` — Unique identifier
- `key` — Key (unique, e.g., "color", "size")
- `type` — Տիպ (default: "select")
- `filterable` — Ֆիլտրելի (default: true)
- `position` — Դիրք

**Relations:**
- `values` — Արժեքներ (1:N)
- `translations` — Թարգմանություններ (1:N)
- `productAttributes` — Ապրանք-ատրիբուտ կապեր (N:M)

### AttributeValue
Ատրիբուտի արժեքներ:

**Հիմնական դաշտեր:**
- `id` — Unique identifier
- `attributeId` — Attribute ID
- `value` — Արժեք
- `position` — Դիրք
- `colors` — Գույներ (JSON array)
- `imageUrl` — Պատկեր URL

**Relations:**
- `attribute` — Ատրիբուտ (N:1)
- `translations` — Թարգմանություններ (1:N)
- `variantOptions` — Տարբերակի ընտրանքներ (1:N)

### AttributeTranslation / AttributeValueTranslation
Ատրիբուտների և արժեքների թարգմանություններ:

**Unique:** `[attributeId/attributeValueId, locale]`

---

## 🛒 Cart

### Cart
Զամբյուղներ (user կամ guest):

**Հիմնական դաշտեր:**
- `id` — Unique identifier
- `userId` — User ID (optional, null for guest)
- `guestToken` — Guest token (unique, optional)
- `locale` — Լեզու (default: "en")
- `couponCode` — Կուպոնի կոդ
- `abandoned` — Թողնված
- `abandonedAt` — Թողնված ամսաթիվ
- `expiresAt` — Լրացման ամսաթիվ

**Relations:**
- `user` — Օգտատեր (N:1, optional)
- `items` — Զամբյուղի ապրանքներ (1:N)

### CartItem
Զամբյուղի ապրանքներ:

**Հիմնական դաշտեր:**
- `id` — Unique identifier
- `cartId` — Cart ID
- `variantId` — Variant ID
- `productId` — Product ID
- `quantity` — Քանակ
- `priceSnapshot` — Գնի snapshot

**Relations:**
- `cart` — Զամբյուղ (N:1)
- `variant` — Տարբերակ (N:1)
- `product` — Ապրանք (N:1)

---

## 📋 Order

### Order
Պատվերներ:

**Հիմնական դաշտեր:**
- `id` — Unique identifier
- `number` — Պատվերի համար (unique)
- `userId` — User ID (optional)
- `status` — Կարգավիճակ (default: "pending")
- `paymentStatus` — Վճարման կարգավիճակ (default: "pending")
- `fulfillmentStatus` — Կատարման կարգավիճակ (default: "unfulfilled")
- `subtotal` — Ենթագումար
- `discountAmount` — Զեղչի գումար
- `shippingAmount` — Առաքման գումար
- `taxAmount` — Հարկի գումար
- `total` — Ընդհանուր
- `currency` — Արտարժույթ (default: "AMD")
- `customerEmail`, `customerPhone` — Հաճախորդի կոնտակտ
- `customerLocale` — Հաճախորդի լեզու (default: "en")
- `billingAddress`, `shippingAddress` — Հասցեներ (JSON)
- `shippingMethod` — Առաքման մեթոդ
- `trackingNumber` — Հետևման համար
- `notes`, `adminNotes` — Նշումներ
- `paidAt`, `fulfilledAt`, `cancelledAt` — Ժամանակագրություն

**Relations:**
- `user` — Օգտատեր (N:1, optional)
- `items` — Պատվերի ապրանքներ (1:N)
- `payments` — Վճարումներ (1:N)
- `events` — Իրադարձություններ (1:N)

### OrderItem
Պատվերի ապրանքներ:

**Հիմնական դաշտեր:**
- `id` — Unique identifier
- `orderId` — Order ID
- `variantId` — Variant ID (optional)
- `productTitle` — Ապրանքի վերնագիր
- `variantTitle` — Տարբերակի վերնագիր
- `sku` — SKU
- `quantity` — Քանակ
- `price` — Գին
- `total` — Ընդհանուր
- `imageUrl` — Պատկեր URL

**Relations:**
- `order` — Պատվեր (N:1)
- `variant` — Տարբերակ (N:1, optional)

### Payment
Վճարումներ:

**Հիմնական դաշտեր:**
- `id` — Unique identifier
- `orderId` — Order ID
- `provider` — Մատակարար
- `providerTransactionId` — Transaction ID
- `method` — Մեթոդ
- `amount` — Գումար
- `currency` — Արտարժույթ (default: "AMD")
- `status` — Կարգավիճակ (default: "pending")
- `cardLast4`, `cardBrand` — Քարտի տվյալներ
- `errorCode`, `errorMessage` — Սխալներ
- `providerResponse` — Provider response (JSON)
- `idempotencyKey` — Idempotency key
- `completedAt`, `failedAt` — Ժամանակագրություն

**Relations:**
- `order` — Պատվեր (N:1)

### OrderEvent
Պատվերի իրադարձություններ (լոգ):

**Հիմնական դաշտեր:**
- `id` — Unique identifier
- `orderId` — Order ID
- `type` — Տիպ
- `data` — Տվյալներ (JSON)
- `userId` — User ID (optional)
- `ipAddress` — IP հասցե

**Relations:**
- `order` — Պատվեր (N:1)

---

## ⭐ Reviews

### ProductReview
Ապրանքի ակնարկներ:

**Հիմնական դաշտեր:**
- `id` — Unique identifier
- `productId` — Product ID
- `userId` — User ID
- `rating` — Վարկանիշ (1-5)
- `comment` — Մեկնաբանություն
- `published` — Հրապարակված (default: true)

**Relations:**
- `product` — Ապրանք (N:1)
- `user` — Օգտատեր (N:1)

**Unique:** `[productId, userId]` — Մեկ ակնարկ մեկ օգտատիրոջ համար

---

## ⚙️ Settings & Contact

### Settings
Կարգավորումներ (key-value):

**Հիմնական դաշտեր:**
- `id` — Unique identifier
- `key` — Key (unique)
- `value` — Արժեք (JSON)
- `description` — Նկարագրություն

### ContactMessage
Կոնտակտային հաղորդագրություններ:

**Հիմնական դաշտեր:**
- `id` — Unique identifier
- `name` — Անուն
- `email` — Email
- `subject` — Առարկա
- `message` — Հաղորդագրություն

---

## 🔗 ER Diagram

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
                   │
                   * 
              [Category] *──* [Product]
                   │
                   * 
              [CategoryTranslation]
```

---

## 📊 Indexes

### User
- `@@index([deletedAt])` — Soft delete

### Product
- `@@index([brandId])` — Բրենդ
- `@@index([published, publishedAt])` — Հրապարակված
- `@@index([featured])` — Առաջարկվող
- `@@index([deletedAt])` — Soft delete

### Category
- `@@index([parentId])` — Ծնող
- `@@index([published])` — Հրապարակված
- `@@index([deletedAt])` — Soft delete

### Order
- `@@index([userId])` — Օգտատեր
- `@@index([status, createdAt(sort: Desc)])` — Կարգավիճակ
- `@@index([customerEmail])` — Email
- `@@index([createdAt(sort: Desc)])` — Ամսաթիվ

### Cart
- `@@index([userId])` — Օգտատեր
- `@@index([abandoned, abandonedAt])` — Թողնված
- `@@index([expiresAt])` — Լրացում

---

## 🔗 Կապված փաստաթղթեր

- [01-ARCHITECTURE.md](./01-ARCHITECTURE.md) — Ճարտարապետություն
- [02-TECH_STACK.md](./02-TECH_STACK.md) — Տեխնոլոգիաներ
- [04-API.md](./04-API.md) — API փաստաթղթավորում

---

**Փաստաթղթի տարբերակ.** 1.0
**Ամսաթիվ.** 2026-02-12




