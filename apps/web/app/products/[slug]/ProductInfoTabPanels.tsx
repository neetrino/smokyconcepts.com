'use client';

import { t } from '../../../lib/i18n';
import type { LanguageCode } from '../../../lib/language';
import type { Product } from './types';
import { CustomizeFormatToolbar } from './CustomizeFormatToolbar';
import type { CustomizeFormatState } from './utils/build-customize-preview-html';
import {
  getCustomizeCopy,
  getShippingCopy,
  hasRenderableTabHtml,
  PRODUCT_TAB_HTML_PROSE_CLASS,
} from './utils/productInfoAndActions.helpers';
import type { ProductTabKey } from './productInfoAndActions.types';

export interface ProductInfoTabPanelsProps {
  activeTab: ProductTabKey;
  language: LanguageCode;
  product: Product;
  productDescription: string;
  productTabHtml: string;
  shippingTabHtml: string;
  productDetails: string[];
  appliedCustomize: { plain: string; html: string | null } | null;
  appliedPreviewPlain: string | null;
  customizeDraftText: string;
  customizeTextMaxLength: number;
  onCustomizeDraftTextChange: (value: string) => void;
  customizeFormat: CustomizeFormatState;
  onCustomizeFormatChange: (next: CustomizeFormatState) => void;
  showCustomizeApplyButton: boolean;
  onCustomizeApplyClick: () => void;
  onCustomizeClearApplied: () => void;
}

export function ProductInfoTabPanels({
  activeTab,
  language,
  product,
  productDescription,
  productTabHtml,
  shippingTabHtml,
  productDetails,
  appliedCustomize,
  appliedPreviewPlain,
  customizeDraftText,
  customizeTextMaxLength,
  onCustomizeDraftTextChange,
  customizeFormat,
  onCustomizeFormatChange,
  showCustomizeApplyButton,
  onCustomizeApplyClick,
  onCustomizeClearApplied,
}: ProductInfoTabPanelsProps) {
  if (activeTab === 'description') {
    if (!productDescription) {
      return (
        <p className="text-[15px] leading-[24px] text-[#414141] sm:text-[16px] sm:leading-[26px]">
          {t(language, 'product.description_empty')}
        </p>
      );
    }

    return (
      <div
        className="prose max-w-none text-[15px] leading-[24px] text-[#414141] prose-p:my-0 prose-p:text-[15px] prose-p:leading-[24px] sm:text-[16px] sm:leading-[26px] sm:prose-p:text-[16px] sm:prose-p:leading-[26px]"
        dangerouslySetInnerHTML={{ __html: productDescription }}
      />
    );
  }

  if (activeTab === 'shipping') {
    if (hasRenderableTabHtml(shippingTabHtml)) {
      return (
        <div
          className={PRODUCT_TAB_HTML_PROSE_CLASS}
          dangerouslySetInnerHTML={{ __html: shippingTabHtml }}
        />
      );
    }
    return (
      <p className="text-[15px] leading-[24px] text-[#414141] sm:text-[16px] sm:leading-[26px]">
        {getShippingCopy(language)}
      </p>
    );
  }

  if (activeTab === 'customize') {
    return (
      <div className="flex max-w-[763px] flex-col gap-2.5">
        <p className="text-[15px] leading-[24px] text-[#414141] sm:text-[16px] sm:leading-[26px]">
          {getCustomizeCopy(language)}
        </p>
        <div className="flex max-w-[763px] flex-col gap-3 sm:flex-row sm:items-start sm:gap-12 sm:pb-4">
          <div className="w-full min-w-0 sm:max-w-[291px]">
            <input
              type="text"
              value={customizeDraftText}
              maxLength={customizeTextMaxLength}
              onChange={(e) => {
                onCustomizeDraftTextChange(e.target.value);
              }}
              className="w-full border-0 border-b border-[#dcc090] bg-transparent pb-0.5 font-montserrat text-[18px] font-medium leading-[30px] text-[#414141] outline-none focus:border-[#dcc090] focus-visible:border-[#dcc090] active:border-[#dcc090]"
              aria-label={t(language, 'product.customize_title')}
              autoComplete="off"
            />
            <p
              className="mt-1 text-right font-montserrat text-[10px] font-medium leading-none text-[#898989]"
              aria-live="polite"
            >
              {customizeDraftText.length}/{customizeTextMaxLength}
            </p>
          </div>
          {showCustomizeApplyButton ? (
            <button
              type="button"
              onClick={onCustomizeApplyClick}
              className="h-10 w-full shrink-0 cursor-pointer rounded-md border-2 border-solid border-[#dcc090] bg-transparent font-montserrat text-[18px] font-extrabold uppercase tracking-[1.5px] text-[#dcc090] transition-colors duration-200 hover:bg-[#dcc090]/12 hover:text-[#3a3428] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#dcc090] active:bg-[#dcc090]/20 sm:mt-1 sm:w-[168px]"
            >
              {t(language, 'product.customize_apply')}
            </button>
          ) : null}
        </div>
        {appliedCustomize?.plain ? (
          <button
            type="button"
            onClick={onCustomizeClearApplied}
            className="w-fit font-montserrat text-[13px] font-medium text-[#898989] underline decoration-[#898989] underline-offset-2 transition-colors hover:text-[#414141] hover:decoration-[#414141] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#dcc090]"
          >
            {t(language, 'product.customize_clear_applied')}
          </button>
        ) : null}
        {appliedPreviewPlain ? (
          <div
            className="max-w-[763px] rounded-md border border-[#dcc090]/60 bg-[#faf8f4] px-3 py-2.5 sm:px-4"
            aria-live="polite"
          >
            <p className="font-montserrat text-[11px] font-semibold uppercase tracking-[0.08em] text-[#898989]">
              {t(language, 'product.customize_applied_text_label')}
            </p>
            <p className="mt-1 whitespace-pre-wrap break-words font-montserrat text-[15px] font-medium leading-relaxed text-[#414141] sm:text-[16px]">
              {appliedPreviewPlain}
            </p>
          </div>
        ) : null}
        <p className="max-w-[763px] font-montserrat text-[12px] font-medium leading-snug text-[#898989] sm:text-[13px]">
          {t(language, 'product.customize_apply_cart_hint')}
        </p>
        <CustomizeFormatToolbar
          key={product.id}
          language={language}
          format={customizeFormat}
          onFormatChange={onCustomizeFormatChange}
        />
      </div>
    );
  }

  if (hasRenderableTabHtml(productTabHtml)) {
    return (
      <div
        className={PRODUCT_TAB_HTML_PROSE_CLASS}
        dangerouslySetInnerHTML={{ __html: productTabHtml }}
      />
    );
  }

  if (productDetails.length === 0) {
    return (
      <p className="text-[15px] leading-[24px] text-[#414141] sm:text-[16px] sm:leading-[26px]">
        {t(language, 'product.product_tab_empty')}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {productDetails.map((item) => (
        <p key={item} className="text-[15px] leading-[24px] text-[#414141] sm:text-[16px] sm:leading-[26px]">
          {item}
        </p>
      ))}
    </div>
  );
}
