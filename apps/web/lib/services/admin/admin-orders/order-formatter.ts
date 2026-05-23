import type { Prisma } from "@prisma/client";
import { filterDisplayableVariantOptions } from "@/lib/default-pricing-variant";
import { mergeSizeCatalogIntoVariantOptions } from "@/lib/orders/merge-size-catalog-into-variant-options";
import {
  adminInputAmdToUsd,
  catalogPriceForStorefront,
  catalogPriceToUsd,
  persistedOrderMoneyToUsd,
} from "@/lib/currency";
import { resolveCollectionSurchargeUsd } from "@/lib/orders/resolve-collection-surcharge-usd";
import { resolveOrderShippingPriceAmd, buildOrderSummaryLinesFromPersistedItems } from "@/lib/orders/order-summary-display";

type VariantOptionFromAttributes = {
  attributeKey?: string | null;
  value?: string | null;
  valueId?: string | null;
  attributeValue?: {
    value?: string;
    imageUrl?: string | null;
    colors?: unknown;
    translations?: Array<{
      locale?: string;
      label?: string;
    }>;
    attribute?: {
      key?: string;
    };
  } | null;
};

type OrderListVariantPreview = {
  label: string;
  imageUrl?: string;
  colorLabel?: string;
  colorHex?: string;
};

function getVariantOptions(attributes: unknown): VariantOptionFromAttributes[] {
  return Array.isArray(attributes) ? (attributes as VariantOptionFromAttributes[]) : [];
}

function getFirstColorHex(colors: unknown): string | undefined {
  if (Array.isArray(colors)) {
    const first = colors.find((item): item is string => typeof item === 'string' && item.trim().length > 0);
    return first?.trim();
  }

  if (typeof colors === 'string') {
    const trimmed = colors.trim();
    if (!trimmed) return undefined;
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        const first = parsed.find((item): item is string => typeof item === 'string' && item.trim().length > 0);
        return first?.trim();
      }
    } catch {
      return undefined;
    }
  }

  return undefined;
}

/**
 * Format order for list response
 */
