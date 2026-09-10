'use client';

import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { t } from '../../../lib/i18n';
import type { LanguageCode } from '../../../lib/language';
import { CustomizeFormatToolbar } from './CustomizeFormatToolbar';
import {
  CUSTOMIZE_HERO_PREVIEW_ASSETS,
  CUSTOMIZE_HERO_PREVIEW_BODY_CLASS,
  CUSTOMIZE_HERO_PREVIEW_FRAME_CLASS,
  CUSTOMIZE_HERO_PREVIEW_FRAME_STYLE,
  CUSTOMIZE_HERO_PREVIEW_INNER_STYLE,
  CUSTOMIZE_HERO_PREVIEW_TEXT_CLASS,
} from './customize-tab-preview.constants';
import {
  CUSTOMIZE_TEXT_MODAL_BACKDROP_CLASS,
  CUSTOMIZE_TEXT_MODAL_CLOSE_CLASS,
  CUSTOMIZE_TEXT_MODAL_INPUT_CLASS,
  CUSTOMIZE_TEXT_MODAL_PANEL_CLASS,
  CUSTOMIZE_TEXT_MODAL_PREVIEW_ASPECT_STYLE,
  CUSTOMIZE_TEXT_MODAL_PREVIEW_TEXT_STYLE,
  CUSTOMIZE_TEXT_MODAL_PREVIEW_WRAP_CLASS,
  CUSTOMIZE_TEXT_MODAL_PRODUCT_IMAGE_CLASS,
  CUSTOMIZE_TEXT_MODAL_SAVE_CLASS,
  CUSTOMIZE_TEXT_MODAL_TITLE_CLASS,
  CUSTOMIZE_TEXT_MODAL_Z_INDEX_CLASS,
} from './customize-text-modal.constants';
import {
  CUSTOMIZE_FONT_REQUIRED_HINT_CLASS,
  CUSTOMIZE_FORMAT_INPUT_WRAPPER_CLASS,
  CUSTOMIZE_FORMAT_ROW_CLASS,
  CUSTOMIZE_FORMAT_TOOLBAR_COLUMN_CLASS,
} from './customize-format.constants';
import {
  buildCustomizePreviewHtml,
  getCustomizeInputStyle,
  type CustomizeFormatState,
} from './utils/build-customize-preview-html';

export interface CustomizeTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageCode;
  initialText: string;
  initialFormat: CustomizeFormatState;
  textMaxLength: number;
  onSave: (text: string, format: CustomizeFormatState) => void;
  /** When true, open already showing font-required validation. */
  forceFontValidation?: boolean;
}

