import { db } from "@white-shop/db";
import { calculateDateRange } from "./analytics-date-range";
import {
  buildTopCategories,
  buildTopProducts,
  loadVariantProducts,
  loadVariantSalesGroups,
  mergeVariantSales,
} from "./analytics-sales";

const PAID_PAYMENT_STATUS = "paid";
const PENDING_ORDER_STATUS = "pending";
const COMPLETED_ORDER_STATUS = "completed";

interface OrderSummary {
  createdAt: Date;
  paymentStatus: string;
  status: string;
  total: number;
}

interface OrdersByDayEntry {
  _id: string;
  count: number;
  revenue: number;
}

/**
 * Calculate orders by day
 */
function calculateOrdersByDay(orders: OrderSummary[]): OrdersByDayEntry[] {
  const ordersByDayMap = new Map<string, { count: number; revenue: number }>();

  for (const order of orders) {
    const dateKey = order.createdAt.toISOString().split("T")[0];
    const existing = ordersByDayMap.get(dateKey) || { count: 0, revenue: 0 };
    existing.count += 1;
    if (order.paymentStatus === PAID_PAYMENT_STATUS) {
      existing.revenue += order.total;
    }
    ordersByDayMap.set(dateKey, existing);
  }

  return [...ordersByDayMap.entries()]
    .map(([date, data]) => ({ _id: date, count: data.count, revenue: data.revenue }))
    .sort((a, b) => a._id.localeCompare(b._id));
}

function summarizeOrders(orders: OrderSummary[]) {
  let paidOrders = 0;
  let pendingOrders = 0;
  let completedOrders = 0;
  let totalRevenue = 0;

  for (const order of orders) {
    if (order.paymentStatus === PAID_PAYMENT_STATUS) {
      paidOrders += 1;
      totalRevenue += order.total;
    }
    if (order.status === PENDING_ORDER_STATUS) {
      pendingOrders += 1;
    }
    if (order.status === COMPLETED_ORDER_STATUS) {
      completedOrders += 1;
    }
  }

  return {
    totalOrders: orders.length,
    totalRevenue,
    paidOrders,
    pendingOrders,
    completedOrders,
  };
}

/**
 * Get analytics data.
 *
 * Order totals and per-variant sales are aggregated by the database, so the
 * period's order items are never streamed into memory with nested product,
 * translation and category joins.
 */
export async function getAnalytics(period: string = "week", startDate?: string, endDate?: string) {
  const range = calculateDateRange(period, startDate, endDate);

  const [orders, salesGroups, variantProducts] = await Promise.all([
    db.order.findMany({
      where: { createdAt: { gte: range.start, lte: range.end } },
      select: { createdAt: true, paymentStatus: true, status: true, total: true },
    }),
    loadVariantSalesGroups(range),
    loadVariantProducts(range),
  ]);

  const variantSales = mergeVariantSales(salesGroups);

  return {
    period,
    dateRange: {
      start: range.start.toISOString(),
      end: range.end.toISOString(),
    },
    orders: summarizeOrders(orders),
    topProducts: buildTopProducts(variantSales, variantProducts),
    topCategories: buildTopCategories(variantSales, variantProducts),
    ordersByDay: calculateOrdersByDay(orders),
  };
}
