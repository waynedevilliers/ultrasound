import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import OrderSection from './OrderSection';

const query = vi.hoisted(() => ({ search: '' }));
vi.mock('next/navigation', () => ({ useSearchParams: () => new URLSearchParams(query.search) }));

// The real form is replaced by a button that reports a sent order; it shows the format it received.
vi.mock('@/components/OrderForm', () => ({
  default: ({
    onSentChange,
    initialFormat,
  }: {
    onSentChange: (announcement: string) => void;
    initialFormat: unknown;
  }) => (
    <>
      <span data-testid="format">{JSON.stringify(initialFormat)}</span>
      <button
        type="button"
        onClick={() => onSentChange('Danke, dein Bild ist angekommen. Referenz P4L-261117-K7QM')}
      >
        send
      </button>
    </>
  ),
}));

const props = {
  title: 'Bestellen',
  thanksTitle: 'Danke',
  intro: 'Lade dein Ultraschallbild hoch.',
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

  it('passes the format from the order link to the form', () => {
    query.search = 'format=40x40cm';
    render(<OrderSection {...props} />);
    expect(screen.getByTestId('format')).toHaveTextContent('"product":"canvas"');
    expect(screen.getByTestId('format')).toHaveTextContent('"canvasSize":"40x40cm"');
    query.search = '';
  });

  it('has no format without an order link', () => {
    query.search = '';
    render(<OrderSection {...props} />);
    expect(screen.getByTestId('format')).toHaveTextContent('null');
  });
});
