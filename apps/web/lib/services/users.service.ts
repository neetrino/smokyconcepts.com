import { db } from "@white-shop/db";
import { persistedOrderMoneyToUsd } from "@/lib/currency";
import { resolveCollectionSurchargeUsd } from "@/lib/orders/resolve-collection-surcharge-usd";
import {
  buildOrderSummaryLinesFromPersistedItems,
  resolveOrderShippingPriceAmd,
} from "@/lib/orders/order-summary-display";
import { hashPassword, validateNewPasswordPolicy, verifyPassword } from "@/lib/security/password";
import { logger } from "@/lib/utils/logger";

function normalizeSizeCatalogTitleLookup(value: string | null | undefined): string {
  return value?.trim().toLocaleLowerCase() ?? "";
}

class UsersService {
  /**
   * Get user profile
   */
  async getProfile(userId: string) {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        locale: true,
        roles: true,
        addresses: true,
      },
    });

    if (!user) {
      throw {
        status: 404,
        type: "https://api.shop.am/problems/not-found",
        title: "User not found",
      };
    }

    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      locale: user.locale,
      roles: user.roles,
      addresses: user.addresses,
    };
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, data: any) {
    const user = await db.user.update({
      where: { id: userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        locale: data.locale,
      },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        locale: true,
      },
    });

    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      locale: user.locale,
    };
  }

  /**
   * Change password
   */
  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    // Validate input parameters
    if (!oldPassword || typeof oldPassword !== 'string' || oldPassword.trim() === '') {
      throw {
        status: 400,
        type: "https://api.shop.am/problems/validation-error",
        title: "Validation Error",
        detail: "Old password is required and must be a non-empty string",
      };
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.trim() === '') {
      throw {
        status: 400,
        type: "https://api.shop.am/problems/validation-error",
        title: "Validation Error",
        detail: "New password is required and must be a non-empty string",
      };
    }

    const passwordPolicyError = validateNewPasswordPolicy(newPassword.trim());
    if (passwordPolicyError) {
      throw {
        status: 400,
        type: "https://api.shop.am/problems/validation-error",
        title: "Validation Error",
        detail: passwordPolicyError,
      };
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        passwordHash: true,
      },
    });

    if (!user || !user.passwordHash) {
      throw {
        status: 401,
        type: "https://api.shop.am/problems/unauthorized",
        title: "Invalid credentials",
        detail: "User not found or password not set",
      };
    }

    // Validate that passwordHash is a valid string
    if (typeof user.passwordHash !== 'string' || user.passwordHash.trim() === '') {
      throw {
        status: 500,
        type: "https://api.shop.am/problems/internal-error",
        title: "Internal Server Error",
        detail: "User password hash is invalid",
      };
    }

    const isValid = await verifyPassword(oldPassword.trim(), user.passwordHash);
    if (!isValid) {
      throw {
        status: 401,
        type: "https://api.shop.am/problems/unauthorized",
        title: "Invalid password",
        detail: "The old password is incorrect",
      };
    }

    try {
      const newPasswordHash = await hashPassword(newPassword.trim());
      await db.user.update({
        where: { id: userId },
        data: { passwordHash: newPasswordHash },
        select: { id: true },
      });

      return { success: true };
    } catch (hashError: unknown) {
      logger.error("Password hash error on change", { userId, error: hashError });
      throw {
        status: 500,
        type: "https://api.shop.am/problems/internal-error",
        title: "Internal Server Error",
        detail: "Failed to update password",
      };
    }
  }

  /**
   * Get addresses
   */
  async getAddresses(userId: string) {
    const addresses = await db.address.findMany({
      where: { userId },
      orderBy: { isDefault: "desc" },
    });

    return { data: addresses };
  }

  /**
   * Add address
   */
  async addAddress(userId: string, data: any) {
    // If this is the first address, set it as default
    const existingAddresses = await db.address.findMany({
      where: { userId },
    });

    const address = await db.address.create({
      data: {
        ...data,
        userId,
        isDefault: existingAddresses.length === 0,
      },
    });

    return address;
  }

  /**
   * Update address
   */
  async updateAddress(userId: string, addressId: string, data: any) {
    const address = await db.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw {
        status: 404,
        type: "https://api.shop.am/problems/not-found",
        title: "Address not found",
      };
    }

    return await db.address.update({
      where: { id: addressId },
      data,
    });
  }

  /**
   * Delete address
   */
  async deleteAddress(userId: string, addressId: string) {
    const address = await db.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw {
        status: 404,
        type: "https://api.shop.am/problems/not-found",
        title: "Address not found",
      };
    }

    await db.address.delete({
      where: { id: addressId },
    });

    return null;
  }

  /**
   * Set default address
   */
  async setDefaultAddress(userId: string, addressId: string) {
    // Unset all other default addresses
    await db.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });

    // Set this one as default
    return await db.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    });
  }

  /**
   * Get user dashboard statistics
   */
  async getDashboard(userId: string) {
    // Get all orders for the user
    const orders = await db.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            variant: {
              select: {
                price: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const sizeCatalogTitles = Array.from(
      new Set(
        orders.flatMap((order: { items: Array<{ sizeCatalogTitle: string | null }> }) =>
          order.items
            .map((item: { sizeCatalogTitle: string | null }) =>
              normalizeSizeCatalogTitleLookup(item.sizeCatalogTitle)
            )
            .filter((title: string) => title !== "")
        )
      )
    );
    const sizeCatalogPriceByTitle = new Map<string, number>();
    if (sizeCatalogTitles.length > 0) {
      const categories = await db.sizeCatalogCategory.findMany({
        select: { title: true, priceAmd: true },
      });
      for (const category of categories) {
        const title = normalizeSizeCatalogTitleLookup(category.title);
        if (!title || !sizeCatalogTitles.includes(title)) continue;
        const existing = sizeCatalogPriceByTitle.get(title);
        if (existing === undefined || category.priceAmd > existing) {
          sizeCatalogPriceByTitle.set(title, category.priceAmd);
        }
      }
    }

    // Calculate statistics
    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o: { status: string }) => o.status === "pending").length;
    const completedOrders = orders.filter((o: { status: string }) => o.status === "completed").length;
    const totalSpent = orders
      .filter((o: { status: string; paymentStatus: string }) => o.status === "completed" || o.paymentStatus === "paid")
      .reduce(
        (sum: number, o: { total: number; currency: string | null }) =>
          sum + persistedOrderMoneyToUsd(Number(o.total), o.currency ?? "USD"),
        0
      );

    // Count addresses
    const addressesCount = await db.address.count({
      where: { userId },
    });

    // Count orders by status
    const ordersByStatus: Record<string, number> = {};
    orders.forEach((order: { status: string }) => {
      ordersByStatus[order.status] = (ordersByStatus[order.status] || 0) + 1;
    });

    // Get recent orders (last 5)
    const recentOrders = orders.slice(0, 5).map((order: {
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
      currency: string | null;
      shippingAddress?: unknown;
      createdAt: Date;
      items: Array<{
        price: number | null;
        quantity: number | null;
        sizeCatalogTitle: string | null;
        variant?: { price?: number | null } | null;
      }>;
    }) => {
      const storedCurrency = order.currency ?? "USD";
      const summaryLines = buildOrderSummaryLinesFromPersistedItems(
        order.items,
        storedCurrency,
        sizeCatalogPriceByTitle
      );
      const shippingPriceAmd = resolveOrderShippingPriceAmd(order.shippingAddress);
      const collectionPriceAmount = Number(
        order.items
          .reduce(
            (sum, item) =>
              sum + resolveCollectionSurchargeUsd(item, sizeCatalogPriceByTitle, storedCurrency),
            0
          )
          .toFixed(2)
      );

      return {
        id: order.id,
        number: order.number,
        status: order.status,
        paymentStatus: order.paymentStatus,
        fulfillmentStatus: order.fulfillmentStatus,
        total: persistedOrderMoneyToUsd(Number(order.total), storedCurrency),
        subtotal: persistedOrderMoneyToUsd(Number(order.subtotal), storedCurrency),
        discountAmount: persistedOrderMoneyToUsd(Number(order.discountAmount), storedCurrency),
        shippingAmount: persistedOrderMoneyToUsd(Number(order.shippingAmount), storedCurrency),
        taxAmount: persistedOrderMoneyToUsd(Number(order.taxAmount), storedCurrency),
        collectionPriceAmount,
        currency: "USD",
        shippingPriceAmd,
        summaryLines,
        itemsCount: order.items.length,
        createdAt: order.createdAt.toISOString(),
      };
    });

    return {
      stats: {
        totalOrders,
        pendingOrders,
        completedOrders,
        totalSpent,
        addressesCount,
        ordersByStatus,
      },
      recentOrders,
    };
  }

  /**
   * Soft-delete the authenticated user's account
   */
  async deleteAccount(userId: string) {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, deletedAt: true },
    });

    if (!user) {
      throw {
        status: 404,
        type: "https://api.shop.am/problems/not-found",
        title: "User not found",
      };
    }

    if (user.deletedAt) {
      throw {
        status: 409,
        type: "https://api.shop.am/problems/conflict",
        title: "Account already deleted",
        detail: "This account has already been deleted",
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

export const usersService = new UsersService();

