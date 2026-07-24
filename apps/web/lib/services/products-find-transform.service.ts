import { db } from "@white-shop/db";
import { buildCatalogGalleryImages } from "./products-list-gallery-images";
import { t } from "../i18n";
import { ProductWithRelations } from "./products-find-query.service";
import { cleanImageUrls, processImageUrl, smartSplitUrls } from "./utils/image-utils";
import {
  extractSizeCatalogSelectionFromAttributes,
  isDefaultPricingVariant,
  isDisplayVariant,
} from "@/lib/default-pricing-variant";
import { catalogPriceForStorefront } from "@/lib/currency";

/** Option-like item from variant.attributes JSON (options relation removed from schema) */
type VariantOptionFromAttributes = {
  attributeKey?: string | null;
  value?: string | null;
  attributeValue?: {
    value?: string;
    attribute?: { key?: string };
    translations?: Array<{ locale: string; label?: string }>;
    imageUrl?: string | null;
    colors?: string[] | unknown;
  };
};

function getVariantOptions(attributes: unknown): VariantOptionFromAttributes[] {
  return Array.isArray(attributes) ? (attributes as VariantOptionFromAttributes[]) : [];
}

function extractFirstSizeOptionLabelFromVariant(variant: { attributes?: unknown }): string | null {
  const options = getVariantOptions(variant.attributes);
  const sizeOption = options.find((option) => {
    if (option.attributeValue?.attribute?.key) {
      return option.attributeValue.attribute.key === "size";
    }
    return option.attributeKey === "size";
  });
  if (!sizeOption) {
    return null;
  }
  const sizeFromAttributeValue =
    sizeOption.attributeValue?.translations?.[0]?.label || sizeOption.attributeValue?.value;
  const normalizedSize = (sizeFromAttributeValue || sizeOption.value || "").trim();
  return normalizedSize || null;
}

function extractSizeOptionLabelsFromVariant(
  variant: { attributes?: unknown },
  lang: string
): string[] {
  const labels = new Set<string>();
  const options = getVariantOptions(variant.attributes);
  options.forEach((option) => {
    const isSize =
      option.attributeValue?.attribute?.key === "size" || option.attributeKey === "size";
    if (!isSize) {
      return;
    }
    const translations = option.attributeValue?.translations;
    const tr =
      Array.isArray(translations) && translations.length > 0
        ? translations.find((item: { locale: string }) => item.locale === lang) ?? translations[0]
        : undefined;
    const label = (
      (typeof tr?.label === "string" ? tr.label : "") ||
      option.attributeValue?.value ||
      option.value ||
      ""
    ).trim();
    if (label) {
      labels.add(label);
    }
    const valueOnly = (option.attributeValue?.value || "").trim();
    if (valueOnly) {
      labels.add(valueOnly);
    }
  });
  return Array.from(labels);
}

function buildVariantImageDtos(
  variants: Array<{
    id: string;
    imageUrl?: string | null;
    attributes?: unknown;
    price: number;
    compareAtPrice?: number | null;
    stock: number;
    sku?: string | null;
  }>,
  lang: string,
  appliedDiscount: number
): Array<{
  variantId: string;
  images: string[];
  sizeLabels: string[];
  sizeCatalogCategoryId: string | null;
  sizeCatalogCategoryTitle: string | null;
  price: number;
  originalPrice: number | null;
  stock: number;
  sku: string;
}> {
  return variants.map((variant) => {
    const images = cleanImageUrls(
      smartSplitUrls(variant.imageUrl)
        .map((url) => processImageUrl(url) ?? url)
        .filter((url) => url.trim().length > 0)
    );
    const variantOriginalPrice = catalogPriceForStorefront(variant.price || 0);
    const compareAtPriceAmd =
      variant.compareAtPrice != null ? catalogPriceForStorefront(variant.compareAtPrice) : null;
    let finalPrice = variantOriginalPrice;
    if (appliedDiscount > 0 && variantOriginalPrice > 0) {
      finalPrice = variantOriginalPrice * (1 - appliedDiscount / 100);
    }
    const originalPrice = appliedDiscount > 0 ? variantOriginalPrice : compareAtPriceAmd;
    const { categoryId, categoryTitle } = extractSizeCatalogSelectionFromAttributes(variant.attributes);
    return {
      variantId: variant.id,
      images,
      sizeLabels: extractSizeOptionLabelsFromVariant(variant, lang),
      sizeCatalogCategoryId: categoryId,
      sizeCatalogCategoryTitle: categoryTitle,
      price: finalPrice,
      originalPrice,
      stock: variant.stock || 0,
      sku: variant.sku?.trim() ?? '',
    };
  });
}

