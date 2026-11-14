import { isCanvasSizeId, type CanvasSizeId } from '@/content/products';

// The ?format= value on the order link: "digital" or a canvas size id such as "40x40cm".
export type FormatChoice = { product: 'digital' } | { product: 'canvas'; canvasSize: CanvasSizeId };

export function parseFormatParam(value: string | null | undefined): FormatChoice | null {
  if (!value) return null;
  if (value === 'digital') return { product: 'digital' };
  if (isCanvasSizeId(value)) return { product: 'canvas', canvasSize: value };
  return null;
}
