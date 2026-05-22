'use client';

import { useState, type ChangeEvent, type RefObject } from 'react';
import { useTranslation } from '../../../../../lib/i18n-client';
import type { GeneratedVariant } from '../types';
import type { CategoryAttribute } from '@/lib/category-attributes';
import {
  enforceSizeVersionCompatibility,
  isDuplicateVariantCombination,
  mergeVariantAttributeValues,
  removeAttributeValuesFromVariant,
  SIZE_ATTRIBUTE_KEY,
  SIZE_VERSION_ATTRIBUTE_KEY,
} from '../utils/variantAttributeHelpers';
import { VariantBuilderVariantsTable } from './VariantBuilderVariantsTable';

interface VariantBuilderProps {
  generatedVariants: GeneratedVariant[];
  categoryAttributes: CategoryAttribute[];
  selectedAttributeValueIds: Record<string, string[]>;
  enabledAttributeIds: Record<string, boolean>;
  onEnabledAttributeIdsChange: (next: Record<string, boolean>) => void;
  isEditMode: boolean;
  hasVariantsToLoad: boolean;
  imageUploadLoading: boolean;
  slug: string;
  title: string;
  variantImageInputRefs: RefObject<Record<string, HTMLInputElement | null>>;
  onVariantUpdate: (updater: (prev: GeneratedVariant[]) => GeneratedVariant[]) => void;
  onVariantAdd: () => void;
  onSelectedAttributeValueIdsChange: (value: Record<string, string[]>) => void;
  onApplyToAll: (field: 'price' | 'compareAtPrice' | 'stock' | 'sku', value: string) => void;
  onVariantImageUpload: (variantId: string, event: ChangeEvent<HTMLInputElement>) => void;
  generateSlug: (title: string) => string;
}

