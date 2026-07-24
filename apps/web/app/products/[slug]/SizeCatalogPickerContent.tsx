'use client';

import { t } from '../../../lib/i18n';
import type { LanguageCode } from '../../../lib/language';
import type { SizeCatalogCategoryDto, SizeCatalogItemDto } from '@/lib/types/size-catalog';
import type { SizeModalMotionState } from '@/lib/size-modal-animation';
import { sizeModalBlockClass, sizeModalBlockEnterStyle } from '@/lib/size-modal-animation';
import { SIZE_MODAL_BLOCK_ENTER_DELAY_BODY_MS } from '@/lib/size-modal-animation.constants';
import { CatalogCategorySizeBand } from './SizeCatalogCategoryBand';
import {
  SIZE_CARD_STAGGER_BASE_MS,
  SIZE_CATALOG_CATEGORY_SECTION_STEP_MS,
} from './sizeCatalogPicker.constants';

interface SizeCatalogPickerContentProps {
  categories: SizeCatalogCategoryDto[];
  selectedItemId: string | null;
  language: LanguageCode;
  modalMotion: SizeModalMotionState;
  suppressEnterAnimation?: boolean;
  onSelectItem: (item: SizeCatalogItemDto) => void;
  isItemSelectable?: (item: SizeCatalogItemDto) => boolean;
}

export function SizeCatalogPickerContent({
  categories,
  selectedItemId,
  language,
  modalMotion,
  suppressEnterAnimation = false,
  onSelectItem,
  isItemSelectable,
}: SizeCatalogPickerContentProps) {
  const hasAny = categories.some((c) => c.items.length > 0);

  if (!hasAny) {
    return (
      <p
        className={`font-montserrat text-[16px] font-medium text-[#414141] ${sizeModalBlockClass(modalMotion)}`}
        style={sizeModalBlockEnterStyle(SIZE_MODAL_BLOCK_ENTER_DELAY_BODY_MS, modalMotion)}
      >
        {t(language, 'product.size_catalog_empty')}
      </p>
    );
  }

  let nonEmptyCategoryIndex = 0;

  return (
    <div className="space-y-[50px] pb-8">
      {categories.map((category) => {
        if (category.items.length === 0) {
          return null;
        }
        const sectionHeadingDelayMs =
          SIZE_CARD_STAGGER_BASE_MS +
          nonEmptyCategoryIndex * SIZE_CATALOG_CATEGORY_SECTION_STEP_MS -
          40;
        nonEmptyCategoryIndex += 1;
        return (
          <CatalogCategorySizeBand
            key={category.id}
            category={category}
            selectedItemId={selectedItemId}
            language={language}
            modalMotion={modalMotion}
            suppressEnterAnimation={suppressEnterAnimation}
            onSelectItem={onSelectItem}
            isItemSelectable={isItemSelectable}
            sectionHeadingDelayMs={sectionHeadingDelayMs}
          />
        );
      })}
    </div>
  );
}
