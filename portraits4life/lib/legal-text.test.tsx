import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LegalText, parseLegalText, readLegalText } from './legal-text';

const sample = `# Datenschutzerklärung

Stand: 01.01.2027

## 1. Hosting

### Vercel
Erste Zeile
zweite Zeile https://vercel.com/legal/privacy-notice.

<!-- TODO(client): nicht anzeigen -->
* Punkt eins
* Punkt zwei
`;

describe('parseLegalText', () => {
  it('skips the title line and comments, and splits headings, paragraphs and lists', () => {
    expect(parseLegalText(sample)).toEqual([
      { type: 'p', lines: ['Stand: 01.01.2027'] },
      { type: 'h2', text: '1. Hosting' },
      { type: 'h3', text: 'Vercel' },
      {
        type: 'p',
        lines: ['Erste Zeile', 'zweite Zeile https://vercel.com/legal/privacy-notice.'],
      },
      { type: 'ul', items: ['Punkt eins', 'Punkt zwei'] },
    ]);
  });

  it('hides comments that span several lines', () => {
    const blocks = parseLegalText('Sichtbar\n\n<!-- Ausgeblendet:\n\n### Stripe\n\nText\n-->\n');
    expect(blocks).toEqual([{ type: 'p', lines: ['Sichtbar'] }]);
  });
});

describe('LegalText', () => {
  it('renders headings, list items and URLs as links without the trailing full stop', () => {
    render(<LegalText blocks={parseLegalText(sample)} />);
    expect(screen.getByRole('heading', { level: 2, name: '1. Hosting' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Vercel' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      'https://vercel.com/legal/privacy-notice',
    );
    expect(screen.queryByText(/TODO\(client\)/)).not.toBeInTheDocument();
  });
});

describe('readLegalText', () => {
  it('reads the German Datenschutz text and hides the client notes', () => {
    const blocks = readLegalText('datenschutz', 'de');
    expect(blocks).not.toBeNull();
    const text = JSON.stringify(blocks);
    expect(text).toContain('30 Tage nach dem Hochladen');
    expect(text).not.toContain('TODO');
    expect(text).not.toContain('Stripe');
  });

  // Every [bracket] placeholder shown on the page is a launch blocker (see docs/REMAINING.md).
  // A new placeholder must be added here and to that list; a filled one is removed from both.
  it('shows only the known open placeholders', () => {
    const text = (readLegalText('datenschutz', 'de') ?? [])
      .flatMap((block) =>
        block.type === 'p' ? block.lines : block.type === 'ul' ? block.items : [block.text],
      )
      .join('\n');
    expect(text.match(/\[[^\]]+\]/g)).toEqual([
      '[TT.MM.JJJJ]',
      '[Anbieter, Anschrift, Übermittlungsgrundlage und Auftragsverarbeitung ergänzen]',
      '[Vor- und Nachname]',
      '[Telefonnummer]',
      '[Name und Anschrift der Druckerei]',
    ]);
  });

  it('returns null when there is no file for the page and language', () => {
    expect(readLegalText('datenschutz', 'en')).toBeNull();
  });
});
