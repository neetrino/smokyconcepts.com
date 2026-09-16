import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../../../lib/api-client';
import { logger } from '../../../../lib/utils/logger';
import { showToast } from '../../../../components/Toast';
import { useTranslation } from '../../../../lib/i18n-client';
import type { Category } from '../types';

interface UseCategoriesReturn {
  categories: Category[];
  loading: boolean;
  reordering: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  reorderSiblings: (orderedIds: string[]) => Promise<void>;
}

/**
 * Hook for fetching and managing categories
 */
export function useCategories(): UseCategoriesReturn {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [reordering, setReordering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      logger.debug('Fetching categories');
      const response = await apiClient.get<{ data: Category[] }>('/api/v1/admin/categories');
      setCategories(response.data || []);
      logger.info('Categories loaded', { count: response.data?.length || 0 });
    } catch (err: unknown) {
      logger.error('Error fetching categories', { error: err });
      setCategories([]);
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, []);

  const reorderSiblings = useCallback(
    async (orderedIds: string[]) => {
      const previous = categories;
      setCategories((current) => {
        const byId = new Map(current.map((category) => [category.id, category]));
        return current.map((category) => {
          const nextIndex = orderedIds.indexOf(category.id);
          if (nextIndex < 0) {
            return category;
          }
          const source = byId.get(category.id);
          return source ? { ...source, position: nextIndex } : category;
        });
      });

      try {
        setReordering(true);
        await apiClient.put('/api/v1/admin/categories/reorder', { orderedIds });
        showToast(t('admin.categories.reorderSuccess'), 'success');
      } catch (err: unknown) {
        logger.error('Error reordering categories', { error: err });
        setCategories(previous);
        showToast(t('admin.categories.reorderFailed'), 'error');
      } finally {
        setReordering(false);
      }
    },
    [categories, t]
  );

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, reordering, error, fetchCategories, reorderSiblings };
}
