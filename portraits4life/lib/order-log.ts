// Logs a failed step of an order on the server. It records the step, the error type and a short
// message, and never the customer's details. The same request code is shown to the customer.
const MAX_MESSAGE_LENGTH = 200;

type ErrorLike = { name?: unknown; message?: unknown; statusCode?: unknown };

// Describes an error for the log. Resend returns plain objects ({ name, message, statusCode }),
// which String() would print as "[object Object]".
function describeError(error: unknown): string {
  if (error instanceof Error) return `${error.name}: ${error.message}`;
  if (typeof error === 'string') return `Error: ${error}`;
  if (typeof error === 'object' && error !== null) {
    const { name, message, statusCode } = error as ErrorLike;
    if (typeof message === 'string') {
      const type = typeof name === 'string' ? name : 'Error';
      const status = typeof statusCode === 'number' ? ` (status ${statusCode})` : '';
      return `${type}: ${message}${status}`;
    }
  }
  return 'Error: unknown error';
}

export function logOrderFailure(requestId: string, step: string, error: unknown): void {
  const detail = describeError(error).slice(0, MAX_MESSAGE_LENGTH);
  console.error(`[order ${requestId}] ${step} failed: ${detail}`);
}
