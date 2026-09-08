import { apiClient } from '../../../../lib/api-client';
import { useTranslation } from '../../../../lib/i18n-client';
import type { Product } from '../types';
import type { ProductData } from '../add/types';

interface UseProductHandlersProps {
  products: Product[];
  fetchProducts: () => Promise<void>;
  selectedIds: Set<string>;
  setSelectedIds: (ids: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
  setBulkDeleting: (deleting: boolean) => void;
}

export function useProductHandlers({
  products,
  fetchProducts,
  selectedIds,
  setSelectedIds,
  setBulkDeleting,
}: UseProductHandlersProps) {
  const { t } = useTranslation();

  const buildDuplicateSlug = (slug: string) => {
    const normalizedSlug = slug.trim() || 'product';
    const suffix = Date.now().toString().slice(-6);
    return `${normalizedSlug}-copy-${suffix}`;
  };

  const buildDuplicateSku = (sku: string | undefined, duplicateSlug: string, index: number) => {
    const baseSku = sku?.trim() || duplicateSlug.toUpperCase().replace(/[^A-Z0-9]+/g, '-');
    const suffix = Date.now().toString().slice(-6);
    return `${baseSku}-COPY-${suffix}-${index + 1}`;
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (products.length === 0) return;
    setSelectedIds(prev => {
      const allIds = products.map(p => p.id);
      const hasAll = allIds.every(id => prev.has(id));
      return hasAll ? new Set() : new Set(allIds);
    });
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(t('admin.products.bulkDeleteConfirm').replace('{count}', selectedIds.size.toString()))) return;
    setBulkDeleting(true);
    try {
      const ids = Array.from(selectedIds);
      const results = await Promise.allSettled(
        ids.map(id => apiClient.delete(`/api/v1/admin/products/${id}`))
      );
      const failed = results.filter(r => r.status === 'rejected');
      setSelectedIds(new Set());
      await fetchProducts();
      alert(t('admin.products.bulkDeleteFinished').replace('{success}', (ids.length - failed.length).toString()).replace('{total}', ids.length.toString()));
    } catch (err) {
      console.error('❌ [ADMIN] Bulk delete products error:', err);
      alert(t('admin.products.failedToDelete'));
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleDeleteProduct = async (productId: string, productTitle: string) => {
    if (!confirm(t('admin.products.deleteConfirm').replace('{title}', productTitle))) {
      return;
    }

    try {
      await apiClient.delete(`/api/v1/admin/products/${productId}`);

      // Refresh products list
      void fetchProducts();


      alert(t('admin.products.deletedSuccess'));
    } catch (err: any) {
      console.error('❌ [ADMIN] Error deleting product:', err);
      alert(t('admin.products.errorDeleting').replace('{message}', err.message || t('admin.common.unknownErrorFallback')));
    }
  };

  const handleDuplicateProduct = async (productId: string) => {
    try {
      const sourceProduct = await apiClient.get<ProductData>(`/api/v1/admin/products/${productId}`);
      const duplicateSlug = buildDuplicateSlug(sourceProduct.slug || '');
      const duplicatedVariants = Array.isArray(sourceProduct.variants)
        ? sourceProduct.variants.map((variant, index) => ({
            price: variant.price,
            compareAtPrice: variant.compareAtPrice,
            stock: variant.stock,
            sku: buildDuplicateSku(variant.sku, duplicateSlug, index),
            imageUrl: variant.imageUrl,
            published: false,
          }))
        : [];

      const payload = {
        title: sourceProduct.title,
        slug: duplicateSlug,
        descriptionHtml: sourceProduct.descriptionHtml || undefined,
        productDetailsHtml: sourceProduct.productDetailsHtml || undefined,
        shippingHtml: sourceProduct.shippingHtml || undefined,
        primaryCategoryId: sourceProduct.primaryCategoryId || undefined,
        categoryIds: sourceProduct.categoryIds || [],
        published: false,
        featured: false,
        upcoming: false,
        locale: 'en',
        media: sourceProduct.media || [],
        variants: duplicatedVariants,
        labels: (sourceProduct.labels || []).map((label) => ({
          type: label.type,
          value: label.value,
          position: label.position,
          color: label.color || null,
        })),
      };

      await apiClient.post<{ id: string }>('/api/v1/admin/products', payload);
      await fetchProducts();
      alert(t('admin.products.duplicatedSuccess').replace('{title}', sourceProduct.title));
    } catch (err: any) {
      console.error('❌ [ADMIN] Error duplicating product:', err);
      alert(t('admin.products.errorDuplicating').replace('{message}', err.message || t('admin.common.unknownErrorFallback')));
    }
  };

  const handleTogglePublished = async (productId: string, currentStatus: boolean, productTitle: string) => {
    try {
      const newStatus = !currentStatus;
      
      // При изменении только статуса published, отправляем только статус
      // Это позволяет избежать проблем с валидацией вариантов (например, требование размеров)
      // Варианты и другие данные останутся без изменений на сервере
      const updateData = {
        published: newStatus,
      };
      
      await apiClient.put(`/api/v1/admin/products/${productId}`, updateData);

      // Refresh products list
      void fetchProducts();


      if (newStatus) {
        alert(t('admin.products.productPublished').replace('{title}', productTitle));
      } else {
        alert(t('admin.products.productDraft').replace('{title}', productTitle));
      }
    } catch (err: any) {
      console.error('❌ [ADMIN] Error updating product status:', err);
      alert(t('admin.products.errorUpdatingStatus').replace('{message}', err.message || t('admin.common.unknownErrorFallback')));
    }
  };

  const handleToggleFeatured = async (productId: string, currentStatus: boolean, productTitle: string) => {
    try {
      const newStatus = !currentStatus;
      
      const updateData = {
        featured: newStatus,
      };
      
      await apiClient.put(`/api/v1/admin/products/${productId}`, updateData);

      // Refresh products list
      void fetchProducts();
    } catch (err: any) {
      console.error('❌ [ADMIN] Error updating product featured status:', err);
      alert(t('admin.products.errorUpdatingFeatured').replace('{message}', err.message || t('admin.common.unknownErrorFallback')));
    }
  };

  const handleToggleUpcoming = async (productId: string, currentStatus: boolean, productTitle: string) => {
    try {
      const newStatus = !currentStatus;
      await apiClient.put(`/api/v1/admin/products/${productId}`, { upcoming: newStatus });
      await fetchProducts();
    } catch (err: any) {
      console.error('❌ [ADMIN] Error updating product upcoming status:', err);
      alert(t('admin.products.errorUpdatingUpcoming').replace('{message}', err.message || t('admin.common.unknownErrorFallback')));
    }
  };

  return {
    toggleSelect,
    toggleSelectAll,
    handleBulkDelete,
    handleDeleteProduct,
    handleDuplicateProduct,
    handleTogglePublished,
    handleToggleFeatured,
    handleToggleUpcoming,
  };
}






