'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import { formatCatalogPrice } from '../../../lib/currency';
import { t, getProductText } from '../../../lib/i18n';
import type { LanguageCode } from '../../../lib/language';
import { Button } from '../../../components/ui/buttons';
import type { AttributeGroupValue, Product, ProductVariant } from './types';
import { normalizeHexPalette, parseHexFromText } from './utils/swatch-color-utils';

const CATALOG_BAG_ICON_PATH = '/assets/home/icons/bag-catalog.svg';

type ProductTabKey = 'description' | 'details' | 'shipping';

interface ProductOptionValue extends AttributeGroupValue {
  colors?: string[] | string | null;
}

/**
 * PDP actions — add/buy handlers are wired to `useProductCartActions` on the parent page
 * (fast snapshot + optional POST, no extra GET before add).
 */
interface ProductInfoAndActionsProps {
  product: Product;
  price: number;
  originalPrice: number | null;
  compareAtPrice: number | null;
  discountPercent: number | null;
  language: LanguageCode;
  isOutOfStock: boolean;
  canAddToCart: boolean;
  isAddingToCart: boolean;
  showMessage: string | null;
  currentVariant: ProductVariant | null;
  selectedColor: string | null;
  selectedSize: string | null;
  colorOptions: ProductOptionValue[];
  sizeOptions: ProductOptionValue[];
  onColorSelect: (color: string) => void;
  onSizeSelect: (size: string) => void;
  /** Quick add (e.g. bag icon) — stay on page. */
  onAddToCart: () => Promise<void>;
  /** Primary CTA — add line then continue to checkout. */
  onBuyNow: () => Promise<void>;
}

const COLOR_SWATCH_FALLBACKS: Record<string, string[]> = {
  black: ['#1d1d1f'],
  green: ['#516349'],
  'forest green': ['#516349'],
  red: ['#7a2c34'],
  'deep red': ['#7a2c34'],
  gold: ['#b3ae78'],
  brown: ['#703d02'],
  white: ['#ffffff'],
  beige: ['#dcc090'],
};

function getSwatchColors(option: ProductOptionValue): string[] {
  const fromApi = normalizeHexPalette(option.colors);
  if (fromApi.length > 0) {
    return fromApi;
  }

  const fromValue = parseHexFromText(option.value);
  if (fromValue) {
    return [fromValue];
  }

  const fromLabel = parseHexFromText(option.label);
  if (fromLabel) {
    return [fromLabel];
  }

  return (
    COLOR_SWATCH_FALLBACKS[option.label.toLowerCase()] ??
    COLOR_SWATCH_FALLBACKS[option.value.toLowerCase()] ??
    ['#dcc090']
  );
}

function getShippingCopy(language: LanguageCode): string {
  switch (language) {
    case 'hy':
      return 'Առաքման արժեքն ու վերջնական ժամկետները հաշվարկվում են պատվերի ձևակերպման ժամանակ` ըստ հասցեի և ընտրված եղանակի։';
    case 'ru':
      return 'Стоимость и сроки доставки рассчитываются на этапе оформления заказа в зависимости от адреса и выбранного способа.';
    default:
      return 'Shipping cost and delivery timing are calculated at checkout based on destination and the selected method.';
  }
}

