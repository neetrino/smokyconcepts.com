import { notFound, redirect } from 'next/navigation';
import { getCachedProductBySlug } from '@/lib/services/storefront-product-cache';
import type { LanguageCode } from '../../../lib/language';
import { ProductPageClient } from './ProductPageClient';
import { RESERVED_ROUTES, type Product } from './types';

export const revalidate = 60;

/** SSR default — client syncs from localStorage/cookie without forcing dynamic cookies(). */
const SSR_DEFAULT_LANGUAGE: LanguageCode = 'en';

interface ProductPageProps {
  params: Promise<{ slug?: string }>;
}

async function loadProduct(slug: string, lang: LanguageCode): Promise<Product | null> {
  try {
    return (await getCachedProductBySlug(slug, lang)) as Product;
  } catch (error: unknown) {
    const status =
      error && typeof error === 'object' && 'status' in error
        ? Number((error as { status?: number }).status)
        : undefined;
    if (status === 404 && lang !== 'en') {
      try {
        return (await getCachedProductBySlug(slug, 'en')) as Product;
      } catch {
        return null;
      }
    }
    if (status === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * Product detail — cached SSR payload (no cookies() so page ISR can apply).
 * Language mismatches are corrected client-side after hydrate.
 */
export default async function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = await params;
  const rawSlug = resolvedParams?.slug ?? '';
  const slugParts = rawSlug.includes(':') ? rawSlug.split(':') : [rawSlug];
  const slug = slugParts[0] ?? '';
  const variantIdFromUrl = slugParts.length > 1 ? slugParts[1] ?? null : null;

  if (!slug) {
    notFound();
  }

  if (RESERVED_ROUTES.includes(slug.toLowerCase())) {
    redirect(`/${slug}`);
  }

  const initialProduct = await loadProduct(slug, SSR_DEFAULT_LANGUAGE);

  if (!initialProduct) {
    notFound();
  }

  return (
    <ProductPageClient
      slug={slug}
      variantIdFromUrl={variantIdFromUrl}
      initialProduct={initialProduct}
      initialLanguage={SSR_DEFAULT_LANGUAGE}
    />
  );
}
