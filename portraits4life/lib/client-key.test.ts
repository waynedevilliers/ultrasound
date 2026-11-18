// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { clientKey } from './client-key';

function request(headers: Record<string, string>) {
  return new NextRequest('http://localhost/api/orders', { headers });
}

describe('clientKey', () => {
  it('uses the last forwarded address, the one the trusted proxy added', () => {
    expect(clientKey(request({ 'x-forwarded-for': '203.0.113.5, 10.0.0.1' }))).toBe('10.0.0.1');
  });

  it('ignores addresses the visitor put in front, so they cannot change their key', () => {
    expect(clientKey(request({ 'x-forwarded-for': '1.2.3.4, 5.6.7.8, 10.0.0.1' }))).toBe(
      '10.0.0.1',
    );
  });

  it('falls back to the real IP header', () => {
    expect(clientKey(request({ 'x-real-ip': '198.51.100.7' }))).toBe('198.51.100.7');
  });

  it('uses one shared key when no address is known', () => {
    expect(clientKey(request({}))).toBe('unknown');
  });
});