export function formatOrderForList(order: {
  id: string;
  number: string;
  status: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  total: number;
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  taxAmount: number;
  currency: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  shippingAddress?: unknown;
  createdAt: Date;
  items: Array<{
    price?: number | null;
    total?: number | null;
    quantity?: number | null;
    sizeCatalogTitle?: string | null;
    variant?: { price?: number | null } | null;
    sizeCatalogVersion?: string | null;
    sizeCatalogImageUrl?: string | null;
    variant?: {
      attributes?: unknown;
      price?: number | null;
    } | null;
  }>;
  user?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    phone: string | null;
  } | null;
}) {
  const buildOrderVariantPreviews = (
    items: Array<{
      sizeCatalogTitle?: string | null;
      sizeCatalogVersion?: string | null;
      sizeCatalogImageUrl?: string | null;
      variant?: {
        attributes?: unknown;
      } | null;
    }>
  ): { previews: OrderListVariantPreview[]; hasMore: number } => {
    const previews: OrderListVariantPreview[] = [];

    for (const item of items) {
      const variantOptionsBase = filterDisplayableVariantOptions(
        getVariantOptions(item.variant?.attributes).map(formatVariantOption)
      );
      const variantOptions = mergeSizeCatalogIntoVariantOptions(
        variantOptionsBase,
        item.sizeCatalogTitle,
        item.sizeCatalogVersion,
        item.sizeCatalogImageUrl
      );

      const colorOption = variantOptions.find((opt) => {
        const key = opt.attributeKey?.toLowerCase().trim();
        return key === 'color' || key === 'colour';
      });
      const sizeOption = variantOptions.find((opt) => opt.attributeKey?.toLowerCase().trim() === 'size');

      const colorLabel = (colorOption?.label || colorOption?.value || '').trim();
      const sizeLabel = (sizeOption?.label || sizeOption?.value || '').trim();
      const imageUrl = (sizeOption?.imageUrl || colorOption?.imageUrl || '').trim() || undefined;
      const colorHex = getFirstColorHex(colorOption?.colors);

      const label = colorLabel && sizeLabel ? `${colorLabel} / ${sizeLabel}` : colorLabel || sizeLabel;
      if (!label) continue;

      const nextPreview: OrderListVariantPreview = {
        label,
        ...(imageUrl ? { imageUrl } : {}),
        ...(colorLabel ? { colorLabel } : {}),
        ...(colorHex ? { colorHex } : {}),
      };

      const duplicate = previews.some(
        (preview) =>
          preview.label === nextPreview.label &&
          preview.imageUrl === nextPreview.imageUrl &&
          preview.colorHex === nextPreview.colorHex
      );
      if (!duplicate) {
        previews.push(nextPreview);
      }
    }

    if (previews.length <= 2) {
      return { previews, hasMore: 0 };
    }
    return { previews: previews.slice(0, 2), hasMore: previews.length - 2 };
  };

  const buildOrderColorSizeSummary = (
    items: Array<{
      sizeCatalogTitle?: string | null;
      sizeCatalogVersion?: string | null;
      sizeCatalogImageUrl?: string | null;
      variant?: {
        attributes?: unknown;
      } | null;
    }>
  ): string | null => {
    const labels = items
      .map((item) => {
        const variantOptionsBase = filterDisplayableVariantOptions(
          getVariantOptions(item.variant?.attributes).map(formatVariantOption)
        );
        const variantOptions = mergeSizeCatalogIntoVariantOptions(
          variantOptionsBase,
          item.sizeCatalogTitle,
          item.sizeCatalogVersion,
          item.sizeCatalogImageUrl
        );

        let colorLabel: string | null = null;
        let sizeLabel: string | null = null;

        for (const option of variantOptions) {
          const key = option.attributeKey?.toLowerCase().trim();
          const value = (option.label || option.value || '').trim();
          if (!value || !key) continue;

          if ((key === 'color' || key === 'colour') && !colorLabel) {
            colorLabel = value;
          }
          if (key === 'size' && !sizeLabel) {
            sizeLabel = value;
          }
        }

        if (colorLabel && sizeLabel) return `${colorLabel} / ${sizeLabel}`;
        return colorLabel || sizeLabel || null;
      })
      .filter((label): label is string => Boolean(label && label.trim()));

    if (labels.length === 0) {
      return null;
    }

    const uniqueLabels = Array.from(new Set(labels));
    if (uniqueLabels.length <= 2) {
      return uniqueLabels.join(', ');
    }

    return `${uniqueLabels.slice(0, 2).join(', ')} +${uniqueLabels.length - 2}`;
  };

  const customer = order.user || null;
  const firstName = customer?.firstName || '';
  const lastName = customer?.lastName || '';
  const colorSizeSummary = buildOrderColorSizeSummary(order.items);
  const { previews: colorSizePreviews, hasMore: colorSizePreviewsHasMore } = buildOrderVariantPreviews(order.items);
  const orderCurrency = order.currency || "USD";
  const collectionPriceAmount = Number(
    order.items
      .reduce(
        (sum, item) =>
          sum + resolveCollectionSurchargeUsd(item, new Map(), orderCurrency),
        0
      )
      .toFixed(2)
  );
  const summaryLines = buildOrderSummaryLinesFromPersistedItems(order.items, orderCurrency);
  const shippingPriceAmd = resolveOrderShippingPriceAmd(order.shippingAddress);

  return {
    id: order.id,
    number: order.number,
    status: order.status,
    paymentStatus: order.paymentStatus,
    fulfillmentStatus: order.fulfillmentStatus,
    total: persistedOrderMoneyToUsd(Number(order.total), orderCurrency),
    subtotal: persistedOrderMoneyToUsd(Number(order.subtotal), orderCurrency),
    discountAmount: persistedOrderMoneyToUsd(Number(order.discountAmount), orderCurrency),
    shippingAmount: persistedOrderMoneyToUsd(Number(order.shippingAmount), orderCurrency),
    taxAmount: persistedOrderMoneyToUsd(Number(order.taxAmount), orderCurrency),
    collectionPriceAmount,
    currency: "USD",
    shippingPriceAmd,
    summaryLines,
    customerEmail: customer?.email || order.customerEmail || '',
    customerPhone: customer?.phone || order.customerPhone || '',
    customerFirstName: firstName,
    customerLastName: lastName,
    customerId: customer?.id || null,
    itemsCount: order.items.length,
    colorSizeSummary,
    colorSizePreviews,
    colorSizePreviewsHasMore,
    createdAt: order.createdAt.toISOString(),
  };
}

