import {
  adminInputAmdToUsd,
  catalogPriceForStorefront,
  catalogPriceToUsd,
  convertPrice,
  formatCatalogPrice,
  formatStorefrontUsdAmount,
  persistedOrderMoneyToUsd,
  roundCatalogAmd,
  type CurrencyCode,
} from '@/lib/currency';
import { resolveCartLineCollectionPriceAmd } from '@/app/cart/cart-line-pricing';
import type { CartItem } from '@/app/cart/types';
import { resolvePersistedOrderItemCollectionPriceAmd } from './resolve-persisted-order-item-collection-price-amd';

export interface OrderTotalsLike {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  currency?: string;
  collectionPriceAmount?: number;
}

export interface OrderLineForSummary {
  price: number;
  quantity: number;
  sizeCatalogCategoryPriceAmd?: number | null;
  /** Catalog variant base price in AMD when known (avoids USD round-trip for subtotal). */
  variantBasePriceAmd?: number | null;
}

export interface OrderSummaryDisplayAmounts {
  merchandiseUsd: number;
  collectionUsd: number;
  discountUsd: number;
  shippingUsd: number;
  taxUsd: number;
  totalUsd: number;
  /** Base merchandise subtotal in AMD when derived from catalog snapshots (no USD round-trip). */
  merchandiseAmd?: number | null;
  /** Customize / size-catalog surcharge total in AMD when line snapshots are available. */
  collectionAmd?: number | null;
  /** Total in AMD when breakdown rows use AMD snapshots (matches displayed subtotal + shipping + customize). */
  totalAmd?: number | null;
  hasCollection: boolean;
}

export interface ComputeOrderSummaryDisplayOptions {
  amountsAlreadyUsd?: boolean;
  /** Checkout delivery snapshot in AMD — keeps total aligned with shipping row. */
  shippingPriceAmd?: number | null;
}

/** @deprecated Use {@link persistedOrderMoneyToUsd} from `@/lib/currency`. */
export function orderStoredMoneyToUsd(
  amount: number,
  storedCurrency: string | undefined
): number {
  return persistedOrderMoneyToUsd(amount, storedCurrency);
}

/** Same as checkout `formatCheckoutUsd`. */
export function formatOrderSummaryUsd(amountUsd: number, displayCurrency: CurrencyCode): string {
  return formatStorefrontUsdAmount(amountUsd, displayCurrency);
}

/** Prefer persisted AMD snapshots for subtotal when available (checkout / order parity). */
export function formatOrderMerchandiseDisplay(
  summary: Pick<OrderSummaryDisplayAmounts, 'merchandiseUsd' | 'merchandiseAmd'>,
  displayCurrency: CurrencyCode
): string {
  if (
    displayCurrency === 'AMD' &&
    typeof summary.merchandiseAmd === 'number' &&
    Number.isFinite(summary.merchandiseAmd)
  ) {
    return formatCatalogPrice(summary.merchandiseAmd, 'AMD');
  }
  return formatOrderSummaryUsd(summary.merchandiseUsd, displayCurrency);
}

/** Total from AMD breakdown when components were summed in dram; otherwise one USD→display conversion. */
export function formatOrderTotalDisplay(
  summary: Pick<OrderSummaryDisplayAmounts, 'totalUsd' | 'totalAmd'>,
  displayCurrency: CurrencyCode
): string {
  if (
    displayCurrency === 'AMD' &&
    typeof summary.totalAmd === 'number' &&
    Number.isFinite(summary.totalAmd)
  ) {
    return formatCatalogPrice(summary.totalAmd, 'AMD');
  }
  return formatOrderSummaryUsd(summary.totalUsd, displayCurrency);
}

