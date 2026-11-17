// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { clientKey } from './client-key';

function request(headers: Record<string, string>) {
  return new NextRequest('http://localhost/api/orders', { headers });
}

describe('clientKey', () => {
  it('uses the first forwarded address', () => {
    expect(clientKey(request({ 'x-forwarded-for': '203.0.113.5, 10.0.0.1' }))).toBe('203.0.113.5');
  });

  it('falls back to the real IP header', () => {
    expect(clientKey(request({ 'x-real-ip': '198.51.100.7' }))).toBe('198.51.100.7');
  });

  it('uses one shared key when no address is known', () => {
    expect(clientKey(request({}))).toBe('unknown');
  });
});
