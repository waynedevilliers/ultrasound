import { canvasSizes, digitalProduct, type CanvasSizeId } from '@/content/products';
import { getCopy } from '@/lib/copy';
import { formatPrice } from '@/lib/price';

export type FormatOption = { value: 'digital' | CanvasSizeId; label: string };

// One option per canvas size, then the digital file. Names and prices are the same as on the format cards.
export function formatOptions(locale: 'de' | 'en'): FormatOption[] {
  const { pricing } = getCopy(locale);
  const canvas = canvasSizes.map((size) => ({
    value: size.id,
    label: `${pricing.canvas.title} ${size.widthCm}\u00a0×\u00a0${size.heightCm}\u00a0cm, ${formatPrice(size.price, locale)}`,
  }));
  const digital: FormatOption = {
    value: 'digital',
    label: `${pricing.digital.title}, ${formatPrice(digitalProduct.price, locale)}`,
  };
  return [...canvas, digital];
}
