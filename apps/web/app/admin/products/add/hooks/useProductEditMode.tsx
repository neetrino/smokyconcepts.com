import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { cleanImageUrls } from '@/lib/services/utils/image-utils';
import {
  extractSizeCatalogSelectionFromAttributes,
  isDefaultPricingVariant,
} from '@/lib/default-pricing-variant';
import { catalogPriceForStorefront, initializeCurrencyRates } from '@/lib/currency';
import { DEFAULT_SIMPLE_PRODUCT_DATA } from '../constants/defaultSimpleProductData.constants';
import { buildAutoSkuBaseFromSlug, buildAutoSkuForVariantIndex } from '../utils/autoSku';
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
        await initializeCurrencyRates();
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
          productDetailsHtml: product.productDetailsHtml || '',
          shippingHtml: product.shippingHtml || '',
          primaryCategoryId: product.primaryCategoryId || '',
          categoryIds: product.categoryIds || [],
          sizeCatalogCategoryId: '',
          sizeCatalogCategoryTitle: '',
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
            sku: buildAutoSkuBaseFromSlug(product.slug || ''),
            quantity: DEFAULT_SIMPLE_PRODUCT_DATA.quantity,
          });
          setVariableProductTypeAllowed(true);
        } else {
          const defaultPricingVariant = variants.find((variant) => isDefaultPricingVariant(variant));
          const selectableVariants = variants.filter((variant) => !isDefaultPricingVariant(variant));
          const sizeCatalogSource = defaultPricingVariant ?? selectableVariants[0];
          const sizeCatalogSelection = extractSizeCatalogSelectionFromAttributes(sizeCatalogSource?.attributes);
          setFormData((prev: unknown) => ({
            ...(typeof prev === 'object' && prev !== null ? prev : {}),
            sizeCatalogCategoryId: sizeCatalogSelection.categoryId || '',
            sizeCatalogCategoryTitle: sizeCatalogSelection.categoryTitle || '',
          }));

          if (selectableVariants.length === 0) {
            const source: VariantItem = defaultPricingVariant ?? variants[0];
            const priceNum =
              typeof source.price === 'number' ? source.price : parseFloat(String(source.price)) || 0;
            const compareNum =
              typeof source.compareAtPrice === 'number'
                ? source.compareAtPrice
                : parseFloat(String(source.compareAtPrice ?? '')) || 0;
            const priceAmd = catalogPriceForStorefront(priceNum);
            const compareAmd = compareNum > 0 ? catalogPriceForStorefront(compareNum) : 0;
            const stockNum =
              typeof source.stock === 'number' ? source.stock : parseInt(String(source.stock ?? '0'), 10) || 0;
            const skuFromApi =
              typeof source.sku === 'string' && source.sku.trim() !== ''
                ? source.sku.trim()
                : buildAutoSkuBaseFromSlug(product.slug || '');
            setGeneratedVariants([]);
            setProductType('simple');
            setSimpleProductData({
              price: String(priceAmd || DEFAULT_SIMPLE_PRODUCT_DATA.price),
              compareAtPrice: compareAmd > 0 ? String(compareAmd) : '',
              sku: skuFromApi,
              quantity: String(stockNum),
            });
            setVariableProductTypeAllowed(true);
          } else {
            const slugForSku = product.slug || '';
            const generated: GeneratedVariant[] = selectableVariants.map((v: VariantItem, idx: number) => {
              const priceNumUsd = typeof v.price === 'number' ? v.price : parseFloat(String(v.price)) || 0;
              const compareNum =
                typeof v.compareAtPrice === 'number' ? v.compareAtPrice : parseFloat(String(v.compareAtPrice)) || 0;
              const priceNum = catalogPriceForStorefront(priceNumUsd);
              const compareAmd = compareNum ? catalogPriceForStorefront(compareNum) : 0;
              const stockNum = typeof v.stock === 'number' ? v.stock : parseInt(String(v.stock), 10) || 0;
              const apiSku = typeof v.sku === 'string' ? v.sku.trim() : '';
              return {
                id: v.id || `variant-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                selectedValueIds: Array.isArray(v.selectedValueIds) ? v.selectedValueIds : [],
                price: String(priceNum),
                compareAtPrice: compareAmd ? String(compareAmd) : '',
                stock: String(stockNum),
                sku: apiSku !== '' ? apiSku : buildAutoSkuForVariantIndex(slugForSku, idx),
                image: v.imageUrl ?? null,
              };
            });

            const sole = generated.length === 1 ? generated[0] : null;
            const isSoleVariantWithoutOptions =
              sole !== null && sole.selectedValueIds.length === 0;

            if (isSoleVariantWithoutOptions) {
              setGeneratedVariants([]);
              setSimpleProductData({
                price: sole.price,
                compareAtPrice: sole.compareAtPrice,
                sku: sole.sku,
                quantity: sole.stock,
              });
              setProductType('simple');
              setVariableProductTypeAllowed(true);
            } else {
              setGeneratedVariants(generated);
              const defaultPriceNum =
                typeof defaultPricingVariant?.price === 'number'
                  ? defaultPricingVariant.price
                  : parseFloat(String(defaultPricingVariant?.price)) || 0;
              const defaultPriceAmd = catalogPriceForStorefront(defaultPriceNum);
              const defaultCompareAtPriceNum =
                typeof defaultPricingVariant?.compareAtPrice === 'number'
                  ? defaultPricingVariant.compareAtPrice
                  : parseFloat(String(defaultPricingVariant?.compareAtPrice)) || 0;
              const defaultCompareAtPriceAmd =
                defaultCompareAtPriceNum > 0 ? catalogPriceForStorefront(defaultCompareAtPriceNum) : 0;
              const fallbackPriceFromVariant = generated[0]?.price;
              const resolvedPrice =
                defaultPricingVariant !== undefined
                  ? String(defaultPriceAmd)
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
                  : buildAutoSkuBaseFromSlug(product.slug || '');
              setSimpleProductData({
                price: resolvedPrice,
                compareAtPrice:
                  defaultPricingVariant && defaultCompareAtPriceAmd > 0 ? String(defaultCompareAtPriceAmd) : '',
                sku: defaultSkuFromApi,
                quantity: String(defaultStockNum),
              });
              setProductType('variable');
              setVariableProductTypeAllowed(true);
            }
          }
        }
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
