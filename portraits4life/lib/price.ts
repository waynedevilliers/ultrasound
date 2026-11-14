import { CURRENCY } from '@/content/products';

// Formats a price for display. Whole amounts have no decimals.
// German: "30 €" (non-breaking space). English: "€30".
export function formatPrice(amount: number, locale: 'de' | 'en'): string {
  return new Intl.NumberFormat(locale === 'de' ? 'de-DE' : 'en-GB', {
    style: 'currency',
    currency: CURRENCY,
    maximumFractionDigits: 0,
  }).format(amount);
}
