/**
 * Hook for product form callbacks and event handlers
 */

import { useRef, type ChangeEvent } from 'react';
import type { Category, GeneratedVariant } from '../types';
import { generateSlug, ensureUniqueSlug } from '../utils/productUtils';

interface UseProductFormCallbacksProps {
  formData: {
    title: string;
    slug: string;
    primaryCategoryId: string;
  };
  categories: Category[];
  generatedVariants: GeneratedVariant[];
  setFormData: (updater: (prev: unknown) => unknown) => void;
  setGeneratedVariants: (value: GeneratedVariant[] | ((prev: GeneratedVariant[]) => GeneratedVariant[])) => void;
  setSimpleProductData: (value: unknown | ((prev: unknown) => unknown)) => void;
  checkIsClothingCategory: (categoryId: string, categories: Category[]) => boolean;
  /** Product id when in edit mode — used to exclude the current product from duplicate check. */
  productId?: string | null;
}

export function useProductFormCallbacks({
  formData,
  categories,
  setFormData,
  setGeneratedVariants,
  setSimpleProductData,
  checkIsClothingCategory,
  productId,
}: UseProductFormCallbacksProps) {
  /** Debounce timer for the async slug uniqueness check. */
  const slugCheckTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;

    setFormData((prev: unknown) => {
      const prevObj = typeof prev === 'object' && prev !== null ? (prev as Record<string, unknown>) : {};
      const currentSlug = prevObj.slug as string | undefined;

      // Only auto-generate while the slug field is still empty (untouched by the user).
      if (currentSlug) {
        return { ...prevObj, title };
      }

      const generated = generateSlug(title);
      return { ...prevObj, title, slug: generated };
    });

    // After the user stops typing, check whether the generated slug is unique.
    if (slugCheckTimerRef.current) clearTimeout(slugCheckTimerRef.current);

    slugCheckTimerRef.current = setTimeout(() => {
      // Re-read slug from current form state via closure over setFormData.
      setFormData((prev: unknown) => {
        const prevObj = typeof prev === 'object' && prev !== null ? (prev as Record<string, unknown>) : {};
        const currentSlug = prevObj.slug as string | undefined;

        // Only check if slug was auto-generated (not manually edited).
        if (!currentSlug || currentSlug !== generateSlug(title)) {
          return prevObj;
        }

        // Fire async check without blocking the synchronous updater.
        void ensureUniqueSlug(currentSlug, productId ?? undefined).then((uniqueSlug) => {
          if (uniqueSlug !== currentSlug) {
            setFormData((latest: unknown) => {
              const latestObj = typeof latest === 'object' && latest !== null ? (latest as Record<string, unknown>) : {};
              // Only overwrite if slug hasn't been manually changed in the meantime.
              if ((latestObj.slug as string | undefined) === currentSlug) {
                return { ...latestObj, slug: uniqueSlug };
              }
              return latestObj;
            });
          }
        });

        return prevObj;
      });
    }, 600);
  };

  /**
   * Called on slug input blur — ensures the manually typed slug is also unique.
   */
  const handleSlugBlur = () => {
    const currentSlug = formData.slug;
    if (!currentSlug) return;

    void ensureUniqueSlug(currentSlug, productId ?? undefined).then((uniqueSlug) => {
      if (uniqueSlug !== currentSlug) {
        setFormData((prev: unknown) => {
          const prevObj = typeof prev === 'object' && prev !== null ? (prev as Record<string, unknown>) : {};
          // Only overwrite if the slug hasn't changed since we started the request.
          if ((prevObj.slug as string | undefined) === currentSlug) {
            return { ...prevObj, slug: uniqueSlug };
          }
          return prevObj;
        });
      }
    });
  };

  const isClothingCategory = () => checkIsClothingCategory(formData.primaryCategoryId, categories);

  const handleVariantAdd = () => {
    const newVariant: GeneratedVariant = {
      id: `variant-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      selectedValueIds: [],
      price: '',
      compareAtPrice: '',
      stock: '0',
      sku: '',
      image: null,
    };
    setGeneratedVariants((prev) => [...prev, newVariant]);
  };

  return {
    handleTitleChange,
    handleSlugBlur,
    isClothingCategory,
    handleVariantAdd,
  };
}