/** Prefer persisted AMD customize surcharge when line snapshots exist. */
export function formatOrderCollectionDisplay(
  summary: Pick<OrderSummaryDisplayAmounts, 'collectionUsd' | 'collectionAmd'>,
  displayCurrency: CurrencyCode
): string {
  if (
    displayCurrency === 'AMD' &&
    typeof summary.collectionAmd === 'number' &&
    Number.isFinite(summary.collectionAmd) &&
    summary.collectionAmd > 0
  ) {
    return formatCatalogPrice(summary.collectionAmd, 'AMD');
  }
  return formatOrderSummaryUsd(summary.collectionUsd, displayCurrency);
}

/** Reads AMD delivery price persisted on checkout (`shippingAddress.deliveryPriceAmd`). */
export function resolveOrderShippingPriceAmd(shippingAddress: unknown): number | null {
  if (!shippingAddress || typeof shippingAddress !== 'object') {
    return null;
  }
  const raw = (shippingAddress as { deliveryPriceAmd?: unknown }).deliveryPriceAmd;
  if (typeof raw !== 'number' || !Number.isFinite(raw) || raw <= 0) {
    return null;
  }
  return Math.round(raw);
}

/** Checkout parity: show admin delivery AMD when stored on the order. */
export function formatOrderShippingDisplay(
  shippingUsd: number,
  shippingPriceAmd: number | null | undefined,
  displayCurrency: CurrencyCode
): string {
  if (typeof shippingPriceAmd === 'number' && Number.isFinite(shippingPriceAmd) && shippingPriceAmd > 0) {
    return formatCatalogPrice(shippingPriceAmd, displayCurrency);
  }
  return formatOrderSummaryUsd(shippingUsd, displayCurrency);
}

function toSummaryUsd(
  amount: number,
  storedCurrency: string,
  amountsAlreadyUsd: boolean
): number {
  const normalized = Number(amount);
  if (!Number.isFinite(normalized) || normalized <= 0) {
    return 0;
  }
  if (amountsAlreadyUsd) {
    return normalized;
  }
  return persistedOrderMoneyToUsd(normalized, storedCurrency);
}

function resolveLineCollectionAmd(line: OrderLineForSummary): number {
  const priceAmd = line.sizeCatalogCategoryPriceAmd;
  if (typeof priceAmd !== 'number' || !Number.isFinite(priceAmd) || priceAmd <= 0) {
    return 0;
  }
  return Math.round(priceAmd);
}

function collectionUsdFromLine(line: OrderLineForSummary): number {
  const collectionAmd = resolveLineCollectionAmd(line);
  if (collectionAmd <= 0) {
    return 0;
  }
  const qty = Math.max(0, Number(line.quantity) || 0);
  return adminInputAmdToUsd(collectionAmd) * qty;
}

/** Sum customize surcharges in AMD (no USD round-trip). */
function sumCollectionAmdFromLines(items: OrderLineForSummary[]): number {
  return items.reduce((sum, line) => {
    const qty = Math.max(0, Number(line.quantity) || 0);
    return sum + resolveLineCollectionAmd(line) * qty;
  }, 0);
}

/**
 * Base merchandise subtotal in AMD: variant catalog price when known, otherwise unit AMD minus customize AMD.
 */
function sumMerchandiseAmdFromLines(
  items: OrderLineForSummary[],
  storedCurrency: string,
  amountsAlreadyUsd: boolean
): number {
  let merchandiseAmd = 0;

  for (const line of items) {
    const qty = Math.max(0, Number(line.quantity) || 0);
    if (qty === 0) {
      continue;
    }

    const collectionAmd = resolveLineCollectionAmd(line);
    const variantBaseAmd =
      typeof line.variantBasePriceAmd === 'number' &&
      Number.isFinite(line.variantBasePriceAmd) &&
      line.variantBasePriceAmd > 0
        ? Math.round(line.variantBasePriceAmd)
        : null;

    if (variantBaseAmd != null) {
      merchandiseAmd += variantBaseAmd * qty;
      continue;
    }

    const unitUsd = toSummaryUsd(line.price, storedCurrency, amountsAlreadyUsd);
    const unitAmd = roundCatalogAmd(convertPrice(unitUsd, 'USD', 'AMD'));
    merchandiseAmd += Math.max(0, unitAmd - collectionAmd) * qty;
  }

  return merchandiseAmd;
}

