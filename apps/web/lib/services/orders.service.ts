import { db } from "@white-shop/db";
import { Prisma } from "@prisma/client";
import { adminInputAmdToUsd, catalogPriceToUsd } from "@/lib/currency";
import { filterDisplayableVariantOptions } from "@/lib/default-pricing-variant";
import type { CheckoutData } from "../types/checkout";
import {
  mergeSizeCatalogIntoVariantOptions,
  sanitizeCheckoutImageUrl,
} from "../orders/merge-size-catalog-into-variant-options";
import { isR2Configured, uploadSizeCatalogImageToR2 } from "./r2.service";
import { parseDataImageUrl } from "./utils/data-url-image";
import { CUSTOM_SIZE_ORDER_NOTE_MARKER } from "./custom-size-order.service";
import {
  CUSTOMIZE_PLAIN_MAX_LENGTH,
  getPlainTextFromHtmlServer,
  sanitizeCustomizeHtmlServer,
  validateCustomizePlainLength,
} from "../orders/sanitize-customize-html-server";
import { logger } from "./utils/logger";
import { adminDeliveryService } from "./admin/admin-delivery.service";
import { tryApplyCoupon } from "./coupon.service";

type ProductVariantWithProduct = Prisma.ProductVariantGetPayload<{
  include: {
    product: {
      include: {
        translations: true;
      };
    };
  };
}>;

type OrderItemWithVariant = Prisma.OrderItemGetPayload<{
  include: {
    variant: true;
  };
}>;

/** Option-like item from variant.attributes JSON (replaces removed options relation) */
type VariantOptionFromAttributes = {
  attributeKey?: string | null;
  value?: string | null;
  valueId?: string;
  attributeValue?: {
    value?: string;
    attribute?: { key?: string };
    translations?: Array<{ label?: string }>;
    imageUrl?: string | null;
    colors?: unknown;
  };
};

function normalizeSizeCatalogTitleLookup(value: string | null | undefined): string {
  if (typeof value !== 'string') return '';
  return value
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase();
}

/**
 * Honors client `earlyAccess` only when this product slug is linked on a published voting item.
 */
async function resolveEarlyAccessForCheckoutLine(productId: string, requested: boolean): Promise<boolean> {
  if (!requested) {
    return false;
  }

  const translations = await db.productTranslation.findMany({
    where: { productId },
    select: { slug: true },
  });
  const slugSet = new Set(
    translations
      .map((row: { slug: string }) => row.slug.trim().toLowerCase())
      .filter((s: string) => s.length > 0),
  );
  if (slugSet.size === 0) {
    return false;
  }

  const votingItems = await db.votingItem.findMany({
    where: {
      deletedAt: null,
      productSlug: { not: null },
      voting: { published: true, deletedAt: null },
    },
    select: { productSlug: true },
  });

  for (const row of votingItems) {
    const slug = row.productSlug?.trim().toLowerCase() ?? '';
    if (slug.length > 0 && slugSet.has(slug)) {
      return true;
    }
  }

  logger.warn("Checkout earlyAccess ignored: product slug not linked to published culture voting item", {
    productId,
  });
  return false;
}

function getVariantOptions(attributes: unknown): VariantOptionFromAttributes[] {
  return Array.isArray(attributes) ? (attributes as VariantOptionFromAttributes[]) : [];
}

function resolveCollectionSurchargeUsd(
  item: {
    quantity: number | null;
    price?: number | null;
    total?: number | null;
    sizeCatalogTitle?: string | null;
    variant?: { price?: number | null } | null;
  },
  sizeCatalogPriceByTitle: Map<string, number>
): number {
  const quantity = Math.max(0, Number(item.quantity ?? 0));
  if (quantity === 0) return 0;

  const itemUnitPrice = Number(item.price ?? Number.NaN);
  const variantBasePriceUsd = catalogPriceToUsd(Number(item.variant?.price ?? Number.NaN));
  if (Number.isFinite(itemUnitPrice) && Number.isFinite(variantBasePriceUsd)) {
    const perUnitSurcharge = Math.max(0, itemUnitPrice - variantBasePriceUsd);
    if (perUnitSurcharge > 0) {
      return perUnitSurcharge * quantity;
    }
  }

  const normalizedTitle = normalizeSizeCatalogTitleLookup(item.sizeCatalogTitle);
  const mappedSurchargeAmd = normalizedTitle !== '' ? (sizeCatalogPriceByTitle.get(normalizedTitle) ?? 0) : 0;
  if (mappedSurchargeAmd > 0) {
    return adminInputAmdToUsd(mappedSurchargeAmd) * quantity;
  }

  const itemTotal = Number(item.total ?? Number.NaN);
  if (!Number.isFinite(itemTotal) || !Number.isFinite(variantBasePriceUsd)) {
    return 0;
  }
  const baseTotal = variantBasePriceUsd * quantity;
  return Math.max(0, itemTotal - baseTotal);
}

