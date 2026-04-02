import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { cleanImageUrls } from '@/lib/services/utils/image-utils';
import { isDefaultPricingVariant } from '@/lib/default-pricing-variant';
import { DEFAULT_SIMPLE_PRODUCT_DATA } from '../constants/defaultSimpleProductData.constants';
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
  setVariableProductTypeAllowed: (allowed: boolean) => void;
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
  setVariableProductTypeAllowed,
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
        type VariantItem = NonNullable<ProductData['variants']>[number];

        if (variants.length === 0) {
          setGeneratedVariants([]);
          setProductType('simple');
          setSimpleProductData({
            price: DEFAULT_SIMPLE_PRODUCT_DATA.price,
            compareAtPrice: DEFAULT_SIMPLE_PRODUCT_DATA.compareAtPrice,
            sku: DEFAULT_SIMPLE_PRODUCT_DATA.sku,
            quantity: DEFAULT_SIMPLE_PRODUCT_DATA.quantity,
          });
          setVariableProductTypeAllowed(false);
        } else {
          const defaultPricingVariant = variants.find((variant) => isDefaultPricingVariant(variant));
          const selectableVariants = variants.filter((variant) => !isDefaultPricingVariant(variant));

          if (selectableVariants.length === 0) {
            const source: VariantItem = defaultPricingVariant ?? variants[0];
            const priceNum =
              typeof source.price === 'number' ? source.price : parseFloat(String(source.price)) || 0;
            const compareNum =
              typeof source.compareAtPrice === 'number'
                ? source.compareAtPrice
                : parseFloat(String(source.compareAtPrice ?? '')) || 0;
            const stockNum =
              typeof source.stock === 'number' ? source.stock : parseInt(String(source.stock ?? '0'), 10) || 0;
            const skuFromApi =
              typeof source.sku === 'string' && source.sku.trim() !== ''
                ? source.sku.trim()
                : DEFAULT_SIMPLE_PRODUCT_DATA.sku;
            setGeneratedVariants([]);
            setProductType('simple');
            setSimpleProductData({
              price: String(priceNum || DEFAULT_SIMPLE_PRODUCT_DATA.price),
              compareAtPrice: compareNum > 0 ? String(compareNum) : '',
              sku: skuFromApi,
              quantity: String(stockNum),
            });
            setVariableProductTypeAllowed(false);
          } else {
            const generated: GeneratedVariant[] = selectableVariants.map((v: VariantItem) => {
              const priceNum = typeof v.price === 'number' ? v.price : parseFloat(String(v.price)) || 0;
              const compareNum =
                typeof v.compareAtPrice === 'number' ? v.compareAtPrice : parseFloat(String(v.compareAtPrice)) || 0;
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
            const fallbackPriceFromVariant = generated[0]?.price;
            const resolvedPrice =
              defaultPricingVariant !== undefined
                ? String(defaultPriceNum)
                : fallbackPriceFromVariant && String(fallbackPriceFromVariant).trim() !== ''
                  ? String(fallbackPriceFromVariant)
                  : DEFAULT_SIMPLE_PRODUCT_DATA.price;
            const defaultStockNum =
              defaultPricingVariant !== undefined
                ? typeof defaultPricingVariant.stock === 'number'
                  ? defaultPricingVariant.stock
                  : parseInt(String(defaultPricingVariant.stock ?? '0'), 10) || 0
                : parseInt(DEFAULT_SIMPLE_PRODUCT_DATA.quantity, 10) || 0;
            const defaultSkuFromApi =
              defaultPricingVariant &&
              typeof defaultPricingVariant.sku === 'string' &&
              defaultPricingVariant.sku.trim() !== ''
                ? defaultPricingVariant.sku.trim()
                : DEFAULT_SIMPLE_PRODUCT_DATA.sku;
            setSimpleProductData({
              price: resolvedPrice,
              compareAtPrice:
                defaultPricingVariant && defaultCompareAtPriceNum > 0 ? String(defaultCompareAtPriceNum) : '',
              sku: defaultSkuFromApi,
              quantity: String(defaultStockNum),
            });
            setProductType('variable');
            setVariableProductTypeAllowed(true);
          }
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
