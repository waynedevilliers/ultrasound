// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const handleUpload = vi.hoisted(() => vi.fn());
vi.mock('@vercel/blob/client', () => ({ handleUpload }));

import { POST } from './route';

function uploadRequest(body: string) {
  return new NextRequest('http://localhost/api/orders/upload', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body,
  });
}

describe('POST /api/orders/upload', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    handleUpload.mockReset();
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('logs and refuses a body that is not JSON', async () => {
    const response = await POST(uploadRequest('not json'));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'Upload not allowed' });
    expect(errorSpy).toHaveBeenCalledWith('Upload token refused:', expect.any(String));
    expect(handleUpload).not.toHaveBeenCalled();
  });

  it('issues a token for a photo in the orders folder', async () => {
    handleUpload.mockImplementation(
      async (options: { onBeforeGenerateToken: (path: string) => Promise<unknown> }) => {
        const config = await options.onBeforeGenerateToken('orders/ultrasound-scan.jpg');
        return { type: 'blob.generate-client-token', clientToken: 'token', config };
      },
    );
    const response = await POST(uploadRequest('{"type":"blob.generate-client-token"}'));
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.config).toMatchObject({
      addRandomSuffix: true,
      maximumSizeInBytes: 15 * 1024 * 1024,
    });
    expect(data.config.allowedContentTypes).toContain('image/jpeg');
  });

  it('refuses a path outside the orders folder and logs the reason', async () => {
    handleUpload.mockImplementation(
      async (options: { onBeforeGenerateToken: (path: string) => Promise<unknown> }) => {
        await options.onBeforeGenerateToken('private/other.jpg');
      },
    );
    const response = await POST(uploadRequest('{}'));
    expect(response.status).toBe(400);
    expect(errorSpy).toHaveBeenCalledWith('Upload token refused:', 'Invalid upload path');
  });
});
