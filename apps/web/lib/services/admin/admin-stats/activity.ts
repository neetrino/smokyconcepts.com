import { db } from "@white-shop/db";

/**
 * Activity item interface
 */
export interface ActivityItem {
  type: string;
  title: string;
  description: string;
  timestamp: string;
}

interface RecentOrderActivity {
  number: string;
  total: number;
  currency: string | null;
  createdAt: Date;
  _count: { items: number };
}

interface RecentUserActivity {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  createdAt: Date;
}

const NEW_USER_FALLBACK_NAME = "New User";

function toOrderActivity(order: RecentOrderActivity): ActivityItem {
  return {
    type: "order",
    title: `New Order #${order.number}`,
    description: `${order._count.items} items • ${order.total} ${order.currency}`,
    timestamp: order.createdAt.toISOString(),
  };
}

function toUserActivity(user: RecentUserActivity): ActivityItem {
  const name =
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.email ||
    user.phone ||
    NEW_USER_FALLBACK_NAME;

  return {
    type: "user",
    title: "New User Registration",
    description: name,
    timestamp: user.createdAt.toISOString(),
  };
}

/**
 * Get recent activity for dashboard.
 *
 * The two feeds are independent, so they are fetched as one parallel batch, and
 * the item count comes from the database instead of loading every order item.
 */
export async function getActivity(limit: number = 10): Promise<ActivityItem[]> {
  const [recentOrders, recentUsers]: [RecentOrderActivity[], RecentUserActivity[]] =
    await Promise.all([
      db.order.findMany({
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          number: true,
          total: true,
          currency: true,
          createdAt: true,
          _count: { select: { items: true } },
        },
      }),
      db.user.findMany({
        take: Math.floor(limit / 2),
        orderBy: { createdAt: "desc" },
        where: { deletedAt: null },
        select: {
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          createdAt: true,
        },
      }),
    ]);

  return [...recentOrders.map(toOrderActivity), ...recentUsers.map(toUserActivity)]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}
