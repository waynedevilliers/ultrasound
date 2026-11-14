import { describe, expect, it } from 'vitest';
import { parseFormatParam } from './format-param';

describe('parseFormatParam', () => {
  it('reads digital', () => {
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
