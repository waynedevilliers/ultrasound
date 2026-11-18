import { afterEach, describe, expect, it } from 'vitest';
import { digitalProduct } from '@/content/products';
import { parseFormatParam } from './format-param';

afterEach(() => {
  digitalProduct.available = false;
});

describe('parseFormatParam', () => {
  it('ignores digital while the digital file is not sold', () => {
    expect(parseFormatParam('digital')).toBeNull();
  });

  it('reads digital again when it is made available', () => {
    digitalProduct.available = true;
    expect(parseFormatParam('digital')).toEqual({ product: 'digital' });
  });

  it('reads a canvas size from the product data', () => {
    expect(parseFormatParam('40x40cm')).toEqual({ product: 'canvas', canvasSize: '40x40cm' });
  });

  it('ignores unknown values', () => {
    expect(parseFormatParam('99x99cm')).toBeNull();
    expect(parseFormatParam('<script>')).toBeNull();
  });

  it('ignores a missing value', () => {
    expect(parseFormatParam(null)).toBeNull();
    expect(parseFormatParam('')).toBeNull();
  });
});
