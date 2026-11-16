import { describe, expect, it } from 'vitest';
import { allPrices, canvasProduct, canvasSizes, digitalProduct, highestPrice, isCanvasSizeId, lowestPrice } from './products';

describe('products', () => {
  it('every price is a positive whole-euro amount', () => {
    for (const price of allPrices()) {
      expect(price).toBeGreaterThan(0);
      expect(Number.isInteger(price)).toBe(true);
    }
  });

  it('the digital file has one fixed price', () => {
    expect(digitalProduct.price).toBeGreaterThan(0);
  });

  it('canvas sizes are unique ids', () => {
    const ids = canvasSizes.map((size) => size.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('recognises only listed canvas sizes', () => {
    expect(isCanvasSizeId(canvasSizes[0].id)).toBe(true);
    expect(isCanvasSizeId('99x99cm')).toBe(false);
  });

  it('the starting price is the cheapest product, the highest price the most expensive', () => {
    expect(lowestPrice()).toBe(Math.min(...allPrices()));
    expect(highestPrice()).toBe(Math.max(...allPrices()));
  });

  it('the digital file costs the same as the smallest canvas', () => {
    expect(digitalProduct.price).toBe(canvasSizes[0].price);
    expect(lowestPrice()).toBe(digitalProduct.price);
  });

  it('delivery window is ordered', () => {
    expect(canvasProduct.deliveryWeeksMax).toBeGreaterThanOrEqual(canvasProduct.deliveryWeeksMin);
  });
});