function extractSizeCatalogCategoryTitleFromDefaultVariant(
  defaultPricingVariant: { attributes?: unknown } | null
): string | null {
  const defaultAttributes = Array.isArray(defaultPricingVariant?.attributes)
    ? defaultPricingVariant?.attributes
    : [];
  const sizeCatalogEntry = defaultAttributes.find((item) => {
    if (!item || typeof item !== "object") {
      return false;
    }
    const entry = item as { attributeKey?: unknown };
    return entry.attributeKey === "__size_catalog_category_title__";
  }) as { value?: unknown } | undefined;
  if (typeof sizeCatalogEntry?.value === "string" && sizeCatalogEntry.value.trim()) {
    return sizeCatalogEntry.value.trim();
  }
  return null;
}

/**
 * Display hint: prefer real variant size so catalog cards are not mistaken for "size = collection name".
 * Falls back to default-pricing size-catalog category title only when no size option exists.
 */
function extractSizeLabelFromProductVariants(params: {
  defaultPricingVariant: { attributes?: unknown } | null;
  selectableVariants: Array<{ attributes?: unknown }>;
}): string | null {
  for (const variant of params.selectableVariants) {
    const label = extractFirstSizeOptionLabelFromVariant(variant);
    if (label) {
      return label;
    }
  }
  if (params.defaultPricingVariant) {
    const fromDefault = extractFirstSizeOptionLabelFromVariant(params.defaultPricingVariant);
    if (fromDefault) {
      return fromDefault;
    }
  }
  return extractSizeCatalogCategoryTitleFromDefaultVariant(params.defaultPricingVariant);
}

function collectSizeCatalogCategoryIdsFromVariants(
  variants: Array<{ attributes?: unknown }>
): string[] {
  const ids = new Set<string>();
  for (const variant of variants) {
    const { categoryId } = extractSizeCatalogSelectionFromAttributes(variant.attributes);
    const trimmed = categoryId?.trim();
    if (trimmed) {
      ids.add(trimmed);
    }
  }
  return Array.from(ids);
}

function collectSizeCatalogCategoryTitlesFromVariants(
  variants: Array<{ attributes?: unknown }>
): string[] {
  const titles = new Set<string>();
  for (const variant of variants) {
    const { categoryTitle } = extractSizeCatalogSelectionFromAttributes(variant.attributes);
    const trimmed = categoryTitle?.trim();
    if (trimmed) {
      titles.add(trimmed);
    }
  }
  return Array.from(titles);
}

/**
 * Distinct size attribute labels/values from variants only (never size-catalog category titles),
 * so catalog "Select size" matches physical sizes / PDP titles, not collection display strings.
 */
