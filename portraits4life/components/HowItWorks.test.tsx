import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import HowItWorks from './HowItWorks';

vi.mock('next/navigation', () => ({ usePathname: () => '/de' }));

describe('HowItWorks', () => {
  it('numbers the three steps and shows the new step 1 text and the payment line', () => {
    render(<HowItWorks locale="de" />);
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByText('Lade ein gut erkennbares Ultraschallbild hoch.')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Du bezahlst erst, nachdem ich dein Bild geprüft habe. Die Lieferzeit beginnt mit dem Zahlungseingang.',
      ),
    ).toBeInTheDocument();
    const numbers = document.querySelectorAll('ol > li > span[aria-hidden="true"]');
    expect(Array.from(numbers).map((n) => n.textContent)).toEqual(['1', '2', '3']);
  });
});
