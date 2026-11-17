// Logs a failed step of an order on the server. It records the step, the error type and a short
// message, and never the customer's details. The same request code is shown to the customer.
export function logOrderFailure(requestId: string, step: string, error: unknown): void {
  const name = error instanceof Error ? error.name : 'Error';
  const message = (error instanceof Error ? error.message : String(error)).slice(0, 200);
  console.error(`[order ${requestId}] ${step} failed: ${name}: ${message}`);
}
