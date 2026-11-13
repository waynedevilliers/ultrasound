import { describe, expect, it } from 'vitest';
import { isActiveItem } from './is-active-item';

describe('isActiveItem', () => {
  it('marks home active only on the home page of the same locale', () => {
    expect(isActiveItem('', '/en', 'en')).toBe(true);
    expect(isActiveItem('', '/en/', 'en')).toBe(true);
    expect(isActiveItem('', '/en/order', 'en')).toBe(false);
    expect(isActiveItem('', '/de', 'en')).toBe(false);
  });

  it('marks the order page active on the order page and its children', () => {
    expect(isActiveItem('/order', '/en/order', 'en')).toBe(true);
    expect(isActiveItem('/order', '/en/order/confirm', 'en')).toBe(true);
    expect(isActiveItem('/order', '/en', 'en')).toBe(false);
  });

  it('does not match a route that only shares a prefix', () => {
    expect(isActiveItem('/order', '/en/orders', 'en')).toBe(false);
  });

  it('is locale aware', () => {
    expect(isActiveItem('/order', '/de/order', 'en')).toBe(false);
    expect(isActiveItem('/order', '/de/order', 'de')).toBe(true);
  });
});
