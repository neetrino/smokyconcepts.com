'use client';

import { OrderCustomizeBlock } from '@/components/orders/OrderCustomizeBlock';
import { useCurrency } from '../../../../components/hooks/useCurrency';
import { useTranslation } from '../../../../lib/i18n-client';
import { amountToUsd, convertPrice, formatPriceInCurrency } from '../../../../lib/currency';
import { isInternalVariantAttributeKey } from '@/lib/default-pricing-variant';
import { getColorValue } from '../utils/color-helpers';
import type { OrderItem as OrderItemType } from '../types';

interface OrderItemProps {
  item: OrderItemType;
  orderTotalsCurrency: string;
}

export function OrderItem({ item, orderTotalsCurrency }: OrderItemProps) {
  const { t } = useTranslation();
  const displayCurrency = useCurrency();
  const formatOrderMoneyUsd = (amountUsd: number) =>
    formatPriceInCurrency(convertPrice(amountUsd, 'USD', displayCurrency), displayCurrency);

  const allOptions = item.variantOptions || [];
  const getAttributeType = (key: string): 'category' | 'size' | 'color' | 'other' => {
    const normalizedKey = key.toLowerCase().trim();
    if (normalizedKey === '__size_catalog_category_title__' || normalizedKey === 'category') return 'category';
    if (normalizedKey === 'size') return 'size';
    if (normalizedKey === 'color' || normalizedKey === 'colour') return 'color';
    return 'other';
  };
  const getOptionPriority = (key: string): number => {
    const attributeType = getAttributeType(key);
    if (attributeType === 'category') return 0;
    if (attributeType === 'size') return 1;
    if (attributeType === 'color') return 2;
    return 3;
  };
  const orderedOptions = [...allOptions].sort(
    (left, right) => getOptionPriority(left.attributeKey || '') - getOptionPriority(right.attributeKey || ''),
  );

  const getAttributeLabel = (key: string): string => {
    const normalizedKey = key.toLowerCase().trim();
    const attributeType = getAttributeType(normalizedKey);
    if (attributeType === 'color') return t('orders.itemDetails.color');
    if (attributeType === 'size') return t('orders.itemDetails.size');
    if (attributeType === 'category') return t('orders.itemDetails.category');
    if (normalizedKey === '__default_pricing__') return t('orders.itemDetails.default_pricing');
    if (normalizedKey === '__size_catalog_category_id__') return t('orders.itemDetails.size_catalog_category_id');
    return key.charAt(0).toUpperCase() + key.slice(1);
  };

  const getColorsArray = (colors: unknown): string[] => {
    if (!colors) return [];
    if (Array.isArray(colors)) return colors;
    if (typeof colors === 'string') {
      try {
        const parsed = JSON.parse(colors);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  const priceUsd = amountToUsd(item.price, orderTotalsCurrency);
  const itemPriceDisplay = formatOrderMoneyUsd(priceUsd);

  return (
    <div className="flex gap-4 pb-4 border-b border-gray-200 last:border-0">
      {item.imageUrl && (
        <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
          <img
            src={item.imageUrl}
            alt={item.productTitle}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.productTitle}</h3>

        {allOptions.length > 0 && (
          <div className="mt-2 mb-2 flex flex-col gap-1">
            {orderedOptions.map((opt, optIndex) => {
              if (!opt.attributeKey || !opt.value) return null;
              const normalizedAttributeKey = opt.attributeKey.toLowerCase().trim();
              if (isInternalVariantAttributeKey(normalizedAttributeKey)) return null;

              const isColor = getAttributeType(normalizedAttributeKey) === 'color';
              const displayLabel = opt.label || opt.value;
              const hasImage = opt.imageUrl && opt.imageUrl.trim() !== '';
              const colors = getColorsArray(opt.colors);
              const colorHex = colors.length > 0 ? colors[0] : (isColor ? getColorValue(opt.value) : null);

              return (
                <div key={optIndex} className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    {getAttributeLabel(opt.attributeKey)}:
                  </span>
                  <div className="flex items-center gap-2">
                    {hasImage ? (
                      <img
                        src={opt.imageUrl!}
                        alt={displayLabel}
                        className="w-6 h-6 rounded border border-gray-300 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : isColor && colorHex ? (
                      <div
                        className="w-5 h-5 rounded-full border border-gray-300"
                        style={{ backgroundColor: colorHex }}
                        title={displayLabel}
                      />
                    ) : null}
                    <span className="text-sm text-gray-900 capitalize">{displayLabel}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {(item.customizeHtml?.trim() ||
          item.customizePlain?.trim() ||
          (typeof item.sizeCatalogCategoryPriceAmd === 'number' &&
            item.sizeCatalogCategoryPriceAmd > 0)) && (
          <div className="mt-3">
            <OrderCustomizeBlock
              customizeHtml={item.customizeHtml}
              customizePlain={item.customizePlain}
              sizeCatalogCategoryPriceAmd={item.sizeCatalogCategoryPriceAmd}
            />
          </div>
        )}

        <p className="text-sm text-gray-600">{t('orders.itemDetails.sku').replace('{sku}', item.sku)}</p>
        <p className="text-sm text-gray-600 mt-2">
          {t('orders.itemDetails.quantity').replace('{price}', itemPriceDisplay)}
        </p>
      </div>
    </div>
  );
}
