import type { NextRequest } from 'next/server';

// Identifies the visitor for rate limiting. The last address in x-forwarded-for is the one the trusted
// proxy added; earlier entries are sent by the visitor and can be anything, so they are not used.
export function clientKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const entries =
    forwarded
      ?.split(',')
      .map((entry) => entry.trim())
      .filter(Boolean) ?? [];
  return entries.at(-1) || request.headers.get('x-real-ip') || 'unknown';
}
