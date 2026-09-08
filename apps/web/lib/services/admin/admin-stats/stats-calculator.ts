import type { Prisma } from "@prisma/client";
import { db } from "@white-shop/db";

const LOW_STOCK_THRESHOLD = 10;
const RECENT_ORDERS_WINDOW_DAYS = 7;
const DEFAULT_CURRENCY = "USD";

function recentOrdersSince(): Date {
  const since = new Date();
  since.setDate(since.getDate() - RECENT_ORDERS_WINDOW_DAYS);
  return since;
}

/** Orders that count towards revenue: explicitly completed or already paid. */
const REVENUE_ORDERS: Prisma.OrderWhereInput = {
  OR: [{ status: "completed" }, { paymentStatus: "paid" }],
};

/**
 * Get dashboard stats
 *
 * All counters are independent, so they run as one parallel batch instead of
 * seven sequential round-trips, and revenue is summed by the database rather
 * than by loading every paid order into memory.
 */
export async function getStats() {
  const [
    totalUsers,
    totalProducts,
    lowStockProducts,
    totalOrders,
    recentOrders,
    pendingOrders,
    revenue,
    revenueSample,
  ] = await Promise.all([
    db.user.count({ where: { deletedAt: null } }),
    db.product.count({ where: { deletedAt: null } }),
    db.productVariant.count({
      where: { stock: { lt: LOW_STOCK_THRESHOLD }, published: true },
    }),
    db.order.count(),
    db.order.count({ where: { createdAt: { gte: recentOrdersSince() } } }),
    db.order.count({ where: { status: "pending" } }),
    db.order.aggregate({ where: REVENUE_ORDERS, _sum: { total: true } }),
    db.order.findFirst({ where: REVENUE_ORDERS, select: { currency: true } }),
  ]);

  return {
    users: {
      total: totalUsers,
    },
    products: {
      total: totalProducts,
      lowStock: lowStockProducts,
    },
    orders: {
      total: totalOrders,
      recent: recentOrders,
      pending: pendingOrders,
    },
    revenue: {
      total: revenue._sum.total ?? 0,
      currency: revenueSample?.currency || DEFAULT_CURRENCY,
    },
  };
}
