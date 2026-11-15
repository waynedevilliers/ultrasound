import { describe, expect, it } from 'vitest';
import { formatFileSize } from './UploadArea';

describe('formatFileSize', () => {
  it('uses KB below 1 MB', () => {
    expect(formatFileSize(850 * 1024, 'en')).toBe('850 KB');
  });

  it('uses one decimal and the locale decimal separator from 1 MB', () => {
    expect(formatFileSize(2.5 * 1024 * 1024, 'de')).toBe('2,5 MB');
    expect(formatFileSize(2.5 * 1024 * 1024, 'en')).toBe('2.5 MB');
  });
});
