import { createHmac, timingSafeEqual } from 'node:crypto';

// Signed links let the business open a stored order photo from an email.
// The link carries the file path, an expiry time and an HMAC signature.
// Files stay private; only a valid, unexpired link gets through.

export const ORDER_PATH_PATTERN = /^orders\/[A-Za-z0-9._-]+$/;

function requireSecret(secret: string | undefined): string {
  if (!secret) throw new Error('ORDER_LINK_SECRET is not set');
  return secret;
}

export function signFileLink(pathname: string, expires: number, secret: string | undefined): string {
  return createHmac('sha256', requireSecret(secret)).update(`${pathname}\n${expires}`).digest('hex');
}

export function buildFileLink(baseUrl: string, pathname: string, expires: number, secret: string | undefined): string {
  const sig = signFileLink(pathname, expires, secret);
  const params = new URLSearchParams({ p: pathname, exp: String(expires), sig });
  return `${baseUrl.replace(/\/$/, '')}/api/orders/files?${params.toString()}`;
}

export function verifyFileLink(
  input: { pathname: string | null; expires: string | null; sig: string | null },
  secret: string | undefined,
  now: number = Date.now()
): boolean {
  if (!input.pathname || !input.expires || !input.sig) return false;
  if (!ORDER_PATH_PATTERN.test(input.pathname)) return false;
  const expires = Number(input.expires);
  if (!Number.isFinite(expires) || expires < now) return false;
  const expected = Buffer.from(signFileLink(input.pathname, expires, secret));
  const given = Buffer.from(input.sig);
  return expected.length === given.length && timingSafeEqual(expected, given);
}