/** Mirrors checkout `useOrderSummary` collection row. */
function sumCollectionUsdFromLines(items: OrderLineForSummary[]): number {
  return items.reduce((sum, line) => sum + collectionUsdFromLine(line), 0);
}

/**
 * Mirrors checkout `useOrderSummary` base subtotal: line unit USD minus customize surcharge.
 */
function sumMerchandiseUsdFromLines(
  items: OrderLineForSummary[],
  storedCurrency: string,
  amountsAlreadyUsd: boolean
): number {
  let merchandiseUsd = 0;

  for (const line of items) {
    const qty = Math.max(0, Number(line.quantity) || 0);
    if (qty === 0) {
      continue;
    }
    const unitUsd = toSummaryUsd(line.price, storedCurrency, amountsAlreadyUsd);
    const collectionAmd = resolveLineCollectionAmd(line);
    const collectionUnitUsd = collectionAmd > 0 ? adminInputAmdToUsd(collectionAmd) : 0;
    merchandiseUsd += Math.max(0, unitUsd - collectionUnitUsd) * qty;
  }

  return merchandiseUsd;
}

function usdAmountToAmdSnapshot(amountUsd: number): number {
  if (!Number.isFinite(amountUsd) || amountUsd <= 0) {
    return 0;
  }
  return roundCatalogAmd(convertPrice(amountUsd, 'USD', 'AMD'));
}

/** Discount row — AMD snapshot matches component-sum total on order/checkout summary. */
export function formatOrderDiscountDisplay(
  summary: Pick<OrderSummaryDisplayAmounts, 'discountUsd'>,
  displayCurrency: CurrencyCode
): string {
  if (displayCurrency === 'AMD' && summary.discountUsd > 0) {
    return formatCatalogPrice(usdAmountToAmdSnapshot(summary.discountUsd), 'AMD');
  }
  return formatOrderSummaryUsd(summary.discountUsd, displayCurrency);
}

function resolveShippingAmdForTotal(
  shippingUsd: number,
  shippingPriceAmd: number | null | undefined
): number {
  if (
    typeof shippingPriceAmd === 'number' &&
    Number.isFinite(shippingPriceAmd) &&
    shippingPriceAmd > 0
  ) {
    return Math.round(shippingPriceAmd);
  }
  return usdAmountToAmdSnapshot(shippingUsd);
}

function resolveHeaderCollectionUsd(
  totals: OrderTotalsLike,
  collectionPriceAmountFallback: number | undefined,
  storedCurrency: string,
  amountsAlreadyUsd: boolean
): number {
  const fromTotals = totals.collectionPriceAmount;
  if (typeof fromTotals === 'number' && Number.isFinite(fromTotals) && fromTotals > 0) {
    return fromTotals;
  }
  const fallback = collectionPriceAmountFallback ?? 0;
  if (!Number.isFinite(fallback) || fallback <= 0) {
    return 0;
  }
  return toSummaryUsd(fallback, storedCurrency, amountsAlreadyUsd);
}

/**
 * Checkout-parity breakdown: base subtotal + customize + shipping − discount + tax.
 */
