'use client';

import { useState, useEffect } from 'react';
import { getStoredLanguage, type LanguageCode } from '../lib/language';
import { t } from '../lib/i18n';
import { useRelatedProducts } from './hooks/useRelatedProducts';
import { ProductsCatalogCard } from '../app/products/components/ProductsCatalogCard';
import {
  CATALOG_SECTION_PAGE_SIZE,
  getCategoryLabel,
  getSectionLabel,
  getSizeLabel,
  shouldNudgeCatalogProductImage,
  toCatalogProduct,
} from '../app/products/components/catalogProductLabels';

interface RelatedProductsProps {
  categorySlug?: string;
  currentProductId: string;
}

/** Same strip as products catalog (non-filtered): horizontal scroll row, `gap-7`. */
const CATALOG_ROW_SCROLL_CLASS = 'scrollbar-hide mt-4 overflow-x-auto pt-10 pb-4';
const CATALOG_ROW_FLEX_CLASS = 'flex min-w-max gap-7';

/**
 * Related products on the PDP — same card row spacing as the products catalog page.
 */
export function RelatedProducts({ categorySlug, currentProductId }: RelatedProductsProps) {
  const [language, setLanguage] = useState<LanguageCode>('en');
  const { products, loading } = useRelatedProducts({ categorySlug, currentProductId, language });

  useEffect(() => {
    setLanguage(getStoredLanguage());

    const handleLanguageUpdate = () => {
      setLanguage(getStoredLanguage());
    };

    window.addEventListener('language-updated', handleLanguageUpdate);
    return () => {
      window.removeEventListener('language-updated', handleLanguageUpdate);
    };
  }, []);

  return (
    <section className="mt-20 w-full border-t border-[#e8e8e8] py-12 sm:py-16">
      <h2 className="font-montserrat text-[2.25rem] font-extrabold leading-none text-[#414141] sm:text-[2.5rem]">
        {t(language, 'product.related_products_title')}
      </h2>

      {loading ? (
        <div className={CATALOG_ROW_SCROLL_CLASS}>
          <div className={CATALOG_ROW_FLEX_CLASS}>
            {Array.from({ length: CATALOG_SECTION_PAGE_SIZE }).map((_, i) => (
              <div
                key={i}
                className="h-[22rem] w-[11rem] shrink-0 animate-pulse rounded-[1.125rem] bg-white/80 shadow-[0_4px_22.5px_rgba(0,0,0,0.08)]"
              />
            ))}
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-lg text-[#9d9d9d]">{t(language, 'product.noRelatedProducts')}</p>
        </div>
      ) : (
        <div className={CATALOG_ROW_SCROLL_CLASS}>
          <div className={CATALOG_ROW_FLEX_CLASS}>
            {products.map((product, index) => {
              const catalogProduct = toCatalogProduct({
                id: product.id,
                slug: product.slug,
                title: product.title,
                price: product.price,
                image: product.image,
                images: product.images,
                inStock: product.inStock,
                categories: product.categories ?? [],
                skus: product.skus,
              });
              const section = getSectionLabel(catalogProduct);
              return (
                <ProductsCatalogCard
                  key={product.id}
                  product={catalogProduct}
                  sectionLabel={section}
                  sizeLabel={getSizeLabel(catalogProduct)}
                  categoryLabel={getCategoryLabel(catalogProduct, section)}
                  imageNudgeDown={shouldNudgeCatalogProductImage(index)}
                  compactLayout
                />
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
