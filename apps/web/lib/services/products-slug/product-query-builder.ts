import { db } from "@white-shop/db";
import { logger } from "../utils/logger";
import type { ProductWithFullRelations } from "./types";

const getBaseInclude = () => ({
  translations: true,
  categories: {
    include: {
      translations: true,
    },
  },
  variants: {
    where: {
      published: true,
    },
    orderBy: {
      position: "asc" as const,
    },
  },
  labels: true,
});

const getBaseWhere = (slug: string, lang: string) => ({
  translations: {
    some: {
      slug,
      locale: lang,
    },
  },
  published: true,
  deletedAt: null,
});

/**
 * Build and execute product query by slug
 */
export async function buildProductQuery(
  slug: string,
  lang: string = "en"
): Promise<ProductWithFullRelations | null> {
  const product = await db.product.findFirst({
    where: getBaseWhere(slug, lang),
    include: getBaseInclude(),
  });

  if (!product) {
    await logProductNotFoundDiagnostics(slug, lang);
  }

  return product;
}

async function logProductNotFoundDiagnostics(slug: string, lang: string): Promise<void> {
  try {
    const productAnyLang = await db.product.findFirst({
      where: {
        translations: {
          some: { slug },
        },
      },
      include: {
        translations: {
          select: { locale: true, slug: true },
        },
      },
    });

    if (productAnyLang) {
      const availableLangs = (productAnyLang.translations as { locale: string; slug: string }[])
        .map((t) => t.locale)
        .join(", ");
      logger.warn("Product found with slug but not in requested language", {
        slug,
        requestedLang: lang,
        availableLangs,
        published: productAnyLang.published,
        deletedAt: productAnyLang.deletedAt,
      });
    } else {
      const productUnpublished = await db.product.findFirst({
        where: {
          translations: {
            some: { slug, locale: lang },
          },
        },
        select: { id: true, published: true, deletedAt: true },
      });

      if (productUnpublished) {
        logger.warn("Product found but not available", {
          slug,
          lang,
          published: productUnpublished.published,
          deletedAt: productUnpublished.deletedAt,
        });
      } else {
        logger.debug("Product not found in database", { slug, lang });
      }
    }
  } catch (error) {
    logger.error("Error during product diagnostics", {
      error: error instanceof Error ? error.message : String(error),
      slug,
      lang,
    });
  }
}
