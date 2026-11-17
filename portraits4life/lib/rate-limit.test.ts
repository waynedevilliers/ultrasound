import { beforeEach, describe, expect, it } from 'vitest';
import { isRateLimited, resetRateLimit } from './rate-limit';

const T0 = 1_000_000;
const FIFTEEN_MINUTES = 15 * 60 * 1000;

beforeEach(() => {
  resetRateLimit();
});

describe('isRateLimited', () => {
  it('allows five requests in a window and blocks the sixth', () => {
    for (let i = 0; i < 5; i++) expect(isRateLimited('a', T0 + i)).toBe(false);
    expect(isRateLimited('a', T0 + 5)).toBe(true);
  });

  it('counts each key separately', () => {
    for (let i = 0; i < 5; i++) isRateLimited('a', T0 + i);
    expect(isRateLimited('b', T0 + 5)).toBe(false);
  });

  it('allows the requests again once the window has passed', () => {
    for (let i = 0; i < 5; i++) isRateLimited('a', T0 + i);
    expect(isRateLimited('a', T0 + FIFTEEN_MINUTES + 10)).toBe(false);
  });

  it('uses a higher limit when a route passes one', () => {
    for (let i = 0; i < 20; i++) expect(isRateLimited('upload', T0 + i, 20)).toBe(false);
    expect(isRateLimited('upload', T0 + 20, 20)).toBe(true);
  });
});
