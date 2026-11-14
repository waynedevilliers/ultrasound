import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import Breadcrumb from './Breadcrumb';

describe('Breadcrumb', () => {
  it('renders links for ancestors and marks the current page', () => {
    render(<Breadcrumb label="Breadcrumb" items={[{ label: 'Home', href: '/en' }, { label: 'Order' }]} />);
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/en');
    expect(screen.getByText('Order')).toHaveAttribute('aria-current', 'page');
  });

  it('hides the separators from screen readers', () => {
    const { container } = render(
      <Breadcrumb label="Breadcrumb" items={[{ label: 'Home', href: '/en' }, { label: 'Order' }]} />
    );
    const separators = container.querySelectorAll('[aria-hidden="true"]');
    expect(separators).toHaveLength(1);
    expect(separators[0]).toHaveTextContent('|');
  });
});
