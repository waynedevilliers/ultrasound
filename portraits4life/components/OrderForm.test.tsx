import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import OrderForm from './OrderForm';
import { formatOptions } from '@/lib/format-options';

vi.mock('next/navigation', () => ({ usePathname: () => '/en/order' }));
vi.mock('@vercel/blob/client', () => ({
  upload: vi.fn(async (path: string) => ({ pathname: `${path}/stored.png` })),
}));

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
  it('lists the products with their prices and shows shipping only for a canvas size', () => {
    const { container } = render(<OrderForm />);
    const list = container.querySelector('#format') as HTMLSelectElement;
    expect(Array.from(list.options).map((o) => o.textContent)).toEqual(formatOptions('en').map((o) => o.label));
    expect(container.querySelector('#shippingStreet')).toBeNull();
    fireEvent.change(list, { target: { value: '40x40cm' } });
    expect(list.value).toBe('40x40cm');
    expect(container.querySelector('#shippingStreet')).not.toBeNull();
    fireEvent.change(list, { target: { value: 'digital' } });
    expect(container.querySelector('#shippingStreet')).toBeNull();
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

  it('asks for the week of pregnancy as a number from 1 to 42 and shows the required-field note', () => {
    const { container } = render(<OrderForm />);
    const weeks = container.querySelector('#weeksInWomb') as HTMLInputElement;
    expect(weeks).toHaveAttribute('type', 'number');
    expect(weeks).toHaveAttribute('min', '1');
    expect(weeks).toHaveAttribute('max', '42');
    expect(weeks).toHaveAttribute('inputmode', 'numeric');
    expect(screen.getByText('* Required field')).toBeInTheDocument();
  });
  it('preselects the format from the order link', () => {
    const { container } = render(<OrderForm initialFormat={{ product: 'canvas', canvasSize: '50x50cm' }} />);
    expect((container.querySelector('#format') as HTMLSelectElement).value).toBe('50x50cm');
    expect(container.querySelector('#shippingStreet')).not.toBeNull();
  });
});
