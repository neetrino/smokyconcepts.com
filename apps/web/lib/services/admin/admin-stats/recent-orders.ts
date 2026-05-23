import { db } from "@white-shop/db";
import { formatOrderForList } from "../admin-orders/order-formatter";

/**
 * Get recent orders for admin dashboard (checkout-parity AMD totals).
 */
export async function getRecentOrders(limit: number = 5) {
  const orders = await db.order.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          variant: {
            select: {
              attributes: true,
              price: true,
            },
          },
        },
      },
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  return orders.map((order) => {
    const formatted = formatOrderForList(order);
    return {
      id: formatted.id,
      number: formatted.number,
      status: formatted.status,
      paymentStatus: formatted.paymentStatus,
      total: formatted.total,
      subtotal: formatted.subtotal,
      discountAmount: formatted.discountAmount,
      shippingAmount: formatted.shippingAmount,
      taxAmount: formatted.taxAmount,
      collectionPriceAmount: formatted.collectionPriceAmount,
      currency: formatted.currency,
      shippingPriceAmd: formatted.shippingPriceAmd,
      summaryLines: formatted.summaryLines,
      customerEmail: formatted.customerEmail,
      customerPhone: formatted.customerPhone,
      itemsCount: formatted.itemsCount,
      createdAt: formatted.createdAt,
    };
  });
}
