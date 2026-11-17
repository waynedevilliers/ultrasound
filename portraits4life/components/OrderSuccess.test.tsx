import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import OrderSuccess from './OrderSuccess';

const props = {
  title: 'Danke für deine Bestellung!',
  submitted: 'Deine Bestellung wurde erfolgreich eingereicht.',
  orderIdLabel: 'Bestellnummer:',
  reference: 'P4L-261117-K7QM',
  contact: 'Ich werde dich innerhalb von 2 Werktagen kontaktieren.',
};

describe('OrderSuccess', () => {
  it('shows the title as a second-level heading', () => {
    render(<OrderSuccess {...props} />);
    expect(screen.getByRole('heading', { level: 2, name: props.title })).toBeInTheDocument();
  });

  it('shows the order number and the contact line', () => {
    render(<OrderSuccess {...props} />);
    expect(screen.getByText(props.orderIdLabel)).toBeInTheDocument();
    expect(screen.getByText(/P4L-261117-K7QM/)).toBeInTheDocument();
    expect(screen.getByText(props.contact)).toBeInTheDocument();
  });

  it('hides the check icon from screen readers', () => {
    const { container } = render(<OrderSuccess {...props} />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('uses the site colors and no status color', () => {
    const { container } = render(<OrderSuccess {...props} />);
    expect(container.innerHTML).not.toMatch(/success|green/);
  });
});
