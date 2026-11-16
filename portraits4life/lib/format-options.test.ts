import { describe, expect, it } from 'vitest';
import { canvasSizes, digitalProduct } from '@/content/products';
import { formatPrice } from './price';
import { formatOptions } from './format-options';

describe('formatOptions', () => {
  it('lists each canvas size first and the digital file last, in German', () => {
    const options = formatOptions('de');
    expect(options.map((o) => o.value)).toEqual([...canvasSizes.map((s) => s.id), 'digital']);
    const first = canvasSizes[0];
    expect(options[0].label).toBe(`Leinwanddruck ${first.widthCm} × ${first.heightCm} cm, ${formatPrice(first.price, 'de')}`);
    expect(options[options.length - 1].label).toBe(`Digitale Datei (JPG), ${formatPrice(digitalProduct.price, 'de')}`);
  });

  it('uses the English names and prices', () => {
    const options = formatOptions('en');
    const last = canvasSizes[canvasSizes.length - 1];
    expect(options[canvasSizes.length - 1].label).toBe(`Canvas print ${last.widthCm} × ${last.heightCm} cm, ${formatPrice(last.price, 'en')}`);
    expect(options[canvasSizes.length].label).toBe(`Digital file (JPG), ${formatPrice(digitalProduct.price, 'en')}`);
  });

  it('takes every price from the product file', () => {
    const options = formatOptions('de');
    canvasSizes.forEach((size, index) => {
      expect(options[index].label).toContain(formatPrice(size.price, 'de'));
    });
  });
});
