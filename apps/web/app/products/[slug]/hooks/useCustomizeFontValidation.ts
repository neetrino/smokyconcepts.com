'use client';

import { useCallback, useEffect, useState } from 'react';

import type { CustomizeFormatState } from '../utils/build-customize-preview-html';

interface UseCustomizeFontValidationParams {
  productId: string;
  /** Plain line input of the customize tab. */
  customizeDraftText: string;
  customizeFormat: CustomizeFormatState;
  /** Opens the customize tab so the invalid font control becomes visible. */
  onFocusCustomizeTab: () => void;
}

export interface CustomizeFontValidationState {
  /** Customize joins the order only when the line input has text — then the font is mandatory. */
  isCustomizeFontRequired: boolean;
  isCustomizeFontMissing: boolean;
  showCustomizeFontRequired: boolean;
  isCustomizeFontShaking: boolean;
  triggerCustomizeFontValidation: () => void;
  handleCustomizeFontShakeAnimationEnd: () => void;
}

/** Blocks add-to-cart until a customize font is picked for entered customize text. */
export function useCustomizeFontValidation({
  productId,
  customizeDraftText,
  customizeFormat,
  onFocusCustomizeTab,
}: UseCustomizeFontValidationParams): CustomizeFontValidationState {
  const [showCustomizeFontRequired, setShowCustomizeFontRequired] = useState(false);
  const [isCustomizeFontShaking, setIsCustomizeFontShaking] = useState(false);

  const isCustomizeFontRequired = customizeDraftText.trim().length > 0;
  const isCustomizeFontMissing = isCustomizeFontRequired && customizeFormat.fontStack === null;

  useEffect(() => {
    setShowCustomizeFontRequired(false);
    setIsCustomizeFontShaking(false);
  }, [productId]);

  useEffect(() => {
    if (isCustomizeFontMissing) {
      return;
    }
    setShowCustomizeFontRequired(false);
    setIsCustomizeFontShaking(false);
  }, [isCustomizeFontMissing]);

  const triggerCustomizeFontValidation = useCallback(() => {
    onFocusCustomizeTab();
    setShowCustomizeFontRequired(true);
    setIsCustomizeFontShaking(false);
    requestAnimationFrame(() => {
      setIsCustomizeFontShaking(true);
    });
  }, [onFocusCustomizeTab]);

  const handleCustomizeFontShakeAnimationEnd = useCallback(() => {
    setIsCustomizeFontShaking(false);
  }, []);

  return {
    isCustomizeFontRequired,
    isCustomizeFontMissing,
    showCustomizeFontRequired,
    isCustomizeFontShaking,
    triggerCustomizeFontValidation,
    handleCustomizeFontShakeAnimationEnd,
  };
}
