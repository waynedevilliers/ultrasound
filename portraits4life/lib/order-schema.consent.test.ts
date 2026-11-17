import { describe, expect, it } from 'vitest';
import { orderSubmitSchema } from './order-schema';
import { CONSENT_VERSION } from './consent';

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
