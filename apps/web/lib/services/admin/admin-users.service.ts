import { db } from "@white-shop/db";
import type { Prisma } from "@prisma/client";

import type { AdminUserListFilters } from "./admin-users.types";

const ADMIN_USER_LIST_MAX_TAKE = 500;
const ADMIN_USER_LIST_DEFAULT_TAKE = 200;

function positiveInteger(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }
  const rounded = Math.floor(value);
  return rounded >= 1 ? rounded : null;
}

class AdminUsersService {
  /**
   * Get users.
   *
   * Honours `page`/`limit` so the list screen fetches one page instead of the
   * flat cap; `take` stays supported for pickers that need a single large page.
   */
  async getUsers(filters: AdminUserListFilters = {}) {
    const take = Math.min(
      positiveInteger(filters.limit) ??
        positiveInteger(filters.take) ??
        ADMIN_USER_LIST_DEFAULT_TAKE,
      ADMIN_USER_LIST_MAX_TAKE,
    );
    const page = positiveInteger(filters.page) ?? 1;
    const skip = (page - 1) * take;
    const search = typeof filters.search === "string" ? filters.search.trim() : "";
    const role = filters.role ?? "all";

    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      ...(search !== ""
        ? {
            OR: [
              { email: { contains: search, mode: "insensitive" } },
              { phone: { contains: search, mode: "insensitive" } },
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(role === "admin" ? { roles: { has: "admin" } } : {}),
      ...(role === "customer" ? { NOT: { roles: { has: "admin" } } } : {}),
    };

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          phone: true,
          firstName: true,
          lastName: true,
          roles: true,
          blocked: true,
          createdAt: true,
          _count: {
            select: {
              orders: true,
            },
          },
        },
      }),
      db.user.count({ where }),
    ]);

    return {
      data: users.map((user: { id: string; email: string | null; phone: string | null; firstName: string | null; lastName: string | null; roles: string[] | null; blocked: boolean; createdAt: Date; _count?: { orders?: number } }) => ({
        id: user.id,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
        blocked: user.blocked,
        createdAt: user.createdAt,
        ordersCount: user._count?.orders ?? 0,
      })),
      meta: {
        total,
        page,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  /**
   * Update user
   */
  async updateUser(userId: string, data: any) {
    return await db.user.update({
      where: { id: userId },
      data: {
        blocked: data.blocked,
        roles: data.roles,
      },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        roles: true,
        blocked: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Delete user (soft delete)
   */
  async deleteUser(userId: string) {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw {
        status: 404,
        type: "https://api.shop.am/problems/not-found",
        title: "User not found",
        detail: `User with id '${userId}' does not exist`,
      };
    }

    await db.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
        blocked: true,
      },
      select: { id: true },
    });

    return { success: true };
  }
}

export const adminUsersService = new AdminUsersService();



