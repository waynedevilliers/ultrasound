// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const head = vi.hoisted(() => vi.fn());
vi.mock('@vercel/blob', () => ({ head }));
vi.mock('@vercel/postgres', () => ({ sql: vi.fn() }));
vi.mock('resend', () => ({ Resend: vi.fn() }));

import { POST } from './route';
import { sql } from '@vercel/postgres';
import { Resend } from 'resend';
import { CONSENT_VERSION } from '@/lib/consent';

let client = 0;

function orderRequest(payload: Record<string, unknown>) {
  client += 1;
  return new NextRequest('http://localhost/api/orders', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': `10.0.0.${client}` },
    body: JSON.stringify(payload),
  });
}

function order(overrides: Record<string, unknown> = {}) {
  return {
    name: 'Ann',
    email: 'ann@example.com',
    product: 'digital',
    childName: '',
    weeksInWomb: '',
    specialRequests: '',
    website: '',
    consent: { processing: true, rights: true, showcase: false, version: CONSENT_VERSION },
    ultrasoundPath: 'orders/ultrasound-scan.jpg',
    referencePath: '',
    ...overrides,
  };
}

describe('POST /api/orders stored photos', () => {
  beforeEach(() => {
    head.mockReset();
  });

  it('names the upload field when the stored photo is missing', async () => {
    head.mockRejectedValue(new Error('not found'));
    const response = await POST(orderRequest(order()));
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.issues).toEqual([
      expect.objectContaining({
        field: 'ultrasoundPath',
        message: 'Upload missing. Please upload the photo again.',
      }),
    ]);
  });

  it('names the upload field when the stored photo has the wrong type', async () => {
    head.mockResolvedValue({ size: 100, contentType: 'application/pdf' });
    const response = await POST(orderRequest(order()));
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.issues[0]).toMatchObject({ field: 'ultrasoundPath' });
  });

  it('rejects a reference photo path outside the upload folder', async () => {
    head.mockResolvedValue({ size: 100, contentType: 'image/png' });
    const response = await POST(orderRequest(order({ referencePath: 'private/other-order.png' })));
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.issues).toEqual([expect.objectContaining({ field: 'referencePath' })]);
    expect(head).not.toHaveBeenCalledWith('private/other-order.png');
  });

  it('answers a failed save with a request code the customer can quote', async () => {
    head.mockResolvedValue({ size: 100, contentType: 'image/png' });
    vi.mocked(sql).mockRejectedValueOnce(new Error('connection refused'));
    const response = await POST(orderRequest(order()));
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.code).toMatch(/^[0-9a-f]{8}$/);
  });
});

