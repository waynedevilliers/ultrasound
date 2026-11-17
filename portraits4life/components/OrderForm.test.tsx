import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import OrderForm from './OrderForm';
import { formatOptions } from '@/lib/format-options';

vi.mock('next/navigation', () => ({ usePathname: () => '/en/order' }));
vi.mock('@vercel/blob/client', () => ({
  upload: vi.fn(async (path: string) => ({ pathname: `${path}/stored.png` })),
}));

// jsdom has no matchMedia or scrolling; the success view uses both.
window.matchMedia = vi
  .fn()
  .mockReturnValue({ matches: false }) as unknown as typeof window.matchMedia;
Element.prototype.scrollIntoView = vi.fn();

function photoInput(container: HTMLElement) {
  return container.querySelector('#ultrasoundImage') as HTMLInputElement;
}

function smallPng() {
  return new File([new Uint8Array(100)], 'scan.png', { type: 'image/png' });
}

// Submits the form with a photo chosen, the way a visitor would after filling it in.
function submitWithPhoto(container: HTMLElement) {
  fireEvent.change(container.querySelector('input[name="name"]') as HTMLInputElement, {
    target: { value: 'Ann' },
  });
  fireEvent.change(container.querySelector('input[name="email"]') as HTMLInputElement, {
    target: { value: 'ann@example.com' },
  });
  fireEvent.click(container.querySelector('#consentProcessing') as HTMLElement);
  fireEvent.click(container.querySelector('#consentRights') as HTMLElement);
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
    expect(Array.from(list.options).map((o) => o.textContent)).toEqual(
      formatOptions('en').map((o) => o.label),
    );
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

    fireEvent.change(email, { target: { value: 'ann@example.org' } });
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
    expect(await screen.findByRole('alert')).toHaveTextContent('No connection to the server.');
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
    const { container } = render(
      <OrderForm initialFormat={{ product: 'canvas', canvasSize: '50x50cm' }} />,
    );
    expect((container.querySelector('#format') as HTMLSelectElement).value).toBe('50x50cm');
    expect(container.querySelector('#shippingStreet')).not.toBeNull();
  });
  it('shows the chosen file name and size, and Remove clears it', () => {
    const { container } = render(<OrderForm />);
    fireEvent.change(photoInput(container), { target: { files: [smallPng()] } });
    expect(screen.getByText(/scan\.png \(100 KB\)|scan\.png \(1 KB\)/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Remove' }));
    expect(screen.queryByText(/scan\.png/)).toBeNull();
  });
  it('shows the trust text under the button and links the privacy line to the privacy page', () => {
    render(<OrderForm />);
    expect(
      screen.getByText('I check your image and get back to you by email. You pay only after that.'),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Privacy Policy' })[0]).toHaveAttribute(
      'href',
      '/en/datenschutz',
    );
  });
  it('marks every empty required field on an empty submit', () => {
    const { container } = render(<OrderForm />);
    fireEvent.submit(container.querySelector('form') as HTMLFormElement);
    for (const id of ['name', 'email', 'ultrasoundImage']) {
      const key = id === 'ultrasoundImage' ? 'ultrasound' : id;
      expect(document.getElementById(id) ?? container.querySelector('#' + id)).toHaveAttribute(
        'aria-invalid',
        'true',
      );
      expect(document.getElementById(key + '-error')).not.toBeNull();
    }
  });
  it('keeps the consent boxes unticked and asks for the required ones on submit', () => {
    const { container } = render(<OrderForm />);
    expect((container.querySelector('#consentProcessing') as HTMLInputElement).checked).toBe(false);
    expect((container.querySelector('#consentRights') as HTMLInputElement).checked).toBe(false);
    fireEvent.submit(container.querySelector('form') as HTMLFormElement);
    expect(container.querySelector('#consentProcessing')).toHaveAttribute('aria-invalid', 'true');
    expect(container.querySelector('#consentRights')).toHaveAttribute('aria-invalid', 'true');
  });
});

