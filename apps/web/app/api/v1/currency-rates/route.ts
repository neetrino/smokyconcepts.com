import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { db } from '@white-shop/db';

const CURRENCY_RATES_REVALIDATE_SECONDS = 60;

const DEFAULT_CURRENCY_RATES = {
  AMD: 1,
  USD: 1 / 400,
  RUB: 0.2,
};

const getCachedCurrencyRates = unstable_cache(
  async () => {
    const row = await db.settings.findUnique({
      where: { key: 'currencyRates' },
    });
    if (!row?.value || typeof row.value !== 'object') {
      return DEFAULT_CURRENCY_RATES;
    }
    return {
      ...DEFAULT_CURRENCY_RATES,
      ...(row.value as Record<string, number>),
      AMD: 1,
    };
  },
  ['storefront-currency-rates'],
  {
    revalidate: CURRENCY_RATES_REVALIDATE_SECONDS,
    tags: ['currency-rates'],
  }
);

/**
 * Get currency exchange rates (public endpoint).
 */
export async function GET() {
  try {
    const rates = await getCachedCurrencyRates();
    return NextResponse.json(rates, {
      headers: {
        'Cache-Control': `public, s-maxage=${CURRENCY_RATES_REVALIDATE_SECONDS}, stale-while-revalidate=120`,
      },
    });
  } catch (error: unknown) {
    console.error('❌ [CURRENCY RATES] Error:', error);
    return NextResponse.json(DEFAULT_CURRENCY_RATES);
  }
}
