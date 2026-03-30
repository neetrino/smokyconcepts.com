import { db } from "@white-shop/db";
import { Prisma } from "@prisma/client";
import type { CheckoutData } from "../types/checkout";
import { logger } from "./utils/logger";

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

function getVariantOptions(attributes: unknown): VariantOptionFromAttributes[] {
  return Array.isArray(attributes) ? (attributes as VariantOptionFromAttributes[]) : [];
}

// Media type helper
type MediaItem = string | { url?: string; src?: string } | unknown;

const ORDER_NUMBER_START = 100;
const ORDER_NUMBER_RETRY_LIMIT = 5;

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
        shippingAmount: providedShippingAmount,
        paymentMethod = 'idram',
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
      }> = [];

      if (guestItems && Array.isArray(guestItems) && guestItems.length > 0) {
        // Get items from checkout request (localStorage cart)
        cartItems = await Promise.all(
          guestItems.map(async (item: { productId: string; variantId: string; quantity: number }) => {
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

            if (!variant || variant.productId !== productId) {
              throw {
                status: 404,
                type: "https://api.shop.am/problems/not-found",
                title: "Product variant not found",
                detail: `Variant ${variantId} not found for product ${productId}`,
              };
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

            return {
              variantId: variant.id,
              productId: variant.product.id,
              quantity,
              price: Number(variant.price),
              productTitle: translation?.title || 'Unknown Product',
              variantTitle,
              sku: variant.sku || '',
              imageUrl,
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
      const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const discountAmount = 0; // TODO: Implement discount/coupon logic
      // Use provided shipping amount from frontend (calculated from delivery API), or 0 if not provided
      const shippingAmount = providedShippingAmount !== undefined ? Number(providedShippingAmount) : 0;
      const taxAmount = 0; // TODO: Calculate tax if needed
      const total = subtotal - discountAmount + shippingAmount + taxAmount;
      const normalizedShippingAddress =
        shippingMethod === 'delivery' && shippingAddress
          ? {
              ...shippingAddress,
              phone: shippingAddress.phone || phone,
            }
          : shippingAddress;

      let order: {
        order: Prisma.OrderGetPayload<{ include: { items: true } }>;
        payment: Prisma.PaymentGetPayload<{}>;
      } | null = null;

      for (let attempt = 0; attempt < ORDER_NUMBER_RETRY_LIMIT; attempt += 1) {
        try {
          // Create order with items in a transaction
          order = await db.$transaction(async (tx: Prisma.TransactionClient) => {
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
            shippingAmount,
            taxAmount,
            total,
            currency: 'USD',
            customerEmail: email,
            customerPhone: phone,
            customerLocale: 'en', // TODO: Get from request
            shippingMethod,
            shippingAddress: normalizedShippingAddress ? JSON.parse(JSON.stringify(normalizedShippingAddress)) : null,
            billingAddress: normalizedShippingAddress ? JSON.parse(JSON.stringify(normalizedShippingAddress)) : null,
            items: {
              create: cartItems.map((item) => ({
                variantId: item.variantId,
                productTitle: item.productTitle,
                variantTitle: item.variantTitle,
                sku: item.sku,
                quantity: item.quantity,
                price: item.price,
                total: item.price * item.quantity,
                imageUrl: item.imageUrl,
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
          },
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
          });
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
        items: true,
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    });

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
        items: Array<{ id: string }>;
      }) => ({
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
        const variantOptions = rawOpts.map((opt: VariantOptionFromAttributes) => {
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

        logger.debug('Item mapping', {
          productTitle: item.productTitle,
          variantId: item.variantId,
          hasVariant: !!item.variant,
          optionsCount: rawOpts.length,
          variantOptions,
        });

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
        };
      }),
      totals: {
        subtotal: Number(order.subtotal),
        discount: Number(order.discountAmount),
        shipping: Number(order.shippingAmount),
        tax: Number(order.taxAmount),
        total: Number(order.total),
        currency: order.currency,
      },
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

