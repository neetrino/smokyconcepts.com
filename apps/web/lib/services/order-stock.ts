import { Prisma } from '@prisma/client';
import { logger } from '@/lib/utils/logger';

const STOCK_RELEASING_ORDER_STATUSES = new Set(['cancelled']);
const STOCK_RELEASING_PAYMENT_STATUSES = new Set(['failed']);

type OrderStockState = {
  status: string;
  paymentStatus: string;
};

/**
 * True while the order still occupies variant inventory (not cancelled / payment-failed).
 */
export function isOrderHoldingStock(state: OrderStockState): boolean {
  return (
    !STOCK_RELEASING_ORDER_STATUSES.has(state.status) &&
    !STOCK_RELEASING_PAYMENT_STATUSES.has(state.paymentStatus)
  );
}

/**
 * Restore stock only on the first transition into cancelled or payment-failed.
 */
export function shouldRestoreOrderStock(params: {
  existingStatus: string;
  existingPaymentStatus: string;
  nextStatus?: string;
  nextPaymentStatus?: string;
}): boolean {
  if (
    !isOrderHoldingStock({
      status: params.existingStatus,
      paymentStatus: params.existingPaymentStatus,
    })
  ) {
    return false;
  }

  return !isOrderHoldingStock({
    status: params.nextStatus ?? params.existingStatus,
    paymentStatus: params.nextPaymentStatus ?? params.existingPaymentStatus,
  });
}

/**
 * Returns reserved variant quantities to sellable stock.
 */
export async function restoreOrderStock(
  tx: Prisma.TransactionClient,
  orderId: string,
): Promise<void> {
  const items = await tx.orderItem.findMany({
    where: { orderId, variantId: { not: null } },
    select: { variantId: true, quantity: true },
  });

  for (const item of items) {
    if (!item.variantId || item.quantity <= 0) {
      continue;
    }

    const result = await tx.productVariant.updateMany({
      where: { id: item.variantId },
      data: { stock: { increment: item.quantity } },
    });

    if (result.count === 0) {
      logger.warn('Stock restore skipped, variant missing', {
        orderId,
        variantId: item.variantId,
        quantity: item.quantity,
      });
    }
  }

  logger.info('Order stock restored', { orderId, itemCount: items.length });
}