export function ProductInfoAndActions({
  product,
  price,
  originalPrice,
  compareAtPrice,
  discountPercent,
  language,
  isOutOfStock,
  canAddToCart,
  isAddingToCart,
  showMessage,
  currentVariant,
  selectedColor,
  selectedSize,
  colorOptions,
  sizeOptions,
  onColorSelect,
  onSizeSelect,
  onAddToCart,
  onBuyNow,
}: ProductInfoAndActionsProps) {
  const [activeTab, setActiveTab] = useState<ProductTabKey>('description');
  const [isSizeMenuOpen, setIsSizeMenuOpen] = useState(false);
  const productTitle = getProductText(language, product.id, 'title') || product.title;
  const productDescription =
    getProductText(language, product.id, 'longDescription') || product.description || '';
  const activeColorOption = useMemo(
    () =>
      colorOptions.find(
        (option) => option.value === selectedColor || option.label.toLowerCase() === selectedColor
      ) ?? null,
    [colorOptions, selectedColor]
  );
  const activeSizeOption = useMemo(
    () =>
      sizeOptions.find(
        (option) => option.value === selectedSize || option.label.toLowerCase() === selectedSize
      ) ?? null,
    [selectedSize, sizeOptions]
  );
  const productBadge = product.labels?.[0]?.value || product.categories?.[0]?.title || null;
  const productDetails = [
    product.brand?.name ?? null,
    activeColorOption ? `${t(language, 'product.color')}: ${activeColorOption.label}` : null,
    activeSizeOption ? `${t(language, 'product.size')}: ${activeSizeOption.label}` : null,
    currentVariant?.sku ? `SKU: ${currentVariant.sku}` : null,
  ].filter(Boolean) as string[];

  const renderedTabContent = useMemo(() => {
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
      return (
        <p className="text-[15px] leading-[24px] text-[#414141] sm:text-[16px] sm:leading-[26px]">
          {getShippingCopy(language)}
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
  }, [activeTab, language, productDescription, productDetails]);

  return (
    <div className="max-w-[763px] pt-1 xl:pt-36 2xl:pt-40">
      <h1 className="font-montserrat text-[26px] font-black leading-tight text-[#414141] sm:text-[30px]">
        {productTitle}
      </h1>

      {productBadge && (
        <div className="mt-3 inline-flex h-[18px] items-center rounded-[6px] bg-[#122a26] px-[7px] text-[12px] font-medium leading-none text-white">
          {productBadge}
        </div>
      )}

      {colorOptions.length > 0 && (
        <div className="mt-8">
          <p className="font-montserrat text-[18px] font-extrabold leading-none text-[#414141]">
            {t(language, 'product.color')}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {colorOptions.map((option) => {
              const isActive =
                option.value === selectedColor || option.label.toLowerCase() === selectedColor;
              const swatches = getSwatchColors(option);

              return (
                <button
                  key={option.valueId || option.value}
                  type="button"
                  onClick={() => onColorSelect(option.value)}
                  className={`relative rounded-[6px] transition-transform hover:scale-[1.02] ${
                    isActive
                      ? 'flex h-[34px] w-[34px] items-center justify-center bg-white shadow-[0_2px_8px_rgba(0,0,0,0.12)]'
                      : 'h-[22px] w-[22px]'
                  }`}
                  aria-label={option.label}
                >
                  <span
                    className={`block rounded-[5px] ${isActive ? 'h-[28px] w-[28px]' : 'h-[22px] w-[22px]'}`}
                    style={{
                      background:
                        swatches.length > 1
                          ? `linear-gradient(135deg, ${swatches.join(', ')})`
                          : swatches[0],
                    }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {sizeOptions.length > 0 && (
        <div className="relative mt-6">
          <p className="font-montserrat text-[18px] font-extrabold leading-none text-[#414141]">
            {t(language, 'product.size')}
          </p>
          <button
            type="button"
            onClick={() => setIsSizeMenuOpen((prev) => !prev)}
            className="mt-3 inline-flex min-h-9 min-w-[140px] max-w-full items-center justify-between gap-2 rounded-[6px] bg-[#dcc090] px-3 py-2 text-left text-[16px] font-medium uppercase tracking-[0.08em] text-[#122a26] sm:min-w-[160px]"
          >
            <span>{activeSizeOption?.label || t(language, 'product.choose_size')}</span>
            <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${isSizeMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isSizeMenuOpen && (
            <div className="absolute left-0 top-full z-10 mt-2 min-w-[140px] max-w-[min(100vw-2rem,220px)] rounded-[8px] bg-white p-1.5 shadow-[0_12px_28px_rgba(18,42,38,0.12)] sm:min-w-[160px]">
              {sizeOptions.map((option) => {
                const isActive =
                  option.value === selectedSize || option.label.toLowerCase() === selectedSize;

                return (
                  <button
                    key={option.valueId || option.value}
                    type="button"
                    onClick={() => {
                      onSizeSelect(option.value);
                      setIsSizeMenuOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-[6px] px-2.5 py-1.5 text-left text-[14px] font-medium ${
                      isActive ? 'bg-[#122a26] text-white' : 'text-[#414141] hover:bg-[#f4f1e8]'
                    }`}
                  >
                    <span>{option.label}</span>
                    {option.stock <= 0 && (
                      <span className="text-[12px] uppercase">{t(language, 'product.outOfStockLabel')}</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="mt-12">
        <div className="flex flex-wrap items-end gap-6 sm:gap-8">
          <button
            type="button"
            onClick={() => setActiveTab('description')}
            className={`relative pb-3 font-montserrat text-[17px] font-extrabold leading-none sm:text-[19px] ${
              activeTab === 'description' ? 'text-[#414141]' : 'text-[#414141]/70'
            }`}
          >
            {t(language, 'product.description_title')}
            {activeTab === 'description' && (
              <span className="absolute bottom-0 left-0 h-0.5 w-[72px] rounded-[2px] bg-[#122a26] sm:w-[80px]" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`relative pb-3 font-montserrat text-[17px] font-extrabold leading-none sm:text-[19px] ${
              activeTab === 'details' ? 'text-[#414141]' : 'text-[#414141]/70'
            }`}
          >
            {t(language, 'product.details_title')}
            {activeTab === 'details' && (
              <span className="absolute bottom-0 left-0 h-0.5 w-[72px] rounded-[2px] bg-[#122a26] sm:w-[80px]" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('shipping')}
            className={`relative pb-3 font-montserrat text-[17px] font-extrabold leading-none sm:text-[19px] ${
              activeTab === 'shipping' ? 'text-[#414141]' : 'text-[#414141]/70'
            }`}
          >
            {t(language, 'product.shipping_title')}
            {activeTab === 'shipping' && (
              <span className="absolute bottom-0 left-0 h-0.5 w-[72px] rounded-[2px] bg-[#122a26] sm:w-[80px]" />
            )}
          </button>
        </div>

        <div className="pt-6 sm:pt-7">{renderedTabContent}</div>
      </div>

      <div className="mt-[48px] flex flex-wrap items-center gap-4">
        <div className="flex items-end gap-3">
          <p className="font-montserrat text-[30px] font-extrabold leading-none text-black sm:text-[32px]">
            {formatCatalogPrice(price)}
          </p>
          {(originalPrice || (compareAtPrice && compareAtPrice > price)) && (
            <p className="pb-0.5 text-[15px] leading-none text-[#9d9d9d] line-through sm:text-[16px]">
              {formatCatalogPrice(originalPrice || compareAtPrice || 0)}
            </p>
          )}
          {discountPercent && discountPercent > 0 && (
            <span className="rounded-[6px] bg-[#122a26] px-2 py-1 text-[12px] font-medium text-white">
              -{discountPercent}%
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <Button
            type="button"
            disabled={!canAddToCart || isAddingToCart}
            onClick={() => {
              void onBuyNow();
            }}
            className="h-10 rounded-[8px] !bg-[#dcc090] px-4 text-[56px] font-bold capitalize tracking-normal !text-[#122a26] hover:!bg-[#d3b67f] sm:px-5 sm:text-[20px]"
          >
            {isAddingToCart
              ? t(language, 'product.adding')
              : isOutOfStock
                ? t(language, 'product.outOfStock')
                : t(language, 'product.buy_now')}
          </Button>

          <button
            type="button"
            onClick={() => {
              void onAddToCart();
            }}
            disabled={!canAddToCart || isAddingToCart}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] text-[#dcc090] transition-colors hover:bg-[#dcc090]/10 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={t(language, 'product.addToCart')}
          >
            {isAddingToCart ? (
              <svg
                className="h-7 w-7 animate-spin text-[#dcc090]"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <Image
                src={CATALOG_BAG_ICON_PATH}
                alt=""
                width={40}
                height={40}
                className="h-8 w-[40px] object-contain"
                aria-hidden
              />
            )}
          </button>
        </div>
      </div>

      {showMessage && (
        <div className="mt-6 rounded-[12px] bg-[#122a26] px-4 py-3 text-sm font-medium text-white shadow-[0_10px_30px_rgba(18,42,38,0.12)]">
          {showMessage}
        </div>
      )}
    </div>
  );
}



