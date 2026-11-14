import { describe, expect, it } from 'vitest';
import { formatPrice } from './price';

describe('formatPrice', () => {
  it('formats German prices with the euro sign after the amount', () => {
    expect(formatPrice(30, 'de')).toBe('30 €');
    expect(formatPrice(119, 'de')).toBe('119 €');
  });

  it('formats English prices with the euro sign before the amount', () => {
    expect(formatPrice(30, 'en')).toBe('€30');
    expect(formatPrice(119, 'en')).toBe('€119');
  });

  it('shows no decimals for whole amounts', () => {
    expect(formatPrice(69, 'en')).not.toContain('.00');
    expect(formatPrice(69, 'de')).not.toContain(',00');
  });
});
