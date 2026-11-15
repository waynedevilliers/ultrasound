import { canvasSizes, digitalProduct, type CanvasSizeId } from '@/content/products';
import { getCopy } from '@/lib/copy';
import { formatPrice } from '@/lib/price';

export type FormatOption = { value: 'digital' | CanvasSizeId; label: string };

// One option per product and canvas size. Names and prices are the same as on the format cards.
export function formatOptions(locale: 'de' | 'en'): FormatOption[] {
  const { pricing } = getCopy(locale);
  const digital: FormatOption = {
    value: 'digital',
    label: `${pricing.digital.title}, ${pricing.from} ${formatPrice(digitalProduct.priceFrom, locale)}`,
  };
  const canvas = canvasSizes.map((size) => ({
    value: size.id,
    label: `${pricing.canvas.title} ${size.widthCm} × ${size.heightCm} cm, ${formatPrice(size.price, locale)}`,
  }));
  return [digital, ...canvas];
}
