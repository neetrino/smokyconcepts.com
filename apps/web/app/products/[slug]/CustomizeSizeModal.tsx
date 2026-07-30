'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useSizeModalExitAnimation } from '@/hooks/useSizeModalExitAnimation';
import {
  SIZE_MODAL_BLOCK_ENTER_DELAY_HEADER_MS,
  SIZE_MODAL_BLOCK_ENTER_DELAY_SEARCH_MS,
  SIZE_MODAL_EXIT_DURATION_MS,
  SIZE_MODAL_REDUCED_MOTION_EXIT_MS,
} from '@/lib/size-modal-animation.constants';
import {
  sizeModalBackdropClass,
  sizeModalBlockClass,
  sizeModalBlockEnterStyle,
  sizeModalContentClass,
  sizeModalPanelClass,
} from '@/lib/size-modal-animation';
import { sortSizeCatalogCategoriesByDisplayOrder } from '@/lib/constants/size-catalog-display-order.constants';
import { preloadSizeCatalogCategories } from '@/lib/size-catalog-image-cache';
import { t } from '../../../lib/i18n';
import type { LanguageCode } from '../../../lib/language';
import type { SizeCatalogCategoryDto, SizeCatalogItemDto } from '@/lib/types/size-catalog';
import { SizeCatalogPickerContent } from './SizeCatalogPickerContent';
import {
  CustomizeSizeOrderFallback,
  EMPTY_CUSTOM_ORDER_DRAFT,
  type CustomOrderDraft,
} from './CustomizeSizeOrderFallback';
import { isCustomOrderDraftValid } from './utils/custom-order-validation';
import {
  getCustomSizeOrderSubmitErrorMessage,
  submitCustomSizeOrder,
} from './utils/submit-custom-size-order';

function normalizeSearchQuery(value: string): string {
  return value
    .toLocaleLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function filterSizeCatalogByTitle(
  categories: SizeCatalogCategoryDto[],
  query: string
): SizeCatalogCategoryDto[] {
  const q = normalizeSearchQuery(query);
  if (!q) {
    return categories;
  }
  return categories
    .map((cat) => ({
      ...cat,
      items: cat.items.filter((item) => {
        const normalizedTitle = normalizeSearchQuery(item.title);
        const normalizedCategory = normalizeSearchQuery(cat.title);
        return normalizedTitle.includes(q) || normalizedCategory.includes(q);
      }),
    }))
    .filter((cat) => cat.items.length > 0);
}

interface CustomizeSizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageCode;
  sizeCategories: SizeCatalogCategoryDto[];
  selectedSizeItemId: string | null;
  productId?: string;
  productTitle?: string;
  onSelectSizeCatalogItem: (item: SizeCatalogItemDto) => void;
  onSelectCustomSizeRequest: (draft: CustomOrderDraft) => void;
  isSizeItemSelectable?: (item: SizeCatalogItemDto) => boolean;
}

