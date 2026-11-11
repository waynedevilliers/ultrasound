// Single source of truth for products, sizes, prices and delivery times.
// Pricing cards, the order form, the order API validation and structured data
// read from this file. No price or size is typed anywhere else.

export const CURRENCY = 'EUR';

export const digitalProduct = {
  id: 'digital',
  priceFrom: 30,
  priceTo: 50,
  deliveryWeeks: 1,
} as const;

export const canvasSizes = [
  { id: '30x30cm', widthCm: 30, heightCm: 30, price: 69 },
  { id: '40x40cm', widthCm: 40, heightCm: 40, price: 89 },
  { id: '50x50cm', widthCm: 50, heightCm: 50, price: 119 },
] as const;

export const canvasProduct = {
  id: 'canvas',
  deliveryWeeksMin: 1,
  deliveryWeeksMax: 2,
  sizes: canvasSizes,
} as const;

export type ProductId = 'digital' | 'canvas';
export type CanvasSizeId = (typeof canvasSizes)[number]['id'];

export const canvasSizeIds = canvasSizes.map((size) => size.id) as CanvasSizeId[];

export function isCanvasSizeId(value: string): value is CanvasSizeId {
  return (canvasSizeIds as string[]).includes(value);
}

export function lowestPrice(): number {
  return Math.min(digitalProduct.priceFrom, ...canvasSizes.map((size) => size.price));
}
