'use client';

import { useEffect, useState } from 'react';
import { Button } from '@shop/ui';
import type { CategoryAttribute, CategoryAttributeValue } from '@/lib/category-attributes';

const SIZE_ATTRIBUTE_KEY = 'size';

function ValueRowPreview({
  value,
  showImage,
}: {
  value: CategoryAttributeValue;
  showImage: boolean;
}) {
  return (
    <span className="flex min-w-0 flex-1 items-center gap-2">
      {value.colors && value.colors.length > 0 ? (
        <span className="flex shrink-0 gap-0.5">
          {value.colors.slice(0, 3).map((color) => (
            <span
              key={color}
              className="h-4 w-4 rounded-full border border-gray-200 shadow-sm"
              style={{ backgroundColor: color }}
            />
          ))}
        </span>
      ) : null}
      {showImage && value.imageUrl ? (
        <img
          src={value.imageUrl}
          alt=""
          className="h-8 w-8 shrink-0 rounded-md border border-gray-200 object-cover"
        />
      ) : null}
      <span className="text-sm text-gray-900">{value.label}</span>
    </span>
  );
}

interface AttributeValuesModalLabels {
  selectAll: string;
  allBadge: string;
  done: string;
  cancel: string;
}

interface AttributeValuesModalProps {
  open: boolean;
  attribute: CategoryAttribute;
  initialSelectedIds: string[];
  onClose: () => void;
  onConfirm: (valueIds: string[]) => void;
  labels: AttributeValuesModalLabels;
}

export function AttributeValuesModal({
  open,
  attribute,
  initialSelectedIds,
  onClose,
  onConfirm,
  labels,
}: AttributeValuesModalProps) {
  const [draftIds, setDraftIds] = useState<string[]>(initialSelectedIds);
  const showValueImage = attribute.key !== SIZE_ATTRIBUTE_KEY;

  useEffect(() => {
    if (open) {
      setDraftIds([...initialSelectedIds].sort());
    }
  }, [open, initialSelectedIds]);

  if (!open) {
    return null;
  }

  const allIds = attribute.values.map((v) => v.id);
  const allSelected = allIds.length > 0 && allIds.every((id) => draftIds.includes(id));

  const toggleId = (id: string) => {
    setDraftIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id].sort()
    );
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setDraftIds([]);
    } else {
      setDraftIds([...allIds]);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-labelledby="attribute-values-modal-title"
        className="max-h-[85vh] w-full max-w-md overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-gray-100 px-4 py-3">
          <h2 id="attribute-values-modal-title" className="text-base font-semibold text-gray-900">
            {attribute.title}
          </h2>
          <p className="text-xs uppercase tracking-wide text-gray-400">{attribute.key}</p>
        </div>

        <div className="max-h-[50vh] overflow-y-auto px-3 py-2">
          {attribute.values.length === 0 ? (
            <p className="px-2 py-4 text-sm text-gray-500">—</p>
          ) : (
            <>
              <label className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded border-[#dcc090]/40 text-[#122a26] focus:ring-[#dcc090]"
                />
                <span className="text-sm font-medium text-gray-800">{labels.selectAll}</span>
                {allSelected ? (
                  <span className="ml-auto text-xs text-gray-500">{labels.allBadge}</span>
                ) : null}
              </label>
              <div className="my-1 border-t border-gray-100" />
              {attribute.values.map((value) => {
                const checked = draftIds.includes(value.id);
                return (
                  <label
                    key={value.id}
                    className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleId(value.id)}
                      className="h-4 w-4 rounded border-[#dcc090]/40 text-[#122a26] focus:ring-[#dcc090]"
                    />
                    <ValueRowPreview value={value} showImage={showValueImage} />
                  </label>
                );
              })}
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-100 px-4 py-3">
          <Button type="button" variant="outline" onClick={onClose}>
            {labels.cancel}
          </Button>
          <Button
            type="button"
            onClick={() => {
              onConfirm(draftIds);
              onClose();
            }}
          >
            {labels.done}
          </Button>
        </div>
      </div>
    </div>
  );
}
