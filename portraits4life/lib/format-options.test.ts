import { afterEach, describe, expect, it } from 'vitest';
import { canvasSizes, digitalProduct } from '@/content/products';
import { formatPrice } from './price';
import { formatOptions } from './format-options';

// The digital file is not sold, so its flag is restored after each test that turns it on.
afterEach(() => {
  digitalProduct.available = false;
});

describe('formatOptions', () => {
  it('lists only the canvas sizes while the digital file is not sold', () => {
    expect(formatOptions('de').map((o) => o.value)).toEqual(canvasSizes.map((s) => s.id));
  });

  it('lists the digital file last again when it is made available', () => {
    digitalProduct.available = true;
    const options = formatOptions('de');
    expect(options.map((o) => o.value)).toEqual([...canvasSizes.map((s) => s.id), 'digital']);
    expect(options[options.length - 1].label).toBe(`Digitale Datei (JPG), ${formatPrice(digitalProduct.price, 'de')}`);
  });

  it('uses the English canvas names and prices', () => {
    const options = formatOptions('en');
    const first = canvasSizes[0];
    expect(options[0].label).toBe(`Canvas print ${first.widthCm}\u00a0×\u00a0${first.heightCm}\u00a0cm, ${formatPrice(first.price, 'en')}`);
  });

  it('takes every canvas price from the product file', () => {
    const options = formatOptions('de');
    canvasSizes.forEach((size, index) => {
      expect(options[index].label).toContain(formatPrice(size.price, 'de'));
    });
  });
});
