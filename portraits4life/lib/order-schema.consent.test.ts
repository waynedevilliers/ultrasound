import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { digitalProduct } from '@/content/products';
import { orderSubmitSchema } from './order-schema';
import { CONSENT_VERSION } from './consent';

// The field rules are tested with the digital file on sale; the availability tests turn it off.
beforeEach(() => {
  digitalProduct.available = true;
});
afterEach(() => {
  digitalProduct.available = false;
});

const base = {
  name: 'Ann',
  email: 'ann@example.com',
  product: 'digital',
  ultrasoundPath: 'orders/scan.png',
  website: '',
};

describe('order consent', () => {
  it('rejects an order without the two required consents', () => {
    expect(orderSubmitSchema.safeParse(base).success).toBe(false);
  });

  it('accepts an order with the two required consents and the optional showcase answer', () => {
    const consent = { processing: true, rights: true, showcase: false, version: CONSENT_VERSION };
    expect(orderSubmitSchema.safeParse({ ...base, consent }).success).toBe(true);
  });
});