function collectSizeLabelsForCatalogFilter(params: {
  defaultPricingVariant: { attributes?: unknown } | null;
  selectableVariants: Array<{ attributes?: unknown }>;
  allVariants: Array<{ attributes?: unknown }>;
  lang: string;
}): string[] {
  const labels = new Set<string>();

  const variantsToScan =
    params.selectableVariants.length > 0 ? params.selectableVariants : params.allVariants;

  for (const variant of variantsToScan) {
    const options = getVariantOptions(variant.attributes);
    for (const option of options) {
      const isSize =
        option.attributeValue?.attribute?.key === "size" || option.attributeKey === "size";
      if (!isSize) {
        continue;
      }
      const translations = option.attributeValue?.translations;
      const tr =
        Array.isArray(translations) && translations.length > 0
          ? translations.find((item: { locale: string }) => item.locale === params.lang) ??
            translations[0]
          : undefined;
      const label = (
        (typeof tr?.label === "string" ? tr.label : "") ||
        option.attributeValue?.value ||
        option.value ||
        ""
      ).trim();
      if (label) {
        labels.add(label);
      }
      const valueOnly = (option.attributeValue?.value || "").trim();
      if (valueOnly && valueOnly !== label) {
        labels.add(valueOnly);
      }
    }
  }

  return Array.from(labels);
}

/**
 * Get "Out of Stock" translation for a given language
 */
const getOutOfStockLabel = (lang: string = "en"): string => {
  return t(lang as "en" | "hy" | "ru", "common.stock.outOfStock");
};

