import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { convertPrice, type CurrencyCode } from '@/lib/currency';
import { cleanImageUrls } from '@/lib/services/utils/image-utils';
import type { ProductData } from '../types';
import type { GeneratedVariant } from '../types';

interface UseProductEditModeProps {
  productId: string | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  defaultCurrency: CurrencyCode;
  setLoadingProduct: (loading: boolean) => void;
  setFormData: (updater: (prev: unknown) => unknown) => void;
  setUseNewCategory: (use: boolean) => void;
  setNewCategoryName: (name: string) => void;
  setHasVariantsToLoad: (has: boolean) => void;
  setProductType: (type: 'simple' | 'variable') => void;
  setSimpleProductData: (data: unknown) => void;
  setGeneratedVariants: (variants: GeneratedVariant[]) => void;
}

export function useProductEditMode({
  productId,
  isLoggedIn,
  isAdmin,
  defaultCurrency,
  setLoadingProduct,
  setFormData,
  setUseNewCategory,
  setNewCategoryName,
  setHasVariantsToLoad,
  setProductType,
  setSimpleProductData,
  setGeneratedVariants,
}: UseProductEditModeProps) {
  const router = useRouter();

  useEffect(() => {
    if (!productId || !isLoggedIn || !isAdmin) return;

    const loadProduct = async () => {
      try {
        setLoadingProduct(true);
        const product = await apiClient.get<ProductData>(`/api/v1/admin/products/${productId}`);

        const mediaList = product.media || [];
        const normalizedMedia = cleanImageUrls(Array.isArray(mediaList) ? mediaList : []);

        const featuredIndexFromApi = Array.isArray(mediaList)
          ? mediaList.findIndex((item: unknown) => {
              const it = item as { url?: string; isFeatured?: boolean };
              return typeof it === 'object' && it?.isFeatured === true;
            })
          : -1;

        const mainProductImage =
          (product as { mainProductImage?: string }).mainProductImage ||
          (normalizedMedia.length > 0 ? normalizedMedia[featuredIndexFromApi >= 0 ? featuredIndexFromApi : 0] : '');

        const formData = {
          title: product.title || '',
          slug: product.slug || '',
          descriptionHtml: product.descriptionHtml || '',
          primaryCategoryId: product.primaryCategoryId || '',
          categoryIds: product.categoryIds || [],
          published: product.published ?? false,
          featured: product.featured ?? false,
          upcoming: product.upcoming ?? false,
          imageUrls: normalizedMedia,
          featuredImageIndex:
            featuredIndexFromApi >= 0 && featuredIndexFromApi < normalizedMedia.length ? featuredIndexFromApi : 0,
          mainProductImage: mainProductImage || '',
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
        if (variants.length > 0) {
          type VariantItem = NonNullable<ProductData['variants']>[number];
          const generated: GeneratedVariant[] = variants.map((v: VariantItem) => {
            const priceNum = typeof v.price === 'number' ? v.price : parseFloat(String(v.price)) || 0;
            const compareNum = typeof v.compareAtPrice === 'number' ? v.compareAtPrice : parseFloat(String(v.compareAtPrice)) || 0;
            const stockNum = typeof v.stock === 'number' ? v.stock : parseInt(String(v.stock), 10) || 0;
            return {
              id: v.id || `variant-${Date.now()}-${Math.random().toString(36).slice(2)}`,
              selectedValueIds: [],
              price: String(convertPrice(priceNum, 'USD', defaultCurrency)),
              compareAtPrice: compareNum ? String(convertPrice(compareNum, 'USD', defaultCurrency)) : '',
              stock: String(stockNum),
              sku: v.sku || '',
              image: v.imageUrl ?? null,
            };
          });
          setGeneratedVariants(generated);
          setProductType('variable');
        } else {
          setProductType('simple');
          setSimpleProductData({
            price: '',
            compareAtPrice: '',
            sku: '',
            quantity: '0',
          });
        }
      } catch (err: unknown) {
        console.error('Error loading product:', err);
        router.push('/admin/products');
      } finally {
        setLoadingProduct(false);
      }
    };

    loadProduct();
    // Intentionally omit setter props from deps: they are either stable (useState) or
    // wrapped inline in parent (new ref every render), which would cause infinite re-fetch.
    // Omit defaultCurrency so we don't re-fetch when settings load (would run twice).
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run when product or auth change
  }, [productId, isLoggedIn, isAdmin, router]);
}