export function CustomizeSizeModal({
  isOpen,
  onClose,
  language,
  sizeCategories,
  selectedSizeItemId,
  productId,
  productTitle,
  onSelectSizeCatalogItem,
  onSelectCustomSizeRequest,
  isSizeItemSelectable,
}: CustomizeSizeModalProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const exitDurationMs = prefersReducedMotion
    ? SIZE_MODAL_REDUCED_MOTION_EXIT_MS
    : SIZE_MODAL_EXIT_DURATION_MS;
  const { isMounted, isExiting, isEntered } = useSizeModalExitAnimation({
    isOpen,
    exitDurationMs,
  });
  const modalMotion = {
    isEntered,
    isExiting,
    skipEnterAnimation: prefersReducedMotion,
  };
  const titleId = useId();
  const searchInputId = useId();
  const [sizeSearchQuery, setSizeSearchQuery] = useState('');
  const [customOrderDraft, setCustomOrderDraft] = useState<CustomOrderDraft>(EMPTY_CUSTOM_ORDER_DRAFT);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmittingCustomOrder, setIsSubmittingCustomOrder] = useState(false);
  const [customOrderSubmitSuccess, setCustomOrderSubmitSuccess] = useState(false);
  const [customOrderSubmitError, setCustomOrderSubmitError] = useState<string | null>(null);
  const [pendingSizeItem, setPendingSizeItem] = useState<SizeCatalogItemDto | null>(null);

  const filteredSizeCategories = useMemo(
    () =>
      sortSizeCatalogCategoriesByDisplayOrder(
        filterSizeCatalogByTitle(sizeCategories, sizeSearchQuery)
      ),
    [sizeCategories, sizeSearchQuery]
  );

  const hasAnyCatalogItems = useMemo(
    () => sizeCategories.some((c) => c.items.length > 0),
    [sizeCategories]
  );

  const hasFilteredItems = useMemo(
    () => filteredSizeCategories.some((c) => c.items.length > 0),
    [filteredSizeCategories]
  );

  useEffect(() => {
    if (isMounted) {
      return;
    }
    setSizeSearchQuery('');
    setCustomOrderDraft(EMPTY_CUSTOM_ORDER_DRAFT);
    setIsUploadingImage(false);
    setIsSubmittingCustomOrder(false);
    setCustomOrderSubmitSuccess(false);
    setCustomOrderSubmitError(null);
  }, [isMounted]);

  const hasPendingSizeSelection = pendingSizeItem !== null;
  const onSelectSizeCatalogItemRef = useRef(onSelectSizeCatalogItem);
  onSelectSizeCatalogItemRef.current = onSelectSizeCatalogItem;

  useBodyScrollLock(isMounted || hasPendingSizeSelection);

  /**
   * Apply the pick only after the exit animation unmounts the portal.
   * Use a ref for the parent callback so identity churn cannot cancel pending clear
   * (which would leave body scroll locked).
   */
  useEffect(() => {
    if (isMounted || !pendingSizeItem) {
      return;
    }

    const item = pendingSizeItem;
    setPendingSizeItem(null);
    onSelectSizeCatalogItemRef.current(item);
  }, [isMounted, pendingSizeItem]);

  useEffect(() => {
    if (!isMounted) {
      return;
    }
    void preloadSizeCatalogCategories(sizeCategories);
  }, [isMounted, sizeCategories]);

  const handleDismiss = useCallback(() => {
    if (isExiting) {
      return;
    }
    onClose();
  }, [isExiting, onClose]);

  const onEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDismiss();
      }
    },
    [handleDismiss]
  );

  useEffect(() => {
    if (!isMounted) {
      return;
    }
    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [isMounted, onEscape]);

  const handleCustomOrderDraftChange = useCallback(
    (field: keyof CustomOrderDraft, value: string) => {
      setCustomOrderDraft((previous) => ({
        ...previous,
        [field]: value,
      }));
    },
    []
  );

  const handleCustomOrderImageUpload = useCallback(async (file: File) => {
    const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
    if (!allowedTypes.has(file.type)) {
      setCustomOrderSubmitError(t(language, 'product.size_catalog_custom_order_upload_invalid_type'));
      return;
    }

    const maxBytes = 10 * 1024 * 1024;
    if (file.size > maxBytes) {
      setCustomOrderSubmitError(t(language, 'product.size_catalog_custom_order_upload_too_large'));
      return;
    }

    setCustomOrderSubmitError(null);
    setIsUploadingImage(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
            return;
          }
          reject(new Error('Failed to read image'));
        };
        reader.onerror = () => reject(new Error('Failed to read image'));
        reader.readAsDataURL(file);
      });

      setCustomOrderDraft((previous) => ({
        ...previous,
        imageDataUrl: dataUrl,
        imageFileName: file.name,
      }));
    } catch {
      setCustomOrderSubmitError(t(language, 'product.size_catalog_custom_order_upload_failed'));
    } finally {
      setIsUploadingImage(false);
    }
  }, [language]);

  const handleCustomOrderSubmit = useCallback(async (draft: CustomOrderDraft) => {
    if (!isCustomOrderDraftValid(draft)) {
      setCustomOrderSubmitError(t(language, 'product.size_catalog_custom_order_required_fields'));
      return;
    }

    const normalizedDraft: CustomOrderDraft = {
      ...draft,
      name: draft.name.trim(),
      phone: draft.phone.trim(),
      email: draft.email.trim(),
      description: draft.description.trim(),
      imageDataUrl: draft.imageDataUrl.trim(),
      imageFileName: draft.imageFileName.trim(),
    };

    setCustomOrderSubmitError(null);
    setCustomOrderSubmitSuccess(false);
    setIsSubmittingCustomOrder(true);

    try {
      await submitCustomSizeOrder({
        draft: normalizedDraft,
        productId,
        productTitle,
      });
      onSelectCustomSizeRequest(normalizedDraft);
      setCustomOrderSubmitSuccess(true);
      window.setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: unknown) {
      const apiMessage = getCustomSizeOrderSubmitErrorMessage(error);
      setCustomOrderSubmitError(
        apiMessage || t(language, 'product.size_catalog_custom_order_submit_failed')
      );
    } finally {
      setIsSubmittingCustomOrder(false);
    }
  }, [language, onClose, onSelectCustomSizeRequest, productId, productTitle]);

  const handlePickSizeItem = useCallback(
    (item: SizeCatalogItemDto) => {
      if (isSizeItemSelectable && !isSizeItemSelectable(item)) {
        return;
      }
      setPendingSizeItem(item);
      onClose();
    },
    [isSizeItemSelectable, onClose]
  );

  if (!isMounted) {
    return null;
  }

  const canSubmitCustomOrder = isCustomOrderDraftValid(customOrderDraft);

  return createPortal(
    <div
      className={`fixed inset-0 z-[110] ${isExiting ? 'pointer-events-none' : ''}`}
      role="presentation"
    >
      <button
        type="button"
        className={`absolute inset-0 z-0 bg-[rgba(0,0,0,0.6)] ${sizeModalBackdropClass(modalMotion)}`}
        aria-label={t(language, 'product.customize_modal_close_aria')}
        onClick={handleDismiss}
      />
      <div
        className={`absolute inset-y-0 right-0 z-10 flex h-full max-h-dvh w-full flex-col overflow-hidden bg-[#efefef] shadow-[-8px_0_32px_rgba(0,0,0,0.12)] md:w-[min(1078px,56.15vw)] ${sizeModalPanelClass(modalMotion)}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-hidden={isExiting}
      >
        <div className="relative min-h-0 flex-1 overflow-y-auto px-[24px] pb-16 pt-[50px] sm:px-[50px]">
          <div
            className={`flex items-start justify-between gap-4 ${sizeModalBlockClass(modalMotion)}`}
            style={sizeModalBlockEnterStyle(
              SIZE_MODAL_BLOCK_ENTER_DELAY_HEADER_MS,
              modalMotion
            )}
          >
            <h2 id={titleId} className="font-montserrat text-[28px] font-extrabold leading-none text-[#414141] sm:text-[36px]">
              {t(language, 'product.choose_size')}
            </h2>
            <button
              type="button"
              onClick={handleDismiss}
              className="mt-1 flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-sm text-[#414141] transition-opacity hover:opacity-70"
              aria-label={t(language, 'product.customize_modal_close_aria')}
            >
              <img
                src="/assets/product/customize/icon-close.svg"
                alt=""
                width={20}
                height={20}
                className="h-5 w-5 shrink-0"
              />
            </button>
          </div>

          {hasAnyCatalogItems ? (
            <div
              className={`mt-6 w-full max-w-[978px] ${sizeModalBlockClass(modalMotion)}`}
              style={sizeModalBlockEnterStyle(
                SIZE_MODAL_BLOCK_ENTER_DELAY_SEARCH_MS,
                modalMotion
              )}
            >
              <label htmlFor={searchInputId} className="sr-only">
                {t(language, 'product.size_catalog_search_placeholder')}
              </label>
              <input
                id={searchInputId}
                type="search"
                value={sizeSearchQuery}
                onChange={(e) => setSizeSearchQuery(e.target.value)}
                placeholder={t(language, 'product.size_catalog_search_placeholder')}
                autoComplete="off"
                className="h-11 w-full rounded-[6px] border-0 bg-white px-4 font-montserrat text-[15px] font-medium text-[#414141] shadow-[0px_4px_22.5px_rgba(0,0,0,0.1)] outline-none placeholder:text-[#9d9d9d] focus-visible:ring-2 focus-visible:ring-[#dcc090]/40 sm:text-[16px]"
              />
            </div>
          ) : null}

          <div className={`mt-10 ${sizeModalContentClass(modalMotion)}`}>
            {hasAnyCatalogItems && !hasFilteredItems && sizeSearchQuery.trim().length > 0 ? (
              <CustomizeSizeOrderFallback
                  language={language}
                  draft={customOrderDraft}
                  onDraftChange={handleCustomOrderDraftChange}
                  onUploadImage={handleCustomOrderImageUpload}
                  onSubmit={handleCustomOrderSubmit}
                  isUploadingImage={isUploadingImage}
                  isSubmitting={isSubmittingCustomOrder}
                  submitSuccess={customOrderSubmitSuccess}
                  submitError={customOrderSubmitError}
                  canSubmit={canSubmitCustomOrder}
              />
            ) : (
              <SizeCatalogPickerContent
                categories={filteredSizeCategories}
                selectedItemId={selectedSizeItemId}
                language={language}
                modalMotion={modalMotion}
                suppressEnterAnimation={isExiting}
                onSelectItem={handlePickSizeItem}
                isItemSelectable={isSizeItemSelectable}
              />
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
