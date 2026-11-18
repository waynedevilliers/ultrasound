import { isCanvasSizeId, isDigitalAvailable, type CanvasSizeId } from '@/content/products';

// The ?format= value on the order link: "digital" or a canvas size id such as "40x40cm".
export type FormatChoice = { product: 'digital' } | { product: 'canvas'; canvasSize: CanvasSizeId };

// A digital link is ignored while the digital file is not sold, so the order form shows its default.
export function parseFormatParam(value: string | null | undefined): FormatChoice | null {
  if (!value) return null;
  if (value === 'digital') return isDigitalAvailable() ? { product: 'digital' } : null;
  if (isCanvasSizeId(value)) return { product: 'canvas', canvasSize: value };
  return null;
}
