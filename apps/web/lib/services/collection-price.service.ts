import { db } from "@white-shop/db";
import { resolveProductCollectionPriceAmd } from "@/lib/collections/resolve-product-collection-price-amd";
import { buildSizeCatalogPriceAmdByTitle } from "@/lib/size-catalog/resolve-size-catalog-category-price-amd";

type CategoryPriceRow = {
  priceAmd: number;
  translations?: Array<{ title: string }>;
};

export function mapProductCategoriesToPriceSources(
  categories: CategoryPriceRow[] | undefined
): Array<{ title: string; priceAmd: number }> {
  if (!categories?.length) {
    return [];
  }
  return categories.map((category) => ({
    title: category.translations?.[0]?.title?.trim() || "",
    priceAmd: category.priceAmd,
  }));
}

export async function loadCollectionPriceAmdByTitle(): Promise<Map<string, number>> {
  const categories = await db.category.findMany({
    where: { deletedAt: null },
    select: {
      priceAmd: true,
      translations: { select: { title: true } },
    },
  });

  const rows: Array<{ title: string; priceAmd: number }> = [];
  for (const category of categories) {
    for (const translation of category.translations) {
      const title = translation.title.trim();
      if (title) {
        rows.push({ title, priceAmd: category.priceAmd });
      }
    }
  }
  return buildSizeCatalogPriceAmdByTitle(rows);
}

/** Raw collection surcharge for a product. Callers must apply only with customize text. */
export async function resolveCheckoutCollectionPriceAmd(product: {
  categoryIds: string[];
  primaryCategoryId: string | null;
  categories?: CategoryPriceRow[];
}): Promise<{ priceAmd: number; categoryTitle: string | null }> {
  const fromRelation = mapProductCategoriesToPriceSources(product.categories);
  if (fromRelation.length > 0) {
    return resolveProductCollectionPriceAmd(fromRelation);
  }

  const ids = Array.from(
    new Set(
      [...product.categoryIds, product.primaryCategoryId].filter(
        (id): id is string => typeof id === "string" && id.trim() !== ""
      )
    )
  );
  if (ids.length === 0) {
    return { priceAmd: 0, categoryTitle: null };
  }

  const rows = await db.category.findMany({
    where: { id: { in: ids }, deletedAt: null },
    select: {
      priceAmd: true,
      translations: { select: { title: true } },
    },
  });
  return resolveProductCollectionPriceAmd(mapProductCategoriesToPriceSources(rows));
}
