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

  it('returns null when there is no file for the page and language', () => {
    expect(readLegalText('datenschutz', 'en')).toBeNull();
  });
});
