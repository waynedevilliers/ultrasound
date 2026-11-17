import { describe, expect, it } from 'vitest';
import { createRequestCode, isRequestCode } from './request-code';

describe('request codes', () => {
  it('creates an 8-character lowercase hex code', () => {
    expect(createRequestCode()).toMatch(/^[0-9a-f]{8}$/);
  });

  it('creates a different code each time', () => {
    expect(createRequestCode()).not.toBe(createRequestCode());
  });

  it('accepts only the 8-character hex format', () => {
    expect(isRequestCode('1c256519')).toBe(true);
    expect(isRequestCode('1C256519')).toBe(false);
    expect(isRequestCode('1c25651')).toBe(false);
    expect(isRequestCode('1c2565190')).toBe(false);
    expect(isRequestCode('../../x')).toBe(false);
    expect(isRequestCode(undefined)).toBe(false);
  });
});
