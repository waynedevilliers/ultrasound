import { describe, expect, it } from 'vitest';
import { canvasProduct, canvasSizes, digitalProduct, isCanvasSizeId, lowestPrice } from './products';

describe('products', () => {
  it('every canvas size has a positive whole-euro price', () => {
    for (const size of canvasSizes) {
      expect(size.price).toBeGreaterThan(0);
      expect(Number.isInteger(size.price)).toBe(true);
    }
  });

  it('digital download has a price range from low to high', () => {
    expect(digitalProduct.priceFrom).toBeGreaterThan(0);
    expect(digitalProduct.priceTo).toBeGreaterThanOrEqual(digitalProduct.priceFrom);
  });

  it('canvas sizes are unique ids', () => {
    const ids = canvasSizes.map((size) => size.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('recognises only listed canvas sizes', () => {
    expect(isCanvasSizeId('30x30cm')).toBe(true);
    expect(isCanvasSizeId('99x99cm')).toBe(false);
  });

  it('lowest price is the cheapest of digital and canvas', () => {
    expect(lowestPrice()).toBe(Math.min(digitalProduct.priceFrom, ...canvasSizes.map((s) => s.price)));
  });

  it('delivery window is ordered', () => {
    expect(canvasProduct.deliveryWeeksMax).toBeGreaterThanOrEqual(canvasProduct.deliveryWeeksMin);
  });
});
