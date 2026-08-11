'use client';

import { useEffect, useState } from 'react';
import { Button } from '@shop/ui';
import { useTranslation } from '../../../../lib/i18n-client';

export interface NewDeliveryLocationDraft {
  country: string;
  city: string;
  price: number;
  freeDeliveryFromAmd: number;
}

interface AddDeliveryLocationDrawerProps {
  isOpen: boolean;
  saving: boolean;
  onClose: () => void;
  onConfirm: (location: NewDeliveryLocationDraft) => void;
}

const DRAWER_ENTER_FRAME_MS = 16 as const;
const DEFAULT_DELIVERY_PRICE_AMD = 1000 as const;
const DEFAULT_FREE_DELIVERY_FROM_AMD = 0 as const;

const EMPTY_DRAFT: NewDeliveryLocationDraft = {
  country: '',
  city: '',
  price: DEFAULT_DELIVERY_PRICE_AMD,
  freeDeliveryFromAmd: DEFAULT_FREE_DELIVERY_FROM_AMD,
};

export function AddDeliveryLocationDrawer({
  isOpen,
  saving,
  onClose,
  onConfirm,
}: AddDeliveryLocationDrawerProps) {
  const { t } = useTranslation();
  const [isEntered, setIsEntered] = useState(false);
  const [draft, setDraft] = useState<NewDeliveryLocationDraft>(EMPTY_DRAFT);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setIsEntered(false);
      setDraft(EMPTY_DRAFT);
      setValidationError(null);
      return undefined;
    }
    const frameId = window.setTimeout(() => setIsEntered(true), DRAWER_ENTER_FRAME_MS);
    return () => window.clearTimeout(frameId);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const updateField = <K extends keyof NewDeliveryLocationDraft>(
    field: K,
    value: NewDeliveryLocationDraft[K],
  ) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
    setValidationError(null);
  };

  const handleConfirm = () => {
    const country = draft.country.trim();
    const city = draft.city.trim();
    if (!country || !city) {
      setValidationError(t('admin.delivery.addLocationValidation'));
      return;
    }
    onConfirm({
      country,
      city,
      price: Math.max(0, draft.price),
      freeDeliveryFromAmd: Math.max(0, draft.freeDeliveryFromAmd),
    });
  };

  return (
    <div className="fixed inset-0 z-50" role="presentation">
      <button
        type="button"
        aria-label={t('admin.delivery.close')}
        className={`absolute inset-0 z-0 bg-black/50 transition-opacity duration-200 ${
          isEntered ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      <aside
        className={`absolute inset-y-0 right-0 z-10 flex h-full max-h-dvh w-1/2 min-w-[18rem] transform flex-col overflow-hidden bg-white shadow-[-8px_0_32px_rgba(18,42,38,0.16)] transition-transform duration-200 ease-out ${
          isEntered ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-delivery-location-drawer-title"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#dcc090]/30 px-6 py-5">
          <h2
            id="add-delivery-location-drawer-title"
            className="text-xl font-bold text-[#122a26]"
          >
            {t('admin.delivery.addLocation')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[#414141]/50 transition-colors hover:text-[#122a26]"
            aria-label={t('admin.delivery.close')}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-[#414141]/75">
              {t('admin.delivery.country')}
            </label>
            <input
              type="text"
              value={draft.country}
              onChange={(e) => updateField('country', e.target.value)}
              className="w-full rounded-md border border-[#dcc090]/35 px-3 py-2 focus:border-[#dcc090] focus:outline-none focus:ring-2 focus:ring-[#dcc090]"
              placeholder={t('admin.delivery.countryPlaceholder')}
              autoFocus
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#414141]/75">
              {t('admin.delivery.city')}
            </label>
            <input
              type="text"
              value={draft.city}
              onChange={(e) => updateField('city', e.target.value)}
              className="w-full rounded-md border border-[#dcc090]/35 px-3 py-2 focus:border-[#dcc090] focus:outline-none focus:ring-2 focus:ring-[#dcc090]"
              placeholder={t('admin.delivery.cityPlaceholder')}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#414141]/75">
              {t('admin.delivery.price')}
            </label>
            <input
              type="number"
              value={draft.price}
              onChange={(e) => updateField('price', parseFloat(e.target.value) || 0)}
              className="w-full rounded-md border border-[#dcc090]/35 px-3 py-2 focus:border-[#dcc090] focus:outline-none focus:ring-2 focus:ring-[#dcc090]"
              placeholder={t('admin.delivery.pricePlaceholder')}
              min="0"
              step="100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#414141]/75">
              {t('admin.delivery.freeDeliveryFromAmd')}
            </label>
            <input
              type="number"
              value={draft.freeDeliveryFromAmd}
              onChange={(e) =>
                updateField('freeDeliveryFromAmd', Math.max(0, parseFloat(e.target.value) || 0))
              }
              className="w-full rounded-md border border-[#dcc090]/35 px-3 py-2 focus:border-[#dcc090] focus:outline-none focus:ring-2 focus:ring-[#dcc090]"
              placeholder={t('admin.delivery.freeDeliveryFromAmdPlaceholder')}
              min="0"
              step="1000"
            />
            <p className="mt-1 text-xs text-[#414141]/60">
              {t('admin.delivery.freeDeliveryFromAmdHint')}
            </p>
          </div>
          {validationError ? (
            <p className="text-sm text-red-600" role="alert">
              {validationError}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 gap-3 border-t border-[#dcc090]/30 px-6 py-4">
          <Button variant="primary" onClick={handleConfirm} disabled={saving}>
            {t('admin.delivery.confirmAddLocation')}
          </Button>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            {t('admin.delivery.cancel')}
          </Button>
        </div>
      </aside>
    </div>
  );
}
