// Fixed-window rate limiter kept in memory. It is per server instance, so it
// is a basic guard against bursts, not a hard global limit.
const WINDOW_MS = 15 * 60 * 1000;
const DEFAULT_MAX_REQUESTS = 5;

const hits = new Map<string, number[]>();

// Returns true when the key has used up its requests in the window. `max` lets a route allow more.
export function isRateLimited(
  key: string,
  now: number = Date.now(),
  max: number = DEFAULT_MAX_REQUESTS,
): boolean {
  const recent = (hits.get(key) ?? []).filter((time) => now - time < WINDOW_MS);
  if (recent.length >= max) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  return false;
}

export function resetRateLimit(): void {
  hits.clear();
}