export function VariantBuilder({
  generatedVariants,
  categoryAttributes,
  selectedAttributeValueIds,
  enabledAttributeIds,
  onEnabledAttributeIdsChange,
  isEditMode,
  hasVariantsToLoad,
  imageUploadLoading,
  slug,
  title,
  variantImageInputRefs,
  onVariantUpdate,
  onVariantAdd,
  onSelectedAttributeValueIdsChange,
  onApplyToAll,
  onVariantImageUpload,
  generateSlug,
}: VariantBuilderProps) {
  const { t } = useTranslation();
  const [attributeCombinationError, setAttributeCombinationError] = useState<string | null>(null);
  const hasAttributeDrivenVariants = categoryAttributes.length > 0;
  const sizeAttribute = categoryAttributes.find((attribute) => attribute.key === SIZE_ATTRIBUTE_KEY);
  const sizeVersionAttribute = categoryAttributes.find(
    (attribute) => attribute.key === SIZE_VERSION_ATTRIBUTE_KEY
  );
  const isSizeEnabled = sizeAttribute ? enabledAttributeIds[sizeAttribute.id] === true : false;
  const attributeToggles = categoryAttributes.filter(
    (attribute) => attribute.key !== SIZE_VERSION_ATTRIBUTE_KEY
  );
  const attributesInUse = categoryAttributes.filter((attribute) => {
    if (attribute.key === SIZE_VERSION_ATTRIBUTE_KEY) {
      return isSizeEnabled;
    }
    return enabledAttributeIds[attribute.id] === true;
  });

  const withCompatibleSizeVersions = (selectedValueIds: string[]) =>
    enforceSizeVersionCompatibility(selectedValueIds, sizeVersionAttribute);

  const handleToggleAttributeEnabled = (attributeId: string, checked: boolean) => {
    setAttributeCombinationError(null);
    const nextEnabledAttributeIds = {
      ...enabledAttributeIds,
      [attributeId]: checked,
    };

    if (sizeAttribute && attributeId === sizeAttribute.id) {
      nextEnabledAttributeIds[sizeAttribute.id] = checked;
      if (sizeVersionAttribute) {
        nextEnabledAttributeIds[sizeVersionAttribute.id] = checked;
      }
    }
    onEnabledAttributeIdsChange(nextEnabledAttributeIds);

    if (!checked) {
      const attribute = categoryAttributes.find((a) => a.id === attributeId);
      const nextPool = { ...selectedAttributeValueIds };
      delete nextPool[attributeId];
      if (sizeAttribute && sizeVersionAttribute && attributeId === sizeAttribute.id) {
        delete nextPool[sizeVersionAttribute.id];
      }
      onSelectedAttributeValueIdsChange(nextPool);
      if (attribute || (sizeAttribute && sizeVersionAttribute && attributeId === sizeAttribute.id)) {
        onVariantUpdate((prev) =>
          prev.map((v) => ({
            ...v,
            selectedValueIds: withCompatibleSizeVersions(
              attribute ? removeAttributeValuesFromVariant(v, attribute) : v.selectedValueIds
            ),
          }))
        );
      }
    }
  };

  const handleVariantAttributeValuesChange = (variantId: string, attributeId: string, valueIds: string[]) => {
    const attribute = categoryAttributes.find((a) => a.id === attributeId);
    if (!attribute) {
      return;
    }
    const variant = generatedVariants.find((v) => v.id === variantId);
    if (!variant) {
      return;
    }

    const nextIds = withCompatibleSizeVersions(mergeVariantAttributeValues(variant, attribute, valueIds));

    if (nextIds.length > 0 && isDuplicateVariantCombination(nextIds, generatedVariants, variantId)) {
      setAttributeCombinationError(t('admin.products.add.duplicateVariantCombination'));
      return;
    }

    setAttributeCombinationError(null);
    onVariantUpdate((prev) =>
      prev.map((v) => (v.id === variantId ? { ...v, selectedValueIds: nextIds } : v))
    );
  };

  const getVariantOptionLabel = (variant: GeneratedVariant) => {
    return categoryAttributes
      .filter((attribute) => enabledAttributeIds[attribute.id] === true)
      .map((attribute) => {
        const labels = attribute.values
          .filter((value) => variant.selectedValueIds.includes(value.id))
          .map((value) => value.label);

        if (labels.length === 0) {
          return null;
        }

        return `${attribute.title}: ${labels.join(', ')}`;
      })
      .filter((label): label is string => Boolean(label))
      .join(' / ');
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('admin.products.add.variantBuilder')}</h2>
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
        {hasAttributeDrivenVariants ? (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm font-semibold text-gray-900">
              {t('admin.products.add.selectAttributesSectionTitle')}
            </p>
            <p className="mt-1 text-xs text-gray-500">{t('admin.products.add.selectAttributesDescription')}</p>

            <div className="mt-3 flex flex-wrap gap-2.5 sm:gap-3">
              {attributeToggles.map((attribute) => {
                const enabled = enabledAttributeIds[attribute.id] === true;
                return (
                  <div
                    key={attribute.id}
                    className="min-w-[8.5rem] max-w-[11rem] flex-1 rounded-md border border-gray-200 bg-white px-2.5 py-2 sm:min-w-[9.5rem]"
                  >
                    <label className="flex cursor-pointer items-start gap-2">
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(e) => handleToggleAttributeEnabled(attribute.id, e.target.checked)}
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-[#dcc090]/40 text-[#122a26] focus:ring-[#dcc090]"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium leading-tight text-gray-900">{attribute.title}</p>
                        <p className="text-[10px] uppercase tracking-wide text-gray-400">{attribute.key}</p>
                        {enabled ? (
                          <p className="mt-1 text-[10px] leading-snug text-gray-500">
                            {t('admin.products.add.attributeValuesPickInTableHint')}
                          </p>
                        ) : null}
                      </div>
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <VariantBuilderVariantsTable
            generatedVariants={generatedVariants}
            hasAttributeDrivenVariants={hasAttributeDrivenVariants}
            attributesInUse={attributesInUse}
            attributeCombinationError={attributeCombinationError}
            imageUploadLoading={imageUploadLoading}
            slug={slug}
            title={title}
            variantImageInputRefs={variantImageInputRefs}
            onVariantUpdate={onVariantUpdate}
            onVariantAdd={onVariantAdd}
            onApplyToAll={onApplyToAll}
            onVariantImageUpload={onVariantImageUpload}
            onVariantAttributeValuesChange={handleVariantAttributeValuesChange}
            getVariantOptionLabel={getVariantOptionLabel}
            generateSlug={generateSlug}
          />
        </div>
      </div>
    </div>
  );
}
