'use client';

import { useCallback, useEffect, useState } from 'react';
import { t } from '../../../lib/i18n';
import type { LanguageCode } from '../../../lib/language';
import type { Product } from './types';
import { CustomizeFormatToolbar } from './CustomizeFormatToolbar';
import { CustomizeTextModal } from './CustomizeTextModal';
import {
  getCustomizeInputStyle,
  type CustomizeFormatState,
} from './utils/build-customize-preview-html';
import {
  CUSTOMIZE_FONT_REQUIRED_HINT_CLASS,
  CUSTOMIZE_FORMAT_INPUT_WRAPPER_CLASS,
  CUSTOMIZE_FORMAT_ROW_CLASS,
  CUSTOMIZE_FORMAT_ROW_SPACER_CLASS,
  CUSTOMIZE_FORMAT_TOOLBAR_COLUMN_CLASS,
} from './customize-format.constants';
import {
  PRODUCT_INFO_CUSTOMIZE_CTA_CLASS,
  PRODUCT_INFO_CUSTOMIZE_DESKTOP_COPY_CLASS,
  PRODUCT_INFO_CUSTOMIZE_EDITOR_CLASS,
  PRODUCT_INFO_CUSTOMIZE_HEADING_CLASS,
  PRODUCT_INFO_CUSTOMIZE_INTRO_CLASS,
  PRODUCT_INFO_CUSTOMIZE_PANEL_CLASS,
  PRODUCT_INFO_CUSTOMIZE_SAVED_TEXT_CLASS,
  PRODUCT_INFO_CUSTOMIZE_TEASER_CLASS,
} from './productInfoTabContent.constants';
import {
  getShippingCopy,
  hasRenderableTabHtml,
  normalizeProductTabHtmlForDisplay,
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
  /** Font pick is mandatory once customize text is entered. */
  isCustomizeFontRequired: boolean;
  showCustomizeFontRequired: boolean;
  isCustomizeFontShaking: boolean;
  onCustomizeFontShakeAnimationEnd: () => void;
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
  isCustomizeFontRequired,
  showCustomizeFontRequired,
  isCustomizeFontShaking,
  onCustomizeFontShakeAnimationEnd,
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
      <CustomizeTabPanel
        language={language}
        product={product}
        customizeDraftText={customizeDraftText}
        customizeTextMaxLength={customizeTextMaxLength}
        onCustomizeDraftTextChange={onCustomizeDraftTextChange}
        customizeFormat={customizeFormat}
        onCustomizeFormatChange={onCustomizeFormatChange}
        isCustomizeFontRequired={isCustomizeFontRequired}
        showCustomizeFontRequired={showCustomizeFontRequired}
        isCustomizeFontShaking={isCustomizeFontShaking}
        onCustomizeFontShakeAnimationEnd={onCustomizeFontShakeAnimationEnd}
      />
    );
  }

  if (hasRenderableTabHtml(productTabHtml)) {
    return (
      <div
        className={PRODUCT_TAB_HTML_PROSE_CLASS}
        dangerouslySetInnerHTML={{ __html: normalizeProductTabHtmlForDisplay(productTabHtml) }}
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

interface CustomizeTabPanelProps {
  language: LanguageCode;
  product: Product;
  customizeDraftText: string;
  customizeTextMaxLength: number;
  onCustomizeDraftTextChange: (value: string) => void;
  customizeFormat: CustomizeFormatState;
  onCustomizeFormatChange: (next: CustomizeFormatState) => void;
  isCustomizeFontRequired: boolean;
  showCustomizeFontRequired: boolean;
  isCustomizeFontShaking: boolean;
  onCustomizeFontShakeAnimationEnd: () => void;
}

function CustomizeTabPanel({
  language,
  product,
  customizeDraftText,
  customizeTextMaxLength,
  onCustomizeDraftTextChange,
  customizeFormat,
  onCustomizeFormatChange,
  isCustomizeFontRequired,
  showCustomizeFontRequired,
  isCustomizeFontShaking,
  onCustomizeFontShakeAnimationEnd,
}: CustomizeTabPanelProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!showCustomizeFontRequired || typeof window === 'undefined') {
      return;
    }
    const isMobileViewport = window.matchMedia('(max-width: 639px)').matches;
    if (isMobileViewport) {
      setIsModalOpen(true);
    }
  }, [showCustomizeFontRequired]);

  const handleSave = useCallback(
    (text: string, format: CustomizeFormatState) => {
      onCustomizeDraftTextChange(text);
      onCustomizeFormatChange(format);
    },
    [onCustomizeDraftTextChange, onCustomizeFormatChange]
  );

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const savedText = customizeDraftText.trim();
  const hasSavedText = savedText.length > 0;

  return (
    <div className={PRODUCT_INFO_CUSTOMIZE_PANEL_CLASS}>
      <div className={PRODUCT_INFO_CUSTOMIZE_TEASER_CLASS}>
        <h3 className={PRODUCT_INFO_CUSTOMIZE_HEADING_CLASS}>
          {t(language, 'product.customize_heading')}
        </h3>
        <p className={PRODUCT_INFO_CUSTOMIZE_INTRO_CLASS}>
          {t(language, 'product.customize_intro')}
        </p>
        {hasSavedText ? (
          <p
            className={PRODUCT_INFO_CUSTOMIZE_SAVED_TEXT_CLASS}
            style={getCustomizeInputStyle(customizeFormat)}
          >
            {savedText}
          </p>
        ) : null}
        <button
          type="button"
          className={PRODUCT_INFO_CUSTOMIZE_CTA_CLASS}
          onClick={() => setIsModalOpen(true)}
        >
          {t(language, 'product.customize_cta')}
        </button>
      </div>

      <div className={`${PRODUCT_INFO_CUSTOMIZE_EDITOR_CLASS} hidden sm:flex`}>
        <div className={PRODUCT_INFO_CUSTOMIZE_DESKTOP_COPY_CLASS}>
          <h3 className={PRODUCT_INFO_CUSTOMIZE_HEADING_CLASS}>
            {t(language, 'product.customize_heading')}
          </h3>
          <p className={PRODUCT_INFO_CUSTOMIZE_INTRO_CLASS}>
            {t(language, 'product.customize_intro')}
          </p>
        </div>

        <div className={CUSTOMIZE_FORMAT_ROW_CLASS}>
          <div className={CUSTOMIZE_FORMAT_INPUT_WRAPPER_CLASS}>
            <input
              type="text"
              value={customizeDraftText}
              maxLength={customizeTextMaxLength}
              onChange={(e) => {
                onCustomizeDraftTextChange(e.target.value);
              }}
              placeholder={t(language, 'product.customize_text_placeholder')}
              className="w-full min-w-0 border-0 border-b border-[#dcc090] bg-transparent pb-0.5 text-[16px] leading-[26px] text-[#414141] outline-none placeholder:text-[#898989]"
              style={getCustomizeInputStyle(customizeFormat)}
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
          <div className={CUSTOMIZE_FORMAT_TOOLBAR_COLUMN_CLASS}>
            <CustomizeFormatToolbar
              key={product.id}
              language={language}
              format={customizeFormat}
              onFormatChange={onCustomizeFormatChange}
              isFontRequired={isCustomizeFontRequired}
              isFontInvalid={showCustomizeFontRequired}
              isFontShaking={isCustomizeFontShaking}
              onFontShakeAnimationEnd={onCustomizeFontShakeAnimationEnd}
            />
            {showCustomizeFontRequired ? (
              <p className={CUSTOMIZE_FONT_REQUIRED_HINT_CLASS} role="alert">
                {t(language, 'product.customize_font_required')}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <CustomizeTextModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        language={language}
        initialText={customizeDraftText}
        initialFormat={customizeFormat}
        textMaxLength={customizeTextMaxLength}
        onSave={handleSave}
        forceFontValidation={showCustomizeFontRequired}
      />
    </div>
  );
}
