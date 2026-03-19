/**
 * Admin Service - Combined service that delegates to specialized services
 * This file combines all admin-related services for backward compatibility
 */

import { adminStatsService } from "./admin/admin-stats.service";
import { adminUsersService } from "./admin/admin-users.service";
import { adminOrdersService } from "./admin/admin-orders.service";
import { adminSettingsService } from "./admin/admin-settings.service";
import { adminDeliveryService } from "./admin/admin-delivery.service";
import { adminCategoriesService } from "./admin/admin-categories.service";
import { adminProductsService } from "./admin/admin-products.service";
import { adminVotingService } from "./admin/admin-voting.service";

class AdminService {
  // Delegate to specialized services
  
  // Stats methods
  getStats = adminStatsService.getStats.bind(adminStatsService);
  getUserActivity = adminStatsService.getUserActivity.bind(adminStatsService);
  getRecentOrders = adminStatsService.getRecentOrders.bind(adminStatsService);
  getTopProducts = adminStatsService.getTopProducts.bind(adminStatsService);
  getActivity = adminStatsService.getActivity.bind(adminStatsService);
  getAnalytics = adminStatsService.getAnalytics.bind(adminStatsService);

  // Users methods
  getUsers = adminUsersService.getUsers.bind(adminUsersService);
  updateUser = adminUsersService.updateUser.bind(adminUsersService);
  deleteUser = adminUsersService.deleteUser.bind(adminUsersService);

  // Orders methods
  getOrders = adminOrdersService.getOrders.bind(adminOrdersService);
  getOrderById = adminOrdersService.getOrderById.bind(adminOrdersService);
  deleteOrder = adminOrdersService.deleteOrder.bind(adminOrdersService);
  updateOrder = adminOrdersService.updateOrder.bind(adminOrdersService);

  // Settings methods
  getSettings = adminSettingsService.getSettings.bind(adminSettingsService);
  updateSettings = adminSettingsService.updateSettings.bind(adminSettingsService);
  getPriceFilterSettings = adminSettingsService.getPriceFilterSettings.bind(adminSettingsService);
  updatePriceFilterSettings = adminSettingsService.updatePriceFilterSettings.bind(adminSettingsService);

  // Delivery methods
  getDeliverySettings = adminDeliveryService.getDeliverySettings.bind(adminDeliveryService);
  getDeliveryPrice = adminDeliveryService.getDeliveryPrice.bind(adminDeliveryService);
  updateDeliverySettings = adminDeliveryService.updateDeliverySettings.bind(adminDeliveryService);

  // Categories methods
  getCategories = adminCategoriesService.getCategories.bind(adminCategoriesService);
  createCategory = adminCategoriesService.createCategory.bind(adminCategoriesService);
  getCategoryById = adminCategoriesService.getCategoryById.bind(adminCategoriesService);
  updateCategory = adminCategoriesService.updateCategory.bind(adminCategoriesService);
  deleteCategory = adminCategoriesService.deleteCategory.bind(adminCategoriesService);

  // Products methods
  getProducts = adminProductsService.getProducts.bind(adminProductsService);
  getProductById = adminProductsService.getProductById.bind(adminProductsService);
  createProduct = adminProductsService.createProduct.bind(adminProductsService);
  updateProduct = adminProductsService.updateProduct.bind(adminProductsService);
  deleteProduct = adminProductsService.deleteProduct.bind(adminProductsService);
  updateProductDiscount = adminProductsService.updateProductDiscount.bind(adminProductsService);

  // Voting methods
  getVotingItems = adminVotingService.getVotingItems.bind(adminVotingService);
  getVotingItemById = adminVotingService.getVotingItemById.bind(adminVotingService);
  createVotingItem = adminVotingService.createVotingItem.bind(adminVotingService);
  updateVotingItem = adminVotingService.updateVotingItem.bind(adminVotingService);
  deleteVotingItem = adminVotingService.deleteVotingItem.bind(adminVotingService);
}

export const adminService = new AdminService();
