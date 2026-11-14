// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const head = vi.hoisted(() => vi.fn());
vi.mock('@vercel/blob', () => ({ head }));
vi.mock('@vercel/postgres', () => ({ sql: vi.fn() }));
vi.mock('resend', () => ({ Resend: vi.fn() }));

import { POST } from './route';

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
});
