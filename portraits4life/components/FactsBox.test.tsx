import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import FactsBox from './FactsBox';

vi.mock('next/navigation', () => ({ usePathname: () => '/en' }));

describe('FactsBox', () => {
  it('shows the five key facts in English', () => {
    render(<FactsBox locale="en" />);
    expect(document.querySelectorAll('dt')).toHaveLength(5);
    expect(screen.getByText('Formats')).toBeInTheDocument();
    expect(screen.getByText('Price')).toBeInTheDocument();
    expect(screen.getByText('Delivery')).toBeInTheDocument();
    expect(screen.getByText('Payment')).toBeInTheDocument();
    expect(screen.getByText('Optional')).toBeInTheDocument();
  });

  it('takes the lowest price and canvas sizes from the product data', () => {
    render(<FactsBox locale="en" />);
    expect(screen.getByText('From €89')).toBeInTheDocument();
    expect(screen.getByText(/30 × 30, 40 × 40, or 50 × 50 cm/)).toBeInTheDocument();
    expect(screen.getByText('Canvas 1 to 2 weeks after payment')).toBeInTheDocument();
  });

  it('marks the decorative icons as hidden from screen readers', () => {
    const { container } = render(<FactsBox locale="en" />);
    const icons = container.querySelectorAll('svg');
    expect(icons).toHaveLength(5);
    icons.forEach((icon) => expect(icon).toHaveAttribute('aria-hidden', 'true'));
    expect(within(container).queryAllByRole('img')).toHaveLength(0);
  });
});
