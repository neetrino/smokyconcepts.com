'use client';

import { useState } from 'react';
import type { GeneratedVariant } from '../types';
import type { CategoryAttribute } from '@/lib/category-attributes';
import { getSelectedValueIdsForAttribute } from '../utils/variantAttributeHelpers';
import { AttributeValuesModal } from './AttributeValuesModal';

const SIZE_ATTRIBUTE_KEY = 'size';
const SIZE_VERSION_ATTRIBUTE_KEY = 'size_version';
const SIZE_COLLECTION_ID_PREFIX = 'size-catalog-collection:';
const SIZE_VERSION_ID_PREFIX = 'size-catalog-version:';

function parseCollectionTokenFromSizeValueId(valueId: string): string | null {
  if (!valueId.startsWith(SIZE_COLLECTION_ID_PREFIX)) {
    return null;
  }
  return valueId.slice(SIZE_COLLECTION_ID_PREFIX.length) || null;
}

function parseCollectionTokenFromVersionValueId(valueId: string): string | null {
  if (!valueId.startsWith(SIZE_VERSION_ID_PREFIX)) {
    return null;
  }
  const payload = valueId.slice(SIZE_VERSION_ID_PREFIX.length);
  const separatorIdx = payload.indexOf(':');
  if (separatorIdx === -1) {
    return null;
  }
  return payload.slice(0, separatorIdx) || null;
}

function selectionSummary(
  attribute: CategoryAttribute,
  selectedIds: string[],
  allBadge: string
): string {
  if (selectedIds.length === 0) {
    return '—';
  }
  const allIds = attribute.values.map((v) => v.id);
  if (
    allIds.length > 0 &&
    allIds.length === selectedIds.length &&
    allIds.every((id) => selectedIds.includes(id))
  ) {
    return allBadge;
  }
  return attribute.values
    .filter((v) => selectedIds.includes(v.id))
    .map((v) => v.label)
    .join(', ');
}

interface VariantRowAttributeSelectorsProps {
  variant: GeneratedVariant;
  categoryAttributes: CategoryAttribute[];
  onAttributeValuesChange: (attributeId: string, valueIds: string[]) => void;
  labels: {
    allBadge: string;
    selectAll: string;
    done: string;
    cancel: string;
  };
}

export function VariantRowAttributeSelectors({
  variant,
  categoryAttributes,
  onAttributeValuesChange,
  labels,
}: VariantRowAttributeSelectorsProps) {
  const [openKey, setOpenKey] = useState<string | null>(null);

  const openModal = (attributeId: string) => {
    setOpenKey(`${variant.id}:${attributeId}`);
  };

  const closeModal = () => {
    setOpenKey(null);
  };

  return (
    <div className="min-w-[90px] ">
      {categoryAttributes.map((attribute) => {
        let effectiveAttribute = attribute;
        if (attribute.key === SIZE_VERSION_ATTRIBUTE_KEY) {
          const sizeAttribute = categoryAttributes.find((item) => item.key === SIZE_ATTRIBUTE_KEY);
          const selectedCollectionTokens = sizeAttribute
            ? getSelectedValueIdsForAttribute(variant, sizeAttribute)
                .map((valueId) => parseCollectionTokenFromSizeValueId(valueId))
                .filter((token): token is string => Boolean(token))
            : [];

          if (selectedCollectionTokens.length > 0) {
            const selectedCollectionTokenSet = new Set(selectedCollectionTokens);
            effectiveAttribute = {
              ...attribute,
              values: attribute.values.filter((value) => {
                const token = parseCollectionTokenFromVersionValueId(value.id);
                return token !== null && selectedCollectionTokenSet.has(token);
              }),
            };
          }
        }

        const selectedIds = getSelectedValueIdsForAttribute(variant, effectiveAttribute);
        const key = `${variant.id}:${attribute.id}`;
        const isOpen = openKey === key;
        const summary = selectionSummary(effectiveAttribute, selectedIds, labels.allBadge);

        return (
          <div key={attribute.id} className="flex flex-wrap items-start gap-2">
            <div className="min-w-0 flex-1">
              <button
                type="button"
                onClick={() => openModal(attribute.id)}
                disabled={effectiveAttribute.values.length === 0}
                className="flex w-full max-w-[280px] items-center justify-between gap-2 rounded-md bg-white px-3 py-2 text-left text-sm font-medium text-[#122a26] shadow-sm transition-colors hover:border-[#dcc090] hover:bg-[#dcc090]/10 focus:border-[#dcc090] focus:outline-none focus:ring-1 focus:ring-[#dcc090] disabled:cursor-not-allowed disabled:bg-[#dcc090]/15"
              >
                <span className="min-w-0 flex-1 truncate">{attribute.title}</span>
                <svg
                  className="h-4 w-4 shrink-0 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <p className="mt-1 line-clamp-2 text-xs text-gray-600" title={summary}>
                {summary}
              </p>
            </div>

            <AttributeValuesModal
              open={isOpen}
              attribute={effectiveAttribute}
              initialSelectedIds={selectedIds}
              onClose={closeModal}
              onConfirm={(valueIds) => onAttributeValuesChange(attribute.id, valueIds)}
              labels={{
                selectAll: labels.selectAll,
                allBadge: labels.allBadge,
                done: labels.done,
                cancel: labels.cancel,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
