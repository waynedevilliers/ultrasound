import { afterEach, describe, expect, it, vi } from 'vitest';
import { comingSoonPath, isComingSoon } from './site-mode';

describe('isComingSoon', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('is off when the setting is missing (local development)', () => {
    vi.stubEnv('COMING_SOON', '');
    expect(isComingSoon()).toBe(false);
  });

  it('is on only for the exact value "true"', () => {
    vi.stubEnv('COMING_SOON', 'true');
    expect(isComingSoon()).toBe(true);
    vi.stubEnv('COMING_SOON', 'yes');
    expect(isComingSoon()).toBe(false);
  });
});

describe('comingSoonPath', () => {
  it('keeps the language of the requested path', () => {
    expect(comingSoonPath('/en/order')).toBe('/en/coming-soon');
    expect(comingSoonPath('/de/order')).toBe('/de/coming-soon');
    expect(comingSoonPath('/')).toBe('/de/coming-soon');
  });
});
