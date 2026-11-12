import { describe, expect, it } from 'vitest';
import { buildContentSecurityPolicy, buildSecurityHeaders } from './security-headers';

const find = (headers: { key: string; value: string }[], key: string) =>
  headers.find((h) => h.key === key)?.value;

describe('security headers', () => {
  it('sets the production headers from the plan', () => {
    const headers = buildSecurityHeaders();
    expect(find(headers, 'X-Content-Type-Options')).toBe('nosniff');
    expect(find(headers, 'X-Frame-Options')).toBe('DENY');
    expect(find(headers, 'Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    expect(find(headers, 'Strict-Transport-Security')).toBe('max-age=63072000; includeSubDomains; preload');
    expect(find(headers, 'Permissions-Policy')).toContain('camera=()');
    expect(find(headers, 'Permissions-Policy')).toContain('interest-cohort=()');
  });

  it('omits HSTS and upgrade-insecure-requests in development', () => {
    const headers = buildSecurityHeaders({ development: true });
    expect(find(headers, 'Strict-Transport-Security')).toBeUndefined();
    expect(find(headers, 'Content-Security-Policy')).not.toContain('upgrade-insecure-requests');
  });

  it('CSP keeps frames, objects and foreign forms closed', () => {
    const csp = buildContentSecurityPolicy();
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("form-action 'self'");
    expect(csp).toContain("frame-src 'none'");
    expect(csp).toContain('upgrade-insecure-requests');
  });

  it('allows unsafe-eval only in development', () => {
    expect(buildContentSecurityPolicy({ development: false })).not.toContain('unsafe-eval');
    expect(buildContentSecurityPolicy({ development: true })).toContain("'unsafe-eval'");
  });

  it('loads no external hosts', () => {
    const csp = buildContentSecurityPolicy();
    expect(csp).not.toMatch(/https?:\/\//);
  });
});
