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
  it('marks the photo field and links it to its message when no photo is chosen', () => {
    const { container } = render(<OrderForm />);
    fireEvent.submit(container.querySelector('form') as HTMLFormElement);
    const input = container.querySelector('#ultrasoundImage') as HTMLInputElement;
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'ultrasound-error');
    expect(document.getElementById('ultrasound-error')).toHaveTextContent(/ultrasound image/i);
    expect(screen.getByText('Please check the highlighted fields.')).toBeInTheDocument();
  });
});
