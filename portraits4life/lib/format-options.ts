import {
  canvasSizes,
  digitalProduct,
  isDigitalAvailable,
  type CanvasSizeId,
} from '@/content/products';
import { getCopy } from '@/lib/copy';
import { formatPrice } from '@/lib/price';

export type FormatOption = { value: 'digital' | CanvasSizeId; label: string; price: string };

// One option per available canvas size, then the digital file if it is available.
// Names and prices are the same as on the format cards.
export function formatOptions(locale: 'de' | 'en'): FormatOption[] {
  const { pricing } = getCopy(locale);
  const canvas = canvasSizes.map((size) => ({
    value: size.id,
    label: `${pricing.canvas.title} ${size.widthCm} × ${size.heightCm} cm, ${formatPrice(size.price, locale)}`,
    price: formatPrice(size.price, locale),
  }));
  if (!isDigitalAvailable()) return canvas;
  const digital: FormatOption = {
    value: 'digital',
    label: `${pricing.digital.title}, ${formatPrice(digitalProduct.price, locale)}`,
    price: formatPrice(digitalProduct.price, locale),
  };
  return [...canvas, digital];
}
