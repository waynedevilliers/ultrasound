import { describe, expect, it } from 'vitest';
import { buildCustomerEmail, productName } from './customer-email';

const base = {
  name: 'Anna',
  reference: 'P4L-261117-K7QM',
  product: 'Digitale Datei (JPG)',
  delivery: '1 Woche',
};

describe('buildCustomerEmail', () => {
  it('writes the German email for a German page', () => {
    const { subject, html } = buildCustomerEmail({ ...base, locale: 'de' });
    expect(subject).toBe('Bestellung bestätigt: Portraits 4 Life');
    expect(html).toContain('Danke für deine Bestellung!');
    expect(html).toContain('Hallo Anna,');
    expect(html).toContain('P4L-261117-K7QM');
    expect(html).not.toContain('Thank you');
  });

  it('writes the English email for an English page', () => {
    const { subject, html } = buildCustomerEmail({ ...base, locale: 'en' });
    expect(subject).toBe('Order confirmed: Portraits 4 Life');
    expect(html).toContain('Thank you for your order!');
    expect(html).toContain('Hi Anna,');
    expect(html).not.toContain('Danke');
  });

  it('escapes the customer name', () => {
    const { html } = buildCustomerEmail({ ...base, name: '<b>Anna</b>', locale: 'en' });
    expect(html).toContain('&lt;b&gt;Anna&lt;/b&gt;');
    expect(html).not.toContain('<b>Anna</b>');
  });
});

describe('productName', () => {
  it('names the canvas size in the page language', () => {
    expect(productName('de', 'canvas', '30x30cm')).toContain('30 × 30 cm');
    expect(productName('en', 'canvas', '30x30cm')).toContain('30 × 30 cm');
  });

  it('names the digital file in the page language', () => {
    expect(productName('en', 'digital')).toBe('Digital file (JPG)');
    expect(productName('de', 'digital')).not.toBe('Digital file (JPG)');
  });
});
