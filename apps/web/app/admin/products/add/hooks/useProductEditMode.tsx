import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { cleanImageUrls } from '@/lib/services/utils/image-utils';
import { isDefaultPricingVariant } from '@/lib/default-pricing-variant';
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
  setProductType: (type: 'simple' | 'variable') => void;
  setSimpleProductData: (data: unknown) => void;
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
          const defaultPricingVariant = variants.find((variant) => isDefaultPricingVariant(variant));
          const selectableVariants = variants.filter((variant) => !isDefaultPricingVariant(variant));
          const generated: GeneratedVariant[] = selectableVariants.map((v: VariantItem) => {
            const priceNum = typeof v.price === 'number' ? v.price : parseFloat(String(v.price)) || 0;
            const compareNum = typeof v.compareAtPrice === 'number' ? v.compareAtPrice : parseFloat(String(v.compareAtPrice)) || 0;
            const stockNum = typeof v.stock === 'number' ? v.stock : parseInt(String(v.stock), 10) || 0;
            return {
              id: v.id || `variant-${Date.now()}-${Math.random().toString(36).slice(2)}`,
              selectedValueIds: Array.isArray(v.selectedValueIds) ? v.selectedValueIds : [],
              price: String(priceNum),
              compareAtPrice: compareNum ? String(compareNum) : '',
              stock: String(stockNum),
              sku: v.sku || '',
              image: v.imageUrl ?? null,
            };
          });
          setGeneratedVariants(generated);
          const defaultPriceNum =
            typeof defaultPricingVariant?.price === 'number'
              ? defaultPricingVariant.price
              : parseFloat(String(defaultPricingVariant?.price)) || 0;
          const defaultCompareAtPriceNum =
            typeof defaultPricingVariant?.compareAtPrice === 'number'
              ? defaultPricingVariant.compareAtPrice
              : parseFloat(String(defaultPricingVariant?.compareAtPrice)) || 0;
          setSimpleProductData({
            price: defaultPricingVariant ? String(defaultPriceNum) : generated[0]?.price || '',
            compareAtPrice:
              defaultPricingVariant && defaultCompareAtPriceNum > 0 ? String(defaultCompareAtPriceNum) : '',
            sku: '',
            quantity: '0',
          });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- setter props are intentionally omitted
  }, [productId, isLoggedIn, isAdmin, router]);
}
