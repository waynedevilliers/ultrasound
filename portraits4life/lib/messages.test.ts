import { describe, expect, it } from 'vitest';
import de from '@/messages/de.json';
import en from '@/messages/en.json';

// Every key must exist in both languages, at every depth.
function keyPaths(value: unknown, prefix = ''): string[] {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return Object.entries(value).flatMap(([key, child]) => keyPaths(child, prefix ? `${prefix}.${key}` : key));
  }
  return [prefix];
}

describe('message files', () => {
  it('de.json and en.json have the same keys', () => {
    expect(keyPaths(de).sort()).toEqual(keyPaths(en).sort());
  });

  it('no message value is empty', () => {
    for (const path of keyPaths(de)) {
      const value = path.split('.').reduce<unknown>((node, key) => (node as Record<string, unknown>)[key], de);
      expect(String(value).trim().length).toBeGreaterThan(0);
    }
  });
});
