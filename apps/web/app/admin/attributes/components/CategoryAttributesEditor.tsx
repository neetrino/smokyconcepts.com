'use client';

import { useEffect, useState } from 'react';
import { Button, Input } from '@shop/ui';
import { apiClient } from '../../../../lib/api-client';
import { useTranslation } from '../../../../lib/i18n-client';
import { showToast } from '../../../../components/Toast';
import { AttributeValueEditModal } from '../../../../components/AttributeValueEditModal';
import type { CategoryAttribute } from '@/lib/category-attributes';

export function CategoryAttributesEditor() {
  const { t } = useTranslation();
  const [attributes, setAttributes] = useState<CategoryAttribute[]>([]);
  const [loading, setLoading] = useState(false);
  const [creatingAttribute, setCreatingAttribute] = useState(false);
  const [newAttributeTitle, setNewAttributeTitle] = useState('');
  const [newValueByAttributeId, setNewValueByAttributeId] = useState<Record<string, string>>({});
  const [expandedAttributeIds, setExpandedAttributeIds] = useState<Set<string>>(new Set());
  const [editingValue, setEditingValue] = useState<{
    attributeId: string;
    value: CategoryAttribute['values'][number];
  } | null>(null);

  const toggleExpanded = (attributeId: string) => {
    setExpandedAttributeIds((prev) => {
      const next = new Set(prev);
      if (next.has(attributeId)) {
        next.delete(attributeId);
      } else {
        next.add(attributeId);
      }
      return next;
    });
  };

  useEffect(() => {
    const loadAttributes = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get<{ data: CategoryAttribute[] }>(`/api/v1/admin/attributes`);
        setAttributes(response.data || []);
      } catch {
        showToast(t('admin.attributes.errorCreating').replace('{message}', 'Failed to load attributes'), 'error');
      } finally {
        setLoading(false);
      }
    };

    void loadAttributes();
  }, [t]);

  const handleCreateAttribute = async () => {
    if (!newAttributeTitle.trim()) {
      return;
    }

    try {
      setCreatingAttribute(true);
      const response = await apiClient.post<{ data: CategoryAttribute }>(`/api/v1/admin/attributes`, {
        title: newAttributeTitle.trim(),
      });
      setAttributes((prev) => [...prev, response.data]);
      setNewAttributeTitle('');
      showToast(t('admin.attributes.createdSuccess'), 'success');
    } catch (error: unknown) {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message?: string }).message)
          : 'Failed to create attribute';
      showToast(t('admin.attributes.errorCreating').replace('{message}', message), 'error');
    } finally {
      setCreatingAttribute(false);
    }
  };

  const handleEditAttribute = async (attribute: CategoryAttribute) => {
    const nextTitle = prompt(t('admin.attributes.editAttribute'), attribute.title);
    if (nextTitle === null || !nextTitle.trim()) {
      return;
    }

    try {
      const response = await apiClient.put<{ data: CategoryAttribute }>(
        `/api/v1/admin/attributes/${attribute.id}`,
        { title: nextTitle.trim() }
      );
      setAttributes((prev) => prev.map((item) => (item.id === attribute.id ? response.data : item)));
      showToast(t('admin.attributes.nameUpdatedSuccess'), 'success');
    } catch (error: unknown) {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message?: string }).message)
          : 'Failed to update attribute';
      showToast(t('admin.attributes.errorCreating').replace('{message}', message), 'error');
    }
  };

  const handleDeleteAttribute = async (attribute: CategoryAttribute) => {
    if (!confirm(t('admin.attributes.deleteConfirm').replace('{name}', attribute.title))) {
      return;
    }

    try {
      await apiClient.delete(`/api/v1/admin/attributes/${attribute.id}`);
      setAttributes((prev) => prev.filter((item) => item.id !== attribute.id));
      showToast(t('admin.attributes.deletedSuccess'), 'success');
    } catch (error: unknown) {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message?: string }).message)
          : 'Failed to delete attribute';
      showToast(t('admin.attributes.errorDeleting').replace('{message}', message), 'error');
    }
  };

  const handleCreateValue = async (attribute: CategoryAttribute) => {
    const label = newValueByAttributeId[attribute.id]?.trim();
    if (!label) {
      return;
    }

    try {
      const response = await apiClient.post<{ data: CategoryAttribute }>(
        `/api/v1/admin/attributes/${attribute.id}/values`,
        { label }
      );
      setAttributes((prev) => prev.map((item) => (item.id === attribute.id ? response.data : item)));
      setNewValueByAttributeId((prev) => ({ ...prev, [attribute.id]: '' }));
      showToast(t('admin.attributes.valueAddedSuccess'), 'success');
    } catch (error: unknown) {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message?: string }).message)
          : 'Failed to create value';
      showToast(t('admin.attributes.errorAddingValue').replace('{message}', message), 'error');
    }
  };

  const handleDeleteValue = async (attributeId: string, valueId: string, label: string) => {
    if (!confirm(t('admin.attributes.deleteValueConfirm').replace('{label}', label))) {
      return;
    }

    try {
      await apiClient.delete(`/api/v1/admin/attributes/${attributeId}/values/${valueId}`);
      setAttributes((prev) =>
        prev.map((item) =>
          item.id === attributeId
            ? { ...item, values: item.values.filter((value) => value.id !== valueId) }
            : item
        )
      );
      showToast(t('admin.attributes.valueDeletedSuccess'), 'success');
    } catch (error: unknown) {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message?: string }).message)
          : 'Failed to delete value';
      showToast(t('admin.attributes.errorDeletingValue').replace('{message}', message), 'error');
    }
  };

  const handleSaveValue = async (data: {
    label?: string;
    colors?: string[];
    imageUrl?: string | null;
  }) => {
    if (!editingValue) {
      return;
    }

    const response = await apiClient.put<{ data: CategoryAttribute }>(
      `/api/v1/admin/attributes/${editingValue.attributeId}/values/${editingValue.value.id}`,
      data
    );

    setAttributes((prev) =>
      prev.map((item) => (item.id === editingValue.attributeId ? response.data : item))
    );
    showToast(t('admin.attributes.valueUpdatedSuccess'), 'success');
  };

  return (
    <>
      <div className="space-y-6">
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              value={newAttributeTitle}
              onChange={(event) => setNewAttributeTitle(event.target.value)}
              placeholder={t('admin.attributes.namePlaceholder')}
              className="flex-1"
            />
            <Button
              variant="primary"
              onClick={handleCreateAttribute}
              disabled={creatingAttribute || !newAttributeTitle.trim()}
            >
              {creatingAttribute ? t('admin.attributes.adding') : t('admin.attributes.addAttribute')}
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="py-10 text-center text-sm text-gray-500">{t('admin.attributes.loadingAttributes')}</div>
        ) : attributes.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
            {t('admin.attributes.noAttributes')}
          </div>
        ) : (
          <div className="space-y-4">
            {attributes.map((attribute) => {
              const isExpanded = expandedAttributeIds.has(attribute.id);
              return (
                <div key={attribute.id} className="rounded-xl border border-gray-200 bg-white shadow-sm">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
                    onClick={() => toggleExpanded(attribute.id)}
                  >
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{attribute.title}</h4>
                      <p className="text-xs uppercase tracking-wide text-gray-400">{attribute.key}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">
                        {attribute.values.length} {t('admin.attributes.valuesCount') ?? 'values'}
                      </span>
                      <svg
                        className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-gray-100 px-4 pb-4 pt-4">
                      <div className="mb-4 flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditAttribute(attribute)}>
                          {t('admin.common.edit')}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAttribute(attribute)}
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          {t('admin.common.delete')}
                        </Button>
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row">
                        <Input
                          value={newValueByAttributeId[attribute.id] || ''}
                          onChange={(event) =>
                            setNewValueByAttributeId((prev) => ({
                              ...prev,
                              [attribute.id]: event.target.value,
                            }))
                          }
                          placeholder={t('admin.attributes.addNewValue')}
                          className="flex-1"
                        />
                        <Button variant="outline" onClick={() => handleCreateValue(attribute)}>
                          {t('admin.attributes.add')}
                        </Button>
                      </div>

                      <div className="mt-4 space-y-3">
                        {attribute.values.length === 0 ? (
                          <p className="text-sm text-gray-500">{t('admin.attributes.noValuesYet')}</p>
                        ) : (
                          attribute.values.map((value) => (
                            <div
                              key={value.id}
                              className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 lg:flex-row lg:items-center lg:justify-between"
                            >
                              <div className="flex items-center gap-3">
                                {value.imageUrl ? (
                                  <img
                                    src={value.imageUrl}
                                    alt={value.label}
                                    className="h-14 w-14 rounded-lg border border-gray-200 bg-white object-cover"
                                  />
                                ) : (
                                  <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white text-xs text-gray-400">
                                    IMG
                                  </div>
                                )}
                                <div>
                                  <p className="font-medium text-gray-900">{value.label}</p>
                                  {value.colors.length > 0 ? (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                      {value.colors.map((color) => (
                                        <span
                                          key={color}
                                          className="h-5 w-5 rounded-full border border-gray-300"
                                          style={{ backgroundColor: color }}
                                          title={color}
                                        />
                                      ))}
                                    </div>
                                  ) : null}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingValue({ attributeId: attribute.id, value })}
                                >
                                  {t('admin.attributes.configureValue')}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                  onClick={() => handleDeleteValue(attribute.id, value.id, value.label)}
                                >
                                  {t('admin.common.delete')}
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {editingValue ? (
        <AttributeValueEditModal
          isOpen
          onClose={() => setEditingValue(null)}
          value={editingValue.value}
          attributeId={editingValue.attributeId}
          onSave={handleSaveValue}
        />
      ) : null}
    </>
  );
}
