// Single source of truth for products, sizes, prices and delivery times.
// Pricing cards, the order form, the order API validation and structured data
// read from this file. No price or size is typed anywhere else.

export const CURRENCY = 'EUR';

// Not sold for now: the file can be printed anywhere, so it would undercut the canvases (see docs/DECISIONS.md).
// Kept with available: false so it can be offered again by changing one value. Lists show only available products.
export const digitalProduct: {
  id: 'digital';
  price: number;
  deliveryWeeks: number;
  available: boolean;
} = {
  id: 'digital',
  price: 89,
  deliveryWeeks: 1,
  available: false,
};

export const canvasSizes = [
  { id: '30x30cm', widthCm: 30, heightCm: 30, price: 89, available: true },
  // TODO(client): confirm after real print quotes (provisional price).
  { id: '40x40cm', widthCm: 40, heightCm: 40, price: 109, available: true },
  // TODO(client): confirm after real print quotes (provisional price).
  { id: '50x50cm', widthCm: 50, heightCm: 50, price: 129, available: true },
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

// Whether the digital file is offered on the site and in the order form.
export function isDigitalAvailable(): boolean {
  return digitalProduct.available;
}

// Every available product's price, for the starting price, the price range and structured data.
export function allPrices(): number[] {
  const digital = isDigitalAvailable() ? [digitalProduct.price] : [];
  return [...digital, ...canvasSizes.map((size) => size.price)];
}

// The starting price shown on the site ("Ab ...").
export function lowestPrice(): number {
  return Math.min(...allPrices());
}

// The highest price of any product (used for structured data).
export function highestPrice(): number {
  return Math.max(...allPrices());
}
