'use client';

import { useEffect, type MutableRefObject } from 'react';
import { apiClient } from '@/lib/api-client';
import { buildSelectedAttributeValueIdsMap } from '@/lib/category-attributes';
import type { CategoryAttribute } from '@/lib/category-attributes';
import type { SizeCatalogCategoryDto } from '@/lib/types/size-catalog';
import type { useProductFormState } from './useProductFormState';

type ProductFormState = ReturnType<typeof useProductFormState>;

interface UseAddProductPageEffectsParams {
  isLoggedIn: boolean;
  isAdmin: boolean;
  isEditMode: boolean;
  productId: string | null;
  formState: ProductFormState;
  categoryAttributesForVariants: CategoryAttribute[];
  setSizeCatalogCategories: (categories: SizeCatalogCategoryDto[]) => void;
  attributePoolSeededForProductRef: MutableRefObject<string | null>;
  variableChosenWithEmptyRowsRef: MutableRefObject<boolean>;
}

export function useAddProductPageEffects({
  isLoggedIn,
  isAdmin,
  isEditMode,
  productId,
  formState,
  categoryAttributesForVariants,
  setSizeCatalogCategories,
  attributePoolSeededForProductRef,
  variableChosenWithEmptyRowsRef,
}: UseAddProductPageEffectsParams): void {
  useEffect(() => {
    if (!isEditMode) {
      formState.setVariableProductTypeAllowed(true);
    }
  }, [isEditMode, formState.setVariableProductTypeAllowed]);

  useEffect(() => {
    variableChosenWithEmptyRowsRef.current = false;
  }, [productId, variableChosenWithEmptyRowsRef]);

  useEffect(() => {
    if (formState.generatedVariants.length > 0) {
      variableChosenWithEmptyRowsRef.current = false;
    }
  }, [formState.generatedVariants.length, variableChosenWithEmptyRowsRef]);

  useEffect(() => {
    if (!isEditMode || !productId || formState.loadingProduct) {
      return;
    }
    if (formState.productType !== 'variable') {
      return;
    }
    if (formState.generatedVariants.length > 0) {
      return;
    }
    if (variableChosenWithEmptyRowsRef.current) {
      return;
    }
    formState.setProductType('simple');
    formState.setVariableProductTypeAllowed(true);
  }, [
    isEditMode,
    productId,
    formState.loadingProduct,
    formState.productType,
    formState.generatedVariants.length,
    formState.setProductType,
    formState.setVariableProductTypeAllowed,
    variableChosenWithEmptyRowsRef,
  ]);

  useEffect(() => {
    if (formState.submitErrorKey !== 'variableSubmitNeedVariants') {
      return;
    }
    if (formState.generatedVariants.length === 0) {
      return;
    }
    formState.setSubmitErrorKey(null);
  }, [
    formState.submitErrorKey,
    formState.generatedVariants.length,
    formState.setSubmitErrorKey,
  ]);

  useEffect(() => {
    if (!isLoggedIn || !isAdmin) {
      formState.setCategoryAttributes([]);
      return;
    }

    const loadGlobalAttributes = async () => {
      try {
        const response = await apiClient.get<{ data: CategoryAttribute[] }>(`/api/v1/admin/attributes`);
        formState.setCategoryAttributes(response.data || []);
      } catch (error: unknown) {
        console.error('❌ [ADMIN] Failed to load global attributes:', error);
        formState.setCategoryAttributes([]);
      }
    };

    void loadGlobalAttributes();
  }, [isLoggedIn, isAdmin, formState.setCategoryAttributes]);

  useEffect(() => {
    if (!isLoggedIn || !isAdmin) {
      setSizeCatalogCategories([]);
      return;
    }

    const loadSizeCatalogCategories = async () => {
      try {
        const response = await apiClient.get<{ data: SizeCatalogCategoryDto[] }>(
          '/api/v1/admin/size-catalog/categories'
        );
        setSizeCatalogCategories(Array.isArray(response.data) ? response.data : []);
      } catch (error: unknown) {
        console.error('❌ [ADMIN] Failed to load size catalog categories:', error);
        setSizeCatalogCategories([]);
      }
    };

    void loadSizeCatalogCategories();
  }, [isLoggedIn, isAdmin, setSizeCatalogCategories]);

  useEffect(() => {
    if (!isEditMode || !productId) {
      attributePoolSeededForProductRef.current = null;
      return;
    }
    if (formState.loadingProduct) {
      return;
    }
    if (categoryAttributesForVariants.length === 0 || formState.generatedVariants.length === 0) {
      return;
    }
    if (attributePoolSeededForProductRef.current === productId) {
      return;
    }

    const derived = buildSelectedAttributeValueIdsMap(
      categoryAttributesForVariants,
      formState.generatedVariants
    );
    if (Object.keys(derived).length === 0) {
      attributePoolSeededForProductRef.current = productId;
      return;
    }

    formState.setSelectedAttributeValueIds(derived);
    const enabled: Record<string, boolean> = {};
    categoryAttributesForVariants.forEach((attribute) => {
      enabled[attribute.id] = Object.prototype.hasOwnProperty.call(derived, attribute.id);
    });
    formState.setEnabledAttributeIds(enabled);
    attributePoolSeededForProductRef.current = productId;
  }, [
    isEditMode,
    productId,
    formState.loadingProduct,
    categoryAttributesForVariants,
    formState.generatedVariants,
    formState.setSelectedAttributeValueIds,
    formState.setEnabledAttributeIds,
    attributePoolSeededForProductRef,
  ]);

  useEffect(() => {
    if (
      categoryAttributesForVariants.length === 0 &&
      Object.keys(formState.selectedAttributeValueIds).length > 0
    ) {
      formState.setSelectedAttributeValueIds({});
    }
    if (
      categoryAttributesForVariants.length === 0 &&
      Object.keys(formState.enabledAttributeIds).length > 0
    ) {
      formState.setEnabledAttributeIds({});
    }
  }, [
    categoryAttributesForVariants,
    formState.selectedAttributeValueIds,
    formState.enabledAttributeIds,
    formState.setSelectedAttributeValueIds,
    formState.setEnabledAttributeIds,
  ]);

  useEffect(() => {
    const allowedValueIds = new Set(
      categoryAttributesForVariants.flatMap((attribute) => attribute.values.map((value) => value.id))
    );
    if (allowedValueIds.size === 0) {
      return;
    }

    formState.setGeneratedVariants((prev) => {
      let hasChanges = false;
      const nextVariants = prev.map((variant) => {
        const nextSelectedValueIds = variant.selectedValueIds.filter((valueId) => allowedValueIds.has(valueId));
        if (nextSelectedValueIds.length === variant.selectedValueIds.length) {
          return variant;
        }
        hasChanges = true;
        return { ...variant, selectedValueIds: nextSelectedValueIds };
      });
      return hasChanges ? nextVariants : prev;
    });

    formState.setSelectedAttributeValueIds((prev) => {
      let hasChanges = false;
      const next: Record<string, string[]> = {};

      Object.entries(prev).forEach(([attributeId, valueIds]) => {
        const filtered = valueIds.filter((valueId) => allowedValueIds.has(valueId));
        if (filtered.length > 0) {
          next[attributeId] = filtered;
        }
        if (filtered.length !== valueIds.length) {
          hasChanges = true;
        }
      });

      return hasChanges ? next : prev;
    });
  }, [categoryAttributesForVariants, formState.setGeneratedVariants, formState.setSelectedAttributeValueIds]);
}
