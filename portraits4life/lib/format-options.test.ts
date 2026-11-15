import { describe, expect, it } from 'vitest';
import { canvasSizes } from '@/content/products';
import { formatPrice } from './price';
import { formatOptions } from './format-options';

describe('formatOptions', () => {
  it('lists the digital file first, then each canvas size, in German', () => {
    const options = formatOptions('de');
    expect(options.map((o) => o.value)).toEqual(['digital', '30x30cm', '40x40cm', '50x50cm']);
    expect(options[0].label).toBe(`Digitale Datei (JPG), ab ${formatPrice(30, 'de')}`);
    expect(options[1].label).toBe(`Leinwanddruck 30 × 30 cm, ${formatPrice(69, 'de')}`);
  });

  it('uses the English names and prices', () => {
    const options = formatOptions('en');
    expect(options[0].label).toBe('Digital file (JPG), from €30');
    expect(options[3].label).toBe('Canvas print 50 × 50 cm, €119');
  });

  it('takes every canvas price from the product file', () => {
    const options = formatOptions('de');
    canvasSizes.forEach((size, index) => {
      expect(options[index + 1].label).toContain(formatPrice(size.price, 'de'));
    });
  });
});
