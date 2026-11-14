import { describe, expect, it } from 'vitest';
import { buildFileLink, signFileLink, verifyFileLink } from './signed-link';

const SECRET = 'test-secret';
const path = 'orders/ultrasound-abc123.png';
const future = Date.now() + 60_000;

describe('signed file links', () => {
  it('accepts a link that is signed and not expired', () => {
    const link = new URL(buildFileLink('https://example.com', path, future, SECRET));
    expect(
      verifyFileLink(
        { pathname: link.searchParams.get('p'), expires: link.searchParams.get('exp'), sig: link.searchParams.get('sig') },
        SECRET
      )
    ).toBe(true);
  });

  it('rejects a link with a changed path', () => {
    const sig = signFileLink(path, future, SECRET);
    expect(verifyFileLink({ pathname: 'orders/other.png', expires: String(future), sig }, SECRET)).toBe(false);
  });

  it('rejects an expired link', () => {
    const past = Date.now() - 1000;
    const sig = signFileLink(path, past, SECRET);
    expect(verifyFileLink({ pathname: path, expires: String(past), sig }, SECRET)).toBe(false);
  });

  it('rejects a link signed with another secret', () => {
    const sig = signFileLink(path, future, 'other-secret');
    expect(verifyFileLink({ pathname: path, expires: String(future), sig }, SECRET)).toBe(false);
  });

  it('rejects paths outside the orders folder', () => {
    const sig = signFileLink('../secrets.txt', future, SECRET);
    expect(verifyFileLink({ pathname: '../secrets.txt', expires: String(future), sig }, SECRET)).toBe(false);
  });

  it('rejects missing parameters', () => {
    expect(verifyFileLink({ pathname: null, expires: null, sig: null }, SECRET)).toBe(false);
  });

  it('refuses to sign without a secret', () => {
    expect(() => signFileLink(path, future, undefined)).toThrow('ORDER_LINK_SECRET');
  });
});
