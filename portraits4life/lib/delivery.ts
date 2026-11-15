import { canvasProduct, digitalProduct } from '@/content/products';
import { getCopy } from '@/lib/copy';

// Delivery times as text, built from content/products.ts. The words come from messages.
export function digitalDeliveryText(locale: 'de' | 'en'): string {
  const { common } = getCopy(locale);
  const weeks = digitalProduct.deliveryWeeks;
  return `${weeks} ${weeks === 1 ? common.week : common.weeks}`;
}

export function canvasDeliveryText(locale: 'de' | 'en'): string {
  const { common } = getCopy(locale);
  const min: number = canvasProduct.deliveryWeeksMin;
  const max: number = canvasProduct.deliveryWeeksMax;
  if (min === max) return `${min} ${min === 1 ? common.week : common.weeks}`;
  return `${min} ${common.rangeTo} ${max} ${common.weeks}`;
}