export function computeOrderSummaryDisplay(
  totals: OrderTotalsLike,
  collectionPriceAmountFallback: number | undefined,
  displayCurrency: CurrencyCode,
  items?: OrderLineForSummary[],
  options?: ComputeOrderSummaryDisplayOptions
): OrderSummaryDisplayAmounts {
  void displayCurrency;
  const storedCurrency = totals.currency?.trim() || 'USD';
  const amountsAlreadyUsd = options?.amountsAlreadyUsd === true;
  const discountUsd =
    totals.discount > 0 ? toSummaryUsd(totals.discount, storedCurrency, amountsAlreadyUsd) : 0;
  const shippingUsd = toSummaryUsd(totals.shipping, storedCurrency, amountsAlreadyUsd);
  const taxUsd = toSummaryUsd(totals.tax, storedCurrency, amountsAlreadyUsd);
  const totalUsd = toSummaryUsd(totals.total, storedCurrency, amountsAlreadyUsd);

  const collectionUsd =
    items && items.length > 0
      ? sumCollectionUsdFromLines(items)
      : resolveHeaderCollectionUsd(
          totals,
          collectionPriceAmountFallback,
          storedCurrency,
          amountsAlreadyUsd
        );

  const merchandiseUsd =
    items && items.length > 0
      ? sumMerchandiseUsdFromLines(items, storedCurrency, amountsAlreadyUsd)
      : Math.max(
          0,
          toSummaryUsd(totals.subtotal, storedCurrency, amountsAlreadyUsd) - collectionUsd
        );

  const collectionAmd =
    items && items.length > 0 ? sumCollectionAmdFromLines(items) : null;
  const merchandiseAmd =
    items && items.length > 0
      ? sumMerchandiseAmdFromLines(items, storedCurrency, amountsAlreadyUsd)
      : collectionAmd != null
        ? Math.max(
            0,
            roundCatalogAmd(
              convertPrice(
                toSummaryUsd(totals.subtotal, storedCurrency, amountsAlreadyUsd),
                'USD',
                'AMD'
              )
            ) - collectionAmd
          )
        : null;

  const totalAmd =
    merchandiseAmd != null
      ? Math.max(
          0,
          (merchandiseAmd ?? 0) +
            (collectionAmd ?? 0) +
            resolveShippingAmdForTotal(shippingUsd, options?.shippingPriceAmd) -
            usdAmountToAmdSnapshot(discountUsd) +
            usdAmountToAmdSnapshot(taxUsd)
        )
      : null;

  return {
    merchandiseUsd,
    collectionUsd,
    discountUsd,
    shippingUsd,
    taxUsd,
    totalUsd,
    merchandiseAmd,
    collectionAmd,
    totalAmd,
    hasCollection: collectionUsd > 0 || (collectionAmd ?? 0) > 0,
  };
}

export interface OrderListTotalsSource {
  subtotal?: number;
  discountAmount?: number;
  shippingAmount?: number;
  taxAmount?: number;
  total: number;
  currency?: string;
  collectionPriceAmount?: number;
  shippingPriceAmd?: number | null;
  summaryLines?: OrderLineForSummary[];
}

/** Build checkout-parity summary lines from live cart (same shape as persisted order items). */
export function buildCheckoutSummaryLinesFromCart(
  items: CartItem[],
  categoryPriceByTitle?: Map<string, number>
): OrderLineForSummary[] {
  return items.map((item) => {
    const collectionAmd = resolveCartLineCollectionPriceAmd(item, categoryPriceByTitle);
    const collectionUnitUsd = collectionAmd > 0 ? adminInputAmdToUsd(collectionAmd) : 0;

    return {
      price: item.price + collectionUnitUsd,
      quantity: item.quantity,
      sizeCatalogCategoryPriceAmd: collectionAmd > 0 ? collectionAmd : null,
      variantBasePriceAmd: item.catalogBasePriceAmd ?? null,
    };
  });
}

