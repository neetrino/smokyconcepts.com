'use client';

import { useCurrency } from '../../../components/hooks/useCurrency';
import { Button } from '../../../components/ui/buttons';
import { formatCatalogPrice } from '../../../lib/currency';
import { t } from '../../../lib/i18n';
import type { LanguageCode } from '../../../lib/language';
import type { ProductPreviewSnapshot } from '../../../lib/product-preview-cache';
import { PRODUCT_SECTION_BADGE_CLASS_NAMES } from '../components/catalogProductLabels';
import {
  PRODUCT_INFO_ADD_TO_CART_BUTTON_CLASS,
  PRODUCT_INFO_BADGE_BASE_CLASS,
  PRODUCT_INFO_BADGE_ROW_CLASS,
  PRODUCT_INFO_FIRST_SECTION_SPACING_CLASS,
  PRODUCT_INFO_FIRST_SECTION_SPACING_WITH_BADGES_CLASS,
  PRODUCT_INFO_HEADER_CLASS,
  PRODUCT_INFO_PRICE_CLASS,
  PRODUCT_INFO_PURCHASE_ROW_CLASS,
  PRODUCT_INFO_PURCHASE_ROW_LAYOUT_CLASS,
  PRODUCT_INFO_ROOT_CLASS,
  PRODUCT_INFO_SCROLL_BODY_CLASS,
  PRODUCT_INFO_SECTION_LABEL_CLASS,
  PRODUCT_INFO_SIZE_BUTTON_CLASS,
  PRODUCT_INFO_SIZE_SECTION_CLASS,
  PRODUCT_INFO_TAB_INDICATOR_BASE_CLASS,
  PRODUCT_INFO_TAB_KEYS,
  PRODUCT_INFO_TAB_LABEL_KEYS,
  PRODUCT_INFO_TAB_PANEL_CLASS,
  PRODUCT_INFO_TABLIST_CLASS,
  PRODUCT_INFO_TABS_SCROLLER_CLASS,
  PRODUCT_INFO_TABS_SECTION_CLASS,
  PRODUCT_INFO_TITLE_CLASS,
  getProductTabLabelClass,
} from './productInfoTabContent.constants';
import { SKELETON_PULSE_CLASS } from './productPageShell.constants';

/** The tab that {@link ProductInfoAndActionsView} opens with. */
const PREVIEW_ACTIVE_TAB = PRODUCT_INFO_TAB_KEYS[0];

interface ProductPagePreviewInfoProps {
  snapshot: ProductPreviewSnapshot;
  language: LanguageCode;
}

/** Size picker chrome — identical for every product, so it renders for real. */
function PreviewSizeSection({
  language,
  spacingClass,
}: {
  language: LanguageCode;
  spacingClass: string;
}) {
  return (
    <div className={`${PRODUCT_INFO_SIZE_SECTION_CLASS} ${spacingClass}`}>
      <p className={PRODUCT_INFO_SECTION_LABEL_CLASS}>
        {t(language, 'product.size')}
        <span className="relative z-10 ml-1 text-red-600" aria-hidden>
          *
        </span>
      </p>
      <button type="button" disabled className={PRODUCT_INFO_SIZE_BUTTON_CLASS}>
        <span className="truncate">{t(language, 'product.choose_size')}</span>
      </button>
    </div>
  );
}

/** Tab rail with the real labels; only the panel body is still unknown. */
function PreviewTabs({ language }: { language: LanguageCode }) {
  const tabLabelClass = getProductTabLabelClass(language);

  return (
    <div className={PRODUCT_INFO_TABS_SECTION_CLASS}>
      <div className={PRODUCT_INFO_TABS_SCROLLER_CLASS}>
        <div className={PRODUCT_INFO_TABLIST_CLASS}>
          {PRODUCT_INFO_TAB_KEYS.map((tabKey) => {
            const isActive = tabKey === PREVIEW_ACTIVE_TAB;
            return (
              <button
                key={tabKey}
                type="button"
                disabled
                className={`relative shrink-0 snap-start whitespace-nowrap ${tabLabelClass} ${
                  isActive ? 'text-[#414141]' : 'text-[#414141]/70'
                }`}
              >
                {t(language, PRODUCT_INFO_TAB_LABEL_KEYS[tabKey])}
                <span
                  className={`${PRODUCT_INFO_TAB_INDICATOR_BASE_CLASS} ${
                    isActive ? 'bg-[#122a26]' : 'bg-transparent'
                  }`}
                  aria-hidden
                />
              </button>
            );
          })}
        </div>
      </div>

      <div className={PRODUCT_INFO_TAB_PANEL_CLASS}>
        <div className={`size-full ${SKELETON_PULSE_CLASS}`} aria-hidden />
      </div>
    </div>
  );
}

/**
 * Info column of the instant PDP shell: real title, collection badge, size picker,
 * tab rail and price from the card snapshot; only the tab copy is a placeholder.
 */
export function ProductPagePreviewInfo({ snapshot, language }: ProductPagePreviewInfoProps) {
  const displayCurrency = useCurrency();
  const collectionLabel = snapshot.categoryLabel.trim();
  const collectionBadgeClass =
    PRODUCT_SECTION_BADGE_CLASS_NAMES[snapshot.sectionLabel] ??
    PRODUCT_SECTION_BADGE_CLASS_NAMES.Classic;
  const sizeSpacingClass = collectionLabel
    ? PRODUCT_INFO_FIRST_SECTION_SPACING_WITH_BADGES_CLASS
    : PRODUCT_INFO_FIRST_SECTION_SPACING_CLASS;

  return (
    <div className={PRODUCT_INFO_ROOT_CLASS}>
      <div className={PRODUCT_INFO_HEADER_CLASS}>
        <h1 className={PRODUCT_INFO_TITLE_CLASS}>{snapshot.title}</h1>
        {collectionLabel ? (
          <div className={PRODUCT_INFO_BADGE_ROW_CLASS}>
            <span className={`${PRODUCT_INFO_BADGE_BASE_CLASS} ${collectionBadgeClass}`}>
              {collectionLabel}
            </span>
          </div>
        ) : null}
        <PreviewSizeSection language={language} spacingClass={sizeSpacingClass} />
      </div>

      <div className={PRODUCT_INFO_SCROLL_BODY_CLASS}>
        <PreviewTabs language={language} />

        <div className={`${PRODUCT_INFO_PURCHASE_ROW_LAYOUT_CLASS} ${PRODUCT_INFO_PURCHASE_ROW_CLASS}`}>
          <p className={PRODUCT_INFO_PRICE_CLASS}>
            {formatCatalogPrice(snapshot.price, displayCurrency)}
          </p>
          <Button type="button" disabled className={PRODUCT_INFO_ADD_TO_CART_BUTTON_CLASS}>
            {snapshot.inStock ? t(language, 'product.addToCart') : t(language, 'product.outOfStock')}
          </Button>
        </div>
      </div>
    </div>
  );
}
