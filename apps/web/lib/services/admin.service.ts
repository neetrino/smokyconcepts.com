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
import { adminGlobalAttributesService } from "./admin/admin-global-attributes.service";
import { adminProductsService } from "./admin/admin-products.service";
import { adminVotingService } from "./admin/admin-voting.service";
import { adminSizeCatalogService } from "./admin/admin-size-catalog.service";

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
  reorderCategories = adminCategoriesService.reorderCategories.bind(adminCategoriesService);
  deleteCategory = adminCategoriesService.deleteCategory.bind(adminCategoriesService);

  getGlobalAttributes = adminGlobalAttributesService.getGlobalAttributes.bind(adminGlobalAttributesService);
  createGlobalAttribute = adminGlobalAttributesService.createGlobalAttribute.bind(adminGlobalAttributesService);
  updateGlobalAttribute = adminGlobalAttributesService.updateGlobalAttribute.bind(adminGlobalAttributesService);
  deleteGlobalAttribute = adminGlobalAttributesService.deleteGlobalAttribute.bind(adminGlobalAttributesService);
  addGlobalAttributeValue = adminGlobalAttributesService.addGlobalAttributeValue.bind(adminGlobalAttributesService);
  updateGlobalAttributeValue = adminGlobalAttributesService.updateGlobalAttributeValue.bind(adminGlobalAttributesService);
  deleteGlobalAttributeValue = adminGlobalAttributesService.deleteGlobalAttributeValue.bind(adminGlobalAttributesService);

  // Products methods
  getProducts = adminProductsService.getProducts.bind(adminProductsService);
  getProductById = adminProductsService.getProductById.bind(adminProductsService);
  createProduct = adminProductsService.createProduct.bind(adminProductsService);
  updateProduct = adminProductsService.updateProduct.bind(adminProductsService);
  deleteProduct = adminProductsService.deleteProduct.bind(adminProductsService);
  updateProductDiscount = adminProductsService.updateProductDiscount.bind(adminProductsService);
  reorderProductsInCategory = adminProductsService.reorderProductsInCategory.bind(adminProductsService);

  // Voting methods
  listVotings = adminVotingService.listVotings.bind(adminVotingService);
  getVotingWithItems = adminVotingService.getVotingWithItems.bind(adminVotingService);
  createVoting = adminVotingService.createVoting.bind(adminVotingService);
  updateVoting = adminVotingService.updateVoting.bind(adminVotingService);
  deleteVoting = adminVotingService.deleteVoting.bind(adminVotingService);
  // Backward-compatible aliases for legacy route names.
  createVotingCategory = (
    _votingId: string,
    data: Parameters<typeof adminVotingService.createVoting>[0],
  ) => adminVotingService.createVoting(data);
  updateVotingCategory = adminVotingService.updateVoting.bind(adminVotingService);
  deleteVotingCategory = adminVotingService.deleteVoting.bind(adminVotingService);
  getVotingItemById = adminVotingService.getVotingItemById.bind(adminVotingService);
  createVotingItem = adminVotingService.createVotingItem.bind(adminVotingService);
  updateVotingItem = adminVotingService.updateVotingItem.bind(adminVotingService);
  deleteVotingItem = adminVotingService.deleteVotingItem.bind(adminVotingService);

  // Size catalog (PDP + admin)
  getStorefrontSizeCatalog = adminSizeCatalogService.getStorefrontCatalog.bind(adminSizeCatalogService);
  getAdminSizeCatalog = adminSizeCatalogService.getAdminCatalog.bind(adminSizeCatalogService);
  createSizeCatalogCategory = adminSizeCatalogService.createCategory.bind(adminSizeCatalogService);
  updateSizeCatalogCategory = adminSizeCatalogService.updateCategory.bind(adminSizeCatalogService);
  deleteSizeCatalogCategory = adminSizeCatalogService.deleteCategory.bind(adminSizeCatalogService);
  createSizeCatalogItem = adminSizeCatalogService.createItem.bind(adminSizeCatalogService);
  updateSizeCatalogItem = adminSizeCatalogService.updateItem.bind(adminSizeCatalogService);
  deleteSizeCatalogItem = adminSizeCatalogService.deleteItem.bind(adminSizeCatalogService);
}

export const adminService = new AdminService();
