import { describe, expect, it } from 'vitest';
import { buildCustomerEmail, productName } from './customer-email';

const base = {
  name: 'Anna',
  reference: 'P4L-261117-K7QM',
  product: 'canvas' as const,
  productLabel: 'Leinwanddruck 30 × 30 cm',
  delivery: '1 bis 2 Wochen',
  contactEmail: 'portraits4life.art@gmail.com',
};

describe('buildCustomerEmail', () => {
  it('writes the German plain-text email for a German page', () => {
    const { subject, text } = buildCustomerEmail({ ...base, locale: 'de' });
    expect(subject).toBe('Anfrage bestätigt: Portraits 4 Life');
    expect(text).toContain('Hallo Anna,');
    expect(text).toContain('Danke, dein Bild ist bei mir angekommen!');
    expect(text).toContain('Deine Referenz: P4L-261117-K7QM');
    expect(text).toContain('So geht es weiter:');
    expect(text).toContain('Bei Fragen schreib mir einfach an portraits4life.art@gmail.com.');
    expect(text).not.toContain('Thank you');
  });

  it('writes the English plain-text email for an English page', () => {
    const { subject, text } = buildCustomerEmail({ ...base, locale: 'en' });
    expect(subject).toBe('Request confirmed: Portraits 4 Life');
    expect(text).toContain('Hi Anna,');
    expect(text).toContain('Thank you, your image has arrived!');
    expect(text).toContain(
      'If you have any questions, just write to portraits4life.art@gmail.com.',
    );
    expect(text).not.toContain('Danke');
  });

  it('lists the three steps in order', () => {
    const { text } = buildCustomerEmail({ ...base, locale: 'en' });
    const lines = text.split('\n');
    expect(lines.filter((line) => /^[123]\. /.test(line))).toHaveLength(3);
    expect(lines.find((line) => line.startsWith('1. '))).toContain('I check your ultrasound image');
  });

  it('describes the file delivery for a digital order and the printing for a canvas', () => {
    const digital = buildCustomerEmail({ ...base, product: 'digital', locale: 'en' });
    expect(digital.text).toContain('you receive the file by email');
    expect(digital.text).not.toContain('canvas is printed');
    const canvas = buildCustomerEmail({ ...base, locale: 'en' });
    expect(canvas.text).toContain('your canvas is printed');
  });

  it('keeps the name as typed, since the email is plain text', () => {
    const { text } = buildCustomerEmail({ ...base, name: 'Anna Müller', locale: 'de' });
    expect(text.startsWith('Hallo Anna Müller,')).toBe(true);
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
