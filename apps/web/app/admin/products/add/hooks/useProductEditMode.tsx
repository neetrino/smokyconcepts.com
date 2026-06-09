import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { cleanImageUrls } from '@/lib/services/utils/image-utils';
import { initializeCurrencyRates } from '@/lib/currency';
import { mapApiVariantsToGeneratedVariants } from '../utils/mapApiVariantsToGeneratedVariants';
import type { ProductData } from '../types';
import type { GeneratedVariant } from '../types';

interface UseProductEditModeProps {
  productId: string | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  setLoadingProduct: (loading: boolean) => void;
  setFormData: (updater: (prev: unknown) => unknown) => void;
  setUseNewCategory: (use: boolean) => void;
  setNewCategoryName: (name: string) => void;
  setHasVariantsToLoad: (has: boolean) => void;
  setGeneratedVariants: (variants: GeneratedVariant[]) => void;
}

export function useProductEditMode({
  productId,
  isLoggedIn,
  isAdmin,
  setLoadingProduct,
  setFormData,
  setUseNewCategory,
  setNewCategoryName,
  setHasVariantsToLoad,
  setGeneratedVariants,
}: UseProductEditModeProps) {
  const router = useRouter();

  useEffect(() => {
    if (!productId || !isLoggedIn || !isAdmin) return;

    const loadProduct = async () => {
      try {
        setLoadingProduct(true);
        await initializeCurrencyRates();
        const product = await apiClient.get<ProductData>(`/api/v1/admin/products/${productId}`);

        const mediaList = product.media || [];
        const normalizedMedia = cleanImageUrls(Array.isArray(mediaList) ? mediaList : []);

        const formData = {
          title: product.title || '',
          slug: product.slug || '',
          descriptionHtml: product.descriptionHtml || '',
          productDetailsHtml: product.productDetailsHtml || '',
          shippingHtml: product.shippingHtml || '',
          primaryCategoryId: product.primaryCategoryId || '',
          categoryIds: product.categoryIds || [],
          sizeCatalogCategoryId: '',
          sizeCatalogCategoryTitle: '',
          published: product.published ?? false,
          featured: product.featured ?? false,
          upcoming: product.upcoming ?? false,
          imageUrls: [] as string[],
          featuredImageIndex: 0,
          mainProductImage: '',
          variants: [] as unknown[],
          labels: (product.labels || []).map((label: { id?: string; type?: string; value?: string; position?: string; color?: string | null }) => ({
            id: label.id || '',
            type: label.type || 'text',
            value: label.value || '',
            position: label.position || 'top-left',
            color: label.color ?? null,
          })),
        };

        setFormData((prev: unknown) => ({ ...(typeof prev === 'object' && prev !== null ? prev : {}), ...formData }));
        setUseNewCategory(false);
        setNewCategoryName('');
        setHasVariantsToLoad(false);

        const variants = product.variants || [];
        const mapped = mapApiVariantsToGeneratedVariants(variants, product.slug || '', normalizedMedia);

        setGeneratedVariants(mapped.generatedVariants);
        setFormData((prev: unknown) => ({
          ...(typeof prev === 'object' && prev !== null ? prev : {}),
          sizeCatalogCategoryId: mapped.sizeCatalogCategoryId,
          sizeCatalogCategoryTitle: mapped.sizeCatalogCategoryTitle,
        }));
      } catch (err: unknown) {
        console.error('Error loading product:', err);
        router.push('/supersudo/products');
      } finally {
        setLoadingProduct(false);
      }
    };

    loadProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- setter props are intentionally omitted
  }, [productId, isLoggedIn, isAdmin, router]);
}
