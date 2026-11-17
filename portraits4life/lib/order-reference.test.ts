import { describe, expect, it } from 'vitest';
import { createOrderReference, ORDER_REFERENCE_PATTERN } from './order-reference';

describe('createOrderReference', () => {
  it('uses the P4L prefix, the date as YYMMDD and four random characters', () => {
    expect(createOrderReference(new Date('2026-11-17T12:00:00Z'))).toMatch(
      /^P4L-261117-[A-HJ-NP-Z2-9]{4}$/,
    );
  });

  it('matches the reference pattern for many orders', () => {
    for (let i = 0; i < 300; i++) {
      expect(createOrderReference()).toMatch(ORDER_REFERENCE_PATTERN);
    }
  });

  it('never uses the ambiguous characters 0, O, 1 or I in the random part', () => {
    for (let i = 0; i < 300; i++) {
      const random = createOrderReference().slice(-4);
      expect(random).not.toMatch(/[0O1I]/);
    }
  });

  it('uses the German date, so an order at 23:30 UTC in November is dated the next day', () => {
    expect(createOrderReference(new Date('2026-11-16T23:30:00Z'))).toMatch(/^P4L-261117-/);
  });

  it('gives different references for different orders', () => {
    const references = new Set(Array.from({ length: 50 }, () => createOrderReference()));
    expect(references.size).toBe(50);
  });
});
