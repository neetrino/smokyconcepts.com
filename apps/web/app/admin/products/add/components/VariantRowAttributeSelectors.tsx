'use client';

import { useState } from 'react';
import type { GeneratedVariant } from '../types';
import type { CategoryAttribute } from '@/lib/category-attributes';
import { getSelectedValueIdsForAttribute } from '../utils/variantAttributeHelpers';
import { AttributeValuesModal } from './AttributeValuesModal';

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
        const selectedIds = getSelectedValueIdsForAttribute(variant, attribute);
        const key = `${variant.id}:${attribute.id}`;
        const isOpen = openKey === key;
        const summary = selectionSummary(attribute, selectedIds, labels.allBadge);

        return (
          <div key={attribute.id} className="flex flex-wrap items-start gap-2">
            <div className="min-w-0 flex-1">
              <button
                type="button"
                onClick={() => openModal(attribute.id)}
                disabled={attribute.values.length === 0}
                className="flex w-full max-w-[280px] items-center justify-between gap-2 rounded-md  bg-white px-3 py-2 text-left text-sm font-medium text-gray-900 shadow-sm transition-colors hover:border-gray-400 hover:bg-gray-50 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
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
              attribute={attribute}
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
