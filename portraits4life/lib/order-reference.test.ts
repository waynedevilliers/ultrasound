import { describe, expect, it, vi } from 'vitest';
import {
  createOrderReference,
  isReferenceConflict,
  MAX_REFERENCE_ATTEMPTS,
  ORDER_REFERENCE_PATTERN,
  withReference,
} from './order-reference';

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
});

describe('withReference', () => {
  const conflict = { code: '23505', constraint: 'idx_orders_reference', message: 'duplicate key' };

  it('saves with the first reference when there is no conflict', async () => {
    const save = vi.fn(async (reference: string) => reference);
    const result = await withReference(save);
    expect(save).toHaveBeenCalledTimes(1);
    expect(result.value).toBe(result.reference);
  });

  it('tries again with a new reference after a reference conflict', async () => {
    const save = vi
      .fn<(reference: string) => Promise<string>>()
      .mockRejectedValueOnce(conflict)
      .mockImplementation(async (reference) => reference);
    const result = await withReference(save);
    expect(save).toHaveBeenCalledTimes(2);
    expect(result.value).toBe(result.reference);
  });

  it('gives up after the maximum number of conflicts', async () => {
    const save = vi.fn(async () => {
      throw conflict;
    });
    await expect(withReference(save)).rejects.toMatchObject({ code: '23505' });
    expect(save).toHaveBeenCalledTimes(MAX_REFERENCE_ATTEMPTS);
  });

  it('does not retry other database errors', async () => {
    const save = vi.fn(async () => {
      throw new Error('connection refused');
    });
    await expect(withReference(save)).rejects.toThrow('connection refused');
    expect(save).toHaveBeenCalledTimes(1);
  });

  it('recognises only a unique violation on the reference index', () => {
    expect(isReferenceConflict(conflict)).toBe(true);
    expect(isReferenceConflict({ code: '23505', constraint: 'idx_orders_email' })).toBe(false);
    expect(isReferenceConflict({ code: '42P01' })).toBe(false);
    expect(isReferenceConflict(new Error('x'))).toBe(false);
  });
});
