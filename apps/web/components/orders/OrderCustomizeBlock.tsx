'use client';

import { useMemo } from 'react';
import { useTranslation } from '@/lib/i18n-client';
import { getCustomizeFontLabelForCssStack } from '@/app/products/[slug]/constants/customize-google-fonts';
import { parseStoredCustomizeForOrderDisplay } from '@/lib/orders/parse-stored-customize-for-order-display';
import { formatPriceInCurrency } from '@/lib/currency';

export type OrderCustomizeBlockProps = {
  customizeHtml?: string | null;
  customizePlain?: string | null;
  sizeCatalogVersion?: string | null;
  sizeCatalogCategoryPriceAmd?: number | null;
  showVersion?: boolean;
  /** Tighter layout for admin order table cells */
  compact?: boolean;
  /** Hide the inner "Customization" title (e.g. when the parent card already has a heading). */
  hideHeading?: boolean;
};

function FormatToggle({
  active,
  letter,
  label,
  compact,
}: {
  active: boolean;
  letter: string;
  label: string;
  compact: boolean;
}) {
  return (
    <span
      className={`inline-flex min-w-[1.75rem] items-center justify-center rounded border font-montserrat ${
        compact ? 'px-2 py-1 text-sm' : 'px-2 py-1 text-xs'
      } ${
        active
          ? 'border-[#dcc090] bg-[#dcc090]/25 font-semibold text-gray-900'
          : 'border-gray-200 bg-white text-gray-400'
      }`}
      aria-label={label}
      title={label}
    >
      {letter}
    </span>
  );
}

export function OrderCustomizeBlock({
  customizeHtml,
  customizePlain,
  sizeCatalogVersion,
  sizeCatalogCategoryPriceAmd,
  showVersion = false,
  compact = false,
  hideHeading = false,
}: OrderCustomizeBlockProps) {
  const { t } = useTranslation();

  const html = customizeHtml?.trim() ?? '';
  const plain = customizePlain?.trim() ?? '';
  const versionValue = sizeCatalogVersion?.trim() || '';
  const collectionPriceAmd =
    typeof sizeCatalogCategoryPriceAmd === 'number' && sizeCatalogCategoryPriceAmd > 0
      ? Math.round(sizeCatalogCategoryPriceAmd)
      : 0;
  const hasRenderableContent = Boolean(
    html || plain || collectionPriceAmd > 0 || (showVersion && versionValue)
  );

  const parsed = useMemo(() => {
    if (!html) {
      return null;
    }
    return parseStoredCustomizeForOrderDisplay(html);
  }, [html]);

  if (!hasRenderableContent) {
    return null;
  }

  const displayText = parsed?.text || plain || '';
  const fontLabel = parsed?.fontStack
    ? getCustomizeFontLabelForCssStack(parsed.fontStack)
    : '';
  const showFontRow = Boolean(html);

  const bold = parsed?.bold ?? false;
  const italic = parsed?.italic ?? false;
  const underline = parsed?.underline ?? false;

  const gap = 'gap-2';
  const labelCls = 'text-xs font-semibold uppercase tracking-wide text-gray-500';
  const valueCls = 'text-sm text-gray-900';
  const fieldLabelCls = compact ? 'text-sm text-gray-500 shrink-0' : 'text-xs text-gray-500 shrink-0';
  const rowCls = 'flex flex-row items-start gap-2';

  return (
    <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
      {!hideHeading ? <p className={labelCls}>{t('orders.itemDetails.customization')}</p> : null}

      <dl className={`flex flex-col ${gap} ${hideHeading ? '' : 'mt-2'}`}>
        <div className={rowCls}>
          <dt className={fieldLabelCls}>{t('orders.itemDetails.customize_text')}</dt>
          <dd className={`${valueCls} min-w-0 flex-1 break-words`}>{displayText || '—'}</dd>
        </div>

        {showFontRow ? (
          <div className={rowCls}>
            <dt className={fieldLabelCls}>{t('orders.itemDetails.customize_font')}</dt>
            <dd className={`${valueCls} min-w-0 flex-1`}>{fontLabel || '—'}</dd>
          </div>
        ) : null}
        {showVersion && versionValue ? (
          <div className={rowCls}>
            <dt className={fieldLabelCls}>{t('orders.itemDetails.version')}</dt>
            <dd className={`${valueCls} min-w-0 flex-1`}>{versionValue}</dd>
          </div>
        ) : null}
        {collectionPriceAmd > 0 ? (
          <div className={rowCls}>
            <dt className={fieldLabelCls}>{t('orders.orderSummary.collectionPrice')}</dt>
            <dd className={`${valueCls} min-w-0 flex-1`}>
              {formatPriceInCurrency(collectionPriceAmd, 'AMD')}
            </dd>
          </div>
        ) : null}

        {html ? (
          <div className={rowCls}>
            <dt className={fieldLabelCls}>{t('orders.itemDetails.customize_style')}</dt>
            <dd className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
              {bold ? (
                <FormatToggle
                  compact={compact}
                  letter="B"
                  active
                  label={t('product.customize_format_bold')}
                />
              ) : null}
              {italic ? (
                <FormatToggle
                  compact={compact}
                  letter="I"
                  active
                  label={t('product.customize_format_italic')}
                />
              ) : null}
              {underline ? (
                <FormatToggle
                  compact={compact}
                  letter="U"
                  active
                  label={t('product.customize_format_underline')}
                />
              ) : null}
              {!bold && !italic && !underline ? <span className={valueCls}>—</span> : null}
            </dd>
          </div>
        ) : null}
      </dl>

      {!compact && html ? (
        <div className={`border-t border-gray-200 pt-2 ${hideHeading ? 'mt-2' : 'mt-3'}`}>
          <p className="text-xs text-gray-500">{t('orders.itemDetails.customize_preview')}</p>
          <div
            className="mt-1 max-w-md text-sm text-gray-900 [&_*]:text-inherit"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      ) : null}
    </div>
  );
}
