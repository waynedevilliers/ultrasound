import type { NextRequest } from 'next/server';

// Identifies the visitor for rate limiting: the first address the proxy forwarded, else the real IP.
export function clientKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
}
