import { afterEach, describe, expect, it, vi } from 'vitest';
import { logOrderFailure } from './order-log';

afterEach(() => {
  vi.restoreAllMocks();
});

function lastLine(spy: ReturnType<typeof vi.spyOn>): string {
  return String(spy.mock.calls.at(-1)?.[0]);
}

describe('logOrderFailure', () => {
  it('logs the request code, the step and the error type and message', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    logOrderFailure('ab12cd34', 'processing', new TypeError('connection refused'));
    expect(lastLine(spy)).toBe('[order ab12cd34] processing failed: TypeError: connection refused');
  });

  it('prints the fields of a plain error object such as a Resend error', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    logOrderFailure('ab12cd34', 'email', {
      name: 'validation_error',
      message: 'The sender is not allowed',
      statusCode: 403,
    });
    expect(lastLine(spy)).toBe(
      '[order ab12cd34] email failed: validation_error: The sender is not allowed (status 403)',
    );
  });

  it('prints a plain string as the message', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    logOrderFailure('ab12cd34', 'email', 'timeout');
    expect(lastLine(spy)).toBe('[order ab12cd34] email failed: Error: timeout');
  });

  it('never prints [object Object] for an unknown value', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    logOrderFailure('ab12cd34', 'email', { unexpected: true });
    expect(lastLine(spy)).toBe('[order ab12cd34] email failed: Error: unknown error');
  });

  it('shortens a very long message to 200 characters', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    logOrderFailure('ab12cd34', 'processing', new Error('x'.repeat(500)));
    const line = lastLine(spy);
    expect(line.length).toBeLessThanOrEqual('[order ab12cd34] processing failed: '.length + 200);
  });
});