class ProductsFindTransformService {
  /**
   * Transform products to response format
   */
  async transformProducts(
    products: ProductWithRelations[],
    lang: string = "en"
  ): Promise<any[]> {
    // Get discount settings
    const discountSettings = await db.settings.findMany({
      where: {
        key: {
          in: ["globalDiscount", "categoryDiscounts"],
        },
      },
    });

    const globalDiscount =
      Number(
        discountSettings.find((s: { key: string; value: unknown }) => s.key === "globalDiscount")?.value
      ) || 0;
    
    const categoryDiscountsSetting = discountSettings.find((s: { key: string; value: unknown }) => s.key === "categoryDiscounts");
    const categoryDiscounts = categoryDiscountsSetting ? (categoryDiscountsSetting.value as Record<string, number>) || {} : {};

    // Build category fallback map from scalar category references on product.
    // This keeps catalog/category filtering correct even when relation data is partial.
    const fallbackCategoryIds = [
      ...new Set(
        products
          .flatMap((p) => {
            const relationCategoryIds = Array.isArray(p.categories)
              ? p.categories.map((category) => category.id)
              : [];
            const scalarCategoryIds = Array.isArray(p.categoryIds) ? p.categoryIds : [];
            const primaryCategoryId = p.primaryCategoryId ? [p.primaryCategoryId] : [];

            return [...scalarCategoryIds, ...primaryCategoryId].filter(
              (categoryId) => !relationCategoryIds.includes(categoryId)
            );
          })
      ),
    ];
    const fallbackCategories =
      fallbackCategoryIds.length > 0
        ? await db.category.findMany({
            where: { id: { in: fallbackCategoryIds } },
            include: { translations: true },
          })
        : [];
    type CategoryOutput = { id: string; slug: string; title: string };
    const fallbackCategoryById = new Map<string, CategoryOutput>(
      fallbackCategories.map((cat: { id: string; translations?: Array<{ locale: string; slug: string; title: string }> }) => {
        const catTranslations = Array.isArray(cat.translations) ? cat.translations : [];
        const catTranslation =
          catTranslations.find((t: { locale: string }) => t.locale === lang) || catTranslations[0] || null;
        return [
          cat.id,
          { id: cat.id, slug: catTranslation?.slug ?? "", title: catTranslation?.title ?? "" },
        ];
      })
    );

    // Format response
    const data = products.map((product: ProductWithRelations) => {
      // Безопасное получение translation с проверкой на существование массива
      const translations = Array.isArray(product.translations) ? product.translations : [];
      const translation = translations.find((t: { locale: string }) => t.locale === lang) || translations[0] || null;

      // Безопасное получение variant
      const variants = Array.isArray(product.variants) ? product.variants : [];
      const defaultPricingVariant = variants.find((item) =>
        isDefaultPricingVariant(item as { attributes?: unknown })
      );
      const selectableVariants = variants.filter(
        (item) => !isDefaultPricingVariant(item as { attributes?: unknown })
      );
      const displayVariant =
        selectableVariants.find((item) => isDisplayVariant(item as { attributes?: unknown })) ??
        selectableVariants[0] ??
        null;
      const defaultVariant = displayVariant ?? defaultPricingVariant ?? variants[0] ?? null;
      const selectableForSize = selectableVariants as Array<{ attributes?: unknown }>;
      const sizeLabel = extractSizeLabelFromProductVariants({
        defaultPricingVariant: defaultPricingVariant as { attributes?: unknown } | null,
        selectableVariants: selectableForSize,
      });
      const sizeLabels = collectSizeLabelsForCatalogFilter({
        defaultPricingVariant: defaultPricingVariant as { attributes?: unknown } | null,
        selectableVariants: selectableForSize,
        allVariants: variants as Array<{ attributes?: unknown }>,
        lang,
      });
      const sizeCatalogCategoryIds = collectSizeCatalogCategoryIdsFromVariants(
        variants as Array<{ attributes?: unknown }>
      );
      const sizeCatalogCategoryTitles = collectSizeCatalogCategoryTitlesFromVariants(
        variants as Array<{ attributes?: unknown }>
      );
      const stockSourceVariants = selectableVariants.length > 0 ? selectableVariants : variants;

      // Get all unique colors from ALL variants with imageUrl and colors hex (support both new and old format)
      // IMPORTANT: Only collect colors that actually exist in variants
      // IMPORTANT: Process ALL variants to get ALL colors, not just the first variant
      const colorMap = new Map<string, { value: string; imageUrl?: string | null; colors?: string[] | null }>();
      
      // Process all variants to collect all unique colors (options from variant.attributes JSON)
      selectableVariants.forEach((v) => {
        const options = getVariantOptions((v as { attributes?: unknown }).attributes);
        const colorOptions = options.filter((opt: VariantOptionFromAttributes) => {
          if (opt.attributeValue) {
            return opt.attributeValue.attribute?.key === "color";
          }
          return opt.attributeKey === "color";
        });

        colorOptions.forEach((colorOption: VariantOptionFromAttributes) => {
          let colorValue = "";
          let imageUrl: string | null | undefined = null;
          let colorsHex: string[] | null | undefined = null;

          if (colorOption.attributeValue) {
            const translation = colorOption.attributeValue.translations?.find((t: { locale: string }) => t.locale === lang) || colorOption.attributeValue.translations?.[0];
            colorValue = translation?.label || colorOption.attributeValue.value || "";
            imageUrl = colorOption.attributeValue.imageUrl || null;
            const colorsValue = colorOption.attributeValue.colors;
            colorsHex = Array.isArray(colorsValue) && colorsValue.every((c): c is string => typeof c === "string") ? colorsValue : null;
          } else {
            colorValue = colorOption.value || "";
          }

          if (colorValue) {
            const normalizedValue = colorValue.trim().toLowerCase();
            if (!colorMap.has(normalizedValue) || (imageUrl && !colorMap.get(normalizedValue)?.imageUrl)) {
              colorMap.set(normalizedValue, {
                value: colorValue.trim(),
                imageUrl: imageUrl || null,
                colors: colorsHex || null,
              });
            }
          }
        });

        // Fallback: check variant.attributes JSONB when no color in options array
        if (colorOptions.length === 0 && v.attributes && typeof v.attributes === "object" && !Array.isArray(v.attributes) && "color" in v.attributes) {
          const colorAttr = (v.attributes as { color?: unknown }).color;
          const colorAttributes = Array.isArray(colorAttr) ? colorAttr : colorAttr ? [colorAttr] : [];
          colorAttributes.forEach((colorAttrItem: unknown) => {
            const colorValue = (colorAttrItem && typeof colorAttrItem === 'object' && 'value' in colorAttrItem) 
              ? (colorAttrItem as { value?: unknown }).value 
              : colorAttrItem;
            if (colorValue && typeof colorValue === 'string') {
              const normalizedValue = colorValue.trim().toLowerCase();
              // Only add if not already in colorMap
              if (!colorMap.has(normalizedValue)) {
                colorMap.set(normalizedValue, {
                  value: colorValue.trim(),
                  imageUrl: null,
                  colors: null,
                });
              }
            }
          });
        }
      });
      
      // Also check productAttributes for color attribute values with imageUrl and colors
      // IMPORTANT: Only update colors that already exist in variants (already in colorMap)
      // Do not add new colors that don't exist in variants
      const productAttrs = product && 'productAttributes' in product && Array.isArray(product.productAttributes) ? product.productAttributes : [];
      if (productAttrs.length > 0) {
        productAttrs.forEach((productAttr: any) => {
          const attr = productAttr?.attribute;
          if (attr && typeof attr === 'object' && 'key' in attr && attr.key === 'color' && 'values' in attr && Array.isArray(attr.values)) {
            attr.values.forEach((attrValue: { translations?: Array<{ locale: string; label?: string }>; value?: string; imageUrl?: string | null; colors?: string[] | null }) => {
              const translation = attrValue.translations?.find((t: { locale: string }) => t.locale === lang) || attrValue.translations?.[0];
              const colorValue = translation?.label || attrValue.value || "";
              if (colorValue) {
                const normalizedValue = colorValue.trim().toLowerCase();
                // Only update if color already exists in colorMap (i.e., exists in variants)
                // This ensures we only show colors that actually exist in product variants
                if (colorMap.has(normalizedValue)) {
                  const existing = colorMap.get(normalizedValue);
                  // Update with imageUrl and colors hex from productAttributes if available
                  if (attrValue.imageUrl || attrValue.colors) {
                    colorMap.set(normalizedValue, {
                      value: colorValue.trim(),
                      imageUrl: attrValue.imageUrl || existing?.imageUrl || null,
                      colors: attrValue.colors || existing?.colors || null,
                    });
                  }
                }
              }
            });
          }
        });
      }
      
      const availableColors = Array.from(colorMap.values());

      const originalPrice = catalogPriceForStorefront(defaultVariant?.price || 0);
      const compareAtPriceAmd =
        defaultVariant?.compareAtPrice != null
          ? catalogPriceForStorefront(defaultVariant.compareAtPrice)
          : null;
      let finalPrice = originalPrice;
      const productDiscount = product.discountPercent || 0;
      
      // Calculate applied discount: productDiscount > categoryDiscount > globalDiscount
      let appliedDiscount = 0;
      if (productDiscount > 0) {
        appliedDiscount = productDiscount;
      } else {
        const primaryCategoryId = product.primaryCategoryId;
        if (primaryCategoryId && categoryDiscounts[primaryCategoryId]) {
          appliedDiscount = categoryDiscounts[primaryCategoryId];
        } else if (globalDiscount > 0) {
          appliedDiscount = globalDiscount;
        }
      }

      if (appliedDiscount > 0 && originalPrice > 0) {
        finalPrice = originalPrice * (1 - appliedDiscount / 100);
      }

      // Merge relation categories with scalar category references to avoid missing memberships.
      const relationCategories = Array.isArray(product.categories)
        ? product.categories.map((cat: { id: string; translations?: Array<{ locale: string; slug: string; title: string }> }) => {
            const catTranslations = Array.isArray(cat.translations) ? cat.translations : [];
            const catTranslation = catTranslations.find((t: { locale: string }) => t.locale === lang) || catTranslations[0] || null;
            return {
              id: cat.id,
              slug: catTranslation?.slug || "",
              title: catTranslation?.title || "",
            };
          })
        : [];

      const relationCategoryIdSet = new Set(relationCategories.map((category) => category.id));
      const scalarCategoryIds = Array.isArray(product.categoryIds) ? product.categoryIds : [];
      const primaryCategoryId = product.primaryCategoryId ? [product.primaryCategoryId] : [];
      const missingCategories = [...scalarCategoryIds, ...primaryCategoryId]
        .filter((categoryId) => !relationCategoryIdSet.has(categoryId))
        .map((categoryId) => fallbackCategoryById.get(categoryId))
        .filter((category): category is CategoryOutput => Boolean(category));

      const categories = [...relationCategories, ...missingCategories];

      const productImages = buildCatalogGalleryImages(product.media);
      const variantImages = buildVariantImageDtos(
        selectableVariants as Array<{
          id: string;
          imageUrl?: string | null;
          attributes?: unknown;
          price: number;
          compareAtPrice?: number | null;
          stock: number;
          sku?: string | null;
        }>,
        lang,
        appliedDiscount
      );
      const displayVariantGalleryImages =
        displayVariant && typeof displayVariant.imageUrl === 'string' && displayVariant.imageUrl.trim() !== ''
          ? cleanImageUrls(
              smartSplitUrls(displayVariant.imageUrl)
                .map((url) => processImageUrl(url) ?? url)
                .filter((url) => url.trim().length > 0)
            )
          : [];
      const catalogImages =
        productImages.length > 0 ? productImages : displayVariantGalleryImages;

      return {
        id: product.id,
        slug: translation?.slug || "",
        title: translation?.title || "",
        brand: null,
        /** Pricing/default variant — required for fast client-only cart lines from catalog cards */
        defaultVariantId: defaultVariant?.id ?? null,
        defaultVariantStock: defaultVariant?.stock ?? 0,
        defaultSku: defaultVariant?.sku?.trim() ?? "",
        sizeLabel,
        sizeLabels,
        sizeCatalogCategoryIds,
        sizeCatalogCategoryTitles,
        categories,
        skus: (selectableVariants.length > 0 ? selectableVariants : variants)
          .map((item) => item.sku?.trim() || "")
          .filter((sku, index, array) => sku.length > 0 && array.indexOf(sku) === index),
        price: finalPrice,
        originalPrice: appliedDiscount > 0 ? originalPrice : compareAtPriceAmd,
        compareAtPrice: compareAtPriceAmd,
        discountPercent: appliedDiscount > 0 ? appliedDiscount : null,
        image: catalogImages[0] || null,
        images: catalogImages,
        variantImages,
        inStock: stockSourceVariants.some((item) => (item.stock || 0) > 0),
        labels: (() => {
          // Map existing labels
          const existingLabels = Array.isArray(product.labels) ? product.labels.map((label: { id: string; type: string; value: string; position: string; color: string | null }) => ({
            id: label.id,
            type: label.type,
            value: label.value,
            position: label.position,
            color: label.color,
          })) : [];
          
          // Check if product is out of stock
          const isOutOfStock = !stockSourceVariants.some((item) => (item.stock || 0) > 0);
          
          // If out of stock, add "Out of Stock" label
          if (isOutOfStock) {
            // Check if "Out of Stock" label already exists
            const outOfStockText = getOutOfStockLabel(lang);
            const hasOutOfStockLabel = existingLabels.some(
              (label) => label.value.toLowerCase() === outOfStockText.toLowerCase() ||
                         label.value.toLowerCase().includes('out of stock') ||
                         label.value.toLowerCase().includes('արտադրված') ||
                         label.value.toLowerCase().includes('нет в наличии') ||
                         label.value.toLowerCase().includes('არ არის მარაგში')
            );
            
            if (!hasOutOfStockLabel) {
              // Check if top-left position is available, otherwise use top-right
              const topLeftOccupied = existingLabels.some((l) => l.position === 'top-left');
              const position = topLeftOccupied ? 'top-right' : 'top-left';
              
              existingLabels.push({
                id: `out-of-stock-${product.id}`,
                type: 'text',
                value: outOfStockText,
                position: position as 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right',
                color: '#6B7280', // Gray color for out of stock
              });
              
            }
          }
          
          return existingLabels;
        })(),
        colors: availableColors, // Add available colors array
      };
    });

    return data;
  }
}

export const productsFindTransformService = new ProductsFindTransformService();
                                                    
