import { Prisma } from "@prisma/client";
import { logger } from "../../utils/logger";
import { cleanImageUrls, separateMainAndVariantImages, smartSplitUrls } from "../../utils/image-utils";
import type { UpdateProductData } from "./types";

/**
 * Returns the first slug that is not already taken in ProductTranslation.
 * If the slug is free, returns it as-is. Otherwise tries slug-2, slug-3, …
 * @param tx  Prisma transaction client (or db)
 * @param slug  Desired slug
 * @param excludeProductId  Current product id to skip (for updates)
 */
export async function resolveUniqueSlug(
  tx: Prisma.TransactionClient,
  slug: string,
  excludeProductId?: string
): Promise<string> {
  const isTaken = async (candidate: string): Promise<boolean> => {
    const existing = await tx.productTranslation.findFirst({
      where: {
        slug: candidate,
        ...(excludeProductId ? { productId: { not: excludeProductId } } : {}),
      },
      select: { id: true },
    });
    return existing !== null;
  };

  if (!(await isTaken(slug))) return slug;

  let counter = 2;
  let candidate = `${slug}-${counter}`;
  while (await isTaken(candidate)) {
    counter++;
    candidate = `${slug}-${counter}`;
  }
  return candidate;
}

/**
 * Collect variant images from data or existing variants
 */
export async function collectVariantImages(
  variants: UpdateProductData['variants'],
  productId: string,
  tx: Prisma.TransactionClient
): Promise<string[]> {
  const allVariantImages: string[] = [];
  
  if (variants !== undefined) {
    variants.forEach((variant) => {
      if (variant.imageUrl) {
        const urls = smartSplitUrls(variant.imageUrl);
        allVariantImages.push(...urls);
      }
    });
  } else {
    // If variants not being updated, get existing variant images
    const existingVariants = await tx.productVariant.findMany({
      where: { productId },
      select: { imageUrl: true },
    });
    existingVariants.forEach((variant) => {
      if (variant.imageUrl) {
        const urls = smartSplitUrls(variant.imageUrl);
        allVariantImages.push(...urls);
      }
    });
  }
  
  return allVariantImages;
}

/**
 * Build product update data
 */
export function buildProductUpdateData(
  data: UpdateProductData,
  allVariantImages: string[],
  existing: { publishedAt: Date | null }
): {
  primaryCategoryId?: string | null;
  categoryIds?: string[];
  media?: string[];
  published?: boolean;
  publishedAt?: Date;
  featured?: boolean;
  upcoming?: boolean;
} {
  const updateData: {
    primaryCategoryId?: string | null;
    categoryIds?: string[];
    media?: string[];
    published?: boolean;
    publishedAt?: Date;
    featured?: boolean;
    upcoming?: boolean;
  } = {};
  
  if (data.primaryCategoryId !== undefined) updateData.primaryCategoryId = data.primaryCategoryId || null;
  if (data.categoryIds !== undefined) updateData.categoryIds = data.categoryIds || [];
  
  if (data.media !== undefined) {
    // Separate main images from variant images and clean them
    const { main } = separateMainAndVariantImages(
      data.media as Array<string | { url?: string; src?: string; value?: string }>,
      allVariantImages
    );
    updateData.media = cleanImageUrls(main);
    logger.debug('Updated main media', { count: updateData.media.length, variantImagesExcluded: allVariantImages.length });
  }
  
  if (data.published !== undefined) {
    updateData.published = data.published;
    if (data.published && !existing.publishedAt) {
      updateData.publishedAt = new Date();
    }
  }
  
  if (data.featured !== undefined) updateData.featured = data.featured;
  if (data.upcoming !== undefined) updateData.upcoming = data.upcoming;

  return updateData;
}

/**
 * Update product translation (resolves slug uniqueness automatically)
 */
export async function updateProductTranslation(
  productId: string,
  data: UpdateProductData,
  tx: Prisma.TransactionClient
) {
  if (data.title || data.slug || data.subtitle !== undefined || data.descriptionHtml !== undefined) {
    const locale = data.locale || "en";

    const finalSlug = data.slug
      ? await resolveUniqueSlug(tx, data.slug, productId)
      : undefined;

    await tx.productTranslation.upsert({
      where: {
        productId_locale: {
          productId,
          locale,
        },
      },
      update: {
        ...(data.title && { title: data.title }),
        ...(finalSlug && { slug: finalSlug }),
        ...(data.subtitle !== undefined && { subtitle: data.subtitle || null }),
        ...(data.descriptionHtml !== undefined && { descriptionHtml: data.descriptionHtml || null }),
      },
      create: {
        productId,
        locale,
        title: data.title || "",
        slug: finalSlug || data.slug || "",
        subtitle: data.subtitle || null,
        descriptionHtml: data.descriptionHtml || null,
      },
    });
  }
}

/**
 * Update product labels
 */
export async function updateProductLabels(
  productId: string,
  labels: UpdateProductData['labels'],
  tx: Prisma.TransactionClient
) {
  if (labels !== undefined) {
    await tx.productLabel.deleteMany({ where: { productId } });
    if (labels.length > 0) {
      await tx.productLabel.createMany({
        data: labels.map((label) => ({
          productId,
          type: label.type,
          value: label.value,
          position: label.position,
          color: label.color || undefined,
        })),
      });
    }
  }
}


