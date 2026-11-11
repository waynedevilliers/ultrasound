import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import OrderForm from './OrderForm';

vi.mock('next/navigation', () => ({ usePathname: () => '/en/order' }));

function productSelect(container: HTMLElement) {
  return container.querySelector('select[name="product"]') as HTMLSelectElement;
}

describe('OrderForm', () => {
  it('shows canvas sizes only when Canvas Print is selected', () => {
    const { container } = render(<OrderForm />);
    expect(container.querySelector('select[name="canvasSize"]')).toBeNull();
    fireEvent.change(productSelect(container), { target: { value: 'canvas' } });
    const sizes = container.querySelector('select[name="canvasSize"]') as HTMLSelectElement;
    expect(sizes).not.toBeNull();
    expect(Array.from(sizes.options).map((o) => o.value)).toEqual(['30x30cm', '40x40cm', '50x50cm']);
  });

  it('rejects an upload over 15 MB with a visible message', () => {
    const { container } = render(<OrderForm />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const big = new File([new Uint8Array(15 * 1024 * 1024 + 1)], 'big.png', { type: 'image/png' });
    fireEvent.change(input, { target: { files: [big] } });
    expect(screen.getByText(/larger than 15 MB/)).toBeInTheDocument();
  });
});