// Media type helper
type MediaItem = string | { url?: string; src?: string } | unknown;

const ORDER_NUMBER_START = 100;
const ORDER_NUMBER_RETRY_LIMIT = 5;
/** Prisma default interactive tx timeout is 5s; checkout can exceed that on slow DB or many line items. */
const CHECKOUT_TRANSACTION_TIMEOUT_MS = 30_000;

function checkoutShippingCity(
  shippingAddress: CheckoutData["shippingAddress"] | Record<string, unknown> | undefined,
): string {
  if (!shippingAddress || typeof shippingAddress !== "object") {
    return "";
  }
  const o = shippingAddress as Record<string, unknown>;
  if (typeof o.state === "string" && o.state.trim()) {
    return o.state.trim();
  }
  if (typeof o.city === "string" && o.city.trim()) {
    return o.city.trim();
  }
  return "";
}

function checkoutShippingCountry(
  shippingAddress: CheckoutData["shippingAddress"] | Record<string, unknown> | undefined,
): string {
  if (!shippingAddress || typeof shippingAddress !== "object") {
    return "Armenia";
  }
  const o = shippingAddress as Record<string, unknown>;
  const country = typeof o.country === "string" ? o.country.trim() : "";
  if (country) {
    return country;
  }
  return "Armenia";
}

function isP2002Error(error: unknown): error is { code: string; meta?: { target?: string[] } } {
  if (!error || typeof error !== "object" || !("code" in error)) {
    return false;
  }
  const prismaError = error as { code?: string; meta?: { target?: string[] } };
  if (prismaError.code !== "P2002") {
    return false;
  }
  const target = prismaError.meta?.target ?? [];
  if (target.length === 0) {
    return true;
  }
  return target.some((field) => field.includes("number"));
}

async function getNextSequentialOrderNumber(tx: Prisma.TransactionClient): Promise<string> {
  try {
    const [row] = await tx.$queryRaw<Array<{ max_number: number | null }>>`
      SELECT MAX(CAST("number" AS INTEGER)) AS max_number
      FROM "orders"
      WHERE "number" ~ '^[0-9]+$'
    `;
    const maxNumber = Number(row?.max_number ?? 0);
    return String(Math.max(ORDER_NUMBER_START, maxNumber + 1));
  } catch {
    const recentOrders = await tx.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      select: { number: true },
    });
    const maxNumber = recentOrders.reduce((currentMax, order) => {
      if (!/^\d+$/.test(order.number)) {
        return currentMax;
      }
      return Math.max(currentMax, Number(order.number));
    }, 0);
    return String(Math.max(ORDER_NUMBER_START, maxNumber + 1));
  }
}

