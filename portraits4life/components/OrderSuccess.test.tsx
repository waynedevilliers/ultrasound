import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import OrderSuccess from './OrderSuccess';

const props = {
  headingId: 'h-success',
  title: 'Danke, dein Bild ist bei mir angekommen!',
  referenceLabel: 'Deine Referenz:',
  reference: 'P4L-261117-K7QM',
  nextStepsTitle: 'So geht es weiter:',
  steps: ['Schritt eins', 'Schritt zwei', 'Schritt drei'],
  backHome: 'Zur Startseite',
  homeHref: '/de',
};

describe('OrderSuccess', () => {
  it('shows the title as a second-level heading', () => {
    render(<OrderSuccess {...props} />);
    expect(screen.getByRole('heading', { level: 2, name: props.title })).toBeInTheDocument();
  });

  it('shows the reference, not the running number', () => {
    render(<OrderSuccess {...props} />);
    expect(screen.getByText(props.referenceLabel)).toBeInTheDocument();
    expect(screen.getByText(props.reference)).toBeInTheDocument();
  });

  it('lists the three next steps in order', () => {
    render(<OrderSuccess {...props} />);
    const items = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(items.map((item) => item.textContent)).toEqual(props.steps);
  });

  it('shows the confirmation line only when one is given', () => {
    const { rerender } = render(<OrderSuccess {...props} />);
    expect(screen.queryByText(/Spam/)).toBeNull();
    rerender(
      <OrderSuccess
        {...props}
        confirmation="Eine Bestätigung ist unterwegs an anna@example.com. Schau auch im Spam Ordner nach."
      />,
    );
    expect(screen.getByText(/anna@example\.com/)).toBeInTheDocument();
  });

  it('links back to the home page', () => {
    render(<OrderSuccess {...props} />);
    expect(screen.getByRole('link', { name: 'Zur Startseite' })).toHaveAttribute('href', '/de');
  });

  it('hides the check icon from screen readers', () => {
    const { container } = render(<OrderSuccess {...props} />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });
});
