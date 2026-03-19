'use client';

import { type FormEvent, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from '../lib/i18n-client';

interface DiscoveryProduct {
  id: string;
  slug: string;
  title: string;
  categories: Array<{ id: string; slug: string; title: string }>;
  skus: string[];
}

interface ProductsDiscoveryBarProps {
  products: DiscoveryProduct[];
}

export function ProductsDiscoveryBar({ products }: ProductsDiscoveryBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const currentSearch = searchParams.get('search') ?? '';
  const [searchInput, setSearchInput] = useState(currentSearch);

  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  const pushParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value && value.trim()) {
        params.set(key, value.trim());
      } else {
        params.delete(key);
      }
    });

    params.delete('page');

    const queryString = params.toString();
    router.push(queryString ? `/products?${queryString}` : '/products');
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    pushParams({ search: searchInput });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
      <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="space-y-6">
          <form
            onSubmit={handleSearchSubmit}
            className="rounded-2xl border border-gray-200 bg-gray-50 p-4"
          >
            <p className="text-sm font-semibold text-gray-900">
              {t('products.discovery.searchTitle')}
            </p>
            <p className="mt-1 text-sm text-gray-600">
              {t('products.discovery.searchHelper')}
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder={t('products.discovery.searchPlaceholder')}
                className="h-11 flex-1 rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="h-11 rounded-xl bg-gray-900 px-5 text-sm font-semibold text-white transition hover:bg-gray-800"
                >
                  {t('common.buttons.search')}
                </button>
                {currentSearch ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput('');
                      pushParams({ search: null });
                    }}
                    className="h-11 rounded-xl border border-gray-300 px-4 text-sm font-semibold text-gray-700 transition hover:bg-white"
                  >
                    {t('products.discovery.clear')}
                  </button>
                ) : null}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