class OrdersService {
  /**
   * Create order (checkout)
   */
  async checkout(data: CheckoutData, userId?: string) {
    try {
      const {
        items: guestItems,
        email,
        phone,
        shippingMethod = 'pickup',
        shippingAddress,
        paymentMethod = 'idram',
        couponCode: rawCouponCode,
      } = data;

      // Validate required fields
      if (!email || !phone) {
        throw {
          status: 400,
          type: "https://api.shop.am/problems/validation-error",
          title: "Validation Error",
          detail: "Email and phone are required",
        };
      }

      // Get cart items - either from user cart or guest items
      let cartItems: Array<{
        variantId: string;
        productId: string;
        quantity: number;
        price: number;
        productTitle: string;
        variantTitle?: string;
        sku: string;
        imageUrl?: string;
        sizeCatalogTitle?: string;
        sizeCatalogVersion?: string;
        sizeCatalogImageUrl?: string;
        sizeCatalogCategoryPriceAmd?: number;
        customizePlain?: string | null;
        customizeHtml?: string | null;
        customSizeRequest?: {
          name: string;
          phone: string;
          email: string;
          description: string;
          imageUrl: string;
        } | null;
        earlyAccess: boolean;
      }> = [];

      if (guestItems && Array.isArray(guestItems) && guestItems.length > 0) {
        // Get items from checkout request (localStorage cart)
        cartItems = await Promise.all(
          guestItems.map(
            async (item: {
              productId: string;
              variantId: string;
              quantity: number;
              earlyAccess?: boolean;
              sizeCatalogTitle?: string;
              sizeCatalogVersion?: string;
              sizeCatalogImageUrl?: string;
              sizeCatalogCategoryPriceAmd?: number;
              customizePlain?: string;
              customizeHtml?: string;
              customSizeRequest?: {
                name?: string;
                phone?: string;
                email?: string;
                description?: string;
                imageDataUrl?: string;
                imageFileName?: string;
              };
            }) => {
            const { productId, variantId, quantity } = item;

            if (!productId || !variantId || !quantity) {
              throw {
                status: 400,
                type: "https://api.shop.am/problems/validation-error",
                title: "Validation Error",
                detail: "Each item must have productId, variantId, and quantity",
              };
            }

            // Get product and variant details
            const variant = await db.productVariant.findUnique({
              where: { id: variantId },
              include: {
                product: {
                  include: {
                    translations: true,
                  },
                },
              },
            });

            if (!variant) {
              throw {
                status: 404,
                type: "https://api.shop.am/problems/not-found",
                title: "Product variant not found",
                detail: `Variant ${variantId} not found`,
              };
            }

            if (variant.productId !== productId) {
              logger.warn("Checkout item productId mismatch; using variant owner product", {
                clientProductId: productId,
                variantId,
                actualProductId: variant.productId,
              });
            }

            // Check stock
            if (variant.stock < quantity) {
              throw {
                status: 422,
                type: "https://api.shop.am/problems/validation-error",
                title: "Insufficient stock",
                detail: `Insufficient stock. Available: ${variant.stock}, Requested: ${quantity}`,
              };
            }

            const translation = variant.product.translations?.[0] || variant.product.translations?.[0];
            const variantOpts = getVariantOptions(variant.attributes);
            const variantTitle = variantOpts.length > 0
              ? variantOpts.map((opt) => `${opt.attributeKey || ''}: ${opt.value || ''}`).join(', ')
              : undefined;

            // Get image URL
            let imageUrl: string | undefined;
            if (variant.product.media && Array.isArray(variant.product.media) && variant.product.media.length > 0) {
              const firstMedia = variant.product.media[0] as MediaItem;
              if (typeof firstMedia === "string") {
                imageUrl = firstMedia;
              } else if (firstMedia && typeof firstMedia === 'object' && 'url' in firstMedia && typeof firstMedia.url === 'string') {
                imageUrl = firstMedia.url;
              } else if (firstMedia && typeof firstMedia === 'object' && 'src' in firstMedia && typeof firstMedia.src === 'string') {
                imageUrl = firstMedia.src;
              }
            }

            const SIZE_CATALOG_TITLE_MAX = 200;
            const rawCustomRequest = item.customSizeRequest;
            let customSizeRequest:
              | {
                  name: string;
                  phone: string;
                  email: string;
                  description: string;
                  imageUrl: string;
                }
              | undefined;
            const rawCatalogTitle =
              typeof item.sizeCatalogTitle === 'string' ? item.sizeCatalogTitle.trim() : '';
            let sizeCatalogTitle =
              rawCatalogTitle.length > 0 && rawCatalogTitle.length <= SIZE_CATALOG_TITLE_MAX
                ? rawCatalogTitle
                : undefined;
            const rawCatalogVersion =
              typeof item.sizeCatalogVersion === 'string' ? item.sizeCatalogVersion.trim() : '';
            const sizeCatalogVersion =
              sizeCatalogTitle !== undefined && rawCatalogVersion.length > 0
                ? rawCatalogVersion.slice(0, 32)
                : undefined;
            let sizeCatalogImageUrl =
              sizeCatalogTitle !== undefined
                ? sanitizeCheckoutImageUrl(item.sizeCatalogImageUrl)
                : undefined;
            const sizeCatalogCategoryPriceAmd = 0;

            if (rawCustomRequest) {
              const name = typeof rawCustomRequest.name === 'string' ? rawCustomRequest.name.trim() : '';
              const requestPhone =
                typeof rawCustomRequest.phone === 'string' ? rawCustomRequest.phone.trim() : '';
              const requestEmail =
                typeof rawCustomRequest.email === 'string' ? rawCustomRequest.email.trim() : '';
              const requestDescription =
                typeof rawCustomRequest.description === 'string'
                  ? rawCustomRequest.description.trim()
                  : '';
              const imageDataUrl =
                typeof rawCustomRequest.imageDataUrl === 'string'
                  ? rawCustomRequest.imageDataUrl.trim()
                  : '';

              if (!name || !requestPhone || !requestEmail || !requestDescription || !imageDataUrl) {
                throw {
                  status: 400,
                  type: 'https://api.shop.am/problems/validation-error',
                  title: 'Validation Error',
                  detail: 'customSizeRequest requires name, phone, email, description, imageDataUrl',
                };
              }

              if (!isR2Configured()) {
                throw {
                  status: 503,
                  type: 'https://api.shop.am/problems/config-error',
                  title: 'Configuration Error',
                  detail:
                    'R2 storage is not configured. Set R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_ENDPOINT, R2_PUBLIC_URL in .env',
                };
              }

              const parsedCustomImage = parseDataImageUrl(imageDataUrl);
              if (!parsedCustomImage) {
                throw {
                  status: 400,
                  type: 'https://api.shop.am/problems/validation-error',
                  title: 'Validation Error',
                  detail: 'customSizeRequest.imageDataUrl must be a valid image data URL',
                };
              }

              const uploadedCustomImageUrl = await uploadSizeCatalogImageToR2(
                parsedCustomImage.buffer,
                parsedCustomImage.contentType
              );

              customSizeRequest = {
                name,
                phone: requestPhone,
                email: requestEmail,
                description: requestDescription,
                imageUrl: uploadedCustomImageUrl,
              };

              sizeCatalogTitle = requestDescription.slice(0, SIZE_CATALOG_TITLE_MAX);
              sizeCatalogImageUrl = uploadedCustomImageUrl;
            }

            const rawCustomizePlain =
              typeof item.customizePlain === 'string' ? item.customizePlain.trim() : '';
            const rawCustomizeHtml =
              typeof item.customizeHtml === 'string' ? item.customizeHtml.trim() : '';

            let customizePlain: string | undefined;
            let customizeHtml: string | undefined;

            if (rawCustomizePlain !== '' || rawCustomizeHtml !== '') {
              const sanitizedHtml =
                rawCustomizeHtml !== '' ? sanitizeCustomizeHtmlServer(rawCustomizeHtml) : '';
              const plainFromHtml =
                sanitizedHtml !== '' ? getPlainTextFromHtmlServer(sanitizedHtml) : '';
              const resolvedPlain =
                rawCustomizePlain !== '' ? rawCustomizePlain : plainFromHtml;

              if (resolvedPlain !== '' && !validateCustomizePlainLength(resolvedPlain)) {
                throw {
                  status: 400,
                  type: 'https://api.shop.am/problems/validation-error',
                  title: 'Validation Error',
                  detail: `Customize text must be at most ${CUSTOMIZE_PLAIN_MAX_LENGTH} characters`,
                };
              }

              if (resolvedPlain === '' && sanitizedHtml === '') {
                customizePlain = undefined;
                customizeHtml = undefined;
              } else {
                customizePlain = resolvedPlain !== '' ? resolvedPlain : undefined;
                customizeHtml = sanitizedHtml !== '' ? sanitizedHtml : undefined;
              }
            }

            const earlyAccess = await resolveEarlyAccessForCheckoutLine(
              variant.product.id,
              item.earlyAccess === true,
            );

            return {
              variantId: variant.id,
              productId: variant.product.id,
              quantity,
              price: catalogPriceToUsd(Number(variant.price)),
              productTitle: translation?.title || 'Unknown Product',
              variantTitle,
              sku: variant.sku || '',
              imageUrl,
              sizeCatalogTitle,
              sizeCatalogVersion,
              sizeCatalogImageUrl,
              sizeCatalogCategoryPriceAmd,
              customizePlain,
              customizeHtml,
              customSizeRequest: customSizeRequest ?? null,
              earlyAccess,
            };
          })
        );
      } else {
        throw {
          status: 400,
          type: "https://api.shop.am/problems/validation-error",
          title: "Cart is empty",
          detail: "Cannot checkout with an empty cart",
        };
      }

      if (cartItems.length === 0) {
        throw {
          status: 400,
          type: "https://api.shop.am/problems/validation-error",
          title: "Cart is empty",
          detail: "Cannot checkout with an empty cart",
        };
      }

      // Calculate totals
      const subtotal = cartItems.reduce((sum, item) => {
        const addonUsd = adminInputAmdToUsd(item.sizeCatalogCategoryPriceAmd ?? 0);
        return sum + (item.price + addonUsd) * item.quantity;
      }, 0);

      const couponTrimmed =
        typeof rawCouponCode === 'string' && rawCouponCode.trim().length > 0
          ? rawCouponCode.trim()
          : '';
      let discountAmount = 0;
      let orderCouponCode: string | null = null;
      if (couponTrimmed) {
        const applied = await tryApplyCoupon(couponTrimmed, subtotal, { userId: userId ?? null });
        if (applied.status !== 'ok') {
          throw {
            status: 400,
            type: 'https://api.shop.am/problems/validation-error',
            title: 'Validation Error',
            detail: 'Invalid or expired coupon code',
          };
        }
        discountAmount = applied.discountAmountUsd;
        orderCouponCode = applied.code;
      }
      let shippingAmount = 0;
      if (shippingMethod === "delivery" && shippingAddress) {
        const shipCity = checkoutShippingCity(shippingAddress);
        const shipCountry = checkoutShippingCountry(shippingAddress);
        if (shipCity) {
          const priceAmd = await adminDeliveryService.getDeliveryPrice(shipCity, shipCountry, subtotal);
          shippingAmount = adminInputAmdToUsd(priceAmd);
        }
      }
      const taxAmount = 0; // TODO: Calculate tax if needed
      const total = subtotal - discountAmount + shippingAmount + taxAmount;
      const normalizedShippingAddress =
        shippingMethod === 'delivery' && shippingAddress
          ? {
              ...shippingAddress,
              phone: shippingAddress.phone || phone,
            }
          : shippingAddress;
      const firstCustomSizeRequest =
        cartItems.find((item) => item.customSizeRequest != null)?.customSizeRequest ?? null;
      const customRequestNotes = firstCustomSizeRequest
        ? JSON.stringify({
            marker: CUSTOM_SIZE_ORDER_NOTE_MARKER,
            name: firstCustomSizeRequest.name,
            description: firstCustomSizeRequest.description,
            source: 'checkout',
          })
        : null;

      let order: {
        order: Prisma.OrderGetPayload<{ include: { items: true } }>;
        payment: Prisma.PaymentGetPayload<{}>;
      } | null = null;

      for (let attempt = 0; attempt < ORDER_NUMBER_RETRY_LIMIT; attempt += 1) {
        try {
          // Create order with items in a transaction
          order = await db.$transaction(
            async (tx: Prisma.TransactionClient) => {
            const orderNumber = await getNextSequentialOrderNumber(tx);
            // Create order
            const newOrder = await tx.order.create({
          data: {
            number: orderNumber,
            userId: userId || null,
            status: 'pending',
            paymentStatus: 'pending',
            fulfillmentStatus: 'unfulfilled',
            subtotal,
            discountAmount,
            couponCode: orderCouponCode,
            shippingAmount,
            taxAmount,
            total,
            currency: 'USD',
            customerEmail: firstCustomSizeRequest?.email || email,
            customerPhone: firstCustomSizeRequest?.phone || phone,
            customerLocale: 'en', // TODO: Get from request
            shippingMethod,
            shippingAddress: normalizedShippingAddress ? JSON.parse(JSON.stringify(normalizedShippingAddress)) : null,
            billingAddress: normalizedShippingAddress ? JSON.parse(JSON.stringify(normalizedShippingAddress)) : null,
            notes: customRequestNotes,
            items: {
              create: cartItems.map((item) => ({
                // Size-collection surcharge is applied to each unit price.
                price: item.price + adminInputAmdToUsd(item.sizeCatalogCategoryPriceAmd ?? 0),
                variantId: item.variantId,
                productTitle: item.productTitle,
                variantTitle: item.variantTitle,
                sku: item.sku,
                quantity: item.quantity,
                total:
                  (item.price + adminInputAmdToUsd(item.sizeCatalogCategoryPriceAmd ?? 0)) *
                  item.quantity,
                imageUrl: item.imageUrl,
                sizeCatalogTitle: item.sizeCatalogTitle ?? null,
                sizeCatalogVersion: item.sizeCatalogVersion ?? null,
                sizeCatalogImageUrl: item.sizeCatalogImageUrl ?? null,
                customizePlain: item.customizePlain ?? null,
                customizeHtml: item.customizeHtml ?? null,
                earlyAccess: item.earlyAccess,
              })),
            },
            events: {
              create: {
                type: 'order_created',
                data: {
                  source: userId ? 'user' : 'guest',
                  paymentMethod,
                  shippingMethod,
                },
              },
            },
          } as Prisma.OrderUncheckedCreateInput,
          include: {
            items: true,
          },
        });

        // Update stock for all variants
        logger.debug('Updating stock for variants', { count: cartItems.length });
        
        try {
          for (const item of cartItems) {
            if (!item.variantId) {
              logger.error('Missing variantId for item', { item });
              throw {
                status: 400,
                type: "https://api.shop.am/problems/validation-error",
                title: "Validation Error",
                detail: `Missing variantId for item with SKU: ${item.sku}`,
              };
            }

            // Get current stock before update for logging
            const variantBefore = await tx.productVariant.findUnique({
              where: { id: item.variantId },
              select: { stock: true, sku: true },
            });

            if (!variantBefore) {
              logger.error('Variant not found', { variantId: item.variantId });
              throw {
                status: 404,
                type: "https://api.shop.am/problems/not-found",
                title: "Variant not found",
                detail: `Variant with id '${item.variantId}' not found`,
              };
            }

            logger.debug('Updating stock for variant', {
              variantId: item.variantId,
              sku: variantBefore.sku,
              currentStock: variantBefore.stock,
              quantityToDecrement: item.quantity,
              newStock: variantBefore.stock - item.quantity,
            });

            // Update stock with decrement
            const updatedVariant = await tx.productVariant.update({
              where: { id: item.variantId },
              data: {
                stock: {
                  decrement: item.quantity,
                },
              },
              select: { stock: true, sku: true },
            });

            logger.debug('Stock updated for variant', {
              variantId: item.variantId,
              sku: updatedVariant.sku,
              newStock: updatedVariant.stock,
              expectedStock: variantBefore.stock - item.quantity,
              match: updatedVariant.stock === (variantBefore.stock - item.quantity),
            });

            // Verify stock was actually decremented
            if (updatedVariant.stock !== (variantBefore.stock - item.quantity)) {
              logger.error('Stock update mismatch', {
                variantId: item.variantId,
                expectedStock: variantBefore.stock - item.quantity,
                actualStock: updatedVariant.stock,
                quantity: item.quantity,
              });
              // Don't throw here - transaction will rollback if needed
            }
          }
          
          logger.info('All variant stocks updated successfully');
        } catch (stockError: unknown) {
          const error = stockError as { message?: string; detail?: string };
          logger.error('Error updating stock', {
            error: stockError,
            message: error?.message,
            detail: error?.detail,
          });
          // Re-throw to rollback transaction
          throw stockError;
        }

        // Create payment record
        const payment = await tx.payment.create({
          data: {
            orderId: newOrder.id,
            provider: paymentMethod,
            method: paymentMethod,
            amount: total,
            currency: 'USD',
            status: 'pending',
          },
        });

            return { order: newOrder, payment };
          },
            {
              timeout: CHECKOUT_TRANSACTION_TIMEOUT_MS,
            }
          );
          break;
        } catch (transactionError: unknown) {
          if (isP2002Error(transactionError) && attempt < ORDER_NUMBER_RETRY_LIMIT - 1) {
            logger.warn("Order number conflict detected, retrying with next number", {
              attempt: attempt + 1,
            });
            continue;
          }
          throw transactionError;
        }
      }

      if (!order) {
        throw {
          status: 500,
          type: "https://api.shop.am/problems/internal-error",
          title: "Internal Server Error",
          detail: "Failed to generate unique sequential order number",
        };
      }

      // Return order and payment info
      return {
        order: {
          id: order.order.id,
          number: order.order.number,
          status: order.order.status,
          paymentStatus: order.order.paymentStatus,
          total: order.order.total,
          currency: order.order.currency,
        },
        payment: {
          provider: order.payment.provider,
          paymentUrl: null, // TODO: Generate payment URL for Idram/ArCa
          expiresAt: null, // TODO: Set expiration if needed
        },
        nextAction: paymentMethod === 'idram' || paymentMethod === 'arca' 
          ? 'redirect_to_payment' 
          : 'view_order',
      };
    } catch (error: unknown) {
      // Type guard for custom error
      const customError = error as { status?: number; type?: string; message?: string; code?: string; name?: string; meta?: unknown; stack?: string };
      
      // If it's already our custom error, re-throw it
      if (customError.status && customError.type) {
        throw error;
      }

      // Log unexpected errors
      logger.error("Checkout error", {
        error: {
          name: customError?.name,
          message: customError?.message,
          code: customError?.code,
          meta: customError?.meta,
          stack: customError?.stack?.substring(0, 500),
        },
      });

      // Handle Prisma errors
      if (customError?.code === 'P2002') {
        throw {
          status: 409,
          type: "https://api.shop.am/problems/conflict",
          title: "Conflict",
          detail: "Order number already exists, please try again",
        };
      }

      // Generic error
      throw {
        status: 500,
        type: "https://api.shop.am/problems/internal-error",
        title: "Internal Server Error",
        detail: customError?.message || "An error occurred during checkout",
      };
    }
  }

