'use client';

import { t } from '../../../lib/i18n';
import type { LanguageCode } from '../../../lib/language';
import type { Product } from './types';
import { CustomizeFormatToolbar } from './CustomizeFormatToolbar';
import type { CustomizeFormatState } from './utils/build-customize-preview-html';
import {
  CUSTOMIZE_FORMAT_INPUT_WRAPPER_CLASS,
  CUSTOMIZE_FORMAT_ROW_CLASS,
  CUSTOMIZE_FORMAT_ROW_SPACER_CLASS,
} from './customize-format.constants';
import {
  PRODUCT_INFO_CUSTOMIZE_COPY_CLASS,
  PRODUCT_INFO_CUSTOMIZE_PANEL_CLASS,
} from './productInfoTabContent.constants';
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
  customizeDraftText: string;
  customizeTextMaxLength: number;
  onCustomizeDraftTextChange: (value: string) => void;
  customizeFormat: CustomizeFormatState;
  onCustomizeFormatChange: (next: CustomizeFormatState) => void;
}

export function ProductInfoTabPanels({
  activeTab,
  language,
  product,
  productDescription,
  productTabHtml,
  shippingTabHtml,
  productDetails,
  customizeDraftText,
  customizeTextMaxLength,
  onCustomizeDraftTextChange,
  customizeFormat,
  onCustomizeFormatChange,
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
      <div className={PRODUCT_INFO_CUSTOMIZE_PANEL_CLASS}>
        <p className={PRODUCT_INFO_CUSTOMIZE_COPY_CLASS}>
          {getCustomizeCopy(language)}
        </p>
        <div className={CUSTOMIZE_FORMAT_ROW_CLASS}>
          <div className={CUSTOMIZE_FORMAT_INPUT_WRAPPER_CLASS}>
            <input
              type="text"
              value={customizeDraftText}
              maxLength={customizeTextMaxLength}
              onChange={(e) => {
                onCustomizeDraftTextChange(e.target.value);
              }}
              className="w-full min-w-0 border-0 border-b border-[#dcc090] bg-transparent pb-0.5 font-montserrat text-[16px] font-medium leading-[26px] text-[#414141] outline-none"
              aria-label={t(language, 'product.customize_title')}
              autoComplete="off"
            />
            <p
              className="mt-1 text-right font-montserrat text-[10px] font-medium leading-none text-[#898989]"
              aria-live="polite"
            >
              {customizeDraftText.length}/ {customizeTextMaxLength}
            </p>
          </div>
          <div className={CUSTOMIZE_FORMAT_ROW_SPACER_CLASS} aria-hidden />
          <CustomizeFormatToolbar
            key={product.id}
            language={language}
            format={customizeFormat}
            onFormatChange={onCustomizeFormatChange}
          />
        </div>
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
