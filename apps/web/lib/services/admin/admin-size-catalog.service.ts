import { db } from "@white-shop/db";

import { sortSizeCatalogCategoriesByDisplayOrder } from "@/lib/constants/size-catalog-display-order.constants";
import { type SizeCatalogCategoryDto, type SizeCatalogItemDto } from "@/lib/types/size-catalog";

function normalizeSizeItemVersion(value: string | undefined, fallback = ""): string {
  const normalized = value?.trim();
  if (normalized && normalized.length <= 32) {
    return normalized;
  }
  return fallback;
}

function mapItem(row: {
  id: string;
  categoryId: string;
  categoryTitle: string;
  categoryPriceAmd: number;
  title: string;
  imageUrl: string;
  version?: string | null;
  position: number;
  published?: boolean | null;
}): SizeCatalogItemDto {
  return {
    id: row.id,
    categoryId: row.categoryId,
    categoryTitle: row.categoryTitle,
    categoryPriceAmd: 0,
    title: row.title,
    imageUrl: row.imageUrl,
    version: normalizeSizeItemVersion(row.version ?? undefined),
    position: row.position,
    published: row.published ?? true,
  };
}

type SizeCategoryRow = {
  id: string;
  title: string;
  priceAmd: number;
  position: number;
  items: Array<{
    id: string;
    categoryId: string;
    title: string;
    imageUrl: string;
    version?: string | null;
    position: number;
    published?: boolean | null;
  }>;
};

/** Storefront: hide drafts (published === false). Missing field = legacy row, treat as published. */
function isStorefrontSizeItem(item: { published?: boolean | null }): boolean {
  return item.published !== false;
}

function getNormalizedCategoryTitle(value: string): string {
  return value.trim().toLocaleLowerCase();
}

/**
 * Storefront picker should not render duplicate titled sections with conflicting prices.
 * Merge by normalized title and keep the highest configured price.
 */
function mergeStorefrontCategoriesByTitle(rows: SizeCategoryRow[]): SizeCategoryRow[] {
  const mergedByTitle = new Map<string, SizeCategoryRow>();
  for (const row of rows) {
    const key = getNormalizedCategoryTitle(row.title);
    const existing = mergedByTitle.get(key);
    if (!existing) {
      mergedByTitle.set(key, { ...row, items: [...row.items] });
      continue;
    }

    mergedByTitle.set(key, {
      ...existing,
      title: existing.title || row.title,
      priceAmd: Math.max(existing.priceAmd, row.priceAmd),
      position: Math.min(existing.position, row.position),
      items: [...existing.items, ...row.items].sort((a, b) => a.position - b.position),
    });
  }

  return Array.from(mergedByTitle.values()).sort((a, b) => a.position - b.position);
}

function mapCategory(row: SizeCategoryRow): SizeCatalogCategoryDto {
  return {
    id: row.id,
    title: row.title,
    priceAmd: row.priceAmd,
    position: row.position,
    items: row.items.map((item) =>
      mapItem({
        ...item,
        /** Preserve DB FK so storefront filters match `__size_catalog_category_id__` on products after merge-by-title. */
        categoryId: item.categoryId,
        categoryTitle: row.title,
        categoryPriceAmd: row.priceAmd,
      })
    ),
  };
}

/** Size catalog collection surcharge is disabled; persisted as 0. */
function normalizeCategoryPriceAmd(_value?: number, _fallback = 0): number {
  return 0;
}

class AdminSizeCatalogService {
  /** Storefront + public API: only published size items. */
  async getStorefrontCatalog(): Promise<{ data: SizeCatalogCategoryDto[] }> {
    const rows = await db.sizeCatalogCategory.findMany({
      orderBy: { position: "asc" },
      include: {
        items: {
          orderBy: { position: "asc" },
        },
      },
    });

    const forStorefront: SizeCategoryRow[] = (rows as SizeCategoryRow[]).map((cat) => ({
      ...cat,
      items: cat.items.filter(isStorefrontSizeItem),
    }));

    return {
      data: sortSizeCatalogCategoriesByDisplayOrder(
        mergeStorefrontCategoriesByTitle(forStorefront).map(mapCategory)
      ),
    };
  }

  /** Admin list: all items including drafts. */
  async getAdminCatalog(): Promise<{ data: SizeCatalogCategoryDto[] }> {
    const rows = await db.sizeCatalogCategory.findMany({
      orderBy: { position: "asc" },
      include: {
        items: {
          orderBy: { position: "asc" },
        },
      },
    });

    return {
      data: sortSizeCatalogCategoriesByDisplayOrder((rows as SizeCategoryRow[]).map(mapCategory)),
    };
  }

  async createCategory(data: { title: string; priceAmd?: number }): Promise<{ data: SizeCatalogCategoryDto }> {
    const title = data.title.trim();
    if (!title) {
      throw {
        status: 400,
        type: "https://api.shop.am/problems/validation-error",
        title: "Validation Error",
        detail: "Title is required",
      };
    }

    const last = await db.sizeCatalogCategory.findFirst({
      orderBy: { position: "desc" },
      select: { position: true },
    });

    const priceAmd = normalizeCategoryPriceAmd(data.priceAmd, 0);

    const created = await db.sizeCatalogCategory.create({
      data: {
        title,
        priceAmd,
        position: (last?.position ?? -1) + 1,
      },
      include: { items: { orderBy: { position: "asc" } } },
    });

    return { data: mapCategory(created) };
  }

