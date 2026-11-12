export type SecurityHeader = { key: string; value: string };

export type SecurityHeaderOptions = {
  // Development needs 'unsafe-eval' (Turbopack/HMR) and a websocket connection.
  development?: boolean;
};

// Next.js hydration and JSON-LD need inline scripts and styles. Accepted for now;
// nonces are the later fix (see docs/DECISIONS.md).
export function buildContentSecurityPolicy({ development = false }: SecurityHeaderOptions = {}): string {
  const scriptSrc = ["'self'", "'unsafe-inline'", ...(development ? ["'unsafe-eval'"] : [])];
  const connectSrc = ["'self'", ...(development ? ['ws:'] : [])];
  const directives: Record<string, string[]> = {
    'default-src': ["'self'"],
    'script-src': scriptSrc,
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'blob:'],
    'font-src': ["'self'"],
    'connect-src': connectSrc,
    'frame-src': ["'none'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
  };
  const parts = Object.entries(directives).map(([name, values]) => `${name} ${values.join(' ')}`);
  if (!development) parts.push('upgrade-insecure-requests');
  return parts.join('; ');
}

export function buildSecurityHeaders(options: SecurityHeaderOptions = {}): SecurityHeader[] {
  const headers: SecurityHeader[] = [
    { key: 'Content-Security-Policy', value: buildContentSecurityPolicy(options) },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    {
      key: 'Permissions-Policy',
      value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
    },
  ];
  if (!options.development) {
    headers.push({ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' });
  }
  return headers;
}
