'use client';

import { formatAdminCatalogPrice } from '@/lib/currency';
import { useTranslation } from '../../../../lib/i18n-client';

export interface Product {
  id: string;
  title: string;
  image?: string;
  price?: number;
  discountPercent?: number;
}

interface ProductDiscountsCardProps {
  products: Product[];
  productsLoading: boolean;
  productDiscounts: Record<string, number>;
  setProductDiscounts: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  handleProductDiscountSave: (productId: string) => void;
  savingProductId: string | null;
}

export function ProductDiscountsCard({
  products,
  productsLoading,
  productDiscounts,
  setProductDiscounts,
  handleProductDiscountSave,
  savingProductId,
}: ProductDiscountsCardProps) {
  const { t } = useTranslation();

  const formatPrice = (price: number) => formatAdminCatalogPrice(price);

  return (
    <div className="overflow-hidden rounded-2xl border border-[#dcc090]/30 bg-white/90 shadow-[0_8px_30px_rgba(18,42,38,0.06)]">
      <div className="border-b border-[#dcc090]/20 bg-[#122a26] px-6 py-4">
        <h2 className="text-base font-black uppercase tracking-[0.1em] text-[#dcc090]">
          {t('admin.quickSettings.productDiscounts')}
        </h2>
        <p className="mt-0.5 text-xs text-[#dcc090]/55">
          {t('admin.quickSettings.productDiscountsSubtitle')}
        </p>
      </div>

      <div className="p-5">
        {productsLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#122a26] mb-4" />
            <p className="text-sm text-[#414141]/70">{t('admin.quickSettings.loadingProducts')}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="py-8 text-center text-sm text-[#414141]/70">
            {t('admin.quickSettings.noProducts')}
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((product) => {
              const currentDiscount = Number(productDiscounts[product.id] ?? product.discountPercent ?? 0);
              const originalPrice = product.price || 0;
              const discountedPrice =
                currentDiscount > 0 && originalPrice > 0
                  ? Math.round(originalPrice * (1 - currentDiscount / 100))
                  : originalPrice;

              return (
                <div
                  key={product.id}
                  className="flex items-center gap-4 rounded-xl border border-[#dcc090]/25 bg-white px-4 py-3 transition-colors hover:bg-[#dcc090]/10"
                >
                  {product.image && (
                    <div className="flex-shrink-0">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="h-14 w-14 rounded-lg object-cover border border-[#dcc090]/20"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-[#122a26] truncate">{product.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {currentDiscount > 0 && originalPrice > 0 ? (
                        <>
                          <span className="text-xs font-semibold text-[#122a26]">
                            {formatPrice(discountedPrice)}
                          </span>
                          <span className="text-xs text-[#414141]/45 line-through">
                            {formatPrice(originalPrice)}
                          </span>
                          <span className="text-xs font-medium text-red-600">
                            -{currentDiscount}%
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-[#414141]/60">
                          {originalPrice > 0 ? formatPrice(originalPrice) : 'N/A'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={productDiscounts[product.id] ?? product.discountPercent ?? 0}
                      onChange={(e) => {
                        const value = e.target.value;
                        const discountValue = value === '' ? 0 : parseFloat(value) || 0;
                        setProductDiscounts((prev) => ({ ...prev, [product.id]: discountValue }));
                      }}
                      placeholder="0"
                      className="w-20 rounded-lg border border-[#dcc090]/35 bg-white px-3 py-2 text-sm text-[#122a26] placeholder-[#414141]/30 outline-none transition-all focus:border-[#dcc090] focus:ring-2 focus:ring-[#dcc090]/30"
                    />
                    <span className="text-sm font-medium text-[#414141]/75 w-6">%</span>
                    <button
                      type="button"
                      onClick={() => handleProductDiscountSave(product.id)}
                      disabled={savingProductId === product.id}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#122a26] px-4 py-2 text-sm font-bold text-[#dcc090] shadow-[0_4px_14px_rgba(18,42,38,0.18)] transition-all hover:bg-[#18352f] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {savingProductId === product.id ? (
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-b-2 border-[#dcc090]" />
                      ) : (
                        t('admin.quickSettings.save')
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
