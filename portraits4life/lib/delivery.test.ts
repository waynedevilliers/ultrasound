import { describe, expect, it } from 'vitest';
import { canvasDeliveryText, digitalDeliveryText } from './delivery';

describe('delivery text', () => {
  it('reads the digital time from the product file', () => {
    expect(digitalDeliveryText('de')).toBe('1 Woche');
    expect(digitalDeliveryText('en')).toBe('1 week');
  });

  it('writes the canvas range as "1 bis 2 Wochen" and "1 to 2 weeks"', () => {
    expect(canvasDeliveryText('de')).toBe('1 bis 2 Wochen');
    expect(canvasDeliveryText('en')).toBe('1 to 2 weeks');
  });
});
