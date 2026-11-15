import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import OrderForm from './OrderForm';

vi.mock('next/navigation', () => ({ usePathname: () => '/en/order' }));
vi.mock('@vercel/blob/client', () => ({
  upload: vi.fn(async (path: string) => ({ pathname: `${path}/stored.png` })),
}));

function productSelect(container: HTMLElement) {
  return container.querySelector('select[name="product"]') as HTMLSelectElement;
}

function photoInput(container: HTMLElement) {
  return container.querySelector('#ultrasoundImage') as HTMLInputElement;
}

function smallPng() {
  return new File([new Uint8Array(100)], 'scan.png', { type: 'image/png' });
}

// Submits the form with a photo chosen, the way a visitor would after filling it in.
function submitWithPhoto(container: HTMLElement) {
  fireEvent.change(photoInput(container), { target: { files: [smallPng()] } });
  fireEvent.submit(container.querySelector('form') as HTMLFormElement);
}

function stubServer(response: () => Promise<Response>) {
  vi.stubGlobal('fetch', vi.fn(response));
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('OrderForm', () => {
  it('shows canvas sizes only when Canvas Print is selected', () => {
    const { container } = render(<OrderForm />);
    expect(container.querySelector('select[name="canvasSize"]')).toBeNull();
    fireEvent.change(productSelect(container), { target: { value: 'canvas' } });
    const sizes = container.querySelector('select[name="canvasSize"]') as HTMLSelectElement;
    expect(sizes).not.toBeNull();
    expect(Array.from(sizes.options).map((o) => o.value)).toEqual([
      '30x30cm',
      '40x40cm',
      '50x50cm',
    ]);
  });

  it('rejects an upload over 15 MB and marks the photo field', () => {
    const { container } = render(<OrderForm />);
    const big = new File([new Uint8Array(15 * 1024 * 1024 + 1)], 'big.png', { type: 'image/png' });
    fireEvent.change(photoInput(container), { target: { files: [big] } });
    expect(document.getElementById('ultrasound-error')).toHaveTextContent(/larger than 15 MB/);
    expect(photoInput(container)).toHaveAttribute('aria-invalid', 'true');
    expect(photoInput(container)).toHaveAttribute('aria-describedby', 'ultrasound-error');
  });

  it('marks the photo field and links it to its message when no photo is chosen', () => {
    const { container } = render(<OrderForm />);
    fireEvent.submit(container.querySelector('form') as HTMLFormElement);
    expect(photoInput(container)).toHaveAttribute('aria-invalid', 'true');
    expect(document.getElementById('ultrasound-error')).toHaveTextContent(/ultrasound image/i);
    expect(screen.getByText('Please check the highlighted fields.')).toBeInTheDocument();
  });

  it('marks a field the server rejects and clears it when the visitor changes it', async () => {
    stubServer(
      async () =>
        new Response(
          JSON.stringify({
            success: false,
            message: 'Invalid order data',
            issues: [{ field: 'email', message: 'bad' }],
          }),
          {
            status: 400,
          },
        ),
    );
    const { container } = render(<OrderForm />);
    submitWithPhoto(container);

    const email = container.querySelector('input[name="email"]') as HTMLInputElement;
    await waitFor(() => expect(email).toHaveAttribute('aria-invalid', 'true'));
    expect(document.getElementById('email-error')).toHaveTextContent('Please check this field.');
    expect(screen.getByRole('alert')).toHaveTextContent('Please check the highlighted fields.');

    fireEvent.change(email, { target: { value: 'ann@example.com' } });
    expect(email).not.toHaveAttribute('aria-invalid');
    expect(document.getElementById('email-error')).toBeNull();
  });

  it('marks the photo field when the stored photo is missing on the server', async () => {
    stubServer(
      async () =>
        new Response(
          JSON.stringify({
            success: false,
            message: 'Upload missing. Please upload the photo again.',
            issues: [
              {
                field: 'ultrasoundPath',
                message: 'Upload missing. Please upload the photo again.',
              },
            ],
          }),
          { status: 400 },
        ),
    );
    const { container } = render(<OrderForm />);
    submitWithPhoto(container);
    await waitFor(() => expect(photoInput(container)).toHaveAttribute('aria-invalid', 'true'));
  });

  it('shows one localized message when the request cannot be sent', async () => {
    stubServer(async () => {
      throw new TypeError('network down');
    });
    const { container } = render(<OrderForm />);
    submitWithPhoto(container);
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'The order could not be sent. Please try again.',
    );
  });
});
