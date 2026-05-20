'use client';

import { OrderCustomizeBlock } from '@/components/orders/OrderCustomizeBlock';
import { useTranslation } from '../../../../lib/i18n-client';
import { resolveShippingCountryLabel } from '../../../../lib/shipping-address-display';
import { Card } from '@shop/ui';
import type { OrderDetails } from '../useOrders';

interface OrderDetailsAddressesProps {
  orderDetails: OrderDetails;
}

const CUSTOM_SIZE_ORDER_NOTE_MARKER = 'CUSTOM_SIZE_REQUEST';

function getCustomSizeDescription(notes: string | null | undefined): string | null {
  if (!notes || notes.trim() === '') {
    return null;
  }
  try {
    const parsed = JSON.parse(notes) as { marker?: string; description?: string };
    if (parsed.marker !== CUSTOM_SIZE_ORDER_NOTE_MARKER) {
      return null;
    }
    const description = parsed.description?.trim() ?? '';
    return description !== '' ? description : null;
  } catch {
    return null;
  }
}

function sanitizeFileNamePart(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function buildExportFileName(imageUrl: string, productTitle: string): string {
  const urlWithoutQuery = imageUrl.split('?')[0] || imageUrl;
  const extension = urlWithoutQuery.split('.').pop()?.toLowerCase() || 'jpg';
  const baseName = sanitizeFileNamePart(productTitle) || 'custom-size-image';
  return `${baseName}.${extension}`;
}

async function exportCustomizeImage(imageUrl: string, productTitle: string): Promise<void> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error('failed_to_download');
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = buildExportFileName(imageUrl, productTitle);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);
  } catch {
    window.open(imageUrl, '_blank', 'noopener,noreferrer');
  }
}

