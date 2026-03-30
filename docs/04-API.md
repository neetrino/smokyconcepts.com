# API Փաստաթղթավորում

> WhiteShop Template REST API-ի ամբողջական փաստաթղթավորում։

**Base URL.** `/api/v1`
**API Format.** REST JSON
**Վերջին թարմացում.** 2026-02-12

---

## 🔐 Աուտենտիֆիկացիա

### POST /api/v1/auth/login
Օգտատիրոջ մուտք:

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "roles": ["customer"]
  }
}
```

### POST /api/v1/auth/register
Օգտատիրոջ գրանցում:

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

---

## 📦 Ապրանքներ

### GET /api/v1/products
Ապրանքների ցանկ:

**Query Parameters:**
- `page` — էջ (default: 1)
- `limit` — քանակ (default: 20)
- `category` — կատեգորիա slug
- `brand` — բրենդ slug
- `search` — որոնում
- `minPrice` — նվազագույն գին
- `maxPrice` — առավելագույն գին
- `sort` — սորտավորում (price, name, date)

**Response:**
```json
{
  "products": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

### GET /api/v1/products/[slug]
Ապրանքի մանրամասներ:

**Response:**
```json
{
  "id": "product_id",
  "title": "Product Title",
  "slug": "product-slug",
  "variants": [...],
  "categories": [...],
  "reviews": [...]
}
```

### GET /api/v1/products/filters
Ֆիլտրների տվյալներ:

**Response:**
```json
{
  "categories": [...],
  "brands": [...],
  "attributes": [...],
  "priceRange": {
    "min": 0,
    "max": 1000
  }
}
```

### GET /api/v1/products/price-range
Գնային տիրույթ:

**Response:**
```json
{
  "min": 0,
  "max": 1000
}
```

### GET /api/v1/products/variants/[id]
Տարբերակի մանրամասներ:

---

## 🛒 Զամբյուղ

### GET /api/v1/cart
Զամբյուղի բովանդակություն:

**Response:**
```json
{
  "id": "cart_id",
  "items": [
    {
      "id": "item_id",
      "product": {...},
      "variant": {...},
      "quantity": 2,
      "price": 100
    }
  ],
  "total": 200
}
```

### POST /api/v1/cart
Ավելացնել ապրանք զամբյուղ:

**Request Body:**
```json
{
  "variantId": "variant_id",
  "quantity": 1
}
```

### PUT /api/v1/cart/items/[id]
Թարմացնել քանակ:

**Request Body:**
```json
{
  "quantity": 3
}
```

### DELETE /api/v1/cart/items/[id]
Ջնջել ապրանք զամբյուղից:

---

## 📋 Պատվերներ

### GET /api/v1/orders
Օգտատիրոջ պատվերներ:

**Response:**
```json
{
  "orders": [
    {
      "id": "order_id",
      "number": "ORD-12345",
      "status": "pending",
      "total": 200,
      "createdAt": "2026-02-12T10:00:00Z"
    }
  ]
}
```

### GET /api/v1/orders/[number]
Պատվերի մանրամասներ:

**Response:**
```json
{
  "id": "order_id",
  "number": "ORD-12345",
  "status": "pending",
  "items": [...],
  "billingAddress": {...},
  "shippingAddress": {...},
  "total": 200
}
```

### POST /api/v1/orders/checkout
Պատվերի ստեղծում:

**Request Body:**
```json
{
  "billingAddress": {...},
  "shippingAddress": {...},
  "shippingMethod": "standard",
  "paymentMethod": "card"
}
```

---

## 👤 Օգտատերեր

### GET /api/v1/users/profile
Օգտատիրոջ պրոֆիլ:

**Response:**
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

### PUT /api/v1/users/profile
Թարմացնել պրոֆիլ:

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

### GET /api/v1/users/addresses
Օգտատիրոջ հասցեներ:

**Response:**
```json
{
  "addresses": [
    {
      "id": "address_id",
      "addressLine1": "123 Main St",
      "city": "Yerevan",
      "countryCode": "AM",
      "isDefault": true
    }
  ]
}
```

### POST /api/v1/users/addresses
Ավելացնել հասցե:

**Request Body:**
```json
{
  "addressLine1": "123 Main St",
  "city": "Yerevan",
  "countryCode": "AM",
  "isDefault": false
}
```

### PUT /api/v1/users/addresses/[addressId]
Թարմացնել հասցե:

### DELETE /api/v1/users/addresses/[addressId]
Ջնջել հասցե:

### PUT /api/v1/users/addresses/[addressId]/default
Սահմանել որպես լռելյայն:

### PUT /api/v1/users/password
Փոխել գաղտնաբառ:

**Request Body:**
```json
{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

---

## 📂 Կատեգորիաներ

### GET /api/v1/categories/tree
Կատեգորիաների ծառ:

**Response:**
```json
{
  "categories": [
    {
      "id": "category_id",
      "title": "Category",
      "slug": "category-slug",
      "children": [...]
    }
  ]
}
```

### GET /api/v1/categories/[slug]
Կատեգորիայի մանրամասներ:

---

## ⭐ Ակնարկներ

### GET /api/v1/products/[slug]/reviews
Ապրանքի ակնարկներ:

**Response:**
```json
{
  "reviews": [
    {
      "id": "review_id",
      "rating": 5,
      "comment": "Great product!",
      "user": {...},
      "createdAt": "2026-02-12T10:00:00Z"
    }
  ]
}
```

### POST /api/v1/products/[slug]/reviews
Ավելացնել ակնարկ:

**Request Body:**
```json
{
  "rating": 5,
  "comment": "Great product!"
}
```

### PUT /api/v1/reviews/[reviewId]
Թարմացնել ակնարկ:

### DELETE /api/v1/reviews/[reviewId]
Ջնջել ակնարկ:

---

## 📧 Կոնտակտ

### POST /api/v1/contact
Կոնտակտային ձև:

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Question",
  "message": "Hello, I have a question..."
}
```

---

## 🚚 Առաքում

### POST /api/v1/delivery/price
Հաշվել առաքման գին:

**Request Body:**
```json
{
  "weight": 1000,
  "destination": "AM"
}
```

**Response:**
```json
{
  "price": 500,
  "estimatedDays": 3
}
```

---

## 💱 Արտարժույթ

### GET /api/v1/currency-rates
Արտարժույթի փոխարժեքներ:

**Response:**
```json
{
  "rates": {
    "USD": 1.0,
    "AMD": 400,
    "EUR": 0.9
  }
}
```

---

## 👨‍💼 Admin API

### Admin - Ապրանքներ

- `GET /api/v1/admin/products` — Ապրանքների ցանկ
- `POST /api/v1/admin/products` — Ստեղծել ապրանք
- `GET /api/v1/admin/products/[id]` — Ապրանքի մանրամասներ
- `PUT /api/v1/admin/products/[id]` — Թարմացնել ապրանք
- `DELETE /api/v1/admin/products/[id]` — Ջնջել ապրանք
- `POST /api/v1/admin/products/upload-images` — Բեռնել պատկերներ
- `PUT /api/v1/admin/products/[id]/discount` — Թարմացնել զեղչ

### Admin - Պատվերներ

- `GET /api/v1/admin/orders` — Պատվերների ցանկ
- `GET /api/v1/admin/orders/[id]` — Պատվերի մանրամասներ
- `PUT /api/v1/admin/orders/[id]` — Թարմացնել պատվեր

### Admin - Օգտատերեր

- `GET /api/v1/admin/users` — Օգտատերերի ցանկ
- `GET /api/v1/admin/users/[id]` — Օգտատիրոջ մանրամասներ
- `PUT /api/v1/admin/users/[id]` — Թարմացնել օգտատիրոջ

### Admin - Կատեգորիաներ

- `GET /api/v1/admin/categories` — Կատեգորիաների ցանկ
- `POST /api/v1/admin/categories` — Ստեղծել կատեգորիա
- `GET /api/v1/admin/categories/[id]` — Կատեգորիայի մանրամասներ
- `PUT /api/v1/admin/categories/[id]` — Թարմացնել կատեգորիա

### Admin - Բրենդեր

- `GET /api/v1/admin/brands` — Բրենդերի ցանկ
- `POST /api/v1/admin/brands` — Ստեղծել բրենդ
- `GET /api/v1/admin/brands/[id]` — Բրենդի մանրամասներ
- `PUT /api/v1/admin/brands/[id]` — Թարմացնել բրենդ

### Admin - Ատրիբուտներ

- `GET /api/v1/admin/attributes` — Ատրիբուտների ցանկ
- `POST /api/v1/admin/attributes` — Ստեղծել ատրիբուտ
- `GET /api/v1/admin/attributes/[id]` — Ատրիբուտի մանրամասներ
- `PUT /api/v1/admin/attributes/[id]` — Թարմացնել ատրիբուտ
- `POST /api/v1/admin/attributes/[id]/values` — Ավելացնել արժեք
- `PUT /api/v1/admin/attributes/[id]/values/[valueId]` — Թարմացնել արժեք

### Admin - Վիճակագրություն

- `GET /api/v1/admin/stats` — Ընդհանուր վիճակագրություն
- `GET /api/v1/admin/analytics` — Անալիտիկա
- `GET /api/v1/admin/dashboard/recent-orders` — Վերջին պատվերներ
- `GET /api/v1/admin/dashboard/top-products` — Լավագույն ապրանքներ
- `GET /api/v1/admin/dashboard/user-activity` — Օգտատիրոջ ակտիվություն

### Admin - Կարգավորումներ

- `GET /api/v1/admin/settings` — Կարգավորումներ
- `PUT /api/v1/admin/settings` — Թարմացնել կարգավորումներ
- `GET /api/v1/admin/settings/price-filter` — Գնային ֆիլտրի կարգավորումներ
- `PUT /api/v1/admin/settings/price-filter` — Թարմացնել գնային ֆիլտր

### Admin - Այլ

- `GET /api/v1/admin/delivery` — Առաքման կարգավորումներ
- `GET /api/v1/admin/activity` — Գործունեության լոգ

---

## 🔒 Սխալների մշակում

### Սխալի ձևաչափ

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": {...}
  }
}
```

### HTTP Status Codes

- `200` — Հաջողություն
- `201` — Ստեղծված
- `400` — Վատ հարցում
- `401` — Չարտոնված
- `403` — Արգելված
- `404` — Չգտնված
- `500` — Սերվերի սխալ

---

## 🔗 Կապված փաստաթղթեր

- [01-ARCHITECTURE.md](./01-ARCHITECTURE.md) — Ճարտարապետություն
- [02-TECH_STACK.md](./02-TECH_STACK.md) — Տեխնոլոգիաներ

---

**Փաստաթղթի տարբերակ.** 1.0
**Ամսաթիվ.** 2026-02-12




