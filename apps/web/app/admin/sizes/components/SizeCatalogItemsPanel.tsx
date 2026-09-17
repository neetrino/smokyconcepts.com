'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';

import type { SizeCatalogItemDto } from '@/lib/types/size-catalog';
import { useTranslation } from '@/lib/i18n-client';

interface SizeCatalogItemsPanelProps {
  items: SizeCatalogItemDto[];
  onEdit: (item: SizeCatalogItemDto) => void;
  onDuplicate: (item: SizeCatalogItemDto) => void;
  onPublish: (itemId: string) => void;
  onDelete: (itemId: string) => void;
}

export function SizeCatalogItemsPanel({
  items,
  onEdit,
  onDuplicate,
  onPublish,
  onDelete,
}: SizeCatalogItemsPanelProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return items;
    return items.filter((item) => item.title.toLowerCase().includes(query));
  }, [items, searchQuery]);

  if (items.length === 0) {
    return <p className="text-sm text-[#414141]/45">{t('admin.sizes.noItems')}</p>;
  }

  return (
    <div className="space-y-4">
      <label className="relative block">
        <span className="sr-only">{t('admin.sizes.searchPlaceholder')}</span>
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#414141]/40"
          aria-hidden
        />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('admin.sizes.searchPlaceholder')}
          className="w-full rounded-lg border border-[#dcc090]/35 bg-white py-2.5 pl-10 pr-3 text-sm text-[#122a26] placeholder-[#414141]/30 outline-none transition-all focus:border-[#dcc090] focus:ring-2 focus:ring-[#dcc090]/30"
        />
      </label>

      {filteredItems.length === 0 ? (
        <p className="text-sm text-[#414141]/45">{t('admin.sizes.noSearchResults')}</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <SizeCatalogItemCard
              key={item.id}
              item={item}
              onEdit={() => onEdit(item)}
              onDuplicate={() => onDuplicate(item)}
              onPublish={() => onPublish(item.id)}
              onDelete={() => onDelete(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface SizeCatalogItemCardProps {
  item: SizeCatalogItemDto;
  onEdit: () => void;
  onDuplicate: () => void;
  onPublish: () => void;
  onDelete: () => void;
}

function SizeCatalogItemCard({
  item,
  onEdit,
  onDuplicate,
  onPublish,
  onDelete,
}: SizeCatalogItemCardProps) {
  const { t } = useTranslation();

  return (
    <div
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
        <SizeCatalogItemActions
          published={item.published}
          onEdit={onEdit}
          onDuplicate={onDuplicate}
          onPublish={onPublish}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}

interface SizeCatalogItemActionsProps {
  published: boolean;
  onEdit: () => void;
  onDuplicate: () => void;
  onPublish: () => void;
  onDelete: () => void;
}

function SizeCatalogItemActions({
  published,
  onEdit,
  onDuplicate,
  onPublish,
  onDelete,
}: SizeCatalogItemActionsProps) {
  const { t } = useTranslation();

  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      <button
        type="button"
        onClick={onEdit}
        className="rounded-lg border border-[#dcc090]/35 bg-[#dcc090]/10 px-2.5 py-1 text-xs font-bold text-[#122a26] transition-all hover:bg-[#dcc090]/25"
      >
        {t('admin.sizes.editItem')}
      </button>
      <button
        type="button"
        onClick={onDuplicate}
        title={t('admin.sizes.duplicateItem')}
        className="rounded-lg border border-[#dcc090]/35 bg-[#dcc090]/10 px-2 py-1 text-[#122a26] transition-all hover:bg-[#dcc090]/25"
      >
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <rect x="7" y="7" width="12" height="12" rx="2" strokeWidth={2} />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15H4a1 1 0 01-1-1V5a1 1 0 011-1h9a1 1 0 011 1v1" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10v6M10 13h6" />
        </svg>
      </button>
      {!published && (
        <button
          type="button"
          onClick={onPublish}
          className="rounded-lg bg-[#122a26] px-2.5 py-1 text-xs font-bold text-[#dcc090] transition-all hover:bg-[#18352f]"
        >
          {t('admin.sizes.activateItem')}
        </button>
      )}
      <button
        type="button"
        onClick={onDelete}
        className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700 transition-all hover:bg-red-100"
      >
        {t('admin.sizes.deleteItem')}
      </button>
    </div>
  );
}
