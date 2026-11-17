import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import OrderSection from './OrderSection';

// The real form is replaced by a button that reports a sent order.
vi.mock('@/components/OrderForm', () => ({
  default: ({ onSentChange }: { onSentChange: (sent: boolean) => void }) => (
    <button type="button" onClick={() => onSentChange(true)}>
      send
    </button>
  ),
}));

const props = {
  title: 'Bestellen',
  thanksTitle: 'Danke',
  intro: 'Lade dein Ultraschallbild hoch.',
  initialFormat: null,
};

describe('OrderSection', () => {
  it('shows the order heading and intro before sending', () => {
    render(<OrderSection {...props} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Bestellen' })).toBeInTheDocument();
    expect(screen.getByText(props.intro)).toBeInTheDocument();
  });

  it('changes the heading to thanks and hides the intro after sending', () => {
    render(<OrderSection {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'send' }));
    expect(screen.getByRole('heading', { level: 1, name: 'Danke' })).toBeInTheDocument();
    expect(screen.queryByText(props.intro)).toBeNull();
  });
});
