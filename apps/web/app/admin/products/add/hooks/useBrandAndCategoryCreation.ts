import { apiClient } from '@/lib/api-client';
import { useTranslation } from '@/lib/i18n-client';
import type { Category } from '../types';

interface UseBrandAndCategoryCreationProps {
  formData: {
    primaryCategoryId: string;
  };
  useNewCategory: boolean;
  newCategoryName: string;
  setCategories: (updater: (prev: Category[]) => Category[]) => void;
  setLoading: (loading: boolean) => void;
}

export function useBrandAndCategoryCreation({
  formData,
  useNewCategory,
  newCategoryName,
  setCategories,
  setLoading,
}: UseBrandAndCategoryCreationProps) {
  const { t } = useTranslation();

  const createBrandAndCategory = async (): Promise<{
    finalPrimaryCategoryId: string;
    creationMessages: string[];
    error: boolean;
  }> => {
    const creationMessages: string[] = [];
    let finalPrimaryCategoryId = formData.primaryCategoryId;

    if (useNewCategory && newCategoryName.trim()) {
      try {
        const categoryResponse = await apiClient.post<{ data: Category }>('/api/v1/admin/categories', {
          title: newCategoryName.trim(),
          locale: 'en',
          requiresSizes: false,
        });
        if (categoryResponse.data) {
          finalPrimaryCategoryId = categoryResponse.data.id;
          setCategories((prev) => [...prev, categoryResponse.data]);
          creationMessages.push(
            t('admin.products.add.categoryCreatedSuccess').replace('{name}', newCategoryName.trim())
          );
        }
      } catch (err: unknown) {
        console.error('Error creating category:', err);
        setLoading(false);
        return { finalPrimaryCategoryId, creationMessages, error: true };
      }
    }

    return { finalPrimaryCategoryId, creationMessages, error: false };
  };

  return { createBrandAndCategory };
}