  /**
   * Get user orders list
   */
  async list(userId: string) {
    const orders = await db.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            variant: {
              select: {
                price: true,
              },
            },
          },
        },
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    });
    const sizeCatalogTitles = Array.from(
      new Set(
        orders.flatMap((order: { items: Array<{ sizeCatalogTitle: string | null }> }) =>
          order.items
            .map((item: { sizeCatalogTitle: string | null }) =>
              normalizeSizeCatalogTitleLookup(item.sizeCatalogTitle)
            )
            .filter((title: string) => title !== '')
        )
      )
    );
    const sizeCatalogPriceByTitle = new Map<string, number>();
    if (sizeCatalogTitles.length > 0) {
      const categories = await db.sizeCatalogCategory.findMany({
        select: { title: true, priceAmd: true },
      });
      for (const category of categories) {
        const title = normalizeSizeCatalogTitleLookup(category.title);
        if (!title || !sizeCatalogTitles.includes(title)) continue;
        const existing = sizeCatalogPriceByTitle.get(title);
        if (existing === undefined || category.priceAmd > existing) {
          sizeCatalogPriceByTitle.set(title, category.priceAmd);
        }
      }
    }

    return {
      data: orders.map((order: {
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
        currency: string;
        createdAt: Date;
        items: Array<{
          id: string;
          quantity: number | null;
          total: number | null;
          sizeCatalogTitle: string | null;
          variant?: { price?: number | null } | null;
        }>;
      }) => ({
        collectionPriceAmount: Number(
          order.items
            .reduce((sum, item) => {
              return sum + resolveCollectionSurchargeUsd(item, sizeCatalogPriceByTitle);
            }, 0)
            .toFixed(2)
        ),
        id: order.id,
        number: order.number,
        status: order.status,
        paymentStatus: order.paymentStatus,
        fulfillmentStatus: order.fulfillmentStatus,
        total: order.total,
        subtotal: order.subtotal,
        discountAmount: order.discountAmount,
        shippingAmount: order.shippingAmount,
        taxAmount: order.taxAmount,
        currency: order.currency,
        createdAt: order.createdAt,
        itemsCount: order.items.length,
      })),
    };
  }

  /**
   * Get order by number
   */
  async findByNumber(orderNumber: string, userId?: string) {
    const orderAccessFilter = userId ? { userId } : { userId: null };

    const order = await db.order.findFirst({
      where: {
        number: orderNumber,
        ...orderAccessFilter,
      },
      include: {
        items: {
          include: {
            variant: true,
          },
        },
        payments: true,
        events: true,
      },
    });

    if (!order) {
      throw {
        status: 404,
        type: "https://api.shop.am/problems/not-found",
        title: "Order not found",
        detail: `Order with number '${orderNumber}' not found`,
      };
    }

    const sizeCatalogTitles = Array.from(
      new Set(
        order.items
          .map((item: OrderItemWithVariant) => normalizeSizeCatalogTitleLookup(item.sizeCatalogTitle))
          .filter((title: string) => title !== '')
      )
    );
    const sizeCatalogPriceByTitle = new Map<string, number>();
    if (sizeCatalogTitles.length > 0) {
      const categories = await db.sizeCatalogCategory.findMany({
        select: { title: true, priceAmd: true },
      });
      for (const category of categories) {
        const title = normalizeSizeCatalogTitleLookup(category.title);
        if (!title || !sizeCatalogTitles.includes(title)) continue;
        const existing = sizeCatalogPriceByTitle.get(title);
        if (existing === undefined || category.priceAmd > existing) {
          sizeCatalogPriceByTitle.set(title, category.priceAmd);
        }
      }
    }

    // Parse shipping address if it's a JSON string
    let shippingAddress = order.shippingAddress;
    if (typeof shippingAddress === 'string') {
      try {
        shippingAddress = JSON.parse(shippingAddress);
      } catch {
        shippingAddress = null;
      }
    }

    // Debug logging
    logger.info('Order found', {
      orderNumber: order.number,
      itemsCount: order.items.length,
      items: order.items.map((item: OrderItemWithVariant) => {
        const opts = item.variant ? getVariantOptions(item.variant.attributes) : [];
        return {
          variantId: item.variantId,
          productTitle: item.productTitle,
          variant: item.variant ? {
            id: item.variant.id,
            optionsCount: opts.length,
            options: opts,
          } : null,
        };
      }),
    });

    return {
      id: order.id,
      number: order.number,
      status: order.status,
      paymentStatus: order.paymentStatus,
      fulfillmentStatus: order.fulfillmentStatus,
      items: order.items.map((item: OrderItemWithVariant) => {
        const rawOpts = getVariantOptions(item.variant?.attributes ?? null);
        const variantOptionsBase = rawOpts.map((opt: VariantOptionFromAttributes) => {
          logger.debug('Processing option', {
            attributeKey: opt.attributeKey,
            value: opt.value,
            valueId: opt.valueId,
            hasAttributeValue: !!opt.attributeValue,
            attributeValueData: opt.attributeValue ? {
              value: opt.attributeValue.value,
              attributeKey: opt.attributeValue.attribute?.key,
              imageUrl: opt.attributeValue.imageUrl,
              hasTranslations: (opt.attributeValue.translations?.length ?? 0) > 0,
            } : null,
          });

          if (opt.attributeValue) {
            const translations = opt.attributeValue.translations || [];
            const label = translations.length > 0 ? translations[0].label : opt.attributeValue.value;
            return {
              attributeKey: opt.attributeValue.attribute?.key ?? undefined,
              value: opt.attributeValue.value ?? undefined,
              label: label ?? undefined,
              imageUrl: opt.attributeValue.imageUrl ?? undefined,
              colors: opt.attributeValue.colors ?? undefined,
            };
          }
          return {
            attributeKey: opt.attributeKey ?? undefined,
            value: opt.value ?? undefined,
          };
        });

        const variantOptions = mergeSizeCatalogIntoVariantOptions(
          filterDisplayableVariantOptions(variantOptionsBase),
          item.sizeCatalogTitle,
          item.sizeCatalogVersion,
          item.sizeCatalogImageUrl
        );

        logger.debug('Item mapping', {
          productTitle: item.productTitle,
          variantId: item.variantId,
          hasVariant: !!item.variant,
          optionsCount: rawOpts.length,
          variantOptions,
        });

        const normalizedTitle = normalizeSizeCatalogTitleLookup(item.sizeCatalogTitle);
        const sizeCatalogCategoryPriceAmd =
          normalizedTitle !== '' ? (sizeCatalogPriceByTitle.get(normalizedTitle) ?? null) : null;

        return {
          variantId: item.variantId || '',
          productTitle: item.productTitle,
          variantTitle: item.variantTitle || '',
          sku: item.sku,
          quantity: item.quantity,
          price: Number(item.price),
          total: Number(item.total),
          imageUrl: item.imageUrl || undefined,
          variantOptions,
          sizeCatalogVersion: item.sizeCatalogVersion?.trim() || undefined,
          sizeCatalogCategoryPriceAmd,
          customizePlain: item.customizePlain?.trim() || undefined,
          customizeHtml: item.customizeHtml?.trim() || undefined,
        };
      }),
      totals: {
        subtotal: Number(order.subtotal),
        discount: Number(order.discountAmount),
        shipping: Number(order.shippingAmount),
        tax: Number(order.taxAmount),
        total: Number(order.total),
        collectionPriceAmount: Number(
          order.items
            .reduce((sum: number, item: OrderItemWithVariant) => {
              return sum + resolveCollectionSurchargeUsd(item, sizeCatalogPriceByTitle);
            }, 0)
            .toFixed(2)
        ),
        currency: order.currency,
      },
      collectionPriceAmount: Number(
        order.items
          .reduce((sum: number, item: OrderItemWithVariant) => {
            return sum + resolveCollectionSurchargeUsd(item, sizeCatalogPriceByTitle);
          }, 0)
          .toFixed(2)
      ),
      customer: {
        email: order.customerEmail || undefined,
        phone: order.customerPhone || undefined,
      },
      shippingAddress: shippingAddress,
      shippingMethod: order.shippingMethod || 'pickup',
      trackingNumber: order.trackingNumber || undefined,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };
  }
}

export const ordersService = new OrdersService();

