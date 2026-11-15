import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import PricingTiers from './PricingTiers';

vi.mock('next/navigation', () => ({ usePathname: () => '/de' }));

describe('PricingTiers', () => {
  it('shows one card per format with the new titles and a non-breaking size', () => {
    render(<PricingTiers />);
    expect(screen.getByRole('heading', { level: 3, name: 'Digitale Datei (JPG)' })).toBeInTheDocument();
    const canvas = screen.getByRole('heading', { level: 3, name: /^Leinwanddruck 30 × 30 cm$/ });
    expect(canvas).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(4);
  });

  it('links each card to the order form with its format', () => {
    render(<PricingTiers />);
    const links = screen.getAllByRole('link', { name: 'Dieses Format bestellen' });
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/de/order?format=digital',
      '/de/order?format=30x30cm',
      '/de/order?format=40x40cm',
      '/de/order?format=50x50cm',
    ]);
  });

  it('shows two product photos', () => {
    render(<PricingTiers />);
    expect(screen.getAllByRole('img')).toHaveLength(2);
  });
});
