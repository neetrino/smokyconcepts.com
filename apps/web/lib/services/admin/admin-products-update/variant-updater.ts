import { Prisma } from "@prisma/client";
import { logger } from "../../utils/logger";
import { processImageUrl, smartSplitUrls } from "../../utils/image-utils";
import { parseVariantPrices } from "./variant-processor";

function createSkuValidationError(detail: string) {
  return {
    status: 422,
    type: "https://api.shop.am/problems/validation-error",
    title: "Validation Error",
    detail,
  };
}

async function findVariant(
  variant: { id?: string; sku?: string },
  existingVariantIds: Set<string>,
  existingSkuMap: Map<string, string>,
  productId: string,
  tx: Prisma.TransactionClient
): Promise<{ variantToUpdate: { id: string } | null; variantIdToUse: string | null }> {
  let variantToUpdate: { id: string } | null = null;
  let variantIdToUse: string | null = null;

  if (variant.id && existingVariantIds.has(variant.id)) {
    variantToUpdate = await tx.productVariant.findUnique({
      where: { id: variant.id },
    });
    variantIdToUse = variant.id;
  }

  if (!variantToUpdate && variant.sku) {
    const skuValue = variant.sku.trim();
    const skuKey = skuValue.toLowerCase();
    const matchedVariantId = existingSkuMap.get(skuKey);
    if (matchedVariantId) {
      variantToUpdate = await tx.productVariant.findUnique({
        where: { id: matchedVariantId },
      });
      variantIdToUse = matchedVariantId;
    } else {
      const existingSkuVariant = await tx.productVariant.findFirst({
        where: { sku: skuValue },
      });
      if (existingSkuVariant) {
        throw createSkuValidationError(
          `SKU "${skuValue}" already exists in another product. Please use a unique SKU.`
        );
      }
    }
  }

  return { variantToUpdate, variantIdToUse };
}

function processVariantImageUrl(imageUrl: string | undefined): string | undefined {
  if (!imageUrl) return undefined;
  const urls = smartSplitUrls(imageUrl);
  const processed = urls.map((url: string) => processImageUrl(url)).filter((url): url is string => url !== null);
  return processed.length > 0 ? processed.join(",") : undefined;
}

function normalizeVariantAttributes(
  attributes: unknown
): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined {
  if (attributes === undefined) {
    return undefined;
  }

  return attributes as Prisma.InputJsonValue;
}

async function updateExistingVariant(
  variantId: string,
  variant: { sku?: string; imageUrl?: string; attributes?: unknown; published?: boolean },
  price: number,
  stock: number,
  compareAtPrice: number | undefined,
  tx: Prisma.TransactionClient
) {
  const processedVariantImageUrl = processVariantImageUrl(variant.imageUrl);
  await tx.productVariant.update({
    where: { id: variantId },
    data: {
      sku: variant.sku ? variant.sku.trim() : undefined,
      price,
      compareAtPrice,
      stock: isNaN(stock) ? 0 : stock,
      imageUrl: processedVariantImageUrl,
      attributes: normalizeVariantAttributes(variant.attributes),
      published: variant.published !== false,
    },
  });
  logger.info("Updated variant", { variantId });
}

async function createNewVariant(
  productId: string,
  variant: { sku?: string; imageUrl?: string; attributes?: unknown; published?: boolean },
  price: number,
  stock: number,
  compareAtPrice: number | undefined,
  tx: Prisma.TransactionClient
): Promise<string> {
  if (variant.sku) {
    const skuValue = variant.sku.trim();
    const existingSkuCheck = await tx.productVariant.findFirst({
      where: { sku: skuValue },
    });
    if (existingSkuCheck) {
      throw createSkuValidationError(`SKU "${skuValue}" already exists. Cannot create duplicate variant.`);
    }
  }

  const processedVariantImageUrl = processVariantImageUrl(variant.imageUrl);
  const newVariant = await tx.productVariant.create({
    data: {
      productId,
      sku: variant.sku ? variant.sku.trim() : undefined,
      price,
      compareAtPrice,
      stock: isNaN(stock) ? 0 : stock,
      imageUrl: processedVariantImageUrl,
      attributes: normalizeVariantAttributes(variant.attributes),
      published: variant.published !== false,
    },
  });
  logger.info("Created new variant", { variantId: newVariant.id });
  return newVariant.id;
}

export async function updateOrCreateVariant(
  variant: {
    id?: string;
    sku?: string;
    price: string | number;
    compareAtPrice?: string | number;
    stock: string | number;
    imageUrl?: string;
    attributes?: unknown;
    published?: boolean;
  },
  productId: string,
  _locale: string,
  existingVariantIds: Set<string>,
  existingSkuMap: Map<string, string>,
  tx: Prisma.TransactionClient
): Promise<string> {
  const { price, stock, compareAtPrice } = parseVariantPrices(variant);
  const { variantToUpdate, variantIdToUse } = await findVariant(
    variant,
    existingVariantIds,
    existingSkuMap,
    productId,
    tx
  );

  if (variantToUpdate && variantIdToUse) {
    await updateExistingVariant(
      variantIdToUse,
      variant,
      price,
      stock,
      compareAtPrice,
      tx
    );
    return variantIdToUse;
  }
  return await createNewVariant(productId, variant, price, stock, compareAtPrice, tx);
}