/**
 * Format variant option for order item
 */
function formatVariantOption(opt: VariantOptionFromAttributes) {
  // New format: Use AttributeValue if available
  if (opt.attributeValue) {
    const translations = opt.attributeValue.translations || [];
    const label = translations.length > 0 ? translations[0]?.label : opt.attributeValue.value;
    
    return {
      attributeKey: opt.attributeValue.attribute?.key || undefined,
      value: opt.attributeValue.value || undefined,
      label: label || undefined,
      imageUrl: opt.attributeValue.imageUrl || undefined,
      colors: opt.attributeValue.colors || undefined,
    };
  }
  
  // Old format: Use attributeKey and value directly
  return {
    attributeKey: opt.attributeKey || undefined,
    value: opt.value || undefined,
  };
}

/**
 * Format order item for detail response
 */
export function formatOrderItem(
  item: {
  id: string;
  variantId: string | null;
  productTitle: string | null;
  sku: string | null;
  price?: number | null;
  quantity: number | null;
  total: number | null;
  sizeCatalogTitle?: string | null;
  sizeCatalogVersion?: string | null;
  sizeCatalogImageUrl?: string | null;
  customizePlain?: string | null;
  customizeHtml?: string | null;
  variant?: {
    id: string;
    sku: string | null;
    price?: number | string | null;
    attributes?: unknown;
    product?: {
      id: string;
      translations?: Array<{
        title: string;
      }>;
    } | null;
  } | null;
},
  orderCurrency: string,
  sizeCatalogPriceByTitle?: Map<string, number>
) {
  const variant = item.variant;
  const product = variant?.product;
  const translations = product && Array.isArray(product.translations) ? product.translations : [];
  const translation = translations[0] || null;

  const quantity = item.quantity ?? 0;
  const totalUsd = persistedOrderMoneyToUsd(Number(item.total ?? 0), orderCurrency);
  const unitPriceUsd = persistedOrderMoneyToUsd(Number(item.price ?? 0), orderCurrency);
  const unitPrice =
    quantity > 0 && unitPriceUsd > 0
      ? unitPriceUsd
      : quantity > 0
        ? Number((totalUsd / quantity).toFixed(4))
        : totalUsd;
  const total = totalUsd;

  const variantOptionsBase = filterDisplayableVariantOptions(
    getVariantOptions(variant?.attributes).map(formatVariantOption)
  );
  const variantOptions = mergeSizeCatalogIntoVariantOptions(
    variantOptionsBase,
    item.sizeCatalogTitle,
    item.sizeCatalogVersion,
    item.sizeCatalogImageUrl
  );
  const normalizedTitle = item.sizeCatalogTitle?.trim().toLocaleLowerCase() ?? '';
  const mappedCollectionPriceAmd =
    normalizedTitle !== '' ? (sizeCatalogPriceByTitle?.get(normalizedTitle) ?? null) : null;
  const variantCatalogBaseUsd = catalogPriceToUsd(Number(variant?.price ?? Number.NaN));
  const usdPerAmd = adminInputAmdToUsd(1);
  const inferredCollectionPriceAmd =
    Number.isFinite(variantCatalogBaseUsd) &&
    Number.isFinite(unitPrice) &&
    Number.isFinite(usdPerAmd) &&
    usdPerAmd > 0
      ? Math.max(0, Math.round((unitPrice - variantCatalogBaseUsd) / usdPerAmd))
      : null;
  const sizeCatalogCategoryPriceAmd = mappedCollectionPriceAmd ?? inferredCollectionPriceAmd;
  const variantBasePriceAmd =
    variant?.price != null ? catalogPriceForStorefront(Number(variant.price)) : null;

  return {
    id: item.id,
    variantId: item.variantId || variant?.id || null,
    productId: product?.id || null,
    productTitle: translation?.title || item.productTitle || "Unknown Product",
    sku: variant?.sku || item.sku || "N/A",
    quantity,
    total,
    unitPrice,
    variantOptions,
    sizeCatalogTitle: item.sizeCatalogTitle?.trim() || null,
    sizeCatalogVersion: item.sizeCatalogVersion?.trim() || null,
    sizeCatalogImageUrl: item.sizeCatalogImageUrl?.trim() || null,
    sizeCatalogCategoryPriceAmd,
    variantBasePriceAmd,
    customizePlain: item.customizePlain?.trim() || null,
    customizeHtml: item.customizeHtml?.trim() || null,
  };
}