  async updateCategory(
    categoryId: string,
    data: { title?: string; priceAmd?: number }
  ): Promise<{ data: SizeCatalogCategoryDto }> {
    const existing = await db.sizeCatalogCategory.findUnique({
      where: { id: categoryId },
      include: { items: { orderBy: { position: "asc" } } },
    });

    if (!existing) {
      throw {
        status: 404,
        type: "https://api.shop.am/problems/not-found",
        title: "Not Found",
        detail: "Size category not found",
      };
    }

    const title = data.title !== undefined ? data.title.trim() : existing.title;
    if (!title) {
      throw {
        status: 400,
        type: "https://api.shop.am/problems/validation-error",
        title: "Validation Error",
        detail: "Title is required",
      };
    }

    const priceAmd = normalizeCategoryPriceAmd(data.priceAmd, existing.priceAmd);

    const updated = await db.sizeCatalogCategory.update({
      where: { id: categoryId },
      data: { title, priceAmd },
      include: { items: { orderBy: { position: "asc" } } },
    });

    return { data: mapCategory(updated) };
  }

  async deleteCategory(categoryId: string): Promise<void> {
    const existing = await db.sizeCatalogCategory.findUnique({
      where: { id: categoryId },
    });

    if (!existing) {
      throw {
        status: 404,
        type: "https://api.shop.am/problems/not-found",
        title: "Not Found",
        detail: "Size category not found",
      };
    }

    await db.sizeCatalogCategory.delete({
      where: { id: categoryId },
    });
  }

  async createItem(
    categoryId: string,
    data: { title: string; imageUrl: string; version?: string | null; published?: boolean }
  ): Promise<{ data: SizeCatalogItemDto }> {
    const category = await db.sizeCatalogCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw {
        status: 404,
        type: "https://api.shop.am/problems/not-found",
        title: "Not Found",
        detail: "Size category not found",
      };
    }

    const title = data.title.trim();
    const imageUrl = data.imageUrl.trim();
    const version = normalizeSizeItemVersion(data.version ?? undefined);

    if (!title || !imageUrl) {
      throw {
        status: 400,
        type: "https://api.shop.am/problems/validation-error",
        title: "Validation Error",
        detail: "Title and image URL are required",
      };
    }

    const last = await db.sizeCatalogItem.findFirst({
      where: { categoryId },
      orderBy: { position: "desc" },
      select: { position: true },
    });

    const published = data.published ?? true;

    const created = await db.sizeCatalogItem.create({
      data: {
        categoryId,
        title,
        imageUrl,
        version: version || "",
        published,
        position: (last?.position ?? -1) + 1,
      },
      include: {
        category: {
          select: {
            title: true,
            priceAmd: true,
          },
        },
      },
    });

    return {
      data: mapItem({
        ...created,
        categoryTitle: created.category.title,
        categoryPriceAmd: created.category.priceAmd,
      }),
    };
  }

  async updateItem(
    itemId: string,
    data: { title?: string; imageUrl?: string; version?: string | null; published?: boolean }
  ): Promise<{ data: SizeCatalogItemDto }> {
    const existing = await db.sizeCatalogItem.findUnique({
      where: { id: itemId },
    });

    if (!existing) {
      throw {
        status: 404,
        type: "https://api.shop.am/problems/not-found",
        title: "Not Found",
        detail: "Size item not found",
      };
    }

    const hasVersion = Object.prototype.hasOwnProperty.call(data, "version");
    const title = data.title !== undefined ? data.title.trim() : existing.title;
    const imageUrl = data.imageUrl !== undefined ? data.imageUrl.trim() : existing.imageUrl;
    const existingVersion = normalizeSizeItemVersion(existing.version ?? undefined);
    const version = hasVersion ? normalizeSizeItemVersion(data.version ?? undefined) : existingVersion;
    const published = data.published !== undefined ? data.published : existing.published;

    if (!title || !imageUrl) {
      throw {
        status: 400,
        type: "https://api.shop.am/problems/validation-error",
        title: "Validation Error",
        detail: "Title and image URL are required",
      };
    }

    const updated = await db.sizeCatalogItem.update({
      where: { id: itemId },
      data: { title, imageUrl, version: hasVersion ? version : undefined, published },
      include: {
        category: {
          select: {
            title: true,
            priceAmd: true,
          },
        },
      },
    });

    return {
      data: mapItem({
        ...updated,
        categoryTitle: updated.category.title,
        categoryPriceAmd: updated.category.priceAmd,
      }),
    };
  }

  async deleteItem(itemId: string): Promise<void> {
    const existing = await db.sizeCatalogItem.findUnique({
      where: { id: itemId },
    });

    if (!existing) {
      throw {
        status: 404,
        type: "https://api.shop.am/problems/not-found",
        title: "Not Found",
        detail: "Size item not found",
      };
    }

    await db.sizeCatalogItem.delete({
      where: { id: itemId },
    });
  }
}

export const adminSizeCatalogService = new AdminSizeCatalogService();
