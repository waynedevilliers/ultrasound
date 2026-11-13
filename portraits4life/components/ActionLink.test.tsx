import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import ActionLink, { buttonClasses } from './ActionLink';

describe('ActionLink', () => {
  it('renders an internal path with its href and no new-tab attributes', () => {
    render(<ActionLink href="/en/order">Order</ActionLink>);
    const link = screen.getByRole('link', { name: 'Order' });
    expect(link).toHaveAttribute('href', '/en/order');
    expect(link).not.toHaveAttribute('target');
  });

  it('renders an anchor as a plain link', () => {
    render(<ActionLink href="#pricing" variant="secondary">Formats</ActionLink>);
    const link = screen.getByRole('link', { name: 'Formats' });
    expect(link).toHaveAttribute('href', '#pricing');
    expect(link).not.toHaveAttribute('target');
  });

  it('opens external URLs in a new tab with safe rel and screen reader text (en)', () => {
    render(<ActionLink href="https://example.com/page" locale="en">Visit</ActionLink>);
    const link = screen.getByRole('link', { name: /Visit/ });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.getByText('(opens in new tab)')).toBeInTheDocument();
  });

  it('uses the German screen reader text by default', () => {
    render(<ActionLink href="https://example.com">Besuchen</ActionLink>);
    expect(screen.getByText('(öffnet in neuem Tab)')).toBeInTheDocument();
  });

  it('renders mailto as a plain anchor without new-tab attributes', () => {
    render(<ActionLink href="mailto:portraits4life.art@gmail.com" variant="secondary">Email</ActionLink>);
    const link = screen.getByRole('link', { name: 'Email' });
    expect(link).toHaveAttribute('href', 'mailto:portraits4life.art@gmail.com');
    expect(link).not.toHaveAttribute('target');
  });

  it('primary is filled and secondary is outlined', () => {
    expect(buttonClasses('primary')).toContain('bg-brand');
    expect(buttonClasses('primary')).toContain('min-h-(--button-min-height)');
    expect(buttonClasses('secondary')).toContain('border-[1.5px] border-brand');
    expect(buttonClasses('secondary')).toContain('min-h-11');
  });
});