/**
 * Format order for detail response
 */
export function formatOrderForDetail(order: {
  id: string;
  number: string;
  status: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  total: number;
  subtotal: number | null;
  discountAmount: number | null;
  shippingAmount: number | null;
  taxAmount: number | null;
  currency: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  billingAddress: Prisma.JsonValue | null;
  shippingAddress: Prisma.JsonValue | null;
  shippingMethod: string | null;
  notes: string | null;
  adminNotes: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  updatedAt: Date | null;
  user: {
    id: string;
    email: string | null;
    phone: string | null;
    firstName: string | null;
    lastName: string | null;
  } | null;
  items: Array<{
    id: string;
    variantId: string | null;
    productTitle: string | null;
    sku: string | null;
    price?: number | null;
    quantity: number | null;
    total: number | null;
    sizeCatalogTitle?: string | null;
    sizeCatalogVersion?: string | null;
    sizeCatalogImageUrl?: string | null;
    customizePlain?: string | null;
    customizeHtml?: string | null;
    variant?: {
      id: string;
      sku: string | null;
      attributes?: unknown;
      product?: {
        id: string;
        translations?: Array<{
          title: string;
        }>;
      } | null;
    } | null;
  }>;
  payments: Array<{
    id: string;
    provider: string;
    method: string;
    amount: number;
    currency: string;
    status: string;
    cardLast4: string | null;
    cardBrand: string | null;
  }>;
}, sizeCatalogPriceByTitle?: Map<string, number>) {
  const user = order.user;
  const payments = Array.isArray(order.payments) ? order.payments : [];
  const primaryPayment = payments[0] || null;
  const orderCurrency = order.currency || "USD";
  const formattedItems = order.items.map((item) =>
    formatOrderItem(item, orderCurrency, sizeCatalogPriceByTitle)
  );
  const collectionPriceAmount = Number(
    order.items
      .reduce(
        (sum, item) =>
          sum + resolveCollectionSurchargeUsd(item, sizeCatalogPriceByTitle ?? new Map(), orderCurrency),
        0
      )
      .toFixed(2)
  );

  return {
    id: order.id,
    number: order.number,
    status: order.status,
    paymentStatus: order.paymentStatus,
    fulfillmentStatus: order.fulfillmentStatus,
    total: persistedOrderMoneyToUsd(Number(order.total), orderCurrency),
    currency: "USD",
    totals: {
      subtotal: persistedOrderMoneyToUsd(Number(order.subtotal || 0), orderCurrency),
      discount: persistedOrderMoneyToUsd(Number(order.discountAmount || 0), orderCurrency),
      shipping: persistedOrderMoneyToUsd(Number(order.shippingAmount || 0), orderCurrency),
      tax: persistedOrderMoneyToUsd(Number(order.taxAmount || 0), orderCurrency),
      total: persistedOrderMoneyToUsd(Number(order.total || 0), orderCurrency),
      collectionPriceAmount,
      currency: "USD",
    },
    collectionPriceAmount,
    customerEmail: order.customerEmail || user?.email || undefined,
    customerPhone: order.customerPhone || user?.phone || undefined,
    billingAddress: order.billingAddress || null,
    shippingAddress: order.shippingAddress || null,
    shippingMethod: order.shippingMethod || null,
    shippingPriceAmd: resolveOrderShippingPriceAmd(order.shippingAddress),
    notes: order.notes || null,
    adminNotes: order.adminNotes || null,
    ipAddress: order.ipAddress || null,
    userAgent: order.userAgent || null,
    payment: primaryPayment
      ? {
          id: primaryPayment.id,
          provider: primaryPayment.provider,
          method: primaryPayment.method,
          amount: primaryPayment.amount,
          currency: primaryPayment.currency,
          status: primaryPayment.status,
          cardLast4: primaryPayment.cardLast4,
          cardBrand: primaryPayment.cardBrand,
        }
      : null,
    customer: user
      ? {
          id: user.id,
          email: user.email,
          phone: user.phone,
          firstName: user.firstName,
          lastName: user.lastName,
        }
      : null,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt?.toISOString?.() ?? undefined,
    items: formattedItems,
  };
}