/** Build checkout-parity summary lines from persisted order items (list/detail). */
export function buildOrderSummaryLinesFromPersistedItems(
  items: Array<{
    price?: number | null;
    quantity?: number | null;
    sizeCatalogTitle?: string | null;
    customizePlain?: string | null;
    customizeHtml?: string | null;
    variant?: { price?: number | null } | null;
  }>,
  orderCurrency: string,
  sizeCatalogPriceByTitle?: Map<string, number>
): OrderLineForSummary[] {
  const priceMap = sizeCatalogPriceByTitle ?? new Map<string, number>();
  const storedCurrency = orderCurrency.trim() || 'USD';

  return items.map((item) => {
    const quantity = Math.max(0, Number(item.quantity ?? 0));
    const unitPriceUsd = persistedOrderMoneyToUsd(Number(item.price ?? 0), storedCurrency);
    const variantBasePriceAmd =
      item.variant?.price != null && Number.isFinite(Number(item.variant.price))
        ? catalogPriceForStorefront(Number(item.variant.price))
        : null;
    const variantBaseUsd = catalogPriceToUsd(Number(item.variant?.price ?? Number.NaN));
    const normalizedTitle = item.sizeCatalogTitle?.trim().toLocaleLowerCase() ?? '';
    const mappedCollectionPriceAmd =
      normalizedTitle !== '' ? (priceMap.get(normalizedTitle) ?? null) : null;
    const sizeCatalogCategoryPriceAmd = resolvePersistedOrderItemCollectionPriceAmd({
      unitPriceUsd,
      variantBaseUsd,
      mappedCollectionPriceAmd,
      customizePlain: item.customizePlain,
      customizeHtml: item.customizeHtml,
    });

    return {
      price: unitPriceUsd,
      quantity,
      sizeCatalogCategoryPriceAmd,
      variantBasePriceAmd,
    };
  });
}

/** USD shipping amount for order list rows (API may already return USD). */
export function resolveOrderListShippingUsd(
  order: Pick<OrderListTotalsSource, 'shippingAmount' | 'currency'>
): number {
  const amount = order.shippingAmount ?? 0;
  if (!Number.isFinite(amount) || amount <= 0) {
    return 0;
  }
  const alreadyUsd = order.currency?.trim().toUpperCase() === 'USD';
  return alreadyUsd ? amount : persistedOrderMoneyToUsd(amount, order.currency);
}

/** Order list shipping snippet — null when free or missing. */
export function formatOrderListShippingDisplay(
  order: Pick<OrderListTotalsSource, 'shippingAmount' | 'currency' | 'shippingPriceAmd'>,
  displayCurrency: CurrencyCode
): string | null {
  const shippingUsd = resolveOrderListShippingUsd(order);
  const hasShippingAmd =
    typeof order.shippingPriceAmd === 'number' &&
    Number.isFinite(order.shippingPriceAmd) &&
    order.shippingPriceAmd > 0;
  if (shippingUsd <= 0 && !hasShippingAmd) {
    return null;
  }
  return formatOrderShippingDisplay(shippingUsd, order.shippingPriceAmd, displayCurrency);
}

/** Order list / row total — uses persisted `total` when breakdown fields are missing. */
export function formatOrderListTotalDisplay(
  order: OrderListTotalsSource,
  displayCurrency: CurrencyCode
): string {
  const hasBreakdown =
    order.subtotal !== undefined &&
    order.discountAmount !== undefined &&
    order.shippingAmount !== undefined &&
    order.taxAmount !== undefined;

  if (!hasBreakdown) {
    const alreadyUsd = order.currency?.trim().toUpperCase() === 'USD';
    return formatOrderSummaryUsd(
      alreadyUsd ? order.total : persistedOrderMoneyToUsd(order.total, order.currency),
      displayCurrency
    );
  }

  const summary = computeOrderSummaryDisplay(
    {
      subtotal: order.subtotal ?? 0,
      discount: order.discountAmount ?? 0,
      shipping: order.shippingAmount ?? 0,
      tax: order.taxAmount ?? 0,
      total: order.total,
      currency: order.currency,
      collectionPriceAmount: order.collectionPriceAmount,
    },
    order.collectionPriceAmount,
    displayCurrency,
    order.summaryLines,
    {
      amountsAlreadyUsd: order.currency?.trim().toUpperCase() === 'USD',
      shippingPriceAmd: order.shippingPriceAmd,
    }
  );
  return formatOrderTotalDisplay(summary, displayCurrency);
}