describe('POST /api/orders logging and email', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;
  let send: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    process.env.ORDER_LINK_SECRET = 'test-link-secret';
    head.mockReset();
    vi.mocked(sql).mockReset();
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    send = vi.fn().mockResolvedValue({ data: { id: 'email-1' }, error: null });
    vi.mocked(Resend).mockImplementation(function () {
      return { emails: { send } } as never;
    });
    head.mockResolvedValue({ size: 100, contentType: 'image/png' });
    vi.mocked(sql).mockResolvedValue({ rows: [{ id: 7, created_at: new Date() }] } as never);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('answers invalid JSON with a 400 and no database write', async () => {
    const request = new NextRequest('http://localhost/api/orders', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': '10.1.0.1' },
      body: '{not json',
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
    expect(sql).not.toHaveBeenCalled();
  });

  it('rejects a bot that fills the honeypot and saves nothing', async () => {
    const response = await POST(orderRequest(order({ website: 'spam' })));
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ success: false, message: 'Invalid order data' });
    expect(sql).not.toHaveBeenCalled();
  });

  it('returns field issues for an invalid order without a database write', async () => {
    const response = await POST(
      orderRequest(
        order({
          consent: { processing: false, rights: true, showcase: false, version: CONSENT_VERSION },
        }),
      ),
    );
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.issues).toEqual([expect.objectContaining({ field: 'consent.processing' })]);
    expect(sql).not.toHaveBeenCalled();
  });

  it('logs a failed photo lookup with the request code', async () => {
    head.mockRejectedValue(new Error('store unavailable'));
    const response = await POST(orderRequest(order()));
    expect(response.status).toBe(400);
    const line = String(errorSpy.mock.calls.at(-1)?.[0]);
    expect(line).toMatch(/^\[order [0-9a-f]{8}\] photo-check failed: Error: store unavailable$/);
  });

  it('saves the order, sends both emails and returns 201 with the order number', async () => {
    const response = await POST(orderRequest(order()));
    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data).toMatchObject({
      success: true,
      reference: expect.stringMatching(/^P4L-\d{6}-[A-HJ-NP-Z2-9]{4}$/),
    });
    // The running number stays internal and is not returned to the visitor.
    expect(data).not.toHaveProperty('orderId');
    expect(send).toHaveBeenCalledTimes(2);
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('still answers 201 when an email is refused, and logs the Resend reason', async () => {
    send.mockResolvedValueOnce({
      data: null,
      error: { name: 'validation_error', message: 'Sender not allowed', statusCode: 403 },
    });
    const response = await POST(orderRequest(order()));
    expect(response.status).toBe(201);
    const line = String(errorSpy.mock.calls.at(-1)?.[0]);
    expect(line).toMatch(
      /^\[order [0-9a-f]{8}\] email failed: validation_error: Sender not allowed \(status 403\)$/,
    );
  });

  it('logs a failed database save as the save step', async () => {
    vi.mocked(sql).mockRejectedValueOnce(new Error('connection refused'));
    await POST(orderRequest(order()));
    expect(String(errorSpy.mock.calls.at(-1)?.[0])).toMatch(
      /^\[order [0-9a-f]{8}\] save failed: Error: connection refused$/,
    );
  });

  it('saves the order again with a new reference after a reference conflict', async () => {
    const conflict = {
      code: '23505',
      constraint: 'idx_orders_reference',
      message: 'duplicate key value violates unique constraint "idx_orders_reference"',
    };
    vi.mocked(sql).mockReset();
    vi.mocked(sql)
      .mockRejectedValueOnce(conflict)
      .mockResolvedValueOnce({ rows: [] } as never);
    const response = await POST(orderRequest(order()));
    expect(response.status).toBe(201);
    expect(sql).toHaveBeenCalledTimes(2);
    expect(await response.json()).toMatchObject({
      reference: expect.stringMatching(/^P4L-\d{6}-[A-HJ-NP-Z2-9]{4}$/),
    });
  });

  it('uses the request code the browser sent, so the upload and order logs match', async () => {
    vi.mocked(sql).mockRejectedValueOnce(new Error('connection refused'));
    const response = await POST(orderRequest(order({ requestCode: 'a1b2c3d4' })));
    expect(await response.json()).toMatchObject({ code: 'a1b2c3d4' });
    expect(String(errorSpy.mock.calls.at(-1)?.[0])).toMatch(/^\[order a1b2c3d4\] save failed: /);
  });

  it('ignores a request code that is not in the expected format', async () => {
    vi.mocked(sql).mockRejectedValueOnce(new Error('connection refused'));
    const response = await POST(orderRequest(order({ requestCode: '../../etc' })));
    const data = await response.json();
    expect(data.code).toMatch(/^[0-9a-f]{8}$/);
    expect(String(errorSpy.mock.calls.at(-1)?.[0])).not.toContain('../../etc');
  });

  it('tells the visitor a confirmation is on its way only when the customer email was accepted', async () => {
    const accepted = await (await POST(orderRequest(order()))).json();
    expect(accepted.confirmationSent).toBe(true);

    send.mockResolvedValueOnce({ data: null, error: { name: 'x', message: 'y', statusCode: 422 } });
    send.mockResolvedValueOnce({ data: null, error: { name: 'x', message: 'y', statusCode: 422 } });
    const refused = await (await POST(orderRequest(order()))).json();
    expect(refused.confirmationSent).toBe(false);
  });

  it('keeps a saved order successful when the photo links cannot be made', async () => {
    delete process.env.ORDER_LINK_SECRET;
    const response = await POST(orderRequest(order()));
    expect(response.status).toBe(201);
    expect(String(errorSpy.mock.calls.at(-1)?.[0])).toMatch(
      /^\[order [0-9a-f]{8}\] links failed: Error: ORDER_LINK_SECRET is not set$/,
    );
    const adminEmail = send.mock.calls[0][0];
    expect(adminEmail.html).toContain('Photo links could not be created');
  });

  it('sends the customer email in German for a German page', async () => {
    await POST(orderRequest(order({ locale: 'de' })));
    const customerEmail = send.mock.calls[1][0];
    expect(customerEmail.subject).toBe('Bestellung bestätigt: Portraits 4 Life');
    expect(customerEmail.html).toContain('Danke für deine Bestellung!');
  });

  it('sends the customer email in English for an English page', async () => {
    await POST(orderRequest(order({ locale: 'en' })));
    const customerEmail = send.mock.calls[1][0];
    expect(customerEmail.subject).toBe('Order confirmed: Portraits 4 Life');
    expect(customerEmail.html).toContain('Thank you for your order!');
  });

  it('still answers 201 when sending throws', async () => {
    send.mockRejectedValueOnce(new Error('network down'));
    const response = await POST(orderRequest(order()));
    expect(response.status).toBe(201);
    expect(String(errorSpy.mock.calls.at(-1)?.[0])).toContain('email failed: Error: network down');
  });
});
