import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import OrderSection from './OrderSection';

// The real form is replaced by a button that reports a sent order with its announcement text.
vi.mock('@/components/OrderForm', () => ({
  default: ({ onSentChange }: { onSentChange: (announcement: string) => void }) => (
    <button
      type="button"
      onClick={() => onSentChange('Danke, dein Bild ist angekommen. Referenz P4L-261117-K7QM')}
    >
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

beforeEach(() => {
  window.matchMedia = vi
    .fn()
    .mockReturnValue({ matches: false }) as unknown as typeof window.matchMedia;
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
});

describe('OrderSection', () => {
  it('shows the order heading and intro before sending', () => {
    render(<OrderSection {...props} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Bestellen' })).toBeInTheDocument();
    expect(screen.getByText(props.intro)).toBeInTheDocument();
  });

  it('keeps an empty live region on the page before sending', () => {
    render(<OrderSection {...props} />);
    expect(screen.getByRole('status')).toHaveTextContent('');
  });

  it('changes the heading to thanks and hides the intro after sending', () => {
    render(<OrderSection {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'send' }));
    expect(screen.getByRole('heading', { level: 1, name: 'Danke' })).toBeInTheDocument();
    expect(screen.queryByText(props.intro)).toBeNull();
  });

  it('announces the sent order in the live region', () => {
    render(<OrderSection {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'send' }));
    expect(screen.getByRole('status')).toHaveTextContent('P4L-261117-K7QM');
  });

  it('scrolls the heading into view below the header after sending', () => {
    render(<OrderSection {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'send' }));
    expect(window.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'smooth' }));
  });
});
