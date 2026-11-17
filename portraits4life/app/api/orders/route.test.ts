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
    expect(await response.json()).toMatchObject({ success: true, orderId: 7 });
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

  it('still answers 201 when sending throws', async () => {
    send.mockRejectedValueOnce(new Error('network down'));
    const response = await POST(orderRequest(order()));
    expect(response.status).toBe(201);
    expect(String(errorSpy.mock.calls.at(-1)?.[0])).toContain('email failed: Error: network down');
  });
});
