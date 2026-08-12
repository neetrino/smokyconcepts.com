import type { AmeriaCurrencyCode, ArcaCurrencyCode, PaymentGatewayCurrency } from './types';
import type { ArcaBank } from './types';

const NUMERIC_TO_AMERIA: Record<ArcaCurrencyCode, AmeriaCurrencyCode> = {
  '051': 'AMD',
  '840': 'USD',
  '978': 'EUR',
  '643': 'RUB',
};

/**
 * Classic ArCa uses numeric ISO codes; Ameria VPOS expects AMD/USD/EUR/RUB.
 */
export function resolvePaymentCurrencyForBank(
  bank: ArcaBank,
  numericOrAlpha: PaymentGatewayCurrency,
): PaymentGatewayCurrency {
  if (bank !== 'ameriabank') {
    return numericOrAlpha;
  }

  if (
    numericOrAlpha === 'AMD' ||
    numericOrAlpha === 'USD' ||
    numericOrAlpha === 'EUR' ||
    numericOrAlpha === 'RUB'
  ) {
    return numericOrAlpha;
  }

  return NUMERIC_TO_AMERIA[numericOrAlpha] ?? 'AMD';
}