export function CustomizeTextModal({
  isOpen,
  onClose,
  language,
  initialText,
  initialFormat,
  textMaxLength,
  onSave,
  forceFontValidation = false,
}: CustomizeTextModalProps) {
  const titleId = useId();
  const [draftText, setDraftText] = useState(initialText);
  const [draftFormat, setDraftFormat] = useState<CustomizeFormatState>(initialFormat);
  const [showFontRequired, setShowFontRequired] = useState(false);
  const [isFontShaking, setIsFontShaking] = useState(false);

  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setDraftText(initialText);
    setDraftFormat(initialFormat);
    setShowFontRequired(forceFontValidation);
    setIsFontShaking(false);
    if (forceFontValidation) {
      requestAnimationFrame(() => {
        setIsFontShaking(true);
      });
    }
  }, [forceFontValidation, initialFormat, initialText, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const previewHtml = useMemo(() => {
    if (!draftText.trim()) {
      return '';
    }
    return buildCustomizePreviewHtml(draftText, draftFormat);
  }, [draftFormat, draftText]);

  const isFontRequired = draftText.trim().length > 0;
  const isFontMissing = isFontRequired && draftFormat.fontStack === null;

  const handleFontShakeAnimationEnd = useCallback(() => {
    setIsFontShaking(false);
  }, []);

  const handleSave = useCallback(() => {
    if (isFontMissing) {
      setShowFontRequired(true);
      setIsFontShaking(false);
      requestAnimationFrame(() => {
        setIsFontShaking(true);
      });
      return;
    }
    onSave(draftText, draftFormat);
    onClose();
  }, [draftFormat, draftText, isFontMissing, onClose, onSave]);

  if (!isOpen || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div
      className={`fixed inset-0 ${CUSTOMIZE_TEXT_MODAL_Z_INDEX_CLASS} flex items-center justify-center p-4`}
      role="presentation"
    >
      <button
        type="button"
        className={CUSTOMIZE_TEXT_MODAL_BACKDROP_CLASS}
        aria-label={t(language, 'product.customize_modal_close_aria')}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={CUSTOMIZE_TEXT_MODAL_PANEL_CLASS}
      >
        <div className="relative flex items-center justify-center">
          <h2 id={titleId} className={CUSTOMIZE_TEXT_MODAL_TITLE_CLASS}>
            {t(language, 'product.customize_popup_title')}
          </h2>
          <button
            type="button"
            className={CUSTOMIZE_TEXT_MODAL_CLOSE_CLASS}
            aria-label={t(language, 'product.customize_modal_close_aria')}
            onClick={onClose}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <img
          src={CUSTOMIZE_HERO_PREVIEW_ASSETS.productBadgeSrc}
          alt=""
          decoding="async"
          draggable={false}
          aria-hidden
          className={`${CUSTOMIZE_TEXT_MODAL_PRODUCT_IMAGE_CLASS} object-contain`}
        />

        <div className={CUSTOMIZE_TEXT_MODAL_PREVIEW_WRAP_CLASS} aria-live="polite">
          <div className="relative w-full" style={CUSTOMIZE_TEXT_MODAL_PREVIEW_ASPECT_STYLE}>
            <div
              className={CUSTOMIZE_HERO_PREVIEW_FRAME_CLASS}
              style={CUSTOMIZE_HERO_PREVIEW_FRAME_STYLE}
              aria-hidden
            />
            <div
              className={CUSTOMIZE_HERO_PREVIEW_BODY_CLASS}
              style={CUSTOMIZE_HERO_PREVIEW_INNER_STYLE}
            >
              {previewHtml ? (
                <div
                  className={CUSTOMIZE_HERO_PREVIEW_TEXT_CLASS}
                  style={CUSTOMIZE_TEXT_MODAL_PREVIEW_TEXT_STYLE}
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-4">
          <div className={CUSTOMIZE_FORMAT_INPUT_WRAPPER_CLASS}>
            <input
              type="text"
              value={draftText}
              maxLength={textMaxLength}
              onChange={(event) => {
                setDraftText(event.target.value);
                if (event.target.value.trim().length === 0) {
                  setShowFontRequired(false);
                  setIsFontShaking(false);
                }
              }}
              placeholder={t(language, 'product.customize_text_placeholder')}
              className={CUSTOMIZE_TEXT_MODAL_INPUT_CLASS}
              style={getCustomizeInputStyle(draftFormat)}
              aria-label={t(language, 'product.customize_title')}
              autoComplete="off"
            />
            <p
              className="mt-1 text-right font-montserrat text-[10px] font-medium leading-none text-[#898989]"
              aria-live="polite"
            >
              {draftText.length}/ {textMaxLength}
            </p>
          </div>

          <div className={CUSTOMIZE_FORMAT_ROW_CLASS}>
            <div className={CUSTOMIZE_FORMAT_TOOLBAR_COLUMN_CLASS}>
              <CustomizeFormatToolbar
                language={language}
                format={draftFormat}
                onFormatChange={(next) => {
                  setDraftFormat(next);
                  if (next.fontStack !== null) {
                    setShowFontRequired(false);
                    setIsFontShaking(false);
                  }
                }}
                isFontRequired={isFontRequired}
                isFontInvalid={showFontRequired}
                isFontShaking={isFontShaking}
                onFontShakeAnimationEnd={handleFontShakeAnimationEnd}
              />
              {showFontRequired ? (
                <p className={CUSTOMIZE_FONT_REQUIRED_HINT_CLASS} role="alert">
                  {t(language, 'product.customize_font_required')}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <button type="button" className={CUSTOMIZE_TEXT_MODAL_SAVE_CLASS} onClick={handleSave}>
          {t(language, 'product.customize_popup_save')}
        </button>
      </div>
    </div>,
    document.body
  );
}
