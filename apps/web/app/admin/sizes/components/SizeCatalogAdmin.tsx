'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronRight } from 'lucide-react';

import { apiClient } from '@/lib/api-client';
import { formatPriceInCurrency } from '@/lib/currency';
import type { SizeCatalogCategoryDto, SizeCatalogItemDto } from '@/lib/types/size-catalog';
import { useTranslation } from '@/lib/i18n-client';
import { showToast } from '@/components/Toast';
import { parsePriceAmd } from '../utils/parsePriceAmd';
import { initialSizeItemModal, SizeItemModal, type SizeItemModalState } from './SizeItemModal';

const ADMIN_LIST_ENDPOINT = '/api/v1/admin/size-catalog/categories';
const CUSTOM_COLLECTION_TITLE_VALUE = '__custom_collection_title__';

export function SizeCatalogAdmin() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<SizeCatalogCategoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategoryTitle, setNewCategoryTitle] = useState('');
  const [newCategoryTitleSelection, setNewCategoryTitleSelection] = useState('');
  const [newCategoryPriceAmd, setNewCategoryPriceAmd] = useState('0');
  const [savingCategory, setSavingCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryTitle, setEditingCategoryTitle] = useState('');
  const [editingCategoryPriceAmd, setEditingCategoryPriceAmd] = useState('0');
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);
  const [itemModal, setItemModal] = useState<SizeItemModalState>(initialSizeItemModal);

  const availableCollectionTitles = useMemo(() => {
    const seen = new Set<string>();
    const titles: string[] = [];
    for (const category of categories) {
      const title = category.title.trim();
      if (!title || seen.has(title)) continue;
      seen.add(title);
      titles.push(title);
    }
    return titles.sort((a, b) => a.localeCompare(b));
  }, [categories]);

  const collectionPriceByTitle = useMemo(() => {
    const map = new Map<string, number>();
    for (const category of categories) {
      const title = category.title.trim();
      if (!title) continue;
      const existingPrice = map.get(title);
      if (existingPrice === undefined || category.priceAmd > existingPrice) {
        map.set(title, category.priceAmd);
      }
    }
    return map;
  }, [categories]);

  const formatCollectionOptionLabel = useCallback(
    (title: string, priceAmd: number) =>
      t('admin.sizes.collectionOptionWithPrice')
        .replace('{title}', title)
        .replace('{price}', formatPriceInCurrency(priceAmd, 'AMD')),
    [t],
  );

  const fetchCatalog = useCallback(async (options?: { showLoading?: boolean }) => {
    const showLoading = options?.showLoading ?? true;
    if (showLoading) {
      setLoading(true);
    }
    try {
      const res = await apiClient.get<{ data: SizeCatalogCategoryDto[] }>(ADMIN_LIST_ENDPOINT);
      setCategories(
        (res.data ?? []).map((cat) => ({
          ...cat,
          items: Array.isArray(cat.items) ? cat.items : [],
        })),
      );
    } catch {
      showToast(t('admin.sizes.errorLoad'), 'error');
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [t]);

  useEffect(() => { void fetchCatalog(); }, [fetchCatalog]);

  useEffect(() => {
    if (categories.length === 0) { setExpandedCategoryId(null); return; }
    setExpandedCategoryId((current) => {
      if (current && categories.some((c) => c.id === current)) return current;
      return categories[0]?.id ?? null;
    });
  }, [categories]);

  const handleAddCategory = async () => {
    const title = newCategoryTitle.trim();
    if (!title) { showToast(t('admin.sizes.titleRequired'), 'warning'); return; }
    const priceAmd = parsePriceAmd(newCategoryPriceAmd);
    const titleKey = title.toLocaleLowerCase();
    const existingWithTitle = categories.filter(
      (cat) => cat.title.trim().toLocaleLowerCase() === titleKey,
    );
    setSavingCategory(true);
    try {
      if (existingWithTitle.length > 0) {
        await Promise.all(
          existingWithTitle.map((cat) =>
            apiClient.patch(`/api/v1/admin/size-catalog/categories/${cat.id}`, {
              title: cat.title,
              priceAmd,
            }),
          ),
        );
        setNewCategoryTitle('');
        setNewCategoryTitleSelection('');
        setNewCategoryPriceAmd('0');
        showToast(t('admin.sizes.categoryUpdated'), 'success');
        setExpandedCategoryId(existingWithTitle[0]?.id ?? null);
      } else {
        const created = await apiClient.post<{ data: SizeCatalogCategoryDto }>(ADMIN_LIST_ENDPOINT, {
          title,
          priceAmd,
        });
        setNewCategoryTitle('');
        setNewCategoryTitleSelection('');
        setNewCategoryPriceAmd('0');
        showToast(t('admin.sizes.categoryCreated'), 'success');
        if (created.data) {
          setCategories((prev) => [
            ...prev,
            { ...created.data, items: Array.isArray(created.data.items) ? created.data.items : [] },
          ]);
          setExpandedCategoryId(created.data.id);
        }
      }
      await fetchCatalog({ showLoading: false });
    } catch {
      showToast(t('admin.sizes.errorSave'), 'error');
    } finally {
      setSavingCategory(false);
    }
  };

  const startEditCategory = (cat: SizeCatalogCategoryDto) => {
    setEditingCategoryId(cat.id);
    setEditingCategoryTitle(cat.title);
    setEditingCategoryPriceAmd(String(cat.priceAmd));
    setExpandedCategoryId(cat.id);
  };

  const saveEditCategory = async () => {
    if (!editingCategoryId) return;
    const title = editingCategoryTitle.trim();
    if (!title) { showToast(t('admin.sizes.titleRequired'), 'warning'); return; }
    const priceAmd = parsePriceAmd(editingCategoryPriceAmd);
    const editingCat = categories.find((cat) => cat.id === editingCategoryId);
    const previousTitleKey = editingCat?.title.trim().toLocaleLowerCase() ?? '';
    const targets =
      previousTitleKey !== ''
        ? categories.filter(
            (cat) => cat.title.trim().toLocaleLowerCase() === previousTitleKey,
          )
        : categories.filter((cat) => cat.id === editingCategoryId);
    try {
      await Promise.all(
        targets.map((cat) =>
          apiClient.patch(`/api/v1/admin/size-catalog/categories/${cat.id}`, {
            title: cat.id === editingCategoryId ? title : cat.title,
            priceAmd,
          }),
        ),
      );
      setEditingCategoryId(null);
      showToast(t('admin.sizes.categoryUpdated'), 'success');
      await fetchCatalog({ showLoading: false });
    } catch {
      showToast(t('admin.sizes.errorSave'), 'error');
    }
  };

  const deleteCategory = async (id: string) => {
    if (!window.confirm(t('admin.sizes.deleteCategoryConfirm'))) return;
    try {
      await apiClient.delete(`/api/v1/admin/size-catalog/categories/${id}`);
      showToast(t('admin.sizes.categoryDeleted'), 'success');
      await fetchCatalog({ showLoading: false });
    } catch {
      showToast(t('admin.sizes.errorDelete'), 'error');
    }
  };

  const openItemModal = (categoryId: string, mode: 'create' | 'edit', item?: SizeCatalogItemDto) => {
    setItemModal({
      open: true, categoryId, mode,
      itemId: item?.id ?? null,
      title: item?.title ?? '',
      imageUrl: item?.imageUrl ?? '',
      version: item?.version ?? '',
    });
  };

  const openDuplicateModal = (categoryId: string, item: SizeCatalogItemDto) => {
    setItemModal({ open: true, categoryId, mode: 'duplicate', itemId: null, title: item.title, imageUrl: item.imageUrl, version: item.version });
  };

  const publishDraftItem = async (itemId: string) => {
    try {
      await apiClient.patch(`/api/v1/admin/size-catalog/items/${itemId}`, { published: true });
      showToast(t('admin.sizes.itemPublished'), 'success');
      await fetchCatalog({ showLoading: false });
    } catch {
      showToast(t('admin.sizes.errorSave'), 'error');
    }
  };

  const deleteItem = async (itemId: string) => {
    if (!window.confirm(t('admin.sizes.deleteItemConfirm'))) return;
    try {
      await apiClient.delete(`/api/v1/admin/size-catalog/items/${itemId}`);
      showToast(t('admin.sizes.itemDeleted'), 'success');
      await fetchCatalog({ showLoading: false });
    } catch {
      showToast(t('admin.sizes.errorDelete'), 'error');
    }
  };

  if (loading) {
    return (
      <div className="py-10 text-center">
        <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-b-2 border-[#122a26]" />
        <p className="text-sm text-[#414141]/55">{t('admin.sizes.loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* New category card */}
      <div className="overflow-hidden rounded-2xl border border-[#dcc090]/30 bg-white/90 shadow-[0_8px_30px_rgba(18,42,38,0.06)]">
        <div className="border-b border-[#dcc090]/20 bg-[#122a26] px-6 py-4">
          <h2 className="text-base font-black uppercase tracking-[0.1em] text-[#dcc090]">
            {t('admin.sizes.newCategorySection')}
          </h2>
        </div>
        <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-[#414141]/70">
              {t('admin.sizes.categoryTitle')}
            </label>
            <div className="space-y-2">
              <select
                value={newCategoryTitleSelection}
                onChange={(e) => {
                  const selected = e.target.value;
                  setNewCategoryTitleSelection(selected);
                  if (selected === CUSTOM_COLLECTION_TITLE_VALUE || selected === '') {
                    setNewCategoryTitle('');
                    setNewCategoryPriceAmd('0');
                    return;
                  }
                  setNewCategoryTitle(selected);
                  setNewCategoryPriceAmd(String(collectionPriceByTitle.get(selected) ?? 0));
                }}
                disabled={savingCategory}
                className="w-full rounded-lg border border-[#dcc090]/35 bg-white px-3 py-2.5 text-sm text-[#122a26] outline-none transition-all focus:border-[#dcc090] focus:ring-2 focus:ring-[#dcc090]/30 disabled:opacity-50"
              >
                <option value="">{t('admin.sizes.categoryTitlePlaceholder')}</option>
                {availableCollectionTitles.map((titleOption) => (
                  <option key={titleOption} value={titleOption}>
                    {formatCollectionOptionLabel(
                      titleOption,
                      collectionPriceByTitle.get(titleOption) ?? 0,
                    )}
                  </option>
                ))}
                <option value={CUSTOM_COLLECTION_TITLE_VALUE}>{t('admin.sizes.customize')}</option>
              </select>

              {newCategoryTitleSelection === CUSTOM_COLLECTION_TITLE_VALUE && (
                <input
                  value={newCategoryTitle}
                  onChange={(e) => setNewCategoryTitle(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') void handleAddCategory(); }}
                  placeholder={t('admin.sizes.categoryTitlePlaceholder')}
                  disabled={savingCategory}
                  className="w-full rounded-lg border border-[#dcc090]/35 bg-white px-3 py-2.5 text-sm text-[#122a26] placeholder-[#414141]/30 outline-none transition-all focus:border-[#dcc090] focus:ring-2 focus:ring-[#dcc090]/30 disabled:opacity-50"
                />
              )}
            </div>
          </div>
          <div className="sm:w-48">
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-[#414141]/70">
              {t('admin.sizes.customize')}
            </label>
            <input
              type="number"
              min={0}
              step={1}
              value={newCategoryPriceAmd}
              onChange={(e) => setNewCategoryPriceAmd(e.target.value)}
              disabled={savingCategory}
              className="w-full rounded-lg border border-[#dcc090]/35 bg-white px-3 py-2.5 text-sm text-[#122a26] outline-none transition-all focus:border-[#dcc090] focus:ring-2 focus:ring-[#dcc090]/30 disabled:opacity-50"
            />
          </div>
          <button
            type="button"
            onClick={() => void handleAddCategory()}
            disabled={savingCategory}
            className="rounded-lg bg-[#122a26] px-5 py-2.5 text-sm font-bold text-[#dcc090] shadow-[0_4px_14px_rgba(18,42,38,0.15)] transition-all hover:bg-[#18352f] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {savingCategory ? t('admin.sizes.saving') : t('admin.sizes.createCategory')}
          </button>
        </div>
      </div>

      {/* Categories list */}
      {categories.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#dcc090]/40 p-10 text-center">
          <p className="text-sm text-[#414141]/50">{t('admin.sizes.noCategories')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="overflow-hidden rounded-2xl border border-[#dcc090]/25 bg-white/95 shadow-[0_4px_16px_rgba(18,42,38,0.05)]"
            >
              {/* Category header */}
              <div className="flex items-center gap-3 px-5 py-4">
                <button
                  type="button"
                  onClick={() => setExpandedCategoryId((cur) => (cur === cat.id ? null : cat.id))}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#dcc090]/35 bg-[#dcc090]/10 text-[#122a26] transition-all hover:bg-[#dcc090]/25"
                  aria-expanded={expandedCategoryId === cat.id}
                >
                  <ChevronRight
                    className={`h-4 w-4 transition-transform duration-200 ${expandedCategoryId === cat.id ? 'rotate-90' : ''}`}
                    aria-hidden
                  />
                </button>

                <div className="min-w-0 flex-1">
                  {editingCategoryId === cat.id ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#414141]/55">
                          {t('admin.sizes.customize')}
                        </span>
                        <input
                          type="number"
                          min={0}
                          step={1}
                          value={editingCategoryPriceAmd}
                          onChange={(e) => setEditingCategoryPriceAmd(e.target.value)}
                          className="w-32 rounded-lg border border-[#dcc090]/35 bg-white px-3 py-2 text-sm text-[#122a26] outline-none focus:border-[#dcc090] focus:ring-2 focus:ring-[#dcc090]/30"
                        />
                      </div>
                      <input
                        value={editingCategoryTitle}
                        onChange={(e) => setEditingCategoryTitle(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') void saveEditCategory(); }}
                        className="max-w-xs rounded-lg border border-[#dcc090]/35 bg-white px-3 py-2 text-sm text-[#122a26] outline-none focus:border-[#dcc090] focus:ring-2 focus:ring-[#dcc090]/30"
                      />
                      <button
                        type="button"
                        onClick={() => void saveEditCategory()}
                        className="rounded-lg bg-[#122a26] px-3 py-2 text-xs font-bold text-[#dcc090] transition-all hover:bg-[#18352f]"
                      >
                        {t('admin.sizes.save')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingCategoryId(null)}
                        className="rounded-lg border border-[#dcc090]/30 px-3 py-2 text-xs font-bold text-[#414141]/70 transition-all hover:bg-[#dcc090]/10"
                      >
                        {t('admin.sizes.cancel')}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setExpandedCategoryId((cur) => (cur === cat.id ? null : cat.id))}
                      className="text-left"
                    >
                      <h3 className="text-sm font-black text-[#122a26]">{cat.title}</h3>
                      <p className="mt-0.5 text-xs font-semibold text-[#122a26]/70">
                        {t('admin.sizes.customize')}: {formatPriceInCurrency(cat.priceAmd, 'AMD')}
                      </p>
                      {expandedCategoryId !== cat.id && (
                        <p className="mt-0.5 text-xs text-[#414141]/45">
                          {cat.items?.[0]?.title ?? t('admin.sizes.noItems')}
                        </p>
                      )}
                    </button>
                  )}
                </div>

                {editingCategoryId !== cat.id && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => startEditCategory(cat)}
                      className="rounded-lg border border-[#dcc090]/35 bg-[#dcc090]/10 px-3 py-1.5 text-xs font-bold text-[#122a26] transition-all hover:bg-[#dcc090]/25 hover:border-[#dcc090]"
                    >
                      {t('admin.sizes.renameCategory')}
                    </button>
                    <button
                      type="button"
                      onClick={() => openItemModal(cat.id, 'create')}
                      className="rounded-lg border border-[#dcc090]/35 bg-[#dcc090]/10 px-3 py-1.5 text-xs font-bold text-[#122a26] transition-all hover:bg-[#dcc090]/25 hover:border-[#dcc090]"
                    >
                      {t('admin.sizes.addItem')}
                    </button>
                    <button
                      type="button"
                      onClick={() => void deleteCategory(cat.id)}
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 transition-all hover:bg-red-100 hover:border-red-300"
                    >
                      {t('admin.sizes.deleteCategory')}
                    </button>
                  </div>
                )}
              </div>

              {/* Items grid */}
              {expandedCategoryId === cat.id && (
                <div className="border-t border-[#dcc090]/20 px-5 pb-5 pt-4">
                  {(cat.items?.length ?? 0) === 0 ? (
                    <p className="text-sm text-[#414141]/45">{t('admin.sizes.noItems')}</p>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {(cat.items ?? []).map((item) => (
                        <div
                          key={item.id}
                          className={`flex gap-3 rounded-xl border p-3 transition-all ${
                            item.published
                              ? 'border-[#dcc090]/20 bg-white'
                              : 'border-amber-300/60 bg-amber-50/50'
                          }`}
                        >
                          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-[#dcc090]/20 bg-[#dcc090]/5">
                            <img src={item.imageUrl} alt="" className="h-full w-full object-contain" />
                            {item.version && (
                              <span className="absolute bottom-1 right-1 rounded-full bg-[#122a26]/85 px-1.5 py-0.5 text-[10px] font-bold uppercase text-[#dcc090]">
                                {item.version}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <p className="text-sm font-bold text-[#122a26]">{item.title}</p>
                              {!item.published && (
                                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                                  {t('admin.sizes.draftLabel')}
                                </span>
                              )}
                            </div>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              <button
                                type="button"
                                onClick={() => openItemModal(cat.id, 'edit', item)}
                                className="rounded-lg border border-[#dcc090]/35 bg-[#dcc090]/10 px-2.5 py-1 text-xs font-bold text-[#122a26] transition-all hover:bg-[#dcc090]/25"
                              >
                                {t('admin.sizes.editItem')}
                              </button>
                              <button
                                type="button"
                                onClick={() => openDuplicateModal(cat.id, item)}
                                title={t('admin.sizes.duplicateItem')}
                                className="rounded-lg border border-[#dcc090]/35 bg-[#dcc090]/10 px-2 py-1 text-[#122a26] transition-all hover:bg-[#dcc090]/25"
                              >
                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                                  <rect x="7" y="7" width="12" height="12" rx="2" strokeWidth={2} />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15H4a1 1 0 01-1-1V5a1 1 0 011-1h9a1 1 0 011 1v1" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10v6M10 13h6" />
                                </svg>
                              </button>
                              {!item.published && (
                                <button
                                  type="button"
                                  onClick={() => void publishDraftItem(item.id)}
                                  className="rounded-lg bg-[#122a26] px-2.5 py-1 text-xs font-bold text-[#dcc090] transition-all hover:bg-[#18352f]"
                                >
                                  {t('admin.sizes.activateItem')}
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => void deleteItem(item.id)}
                                className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700 transition-all hover:bg-red-100"
                              >
                                {t('admin.sizes.deleteItem')}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <SizeItemModal
        modal={itemModal}
        onClose={() => setItemModal(initialSizeItemModal)}
        onSaved={() => fetchCatalog({ showLoading: false })}
      />
    </div>
  );
}