describe('OrderForm submit errors', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  it('shows the server message with the request code and logs the failure', async () => {
    const { upload } = await import('@vercel/blob/client');
    stubServer(
      async () =>
        new Response(JSON.stringify({ success: false, code: 'abc12345' }), { status: 500 }),
    );
    const { container } = render(<OrderForm />);
    submitWithPhoto(container);
    // The code shown is the one the browser sent with the upload, not the one in the reply.
    const code = vi.mocked(upload).mock.calls.at(-1)?.[2]?.clientPayload;
    expect(await screen.findByRole('alert')).toHaveTextContent(
      `The order could not be saved just now. Please try again later. (Error code: ${code})`,
    );
    expect(errorSpy).toHaveBeenCalledWith('Order submit failed', expect.anything());
  });

  it('shows the server message with the request code when the reply is not JSON, such as a gateway page', async () => {
    const { upload } = await import('@vercel/blob/client');
    stubServer(async () => new Response('<html>Bad gateway</html>', { status: 502 }));
    const { container } = render(<OrderForm />);
    submitWithPhoto(container);
    const code = vi.mocked(upload).mock.calls.at(-1)?.[2]?.clientPayload;
    expect(await screen.findByRole('alert')).toHaveTextContent(
      `The order could not be saved just now. Please try again later. (Error code: ${code})`,
    );
  });

  it('asks the visitor to wait when there are too many attempts', async () => {
    stubServer(async () => new Response(JSON.stringify({ success: false }), { status: 429 }));
    const { container } = render(<OrderForm />);
    submitWithPhoto(container);
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Too many attempts. Please wait a few minutes and try again.',
    );
  });

  it('shows the generic message, not a server failure, when the order is rejected without a field', async () => {
    stubServer(
      async () =>
        new Response(JSON.stringify({ success: false, message: 'Invalid order data' }), {
          status: 400,
        }),
    );
    const { container } = render(<OrderForm />);
    submitWithPhoto(container);
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('The order could not be sent. Please try again.');
    expect(alert).not.toHaveTextContent('could not be saved');
  });

  it('marks the consent box the server rejects', async () => {
    stubServer(
      async () =>
        new Response(
          JSON.stringify({
            success: false,
            issues: [{ field: 'consent.rights', message: 'Invalid' }],
          }),
          { status: 400 },
        ),
    );
    const { container } = render(<OrderForm />);
    submitWithPhoto(container);
    await waitFor(() =>
      expect(container.querySelector('#consentRights')).toHaveAttribute('aria-invalid', 'true'),
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Please check the highlighted fields.');
  });

  it('shows the upload message when the photo cannot be sent, and does not call the order endpoint', async () => {
    const { upload } = await import('@vercel/blob/client');
    vi.mocked(upload).mockRejectedValueOnce(new Error('token refused'));
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const { container } = render(<OrderForm />);
    submitWithPhoto(container);
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'The image could not be uploaded. Please try again.',
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('shows the request code when the photo upload fails', async () => {
    const { upload } = await import('@vercel/blob/client');
    vi.mocked(upload).mockRejectedValueOnce(new Error('token refused'));
    vi.stubGlobal('fetch', vi.fn());
    const { container } = render(<OrderForm />);
    submitWithPhoto(container);
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(
      /The image could not be uploaded\. Please try again\. \(Error code: [0-9a-f]{8}\)/,
    );
    const code = vi.mocked(upload).mock.calls.at(-1)?.[2]?.clientPayload;
    expect(alert.textContent).toContain(`(Error code: ${code})`);
  });

  it('sends the code used for the photo upload with the order', async () => {
    const { upload } = await import('@vercel/blob/client');
    const bodies: string[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, init: RequestInit) => {
        bodies.push(String(init.body));
        return new Response(JSON.stringify({ success: true, reference: 'P4L-261117-K7QM' }), {
          status: 201,
        });
      }),
    );
    const { container } = render(<OrderForm />);
    submitWithPhoto(container);
    await screen.findByText(/P4L-261117-K7QM/);
    const code = vi.mocked(upload).mock.calls.at(-1)?.[2]?.clientPayload;
    expect(code).toMatch(/^[0-9a-f]{8}$/);
    expect(JSON.parse(bodies[0]).requestCode).toBe(code);
    // The page is /en/order in this test, so the email language is English.
    expect(JSON.parse(bodies[0]).locale).toBe('en');
  });

  it('does not report success when a successful reply cannot be read', async () => {
    stubServer(async () => new Response('<html>cut off', { status: 201 }));
    const { container } = render(<OrderForm />);
    submitWithPhoto(container);
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(
      /^The order could not be saved just now\. Please try again later\. \(Error code: [0-9a-f]{8}\)$/,
    );
    expect(screen.queryByText(/Order ID/)).toBeNull();
    expect((container.querySelector('input[name="name"]') as HTMLInputElement).value).toBe('Ann');
  });

  it('does not report success when the reply has no order number', async () => {
    stubServer(async () => new Response(JSON.stringify({ success: true }), { status: 201 }));
    const { container } = render(<OrderForm />);
    submitWithPhoto(container);
    expect(await screen.findByRole('alert')).toHaveTextContent('could not be saved just now');
    expect(screen.queryByText(/Order ID/)).toBeNull();
  });

  it('keeps the request code when the connection drops during the order request', async () => {
    const { upload } = await import('@vercel/blob/client');
    stubServer(async () => {
      throw new TypeError('connection reset');
    });
    const { container } = render(<OrderForm />);
    submitWithPhoto(container);
    const alert = await screen.findByRole('alert');
    const code = vi.mocked(upload).mock.calls.at(-1)?.[2]?.clientPayload;
    expect(alert.textContent).toContain(
      `No connection to the server. Please check your internet connection and try again. (Error code: ${code})`,
    );
  });

  it('shows the network message when the connection drops', async () => {
    stubServer(async () => {
      throw new TypeError('offline');
    });
    const { container } = render(<OrderForm />);
    submitWithPhoto(container);
    expect(await screen.findByRole('alert')).toHaveTextContent('No connection to the server.');
    expect(errorSpy).toHaveBeenCalled();
  });

  it('names the address the confirmation went to, only when the mail service accepted it', async () => {
    stubServer(
      async () =>
        new Response(
          JSON.stringify({ success: true, reference: 'P4L-261117-K7QM', confirmationSent: true }),
          {
            status: 201,
          },
        ),
    );
    const { container } = render(<OrderForm />);
    submitWithPhoto(container);
    expect(await screen.findByText(/ann@example\.com/)).toBeInTheDocument();
    expect(screen.getByText(/spam folder/i)).toBeInTheDocument();
  });

  it('describes the file delivery after a digital order', async () => {
    stubServer(
      async () =>
        new Response(JSON.stringify({ success: true, reference: 'P4L-261117-K7QM' }), {
          status: 201,
        }),
    );
    const { container } = render(<OrderForm />);
    submitWithPhoto(container);
    expect(await screen.findByText(/receive the file by email/)).toBeInTheDocument();
    expect(screen.queryByText(/canvas is printed/)).toBeNull();
  });

  it('describes the printing after a canvas order', async () => {
    stubServer(
      async () =>
        new Response(JSON.stringify({ success: true, reference: 'P4L-261117-K7QM' }), {
          status: 201,
        }),
    );
    const { container } = render(
      <OrderForm initialFormat={{ product: 'canvas', canvasSize: '30x30cm' }} />,
    );
    submitWithPhoto(container);
    for (const [id, value] of [
      ['shippingFullName', 'Ann Test'],
      ['shippingStreet', 'Hauptstraße 1'],
      ['shippingCity', 'Berlin'],
      ['shippingState', 'Berlin'],
      ['shippingPostalCode', '10115'],
      ['shippingCountry', 'Germany'],
    ]) {
      fireEvent.change(container.querySelector(`#${id}`) as HTMLInputElement, {
        target: { value },
      });
    }
    fireEvent.submit(container.querySelector('form') as HTMLFormElement);
    expect(await screen.findByText(/canvas is printed/)).toBeInTheDocument();
    expect(screen.queryByText(/receive the file by email/)).toBeNull();
  });

  it('shows no confirmation line when the mail service did not accept the email', async () => {
    stubServer(
      async () =>
        new Response(
          JSON.stringify({ success: true, reference: 'P4L-261117-K7QM', confirmationSent: false }),
          {
            status: 201,
          },
        ),
    );
    const { container } = render(<OrderForm />);
    submitWithPhoto(container);
    await screen.findByText(/P4L-261117-K7QM$/);
    expect(screen.queryByText(/spam folder/i)).toBeNull();
  });

  it('shows the order reference after a successful order, and not the running number', async () => {
    stubServer(
      async () =>
        new Response(JSON.stringify({ success: true, reference: 'P4L-261117-K7QM', orderId: 42 }), {
          status: 201,
        }),
    );
    const { container } = render(<OrderForm />);
    submitWithPhoto(container);
    expect(await screen.findByText(/P4L-261117-K7QM$/)).toBeInTheDocument();
    expect(screen.queryByText(/#42/)).toBeNull();
    expect(screen.queryByRole('alert')).toBeNull();
  });
});

describe('OrderForm success focus', () => {
  it('announces the success message and moves focus to it', async () => {
    stubServer(
      async () =>
        new Response(JSON.stringify({ success: true, reference: 'P4L-261117-K7QM' }), {
          status: 201,
        }),
    );
    const { container } = render(<OrderForm />);
    submitWithPhoto(container);
    const status = await screen.findByRole('status');
    expect(status).toHaveFocus();
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    });
  });
});