export function OrderDetailsAddresses({ orderDetails }: OrderDetailsAddressesProps) {
  const { t } = useTranslation();
  const customSizeDescription = getCustomSizeDescription(orderDetails.notes);
  const shippingCountry = resolveShippingCountryLabel(orderDetails.shippingAddress);

  const itemsWithCustomize = orderDetails.items.filter((item) => {
    const hasCustomizeText = Boolean(item.customizeHtml?.trim() || item.customizePlain?.trim());
    const hasVersion = Boolean(item.sizeCatalogVersion?.trim());
    const hasSizeImage = Boolean(item.sizeCatalogImageUrl?.trim());
    const hasCollectionPrice =
      typeof item.sizeCatalogCategoryPriceAmd === 'number' && item.sizeCatalogCategoryPriceAmd > 0;
    return hasCustomizeText || hasVersion || hasSizeImage || hasCollectionPrice;
  });
  const hasCustomizeContent = itemsWithCustomize.length > 0 || customSizeDescription !== null;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="p-4 md:p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">{t('admin.orders.orderDetails.shippingAddress')}</h3>
        {orderDetails.shippingMethod === 'pickup' ? (
          <div className="text-sm text-gray-700 space-y-1">
            <div>
              <span className="font-medium">{t('admin.orders.orderDetails.shippingMethod')}</span>{' '}
              {t('admin.orders.orderDetails.pickup')}
            </div>
          </div>
        ) : orderDetails.shippingMethod === 'delivery' && orderDetails.shippingAddress ? (
          <div className="text-sm text-gray-700 space-y-1">
            <div className="mb-2">
              <span className="font-medium">{t('admin.orders.orderDetails.shippingMethod')}</span>{' '}
              {t('checkout.shipping.delivery')}
            </div>
            {shippingCountry && (
              <div>
                <span className="font-medium">{t('checkout.form.country')}:</span> {shippingCountry}
              </div>
            )}
            {orderDetails.shippingAddress.state && (
              <div>
                <span className="font-medium">{t('checkout.form.region')}:</span>{' '}
                {orderDetails.shippingAddress.state}
              </div>
            )}
            {orderDetails.shippingAddress.city && (
              <div>
                <span className="font-medium">{t('checkout.form.city')}:</span> {orderDetails.shippingAddress.city}
              </div>
            )}
            {(orderDetails.shippingAddress.address || orderDetails.shippingAddress.addressLine1) && (
              <div>
                <span className="font-medium">{t('checkout.form.address')}:</span>{' '}
                {orderDetails.shippingAddress.address || orderDetails.shippingAddress.addressLine1}
                {orderDetails.shippingAddress.addressLine2 && `, ${orderDetails.shippingAddress.addressLine2}`}
              </div>
            )}
            {orderDetails.shippingAddress.postalCode && (
              <div>
                <span className="font-medium">{t('checkout.form.postalCode')}:</span> {orderDetails.shippingAddress.postalCode}
              </div>
            )}
            {(orderDetails.shippingAddress.phone || orderDetails.shippingAddress.shippingPhone) && (
              <div className="mt-2">
                <span className="font-medium">{t('checkout.form.phoneNumber')}:</span>{' '}
                {orderDetails.shippingAddress.phone || orderDetails.shippingAddress.shippingPhone}
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-gray-500">
            <p>{t('admin.orders.orderDetails.noShippingAddress')}</p>
            {orderDetails.shippingMethod && (
              <p>
                {t('admin.orders.orderDetails.shippingMethod')}{' '}
                {orderDetails.shippingMethod === 'pickup'
                  ? t('admin.orders.orderDetails.pickup')
                  : orderDetails.shippingMethod === 'delivery'
                  ? t('checkout.shipping.delivery')
                  : orderDetails.shippingMethod}
              </p>
            )}
          </div>
        )}
      </Card>

      <Card className="p-4 md:p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">{t('admin.orders.orderDetails.customer')}</h3>
        <div className="text-sm text-gray-700 space-y-1">
          <div>
            {(orderDetails.customer?.firstName || '') +
              (orderDetails.customer?.lastName ? ` ${orderDetails.customer.lastName}` : '') ||
              t('admin.orders.unknownCustomer')}
          </div>
          {(orderDetails.customerPhone || orderDetails.shippingAddress?.phone || orderDetails.shippingAddress?.shippingPhone) && (
            <div>
              {orderDetails.customerPhone || orderDetails.shippingAddress?.phone || orderDetails.shippingAddress?.shippingPhone}
            </div>
          )}
          {orderDetails.customerEmail && <div>{orderDetails.customerEmail}</div>}
        </div>
      </Card>

      <Card className="p-4 md:p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">
          {t('admin.orders.orderDetails.customize')}
        </h3>
        {!hasCustomizeContent ? (
          <p className="text-sm text-gray-500">{t('admin.orders.orderDetails.noCustomize')}</p>
        ) : (
          <div className="space-y-4">
            {customSizeDescription ? (
              <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {t('admin.orders.orderDetails.description')}
                </p>
                <p className="mt-2 whitespace-pre-wrap break-words text-sm text-gray-900">
                  {customSizeDescription}
                </p>
              </div>
            ) : null}
            {itemsWithCustomize.map((item) => {
              const imageUrl = item.sizeCatalogImageUrl?.trim() || null;
              const imageAlt = item.sizeCatalogTitle || item.productTitle;
              const exportBaseName = item.productTitle || 'custom-size-image';

              return (
                <div key={item.id} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                  <p className="mb-2 text-sm font-medium text-gray-600">
                    {item.productTitle}
                    <span className="text-gray-400"> × {item.quantity}</span>
                  </p>
                  {imageUrl ? (
                    <div className="mb-3">
                      <button
                        type="button"
                        onClick={() => exportCustomizeImage(imageUrl, exportBaseName)}
                        title={t('admin.orders.orderDetails.exportImage')}
                        className="rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
                      >
                        <img
                          src={imageUrl}
                          alt={imageAlt}
                          className="h-28 w-28 cursor-pointer rounded-md border border-gray-200 object-cover"
                          loading="lazy"
                        />
                      </button>
                    </div>
                  ) : null}
                  <OrderCustomizeBlock
                    compact
                    hideHeading
                    customizeHtml={item.customizeHtml}
                    customizePlain={item.customizePlain}
                    sizeCatalogVersion={item.sizeCatalogVersion}
                    sizeCatalogCategoryPriceAmd={item.sizeCatalogCategoryPriceAmd}
                    showVersion
                  />
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}


