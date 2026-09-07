import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../../../lib/api-client';
import { getStoredLanguage, type LanguageCode } from '../../../../lib/language';
import { RESERVED_ROUTES } from '../types';
import type { Product } from '../types';

interface UseProductFetchProps {
  slug: string;
  variantIdFromUrl: string | null;
  initialProduct?: Product | null;
  initialLanguage?: LanguageCode;
}

export function useProductFetch({
  slug,
  variantIdFromUrl,
  initialProduct = null,
  initialLanguage,
}: UseProductFetchProps) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(initialProduct);
  const [loading, setLoading] = useState(initialProduct === null);

  const fetchProduct = useCallback(async () => {
    if (!slug || RESERVED_ROUTES.includes(slug.toLowerCase())) return;
    
    try {
      setLoading(true);
      const currentLang = getStoredLanguage();
      let data: Product;
      
      try {
        data = await apiClient.get<Product>(`/api/v1/products/${slug}`, {
          params: { lang: currentLang }
        });
      } catch (error: unknown) {
        const errorStatus = error && typeof error === 'object' && 'status' in error ? Number(error.status) : undefined;
        if (errorStatus === 404 && currentLang !== 'en') {
          try {
            data = await apiClient.get<Product>(`/api/v1/products/${slug}`, {
              params: { lang: 'en' }
            });
          } catch {
            throw error;
          }
        } else {
          throw error;
        }
      }
      
      setProduct(data);
    } catch (error: unknown) {
      const err = error as { status?: number };
      if (err?.status === 404) {
        setProduct(null);
      }
    } finally {
      setLoading(false);
    }
  }, [slug, variantIdFromUrl]);

  useEffect(() => {
    if (!slug) return;
    if (RESERVED_ROUTES.includes(slug.toLowerCase())) {
      router.replace(`/${slug}`);
    }
  }, [slug, router]);

  useEffect(() => {
    if (!slug || RESERVED_ROUTES.includes(slug.toLowerCase())) return;

    const clientLang = getStoredLanguage();
    const canUseInitial =
      initialProduct !== null &&
      initialProduct !== undefined &&
      (!initialLanguage || initialLanguage === clientLang);

    if (canUseInitial) {
      setProduct(initialProduct);
      setLoading(false);
    } else {
      void fetchProduct();
    }
    
    const handleLanguageUpdate = () => {
      fetchProduct();
    };
    
    window.addEventListener('language-updated', handleLanguageUpdate);
    return () => {
      window.removeEventListener('language-updated', handleLanguageUpdate);
    };
  }, [slug, variantIdFromUrl, router, fetchProduct, initialProduct, initialLanguage]);

  return { product, loading, fetchProduct };
}
