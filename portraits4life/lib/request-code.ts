// A short code for one order attempt. The browser creates it before the photo upload, so a failed
// upload can be found in the server logs by the code the visitor sees. Shared by browser and server.
export const REQUEST_CODE_PATTERN = /^[0-9a-f]{8}$/;

export function createRequestCode(): string {
  return globalThis.crypto.randomUUID().slice(0, 8);
}

export function isRequestCode(value: unknown): value is string {
  return typeof value === 'string' && REQUEST_CODE_PATTERN.test(value);
}
