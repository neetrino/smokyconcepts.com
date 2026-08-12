import { db } from "@white-shop/db";
import { Prisma } from "@prisma/client";
import { logger } from "../../utils/logger";
import {
  reverseArcaPaymentForOrder,
  shouldReverseArcaPayment,
} from "./arca-payment-reversal";
import type { UpdateOrderData } from "./types";

const VALID_ORDER_STATUSES = ['pending', 'processing', 'completed', 'cancelled'] as const;
const VALID_PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'] as const;
const VALID_FULFILLMENT_STATUSES = ['unfulfilled', 'fulfilled', 'shipped', 'delivered'] as const;

type OrderUpdateFields = {
  status?: string;
  paymentStatus?: string;
  fulfillmentStatus?: string;
  fulfilledAt?: Date;
  cancelledAt?: Date;
  paidAt?: Date;
};

function assertValidOrderUpdate(data: UpdateOrderData): void {
  if (data.status !== undefined && !VALID_ORDER_STATUSES.includes(data.status as typeof VALID_ORDER_STATUSES[number])) {
    throw {
      status: 400,
      type: "https://api.shop.am/problems/validation-error",
      title: "Validation Error",
      detail: `Invalid status. Must be one of: ${VALID_ORDER_STATUSES.join(', ')}`,
    };
  }
  if (
    data.paymentStatus !== undefined &&
    !VALID_PAYMENT_STATUSES.includes(data.paymentStatus as typeof VALID_PAYMENT_STATUSES[number])
  ) {
    throw {
      status: 400,
      type: "https://api.shop.am/problems/validation-error",
      title: "Validation Error",
      detail: `Invalid paymentStatus. Must be one of: ${VALID_PAYMENT_STATUSES.join(', ')}`,
    };
  }
  if (
    data.fulfillmentStatus !== undefined &&
    !VALID_FULFILLMENT_STATUSES.includes(
      data.fulfillmentStatus as typeof VALID_FULFILLMENT_STATUSES[number],
    )
  ) {
    throw {
      status: 400,
      type: "https://api.shop.am/problems/validation-error",
      title: "Validation Error",
      detail: `Invalid fulfillmentStatus. Must be one of: ${VALID_FULFILLMENT_STATUSES.join(', ')}`,
    };
  }
}

function buildOrderUpdateData(
  data: UpdateOrderData,
  existing: { status: string; paymentStatus: string },
  forceRefunded: boolean,
): OrderUpdateFields {
  const updateData: OrderUpdateFields = {};
  if (data.status !== undefined) updateData.status = data.status;
  if (data.paymentStatus !== undefined) updateData.paymentStatus = data.paymentStatus;
  if (data.fulfillmentStatus !== undefined) updateData.fulfillmentStatus = data.fulfillmentStatus;
  if (forceRefunded) updateData.paymentStatus = 'refunded';

  if (data.status === 'completed' && existing.status !== 'completed') {
    updateData.fulfilledAt = new Date();
  }
  if (data.status === 'cancelled' && existing.status !== 'cancelled') {
    updateData.cancelledAt = new Date();
  }
  if (updateData.paymentStatus === 'paid' && existing.paymentStatus !== 'paid') {
    updateData.paidAt = new Date();
  }
  return updateData;
}

/**
 * Delete order
 * Հեռացնում է պատվերը և բոլոր կապված գրառումները (cascade)
 */
export async function deleteOrder(orderId: string) {
  try {
    logger.info('Starting order deletion', { orderId });
    
    // Ստուգում ենք, արդյոք պատվերը գոյություն ունի
    const existing = await db.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        number: true,
        status: true,
        total: true,
        _count: {
          select: {
            items: true,
            payments: true,
            events: true,
          },
        },
      },
    });

    if (!existing) {
      logger.warn('Order not found', { orderId });
      throw {
        status: 404,
        type: "https://api.shop.am/problems/not-found",
        title: "Order not found",
        detail: `Order with id '${orderId}' does not exist`,
      };
    }

    logger.info('Order found', {
      id: existing.id,
      number: existing.number,
      status: existing.status,
      total: existing.total,
      itemsCount: existing._count.items,
      paymentsCount: existing._count.payments,
      eventsCount: existing._count.events,
    });

    // Հեռացնում ենք պատվերը (cascade-ը ավտոմատ կհեռացնի կապված items, payments, events)
    try {
      await db.order.delete({
        where: { id: orderId },
      });
      logger.info('Order deleted successfully', { orderId, orderNumber: existing.number });
    } catch (deleteError: unknown) {
      const errorMessage = deleteError instanceof Error ? deleteError.message : String(deleteError);
      const errorCode = deleteError && typeof deleteError === 'object' && 'code' in deleteError ? String(deleteError.code) : '';
      logger.error('Prisma delete error', {
        code: errorCode,
        message: errorMessage,
      });
      throw deleteError;
    }
    
    return { success: true };
  } catch (error: unknown) {
    // Եթե սա մեր ստեղծած սխալ է, ապա վերադարձնում ենք այն
    if (error && typeof error === 'object' && 'status' in error && 'type' in error) {
      logger.error('Standard error', {
        status: (error as { status: number }).status,
        type: (error as { type: string }).type,
        title: (error as { title?: string }).title,
        detail: (error as { detail?: string }).detail,
      });
      throw error;
    }

    // Մանրամասն լոգավորում Prisma սխալների համար
    const errorObj = error as { name?: string; message?: string; code?: string; meta?: unknown; stack?: string };
    logger.error('Order deletion error', {
      orderId,
      error: {
        name: errorObj?.name,
        message: errorObj?.message,
        code: errorObj?.code,
        meta: errorObj?.meta,
        stack: errorObj?.stack?.substring(0, 500),
      },
    });

    // Prisma սխալների մշակում
    if (errorObj?.code === 'P2025') {
      // Record not found
      logger.warn('Prisma P2025: Record not found');
      throw {
        status: 404,
        type: "https://api.shop.am/problems/not-found",
        title: "Order not found",
        detail: `Order with id '${orderId}' does not exist`,
      };
    }

    if (errorObj?.code === 'P2003') {
      // Foreign key constraint failed
      logger.warn('Prisma P2003: Foreign key constraint');
      throw {
        status: 409,
        type: "https://api.shop.am/problems/conflict",
        title: "Cannot delete order",
        detail: "Order has related records that cannot be deleted",
      };
    }

    // Գեներիկ սխալ
    throw {
      status: 500,
      type: "https://api.shop.am/problems/internal-error",
      title: "Internal Server Error",
      detail: errorObj?.message || "Failed to delete order",
    };
  }
}

