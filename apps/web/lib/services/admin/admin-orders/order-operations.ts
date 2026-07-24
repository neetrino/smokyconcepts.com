import { db } from "@white-shop/db";
import { logger } from "../../utils/logger";
import type { OrderFilters } from "./types";
import { buildOrderWhereClause, buildOrderByClause } from "./query-builder";
import { formatOrderForList, formatOrderForDetail } from "./order-formatter";

/**
 * Get orders with filters and pagination
 */
export async function getOrders(filters: OrderFilters = {}) {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const skip = (page - 1) * limit;

  const where = buildOrderWhereClause(filters);
  const orderBy = buildOrderByClause(filters);

  logger.debug('getOrders with filters', { where, page, limit, skip, orderBy });

  // Get orders with pagination, including related user for basic customer info
  const [orders, total] = await Promise.all([
    db.order.findMany({
      where,
      skip,
      take: limit,
      orderBy,
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
    }),
    db.order.count({ where }),
  ]);

  // Format orders for response
  const formattedOrders = orders.map(formatOrderForList);

  return {
    data: formattedOrders,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get single order by ID with full details for admin
 */
export async function getOrderById(orderId: string) {
  // Fetch order with related user and items/variants/products
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          phone: true,
          firstName: true,
          lastName: true,
        },
      },
      items: {
        include: {
          variant: {
            include: {
              product: {
                include: {
                  translations: {
                    where: { locale: "en" },
                    take: 1,
                  },
                },
              },
            },
          },
        },
      },
      payments: true,
    },
  });

  if (!order) {
    throw {
      status: 404,
      type: "https://api.shop.am/problems/not-found",
      title: "Order not found",
      detail: `Order with id '${orderId}' does not exist`,
    };
  }

  const sizeCatalogTitles = Array.from(
    new Set(
      order.items
        .map((item: { sizeCatalogTitle: string | null }) => item.sizeCatalogTitle?.trim().toLocaleLowerCase() ?? '')
        .filter((title: string) => title !== '')
    )
  );
  const sizeCatalogPriceByTitle = new Map<string, number>();
  if (sizeCatalogTitles.length > 0) {
    const categories = await db.sizeCatalogCategory.findMany({
      select: { title: true, priceAmd: true },
    });
    for (const category of categories) {
      const title = category.title.trim().toLocaleLowerCase();
      if (!title || !sizeCatalogTitles.includes(title)) continue;
      const existing = sizeCatalogPriceByTitle.get(title);
      if (existing === undefined || category.priceAmd > existing) {
        sizeCatalogPriceByTitle.set(title, category.priceAmd);
      }
    }
  }

  return formatOrderForDetail(order, sizeCatalogPriceByTitle);
}




