import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import OrderSection from './OrderSection';
import type { FormatChoice } from '@/lib/format-param';

// The real form is replaced by a button that reports a sent order; after sending it shows the success
// heading the real form shows, and the format it received.
vi.mock('@/components/OrderForm', () => ({
  default: function FakeOrderForm({
    onSentChange,
    initialFormat,
  }: {
    onSentChange: (announcement: string) => void;
    initialFormat: unknown;
  }) {
    const [sent, setSent] = React.useState(false);
    return sent ? (
      <h1 id="order-success-heading">Danke, dein Bild ist bei mir angekommen!</h1>
    ) : (
      <>
        <span data-testid="format">{JSON.stringify(initialFormat)}</span>
        <button
          type="button"
          onClick={() => {
            setSent(true);
            onSentChange('Danke, dein Bild ist angekommen. Referenz P4L-261117-K7QM');
          }}
        >
          send
        </button>
      </>
    );
  },
}));

const props = {
  title: 'Bestellen',
  thanksTitle: 'Danke',
  intro: 'Lade dein Ultraschallbild hoch.',
  initialFormat: null as FormatChoice | null,
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

  it('shows only the success heading after sending, and hides the intro', () => {
    render(<OrderSection {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'send' }));
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Danke, dein Bild');
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
    render(
      <OrderSection {...props} initialFormat={{ product: 'canvas', canvasSize: '40x40cm' }} />,
    );
    expect(screen.getByTestId('format')).toHaveTextContent('"product":"canvas"');
    expect(screen.getByTestId('format')).toHaveTextContent('"canvasSize":"40x40cm"');
  });

  it('has no format without an order link', () => {
    render(<OrderSection {...props} />);
    expect(screen.getByTestId('format')).toHaveTextContent('null');
  });
});
