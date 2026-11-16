import { describe, expect, it } from 'vitest';
import { formatPrice } from './price';

describe('formatPrice', () => {
  it('formats German prices with the euro sign after the amount', () => {
    expect(formatPrice(20, 'de')).toBe('20 €');
    expect(formatPrice(129, 'de')).toBe('129 €');
  });

  it('formats English prices with the euro sign before the amount', () => {
    expect(formatPrice(20, 'en')).toBe('€20');
    expect(formatPrice(129, 'en')).toBe('€129');
  });

  it('shows no decimals for whole amounts', () => {
    expect(formatPrice(79, 'en')).not.toContain('.00');
    expect(formatPrice(79, 'de')).not.toContain(',00');
  });
});
