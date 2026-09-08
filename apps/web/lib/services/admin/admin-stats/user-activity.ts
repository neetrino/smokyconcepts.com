import { db } from "@white-shop/db";

const UNKNOWN_USER_NAME = "Unknown";

interface UserIdentity {
  id: string;
  email: string | null;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  createdAt: Date;
}

function displayName(user: UserIdentity): string {
  return (
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.email ||
    user.phone ||
    UNKNOWN_USER_NAME
  );
}

/**
 * Format user for activity response
 */
function formatUser(user: UserIdentity) {
  return {
    id: user.id,
    email: user.email || undefined,
    phone: user.phone || undefined,
    name: displayName(user),
    registeredAt: user.createdAt.toISOString(),
    lastLoginAt: undefined, // We don't track last login yet
  };
}

/**
 * Format active user for activity response
 */
function formatActiveUser(
  user: UserIdentity & {
    _count: { orders: number };
    orders: Array<{ createdAt: Date }>;
  },
  totalSpent: number
) {
  const lastOrder = user.orders[0] || null;

  return {
    id: user.id,
    email: user.email || undefined,
    phone: user.phone || undefined,
    name: displayName(user),
    orderCount: user._count.orders,
    totalSpent,
    lastOrderDate: (lastOrder?.createdAt || user.createdAt).toISOString(),
    lastLoginAt: undefined, // We don't track last login yet
  };
}

/** `db` is loosely typed at the client boundary, so query shapes are declared here. */
type ActiveUserRecord = UserIdentity & {
  _count: { orders: number };
  orders: Array<{ createdAt: Date }>;
};

interface UserOrderTotalGroup {
  userId: string | null;
  _sum: { total: number | null };
}

const USER_IDENTITY_SELECT = {
  id: true,
  email: true,
  phone: true,
  firstName: true,
  lastName: true,
  createdAt: true,
} as const;

/** Sums each user's spending in the database instead of loading their orders. */
async function loadTotalSpentByUserId(userIds: string[]): Promise<Map<string, number>> {
  if (userIds.length === 0) {
    return new Map();
  }

  const totals: UserOrderTotalGroup[] = await db.order.groupBy({
    by: ["userId"],
    where: { userId: { in: userIds } },
    _sum: { total: true },
  });

  return new Map<string, number>(
    totals.flatMap((entry: UserOrderTotalGroup) =>
      entry.userId ? [[entry.userId, entry._sum.total ?? 0] as [string, number]] : []
    )
  );
}

/**
 * Get user activity (recent registrations and active users)
 */
export async function getUserActivity(limit: number = 10) {
  const [recentUsers, usersWithOrders]: [UserIdentity[], ActiveUserRecord[]] = await Promise.all([
    db.user.findMany({
      where: { deletedAt: null },
      take: limit,
      orderBy: { createdAt: "desc" },
      select: USER_IDENTITY_SELECT,
    }),
    db.user.findMany({
      where: { deletedAt: null, orders: { some: {} } },
      take: limit,
      select: {
        ...USER_IDENTITY_SELECT,
        _count: { select: { orders: true } },
        // Only the latest order is rendered; the rest are aggregated separately.
        orders: {
          select: { createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    }),
  ]);

  const totalSpentByUserId = await loadTotalSpentByUserId(
    usersWithOrders.map((user: ActiveUserRecord) => user.id)
  );

  return {
    recentRegistrations: recentUsers.map(formatUser),
    activeUsers: usersWithOrders.map((user: ActiveUserRecord) =>
      formatActiveUser(user, totalSpentByUserId.get(user.id) ?? 0)
    ),
  };
}
