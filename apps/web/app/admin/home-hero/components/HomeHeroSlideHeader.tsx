'use client';

import { ChevronRight } from 'lucide-react';

import { useTranslation } from '@/lib/i18n-client';

interface HomeHeroSlideHeaderProps {
  index: number;
  isExpanded: boolean;
  slidesCount: number;
  previewTitle: string;
  panelId: string;
  onToggle: () => void;
  onRemove: () => void;
  onDragStart: (index: number) => void;
  onDragEnd: () => void;
}

export function HomeHeroSlideHeader({
  index,
  isExpanded,
  slidesCount,
  previewTitle,
  panelId,
  onToggle,
  onRemove,
  onDragStart,
  onDragEnd,
}: HomeHeroSlideHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div
        role="button"
        tabIndex={0}
        draggable
        title={t('admin.homeHero.dragToSort')}
        aria-label={t('admin.homeHero.dragToSort')}
        className="flex h-8 w-6 shrink-0 cursor-grab items-center justify-center rounded text-[#414141]/45 transition-colors hover:bg-[#dcc090]/20 hover:text-[#122a26] active:cursor-grabbing"
        onDragStart={(event) => {
          event.dataTransfer.effectAllowed = 'move';
          event.dataTransfer.setData('text/plain', String(index));
          onDragStart(index);
        }}
        onDragEnd={onDragEnd}
      >
        <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
          <circle cx="5" cy="3.5" r="1.25" />
          <circle cx="11" cy="3.5" r="1.25" />
          <circle cx="5" cy="8" r="1.25" />
          <circle cx="11" cy="8" r="1.25" />
          <circle cx="5" cy="12.5" r="1.25" />
          <circle cx="11" cy="12.5" r="1.25" />
        </svg>
      </div>
      <button
        type="button"
        onClick={onToggle}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#dcc090]/35 bg-[#dcc090]/10 text-[#122a26] transition-all hover:bg-[#dcc090]/25"
        aria-expanded={isExpanded}
        aria-controls={panelId}
        aria-label={isExpanded ? t('admin.homeHero.collapseSlide') : t('admin.homeHero.expandSlide')}
      >
        <ChevronRight
          className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
          aria-hidden
        />
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <h2 className="text-sm font-black uppercase tracking-[0.08em] text-[#122a26]">
              {t('admin.homeHero.slideLabel').replace('{n}', String(index + 1))}
            </h2>
            {!isExpanded && previewTitle ? (
              <p className="truncate text-xs text-[#414141]/55">{previewTitle}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onRemove}
            disabled={slidesCount <= 1}
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 transition-all hover:bg-red-100 hover:border-red-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t('admin.homeHero.removeSlide')}
          </button>
        </div>
      </div>
    </div>
  );
}