/**
 * Update order. Paid Arca/Ameria orders trigger bank Cancel/Refund before DB write.
 */
export async function updateOrder(orderId: string, data: UpdateOrderData) {
  try {
    const existing = await db.order.findUnique({
      where: { id: orderId },
      include: {
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!existing) {
      throw {
        status: 404,
        type: "https://api.shop.am/problems/not-found",
        title: "Order not found",
        detail: `Order with id '${orderId}' does not exist`,
      };
    }

    assertValidOrderUpdate(data);

    const needsArcaReversal = shouldReverseArcaPayment({
      existingPaymentStatus: existing.paymentStatus,
      existingStatus: existing.status,
      nextStatus: data.status,
      nextPaymentStatus: data.paymentStatus,
    });

    let arcaReversal: Awaited<ReturnType<typeof reverseArcaPaymentForOrder>> | null = null;
    if (needsArcaReversal) {
      arcaReversal = await reverseArcaPaymentForOrder({
        id: existing.id,
        number: existing.number,
        total: Number(existing.total),
        currency: String(existing.currency ?? 'USD'),
        paymentStatus: existing.paymentStatus,
        payments: existing.payments.map((payment: {
          id: string;
          provider: string;
          providerTransactionId: string | null;
          status: string;
          amount: number;
          currency: string;
        }) => ({
          id: payment.id,
          provider: payment.provider,
          providerTransactionId: payment.providerTransactionId,
          status: payment.status,
          amount: Number(payment.amount),
          currency: payment.currency,
        })),
      });
    }

    const updateData = buildOrderUpdateData(data, existing, Boolean(arcaReversal));

    const order = await db.$transaction(async (tx: Prisma.TransactionClient) => {
      const updated = await tx.order.update({
        where: { id: orderId },
        data: updateData,
        include: {
          items: true,
          payments: true,
        },
      });

      if (arcaReversal) {
        await tx.payment.update({
          where: { id: arcaReversal.paymentId },
          data: {
            status: 'refunded',
            providerResponse: arcaReversal.providerResponse as Prisma.InputJsonValue,
            errorCode: null,
            errorMessage: null,
          },
        });
      }

      await tx.orderEvent.create({
        data: {
          orderId: updated.id,
          type: arcaReversal ? 'payment_reversed' : 'order_updated',
          data: {
            updatedFields: Object.keys(updateData),
            previousStatus: existing.status,
            newStatus: data.status || existing.status,
            previousPaymentStatus: existing.paymentStatus,
            newPaymentStatus: updateData.paymentStatus || existing.paymentStatus,
            ...(arcaReversal
              ? {
                  arcaAction: arcaReversal.action,
                  providerOrderId: arcaReversal.providerOrderId,
                }
              : {}),
          },
        },
      });

      return updated;
    });

    return order;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'status' in error && 'type' in error) {
      throw error;
    }

    const errorObj = error as {
      name?: string;
      message?: string;
      code?: string;
      meta?: { cause?: string };
      stack?: string;
    };
    logger.error("updateOrder error", {
      orderId,
      error: {
        name: errorObj?.name,
        message: errorObj?.message,
        code: errorObj?.code,
        meta: errorObj?.meta,
        stack: errorObj?.stack?.substring(0, 500),
      },
    });

    if (errorObj?.code === 'P2025') {
      throw {
        status: 404,
        type: "https://api.shop.am/problems/not-found",
        title: "Not Found",
        detail: errorObj?.meta?.cause || "The requested order was not found",
      };
    }

    throw {
      status: 500,
      type: "https://api.shop.am/problems/internal-error",
      title: "Database Error",
      detail: errorObj?.message || "An error occurred while updating the order",
    };
  }
}
